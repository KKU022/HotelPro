# HotelPro — Boutique Sanctuary Booking & Hospitality Management System

A full-stack, editorial luxury hotel reservation and property management platform built for modern boutique hospitality. Features persistent MongoDB storage, robust reservation concurrency protection, role-based access control (RBAC), and an editorial, dark-aesthetic user experience inspired by Nordic slow-living architecture.

---

## 🇮🇳 India-First Localization & International Destinations

HotelPro is architected as an **India-first luxury hospitality platform** with full extensible support for international destination properties:

### 1. Default Market & Geographic Focus
- **Default Country**: India (`IN`).
- **Featured Regional Anchor**: **Indore, Madhya Pradesh**, featuring the flagship *Ahilya Heritage Courtyard Suite* as the hero sanctuary.
- **Indian Destinations**: Indore (MP), Ujjain (MP), Bhopal (MP), Manali (HP), Udaipur (RJ), Goa, and Kochi (KL).
- **International Destinations**: Dubai (United Arab Emirates), Paris (France), London (United Kingdom), and Bali (Indonesia).

### 2. Currency Handling & Financial Integrity
- **Default Display Currency**: Indian Rupee (`₹` / `INR`) formatted using `en-IN` locale (`₹14,500 / night`).
- **Currency Selector**: Seamless user toggle between `INR (₹)`, `USD ($)`, `EUR (€)`, `GBP (£)`, and `AED`.
- **Agreed Price Snapshotting**: Bookings permanently snapshot the agreed transaction currency, nightly rate, and total price. Historical receipts remain completely stable and never mutate if exchange rates fluctuate or property prices change.
- **Exchange Rate Policy**: A documented transparent conversion matrix is configured (`server/src/config/exchangeRates.ts`) with clear timestamping. Non-base prices are explicitly labeled as estimated rates.

### 3. Time Zones & Operational Hours
- **Default Interface Time Zone**: `Asia/Kolkata` (Indian Standard Time, IST).
- **Property-Local Operating Schedules**: Each property record stores its native IANA time zone identifier (e.g., `Asia/Kolkata`, `Asia/Dubai`, `Europe/Paris`, `Europe/London`).
- **No Date-Shift UTC Bugs**: Check-in and check-out dates are handled as local calendar dates anchored safely at midday, preventing off-by-one errors when viewed across different global time zones.

### 4. Multilingual Bilingual Support
- **Languages**: English (`en`, default) and Hindi (`hi`, हिन्दी).
- **Persistence**: Selected language persists in `localStorage` across refreshes and deep page navigation.
- **Scope**: Navigation, search filters, room details, amenities, booking forms, status badges, receipts, and operations portal.

### 5. Academic & Demo-Data Limitations
- HotelPro is developed as a B.Tech Computer Science capstone / mini-project.
- All hotel listings are curated demonstration properties with authentic photography from Unsplash.
- Financial transactions use a simulated payment authorization (`paid_mock` / `refunded_mock`) rather than live payment gateway tokens.
- No live inventory scraping or external vendor integrations are claimed.

---

## 🏛️ System Architecture

HotelPro is architected as a decoupled client-server monorepo:

- **Client (`client/`)**: Built with React 19, Vite, TypeScript, and Tailwind CSS v4. Features responsive editorial layouts, interactive pinned image hotspots on hero views, multi-criteria room discovery, real-time availability checking, booking management, and a dedicated hotel management portal.
- **Server (`server/`)**: Express with TypeScript and Node.js. Enforces fail-fast Zod environment validation, strict CORS whitelisting with `Authorization` header support, BCrypt password hashing, JWT authentication middleware, rate limiting, and a centralized error handling pipeline.
- **Database & Persistence**: MongoDB with Mongoose ODM. Implements compound overlap-query indexes (`{ room: 1, status: 1, checkIn: 1, checkOut: 1 }`) and transactional concurrency protection to prevent double-booking.

---

## 🚀 Quick Start (One-Command Full-Stack Development)

### Prerequisites
- **Node.js**: v20 or higher (v24 recommended)
- **MongoDB Atlas**: Cluster connection string in `server/.env`

### 1. One-Command Setup & Launch (Repository Root)
From the root of the repository (`HotelPro/`):

```bash
# Install all dependencies across root, server, and client in one step
npm run install:all

# Configure environment files:
# server/.env (see server/.env.example)
# client/.env (see client/.env.example)

# Run both backend (Express :5000) and frontend (Vite :5173) concurrently:
npm run dev
```

### 2. Available Root Scripts
| Command | Description |
| :--- | :--- |
| `npm run dev` | Concurrently launches backend (port 5000) and frontend (port 5173) with color-coded prefix logging and graceful shutdown |
| `npm run build` | Builds production artifacts for both `server` (`dist/`) and `client` (`dist/`) with full TypeScript validation |
| `npm run install:all` | Sequentially installs root dev dependencies, backend packages, and client dependencies |
| `npm run seed` | Seeds the 12 luxury sanctuaries and default test accounts into MongoDB Atlas (requires `--confirm`) |

### 3. Independent Sub-Package Commands (Optional)
You can still run backend and frontend independently if desired:
- **Backend only**: `cd server && npm run dev`
- **Frontend only**: `cd client && npm run dev`

---

## 🔐 Evaluation & Viva Credentials

For academic review, viva presentations, and evaluation testing, the application includes convenient **One-Click Quick-Fill** buttons on the sign-in page:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **General Manager (Admin)** | `admin@hotelpro.luxury` | `HotelPro@Admin2026!` | Full fleet CRUD, occupancy metrics, booking status overrides |
| **Registered Customer** | `alexander@example.com` | `GuestPass2026!` | Search, reserve sanctuaries, cancel stays, view receipts |

---

## 🛠️ Verification & Testing Results

All required verification suites were executed on the live environment:

1. **Backend Production Build**: `tsc` completed with zero TypeScript errors.
2. **Frontend Production Build**: `tsc -b && vite build` built production bundles cleanly.
3. **Database Health**: `GET /api/health` reports `{ "status": "ok", "db": "connected" }`.
4. **Seed Integrity**: Seed script created 1 Administrator, 12 Sanctuaries across India and international destinations (Indore as featured anchor), and active test reservation with INR snapshotted currency.
5. **CORS & Security**: Verified with explicit `Origin: http://localhost:5173` header. Disallows unauthorized domains with `403 Forbidden`.
6. **Concurrency & Overlap Protection**: Verified that attempting to book an already reserved room on overlapping dates triggers an immediate `409 Conflict`.
7. **Cancellation & Mock Refund**: Verified that cancelling a booking updates status to `cancelled` and paymentStatus to `refunded_mock`, immediately freeing the room's availability for future guests.
8. **Role-Based Authorization (RBAC)**: Verified that customers attempting to access `/api/admin/*` receive `403 Forbidden`.

---

## 🌐 Deployment Configuration

### Render (Backend Web Service)
- **Root Directory**: `server`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `PORT`: `10000`
  - `MONGO_URI`: `mongodb+srv://<user>:<password>@cluster.mongodb.net/hotelpro?retryWrites=true&w=majority`
  - `JWT_SECRET`: `<secure-random-key-at-least-16-characters>`
  - `CORS_ORIGIN`: `https://your-frontend-deployment.vercel.app`

### Vercel (Frontend Client)
- **Root Directory**: `client`
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: `https://your-backend-deployment.onrender.com/api`
- **SPA Rewrites**: Pre-configured in `client/vercel.json` to handle direct URL deep linking without 404 errors.

