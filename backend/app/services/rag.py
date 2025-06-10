"""
RAG (Retrieval-Augmented Generation) service for knowledge-based AI responses.
"""

from typing import List, Dict, Any, Optional, Tuple
from uuid import UUID
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc, func, text
from sqlalchemy.orm import selectinload

from app.models.dataset import Dataset
from app.models.document import Document, Paragraph, Problem
from app.models.application import Application
from app.services.embedding import EmbeddingService
from app.core.config import settings

logger = logging.getLogger(__name__)


class RAGService:
    """Service for retrieval-augmented generation operations."""
    
    def __init__(self, db_session: AsyncSession):
        self.db = db_session
        self.embedding_service = EmbeddingService()
    
    async def retrieve_relevant_context(
        self,
        application_id: UUID,
        query: str,
        limit: int = 5,
        similarity_threshold: float = 0.7,
        search_mode: str = "semantic"
    ) -> List[Dict[str, Any]]:
        """
        Retrieve relevant context for a query from application's datasets.
        """
        
        # Get application and associated datasets
        app_result = await self.db.execute(
            select(Application)
            .options(selectinload(Application.datasets))
            .where(Application.id == application_id)
        )
        application = app_result.scalar_one_or_none()
        
        if not application:
            logger.warning(f"Application {application_id} not found")
            return []
        
        # Get all datasets associated with the application
        # Note: This assumes there's a relationship - in MaxKB there's ApplicationDatasetMapping
        # For now, we'll search all active datasets owned by the application owner
        datasets_result = await self.db.execute(
            select(Dataset).where(
                and_(
                    Dataset.owner_id == application.owner_id,
                    Dataset.is_active == True
                )
            )
        )
        datasets = datasets_result.scalars().all()
        
        if not datasets:
            logger.info(f"No datasets found for application {application_id}")
            return []
        
        all_results = []
        
        # Search each dataset
        for dataset in datasets:
            try:
                if search_mode == "semantic":
                    results = await self._semantic_search(
                        dataset.id, query, limit, similarity_threshold
                    )
                elif search_mode == "keyword":
                    results = await self._keyword_search(
                        dataset.id, query, limit
                    )
                elif search_mode == "hybrid":
                    results = await self._hybrid_search(
                        dataset.id, query, limit, similarity_threshold
                    )
                else:
                    results = await self._semantic_search(
                        dataset.id, query, limit, similarity_threshold
                    )
                
                # Add dataset context to results
                for result in results:
                    result['dataset_id'] = str(dataset.id)
                    result['dataset_name'] = dataset.name
                
                all_results.extend(results)
                
            except Exception as e:
                logger.error(f"Error searching dataset {dataset.id}: {e}")
                continue
        
        # Sort by relevance score and return top results
        all_results.sort(key=lambda x: x.get('similarity_score', 0), reverse=True)
        return all_results[:limit]
    
    async def _semantic_search(
        self,
        dataset_id: UUID,
        query: str,
        limit: int,
        similarity_threshold: float
    ) -> List[Dict[str, Any]]:
        """Perform semantic search using vector embeddings."""
        
        try:
            # Generate embedding for the query
            query_embeddings = await self.embedding_service.generate_embeddings([query])
            query_embedding = query_embeddings[0]
            
            # Perform vector similarity search
            # Note: This is a simplified version - in production you'd use pgvector's operators
            # like <-> for cosine distance, <#> for negative inner product, etc.
            
            # For now, we'll do a basic search without vector operations
            # In production, this would use pgvector's similarity functions
            result = await self.db.execute(
                select(
                    Paragraph.id,
                    Paragraph.title,
                    Paragraph.content,
                    Paragraph.metadata,
                    Paragraph.hit_count,
                    Document.id.label("document_id"),
                    Document.name.label("document_name"),
                    # In production: Paragraph.embedding <-> query_embedding as similarity_score
                )
                .join(Document)
                .where(
                    and_(
                        Document.dataset_id == dataset_id,
                        Paragraph.is_active == True,
                        Document.is_active == True,
                        Paragraph.embedding.isnot(None)  # Only search vectorized paragraphs
                    )
                )
                .order_by(desc(Paragraph.hit_count))  # Fallback ordering
                .limit(limit)
            )
            
            paragraphs = result.fetchall()
            
            results = []
            for para in paragraphs:
                # Mock similarity score - in production, calculate from vector distance
                similarity_score = 0.8  # Placeholder
                
                if similarity_score >= similarity_threshold:
                    results.append({
                        "paragraph_id": str(para.id),
                        "document_id": str(para.document_id),
                        "title": para.title,
                        "content": para.content,
                        "similarity_score": similarity_score,
                        "metadata": para.metadata or {},
                        "document_name": para.document_name,
                        "hit_count": para.hit_count
                    })
                    
                    # Update hit count
                    await self._update_hit_count(para.id)
            
            return results
            
        except Exception as e:
            logger.error(f"Error in semantic search for dataset {dataset_id}: {e}")
            return []
    
    async def _keyword_search(
        self,
        dataset_id: UUID,
        query: str,
        limit: int
    ) -> List[Dict[str, Any]]:
        """Perform keyword-based full-text search."""
        
        try:
            # Use PostgreSQL full-text search
            # This is a simplified version - in production you'd use proper text search vectors
            
            search_terms = query.lower().split()
            search_pattern = ' & '.join(search_terms)
            
            result = await self.db.execute(
                select(
                    Paragraph.id,
                    Paragraph.title,
                    Paragraph.content,
                    Paragraph.metadata,
                    Paragraph.hit_count,
                    Document.id.label("document_id"),
                    Document.name.label("document_name"),
                )
                .join(Document)
                .where(
                    and_(
                        Document.dataset_id == dataset_id,
                        Paragraph.is_active == True,
                        Document.is_active == True,
                        # Simple keyword matching - in production use ts_vector & ts_query
                        Paragraph.content.ilike(f"%{query}%")
                    )
                )
                .order_by(desc(Paragraph.hit_count))
                .limit(limit)
            )
            
            paragraphs = result.fetchall()
            
            results = []
            for para in paragraphs:
                # Calculate simple keyword relevance score
                content_lower = para.content.lower()
                matches = sum(1 for term in search_terms if term in content_lower)
                relevance_score = matches / len(search_terms) if search_terms else 0
                
                results.append({
                    "paragraph_id": str(para.id),
                    "document_id": str(para.document_id),
                    "title": para.title,
                    "content": para.content,
                    "similarity_score": relevance_score,
                    "metadata": para.metadata or {},
                    "document_name": para.document_name,
                    "hit_count": para.hit_count,
                    "search_type": "keyword"
                })
                
                # Update hit count
                await self._update_hit_count(para.id)
            
            return results
            
        except Exception as e:
            logger.error(f"Error in keyword search for dataset {dataset_id}: {e}")
            return []
    
    async def _hybrid_search(
        self,
        dataset_id: UUID,
        query: str,
        limit: int,
        similarity_threshold: float
    ) -> List[Dict[str, Any]]:
        """Perform hybrid search combining semantic and keyword search."""
        
        # Get semantic results
        semantic_results = await self._semantic_search(
            dataset_id, query, limit * 2, similarity_threshold
        )
        
        # Get keyword results
        keyword_results = await self._keyword_search(
            dataset_id, query, limit * 2
        )
        
        # Combine and re-rank results
        combined_results = self._combine_search_results(
            semantic_results, keyword_results, 0.7, 0.3
        )
        
        return combined_results[:limit]
    
    def _combine_search_results(
        self,
        semantic_results: List[Dict[str, Any]],
        keyword_results: List[Dict[str, Any]],
        semantic_weight: float = 0.7,
        keyword_weight: float = 0.3
    ) -> List[Dict[str, Any]]:
        """Combine and re-rank semantic and keyword search results."""
        
        combined = {}
        
        # Add semantic results
        for result in semantic_results:
            para_id = result['paragraph_id']
            score = result['similarity_score'] * semantic_weight
            combined[para_id] = {
                **result,
                'combined_score': score,
                'semantic_score': result['similarity_score'],
                'keyword_score': 0.0
            }
        
        # Add keyword results
        for result in keyword_results:
            para_id = result['paragraph_id']
            score = result['similarity_score'] * keyword_weight
            
            if para_id in combined:
                combined[para_id]['combined_score'] += score
                combined[para_id]['keyword_score'] = result['similarity_score']
            else:
                combined[para_id] = {
                    **result,
                    'combined_score': score,
                    'semantic_score': 0.0,
                    'keyword_score': result['similarity_score']
                }
        
        # Sort by combined score
        sorted_results = sorted(
            combined.values(),
            key=lambda x: x['combined_score'],
            reverse=True
        )
        
        return sorted_results
    
    async def search_problems(
        self,
        dataset_id: UUID,
        query: str,
        limit: int = 5,
        similarity_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Search problems (questions) that are similar to the query."""
        
        try:
            # Generate embedding for the query
            query_embeddings = await self.embedding_service.generate_embeddings([query])
            query_embedding = query_embeddings[0]
            
            # Search problems with vector similarity
            # Note: Similar to paragraph search, this would use pgvector in production
            result = await self.db.execute(
                select(
                    Problem.id,
                    Problem.content,
                    Problem.hit_count,
                    Paragraph.id.label("paragraph_id"),
                    Paragraph.title.label("paragraph_title"),
                    Paragraph.content.label("paragraph_content"),
                    Document.id.label("document_id"),
                    Document.name.label("document_name"),
                )
                .join(Paragraph)
                .join(Document)
                .where(
                    and_(
                        Document.dataset_id == dataset_id,
                        Problem.is_active == True,
                        Problem.embedding.isnot(None)
                    )
                )
                .order_by(desc(Problem.hit_count))
                .limit(limit)
            )
            
            problems = result.fetchall()
            
            results = []
            for prob in problems:
                # Mock similarity score
                similarity_score = 0.75  # Placeholder
                
                if similarity_score >= similarity_threshold:
                    results.append({
                        "problem_id": str(prob.id),
                        "question": prob.content,
                        "paragraph_id": str(prob.paragraph_id),
                        "paragraph_title": prob.paragraph_title,
                        "paragraph_content": prob.paragraph_content,
                        "document_id": str(prob.document_id),
                        "document_name": prob.document_name,
                        "similarity_score": similarity_score,
                        "hit_count": prob.hit_count
                    })
                    
                    # Update problem hit count
                    await self._update_problem_hit_count(prob.id)
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching problems for dataset {dataset_id}: {e}")
            return []
    
    async def generate_augmented_response(
        self,
        query: str,
        context_documents: List[Dict[str, Any]],
        max_tokens: int = 1000,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """Generate AI response augmented with retrieved context."""
        
        # Build context string from retrieved documents
        context_text = ""
        sources = []
        
        for i, doc in enumerate(context_documents[:5]):  # Limit context
            context_text += f"\n--- Source {i+1} ---\n"
            context_text += f"Document: {doc.get('document_name', 'Unknown')}\n"
            if doc.get('title'):
                context_text += f"Section: {doc['title']}\n"
            context_text += f"Content: {doc['content'][:500]}...\n"  # Truncate long content
            
            sources.append({
                "document_id": doc.get('document_id'),
                "document_name": doc.get('document_name'),
                "paragraph_id": doc.get('paragraph_id'),
                "title": doc.get('title'),
                "similarity_score": doc.get('similarity_score', 0)
            })
        
        # Create augmented prompt
        augmented_prompt = f"""
Context information from knowledge base:
{context_text}

User question: {query}

Please provide a helpful answer based on the context information above. If the context doesn't contain relevant information, please say so.
"""
        
        # Mock AI response generation
        # In production, this would call actual LLM APIs
        response_content = f"Based on the provided context, here's what I found about '{query}':\n\nThis is a mock response that would normally be generated by an LLM using the retrieved context. The response would synthesize information from {len(context_documents)} relevant sources."
        
        return {
            "content": response_content,
            "sources": sources,
            "context_used": len(context_documents),
            "tokens": len(response_content.split()),
            "model": settings.DEFAULT_LLM_MODEL
        }
    
    async def _update_hit_count(self, paragraph_id: UUID) -> None:
        """Update hit count for a paragraph."""
        try:
            await self.db.execute(
                text("UPDATE paragraphs SET hit_count = hit_count + 1, last_hit_at = NOW() WHERE id = :id"),
                {"id": paragraph_id}
            )
            await self.db.commit()
        except Exception as e:
            logger.error(f"Error updating hit count for paragraph {paragraph_id}: {e}")
    
    async def _update_problem_hit_count(self, problem_id: UUID) -> None:
        """Update hit count for a problem."""
        try:
            await self.db.execute(
                text("UPDATE problems SET hit_count = hit_count + 1, last_hit_at = NOW() WHERE id = :id"),
                {"id": problem_id}
            )
            await self.db.commit()
        except Exception as e:
            logger.error(f"Error updating hit count for problem {problem_id}: {e}")
    
    async def get_search_analytics(
        self,
        dataset_id: UUID,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get search analytics for a dataset."""
        
        try:
            # Get most hit paragraphs
            most_hit_result = await self.db.execute(
                select(
                    Paragraph.id,
                    Paragraph.title,
                    Paragraph.content,
                    Paragraph.hit_count,
                    Document.name.label("document_name")
                )
                .join(Document)
                .where(Document.dataset_id == dataset_id)
                .order_by(desc(Paragraph.hit_count))
                .limit(10)
            )
            most_hit_paragraphs = [
                {
                    "paragraph_id": str(row.id),
                    "title": row.title,
                    "content": row.content[:200] + "..." if len(row.content) > 200 else row.content,
                    "hit_count": row.hit_count,
                    "document_name": row.document_name
                }
                for row in most_hit_result.fetchall()
            ]
            
            # Get total search statistics
            total_hits_result = await self.db.execute(
                select(func.sum(Paragraph.hit_count))
                .join(Document)
                .where(Document.dataset_id == dataset_id)
            )
            total_searches = total_hits_result.scalar() or 0
            
            return {
                "total_searches": total_searches,
                "most_retrieved_paragraphs": most_hit_paragraphs,
                "dataset_id": str(dataset_id),
                "period_days": days
            }
            
        except Exception as e:
            logger.error(f"Error getting search analytics for dataset {dataset_id}: {e}")
            return {
                "total_searches": 0,
                "most_retrieved_paragraphs": [],
                "dataset_id": str(dataset_id),
                "period_days": days
            } 