from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FolderBase(BaseModel):
    name: str
    desc: Optional[str] = None
    parent_id: Optional[int] = None
    workspace_id: Optional[str] = None

class FolderCreate(FolderBase):
    pass

class FolderUpdate(FolderBase):
    pass


class FolderInDBBase(FolderBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    children: Optional[list] = None

    class Config:
        orm_mode = True

class Folder(FolderInDBBase):
    pass
