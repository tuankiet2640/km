"""
Embedding service for vector operations and similarity search.
"""

from typing import List, Dict, Any, Optional
from uuid import UUID
import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.core.config import settings
from app.core.database import async_session_maker
from app.models.document import Paragraph, Problem
from app.models.dataset import Dataset

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Service for handling vector embeddings and similarity search."""
    
    def __init__(self):
        self.embedding_dimension = settings.VECTOR_DIMENSION
        self.model_name = settings.DEFAULT_EMBEDDING_MODEL
    
    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of texts.
        This is a placeholder implementation - in production, you would use
        an actual embedding service like OpenAI, Hugging Face, or local models.
        """
        # Mock embeddings - replace with actual embedding generation
        import random
        embeddings = []
        for text in texts:
            # Generate random embedding vector of correct dimension
            embedding = [random.random() for _ in range(self.embedding_dimension)]
            embeddings.append(embedding)
        
        logger.info(f"Generated {len(embeddings)} embeddings")
        return embeddings
    
    async def vectorize_dataset(self, dataset_id: UUID) -> str:
        """
        Start background task to vectorize all paragraphs in a dataset.
        Returns task ID for tracking progress.
        """
        import uuid
        task_id = str(uuid.uuid4())
        
        # Start background task
        asyncio.create_task(self._vectorize_dataset_task(dataset_id, task_id))
        
        return task_id
    
    async def _vectorize_dataset_task(self, dataset_id: UUID, task_id: str) -> None:
        """
        Background task to vectorize all paragraphs in a dataset.
        """
        async with async_session_maker() as db:
            try:
                logger.info(f"Starting vectorization for dataset {dataset_id}")
                
                # Get all paragraphs that need vectorization
                result = await db.execute(
                    select(Paragraph)
                    .join(Paragraph.document)
                    .where(
                        and_(
                            Paragraph.document.has(dataset_id=dataset_id),
                            Paragraph.embedding.is_(None),
                            Paragraph.is_active == True
                        )
                    )
                )
                paragraphs = result.scalars().all()
                
                logger.info(f"Found {len(paragraphs)} paragraphs to vectorize")
                
                # Process paragraphs in batches
                batch_size = 50
                for i in range(0, len(paragraphs), batch_size):
                    batch = paragraphs[i:i + batch_size]
                    
                    # Extract text content
                    texts = [p.content for p in batch]
                    
                    # Generate embeddings
                    embeddings = await self.generate_embeddings(texts)
                    
                    # Update paragraphs with embeddings
                    for paragraph, embedding in zip(batch, embeddings):
                        paragraph.embedding = embedding
                        paragraph.status = "completed"
                    
                    await db.commit()
                    
                    logger.info(f"Processed batch {i//batch_size + 1}/{(len(paragraphs) + batch_size - 1)//batch_size}")
                    
                    # Small delay to avoid overwhelming the system
                    await asyncio.sleep(0.1)
                
                # Also vectorize problems (questions) if they exist
                await self._vectorize_problems(db, dataset_id)
                
                # Update dataset counters
                from app.services.dataset import DatasetService
                dataset_service = DatasetService(db)
                await dataset_service.update_counters(dataset_id)
                
                logger.info(f"Completed vectorization for dataset {dataset_id}")
                
            except Exception as e:
                logger.error(f"Error vectorizing dataset {dataset_id}: {e}")
    
    async def _vectorize_problems(self, db: AsyncSession, dataset_id: UUID) -> None:
        """Vectorize problems (questions) associated with paragraphs in the dataset."""
        
        result = await db.execute(
            select(Problem)
            .join(Problem.paragraph)
            .join(Problem.paragraph.has(document_id=Paragraph.document_id))
            .where(
                and_(
                    Paragraph.document.has(dataset_id=dataset_id),
                    Problem.embedding.is_(None),
                    Problem.is_active == True
                )
            )
        )
        problems = result.scalars().all()
        
        if not problems:
            return
        
        logger.info(f"Vectorizing {len(problems)} problems")
        
        # Process in batches
        batch_size = 50
        for i in range(0, len(problems), batch_size):
            batch = problems[i:i + batch_size]
            
            # Extract question content
            texts = [p.content for p in batch]
            
            # Generate embeddings
            embeddings = await self.generate_embeddings(texts)
            
            # Update problems with embeddings
            for problem, embedding in zip(batch, embeddings):
                problem.embedding = embedding
                problem.status = "completed"
            
            await db.commit()
    
    async def similarity_search(
        self,
        dataset_id: UUID,
        query_embedding: List[float],
        limit: int = 10,
        similarity_threshold: float = 0.7,
        search_mode: str = "semantic"
    ) -> List[Dict[str, Any]]:
        """
        Perform similarity search against dataset paragraphs.
        """
        async with async_session_maker() as db:
            # This would use pgvector's similarity functions
            # For now, return empty results as this requires actual vector search implementation
            
            # Example query structure (would need actual pgvector syntax):
            # SELECT p.*, p.embedding <=> %s as similarity_score
            # FROM paragraphs p
            # JOIN documents d ON p.document_id = d.id
            # WHERE d.dataset_id = %s
            # AND p.embedding <=> %s < %s
            # ORDER BY p.embedding <=> %s
            # LIMIT %s
            
            logger.info(f"Performing similarity search on dataset {dataset_id}")
            return []
    
    async def search_paragraphs(
        self,
        dataset_id: UUID,
        query: str,
        limit: int = 10,
        similarity_threshold: float = 0.7,
        search_mode: str = "semantic"
    ) -> List[Dict[str, Any]]:
        """
        Search paragraphs by converting query to embedding and finding similar content.
        """
        # Generate embedding for the query
        query_embeddings = await self.generate_embeddings([query])
        query_embedding = query_embeddings[0]
        
        # Perform similarity search
        results = await self.similarity_search(
            dataset_id=dataset_id,
            query_embedding=query_embedding,
            limit=limit,
            similarity_threshold=similarity_threshold,
            search_mode=search_mode
        )
        
        return results
    
    async def search_problems(
        self,
        dataset_id: UUID,
        query: str,
        limit: int = 10,
        similarity_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """
        Search problems (questions) that are similar to the query.
        """
        # Generate embedding for the query
        query_embeddings = await self.generate_embeddings([query])
        query_embedding = query_embeddings[0]
        
        async with async_session_maker() as db:
            # Similar implementation as similarity_search but for problems
            logger.info(f"Searching problems on dataset {dataset_id}")
            return []
    
    async def hybrid_search(
        self,
        dataset_id: UUID,
        query: str,
        limit: int = 10,
        semantic_weight: float = 0.7,
        keyword_weight: float = 0.3
    ) -> List[Dict[str, Any]]:
        """
        Perform hybrid search combining semantic and keyword search.
        """
        # Get semantic search results
        semantic_results = await self.search_paragraphs(
            dataset_id=dataset_id,
            query=query,
            limit=limit * 2,  # Get more results to combine
            search_mode="semantic"
        )
        
        # Get keyword search results (would implement full-text search)
        keyword_results = await self._keyword_search(dataset_id, query, limit * 2)
        
        # Combine and re-rank results
        combined_results = self._combine_search_results(
            semantic_results, keyword_results, semantic_weight, keyword_weight
        )
        
        return combined_results[:limit]
    
    async def _keyword_search(self, dataset_id: UUID, query: str, limit: int) -> List[Dict[str, Any]]:
        """Perform keyword-based search using full-text search."""
        async with async_session_maker() as db:
            # This would implement PostgreSQL full-text search
            logger.info(f"Performing keyword search on dataset {dataset_id}")
            return []
    
    def _combine_search_results(
        self,
        semantic_results: List[Dict[str, Any]],
        keyword_results: List[Dict[str, Any]],
        semantic_weight: float,
        keyword_weight: float
    ) -> List[Dict[str, Any]]:
        """Combine and re-rank semantic and keyword search results."""
        # Simple combination strategy - in production, use more sophisticated ranking
        combined = {}
        
        # Add semantic results
        for i, result in enumerate(semantic_results):
            result_id = result.get('paragraph_id')
            score = (1.0 - i / len(semantic_results)) * semantic_weight
            combined[result_id] = {**result, 'combined_score': score}
        
        # Add keyword results
        for i, result in enumerate(keyword_results):
            result_id = result.get('paragraph_id')
            score = (1.0 - i / len(keyword_results)) * keyword_weight
            
            if result_id in combined:
                combined[result_id]['combined_score'] += score
            else:
                combined[result_id] = {**result, 'combined_score': score}
        
        # Sort by combined score
        sorted_results = sorted(
            combined.values(),
            key=lambda x: x['combined_score'],
            reverse=True
        )
        
        return sorted_results 