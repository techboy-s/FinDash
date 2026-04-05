# Finance Dashboard (Full-Stack Monorepo)

A production-ready, highly maintainable full-stack application for managing and analyzing financial data. 

**Backend:** Node.js, Express, TypeScript, PostgreSQL (Neon), Prisma ORM, Zod  
**Frontend:** React 18, TypeScript, Vite, TailwindCSS, Recharts, Axios  

---

## 🏗️ Architecture & Principles

This codebase strictly adheres to the following principles:

1. **Clear Separation of Concerns (Monorepo):**
   - The Root directory holds the backend API and database schemas.
   - The `/frontend` directory holds a completely standalone React SPA (Single Page Application).

2. **Controller-Service Pattern (Backend):** 
   - **Controllers** are thin, handling HTTP requests/responses and invoking validation.
   - **Services** contain all business rules, data access logic via Prisma, and authorization enforcement.

3. **Global Type Safety & Validation:**
   - Both ends utilize TypeScript.
   - Incoming server requests are passed through strict Zod schemas before reaching domain logic, preventing malformed or malicious data processing.

4. **Database Aggregation:**
   - Computations like total income/expense and grouping by category use Prisma's native `groupBy` to defer intense computations to the database instead of Node's memory constraints.

---

## ⚙️ Setup Instructions

### 1. Requirements
- Node.js (v20+ recommended)
- A PostgreSQL database (Local or Cloud like Neon/Supabase)

### 2. Backend Setup
Configure your database and start the Express server.

```bash
# 1. Install root dependencies
npm install

# 2. Configure Environment
cp .env.example .env
# Update DATABASE_URL inside your newly created .env file!

# 3. Initialize Database
npm run prisma:migrate    # Apply schemas to Postgres
npm run prisma:generate   # Generate type-safe Prisma client
npm run seed              # Populate with sample users & records

# 4. Start Development Server
npm run dev
```

### 3. Frontend Setup
In a new terminal tab, configure and start the React application.

```bash
# 1. Enter the frontend directory
cd frontend

# 2. Install frontend dependencies
npm install

# 3. Configure Environment
# The UI needs to know where the backend lives
echo "VITE_API_BASE_URL=http://localhost:3000/api" > .env

# 4. Start Vite Server
npm run dev
```

---

## 🔐 Available Roles & Credentials

The seed script creates three default accounts (Password for all is `Password123!`):

| Role | Capabilities | Demo Email |
| --- | --- | --- |
| **ADMIN** | Full absolute access (Manage Records + Manage Users) | `admin@financedash.com` |
| **ANALYST** | Read-Only data access + Analytics summaries | `analyst@financedash.com` |
| **VIEWER** | Read-Only data access + Analytics summaries | `viewer@financedash.com` |

---

## 📡 API Reference

### Authentication
- `POST /api/auth/register` (Public) - Create user
- `POST /api/auth/login` (Public) - Authenticate and get JWT

### Financial Records
*Requires `Authorization: Bearer <token>` Header*
- `GET /api/records` (Admin, Analyst, Viewer) - List records with optional filters `(?startDate&endDate&category)`
- `GET /api/records/:id` (Admin, Analyst, Viewer) - Fetch single record
- `POST /api/records` (Admin) - Create new record
- `PUT /api/records/:id` (Admin) - Update record properties
- `DELETE /api/records/:id` (Admin) - Destroy record

### Analytics
*Requires `Authorization: Bearer <token>` Header*
- `GET /api/analytics/summary` (Admin, Analyst, Viewer) - Fast net balance calculation
- `GET /api/analytics/categories` (Admin, Analyst, Viewer) - Category breakdowns for pie-charts
- `GET /api/analytics/trends` (Admin, Analyst, Viewer) - Monthly income/expense progression

### User Management
*Requires `Authorization: Bearer <token>` Header*
- `GET /api/users` (Admin) - Fetch all registered users
- `GET /api/users/:id` (Admin) - Fetch a specific user
- `PUT /api/users/:id/role` (Admin) - Elevate or demote a user's role 
- `DELETE /api/users/:id` (Admin) - Remove a user and their cascading records

---

## 🧠 Assumptions Made

1. **Financial Accuracy via Integers (Cents):**
   Floating point arithmetic errors can be disastrous in financial applications. All monetary values (`amount` in the `Record` table) are typed as integers and are structurally constrained to be processed and stored in **cents** (e.g., `$5.00` => `500`). The frontend handles formatting it back to human-readable decimals.
2. **Postgres Driver Customization:**
   Prisma was bound through `@prisma/adapter-pg` using a native `pg` pool. This is uniquely structured to allow Serverless Databases (like Neon) to pool TCP connections efficiently in PaaS deployments.
3. **Internal Tools Environment:**
   We assume this is an internal business tool. Therefore, we block unauthorized traffic from viewing the Dashboard, deferring immediately to an enforced Login screen.

## ⚖️ Tradeoffs Considered

- **React SPA vs Next.js (SSR):** 
  Because this entire architecture sits behind a mandatory authentication wall, SEO indexing is irrelevant. Therefore, a lightweight Vite React SPA (Single Page Application) was heavily favored over the orchestration complexities of Server-Side Rendering (Next.js), granting us snappier runtime client-side transitions.
- **JWTs in LocalStorage vs HttpOnly Cookies:** 
  For this iteration, JWTs are stored in `localStorage` securely resolving via an Axios interceptor block. While highly functional, for strict banking-grade applications, moving to securely encrypted `HttpOnly` Set-Cookie headers would protect against XSS attack vectors.
- **Monorepo Structure:** 
  We chose to couple the backend and frontend into a single repository to ensure rapid iterations. This makes deployments slightly more bespoke (requiring Vercel to override its root execution context), but it vastly accelerates development by allowing developers to work on both domains without juggling multiple git projects.
