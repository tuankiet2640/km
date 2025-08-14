from sqlalchemy.orm import Session
from backend.folders.repositories.folder_repository import FolderRepository
from backend.folders.schemas.folder import FolderCreate, FolderUpdate
from backend.folders.models.folder import Folder


class FolderService:
    FOLDER_DEPTH = 2  # max 3 levels

    def __init__(self, db: Session):
        self.repo = FolderRepository(db)

    def get_folder(self, folder_id: int):
        return self.repo.get(folder_id)

    def get_folders(self, owner_id: int, workspace_id: str = None, skip: int = 0, limit: int = 100):
        return self.repo.get_multi(owner_id, workspace_id, skip, limit)

    def create_folder(self, folder_in: FolderCreate, owner_id: int):
        # Depth check
        depth = 1
        parent_id = folder_in.parent_id
        current_parent_id = parent_id
        while current_parent_id:
            parent = self.repo.get(current_parent_id)
            if not parent:
                break
            depth += 1
            current_parent_id = parent.parent_id
        if depth > self.FOLDER_DEPTH + 1:
            raise ValueError("Folder depth cannot exceed 3 levels")
        return self.repo.create(folder_in, owner_id)

    def update_folder(self, folder_id: int, folder_in: FolderUpdate):
        folder = self.repo.get(folder_id)
        if folder:
            return self.repo.update(folder, folder_in)
        return None

    def delete_folder(self, folder_id: int):
        return self.repo.remove(folder_id)

    def get_folder_tree(self, owner_id: int, workspace_id: str = None):
        # Simple tree retrieval (adjacency list)
        folders = self.get_folders(owner_id, workspace_id)
        folder_dict = {f.id: f for f in folders}
        tree = []
        for folder in folders:
            if folder.parent_id and folder.parent_id in folder_dict:
                parent = folder_dict[folder.parent_id]
                if not hasattr(parent, "children"):
                    parent.children = []
                parent.children.append(folder)
            else:
                tree.append(folder)
        return tree
