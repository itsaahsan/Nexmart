import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from database import Base
from models import *

async def setup():
    engine = create_async_engine("postgresql+asyncpg://postgres:1@localhost:5432/nexmart")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created!")
    await engine.dispose()

asyncio.run(setup())
