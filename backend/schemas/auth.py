from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class AuthLogin(BaseModel):
    email: str
    password: str


class AuthRegister(BaseModel):
    email: str
    password: str
    full_name: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
