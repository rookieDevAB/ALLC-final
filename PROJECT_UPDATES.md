# 📋 ALLC Clinic — Project Update Log

> **Purpose:** Chronological record of all changes made to the **allc-clinic** project.  
> Maintained so any developer joining the team can quickly orientate themselves.  
> **Stack:** Vite + React (frontend) · Express + Prisma + MySQL (backend)  
> **Author:** rookieDevAB  
> **Last Updated:** 20 Apr 2026

---

## Table of Contents

- [How to Read This Log](#how-to-read-this-log)
- [Environment Quick-Start](#environment-quick-start)
- [Change Log](#change-log)
- [Current Routes & Pages](#current-routes--pages)
- [Database Models](#database-models)
- [API Endpoints](#api-endpoints)
- [Known TODOs / Open Issues](#known-todos--open-issues)

---

## How to Read This Log

Each entry follows this format:

```
### DD MMM YYYY — [commit hash] Short Title
Category: Feature / Fix / Docs / CI / Cleanup
Files touched: ...
What changed and why.
```

---

## Environment Quick-Start

```bash
# 1. Clone & install (root = frontend)
npm install

# 2. Backend
cd backend && npm install

# 3. Copy backend env
cp backend/.env.example backend/.env
# Fill in DATABASE_URL, JWT secrets, RESEND_API_KEY

# 4. Run Prisma migrations and seed
cd backend
npx prisma migrate deploy
node prisma/seed.js            # creates default SUPERADMIN user
node prisma/seed-blogs.js      # seeds 8 sample blog posts

# 5. Start servers (two terminals)
cd backend && npm run dev      # http://localhost:4000
npm run dev                    # http://localhost:5173
```

> **Database:** MySQL (`clinic` schema). Connection string in `backend/.env` → `DATABASE_URL`.

---

## Change Log

---

### 19 Mar 2026 — `1d1cbdb` Project Initialisation

**Category:** Setup  
**Files:** `.gitignore`, `eslint.config.js`, `index.html`, `package.json`, `postcss.config.js`, `tailwind.config.js`, `vite.config.js`

- Initialized project with **Vite + React** and **Tailwind CSS v3**.
- Set up ESLint with React plugin rules.
- PostCSS configured for Tailwind.
- `vite.config.js` sets up HMR dev server on port 5173.

---

### 19 Mar 2026 — `6f66bb9` Base Styles & Font Imports

**Category:** Frontend  
**Files:** `src/index.css`, `src/main.jsx`

- Added global CSS reset and base typography.
- Imported **Inter** font from Google Fonts.
- `main.jsx` bootstraps React root with `StrictMode`.

---

### 21 Mar 2026 — `9613e24` Public Assets & Images

**Category:** Assets  
**Files:** `public/favicon.png`, `public/icons.svg`, `public/images/logo.svg`, team photos × 5, program images × 8

- Added clinic logo (SVG), favicon, and icon sprite.
- Added **team member photos** for the About page:
  - `dr-divya-gautam.jpeg` _(lead clinician)_
  - `dr-deependra-gautam.jpeg`
  - `dr-susheel-gautam.png`
  - `dr-vivek-mittal.jpeg`
  - `vandana-gautam.JPG`
- Added programme imagery used in the Services page modals:
  `diagnostic`, `endocrinology`, `lifestyle`, `metabolic`, `nutrition`, `optimization`, `reset`, `rhythm`.

---

### 22 Mar 2026 — `7e0528c` App Shell & React Router

**Category:** Frontend  
**Files:** `src/App.jsx`, `src/components/ScrollToTop.jsx`

- Set up `react-router-dom` with the main `<Router>` and `<Routes>` tree.
- `PublicLayout` wrapper applies the `NavbarVariant2` + `FooterVariant2` to all public pages.
- `ScrollToTop` component auto-scrolls to top on every route change.
- Route structure established *(all public at this point)*.

---

### 23 Mar 2026 — `1540d37` Navbar & Footer Components

**Category:** Frontend  
**Files:** `src/components/NavbarVariant2.jsx`, `src/components/FooterVariant2.jsx`

- **Navbar** (`NavbarVariant2`):
  - Sticky, glass-blur header in teal/dark-green palette.
  - Links: Home, About, Our Discovery, Services, Events & Blog.
  - CTA button: **Apply Now** → scrolls to / opens waitlist form.
  - Responsive mobile menu with hamburger toggle.
- **Footer** (`FooterVariant2`):
  - Multi-column layout with quick-links, socials, and clinic address.
  - Newsletter subscription input (UI only at this stage).

---

### 25 Mar 2026 — `c905cb6` Homepage & Waitlist Meter

**Category:** Frontend  
**Files:** `src/pages/HomePaletteTeal.jsx`, `src/components/WaitlistMeter.jsx`

- Full homepage: hero, services overview strip, research section, and CTA.
- **WaitlistMeter** component displays live waitlist capacity filled as a visual progress bar, fetched from the backend waitlist count endpoint.
- Colour palette locked: `#DCF4F1` bg, `#062926` primary, `#2AB5A5` accent.

---

### 26 Mar 2026 — `8966efa` Timeline & Card Carousel Components

**Category:** Frontend  
**Files:** `src/components/TimelineFeatures.jsx`, `src/components/AppleCardsCarousel.jsx`

- **TimelineFeatures:** Animated vertical timeline used on homepage / Research page to show clinic milestones.
- **AppleCardsCarousel:** Horizontal scroll carousel (Apple-style) used to showcase programme cards on the homepage.

---

### 28 Mar 2026 — `3d0d7c1` About Page & Team Grid

**Category:** Frontend  
**Files:** `src/pages/About.jsx`, `src/pages/About.css`, `src/components/ChromaGrid.jsx`, `src/data/teamMembers.js`

- **About page** sections: mission statement, clinic story, philosophy, team grid, and accreditations.
- **ChromaGrid** component: interactive team card grid with hover colour effects (chroma shift animation).
- `teamMembers.js` is the single source of truth for doctor profiles (name, designation, photo path, bio).

---

### 30 Mar 2026 — `7b9ffc8` Services Page

**Category:** Frontend  
**Files:** `src/pages/Services.jsx`, `src/pages/Services.css`

- 8 programme cards, each opening a detailed **modal** with:
  - Programme description, what's included, and benefits.
  - Corresponds to the programme images added on 21 Mar.
- Programmes: Diagnostic, Endocrinology, Lifestyle, Metabolic, Nutrition, Optimization, Reset, Rhythm.

---

### 01 Apr 2026 — `b14d559` Research & Contact Pages

**Category:** Frontend  
**Files:** `src/pages/Research.jsx`, `src/pages/Contact.jsx`

- **Research page:** Displays clinic's approach to evidence-based medicine, uses `TimelineFeatures` for research timeline.
- **Contact page:** Contact form (name, email, message) + Google Maps embed placeholder + clinic address/hours.

---

### 03 Apr 2026 — `54853d6` Backend Setup (Express + Prisma)

**Category:** Backend  
**Files:** `backend/package.json`, `backend/src/server.js`, `backend/src/db.js`, `backend/prisma/schema.prisma`, migrations (init), `backend/src/utils/logger.js`, `backend/prisma/seed.js`, `backend/.env.example`

- Express server on port 4000, with **Helmet**, **CORS**, and **cookie-parser**.
- **Prisma ORM** configured with MySQL provider.
- Initial DB schema: `User`, `RefreshToken`, `PasswordResetToken`, `WaitlistApplication`, `AuditEvent`.
- `seed.js`: creates default `SUPERADMIN` user  *(email + password defined in seed script)*.
- `logger.js`: Simple console logger with timestamps.
- `CORS_ORIGIN` in `.env` controls allowed frontend origins (comma-separated).

---

### 04 Apr 2026 — `ab089e9` Auth System (JWT)

**Category:** Backend  
**Files:** `backend/src/routes/auth.js`, `backend/src/middleware/auth.js`, `backend/src/middleware/rateLimiter.js`, `backend/src/utils/jwt.js`

- **JWT dual-token strategy:**
  - `ACCESS_TOKEN` — 15 min lifespan, sent as JSON response.
  - `REFRESH_TOKEN` — 7 days, stored in `httpOnly` secure cookie.
- Auth endpoints:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
  - `POST /api/v1/auth/forgot-password`
  - `POST /api/v1/auth/reset-password`
- **Rate limiter** middleware on login (prevents brute force).
- `authGuard` and `roleGuard` middleware reused across all protected routes.

---

### 05 Apr 2026 — `1edfcc0` Admin Routes, Waitlist & Email

**Category:** Backend  
**Files:** `backend/src/routes/admin.js`, `backend/src/routes/waitlist.js`, `backend/src/utils/audit.js`, `backend/src/utils/email.js`

- **Waitlist** (`/api/v1/waitlist`):
  - `POST /` — public submission (name, email, health vector, rationale).
  - `GET /` — admin list (paginated, filterable by status).
  - `PATCH /:id` — update status (SUPERADMIN/ADMIN).
- **Admin** (`/api/v1/admin`):
  - `GET /users` — list admin users.
  - `POST /users` — create new admin user (SUPERADMIN only).
  - `PATCH /users/:id` — toggle `isActive`, change role.
- **Email** (`utils/email.js`): Uses **Resend** API to send transactional emails (waitlist confirm, password reset). Configure `RESEND_API_KEY` in `.env`.
- **Audit** (`utils/audit.js`): Writes all admin actions to `AuditEvent` table.

---

### 07 Apr 2026 — `3731510` Frontend Auth Context & Protected Routes

**Category:** Frontend  
**Files:** `src/context/AuthContext.jsx`, `src/context/auth-context.js`, `src/context/useAuth.js`, `src/components/ProtectedRoute.jsx`, `src/lib/api.js`

- **AuthContext** maintains `currentUser` state, `accessToken`, and exposes `login()` / `logout()` / `refreshToken()`.
- `api.js` — Axios-free fetch wrapper that automatically attaches Bearer token and handles 401 → token refresh silently.
- `getAccessToken()` exported for use by other utilities (e.g., `blogStorage.js`).
- **ProtectedRoute** component: wraps admin routes, checks `minRole` prop (`REVIEWER`, `ADMIN`, `SUPERADMIN`). Redirects to `/admin/login` if unauthenticated.

---

### 08 Apr 2026 — `a8ca92b` Admin Dashboard & Login Page

**Category:** Frontend  
**Files:** `src/pages/AdminDashboard.jsx`, `src/pages/AdminLogin.jsx`

- **AdminLogin page** (`/admin/login`): Clean login form, redirects to `/admin` on success.
- **AdminDashboard** (`/admin`): Full admin panel with tabbed sections:
  - **Waitlist** — table view, status badges, update status inline.
  - **Blog posts** — list of all posts (drafts + published), create/edit/delete actions.
  - **Users** — user management (SUPERADMIN only tab).
  - **Audit Log** — read-only log of all admin actions.

---

### 10 Apr 2026 — `3b72656` Forgot / Reset Password Flow

**Category:** Frontend  
**Files:** `src/pages/ForgotPassword.jsx`, `src/pages/ResetPassword.jsx`

- **ForgotPassword** (`/admin/forgot-password`): Email input, calls `POST /api/v1/auth/forgot-password`. Shows confirmation message.
- **ResetPassword** (`/reset-password?token=...`): New password form, reads token from URL query param, calls `POST /api/v1/auth/reset-password`.
- Email with reset link is sent via Resend (backend).

---

### 13 Apr 2026 — `6f95677` Blog API (Backend)

**Category:** Backend  
**Files:** `backend/src/routes/blog.js`

- Full blog CRUD on `/api/v1/blog`:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/blog` | Public | List published posts (paginated, category filter) |
| GET | `/api/v1/blog/:id` | Public | Single published post |
| GET | `/api/v1/blog/admin/all` | REVIEWER+ | All posts incl. drafts |
| POST | `/api/v1/blog` | ADMIN+ | Create post |
| PATCH | `/api/v1/blog/:id` | ADMIN+ | Update post |
| DELETE | `/api/v1/blog/:id` | SUPERADMIN | Delete post |

- HTML content sanitised via `sanitize-html` before saving.
- Input validated with **Zod** schemas.
- Categories enum: `Event`, `Seminar`, `Health Article`, `Tip`.

---

### 14 Apr 2026 — `8521ca7` Blog Frontend (Listing, Post Detail, Editor)

**Category:** Frontend  
**Files:** `src/pages/Blogs.jsx`, `src/pages/BlogPost.jsx`, `src/pages/BlogEditor.jsx`, `src/utils/blogStorage.js`

- **Blogs page** (`/blogs`):
  - Grid of published posts with category filter buttons.
  - Animated cards using `framer-motion`.
  - Fetches from `GET /api/v1/blog`.
- **BlogPost page** (`/blogs/:id`):
  - Full post detail view with sanitised HTML content rendering.
  - Cover image, tags, date, author.
- **BlogEditor page** (`/admin/blog/new` and `/admin/blog/edit/:id`):
  - Rich form: title, short description, HTML content textarea, category dropdown, tags, cover image URL, publish toggle.
  - Calls `POST` or `PATCH` on save depending on whether post has an existing ID.
- **blogStorage.js** utility: All blog API calls centralised here. Uses `getAccessToken()` for admin calls.

---

### 16 Apr 2026 — `4281e4b` Backend Test Suite

**Category:** Testing  
**Files:** `backend/__tests__/auth.test.js`, `backend/__tests__/health.test.js`, `backend/__tests__/rbac.test.js`, `backend/__tests__/waitlist.test.js`, `backend/jest.config.js`, `backend/jest.setup.js`

- Jest + Supertest setup for backend.
- Test coverage:
  - `health.test.js` — API health check endpoint.
  - `auth.test.js` — login, refresh, logout, invalid credentials.
  - `rbac.test.js` — role-based access control (REVIEWER / ADMIN / SUPERADMIN restrictions).
  - `waitlist.test.js` — waitlist submission and admin listing.
- Run with: `cd backend && npm test`

---

### 17 Apr 2026 — `2520896` CI Pipeline

**Category:** CI/CD  
**Files:** `.github/workflows/ci.yml`

- GitHub Actions workflow on push/PR to `main`:
  1. **Lint** — ESLint on frontend.
  2. **Build** — Vite production build.
  3. **Test** — Backend Jest suite.
- Runs on `ubuntu-latest` with Node 20.

---

### 17 Apr 2026 — `22cf62a` Full Architecture README

**Category:** Docs  
**Files:** `README.md`, `docs/README.md`

- Detailed architecture overview in `docs/README.md`: folder structure, tech choices, auth flow diagram, data models.
- Root `README.md` quick-start for local dev.

---

### 19 Apr 2026 — `bfc4c58` Code Cleanup

**Category:** Cleanup  
**Files:** Multiple frontend & backend files

- Removed dead/commented-out code across components.
- Humanised inline code comments for readability.
- No functional changes.

---

### 19 Apr 2026 — `b8206d7` README Rewrite for Developer Handover

**Category:** Docs  
**Files:** `README.md`, `docs/README.md`

- Rewrote root `README.md` as a concise developer handover guide.
- Reorganised `docs/README.md` to reduce duplication.

---

### 19 Apr 2026 — `bd0ef6f` Resend Domain Verification Docs

**Category:** Docs  
**Files:** `README.md`

- Added steps for verifying the domain on **Resend** dashboard so production emails work.
- Covers DNS TXT/MX record setup for `asianllc.com`.

---

### 19 Apr 2026 — `03e6d7b` · `56f5f1d` CI Cache Fixes

**Category:** CI/CD  
**Files:** `backend/package-lock.json`, `package-lock.json`

- Added missing `package-lock.json` files (frontend root and backend) so the GitHub Actions cache step doesn't fail.

---

### 19 Apr 2026 — `49fa190` ESLint Error Fixes

**Category:** Fix  
**Files:** Multiple

- Resolved all ESLint rule violations flagged by CI (unused variables, missing keys, etc.).
- CI now passes cleanly on all three jobs (lint, build, test).

---

### 20 Apr 2026 — Blog Seed Data Added

**Category:** Database  
**Files:** `backend/prisma/seed-blogs.js`

- Added `seed-blogs.js` which inserts **8 sample blog posts** (all `published: true`):

| Title | Category |
|-------|----------|
| Understanding Diabetes: Prevention & Lifestyle Management | Health Article |
| Heart Health: 10 Evidence-Based Tips | Health Article |
| 5 Simple Morning Habits That Boost Your Immunity | Tip |
| Managing Screen Time: Protecting Your Eyes | Tip |
| Free Health Screening Camp — April 2025 | Event |
| World Health Day Celebration at ALLC Clinic | Event |
| Seminar: Women's Hormonal Health | Seminar |
| Pediatric Nutrition Seminar: Raising Healthy Eaters | Seminar |

- Run with: `cd backend && node prisma/seed-blogs.js`

---

### 20 Apr 2026 — Blog Frontend Verified Working ✅

**Category:** Verification  
**Done by:** Antigravity AI assistant

- Confirmed all 8 seeded blog posts appear on `/blogs`.
- Category filter buttons (All / Event / Seminar / Health Article / Tip) confirmed functional.
- Individual post pages (`/blogs/:id`) render content correctly.
- API `GET /api/v1/blog` returns `{ items: [...], pagination: {...} }` as expected.

---

## Current Routes & Pages

### Public Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `HomePaletteTeal` | Homepage with hero, programmes, waitlist CTA |
| `/about` | `About` | Team grid, clinic story, philosophy |
| `/services` | `Services` | 8 programme cards with detail modals |
| `/research` | `Research` | Evidence-based medicine timeline |
| `/contact` | `Contact` | Contact form + address |
| `/blogs` | `Blogs` | Blog listing with category filter |
| `/blogs/:id` | `BlogPost` | Individual blog post |

### Admin Routes (Protected)

| Route | Component | Min Role | Description |
|-------|-----------|----------|-------------|
| `/admin/login` | `AdminLogin` | — | Login page |
| `/admin/forgot-password` | `ForgotPassword` | — | Request password reset |
| `/reset-password` | `ResetPassword` | — | Set new password via email link |
| `/admin` | `AdminDashboard` | REVIEWER | Main admin panel |
| `/admin/blog/new` | `BlogEditor` | ADMIN | Create blog post |
| `/admin/blog/edit/:id` | `BlogEditor` | ADMIN | Edit blog post |

---

## Database Models

| Model | Key Fields | Notes |
|-------|-----------|-------|
| `User` | id, email, passwordHash, role, isActive | Admin user. Roles: SUPERADMIN / ADMIN / REVIEWER |
| `RefreshToken` | userId, tokenHash, expiresAt, revokedAt | One per active session. Cleaned on logout |
| `PasswordResetToken` | userId, tokenHash, expiresAt, usedAt | Single-use, expires in 1 hr |
| `WaitlistApplication` | fullName, email, healthVector, rationale, status | Statuses: NEW / UNDER_REVIEW / ACCEPTED / REJECTED |
| `AuditEvent` | actorUserId, action, entityType, entityId, metadata | Immutable log of all admin actions |
| `BlogPost` | title, shortDescription, content, category, author, coverImage, tags (JSON), published, date | `published = false` = draft (hidden from public) |

---

## API Endpoints

### Auth `/api/v1/auth`

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/login` | — | Returns access token + sets refresh cookie |
| POST | `/refresh` | Cookie | Rotates refresh token |
| POST | `/logout` | Cookie | Revokes refresh token |
| POST | `/forgot-password` | — | Sends reset email via Resend |
| POST | `/reset-password` | — | Validates token, updates password |

### Blog `/api/v1/blog`

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/` | — | Published posts, `?category=&page=&limit=` |
| GET | `/:id` | — | Single published post |
| GET | `/admin/all` | REVIEWER+ | All posts (incl. drafts) |
| POST | `/` | ADMIN+ | Create post |
| PATCH | `/:id` | ADMIN+ | Update post |
| DELETE | `/:id` | SUPERADMIN | Delete post |

### Waitlist `/api/v1/waitlist`

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/` | — | Submit application |
| GET | `/` | ADMIN+ | List all (paginated + status filter) |
| PATCH | `/:id` | ADMIN+ | Update status / notes |

### Admin `/api/v1/admin`

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/users` | SUPERADMIN | List admin users |
| POST | `/users` | SUPERADMIN | Create admin user |
| PATCH | `/users/:id` | SUPERADMIN | Toggle active, change role |

---

## Known TODOs / Open Issues

| # | Area | Description | Priority |
|---|------|-------------|----------|
| 1 | Email | `RESEND_API_KEY` set ✅ — verified 20 Apr 2026 | ~~🔴 High~~ Done |
| 2 | Blog | Blog cover images use external Unsplash URLs — consider local upload/CDN | 🟡 Medium |
| 3 | Contact | Contact form submits to no endpoint yet — needs backend route or Resend integration | 🟡 Medium |
| 4 | Footer | Newsletter subscription input (Footer) has no backend connection | 🟡 Medium |
| 5 | Blog | Pagination controls not yet rendered in the Blogs page UI (API supports it) | 🟢 Low |
| 6 | Admin | Audit log tab in dashboard has no real-time refresh | 🟢 Low |
| 7 | SEO | `<meta>` descriptions and OG tags not yet added to most pages | 🟢 Low |

---

*Log maintained by the development team. When you make a change, add an entry at the bottom of the Change Log section following the same format.*
