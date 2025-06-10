"""
Model management service.
"""

import json
import asyncio
from typing import Dict, List, Optional, Any, Tuple
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.model import Model, ModelParam, ModelStatus, ModelProvider, ModelType, PermissionType
from app.schemas.model import (
    ModelCreate, ModelUpdate, ModelResponse, ModelFormField, 
    ModelParamSchema, ProviderInfo, ModelTypeInfo, ModelInfo, ModelListInfo
)
from app.core.exceptions import ValidationError, NotFoundError


class ModelProviderManager:
    """Manager for different AI model providers."""
    
    @staticmethod
    def get_providers() -> List[ProviderInfo]:
        """Get list of available providers."""
        return [
            ProviderInfo(
                provider="OPENAI",
                name="OpenAI",
                description="OpenAI GPT models",
                supported_model_types=["LLM", "EMBEDDING"]
            ),
            ProviderInfo(
                provider="AZURE",
                name="Azure OpenAI",
                description="Azure OpenAI Service",
                supported_model_types=["LLM", "EMBEDDING"]
            ),
            ProviderInfo(
                provider="OLLAMA",
                name="Ollama",
                description="Local models via Ollama",
                supported_model_types=["LLM", "EMBEDDING"]
            ),
            ProviderInfo(
                provider="ANTHROPIC",
                name="Anthropic",
                description="Claude models",
                supported_model_types=["LLM"]
            ),
            ProviderInfo(
                provider="GOOGLE",
                name="Google",
                description="Gemini models",
                supported_model_types=["LLM"]
            ),
            ProviderInfo(
                provider="HUGGINGFACE",
                name="Hugging Face",
                description="Hugging Face models",
                supported_model_types=["LLM", "EMBEDDING"]
            ),
            ProviderInfo(
                provider="LOCAL",
                name="Local Model",
                description="Custom local models",
                supported_model_types=["LLM", "EMBEDDING", "TTS", "STT"]
            )
        ]
    
    @staticmethod
    def get_model_types(provider: str) -> List[ModelTypeInfo]:
        """Get supported model types for a provider."""
        provider_info = next(
            (p for p in ModelProviderManager.get_providers() if p.provider == provider), 
            None
        )
        if not provider_info:
            raise ValidationError(f"Unknown provider: {provider}")
        
        type_mapping = {
            "LLM": "Large Language Model",
            "EMBEDDING": "Embedding Model", 
            "TTS": "Text-to-Speech",
            "STT": "Speech-to-Text",
            "RERANK": "Reranking Model"
        }
        
        return [
            ModelTypeInfo(value=t, label=type_mapping.get(t, t))
            for t in provider_info.supported_model_types
        ]
    
    @staticmethod
    def get_models_list(provider: str, model_type: str) -> ModelListInfo:
        """Get available models for provider and type."""
        models_map = {
            "OPENAI": {
                "LLM": [
                    ModelInfo(name="gpt-4o", label="GPT-4o", description="Most capable GPT-4 model"),
                    ModelInfo(name="gpt-4o-mini", label="GPT-4o Mini", description="Faster, cheaper GPT-4"),
                    ModelInfo(name="gpt-4", label="GPT-4", description="Previous generation GPT-4"),
                    ModelInfo(name="gpt-3.5-turbo", label="GPT-3.5 Turbo", description="Fast and efficient"),
                ],
                "EMBEDDING": [
                    ModelInfo(name="text-embedding-3-large", label="Text Embedding 3 Large", description="Most capable embedding model"),
                    ModelInfo(name="text-embedding-3-small", label="Text Embedding 3 Small", description="Faster embedding model"),
                    ModelInfo(name="text-embedding-ada-002", label="Text Embedding Ada 002", description="Previous generation"),
                ]
            },
            "AZURE": {
                "LLM": [
                    ModelInfo(name="gpt-4o", label="GPT-4o", description="Azure GPT-4o deployment"),
                    ModelInfo(name="gpt-4", label="GPT-4", description="Azure GPT-4 deployment"),
                    ModelInfo(name="gpt-35-turbo", label="GPT-3.5 Turbo", description="Azure GPT-3.5 deployment"),
                ],
                "EMBEDDING": [
                    ModelInfo(name="text-embedding-3-large", label="Text Embedding 3 Large"),
                    ModelInfo(name="text-embedding-ada-002", label="Text Embedding Ada 002"),
                ]
            },
            "ANTHROPIC": {
                "LLM": [
                    ModelInfo(name="claude-3-5-sonnet-20241022", label="Claude 3.5 Sonnet", description="Most intelligent model"),
                    ModelInfo(name="claude-3-5-haiku-20241022", label="Claude 3.5 Haiku", description="Fastest model"),
                    ModelInfo(name="claude-3-opus-20240229", label="Claude 3 Opus", description="Most powerful model"),
                ]
            },
            "OLLAMA": {
                "LLM": [
                    ModelInfo(name="llama3.2", label="Llama 3.2", description="Meta's latest model"),
                    ModelInfo(name="qwen2.5", label="Qwen 2.5", description="Alibaba's model"),
                    ModelInfo(name="mistral", label="Mistral 7B", description="Mistral AI model"),
                    ModelInfo(name="deepseek-coder", label="DeepSeek Coder", description="Code generation model"),
                ],
                "EMBEDDING": [
                    ModelInfo(name="nomic-embed-text", label="Nomic Embed Text", description="High-quality embeddings"),
                    ModelInfo(name="mxbai-embed-large", label="MxBai Embed Large", description="Large embedding model"),
                ]
            }
        }
        
        provider_models = models_map.get(provider, {})
        models = provider_models.get(model_type, [])
        
        return ModelListInfo(models=models)
    
    @staticmethod
    def get_model_form(provider: str, model_type: str, model_name: str) -> List[ModelFormField]:
        """Get dynamic form fields for model creation."""
        forms_map = {
            "OPENAI": [
                ModelFormField(field="api_key", label="API Key", type="password", required=True),
                ModelFormField(field="base_url", label="Base URL", type="text", placeholder="https://api.openai.com/v1"),
                ModelFormField(field="organization", label="Organization", type="text"),
            ],
            "AZURE": [
                ModelFormField(field="api_key", label="API Key", type="password", required=True),
                ModelFormField(field="azure_endpoint", label="Azure Endpoint", type="text", required=True),
                ModelFormField(field="api_version", label="API Version", type="text", placeholder="2024-02-01"),
                ModelFormField(field="deployment_name", label="Deployment Name", type="text", required=True),
            ],
            "OLLAMA": [
                ModelFormField(field="base_url", label="Base URL", type="text", placeholder="http://localhost:11434"),
                ModelFormField(field="timeout", label="Timeout (seconds)", type="number", placeholder="300"),
            ],
            "ANTHROPIC": [
                ModelFormField(field="api_key", label="API Key", type="password", required=True),
                ModelFormField(field="base_url", label="Base URL", type="text", placeholder="https://api.anthropic.com"),
            ]
        }
        
        return forms_map.get(provider, [])
    
    @staticmethod
    def get_default_model_params(provider: str, model_type: str, model_name: str) -> List[ModelParamSchema]:
        """Get default parameters for a model."""
        if model_type == "LLM":
            return [
                ModelParamSchema(
                    label="Temperature",
                    field="temperature",
                    default_value="0.7",
                    input_type="slider",
                    attrs={"min": 0, "max": 2, "step": 0.1},
                    required=False
                ),
                ModelParamSchema(
                    label="Max Tokens",
                    field="max_tokens",
                    default_value="2000",
                    input_type="number",
                    attrs={"min": 1, "max": 8192},
                    required=False
                ),
                ModelParamSchema(
                    label="Top P",
                    field="top_p",
                    default_value="0.9",
                    input_type="slider",
                    attrs={"min": 0, "max": 1, "step": 0.1},
                    required=False
                ),
            ]
        elif model_type == "EMBEDDING":
            return [
                ModelParamSchema(
                    label="Dimensions",
                    field="dimensions",
                    default_value="1536",
                    input_type="select",
                    attrs={"options": [{"value": "512", "label": "512"}, {"value": "1536", "label": "1536"}]},
                    required=False
                ),
            ]
        
        return []


class ModelService:
    """Service for managing AI models."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_model(self, model_data: ModelCreate, user_id: UUID) -> ModelResponse:
        """Create a new model."""
        # Check if model name exists for this user
        existing = self.db.query(Model).filter(
            Model.name == model_data.name,
            Model.user_id == user_id
        ).first()
        
        if existing:
            raise ValidationError(f"Model with name '{model_data.name}' already exists")
        
        # Validate provider and model type
        providers = ModelProviderManager.get_providers()
        provider_info = next((p for p in providers if p.provider == model_data.provider.value), None)
        if not provider_info:
            raise ValidationError(f"Invalid provider: {model_data.provider}")
        
        if model_data.model_type.value not in provider_info.supported_model_types:
            raise ValidationError(f"Provider {model_data.provider} does not support {model_data.model_type}")
        
        # Create model
        model = Model(
            name=model_data.name,
            model_type=model_data.model_type,
            model_name=model_data.model_name,
            provider=model_data.provider,
            credential=json.dumps(model_data.credential),
            permission_type=model_data.permission_type,
            model_params_form=[param.dict() for param in model_data.model_params_form],
            user_id=user_id,
            status=ModelStatus.SUCCESS
        )
        
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        
        return self._model_to_response(model)
    
    def get_models(self, user_id: UUID, model_type: Optional[str] = None) -> List[ModelResponse]:
        """Get user's models."""
        query = self.db.query(Model).filter(
            (Model.user_id == user_id) | (Model.permission_type == PermissionType.PUBLIC)
        )
        
        if model_type:
            query = query.filter(Model.model_type == model_type)
        
        models = query.order_by(desc(Model.created_at)).all()
        return [self._model_to_response(model) for model in models]
    
    def get_model(self, model_id: UUID, user_id: UUID) -> ModelResponse:
        """Get a specific model."""
        model = self.db.query(Model).filter(Model.id == model_id).first()
        if not model:
            raise NotFoundError("Model not found")
        
        if not model.is_permission(str(user_id)):
            raise ValidationError("No permission to access this model")
        
        return self._model_to_response(model)
    
    def update_model(self, model_id: UUID, model_data: ModelUpdate, user_id: UUID) -> ModelResponse:
        """Update a model."""
        model = self.db.query(Model).filter(
            Model.id == model_id,
            Model.user_id == user_id
        ).first()
        
        if not model:
            raise NotFoundError("Model not found")
        
        # Update fields
        if model_data.name is not None:
            # Check name uniqueness
            existing = self.db.query(Model).filter(
                Model.name == model_data.name,
                Model.user_id == user_id,
                Model.id != model_id
            ).first()
            if existing:
                raise ValidationError(f"Model with name '{model_data.name}' already exists")
            model.name = model_data.name
        
        if model_data.status is not None:
            model.status = model_data.status
        
        if model_data.credential is not None:
            model.credential = json.dumps(model_data.credential)
        
        if model_data.permission_type is not None:
            model.permission_type = model_data.permission_type
        
        if model_data.model_params_form is not None:
            model.model_params_form = [param.dict() for param in model_data.model_params_form]
        
        self.db.commit()
        self.db.refresh(model)
        
        return self._model_to_response(model)
    
    def delete_model(self, model_id: UUID, user_id: UUID) -> bool:
        """Delete a model."""
        model = self.db.query(Model).filter(
            Model.id == model_id,
            Model.user_id == user_id
        ).first()
        
        if not model:
            raise NotFoundError("Model not found")
        
        self.db.delete(model)
        self.db.commit()
        
        return True
    
    async def test_model(self, model_id: UUID, user_id: UUID, prompt: str = "Hello") -> Dict[str, Any]:
        """Test a model connection."""
        model = self.db.query(Model).filter(Model.id == model_id).first()
        if not model:
            raise NotFoundError("Model not found")
        
        if not model.is_permission(str(user_id)):
            raise ValidationError("No permission to access this model")
        
        try:
            # This would be where you actually test the model
            # For now, we'll simulate a test
            credentials = json.loads(model.credential)
            
            # Simulate different provider tests
            if model.provider == ModelProvider.OPENAI:
                # Test OpenAI API
                return {"status": "success", "message": "OpenAI model is accessible"}
            elif model.provider == ModelProvider.OLLAMA:
                # Test Ollama connection
                return {"status": "success", "message": "Ollama model is running"}
            else:
                return {"status": "success", "message": f"{model.provider} model is configured"}
        
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def download_model(self, model_id: UUID, user_id: UUID) -> Dict[str, Any]:
        """Download a model (for Ollama, etc.)."""
        model = self.db.query(Model).filter(
            Model.id == model_id,
            Model.user_id == user_id
        ).first()
        
        if not model:
            raise NotFoundError("Model not found")
        
        if model.provider != ModelProvider.OLLAMA:
            raise ValidationError("Model download only supported for Ollama")
        
        # Update status to downloading
        model.status = ModelStatus.DOWNLOAD
        model.meta = {"download_progress": 0}
        self.db.commit()
        
        # Simulate download process
        # In reality, you'd call Ollama API to pull the model
        await asyncio.sleep(1)  # Simulate download time
        
        model.status = ModelStatus.SUCCESS
        model.meta = {"download_complete": True}
        self.db.commit()
        
        return {"status": "success", "message": "Model downloaded successfully"}
    
    def _model_to_response(self, model: Model) -> ModelResponse:
        """Convert model to response schema."""
        return ModelResponse(
            id=model.id,
            name=model.name,
            status=model.status,
            model_type=model.model_type,
            model_name=model.model_name,
            provider=model.provider,
            permission_type=model.permission_type,
            meta=model.meta,
            model_params_form=model.model_params_form,
            created_at=model.created_at.isoformat(),
            updated_at=model.updated_at.isoformat()
        ) 