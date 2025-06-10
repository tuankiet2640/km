"""
Document management endpoints.
"""

from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_documents():
    """List all documents."""
    return {"message": "Documents endpoint - to be implemented"} 