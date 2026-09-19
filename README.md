# Nexmart — Full-Stack E-Commerce Platform

A modern e-commerce platform built with React, FastAPI, and PostgreSQL.

## Live Demo

🔗 **Frontend**: https://nexmart-ecommerce-zeta.vercel.app
🔗 **Backend API**: https://nexmart-backend.vercel.app
📖 **API Docs (Swagger)**: https://nexmart-backend.vercel.app/docs
📋 **API Docs (ReDoc)**: https://nexmart-backend.vercel.app/redoc
💻 **Source Code**: https://github.com/itsaahsan/Nexmart

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Query |
| Backend | FastAPI, SQLAlchemy (async), Pydantic v2 |
| Database | PostgreSQL 15 (asyncpg pool: 20 + 30 overflow) |
| Cache | Redis, optional (pooled, 100 conns, 5m product TTL, 60s admin TTL, rate limiting; fails open without it) |
| Payments | Stripe (PaymentIntents + webhooks, demo fallback) |
| Image Upload | Cloudinary |
| Auth | JWT (access + refresh) + RBAC (customer/support/manager/admin) |

## Features

- 550-product catalog with search, filters, sorting, and stable pagination
- Shopping cart with database persistence
- JWT auth with refresh + role-based access control
- Checkout with real Stripe PaymentIntents and webhook-driven order updates
- Order history and tracking
- Wishlist and product comparison
- Admin analytics (revenue, AOV, orders by status, low stock, top products)
- Redis caching for products/categories/admin + per-IP rate limiting
- Responsive design
- Image error fallbacks
- Auto-clearing stale cart items

## Stripe webhooks

1. Set `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` (see `backend/.env.example`).
2. Expose backend publicly, then in Stripe Dashboard add endpoint:
   `https://<backend>/api/orders/webhook`
   Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `checkout.session.completed`.
3. Without keys the API runs in demo mode (`demo_mode: true`, `pi_demo_*`) and the same webhook route accepts unsigned demo events for local testing.
4. Flow: `POST /api/orders/create-payment-intent` (server-priced) -> Stripe confirm -> `POST /api/orders` with `payment_intent_id` -> webhook transitions `pending -> processing/cancelled`.

## Project Structure

```
Nexmart/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── api/       # Axios API clients
│   │   ├── components/ # Reusable UI components
│   │   ├── hooks/     # Custom React hooks
│   │   ├── pages/     # Page components
│   │   ├── store/     # Zustand state stores
│   │   ├── types/     # TypeScript types
│   │   └── utils/     # Utility functions
│   ├── public/
│   └── package.json
├── backend/           # FastAPI backend
│   ├── api/index.py   # Vercel serverless entrypoint (Mangum)
│   ├── models/        # SQLAlchemy models
│   ├── routers/       # API route handlers
│   ├── schemas/       # Pydantic schemas
│   ├── utils/         # Auth (JWT+RBAC), Stripe, Cloudinary utilities
│   ├── tests/         # Pytest test suite
│   ├── seed.py        # Deterministic 550-product seeder + healer
│   ├── settings.py    # Env-based config
│   ├── redis_client.py # Pooled Redis cache + rate limiter
│   └── requirements.txt
└── README.md
```

## Local Development

### Prerequisites

- Python 3.11+ (backend)
- Node.js 18+ (frontend)
- PostgreSQL 15+ — local instance **or** a hosted DB (e.g. Neon). Redis is optional (the API fails open without it, caching/rate-limiting just stays off).

### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill in DATABASE_URL, SECRET_KEY, Stripe keys
uvicorn main:app --reload --port 8000
```

Backend API: http://localhost:8000 — docs: http://localhost:8000/docs

The database seeds itself on startup (550 products across 5 categories; skips when already seeded).

### Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

Frontend: http://localhost:5173

### Running Tests

```bash
# Frontend
cd frontend && npm test

# Backend (needs Python env above; uses SQLite test DB)
cd backend && python -m pytest tests/ -v
```

### Stripe Webhooks Locally

```bash
stripe listen --forward-to localhost:8000/api/orders/webhook
# put the printed whsec_... value in backend/.env as STRIPE_WEBHOOK_SECRET
```

---

## Deployment on Vercel

### Backend

1. Import `itsaahsan/Nexmart` on Vercel
2. Set **Root Directory** to `backend`
3. Add environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (async format, e.g. Neon) |
| `SECRET_KEY` | Yes | JWT signing secret (min 32 chars) |
| `FRONTEND_URL` | Yes | `https://nexmart-ecommerce-zeta.vercel.app` |
| `ENVIRONMENT` | Yes | `production` |
| `REDIS_URL` | No | Redis URL for product caching + rate limiting (app runs without it) |
| `STRIPE_SECRET_KEY` | For real payments | Stripe secret key (without it: demo mode) |
| `STRIPE_PUBLISHABLE_KEY` | For real payments | Stripe publishable key (without it: demo mode) |
| `STRIPE_WEBHOOK_SECRET` | For real payments | Webhook signing secret (without it: unsigned demo events only) |
| `STRIPE_CURRENCY` | No | Currency code, default `usd` |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |

### Frontend

1. Import `itsaahsan/Nexmart` on Vercel
2. Set **Root Directory** to `frontend`
3. Set **Framework Preset** to `Vite`
4. Add environment variable:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | `https://nexmart-backend.vercel.app` |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check (DB + Redis status) |
| GET | `/api/products` | No | List products (paginated, filterable, stable ordering) |
| GET | `/api/products/featured` | No | Featured products |
| GET | `/api/products/search-suggestions` | No | Name autocomplete |
| GET | `/api/categories` | No | List categories |
| POST | `/api/auth/register` | No | Register user (always `customer` role) |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/refresh` | No | Refresh JWT |
| GET | `/api/auth/me` | Yes | Get current user (incl. role) |
| GET | `/api/cart` | Yes | Get cart |
| POST | `/api/cart/add` | Yes | Add to cart |
| PUT | `/api/cart/{product_id}` | Yes | Update quantity |
| DELETE | `/api/cart/{product_id}` | Yes | Remove item |
| DELETE | `/api/cart` | Yes | Clear cart |
| POST | `/api/cart/merge` | Yes | Merge guest cart on login |
| POST | `/api/orders/create-payment-intent` | Yes | Server-priced Stripe PaymentIntent |
| POST | `/api/orders` | Yes | Create order (verifies intent amount) |
| GET | `/api/orders` | Yes | List own orders |
| GET | `/api/orders/{order_id}` | Yes | Get single order |
| POST | `/api/orders/webhook` | No | Stripe webhook → order status updates |
| GET | `/api/orders/config` | No | Publishable key + currency + demo flag |
| POST | `/api/reviews` | Yes | Create review |
| GET | `/api/wishlist` | Yes | Get wishlist |
| POST | `/api/wishlist/{product_id}` | Yes | Add to wishlist |
| GET | `/api/wishlist/check/{product_id}` | Yes | Check if wishlisted |
| DELETE | `/api/wishlist/{product_id}` | Yes | Remove from wishlist |
| GET | `/api/admin/dashboard` | Admin | Revenue, AOV, status mix, low stock, top products |
| GET | `/api/admin/products` | Admin | Admin product list |
| GET | `/api/admin/users` | Admin | Admin user list |
| PUT | `/api/admin/users/{user_id}` | Admin | Set role (`customer`/`support`/`manager`/`admin`) |
| GET | `/api/admin/orders` | Admin | Admin order list |
| PUT | `/api/admin/orders/{order_id}/status` | Admin | Update order status |

## Roles & First Admin

Roles: `customer` (default on register) → `support` → `manager` → `admin`.
Enforced via `get_current_admin` / `require_role` / `require_permission` in
`backend/utils/auth.py`. To promote the first admin, run once against the DB:

```sql
UPDATE users SET role = 'admin', is_admin = TRUE WHERE email = 'you@example.com';
```

## Operational Notes

- **Seeding:** startup builds a deterministic 550-product catalog (37 curated +
  generated, one subject-verified image per product). Existing rows are
  reconciled by SKU; slugs, prices and ratings are never overwritten. A
  `seed_meta` version marker keeps steady-state cold starts to ~2 queries.
- **Schema updates:** `init_db()` runs `create_all()` plus additive migrations
  (e.g. `users.role`); destructive resets only run with `ENVIRONMENT=development`.
- **Redis:** optional. Without `REDIS_URL` the API serves everything from
  Postgres (verified working); with it, product/category/admin responses are
  cached and per-IP rate limiting is enforced.
- **Stripe:** without keys the API runs in demo mode (`demo_mode: true`,
  `pi_demo_*`); with test keys it creates real PaymentIntents and verifies
  amounts server-side. Card confirmation happens client-side with the returned
  `client_secret` (Stripe Elements integration is the remaining frontend item).

## License

MIT

## Author

**Amimul Ahsan** - [GitHub](https://github.com/itsaahsan)
