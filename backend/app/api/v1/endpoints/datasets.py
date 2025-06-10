"""
Dataset management endpoints based on MaxKB knowledge base system.
"""

from typing import Any, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.models.user import User
from app.schemas.dataset import (
    DatasetCreate, DatasetUpdate, DatasetResponse, DatasetList,
    DatasetImport, DatasetExport, DatasetSync
)
from app.services.auth import AuthService
from app.services.dataset import DatasetService
from app.services.embedding import EmbeddingService

router = APIRouter()


@router.get("/", response_model=DatasetList)
async def list_datasets(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(AuthService.get_current_active_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: str = Query(None, description="Search by name or description"),
    dataset_type: str = Query(None, description="Filter by dataset type"),
    is_active: bool = Query(None, description="Filter by active status"),
) -> Any:
    """
    List datasets with pagination and filtering.
    """
    dataset_service = DatasetService(db)
    
    datasets, total = await dataset_service.list_datasets(
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        search=search,
        dataset_type=dataset_type,
        is_active=is_active,
    )
    
    return DatasetList(
        datasets=datasets,
        total=total,
        page=skip // limit + 1,
        size=limit,
    )


@router.post("/", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
async def create_dataset(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(AuthService.get_current_active_user),
    dataset_data: DatasetCreate,
) -> Any:
    """
    Create a new dataset.
    """
    dataset_service = DatasetService(db)
    
    # Check if dataset name already exists for user
    existing = await dataset_service.get_by_name(current_user.id, dataset_data.name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dataset with this name already exists"
        )
    
    dataset = await dataset_service.create_dataset(current_user.id, dataset_data)
    return dataset


@router.get("/{dataset_id}", response_model=DatasetResponse)
async def get_dataset(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(AuthService.get_current_active_user),
    dataset_id: UUID,
) -> Any:
    """
    Get dataset by ID.
    """
    dataset_service = DatasetService(db)
    
    dataset = await dataset_service.get_by_id(dataset_id)
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Check ownership or admin access
    if dataset.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return dataset


@router.put("/{dataset_id}", response_model=DatasetResponse)
async def update_dataset(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(AuthService.get_current_active_user),
    dataset_id: UUID,
    dataset_data: DatasetUpdate,
) -> Any:
    """
    Update dataset.
    """
    dataset_service = DatasetService(db)
    
    dataset = await dataset_service.get_by_id(dataset_id)
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Check ownership
    if dataset.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    updated_dataset = await dataset_service.update_dataset(dataset_id, dataset_data)
    return updated_dataset


@router.delete("/{dataset_id}")
async def delete_dataset(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(AuthService.get_current_active_user),
    dataset_id: UUID,
) -> Any:
    """
    Delete dataset.
    """
    dataset_service = DatasetService(db)
    
    dataset = await dataset_service.get_by_id(dataset_id)
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Check ownership
    if dataset.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    await dataset_service.delete_dataset(dataset_id)
    return {"message": "Dataset deleted successfully"}


@router.post("/{dataset_id}/vectorize")
async def vectorize_dataset(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(AuthService.get_current_active_user),
    dataset_id: UUID,
) -> Any:
    """
    Start vectorization process for all paragraphs in the dataset.
    """
    dataset_service = DatasetService(db)
    embedding_service = EmbeddingService()
    
    dataset = await dataset_service.get_by_id(dataset_id)
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Check ownership
    if dataset.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Start background vectorization task
    task_id = await embedding_service.vectorize_dataset(dataset_id)
    
    return {
        "message": "Vectorization started",
        "task_id": task_id,
        "dataset_id": str(dataset_id)
    }


@router.post("/{dataset_id}/sync")
async def sync_web_dataset(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(AuthService.get_current_active_user),
    dataset_id: UUID,
    sync_data: DatasetSync,
) -> Any:
    """
    Synchronize web dataset with external sources.
    """
    dataset_service = DatasetService(db)
    
    dataset = await dataset_service.get_by_id(dataset_id)
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Check ownership and dataset type
    if dataset.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    if dataset.type != "web":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only web datasets can be synchronized"
        )
    
    # Start sync process
    task_id = await dataset_service.sync_web_dataset(dataset_id, sync_data)
    
    return {
        "message": "Synchronization started",
        "task_id": task_id,
        "dataset_id": str(dataset_id)
    }


@router.post("/{dataset_id}/import")
async def import_dataset_content(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(AuthService.get_current_active_user),
    dataset_id: UUID,
    file: UploadFile = File(...),
    import_config: DatasetImport = Depends(),
) -> Any:
    """
    Import content into dataset from file.
    """
    dataset_service = DatasetService(db)
    
    dataset = await dataset_service.get_by_id(dataset_id)
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Check ownership
    if dataset.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Validate file type
    allowed_types = ["text/csv", "application/json", "text/plain", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file.content_type} not supported"
        )
    
    # Start import process
    task_id = await dataset_service.import_content(dataset_id, file, import_config)
    
    return {
        "message": "Import started",
        "task_id": task_id,
        "filename": file.filename,
        "dataset_id": str(dataset_id)
    }


@router.get("/{dataset_id}/export")
async def export_dataset(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(AuthService.get_current_active_user),
    dataset_id: UUID,
    format: str = Query("json", description="Export format: json, csv, txt"),
    include_embeddings: bool = Query(False, description="Include vector embeddings"),
) -> Any:
    """
    Export dataset content.
    """
    dataset_service = DatasetService(db)
    
    dataset = await dataset_service.get_by_id(dataset_id)
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Check ownership
    if dataset.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Validate format
    if format not in ["json", "csv", "txt"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid export format"
        )
    
    # Generate export file
    export_data = await dataset_service.export_dataset(
        dataset_id, format, include_embeddings
    )
    
    return export_data


@router.get("/{dataset_id}/statistics")
async def get_dataset_statistics(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(AuthService.get_current_active_user),
    dataset_id: UUID,
) -> Any:
    """
    Get detailed statistics for a dataset.
    """
    dataset_service = DatasetService(db)
    
    dataset = await dataset_service.get_by_id(dataset_id)
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Check ownership
    if dataset.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    stats = await dataset_service.get_dataset_statistics(dataset_id)
    return stats 