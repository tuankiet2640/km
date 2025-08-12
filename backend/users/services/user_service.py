from typing import Optional, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder

from backend.core.security import get_password_hash, verify_password
from backend.users.repositories.user_repository import UserRepository
from backend.users.models.user import User
from backend.users.schemas.user import UserCreate, UserUpdate

class UserService:
    def __init__(self, db: Session):
        self.repository = UserRepository(db)

    def get_user(self, user_id: int) -> Optional[User]:
        user = self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user

    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.repository.get_by_email(email)

    def get_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        return self.repository.get_all(skip=skip, limit=limit)

    def create_user(self, user_create: UserCreate) -> User:
        # Check if email exists
        if self.repository.get_by_email(user_create.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Check if username exists
        if self.repository.get_by_username(user_create.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )

        user = User(
            email=user_create.email,
            username=user_create.username,
            full_name=user_create.full_name,
            hashed_password=get_password_hash(user_create.password),
            is_active=True,
            is_superuser=False,
        )
        return self.repository.create(user)

    def update_user(self, user_id: int, user_update: UserUpdate) -> User:
        db_user = self.get_user(user_id)
        update_data = user_update.model_dump(exclude_unset=True)
        
        if update_data.get("password"):
            update_data["hashed_password"] = get_password_hash(update_data["password"])
            del update_data["password"]

        # Check email uniqueness if being updated
        if update_data.get("email") and update_data["email"] != db_user.email:
            if self.repository.get_by_email(update_data["email"]):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )

        # Check username uniqueness if being updated
        if update_data.get("username") and update_data["username"] != db_user.username:
            if self.repository.get_by_username(update_data["username"]):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )

        for field, value in update_data.items():
            setattr(db_user, field, value)
        
        return self.repository.update(db_user)

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        user = self.repository.get_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def delete_user(self, user_id: int) -> None:
        user = self.get_user(user_id)
        self.repository.delete(user)
