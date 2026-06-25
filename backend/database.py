from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from settings import settings


def _normalize_database_url(url: str) -> str:
    if url.startswith("http://"):
        url = "postgresql://" + url[len("http://"):]
    elif url.startswith("https://"):
        url = "postgresql://" + url[len("https://"):]
    elif url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    if "+" not in url.split("://")[0]:
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


engine = create_async_engine(_normalize_database_url(settings.DATABASE_URL), echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
