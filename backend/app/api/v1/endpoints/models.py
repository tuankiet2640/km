"""
Model management API endpoints.
"""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.auth import AuthService
from app.models.user import User
from app.schemas.model import (
    ModelCreate, ModelUpdate, ModelResponse, ModelListResponse,
    ModelFormResponse, ModelParamsResponse, ModelDownloadRequest, ModelTestRequest,
    ProviderInfo, ModelTypeInfo, ModelListInfo
)
from app.services.model_service import ModelService, ModelProviderManager
from app.core.exceptions import ValidationError, NotFoundError

router = APIRouter()


@router.get("/providers", response_model=List[ProviderInfo])
async def get_providers():
    """Get list of available model providers."""
    return ModelProviderManager.get_providers()


@router.get("/providers/{provider}/types", response_model=List[ModelTypeInfo])
async def get_provider_model_types(provider: str):
    """Get supported model types for a provider."""
    try:
        return ModelProviderManager.get_model_types(provider)
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/providers/{provider}/models", response_model=ModelListInfo)
async def get_provider_models(
    provider: str,
    model_type: str = Query(..., description="Model type")
):
    """Get available models for a provider and type."""
    return ModelProviderManager.get_models_list(provider, model_type)


@router.get("/providers/{provider}/form", response_model=ModelFormResponse)
async def get_model_form(
    provider: str,
    model_type: str = Query(..., description="Model type"),
    model_name: str = Query(..., description="Model name")
):
    """Get dynamic form fields for model creation."""
    fields = ModelProviderManager.get_model_form(provider, model_type, model_name)
    return ModelFormResponse(fields=fields)


@router.get("/providers/{provider}/params", response_model=ModelParamsResponse)
async def get_model_default_params(
    provider: str,
    model_type: str = Query(..., description="Model type"),
    model_name: str = Query(..., description="Model name")
):
    """Get default parameters for a model."""
    params = ModelProviderManager.get_default_model_params(provider, model_type, model_name)
    return ModelParamsResponse(params=params)


@router.post("/", response_model=ModelResponse)
async def create_model(
    model_data: ModelCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """Create a new model."""
    service = ModelService(db)
    try:
        return service.create_model(model_data, current_user.id)
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=ModelListResponse)
async def get_models(
    model_type: Optional[str] = Query(None, description="Filter by model type"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """Get user's models."""
    service = ModelService(db)
    models = service.get_models(current_user.id, model_type)
    return ModelListResponse(models=models, total=len(models))


@router.get("/{model_id}", response_model=ModelResponse)
async def get_model(
    model_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """Get a specific model."""
    service = ModelService(db)
    try:
        return service.get_model(model_id, current_user.id)
    except (ValidationError, NotFoundError) as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{model_id}", response_model=ModelResponse)
async def update_model(
    model_id: UUID,
    model_data: ModelUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """Update a model."""
    service = ModelService(db)
    try:
        return service.update_model(model_id, model_data, current_user.id)
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{model_id}")
async def delete_model(
    model_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """Delete a model."""
    service = ModelService(db)
    try:
        service.delete_model(model_id, current_user.id)
        return {"message": "Model deleted successfully"}
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{model_id}/test")
async def test_model(
    model_id: UUID,
    test_data: ModelTestRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """Test a model connection."""
    service = ModelService(db)
    try:
        result = await service.test_model(model_id, current_user.id, test_data.prompt)
        return result
    except (ValidationError, NotFoundError) as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{model_id}/download")
async def download_model(
    model_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """Download a model (for Ollama, etc.)."""
    service = ModelService(db)
    try:
        result = await service.download_model(model_id, current_user.id)
        return result
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{model_id}/pause")
async def pause_model_download(
    model_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """Pause model download."""
    service = ModelService(db)
    try:
        model = service.get_model(model_id, current_user.id)
        if model.status != "DOWNLOAD":
            raise HTTPException(status_code=400, detail="Model is not downloading")
        
        # Update to pause status
        update_data = ModelUpdate(status="PAUSE_DOWNLOAD")
        service.update_model(model_id, update_data, current_user.id)
        
        return {"message": "Model download paused"}
    except (ValidationError, NotFoundError) as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{model_id}/params", response_model=ModelParamsResponse)
async def get_model_params(
    model_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """Get model parameter form."""
    service = ModelService(db)
    try:
        model = service.get_model(model_id, current_user.id)
        params = [ModelParamSchema(**param) for param in model.model_params_form]
        return ModelParamsResponse(params=params)
    except (ValidationError, NotFoundError) as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{model_id}/params")
async def save_model_params(
    model_id: UUID,
    params_data: ModelParamsResponse,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """Save model parameter form."""
    service = ModelService(db)
    try:
        update_data = ModelUpdate(model_params_form=params_data.params)
        service.update_model(model_id, update_data, current_user.id)
        return {"message": "Model parameters saved successfully"}
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) 