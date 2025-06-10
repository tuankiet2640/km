"""
Application management endpoints.
"""

from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_applications():
    """List all applications."""
    return {"message": "Applications endpoint - to be implemented"} 