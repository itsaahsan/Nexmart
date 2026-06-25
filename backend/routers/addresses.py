from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.address import Address
from models.user import User
from schemas.address import AddressCreate, AddressResponse, AddressUpdate
from utils.auth import get_current_user

router = APIRouter()


@router.get("", response_model=list[AddressResponse])
async def list_addresses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Address).where(Address.user_id == current_user.id)
    )
    addresses = result.scalars().all()
    return [AddressResponse.model_validate(a) for a in addresses]


@router.post("", response_model=AddressResponse, status_code=201)
async def create_address(
    data: AddressCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.is_default:
        await db.execute(
            update(Address)
            .where(Address.user_id == current_user.id, Address.is_default == True)
            .values(is_default=False)
        )

    address = Address(user_id=current_user.id, **data.model_dump())
    db.add(address)
    await db.flush()
    return AddressResponse.model_validate(address)


@router.put("/{address_id}", response_model=AddressResponse)
async def update_address(
    address_id: str,
    data: AddressUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    import uuid
    try:
        aid = uuid.UUID(address_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid address ID")

    result = await db.execute(
        select(Address).where(Address.id == aid, Address.user_id == current_user.id)
    )
    address = result.scalar_one_or_none()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    update_data = data.model_dump(exclude_unset=True)

    if update_data.get("is_default"):
        await db.execute(
            update(Address)
            .where(Address.user_id == current_user.id, Address.is_default == True)
            .values(is_default=False)
        )

    for key, value in update_data.items():
        setattr(address, key, value)

    await db.flush()
    return AddressResponse.model_validate(address)


@router.delete("/{address_id}")
async def delete_address(
    address_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    import uuid
    try:
        aid = uuid.UUID(address_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid address ID")

    result = await db.execute(
        select(Address).where(Address.id == aid, Address.user_id == current_user.id)
    )
    address = result.scalar_one_or_none()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    await db.delete(address)
    await db.flush()
    return {"message": "Address deleted"}


@router.post("/{address_id}/set-default")
async def set_default_address(
    address_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    import uuid
    try:
        aid = uuid.UUID(address_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid address ID")

    result = await db.execute(
        select(Address).where(Address.id == aid, Address.user_id == current_user.id)
    )
    address = result.scalar_one_or_none()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    await db.execute(
        update(Address)
        .where(Address.user_id == current_user.id, Address.is_default == True)
        .values(is_default=False)
    )
    address.is_default = True
    await db.flush()
    return {"message": "Default address set"}
