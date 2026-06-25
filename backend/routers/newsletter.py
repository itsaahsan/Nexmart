from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.newsletter import Newsletter

router = APIRouter()


class SubscribeRequest(BaseModel):
    email: EmailStr


@router.post("/subscribe")
async def subscribe(data: SubscribeRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(Newsletter).where(Newsletter.email == data.email)
    )
    sub = existing.scalar_one_or_none()
    if sub:
        if sub.is_active:
            raise HTTPException(status_code=400, detail="Already subscribed")
        sub.is_active = True
        await db.flush()
        return {"message": "Resubscribed successfully"}

    newsletter = Newsletter(email=data.email)
    db.add(newsletter)
    await db.flush()
    return {"message": "Subscribed successfully"}


@router.post("/unsubscribe")
async def unsubscribe(data: SubscribeRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(Newsletter).where(Newsletter.email == data.email)
    )
    sub = existing.scalar_one_or_none()
    if not sub or not sub.is_active:
        raise HTTPException(status_code=404, detail="Email not subscribed")
    sub.is_active = False
    await db.flush()
    return {"message": "Unsubscribed successfully"}
