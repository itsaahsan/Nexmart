# Nexmart — Full-Stack E-Commerce Platform

A modern e-commerce platform built with React, FastAPI, PostgreSQL, and Redis.

## Live Demo

- **App**: https://nexmart-zhml.onrender.com

> Hosted on Render's free tier — the first request after inactivity may take a few seconds to spin up.

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
- **Docker Compose for local dev, split hosts for production** (Render for backend/DB, Vercel for frontend) — mirrors a realistic production setup where frontend and backend scale independently, rather than a monolithic deployment.

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

### Part 1: Deploy Backend + Database on Render

#### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/itsaahsan/Nexmart.git
git push -u origin main
```

#### Step 2: Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **PostgreSQL**
3. Settings:
   - **Name:** `nexmart-db`
   - **Database:** `nexmart`
   - **User:** `nexmart`
   - **Region:** Oregon (US West)
   - **Plan:** Free
4. Click **Create Database**
5. Copy the **Internal Database URL** — it looks like:
   ```
   postgresql://nexmart:abc123@dpg-xxx.oregon-postgres.render.com/nexmart
   ```
6. Convert it to async format by adding `+asyncpg` after `postgresql`:
   ```
   postgresql+asyncpg://nexmart:abc123@dpg-xxx.oregon-postgres.render.com/nexmart
   ```

#### Step 3: Deploy Backend Web Service on Render

1. Click **New** → **Web Service**
2. Connect your GitHub repo `itsaahsan/Nexmart`
3. Settings:
   - **Name:** `nexmart-backend`
   - **Region:** Oregon (US West)
   - **Branch:** `main`
   - **Runtime:** Docker
   - **Dockerfile Path:** `./backend/Dockerfile`
   - **Plan:** Free
4. Under **Environment Variables**, add:

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | `postgresql+asyncpg://nexmart:<password>@<host>/nexmart` (from Step 2) |
   | `SECRET_KEY` | Generate a random 32+ char string |
   | `FRONTEND_URL` | `https://<your-vercel-app>.vercel.app` (add after Vercel deploy) |
   | `ENVIRONMENT` | `production` |
   | `STRIPE_SECRET_KEY` | Your Stripe test secret key (optional) |
   | `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name (optional) |
   | `CLOUDINARY_API_KEY` | Your Cloudinary API key (optional) |
   | `CLOUDINARY_API_SECRET` | Your Cloudinary API secret (optional) |

5. Click **Create Web Service**
6. Render will build and deploy automatically
7. Your backend URL will be something like: `https://nexmart-backend.onrender.com`
8. **Seed the database** — after deployment, go to the Logs tab and check for "Database seeded successfully." If the seed didn't run automatically, use the register endpoint to create your own admin account (see Step 4) rather than a shared default one.

#### Step 4: Create Admin User

After backend deploys, register an admin account via `POST /api/auth/register` with your own email and a strong password (not a published default), then use the Render Shell or a database client to grant admin rights:

```sql
UPDATE users SET is_admin=true WHERE email='<your-email>';
```

---

### Part 2: Deploy Frontend on Vercel

#### Step 1: Create `vercel.json`

This file is already included in the project root. It tells Vercel to:
- Build the frontend with Vite
- Route all paths to `index.html` for client-side routing

#### Step 2: Deploy on Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repo `itsaahsan/Nexmart`
4. Settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Under **Environment Variables**, add:

   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | `https://nexmart-backend.onrender.com` |

6. Click **Deploy**
7. Your frontend URL will be: `https://nexmart.vercel.app` (or similar)

#### Step 3: Update Backend CORS

Go back to Render and update the `FRONTEND_URL` environment variable with your actual Vercel URL:

```
FRONTEND_URL=https://nexmart.vercel.app
```

Render will auto-redeploy.

---

### Environment Variables Reference

#### Backend (Render)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (async format) |
| `SECRET_KEY` | Yes | JWT signing secret (min 32 chars) |
| `FRONTEND_URL` | Yes | Frontend URL for CORS |
| `ENVIRONMENT` | Yes | Set to `production` |
| `REDIS_URL` | No | Redis URL (not needed on Render free tier) |
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
