"""
Dataset service for knowledge base management operations.
"""

from typing import Optional, List, Tuple, Any, Dict
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc
from sqlalchemy.orm import selectinload
from fastapi import UploadFile

from app.models.dataset import Dataset, DatasetType
from app.models.document import Document, Paragraph, Problem
from app.schemas.dataset import DatasetCreate, DatasetUpdate, DatasetImport, DatasetSync


class DatasetService:
    """Dataset service class for database operations."""
    
    def __init__(self, db_session: AsyncSession):
        self.db = db_session
    
    async def get_by_id(self, dataset_id: UUID) -> Optional[Dataset]:
        """Get dataset by ID."""
        result = await self.db.execute(
            select(Dataset)
            .options(selectinload(Dataset.documents))
            .where(Dataset.id == dataset_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_name(self, user_id: UUID, name: str) -> Optional[Dataset]:
        """Get dataset by name for a specific user."""
        result = await self.db.execute(
            select(Dataset).where(
                and_(Dataset.owner_id == user_id, Dataset.name == name)
            )
        )
        return result.scalar_one_or_none()
    
    async def list_datasets(
        self,
        user_id: UUID,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        dataset_type: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> Tuple[List[Dataset], int]:
        """List datasets with pagination and filtering."""
        
        # Build base query
        query = select(Dataset).where(Dataset.owner_id == user_id)
        count_query = select(func.count(Dataset.id)).where(Dataset.owner_id == user_id)
        
        # Apply filters
        if search:
            search_filter = or_(
                Dataset.name.ilike(f"%{search}%"),
                Dataset.description.ilike(f"%{search}%")
            )
            query = query.where(search_filter)
            count_query = count_query.where(search_filter)
        
        if dataset_type:
            query = query.where(Dataset.type == dataset_type)
            count_query = count_query.where(Dataset.type == dataset_type)
        
        if is_active is not None:
            query = query.where(Dataset.is_active == is_active)
            count_query = count_query.where(Dataset.is_active == is_active)
        
        # Apply pagination and ordering
        query = query.offset(skip).limit(limit).order_by(desc(Dataset.created_at))
        
        # Execute queries
        result = await self.db.execute(query)
        count_result = await self.db.execute(count_query)
        
        datasets = result.scalars().all()
        total = count_result.scalar()
        
        return list(datasets), total
    
    async def create_dataset(self, user_id: UUID, dataset_data: DatasetCreate) -> Dataset:
        """Create a new dataset."""
        dataset = Dataset(
            name=dataset_data.name,
            description=dataset_data.description,
            type=dataset_data.type,
            chunk_size=dataset_data.chunk_size,
            chunk_overlap=dataset_data.chunk_overlap,
            embedding_model_id=dataset_data.embedding_model_id,
            embedding_model_name=dataset_data.embedding_model_name,
            web_sync_settings=dataset_data.web_sync_settings or {},
            sync_frequency=dataset_data.sync_frequency,
            is_active=dataset_data.is_active,
            owner_id=user_id,
        )
        
        self.db.add(dataset)
        await self.db.commit()
        await self.db.refresh(dataset)
        
        return dataset
    
    async def update_dataset(self, dataset_id: UUID, dataset_data: DatasetUpdate) -> Optional[Dataset]:
        """Update dataset information."""
        dataset = await self.get_by_id(dataset_id)
        if not dataset:
            return None
        
        update_data = dataset_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(dataset, field, value)
        
        await self.db.commit()
        await self.db.refresh(dataset)
        
        return dataset
    
    async def delete_dataset(self, dataset_id: UUID) -> bool:
        """Delete dataset and all related data."""
        dataset = await self.get_by_id(dataset_id)
        if not dataset:
            return False
        
        await self.db.delete(dataset)
        await self.db.commit()
        
        return True
    
    async def get_dataset_statistics(self, dataset_id: UUID) -> Dict[str, Any]:
        """Get comprehensive statistics for a dataset."""
        
        # Get basic counts
        doc_count_result = await self.db.execute(
            select(func.count(Document.id)).where(Document.dataset_id == dataset_id)
        )
        
        paragraph_count_result = await self.db.execute(
            select(func.count(Paragraph.id))
            .join(Document)
            .where(Document.dataset_id == dataset_id)
        )
        
        problem_count_result = await self.db.execute(
            select(func.count(Problem.id))
            .join(Paragraph)
            .join(Document)
            .where(Document.dataset_id == dataset_id)
        )
        
        # Get paragraph status counts
        vectorized_count_result = await self.db.execute(
            select(func.count(Paragraph.id))
            .join(Document)
            .where(
                and_(
                    Document.dataset_id == dataset_id,
                    Paragraph.embedding.isnot(None),
                    Paragraph.status == "completed"
                )
            )
        )
        
        pending_count_result = await self.db.execute(
            select(func.count(Paragraph.id))
            .join(Document)
            .where(
                and_(
                    Document.dataset_id == dataset_id,
                    Paragraph.status == "pending"
                )
            )
        )
        
        failed_count_result = await self.db.execute(
            select(func.count(Paragraph.id))
            .join(Document)
            .where(
                and_(
                    Document.dataset_id == dataset_id,
                    Paragraph.status == "failed"
                )
            )
        )
        
        # Get size statistics
        total_size_result = await self.db.execute(
            select(func.sum(Document.file_size))
            .where(Document.dataset_id == dataset_id)
        )
        
        avg_length_result = await self.db.execute(
            select(func.avg(Paragraph.character_count))
            .join(Document)
            .where(Document.dataset_id == dataset_id)
        )
        
        # Get usage statistics
        total_hits_result = await self.db.execute(
            select(func.sum(Paragraph.hit_count))
            .join(Document)
            .where(Document.dataset_id == dataset_id)
        )
        
        # Get dataset info
        dataset = await self.get_by_id(dataset_id)
        
        return {
            "document_count": doc_count_result.scalar() or 0,
            "paragraph_count": paragraph_count_result.scalar() or 0,
            "problem_count": problem_count_result.scalar() or 0,
            "vector_count": vectorized_count_result.scalar() or 0,
            "total_size_bytes": total_size_result.scalar() or 0,
            "avg_paragraph_length": float(avg_length_result.scalar() or 0),
            "vectorized_paragraphs": vectorized_count_result.scalar() or 0,
            "pending_paragraphs": pending_count_result.scalar() or 0,
            "failed_paragraphs": failed_count_result.scalar() or 0,
            "total_searches": total_hits_result.scalar() or 0,
            "created_at": dataset.created_at if dataset else None,
            "last_updated": dataset.updated_at if dataset else None,
            "last_vectorization": None,  # This would need to be tracked separately
            "avg_search_score": None,    # This would need to be calculated from search logs
            "most_retrieved_paragraphs": []  # This would need search analytics
        }
    
    async def import_content(
        self, 
        dataset_id: UUID, 
        file: UploadFile, 
        import_config: DatasetImport
    ) -> str:
        """Import content from file into dataset."""
        # This would implement file processing logic
        # For now, return a mock task ID
        import uuid
        return str(uuid.uuid4())
    
    async def export_dataset(
        self,
        dataset_id: UUID,
        format: str,
        include_embeddings: bool = False
    ) -> Dict[str, Any]:
        """Export dataset content."""
        dataset = await self.get_by_id(dataset_id)
        if not dataset:
            return {}
        
        # Get all documents and paragraphs
        documents_result = await self.db.execute(
            select(Document)
            .options(selectinload(Document.paragraphs))
            .where(Document.dataset_id == dataset_id)
        )
        documents = documents_result.scalars().all()
        
        export_data = {
            "dataset": {
                "id": str(dataset.id),
                "name": dataset.name,
                "description": dataset.description,
                "type": dataset.type,
                "created_at": dataset.created_at.isoformat(),
            },
            "documents": []
        }
        
        for doc in documents:
            doc_data = {
                "id": str(doc.id),
                "name": doc.name,
                "file_type": doc.file_type,
                "created_at": doc.created_at.isoformat(),
                "paragraphs": []
            }
            
            for paragraph in doc.paragraphs:
                para_data = {
                    "id": str(paragraph.id),
                    "title": paragraph.title,
                    "content": paragraph.content,
                    "sort_index": paragraph.sort_index,
                    "word_count": paragraph.word_count,
                    "character_count": paragraph.character_count,
                }
                
                if include_embeddings and paragraph.embedding:
                    para_data["embedding"] = paragraph.embedding
                
                doc_data["paragraphs"].append(para_data)
            
            export_data["documents"].append(doc_data)
        
        return export_data
    
    async def sync_web_dataset(self, dataset_id: UUID, sync_data: DatasetSync) -> str:
        """Synchronize web dataset with external sources."""
        # This would implement web scraping and synchronization logic
        # For now, return a mock task ID
        import uuid
        return str(uuid.uuid4())
    
    async def search_dataset(
        self,
        dataset_id: UUID,
        query: str,
        limit: int = 10,
        similarity_threshold: float = 0.7,
        search_mode: str = "semantic"
    ) -> List[Dict[str, Any]]:
        """Search paragraphs in a dataset."""
        # This would implement vector similarity search
        # For now, return an empty list as this requires embedding service integration
        return []
    
    async def update_counters(self, dataset_id: UUID) -> None:
        """Update dataset metadata counters."""
        dataset = await self.get_by_id(dataset_id)
        if not dataset:
            return
        
        # Count documents
        doc_count = await self.db.execute(
            select(func.count(Document.id)).where(Document.dataset_id == dataset_id)
        )
        dataset.document_count = doc_count.scalar() or 0
        
        # Count paragraphs
        para_count = await self.db.execute(
            select(func.count(Paragraph.id))
            .join(Document)
            .where(Document.dataset_id == dataset_id)
        )
        dataset.paragraph_count = para_count.scalar() or 0
        
        # Count problems
        prob_count = await self.db.execute(
            select(func.count(Problem.id))
            .join(Paragraph)
            .join(Document)
            .where(Document.dataset_id == dataset_id)
        )
        dataset.problem_count = prob_count.scalar() or 0
        
        # Count vectors
        vector_count = await self.db.execute(
            select(func.count(Paragraph.id))
            .join(Document)
            .where(
                and_(
                    Document.dataset_id == dataset_id,
                    Paragraph.embedding.isnot(None)
                )
            )
        )
        dataset.vector_count = vector_count.scalar() or 0
        
        await self.db.commit() 