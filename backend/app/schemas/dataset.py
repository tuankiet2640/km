"""
Dataset-related Pydantic schemas based on MaxKB knowledge base system.
"""

from datetime import datetime
from typing import Optional, List, Any, Dict
from uuid import UUID
from pydantic import BaseModel, Field

from app.models.dataset import DatasetType


class DatasetBase(BaseModel):
    """Base dataset schema."""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    type: DatasetType = DatasetType.BASE
    chunk_size: int = Field(1000, ge=100, le=10000)
    chunk_overlap: int = Field(200, ge=0, le=2000)
    embedding_model_id: Optional[str] = Field(None, max_length=255)
    embedding_model_name: Optional[str] = Field(None, max_length=255)
    is_active: bool = True


class DatasetCreate(DatasetBase):
    """Dataset creation schema."""
    web_sync_settings: Optional[Dict[str, Any]] = Field(default_factory=dict)
    sync_frequency: Optional[int] = Field(None, ge=1)  # in minutes
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "My Knowledge Base",
                "description": "A collection of company documents",
                "type": "base",
                "chunk_size": 1000,
                "chunk_overlap": 200,
                "embedding_model_name": "text-embedding-ada-002",
                "is_active": True
            }
        }


class DatasetUpdate(BaseModel):
    """Dataset update schema."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    chunk_size: Optional[int] = Field(None, ge=100, le=10000)
    chunk_overlap: Optional[int] = Field(None, ge=0, le=2000)
    embedding_model_id: Optional[str] = Field(None, max_length=255)
    embedding_model_name: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None
    web_sync_settings: Optional[Dict[str, Any]] = None
    sync_frequency: Optional[int] = Field(None, ge=1)


class DatasetResponse(DatasetBase):
    """Dataset response schema."""
    id: UUID
    document_count: int
    paragraph_count: int
    problem_count: int
    vector_count: int
    last_sync_at: Optional[datetime] = None
    owner_id: UUID
    created_at: datetime
    updated_at: datetime
    
    # Computed properties
    total_size: Optional[int] = None
    processing_status: Optional[str] = None
    
    class Config:
        from_attributes = True


class DatasetList(BaseModel):
    """Dataset list response schema."""
    datasets: List[DatasetResponse]
    total: int
    page: int
    size: int


class DatasetImport(BaseModel):
    """Dataset import configuration schema."""
    import_type: str = Field(..., pattern="^(csv|json|txt|pdf)$")
    separator: Optional[str] = Field(",", description="CSV separator")
    encoding: str = Field("utf-8", description="File encoding")
    skip_header: bool = Field(True, description="Skip first row in CSV")
    text_column: Optional[str] = Field(None, description="Column name for text content")
    title_column: Optional[str] = Field(None, description="Column name for titles")
    auto_split: bool = Field(True, description="Automatically split into paragraphs")
    custom_split_rules: Optional[Dict[str, Any]] = Field(default_factory=dict)


class DatasetExport(BaseModel):
    """Dataset export configuration schema."""
    format: str = Field(..., pattern="^(json|csv|txt)$")
    include_embeddings: bool = Field(False)
    include_metadata: bool = Field(True)
    filter_active_only: bool = Field(True)


class DatasetSync(BaseModel):
    """Web dataset synchronization schema."""
    force_sync: bool = Field(False, description="Force full synchronization")
    url_patterns: Optional[List[str]] = Field(None, description="URL patterns to sync")
    max_depth: int = Field(3, ge=1, le=10, description="Maximum crawl depth")
    respect_robots_txt: bool = Field(True)
    delay_between_requests: float = Field(1.0, ge=0.1, le=10.0)
    
    class Config:
        json_schema_extra = {
            "example": {
                "force_sync": False,
                "url_patterns": ["https://example.com/docs/*"],
                "max_depth": 3,
                "respect_robots_txt": True,
                "delay_between_requests": 1.0
            }
        }


class DatasetStatistics(BaseModel):
    """Dataset statistics schema."""
    document_count: int
    paragraph_count: int
    problem_count: int
    vector_count: int
    total_size_bytes: int
    avg_paragraph_length: float
    
    # Processing statistics
    vectorized_paragraphs: int
    pending_paragraphs: int
    failed_paragraphs: int
    
    # Usage statistics
    total_searches: int
    avg_search_score: Optional[float] = None
    most_retrieved_paragraphs: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Time-based statistics
    created_at: datetime
    last_updated: datetime
    last_vectorization: Optional[datetime] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "document_count": 25,
                "paragraph_count": 1250,
                "problem_count": 2800,
                "vector_count": 1250,
                "total_size_bytes": 15728640,
                "avg_paragraph_length": 485.2,
                "vectorized_paragraphs": 1200,
                "pending_paragraphs": 50,
                "failed_paragraphs": 0,
                "total_searches": 1847,
                "avg_search_score": 0.73
            }
        }


class DatasetSearchRequest(BaseModel):
    """Dataset search request schema."""
    query: str = Field(..., min_length=1, max_length=1000)
    limit: int = Field(10, ge=1, le=100)
    similarity_threshold: float = Field(0.7, ge=0.0, le=1.0)
    search_mode: str = Field("semantic", pattern="^(semantic|keyword|hybrid)$")
    include_metadata: bool = Field(True)
    filter_active_only: bool = Field(True)


class DatasetSearchResult(BaseModel):
    """Dataset search result schema."""
    paragraph_id: UUID
    document_id: UUID
    title: Optional[str] = None
    content: str
    similarity_score: float
    metadata: Dict[str, Any] = Field(default_factory=dict)
    document_name: str
    
    class Config:
        from_attributes = True


class DatasetSearchResponse(BaseModel):
    """Dataset search response schema."""
    results: List[DatasetSearchResult]
    total_found: int
    query: str
    search_time: float  # in seconds
    
    class Config:
        json_schema_extra = {
            "example": {
                "results": [
                    {
                        "paragraph_id": "123e4567-e89b-12d3-a456-426614174000",
                        "document_id": "123e4567-e89b-12d3-a456-426614174001",
                        "title": "Introduction to Machine Learning",
                        "content": "Machine learning is a subset of artificial intelligence...",
                        "similarity_score": 0.89,
                        "metadata": {"section": "chapter_1"},
                        "document_name": "ML_Handbook.pdf"
                    }
                ],
                "total_found": 1,
                "query": "machine learning introduction",
                "search_time": 0.045
            }
        } 