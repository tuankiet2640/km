from typing import List
from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from backend.core.config import settings
from backend.core.security import create_access_token
from backend.core.exceptions import AuthenticationException
from backend.users.dependencies.auth import (
    get_current_active_user,
    get_current_active_superuser,
    get_user_service
)
from backend.users.schemas.user import (
    User,
    UserCreate,
    UserUpdate,
    UserResponse,
    Token
)
from backend.users.services.user_service import UserService

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    user_service: UserService = Depends(get_user_service)
):
    user = user_service.authenticate(form_data.username, form_data.password)
    if not user:
        raise AuthenticationException("Incorrect email or password")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("", response_model=UserResponse)
def create_user(
    user_in: UserCreate,
    user_service: UserService = Depends(get_user_service)
):
    return user_service.create(obj_in=user_in)

@router.get("/me", response_model=UserResponse)
def read_user_me(
    current_user: User = Depends(get_current_active_user)
):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_user_me(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    user_service: UserService = Depends(get_user_service)
):
    return user_service.update(id=current_user.id, obj_in=user_in)

@router.get("", response_model=List[UserResponse])
def read_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_superuser),
    user_service: UserService = Depends(get_user_service)
):
    return user_service.get_multi(skip=skip, limit=limit)

@router.get("/{user_id}", response_model=UserResponse)
def read_user(
    user_id: int,
    current_user: User = Depends(get_current_active_superuser),
    user_service: UserService = Depends(get_user_service)
):
    return user_service.get(id=user_id)

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    current_user: User = Depends(get_current_active_superuser),
    user_service: UserService = Depends(get_user_service)
):
    return user_service.update(id=user_id, obj_in=user_in)

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_active_superuser),
    user_service: UserService = Depends(get_user_service)
):
    user_service.delete(id=user_id)
    return {"message": "User deleted successfully"}
