# Nexmart — Full-Stack E-Commerce Platform

A modern e-commerce platform built with React, FastAPI, PostgreSQL, and Redis.

## Live Demo

- **App**: https://nexmart-app.vercel.app
- **API**: https://nexmart-backend.vercel.app
- **API Docs**: https://nexmart-backend.vercel.app/docs

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Query |
| Backend | FastAPI, SQLAlchemy (async), Pydantic v2 |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Payments | Stripe (test mode) |
| Image Upload | Cloudinary |
| Auth | JWT (access + refresh tokens) |

## Why These Choices

- **FastAPI with async SQLAlchemy** instead of sync Django/Flask — e-commerce endpoints like product search and cart operations benefit from non-blocking I/O under concurrent load, and Pydantic v2 gives strict request/response validation for free.
- **Zustand over Redux** for frontend state — cart and wishlist state is relatively simple and localized; Zustand avoids the boilerplate of Redux for a state shape that doesn't need time-travel debugging or complex middleware.
- **Redis as a cache layer** — sits in front of frequently-read, rarely-changed data (product listings, categories) to reduce database load, while PostgreSQL stays the source of truth for orders and inventory.
- **Docker Compose for local dev, Vercel for production** — mirrors a realistic production setup where frontend and backend scale independently, rather than a monolithic deployment.

## Features

- Product browsing with search, filters, and sorting
- Shopping cart with localStorage persistence
- User authentication (register / login / JWT)
- Checkout with Stripe integration
- Order history and tracking
- Wishlist and product comparison
- Admin dashboard (products, orders, users, categories)
- Responsive design
- Image error fallbacks
- Auto-clearing stale cart items

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
│   ├── models/        # SQLAlchemy models
│   ├── routers/       # API route handlers
│   ├── schemas/       # Pydantic schemas
│   ├── utils/         # Auth, Cloudinary, Stripe utilities
│   ├── tests/         # Pytest test suite
│   ├── seed.py        # Database seeder
│   └── requirements.txt
├── docker-compose.yml
└── README.md
```

## Local Development

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for frontend only)

### Quick Start

```bash
git clone https://github.com/itsaahsan/Nexmart.git
cd Nexmart
docker compose up -d
```

Frontend: http://localhost:5173
Backend API: http://localhost:8000
API Docs: http://localhost:8000/docs

### Running Tests

```bash
# Frontend (43 tests)
cd frontend && npm test

# Backend (25 tests) — inside Docker container
docker exec nexmart-backend-1 python -m pytest tests/ -v
```

---

## Deployment Guide

### Deploy on Vercel

#### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/itsaahsan/Nexmart.git
git push -u origin main
```

#### Step 2: Deploy Backend

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repo `itsaahsan/Nexmart`
4. Settings:
   - **Root Directory:** `backend`
   - **Framework Preset:** Other
5. Under **Environment Variables**, add:

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Your PostgreSQL connection string (async format) |
   | `SECRET_KEY` | Generate a random 32+ char string |
   | `FRONTEND_URL` | `https://nexmart-app.vercel.app` |
   | `ENVIRONMENT` | `production` |
   | `STRIPE_SECRET_KEY` | Your Stripe secret key (optional) |
   | `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name (optional) |
   | `CLOUDINARY_API_KEY` | Your Cloudinary API key (optional) |
   | `CLOUDINARY_API_SECRET` | Your Cloudinary API secret (optional) |

6. Click **Deploy**
7. Your backend URL will be: `https://nexmart-backend.vercel.app`

#### Step 3: Deploy Frontend

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repo `itsaahsan/Nexmart`
4. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
5. Under **Environment Variables**, add:

   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | `https://nexmart-backend.vercel.app` |

6. Click **Deploy**
7. Your frontend URL will be: `https://nexmart-app.vercel.app`

#### Step 4: Create Admin User

After backend deploys, register an admin account via `POST /api/auth/register` with your own email and a strong password, then use a database client to grant admin rights:

```sql
UPDATE users SET is_admin=true WHERE email='<your-email>';
```

---

### Environment Variables Reference

#### Backend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (async format) |
| `SECRET_KEY` | Yes | JWT signing secret (min 32 chars) |
| `FRONTEND_URL` | Yes | Frontend URL for CORS |
| `ENVIRONMENT` | Yes | Set to `production` |
| `REDIS_URL` | No | Redis URL for caching (optional) |
| `STRIPE_SECRET_KEY` | No | Stripe secret key for payments |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |

#### Frontend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL (no trailing slash) |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| GET | `/api/products` | No | List products (paginated, filterable) |
| GET | `/api/products/featured` | No | Featured products |
| GET | `/api/products/search-suggestions?q=` | No | Search autocomplete |
| GET | `/api/categories` | No | List categories |
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/refresh` | No | Refresh JWT |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/cart` | Yes | Get cart |
| POST | `/api/cart/add` | Yes | Add to cart |
| POST | `/api/orders` | Yes | Create order |
| GET | `/api/orders` | Yes | List orders |
| POST | `/api/reviews` | Yes | Create review |
| GET | `/api/wishlist` | Yes | Get wishlist |
| POST | `/api/admin/dashboard` | Admin | Dashboard stats |
| GET | `/api/admin/products` | Admin | Admin product list |
| GET | `/api/admin/users` | Admin | Admin user list |
| GET | `/api/admin/orders` | Admin | Admin order list |

## License

MIT

## Author

**Amimul Ahsan** - [GitHub](https://github.com/itsaahsan)
