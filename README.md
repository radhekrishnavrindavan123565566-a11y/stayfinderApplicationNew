# StayFinder — Rental Property Platform

A full-featured Airbnb-inspired rental platform built with Next.js 16, MongoDB, JWT auth, Stripe payments, and Framer Motion animations.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in values
cp .env.example .env.local

# 3. Seed the database (optional)
npx ts-node utils/seed.ts

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `.env.example` for all required variables.

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `CLOUDINARY_*` | Cloudinary credentials for image uploads |
| `STRIPE_SECRET_KEY` | Stripe secret key for payments |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |

## Seed Accounts

After running the seed script:

| Role | Email | Password |
|---|---|---|
| Admin | admin@stayfinder.com | admin123 |
| Owner | owner@stayfinder.com | owner123 |
| Tenant | tenant@stayfinder.com | tenant123 |

## Features

- JWT auth (access + refresh tokens)
- Role-based access (tenant / owner / admin)
- Property CRUD with image uploads (Cloudinary)
- Booking system with conflict detection
- Reviews & star ratings
- Wishlist / favorites
- Stripe payment integration
- Admin dashboard
- Framer Motion animations throughout
- Fully responsive mobile-first design

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS v4, Framer Motion
- **Backend**: Next.js API Routes, MongoDB + Mongoose
- **Auth**: JWT (bcryptjs)
- **Payments**: Stripe
- **Images**: Cloudinary
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **UI**: Lucide React, React Hot Toast
