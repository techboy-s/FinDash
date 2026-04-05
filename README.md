# Finance Dashboard API

A production-ready, highly maintainable REST API for a Finance Dashboard built with **Node.js, Express, TypeScript, PostgreSQL, Prisma 7**, and **Zod**.

## Architecture & Principles

This codebase strict adheres to the following principles:

1. **Controller-Service Pattern:** 
   - **Controllers (`src/controllers`)** are extremely thin. Their only responsibilities are handling HTTP req/res, invoking validation, and calling the appropriate service methods. Business logic is strictly prohibited here.
   - **Services (`src/services`)** contain all the business rules, data access logic via Prisma, hashing, and authorization tokens. This makes them highly testable.

2. **Zod Validation Middleware:** 
   - All input validation rules (body, query params, path params) are defined in highly typed declarations within `src/schemas/`. 
   - A global `validate` middleware processes the incoming request against these schemas *before* it hits the controller, preventing malformed data from ever reaching the domain logic.

3. **Global Error Handling:**
   - Instead of throwing `Error` loosely, there's a custom `AppError` class.
   - Using classes like `NotFoundError`, `UnauthorizedError`, etc., cleanly propagates HTTP statuses and messages to the single, centralized global error middleware (`src/middlewares/error.middleware.ts`), ensuring the API always returns a consistent and robust JSON error response without app-crashing.

4. **Financial Accuracy (Integers):**
   - Floating point arithmetic errors can be disastrous in financial applications. All monetary values (`amount` in the `Record` table) are typed as `Int` through Prisma and are structurally constrained to be processed and stored in **cents** (e.g., $5.00 => 500).

5. **Prisma 7 (Driver Adapters):**
   - Uses the brand new Prisma 7 configuration file approach (`prisma.config.ts`) and completely rust-free runtime engine via `@prisma/adapter-pg` and the `pg` driver package. 

6. **Database Aggregation:**
   - Computations like total income/expense and grouping by category use Prisma's native database `groupBy` capabilities to defer intense computations to the database plane instead of doing it in Node's memory constraints.

## Setup Instructions

### 1. Requirements
Ensure you have the following installed to run this project seamlessly:
- Node.js (v20+ recommended)
- PostgreSQL (v14+ recommended)

### 2. Configuration & Dependencies
Clone the repository, verify the `.env` configuration, and install dependencies.

```bash
# 1. Install dependencies
npm install

# 2. Configure `.env`
# Update your `DATABASE_URL` in the `.env` file to point to your target running PostgreSQL instance.
cp .env.example .env
```

### 3. Database Initialization
Once you have configured the `DATABASE_URL`, push the schema and seed it using the included data seed.

```bash
# Apply migrations to your Postgres database
npm run prisma:migrate

# Generate the type-safe client bounds to your schema
npm run prisma:generate

# Populate the database with test data (1 Admin, 1 Analyst, 1 Viewer, 50 random records)
npm run seed
```

### 4. Running the Application
```bash
# For Development Mode (live-reloading via tsx)
npm run dev

# For Production Compilation
npm run build
npm run start
```

## Available Roles & Access
| Role | Capabilities | Example Seed Credential (Password: `Password123!`) |
| --- | --- | --- |
| **ADMIN** | Full absolute access (Read, Create, Update, Delete) | `admin@financedash.com` |
| **ANALYST** | Read-Only data access + Analytics summaries | `analyst@financedash.com` |
| **VIEWER** | Authentication only (Does not have endpoints) | `viewer@financedash.com` |

## Available Endpoints
### Authentication
- `POST /api/auth/register` (Public) - Create user
- `POST /api/auth/login` (Public) - Authenticate and get token

### Financial Records
*Requires `Authorization: Bearer <token>` Header*
- `POST /api/records` (Admin) - Create new record
- `GET /api/records` (Admin, Analyst) - List records with optional filters `(?startDate&endDate&category)`
- `GET /api/records/:id` (Admin, Analyst) - Fetch single record
- `PUT /api/records/:id` (Admin) - Update specific fields
- `DELETE /api/records/:id` (Admin) - Destroy record

### Analytics
*Requires `Authorization: Bearer <token>` Header*
- `GET /api/analytics/summary` (Admin, Analyst) - Fast net balance calculation
- `GET /api/analytics/categories` (Admin, Analyst) - Breakdowns of pie-chart totals

## Developer Note & Assumptions
- All monetary amounts retrieved from endpoints must be divided by 100 on the front-end to match realistic formatting standards (ie. cents logic). 
- Prisma has been configured to generate its compiled code artifact manually outside of `node_modules` into `./src/generated/prisma`. This prevents node resolution conflicts and adheres to the new Prisma v7 best practices.
- The `node` compiler rules implicitly augment `express.d.ts` globally for seamless JWT typing via `req.user`.
