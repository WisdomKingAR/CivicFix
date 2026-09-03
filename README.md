# 🏛️ CivicFix — Smart Civic Issue Reporting & Resolution Platform

> **Empowering citizens and municipal authorities with AI-driven clustering, intelligent priority scoring, and verifiable photo resolutions.**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-black.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-darkblue.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-336791.svg)](https://postgis.net/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-2.0_Flash-orange.svg)](https://ai.google.dev/)

---

## 📌 Problem Statement

Citizens frequently encounter urban civic issues — potholes, broken streetlights, overflowing trash bins, road fissures, and water pipeline leaks. However:
1. **Reporting is fragmented**: WhatsApp groups, manual phone calls, or cumbersome portals (e.g. CPGRAMS) lead to reports being overlooked.
2. **Authorities drown in duplicate complaints**: Multiple citizens report the same pothole, clogging the triage queue without an automated deduplication mechanism.
3. **Lack of intelligent prioritization**: Authorities struggle to identify which issues demand urgent intervention (e.g., a crater near a hospital versus a quiet residential alley).
4. **Resolution credibility gap**: Municipal staff self-declare issues as "fixed" with no visual verification or citizen confirmation loop.

---

## 💡 The CivicFix Solution

**CivicFix** bridges the gap between urban citizens and municipal workforces with an end-to-end, full-stack intelligence platform:

- ⚡ **60-Second Citizen Reporting**: Citizens take a photo with GPS location, pick a category, and submit.
- 🎯 **PostGIS Geospatial Deduplication**: Automatically groups incoming reports with open issues within **500 meters** of the same category.
- 🧠 **Multimodal AI Visual Similarity (Gemini 2.0 Flash)**: Compares complaint photos to prevent duplicates and evaluate before/after repair verification.
- 📊 **Intelligent Priority Scoring (1–100)**: Automatically prioritizes complaints using a realistic 4-factor model: Inherent Hazard Baseline (35%), Consensus Volume Log-Curve (25%), Proximity to Schools/Hospitals (25%), and Category SLA Breach Progression (15%).
- 🛡️ **Anti-Spam & Fraud Engine**: Detects burst submissions, duplicate image hashes, and high-frequency geo-spam.
- 🔍 **Closed-Loop Resolution Verification**: Requires an after-repair photo evaluated by Gemini Vision, backed by a citizen confirm/reject validation loop.
- 🗺️ **Clustered GeoJSON Map**: Generates clustered GeoJSON feeds for real-time visualization on interactive citizen and authority maps.

---

## 🏗️ Architecture & Technology Stack

CivicFix is designed around a **Feature-Based (Vertical Slice / Modular Domain)** architecture for high cohesion, rapid testability, and future microservice extraction:

```
CIVICFIX/
├── .gitignore
├── README.md
└── backend/
    ├── prisma/
    │   ├── schema.prisma        # PostgreSQL + PostGIS models & spatial extensions
    │   └── seed.ts              # Demo seeds (Citizen, Authority, Admin, Landmark locations)
    └── src/
        ├── app.ts               # Express assembly & global middleware pipeline
        ├── index.ts             # Fail-fast env validation & server bootstrapper
        │
        ├── core/                # Cross-cutting shared kernel
        │   ├── cache/           # Native in-memory TTL cache (replaces Redis)
        │   ├── config/          # Fail-fast env loader & validator
        │   ├── database/        # Singleton PrismaClient
        │   ├── external/        # Gemini 2.0 Flash & Cloudinary SDK clients
        │   ├── middleware/      # JWT auth, RBAC, tiered rate limiters, Zod validator, Multer
        │   ├── types/           # Global interfaces (APIResponse, APIError)
        │   └── utils/           # Response helpers & sha256 hashing
        │
        └── features/            # Domain vertical slices
            ├── auth/            # JWT access tokens + httpOnly SameSite=Strict refresh cookies
            ├── users/           # Profile management
            ├── complaints/      # Citizen complaint reporting, status history & confirmation
            ├── clustering/      # PostGIS ST_DWithin clustering & priority scoring algorithm
            ├── authority/       # Priority-ranked triage queue, officer assignment, resolution
            ├── map/             # Clustered GeoJSON FeatureCollection endpoint
            ├── ai/              # Multimodal Gemini image comparison & auto-categorization
            ├── upload/          # 5MB image buffer upload to Cloudinary CDN
            └── admin/           # KPI analytics, user role moderation, spam detection
```

### Core Technologies
- **Runtime & Language**: Node.js v20+, TypeScript 5.5, Express 4.19
- **Database & ORM**: PostgreSQL via Supabase with `postgis` & `pg_trgm` extensions, Prisma 5.22
- **Artificial Intelligence**: Google Gemini 2.0 Flash (`@google/generative-ai`)
- **Media Storage**: Cloudinary CDN with Multer memory buffer streaming
- **Caching**: High-performance in-memory TTL caching with automatic expired-key eviction
- **Security & Validation**: Helmet.js, CORS origin lockdown, bcrypt (saltRounds=10), JSON Web Tokens (JWT), Zod (with strict field validation), and tiered `express-rate-limit`

---

## 📐 Algorithmic Innovations

### 1. Dynamic Priority Score Formula (4-Factor Model)
Calculated dynamically whenever a complaint joins a cluster or an age milestone passes:

$$\text{Priority Score} = (\text{Hazard} \times 35) + (\text{Volume} \times 25) + (\text{Proximity} \times 25) + (\text{SLA Aging} \times 15)$$

- **$\text{Hazard Baseline}$ (35%)**: Inherent public safety impact by category:
  - `WATER_LEAKAGE`: $1.00$ (Critical infrastructure, contamination)
  - `POTHOLE`: $0.90$ (Vehicular/pedestrian accident risk)
  - `ROAD_DAMAGE`: $0.85$ (Structural road/barrier failure)
  - `STREETLIGHT`: $0.65$ (Night crime & visibility risk)
  - `GARBAGE`: $0.50$ (Sanitation & disease vector)
  - `OTHER`: $0.40$ (Default conservative baseline)
- **$\text{Volume / Consensus}$ (25%)**: Crowd consensus log curve: $\min\left(\frac{\log_2(N + 1)}{\log_2(11)},\ 1.0\right)$
- **$\text{Proximity Boost}$ (25%)**: $1.0$ (within 500m of hospital/school), $0.5$ (within 1km), $0.0$ (otherwise)
- **$\text{SLA Aging}$ (15%)**: Category-aware resolution turnaround SLA: $\min\left(\frac{\text{days\_open}}{\text{SLA\_DAYS[category]}},\ 1.0\right)$ (1 day for Water Leakage up to 7 days for Other)

### 2. Two-Tier Duplicate Clustering Pipeline
1. **Geospatial Proximity**: Queries open clusters of the same category within 500m using PostGIS:
   ```sql
   ST_DWithin(ST_MakePoint(lng, lat)::geography, ST_MakePoint(centroidLng, centroidLat)::geography, 500)
   ```
2. **Visual Similarity**: Compares candidate image to seed image using Gemini Vision. If similarity score $\ge 0.75$, the complaint joins the cluster; otherwise, it seeds a new cluster.

### 3. Anti-Spam Heuristics
Flags accounts as `UNDER_REVIEW` if any trigger fires:
- Exceeds 10 submissions in 1 hour
- Submits 3 or more complaints within 100m inside 10 minutes
- Re-uploads an identical image hash (SHA-256) within 24 hours

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ & npm
- PostgreSQL database with PostGIS enabled (e.g. Supabase)
- Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))
- Cloudinary Account ([Cloudinary](https://cloudinary.com/))

### 1. Clone the Repository
```bash
git clone https://github.com/WisdomKingAR/CivicFix.git
cd CivicFix/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Secrets
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Database (Supabase PostgreSQL with PostGIS)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# AI & Storage
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Setup Database & Seed Initial Data
```bash
# Enable PostGIS in your database SQL Editor:
# CREATE EXTENSION IF NOT EXISTS postgis;
# CREATE EXTENSION IF NOT EXISTS pg_trgm;

# Generate Prisma Client
npx prisma generate

# Apply Migrations
npx prisma migrate dev --name init

# Seed Test Data
npm run prisma:seed
```

### 5. Launch Development Server
```bash
npm run dev
```

Server boots on `http://localhost:3001` with active health monitoring at `http://localhost:3001/health`.

---

## 🔑 Demo Credentials

Seeded automatically by `prisma/seed.ts`:

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Citizen** | `citizen@civicfix.com` | `HackDemo@2025` | Submit complaints, view own issues, confirm/reject resolutions |
| **Authority Officer** | `authority@civicfix.com` | `HackAuth@2025` | View priority queue, assign workers, upload repair photos |
| **Admin** | `admin@civicfix.com` | `HackAdmin@2025` | System-wide analytics, user role moderation, spam reports |

---

## 📡 API Endpoints Overview

All responses return standard envelopes:
- **Success**: `{ "success": true, "data": T, "message": string }`
- **Error**: `{ "success": false, "error": string, "code": string }`

### Authentication (`/api/auth`)
- `POST /register` — Register account (Rate limit: 30/hr)
- `POST /login` — Login user, sets httpOnly refresh cookie (Rate limit: 50/15min, `skipSuccessfulRequests: true`, composite IP+email key, `trust proxy: 1` enabled)
- `POST /refresh` — Refresh access token via cookie
- `DELETE /logout` — Invalidate session and clear cookie

### User Profile (`/api/user`)
- `GET /me` — Current user profile
- `PUT /profile` — Update name and phone number

### Citizen Complaints (`/api/complaints`)
- `POST /` — Submit complaint with photo & GPS (Rate limit: 30/hr)
- `GET /` — Get citizen's own complaints (paginated)
- `GET /:id` — Get single complaint detail with history
- `PUT /:id/confirm-resolution` — Confirm or reject repair resolution

### Authority Triage (`/api/authority`)
- `GET /queue` — Priority-sorted complaint queue (filters by category, status, ward)
- `PUT /complaints/:id/status` — Update complaint status
- `POST /complaints/:id/assign` — Assign complaint to field staff
- `POST /complaints/:id/resolve` — Submit after-repair photo and trigger AI verification

### Clustering & Maps (`/api/clusters`, `/api/map`)
- `GET /api/clusters` — List all open complaint clusters with priority scores
- `GET /api/clusters/:id` — View cluster detail with member complaints
- `GET /api/map/complaints` — Clustered GeoJSON FeatureCollection (cached 60s, Mumbai centered)

### Multimodal AI & Storage (`/api/ai`, `/api/upload`)
- `GET /api/ai/health` — Gemini API connectivity and model status probe
- `POST /api/upload` — Upload image file (max 5MB) to Cloudinary
- `POST /api/ai/compare-images` — Manual before/after repair comparison tool

### Admin & Ratna Rewards (`/api/admin`, `/api/ratna`)
- `GET /users` — List all accounts with complaint counts and flag status
- `PATCH /users/:id` — Update user roles or flag/unflag accounts
- `GET /analytics` — Resolution rates, category distribution, average priority score
- `GET /spam` — View flagged accounts with spam detection logs
- `GET /api/ratna/ledger` — Citizen Ratna civic points ledger & redemption coupons

---

## 🔒 Security Hardening

- **OWASP Compliance**: Parameterized SQL queries via Prisma ORM block injection attacks.
- **Reverse-Proxy Aware Rate Limiting**: `app.set('trust proxy', 1)` correctly parses real client IPs behind cloud load balancers (Render, Vercel, AWS ALB).
- **Graceful Rate Limiting**: All public endpoints enforce sensible rate limits with `skipSuccessfulRequests: true` and composite `IP + email` keys, preventing one user's failed attempts from locking out other systems or legitimate logins. Returns standard JSON `429` with `Retry-After` headers.
- **Strict Schema Filtering**: All mutating payloads are validated with Zod `.strict()` to reject unauthorized or rogue injected fields.
- **Token Hygiene**: Short-lived (15m) access tokens live in memory; long-lived (7d) refresh tokens are sealed in `httpOnly`, `SameSite=Strict` cookies.
- **Zero Secrets in Code**: Environment validator verifies all required credentials fail-fast at boot time; `.env` is permanently excluded from Git.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
