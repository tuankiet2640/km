from typing import Generic, List, Optional, Type, TypeVar, Union, Dict, Any
from pydantic import BaseModel
from fastapi import HTTPException, status
from backend.core.base.repository import BaseRepository

ModelType = TypeVar("ModelType")
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class BaseService(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(
        self,
        repository: BaseRepository[ModelType, CreateSchemaType, UpdateSchemaType]
    ):
        self.repository = repository

    def get(self, id: Any) -> Optional[ModelType]:
        obj = self.repository.get(id=id)
        if not obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{self.repository.model.__name__} not found"
            )
        return obj

    def get_multi(
        self, *, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        return self.repository.get_multi(skip=skip, limit=limit)

    def create(self, *, obj_in: CreateSchemaType) -> ModelType:
        return self.repository.create(obj_in=obj_in)

    def update(
        self,
        *,
        id: Any,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        db_obj = self.get(id=id)
        return self.repository.update(db_obj=db_obj, obj_in=obj_in)

    def delete(self, *, id: int) -> ModelType:
        return self.repository.delete(id=id)
