# Nexmart — Full-Stack E-Commerce Platform

A modern e-commerce platform built with React, FastAPI, PostgreSQL.

## Live Demo

- **App**: https://nexmart-ecommerce.vercel.app
- **API**: https://nexmart-backend.vercel.app
- **API Docs**: https://nexmart-backend.vercel.app/docs

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Query |
| Backend | FastAPI, SQLAlchemy (async), Pydantic v2 |
| Database | PostgreSQL 15 |
| Payments | Stripe (test mode) |
| Image Upload | Cloudinary |
| Auth | JWT (access + refresh tokens) |

## Features

- Product browsing with search, filters, and sorting
- Shopping cart with database persistence
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
# Frontend
cd frontend && npm test

# Backend
docker exec nexmart-backend-1 python -m pytest tests/ -v
```

---

## Deployment on Vercel

### Backend

1. Import `itsaahsan/Nexmart` on Vercel
2. Set **Root Directory** to `backend`
3. Add environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (async format) |
| `SECRET_KEY` | Yes | JWT signing secret (min 32 chars) |
| `FRONTEND_URL` | Yes | `https://nexmart-ecommerce.vercel.app` |
| `ENVIRONMENT` | Yes | `production` |
| `STRIPE_SECRET_KEY` | No | Stripe secret key for payments |
| `STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key |
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
| GET | `/api/health` | No | Health check |
| GET | `/api/products` | No | List products (paginated, filterable) |
| GET | `/api/products/featured` | No | Featured products |
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
