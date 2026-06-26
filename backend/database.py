import asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

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

    parsed = urlparse(url)
    params = parse_qs(parsed.query, keep_blank_values=True)

    if "sslmode" in params:
        del params["sslmode"]
    if "ssl" not in params:
        hostname = (parsed.hostname or "").lower()
        if "neon.tech" in hostname or "render.com" in hostname:
            params["ssl"] = ["require"]

    url = urlunparse(parsed._replace(query=urlencode(params, doseq=True)))
    return url


engine = create_async_engine(
    _normalize_database_url(settings.DATABASE_URL),
    echo=False,
    pool_pre_ping=True,
)
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


async def init_db(max_retries=5, delay=5):
    for attempt in range(1, max_retries + 1):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            print("Database connected successfully")
            return
        except Exception as e:
            err_str = str(e).lower()
            if "incompatible types" in err_str or "does not exist" in err_str:
                print("Schema conflict detected, recreating all tables...")
                try:
                    from sqlalchemy import text
                    async with engine.begin() as conn:
                        await conn.execute(text("DROP SCHEMA public CASCADE"))
                        await conn.execute(text("CREATE SCHEMA public"))
                        await conn.execute(text("GRANT ALL ON SCHEMA public TO neondb_owner"))
                        await conn.execute(text("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO neondb_owner"))
                    async with engine.begin() as conn:
                        await conn.run_sync(Base.metadata.create_all)
                    print("Schema recreated successfully")
                    return
                except Exception as e2:
                    print(f"Schema recreation failed: {e2}")
            print(f"Database connection attempt {attempt}/{max_retries} failed: {e}")
            if attempt < max_retries:
                await asyncio.sleep(delay * attempt)
            else:
                raise
