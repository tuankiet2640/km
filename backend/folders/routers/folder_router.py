
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.folders.schemas.folder import Folder, FolderCreate, FolderUpdate
from backend.folders.services.folder_service import FolderService
from backend.core.database import get_db
from backend.users.dependencies.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[Folder])
def read_folders(skip: int = 0, limit: int = 100, workspace_id: Optional[str] = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    service = FolderService(db)
    return service.get_folders(owner_id=current_user.id, workspace_id=workspace_id, skip=skip, limit=limit)

@router.post("/", response_model=Folder, status_code=status.HTTP_201_CREATED)
def create_folder(folder_in: FolderCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    service = FolderService(db)
    try:
        return service.create_folder(folder_in, owner_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{folder_id}", response_model=Folder)
def read_folder(folder_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    service = FolderService(db)
    folder = service.get_folder(folder_id)
    if not folder or folder.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Folder not found")
    return folder

@router.put("/{folder_id}", response_model=Folder)
def update_folder(folder_id: int, folder_in: FolderUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    service = FolderService(db)
    folder = service.get_folder(folder_id)
    if not folder or folder.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Folder not found")
    try:
        return service.update_folder(folder_id, folder_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{folder_id}", response_model=Folder)
def delete_folder(folder_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    service = FolderService(db)
    folder = service.get_folder(folder_id)
    if not folder or folder.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Folder not found")
    return service.delete_folder(folder_id)

@router.get("/tree", response_model=List[Folder])
def get_folder_tree(workspace_id: Optional[str] = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    service = FolderService(db)
    return service.get_folder_tree(owner_id=current_user.id, workspace_id=workspace_id)
