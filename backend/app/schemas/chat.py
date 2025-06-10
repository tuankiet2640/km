"""
Chat-related Pydantic schemas based on MaxKB AI Chat System.
"""

from datetime import datetime
from typing import Optional, List, Any, Dict, Union
from uuid import UUID
from pydantic import BaseModel, Field

from app.models.chat import MessageRole, MessageType, ChatStatus


class ChatBase(BaseModel):
    """Base chat schema."""
    title: Optional[str] = Field(None, max_length=200)
    application_id: UUID
    chat_config: Optional[Dict[str, Any]] = Field(default_factory=dict)
    context_window: int = Field(4000, ge=1000, le=32000)


class ChatCreate(ChatBase):
    """Chat creation schema."""
    session_id: Optional[str] = Field(None, description="Session ID for anonymous users")
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Product Support Chat",
                "application_id": "123e4567-e89b-12d3-a456-426614174000",
                "chat_config": {"temperature": 0.7, "max_tokens": 1000},
                "context_window": 4000
            }
        }


class ChatUpdate(BaseModel):
    """Chat update schema."""
    title: Optional[str] = Field(None, max_length=200)
    status: Optional[ChatStatus] = None
    chat_config: Optional[Dict[str, Any]] = None


class ChatResponse(ChatBase):
    """Chat response schema."""
    id: UUID
    status: ChatStatus
    user_id: Optional[UUID] = None
    session_id: Optional[str] = None
    client_ip: Optional[str] = None
    message_count: int
    total_tokens: int
    total_cost: float
    first_message_at: Optional[datetime] = None
    last_message_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ChatList(BaseModel):
    """Chat list response schema."""
    chats: List[ChatResponse]
    total: int
    page: int
    size: int


class ChatMessageBase(BaseModel):
    """Base chat message schema."""
    content: str = Field(..., min_length=1, max_length=10000)
    role: MessageRole = MessageRole.USER
    message_type: MessageType = MessageType.TEXT


class ChatMessageCreate(ChatMessageBase):
    """Chat message creation schema."""
    context: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    file_attachments: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    voice_data: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    class Config:
        json_schema_extra = {
            "example": {
                "content": "How do I reset my password?",
                "role": "user",
                "message_type": "text",
                "metadata": {"source": "web_chat"}
            }
        }


class ChatMessageUpdate(BaseModel):
    """Chat message update schema."""
    rating: Optional[int] = Field(None, ge=1, le=5)
    feedback: Optional[str] = Field(None, max_length=1000)


class ChatMessageResponse(ChatMessageBase):
    """Chat message response schema."""
    id: UUID
    chat_id: UUID
    sequence_number: int
    token_count: Optional[int] = None
    model_name: Optional[str] = None
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    processing_time: Optional[float] = None
    created_timestamp: Optional[float] = None
    context: List[Dict[str, Any]] = Field(default_factory=list)
    sources: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    file_attachments: List[Dict[str, Any]] = Field(default_factory=list)
    voice_data: Dict[str, Any] = Field(default_factory=dict)
    workflow_execution_id: Optional[str] = None
    workflow_result: Dict[str, Any] = Field(default_factory=dict)
    rating: Optional[int] = None
    feedback: Optional[str] = None
    is_error: bool = False
    error_message: Optional[str] = None
    retry_count: int = 0
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class StreamingChatRequest(BaseModel):
    """Streaming chat request schema."""
    content: str = Field(..., min_length=1, max_length=10000)
    message_type: MessageType = MessageType.TEXT
    context: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    stream_config: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    class Config:
        json_schema_extra = {
            "example": {
                "content": "Explain quantum computing",
                "message_type": "text",
                "stream_config": {"chunk_size": 50, "delay": 0.01}
            }
        }


class VoiceMessageRequest(BaseModel):
    """Voice message request schema."""
    auto_send: bool = Field(True, description="Automatically send after transcription")
    language: Optional[str] = Field("auto", description="Speech recognition language")
    context: Optional[List[Dict[str, Any]]] = Field(default_factory=list)


class FileMessageRequest(BaseModel):
    """File message request schema."""
    message: Optional[str] = Field(None, max_length=1000)
    auto_process: bool = Field(True, description="Automatically process supported file types")
    extract_text: bool = Field(True, description="Extract text from documents")


class OpenAIChatMessage(BaseModel):
    """OpenAI-compatible chat message."""
    role: str = Field(..., regex="^(system|user|assistant)$")
    content: str


class OpenAIChatRequest(BaseModel):
    """OpenAI-compatible chat request."""
    model: str = Field("gpt-3.5-turbo", description="Model identifier")
    messages: List[OpenAIChatMessage]
    temperature: Optional[float] = Field(0.7, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(None, ge=1, le=4000)
    top_p: Optional[float] = Field(1.0, ge=0.0, le=1.0)
    frequency_penalty: Optional[float] = Field(0.0, ge=-2.0, le=2.0)
    presence_penalty: Optional[float] = Field(0.0, ge=-2.0, le=2.0)
    stream: bool = Field(False)
    stop: Optional[Union[str, List[str]]] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "user", "content": "Hello, how are you?"}
                ],
                "temperature": 0.7,
                "max_tokens": 150
            }
        }


class OpenAIChatChoice(BaseModel):
    """OpenAI-compatible chat choice."""
    index: int
    message: OpenAIChatMessage
    finish_reason: str


class OpenAIChatUsage(BaseModel):
    """OpenAI-compatible usage statistics."""
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


class OpenAIChatResponse(BaseModel):
    """OpenAI-compatible chat response."""
    id: str
    object: str = "chat.completion"
    created: int
    model: str
    choices: List[OpenAIChatChoice]
    usage: OpenAIChatUsage
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "chatcmpl-123",
                "object": "chat.completion",
                "created": 1677652288,
                "model": "gpt-3.5-turbo",
                "choices": [
                    {
                        "index": 0,
                        "message": {
                            "role": "assistant",
                            "content": "Hello! I'm doing well, thank you for asking."
                        },
                        "finish_reason": "stop"
                    }
                ],
                "usage": {
                    "prompt_tokens": 9,
                    "completion_tokens": 12,
                    "total_tokens": 21
                }
            }
        }


class StreamChunk(BaseModel):
    """Streaming response chunk schema."""
    type: str = Field(..., description="Chunk type: user_message, ai_chunk, completed, error")
    content: Optional[str] = Field(None, description="Chunk content")
    delta: Optional[str] = Field(None, description="Incremental content")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    timestamp: float
    sequence: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "type": "ai_chunk",
                "delta": "Hello! How can I help you today?",
                "metadata": {"tokens": 8, "model": "gpt-3.5-turbo"},
                "timestamp": 1677652288.123,
                "sequence": 1
            }
        }


class ChatStatistics(BaseModel):
    """Chat statistics schema."""
    total_chats: int
    active_chats: int
    total_messages: int
    avg_messages_per_chat: float
    total_tokens: int
    total_cost: float
    avg_response_time: float
    popular_topics: List[Dict[str, Any]] = Field(default_factory=list)
    user_satisfaction: Optional[float] = None
    
    # Time-based statistics
    chats_today: int
    chats_this_week: int
    chats_this_month: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_chats": 1547,
                "active_chats": 23,
                "total_messages": 8934,
                "avg_messages_per_chat": 5.8,
                "total_tokens": 245678,
                "total_cost": 12.34,
                "avg_response_time": 1.23,
                "user_satisfaction": 4.2,
                "chats_today": 45,
                "chats_this_week": 267,
                "chats_this_month": 1102
            }
        } 