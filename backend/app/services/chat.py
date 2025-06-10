"""
Chat service for AI conversation management and processing.
"""

from typing import Optional, List, Tuple, Dict, Any, AsyncGenerator
from uuid import UUID
import time
import json
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc, func
from sqlalchemy.orm import selectinload
from fastapi import UploadFile, HTTPException, status

from app.models.chat import Chat, ChatMessage, MessageRole, MessageType, ChatStatus
from app.models.user import User
from app.models.application import Application
from app.schemas.chat import (
    ChatCreate, ChatMessageCreate, StreamingChatRequest, 
    OpenAIChatRequest, OpenAIChatResponse
)
from app.core.config import settings

logger = logging.getLogger(__name__)


class ChatService:
    """Chat service for managing conversations and AI interactions."""
    
    def __init__(self, db_session: AsyncSession):
        self.db = db_session
    
    async def get_chat_by_id(self, chat_id: UUID) -> Optional[Chat]:
        """Get chat by ID with messages."""
        result = await self.db.execute(
            select(Chat)
            .options(selectinload(Chat.messages))
            .where(Chat.id == chat_id)
        )
        return result.scalar_one_or_none()
    
    async def list_user_chats(
        self,
        user_id: UUID,
        application_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[Chat], int]:
        """List chats for a user with pagination."""
        
        # Build base query
        query = select(Chat).where(Chat.user_id == user_id)
        count_query = select(func.count(Chat.id)).where(Chat.user_id == user_id)
        
        # Filter by application if specified
        if application_id:
            query = query.where(Chat.application_id == application_id)
            count_query = count_query.where(Chat.application_id == application_id)
        
        # Apply pagination and ordering
        query = query.offset(skip).limit(limit).order_by(desc(Chat.updated_at))
        
        # Execute queries
        result = await self.db.execute(query)
        count_result = await self.db.execute(count_query)
        
        chats = result.scalars().all()
        total = count_result.scalar()
        
        return list(chats), total
    
    async def create_chat(self, user_id: UUID, chat_data: ChatCreate) -> Chat:
        """Create a new chat session."""
        
        # Verify application exists
        app_result = await self.db.execute(
            select(Application).where(Application.id == chat_data.application_id)
        )
        application = app_result.scalar_one_or_none()
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        chat = Chat(
            title=chat_data.title or f"Chat with {application.name}",
            application_id=chat_data.application_id,
            user_id=user_id,
            session_id=chat_data.session_id,
            chat_config=chat_data.chat_config or {},
            context_window=chat_data.context_window,
            status=ChatStatus.ACTIVE,
        )
        
        self.db.add(chat)
        await self.db.commit()
        await self.db.refresh(chat)
        
        return chat
    
    async def process_message(
        self,
        chat_id: UUID,
        message_data: ChatMessageCreate,
        user_id: UUID
    ) -> ChatMessage:
        """Process a single message (non-streaming)."""
        
        # Create user message
        user_message = await self._create_message(
            chat_id=chat_id,
            content=message_data.content,
            role=MessageRole.USER,
            message_type=message_data.message_type,
            metadata=message_data.metadata or {},
            file_attachments=message_data.file_attachments or [],
            voice_data=message_data.voice_data or {}
        )
        
        # Process AI response
        ai_response = await self._generate_ai_response(chat_id, user_message)
        
        # Create AI message
        ai_message = await self._create_message(
            chat_id=chat_id,
            content=ai_response["content"],
            role=MessageRole.ASSISTANT,
            message_type=MessageType.TEXT,
            metadata=ai_response.get("metadata", {}),
            context=ai_response.get("context", []),
            sources=ai_response.get("sources", []),
            token_count=ai_response.get("token_count"),
            model_name=ai_response.get("model_name"),
            processing_time=ai_response.get("processing_time")
        )
        
        # Update chat statistics
        await self._update_chat_stats(chat_id, ai_response.get("token_count", 0))
        
        return ai_message
    
    async def stream_response(
        self,
        chat_id: UUID,
        message_content: str,
        user_id: UUID
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Generate streaming AI response."""
        
        start_time = time.time()
        
        # Create user message
        user_message = await self._create_message(
            chat_id=chat_id,
            content=message_content,
            role=MessageRole.USER,
            message_type=MessageType.TEXT
        )
        
        # Initialize AI response tracking
        ai_content = ""
        token_count = 0
        sequence = 0
        
        try:
            # Get chat context for RAG
            context = await self._get_chat_context(chat_id)
            
            # Stream AI response (mock implementation)
            async for chunk in self._stream_ai_response(message_content, context):
                sequence += 1
                ai_content += chunk.get("delta", "")
                token_count += chunk.get("tokens", 1)
                
                yield {
                    "type": "ai_chunk",
                    "delta": chunk.get("delta", ""),
                    "content": ai_content,
                    "metadata": {
                        "tokens": token_count,
                        "model": chunk.get("model", settings.DEFAULT_LLM_MODEL),
                        "sequence": sequence
                    },
                    "timestamp": time.time(),
                    "sequence": sequence
                }
            
            # Create AI message record
            processing_time = time.time() - start_time
            ai_message = await self._create_message(
                chat_id=chat_id,
                content=ai_content,
                role=MessageRole.ASSISTANT,
                message_type=MessageType.TEXT,
                token_count=token_count,
                model_name=settings.DEFAULT_LLM_MODEL,
                processing_time=processing_time
            )
            
            # Update chat statistics
            await self._update_chat_stats(chat_id, token_count)
            
            # Send final completion chunk
            yield {
                "type": "completed",
                "message_id": str(ai_message.id),
                "total_tokens": token_count,
                "processing_time": processing_time,
                "timestamp": time.time(),
                "sequence": sequence + 1
            }
            
        except Exception as e:
            logger.error(f"Error in streaming response: {e}")
            yield {
                "type": "error",
                "error": str(e),
                "timestamp": time.time(),
                "sequence": sequence + 1
            }
    
    async def process_voice_message(
        self,
        chat_id: UUID,
        audio_file: UploadFile,
        user_id: UUID,
        auto_send: bool = True
    ) -> Dict[str, Any]:
        """Process voice message with speech-to-text."""
        
        # Save audio file temporarily
        audio_data = await audio_file.read()
        
        # Mock speech-to-text conversion
        # In production, integrate with OpenAI Whisper, Google Speech, etc.
        transcribed_text = f"[Transcribed from audio]: This is a mock transcription of the voice message."
        
        # Create voice message record
        voice_message = await self._create_message(
            chat_id=chat_id,
            content=transcribed_text,
            role=MessageRole.USER,
            message_type=MessageType.VOICE,
            voice_data={
                "filename": audio_file.filename,
                "content_type": audio_file.content_type,
                "size": len(audio_data),
                "transcription": transcribed_text
            }
        )
        
        result = {
            "message_id": str(voice_message.id),
            "transcription": transcribed_text,
            "auto_send": auto_send
        }
        
        # Auto-send as chat message if enabled
        if auto_send:
            ai_response = await self._generate_ai_response(chat_id, voice_message)
            ai_message = await self._create_message(
                chat_id=chat_id,
                content=ai_response["content"],
                role=MessageRole.ASSISTANT,
                message_type=MessageType.TEXT,
                metadata=ai_response.get("metadata", {}),
                token_count=ai_response.get("token_count"),
                model_name=ai_response.get("model_name")
            )
            result["ai_response"] = {
                "message_id": str(ai_message.id),
                "content": ai_message.content
            }
        
        return result
    
    async def process_file_message(
        self,
        chat_id: UUID,
        files: List[UploadFile],
        message: Optional[str],
        user_id: UUID
    ) -> Dict[str, Any]:
        """Process files with optional message."""
        
        file_attachments = []
        
        for file in files:
            file_data = await file.read()
            
            # Process file based on type
            file_info = {
                "filename": file.filename,
                "content_type": file.content_type,
                "size": len(file_data),
                "processed_text": None
            }
            
            # Mock file processing - extract text if possible
            if file.content_type == "text/plain":
                file_info["processed_text"] = file_data.decode('utf-8')
            elif file.content_type == "application/pdf":
                file_info["processed_text"] = "[PDF content would be extracted here]"
            
            file_attachments.append(file_info)
        
        # Create file message
        content = message or f"Uploaded {len(files)} file(s)"
        file_message = await self._create_message(
            chat_id=chat_id,
            content=content,
            role=MessageRole.USER,
            message_type=MessageType.FILE,
            file_attachments=file_attachments
        )
        
        return {
            "message_id": str(file_message.id),
            "files_processed": len(files),
            "content": content
        }
    
    async def get_chat_messages(
        self,
        chat_id: UUID,
        skip: int = 0,
        limit: int = 50
    ) -> List[ChatMessage]:
        """Get chat message history."""
        
        result = await self.db.execute(
            select(ChatMessage)
            .where(ChatMessage.chat_id == chat_id)
            .order_by(ChatMessage.sequence_number)
            .offset(skip)
            .limit(limit)
        )
        
        return list(result.scalars().all())
    
    async def delete_chat(self, chat_id: UUID) -> bool:
        """Delete a chat session."""
        
        chat = await self.get_chat_by_id(chat_id)
        if not chat:
            return False
        
        await self.db.delete(chat)
        await self.db.commit()
        
        return True
    
    async def submit_feedback(
        self,
        message_id: UUID,
        rating: int,
        feedback: Optional[str] = None
    ) -> None:
        """Submit feedback for a chat message."""
        
        result = await self.db.execute(
            select(ChatMessage).where(ChatMessage.id == message_id)
        )
        message = result.scalar_one_or_none()
        
        if message:
            message.rating = rating
            message.feedback = feedback
            await self.db.commit()
    
    @staticmethod
    async def verify_api_key(api_key: str) -> str:
        """Verify API key for OpenAI-compatible endpoint."""
        # In production, implement proper API key validation
        if not api_key or not api_key.startswith("km-"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid API key"
            )
        return api_key
    
    async def process_openai_request(
        self,
        request: OpenAIChatRequest,
        api_key: str
    ) -> OpenAIChatResponse:
        """Process OpenAI-compatible chat request."""
        
        # Mock OpenAI response
        response_content = "This is a mock response from the KM OpenAI-compatible endpoint."
        
        return OpenAIChatResponse(
            id=f"chatcmpl-{int(time.time())}",
            created=int(time.time()),
            model=request.model,
            choices=[
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": response_content
                    },
                    "finish_reason": "stop"
                }
            ],
            usage={
                "prompt_tokens": len(request.messages[-1].content.split()),
                "completion_tokens": len(response_content.split()),
                "total_tokens": len(request.messages[-1].content.split()) + len(response_content.split())
            }
        )
    
    # Private helper methods
    
    async def _create_message(
        self,
        chat_id: UUID,
        content: str,
        role: MessageRole,
        message_type: MessageType = MessageType.TEXT,
        **kwargs
    ) -> ChatMessage:
        """Create a chat message record."""
        
        # Get next sequence number
        seq_result = await self.db.execute(
            select(func.coalesce(func.max(ChatMessage.sequence_number), 0) + 1)
            .where(ChatMessage.chat_id == chat_id)
        )
        sequence_number = seq_result.scalar()
        
        message = ChatMessage(
            chat_id=chat_id,
            content=content,
            role=role,
            message_type=message_type,
            sequence_number=sequence_number,
            created_timestamp=time.time(),
            **kwargs
        )
        
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message)
        
        return message
    
    async def _generate_ai_response(
        self,
        chat_id: UUID,
        user_message: ChatMessage
    ) -> Dict[str, Any]:
        """Generate AI response for a user message."""
        
        start_time = time.time()
        
        # Get chat context
        context = await self._get_chat_context(chat_id)
        
        # Mock AI response generation
        # In production, integrate with LLM providers
        response_content = f"This is a mock AI response to: '{user_message.content[:50]}...'"
        
        processing_time = time.time() - start_time
        
        return {
            "content": response_content,
            "token_count": len(response_content.split()),
            "model_name": settings.DEFAULT_LLM_MODEL,
            "processing_time": processing_time,
            "metadata": {
                "context_used": len(context),
                "user_message_type": user_message.message_type
            },
            "context": context[:3],  # Include some context for reference
            "sources": []  # Would include retrieved sources from RAG
        }
    
    async def _stream_ai_response(
        self,
        message_content: str,
        context: List[Dict[str, Any]]
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Stream AI response chunks."""
        
        # Mock streaming response
        response_text = f"This is a streaming response to '{message_content[:30]}...'. The response is generated word by word to demonstrate streaming capabilities."
        words = response_text.split()
        
        for i, word in enumerate(words):
            chunk = {
                "delta": word + " ",
                "tokens": 1,
                "model": settings.DEFAULT_LLM_MODEL,
                "index": i
            }
            yield chunk
            # Simulate streaming delay
            import asyncio
            await asyncio.sleep(0.05)
    
    async def _get_chat_context(self, chat_id: UUID) -> List[Dict[str, Any]]:
        """Get relevant context for the chat."""
        
        # Get recent messages for context
        result = await self.db.execute(
            select(ChatMessage)
            .where(ChatMessage.chat_id == chat_id)
            .order_by(desc(ChatMessage.sequence_number))
            .limit(10)
        )
        messages = result.scalars().all()
        
        context = []
        for msg in reversed(messages):
            context.append({
                "role": msg.role,
                "content": msg.content,
                "timestamp": msg.created_at.isoformat() if msg.created_at else None
            })
        
        return context
    
    async def _update_chat_stats(self, chat_id: UUID, tokens: int) -> None:
        """Update chat usage statistics."""
        
        result = await self.db.execute(
            select(Chat).where(Chat.id == chat_id)
        )
        chat = result.scalar_one_or_none()
        
        if chat:
            chat.message_count += 1
            chat.total_tokens += tokens
            chat.total_cost += tokens * 0.00002  # Mock cost calculation
            chat.last_message_at = func.now()
            
            if not chat.first_message_at:
                chat.first_message_at = func.now()
            
            await self.db.commit() 