from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address

from settings import settings
from database import init_db
from redis_client import redis_client

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Nexmart API", version="1.0.0")
app.state.limiter = limiter

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_origin_regex=r"https://.*\.onrender\.com$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )

from routers import auth, products, categories, cart, orders, reviews, wishlist, addresses, admin, newsletter

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(cart.router, prefix="/api/cart", tags=["Cart"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["Reviews"])
app.include_router(wishlist.router, prefix="/api/wishlist", tags=["Wishlist"])
app.include_router(addresses.router, prefix="/api/addresses", tags=["Addresses"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(newsletter.router, prefix="/api/newsletter", tags=["Newsletter"])


@app.on_event("startup")
async def startup():
    await init_db()
    try:
        from seed import seed
        await seed()
    except Exception as e:
        print(f"Seed skipped: {e}")


@app.on_event("shutdown")
async def shutdown():
    await redis_client.aclose()


@app.get("/api/health")
async def health():
    return {"status": "ok"}
