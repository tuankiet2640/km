"""
Chat endpoints for AI conversations based on MaxKB AI Chat System.
"""

from typing import Any, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Request, File, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
import json
import asyncio
import time

from app.core.database import get_db_session
from app.models.user import User
from app.schemas.chat import (
    ChatCreate, ChatResponse, ChatList, ChatMessageCreate, 
    ChatMessageResponse, StreamingChatRequest, OpenAIChatRequest,
    VoiceMessageRequest, FileMessageRequest
)
from app.services.auth import AuthService
from app.services.chat import ChatService
from app.services.rag import RAGService

router = APIRouter()


@router.get("/", response_model=ChatList)
async def list_chats(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(AuthService.get_current_active_user),
    application_id: UUID = None,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    List user's chat sessions.
    """
    chat_service = ChatService(db)
    
    chats, total = await chat_service.list_user_chats(
        user_id=current_user.id,
        application_id=application_id,
        skip=skip,
        limit=limit,
    )
    
    return ChatList(
        chats=chats,
        total=total,
        page=skip // limit + 1,
        size=limit,
    )


@router.post("/", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
async def create_chat(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(AuthService.get_current_active_user),
    chat_data: ChatCreate,
) -> Any:
    """
    Create a new chat session.
    """
    chat_service = ChatService(db)
    
    chat = await chat_service.create_chat(
        user_id=current_user.id,
        chat_data=chat_data
    )
    
    return chat


@router.get("/{chat_id}", response_model=ChatResponse)
async def get_chat(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(AuthService.get_current_active_user),
    chat_id: UUID,
) -> Any:
    """
    Get chat session details.
    """
    chat_service = ChatService(db)
    
    chat = await chat_service.get_chat_by_id(chat_id)
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    # Check ownership
    if chat.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return chat


@router.post("/{chat_id}/messages", response_model=ChatMessageResponse)
async def send_message(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(AuthService.get_current_active_user),
    chat_id: UUID,
    message_data: ChatMessageCreate,
) -> Any:
    """
    Send a message to the chat (non-streaming).
    """
    chat_service = ChatService(db)
    rag_service = RAGService(db)
    
    # Verify chat ownership
    chat = await chat_service.get_chat_by_id(chat_id)
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    if chat.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Process the message
    response = await chat_service.process_message(
        chat_id=chat_id,
        message_data=message_data,
        user_id=current_user.id
    )
    
    return response


@router.post("/{chat_id}/stream")
async def stream_chat(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(AuthService.get_current_active_user),
    chat_id: UUID,
    request_data: StreamingChatRequest,
) -> StreamingResponse:
    """
    Send a message with streaming response (real-time).
    """
    chat_service = ChatService(db)
    
    # Verify chat ownership
    chat = await chat_service.get_chat_by_id(chat_id)
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    if chat.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    async def generate_stream():
        """Generate streaming response chunks."""
        try:
            # Send initial chunk with user message
            yield f"data: {json.dumps({'type': 'user_message', 'content': request_data.content})}\n\n"
            
            # Process message and stream AI response
            async for chunk in chat_service.stream_response(
                chat_id=chat_id,
                message_content=request_data.content,
                user_id=current_user.id
            ):
                yield f"data: {json.dumps(chunk)}\n\n"
                await asyncio.sleep(0.01)  # Small delay for smooth streaming
            
            # Send completion marker
            yield f"data: {json.dumps({'type': 'completed'})}\n\n"
            
        except Exception as e:
            error_chunk = {
                'type': 'error',
                'error': str(e),
                'timestamp': time.time()
            }
            yield f"data: {json.dumps(error_chunk)}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/plain; charset=utf-8"
        }
    )


@router.post("/{chat_id}/voice")
async def send_voice_message(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(AuthService.get_current_active_user),
    chat_id: UUID,
    audio_file: UploadFile = File(...),
    auto_send: bool = True,
) -> Any:
    """
    Send a voice message (speech-to-text + chat).
    """
    chat_service = ChatService(db)
    
    # Verify chat ownership
    chat = await chat_service.get_chat_by_id(chat_id)
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    if chat.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Validate audio file
    if not audio_file.content_type.startswith('audio/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an audio file"
        )
    
    # Process voice message
    result = await chat_service.process_voice_message(
        chat_id=chat_id,
        audio_file=audio_file,
        user_id=current_user.id,
        auto_send=auto_send
    )
    
    return result


@router.post("/{chat_id}/files")
async def send_file_message(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(AuthService.get_current_active_user),
    chat_id: UUID,
    files: List[UploadFile] = File(...),
    message: Optional[str] = None,
) -> Any:
    """
    Send files with optional message.
    """
    chat_service = ChatService(db)
    
    # Verify chat ownership
    chat = await chat_service.get_chat_by_id(chat_id)
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    if chat.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Validate files
    max_files = 10
    if len(files) > max_files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum {max_files} files allowed"
        )
    
    # Process file message
    result = await chat_service.process_file_message(
        chat_id=chat_id,
        files=files,
        message=message,
        user_id=current_user.id
    )
    
    return result


@router.get("/{chat_id}/messages")
async def get_chat_messages(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(AuthService.get_current_active_user),
    chat_id: UUID,
    skip: int = 0,
    limit: int = 50,
) -> Any:
    """
    Get chat message history.
    """
    chat_service = ChatService(db)
    
    # Verify chat ownership
    chat = await chat_service.get_chat_by_id(chat_id)
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    if chat.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    messages = await chat_service.get_chat_messages(
        chat_id=chat_id,
        skip=skip,
        limit=limit
    )
    
    return {"messages": messages, "chat_id": str(chat_id)}


@router.delete("/{chat_id}")
async def delete_chat(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(AuthService.get_current_active_user),
    chat_id: UUID,
) -> Any:
    """
    Delete a chat session.
    """
    chat_service = ChatService(db)
    
    # Verify chat ownership
    chat = await chat_service.get_chat_by_id(chat_id)
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    if chat.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    await chat_service.delete_chat(chat_id)
    return {"message": "Chat deleted successfully"}


@router.post("/{chat_id}/feedback")
async def submit_message_feedback(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(AuthService.get_current_active_user),
    chat_id: UUID,
    message_id: UUID,
    rating: int,
    feedback: Optional[str] = None,
) -> Any:
    """
    Submit feedback for a chat message.
    """
    chat_service = ChatService(db)
    
    # Verify chat ownership
    chat = await chat_service.get_chat_by_id(chat_id)
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    if chat.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Validate rating
    if rating < 1 or rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5"
        )
    
    await chat_service.submit_feedback(
        message_id=message_id,
        rating=rating,
        feedback=feedback
    )
    
    return {"message": "Feedback submitted successfully"}


# OpenAI-compatible chat endpoint for external integrations
@router.post("/openai/chat/completions")
async def openai_chat_completions(
    *,
    db: AsyncSession = Depends(get_db_session),
    request: OpenAIChatRequest,
    api_key: str = Depends(ChatService.verify_api_key),
) -> Any:
    """
    OpenAI-compatible chat completions endpoint.
    """
    chat_service = ChatService(db)
    
    # Process OpenAI-format request
    response = await chat_service.process_openai_request(request, api_key)
    
    return response 