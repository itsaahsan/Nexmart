from datetime import datetime, timedelta, timezone
from uuid import UUID

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.user import User
from settings import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# --- RBAC: roles & permissions ---
# Roles are hierarchical: admin > manager > support > customer.
# `is_admin` is kept for backward compatibility and mirrors role == "admin".
VALID_ROLES = ("customer", "support", "manager", "admin")

ROLE_PERMISSIONS: dict[str, set[str]] = {
    "customer": {"cart:write", "order:create", "order:read-own", "wishlist:write", "review:write"},
    "support": {"cart:write", "order:create", "order:read-own", "wishlist:write", "review:write", "order:read-all", "user:read"},
    "manager": {"cart:write", "order:create", "order:read-own", "wishlist:write", "review:write", "order:read-all", "order:update-status", "product:write", "category:write", "user:read"},
    "admin": {"*"},
}


def normalize_role(role: str | None) -> str:
    role = (role or "customer").lower().strip()
    return role if role in VALID_ROLES else "customer"


def user_role(user: User) -> str:
    # Prefer explicit role column; fall back to legacy is_admin flag.
    role = getattr(user, "role", None) or ("admin" if getattr(user, "is_admin", False) else "customer")
    return normalize_role(role)


def has_permission(user: User, permission: str) -> bool:
    role = user_role(user)
    perms = ROLE_PERMISSIONS.get(role, set())
    return "*" in perms or permission in perms


def require_role(*allowed_roles: str):
    allowed = {normalize_role(r) for r in allowed_roles}

    async def _dep(current_user: User = Depends(get_current_user)) -> User:
        if user_role(current_user) not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires role: {', '.join(sorted(allowed))}",
            )
        return current_user

    return _dep


def require_permission(*permissions: str):
    async def _dep(current_user: User = Depends(get_current_user)) -> User:
        missing = [p for p in permissions if not has_permission(current_user, p)]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing permissions: {', '.join(missing)}",
            )
        return current_user

    return _dep


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    # Carry role for stateless frontend guards (DB remains source of truth).
    if "role" not in to_encode:
        to_encode["role"] = "customer"
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id is None or token_type != "access":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user


async def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if user_role(current_user) != "admin" and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return current_user


# Convenience aliases for route protection
require_admin = require_role("admin")
require_manager = require_role("admin", "manager")
