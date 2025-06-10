"""
User management endpoints.
"""

from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_users():
    """List all users."""
    return {"message": "Users endpoint - to be implemented"} 