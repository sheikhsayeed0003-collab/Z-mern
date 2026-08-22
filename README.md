# IoT programmers — Daraz-style E-commerce

Single-store marketplace with **User** and **Admin** dashboards.

## Stack

- Frontend: Next.js + Tailwind CSS (`frontend/`)
- Backend: Node.js + Express (`backend/`)
- Database: MongoDB + Mongoose
- Auth: JWT
- Payments: Cash on Delivery + Stripe (optional)

## Setup

### 1. Database

- **Easy demo (default):** `USE_MEMORY_DB=true` in `backend/.env` — no Mongo install needed (data resets when the API restarts). Demo products/users seed automatically on startup.
- **Persistent:** set `USE_MEMORY_DB=false` and a real `MONGODB_URI` (local MongoDB or Atlas).

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/amer-ecommerce
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:3000
USE_MEMORY_DB=true
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

API: http://localhost:5000

Accounts (auto-seeded):

- Admin: `admin@amer.com` / `Admin123!`
- Buyer: `buyer@amer.com` / `Buyer123!`

Optional full reseed (real Mongo only): `npm run seed`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:3000

### 4. Stripe + Webhook

#### Local (test mode)

1. Set in `backend/.env`:
   - `STRIPE_SECRET_KEY` (`sk_test_...`)
   - `STRIPE_WEBHOOK_SECRET` (from Stripe CLI)
2. Set in `frontend/.env.local`:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_test_...`)
3. Keep API on port 5000, then:

```bash
cd backend
npm run stripe:listen
```

Forwards events to `http://localhost:5000/api/webhooks/stripe`.

#### Live / production (Vercel Services — one project)

Root `vercel.json` deploys `frontend/` (Next.js) + `backend/` (Express) together.
Public `/api/*` goes to Express; everything else goes to Next.js.

| Piece | Where | Required env |
|-------|--------|--------------|
| App | Vercel (Services preset) | See [LIVE.env.example](LIVE.env.example) |
| Database | MongoDB Atlas | `USE_MEMORY_DB=false`, `MONGODB_URI` |
| Stripe webhook | Dashboard Live mode | `https://YOUR_DOMAIN/api/webhooks/stripe` + `checkout.session.completed` |

Steps:
1. In Vercel: Framework = **Services**, connect this Git repo (root)
2. Add env vars from `LIVE.env.example` (leave `NEXT_PUBLIC_API_URL` unset)
3. Set live Stripe keys + webhook signing secret
4. Set `CLIENT_URL` to the Vercel site URL

Success page still confirms payment via `/api/orders/:id/confirm-stripe` if webhook is delayed.

## Features

- Home: slider, categories, flash sale, popular products
- Auth register/login (PRD fields)
- Cart + checkout (COD / Stripe + webhook)
- User dashboard: orders, profile, shipping addresses
- Admin panel: products, stock, categories, orders, users
