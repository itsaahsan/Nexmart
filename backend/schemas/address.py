from uuid import UUID

from pydantic import BaseModel


class AddressCreate(BaseModel):
    full_name: str
    phone: str
    address_line1: str
    address_line2: str | None = None
    city: str
    state: str
    postal_code: str
    country: str = "US"
    is_default: bool = False


class AddressUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    country: str | None = None
    is_default: bool | None = None


class AddressResponse(AddressCreate):
    id: UUID
    user_id: UUID

    class Config:
        from_attributes = True
