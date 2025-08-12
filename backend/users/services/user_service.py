from typing import Optional
from sqlalchemy.orm import Session

from backend.core.base.service import BaseService
from backend.core.security import get_password_hash, verify_password
from backend.core.exceptions import ValidationException, NotFoundException
from backend.users.repositories.user_repository import UserRepository
from backend.users.models.user import User
from backend.users.schemas.user import UserCreate, UserUpdate

class UserService(BaseService[User, UserCreate, UserUpdate]):
    def __init__(self, db: Session):
        self.repository = UserRepository(db)
        super().__init__(self.repository)

    def get_by_email(self, email: str) -> Optional[User]:
        return self.repository.get_by_email(email)

    def create(self, *, obj_in: UserCreate) -> User:
        # Check if email exists
        if self.repository.get_by_email(obj_in.email):
            raise ValidationException("Email already registered")
        
        # Check if username exists
        if self.repository.get_by_username(obj_in.username):
            raise ValidationException("Username already taken")

        user = User(
            email=obj_in.email,
            username=obj_in.username,
            full_name=obj_in.full_name,
            hashed_password=get_password_hash(obj_in.password),
            is_active=True,
            is_superuser=False,
        )
        return self.repository.create(obj_in=user)

    def update(self, *, id: int, obj_in: UserUpdate) -> User:
        db_user = self.get(id=id)
        update_data = obj_in.model_dump(exclude_unset=True)
        
        if update_data.get("password"):
            update_data["hashed_password"] = get_password_hash(update_data["password"])
            del update_data["password"]

        # Check email uniqueness if being updated
        if update_data.get("email") and update_data["email"] != db_user.email:
            if self.repository.get_by_email(update_data["email"]):
                raise ValidationException("Email already registered")

        # Check username uniqueness if being updated
        if update_data.get("username") and update_data["username"] != db_user.username:
            if self.repository.get_by_username(update_data["username"]):
                raise ValidationException("Username already taken")

        return super().update(id=id, obj_in=update_data)

    def authenticate(self, email: str, password: str) -> Optional[User]:
        user = self.repository.get_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
