from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: str | None = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    avatar_url: str | None = None


class UserResponse(UserBase):
    id: UUID
    avatar_url: str | None = None
    is_admin: bool = False
    is_verified: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class ChangePassword(BaseModel):
    current_password: str
    new_password: str


class AdminUserUpdate(BaseModel):
    is_admin: bool | None = None
    is_verified: bool | None = None
