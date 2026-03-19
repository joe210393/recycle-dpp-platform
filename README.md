# recycle-dpp-platform

Node.js + Express + EJS + MySQL platform skeleton for DPP-ready product traceability.

## Prerequisites

- Node.js 20+ (tested with Node 22)
- MySQL 8+

## Setup

1. Install dependencies
   ```bash
   npm install
   ```

2. Configure environment
   ```bash
   cp .env.example .env
   ```
   Edit `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.

3. Create database
   ```sql
   CREATE DATABASE IF NOT EXISTS recycle_dpp_platform
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_unicode_ci;
   ```

## Run migrations

```bash
npm run migrate
```

Migration files live in:

- `src/database/migrations/001_create_recyclers.sql` ... `015_create_dpp_exports.sql`

## Start the server

```bash
npm start
```

## Main URLs (first version)

- Admin dashboard: `http://localhost:3000/admin`
- Admin CRUD pages: `http://localhost:3000/admin/<resource>`
  - e.g. `/admin/recyclers`, `/admin/products`, ...
- Public home: `http://localhost:3000/`
- Public products list: `http://localhost:3000/products`

