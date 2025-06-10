"""
Model management schemas.
"""

from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from uuid import UUID

from app.models.model import ModelStatus, PermissionType, ModelType, ModelProvider


class ModelCredentials(BaseModel):
    """Base model credentials schema."""
    pass


class OpenAICredentials(ModelCredentials):
    """OpenAI model credentials."""
    api_key: str
    base_url: Optional[str] = "https://api.openai.com/v1"
    organization: Optional[str] = None


class AzureCredentials(ModelCredentials):
    """Azure OpenAI model credentials."""
    api_key: str
    azure_endpoint: str
    api_version: str = "2024-02-01"
    deployment_name: str


class OllamaCredentials(ModelCredentials):
    """Ollama model credentials."""
    base_url: str = "http://localhost:11434"
    timeout: Optional[int] = 300


class AnthropicCredentials(ModelCredentials):
    """Anthropic model credentials."""
    api_key: str
    base_url: Optional[str] = "https://api.anthropic.com"


class ModelParamSchema(BaseModel):
    """Model parameter configuration schema."""
    label: str
    field: str
    default_value: Optional[str] = None
    input_type: str  # text, number, select, slider, checkbox, etc.
    attrs: Dict[str, Any] = Field(default_factory=dict)
    required: bool = False


class ModelFormField(BaseModel):
    """Dynamic form field for model creation."""
    field: str
    label: str
    type: str  # text, password, number, select, etc.
    required: bool = False
    placeholder: Optional[str] = None
    options: Optional[List[Dict[str, Any]]] = None
    attrs: Dict[str, Any] = Field(default_factory=dict)


class ModelCreate(BaseModel):
    """Schema for creating a new model."""
    name: str
    model_type: ModelType
    model_name: str
    provider: ModelProvider
    credential: Dict[str, Any]  # Provider-specific credentials
    permission_type: PermissionType = PermissionType.PRIVATE
    model_params_form: Optional[List[ModelParamSchema]] = Field(default_factory=list)


class ModelUpdate(BaseModel):
    """Schema for updating a model."""
    name: Optional[str] = None
    status: Optional[ModelStatus] = None
    credential: Optional[Dict[str, Any]] = None
    permission_type: Optional[PermissionType] = None
    model_params_form: Optional[List[ModelParamSchema]] = None


class ModelResponse(BaseModel):
    """Schema for model response."""
    id: UUID
    name: str
    status: ModelStatus
    model_type: ModelType
    model_name: str
    provider: ModelProvider
    permission_type: PermissionType
    meta: Dict[str, Any]
    model_params_form: List[Dict[str, Any]]
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class ModelListResponse(BaseModel):
    """Schema for model list response."""
    models: List[ModelResponse]
    total: int


class ProviderInfo(BaseModel):
    """Provider information schema."""
    provider: str
    name: str
    description: str
    icon: Optional[str] = None
    supported_model_types: List[str]


class ModelTypeInfo(BaseModel):
    """Model type information schema."""
    value: str
    label: str


class ModelInfo(BaseModel):
    """Individual model information."""
    name: str
    label: str
    description: Optional[str] = None


class ModelListInfo(BaseModel):
    """Model list for a provider/type."""
    models: List[ModelInfo]


class ModelFormResponse(BaseModel):
    """Model creation form schema."""
    fields: List[ModelFormField]


class ModelParamsResponse(BaseModel):
    """Model parameters response."""
    params: List[ModelParamSchema]


class ModelDownloadRequest(BaseModel):
    """Model download request (for Ollama, etc.)."""
    model_name: str
    provider: ModelProvider = ModelProvider.OLLAMA


class ModelTestRequest(BaseModel):
    """Model test request."""
    prompt: str = "Hello, how are you?"
    max_tokens: int = 100
    temperature: float = 0.7 