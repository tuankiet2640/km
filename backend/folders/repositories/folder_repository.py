from sqlalchemy.orm import Session
from backend.folders.models.folder import Folder
from backend.folders.schemas.folder import FolderCreate, FolderUpdate

class FolderRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, folder_id: int):
        return self.db.query(Folder).filter(Folder.id == folder_id).first()


    def get_multi(self, owner_id: int, workspace_id: str = None, skip: int = 0, limit: int = 100):
        query = self.db.query(Folder).filter(Folder.owner_id == owner_id)
        if workspace_id:
            query = query.filter(Folder.workspace_id == workspace_id)
        return query.offset(skip).limit(limit).all()


    def create(self, folder_in: FolderCreate, owner_id: int):
        # Unique name validation within parent/workspace
        exists = self.db.query(Folder).filter(
            Folder.name == folder_in.name,
            Folder.parent_id == folder_in.parent_id,
            Folder.workspace_id == folder_in.workspace_id
        ).first()
        if exists:
            raise ValueError("Folder name already exists in this parent/workspace")
        folder = Folder(**folder_in.dict(), owner_id=owner_id)
        self.db.add(folder)
        self.db.commit()
        self.db.refresh(folder)
        return folder

    def update(self, folder: Folder, folder_in: FolderUpdate):
        for field, value in folder_in.dict(exclude_unset=True).items():
            setattr(folder, field, value)
        self.db.commit()
        self.db.refresh(folder)
        return folder

    def remove(self, folder_id: int):
        folder = self.get(folder_id)
        if folder:
            self.db.delete(folder)
            self.db.commit()
        return folder
