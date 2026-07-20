# NovaCRM AI — Setup Guide

> Complete instructions for setting up the NovaCRM AI development environment from scratch.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Clone Repository](#clone-repository)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Database Setup](#database-setup)
6. [Docker Setup](#docker-setup-optional)
7. [Seed Data](#seed-data)
8. [Verify Installation](#verify-installation)
9. [IDE Setup](#ide-setup)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Install the following before proceeding:

| Tool | Version | Install Command / Link |
|------|---------|----------------------|
| **Node.js** | ≥ 20.11 LTS | [nodejs.org](https://nodejs.org) or `nvm install 20` |
| **npm** | ≥ 10.x | Comes with Node.js |
| **PostgreSQL** | ≥ 16 | [postgresql.org](https://www.postgresql.org/download/) or `brew install postgresql@16` |
| **Redis** | ≥ 7.x | [redis.io](https://redis.io/download/) or `brew install redis` |
| **Git** | ≥ 2.40 | [git-scm.com](https://git-scm.com/) |
| **Docker** | ≥ 24.x (optional) | [docker.com](https://www.docker.com/products/docker-desktop/) |

### Verify Prerequisites

```bash
node --version    # v20.11.0 or higher
npm --version     # 10.x or higher
psql --version    # 16.x or higher
redis-cli --version  # 7.x or higher
git --version     # 2.40 or higher
```

---

## Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/novacrm-ai.git

# Navigate to project directory
cd novacrm-ai

# Verify directory structure
ls -la
```

Expected structure:
```
novacrm-ai/
├── apps/
│   ├── web/              # React frontend
│   └── api/              # Express backend
├── packages/
│   ├── ui/               # Shared components
│   ├── tsconfig/         # Shared TypeScript configs
│   └── eslint/           # Shared lint rules
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── seed.ts           # Seed script
│   └── migrations/       # Migration history
├── docs/
├── .github/
│   └── workflows/        # CI/CD pipelines
├── docker-compose.yml
├── package.json          # Root package.json (workspaces)
├── turbo.json            # Turborepo config
├── .env.example
├── .gitignore
├── .editorconfig
└── README.md
```

---

## Backend Setup

### 1. Install Dependencies

```bash
npm install --workspace=apps/api
```

Or install all workspace dependencies at once:
```bash
npm install
```

### 2. Configure Environment Variables

```bash
cd apps/api
cp .env.example .env
```

Edit `.env` with your values:

```env
# ─── App ──────────────────────────────────────────
NODE_ENV=development
PORT=4000
API_URL=http://localhost:4000
FRONTEND_URL=http://localhost:5173

# ─── Database ─────────────────────────────────────
# Local PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/novacrm

# Or Supabase
# DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# ─── Redis ────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ─── Auth ─────────────────────────────────────────
# Generate secrets: openssl rand -base64 32
JWT_ACCESS_SECRET=your-access-secret-min-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-min-32-characters-long
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ─── Email (Resend) ──────────────────────────────
# Get API key: https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@novacrm.ai

# ─── AI ───────────────────────────────────────────
# OpenAI: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx

# Google Gemini: https://aistudio.google.com/apikey
GEMINI_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxxxxx

# ─── Storage (Supabase) ──────────────────────────
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Apply migrations (creates tables)
npx prisma migrate dev

# Or from root:
npm run db:migrate --workspace=apps/api
```

### 4. Start Backend Server

```bash
# From apps/api directory
npm run dev

# Or from root
npm run dev --workspace=apps/api
```

The API server starts at `http://localhost:4000`.

Verify with:
```bash
curl http://localhost:4000/api/health
# Expected: {"status":"ok","timestamp":"2026-01-15T10:30:00.000Z"}
```

---

## Frontend Setup

### 1. Install Dependencies

```bash
npm install --workspace=apps/web
```

### 2. Configure Environment Variables

```bash
cd apps/web
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000
VITE_APP_NAME=NovaCRM
```

### 3. Start Development Server

```bash
# From apps/web directory
npm run dev

# Or from root
npm run dev --workspace=apps/web
```

The frontend starts at `http://localhost:5173`.

### 4. Vite Proxy Configuration

The Vite dev server proxies `/api` requests to the backend:

```typescript
// apps/web/vite.config.ts
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:4000',
        ws: true,
      },
    },
  },
});
```

No CORS issues in development — requests to `/api/*` are proxied.

---

## Database Setup

### Option A: Local PostgreSQL

1. **Start PostgreSQL:**
   ```bash
   # macOS (Homebrew)
   brew services start postgresql@16

   # Linux
   sudo systemctl start postgresql

   # Windows
   # Start from Services panel or:
   net start postgresql-x64-16
   ```

2. **Create database:**
   ```bash
   sudo -u postgres psql
   ```
   ```sql
   CREATE DATABASE novacrm;
   CREATE USER novacrm WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE novacrm TO novacrm;
   ALTER USER novacrm CREATEDB;
   \q
   ```

3. **Update DATABASE_URL:**
   ```
   DATABASE_URL=postgresql://novacrm:password@localhost:5432/novacrm
   ```

### Option B: Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note your **project URL** and **database password**.
3. Go to **Settings → Database** and copy the **connection string** (URI format).
4. Enable **Connection Pooling** (Supabase uses PgBouncer by default).
5. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
6. Enable required extensions in Supabase SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pg_trgm";
   ```

### Option C: Docker PostgreSQL

```bash
docker run -d \
  --name novacrm-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=novacrm \
  -p 5432:5432 \
  -v novacrm-pgdata:/var/lib/postgresql/data \
  postgres:16-alpine
```

### Run Migrations

```bash
# Generate client
npx prisma generate

# Create migration (if no migrations exist yet)
npx prisma migrate dev --name init

# Or apply existing migrations
npx prisma migrate deploy
```

---

## Docker Setup (Optional)

For a complete local environment with all services:

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: novacrm-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: novacrm
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: novacrm-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: novacrm-api
    environment:
      NODE_ENV: development
      PORT: 4000
      DATABASE_URL: postgresql://postgres:password@postgres:5432/novacrm
      REDIS_URL: redis://redis:6379
    ports:
      - "4000:4000"
    volumes:
      - ./apps/api:/app/apps/api
      - /app/apps/api/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

volumes:
  postgres-data:
  redis-data:
```

### Usage

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

### Backend Dockerfile (Development)

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY apps/api/package.json ./
RUN npm install

# Copy source
COPY apps/api/ ./
COPY prisma/ ./prisma/

# Generate Prisma client
RUN npx prisma generate

EXPOSE 4000

CMD ["npm", "run", "dev"]
```

---

## Seed Data

After running migrations, populate the database with demo data:

```bash
# From project root
npm run db:seed --workspace=apps/api

# Or from apps/api
npx prisma db seed
```

### What Gets Seeded

| Entity | Count | Details |
|--------|-------|---------|
| **Organization** | 1 | "Acme Corp" (demo organization) |
| **Users** | 5 | Admin, Manager, 3 Members with different roles |
| **Contacts** | 50 | Diverse names, emails, lifecycle stages, scores |
| **Companies** | 15 | Various industries, sizes, revenue ranges |
| **Deals** | 25 | Spread across pipeline stages, different values |
| **Pipelines** | 2 | Default sales pipeline + partnership pipeline |
| **Tasks** | 30 | Mix of priorities, statuses, assignees |
| **Activities** | 100 | Calls, emails, meetings, notes across contacts |
| **Notes** | 40 | Pinned and unpinned notes on contacts and deals |
| **Calendar Events** | 20 | Meetings and calls over the past/current month |
| **Workflows** | 3 | Sample automation workflows |

### Demo User Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@acme.com | `Demo1234!` |
| Manager | manager@acme.com | `Demo1234!` |
| Member 1 | sarah@acme.com | `Demo1234!` |
| Member 2 | mike@acme.com | `Demo1234!` |
| Member 3 | alex@acme.com | `Demo1234!` |

### Customizing Seed Data

Edit `prisma/seed.ts` to modify demo data:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.$executeRaw`TRUNCATE TABLE "Activity" CASCADE`;
  // ... truncate all tables

  // Create organization
  const org = await prisma.organization.create({
    data: {
      name: 'Acme Corp',
      slug: 'acme-corp',
      plan: 'PROFESSIONAL',
    },
  });

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@acme.com',
      passwordHash: await hash('Demo1234!', 12),
      firstName: 'Sarah',
      lastName: 'Chen',
      role: 'ADMIN',
      organizationId: org.id,
    },
  });

  // ... create contacts, deals, etc.
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## Verify Installation

Run through this checklist to confirm everything is working:

### 1. Backend Health Check

```bash
curl http://localhost:4000/api/health
```

Expected:
```json
{
  "status": "ok",
  "timestamp": "2026-01-15T10:30:00.000Z",
  "uptime": 42.5
}
```

### 2. Database Connection

```bash
# Verify Prisma can connect
npx prisma db push --schema=./prisma/schema.prisma
```

Expected: `✅ The database is now in sync with your Prisma schema.`

### 3. Redis Connection

```bash
redis-cli ping
```

Expected: `PONG`

### 4. Frontend Loads

Open `http://localhost:5173` in your browser.

Expected: Login page renders with NovaCRM branding.

### 5. Authentication Flow

1. Open browser DevTools → Network tab.
2. Register a new account or use demo credentials.
3. Verify:
   - `POST /api/auth/register` returns 201 (or `/api/auth/login` returns 200).
   - Response includes `accessToken` and `user` object.
   - Redirect to dashboard after login.
   - API requests include `Authorization: Bearer ...` header.

### 6. Data Loads

Navigate to Contacts, Companies, Deals pages.

Expected: Seed data appears in tables/boards.

### 7. Run Tests

```bash
npm test --workspace=apps/api
npm test --workspace=apps/web
```

Expected: All tests pass.

### 8. Build Succeeds

```bash
npm run build --workspace=apps/web
npm run build --workspace=apps/api
```

Expected: No errors, output in `dist/` directories.

---

## IDE Setup

### VS Code Extensions

Install these extensions (auto-prompted when opening the project):

```jsonc
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",          // ESLint
    "esbenp.prettier-vscode",          // Prettier
    "bradlc.vscode-tailwindcss",       // Tailwind CSS IntelliSense
    "prisma.prisma",                   // Prisma syntax highlighting
    "csstools.postcss",                // PostCSS support
    "bradymholt.floobits",             // Collaborative editing (optional)
    "ms-vscode.vscode-typescript-next", // Latest TypeScript
    "humao.rest-client",               // API testing
    "streetsidesoftware.code-spell-checker", // Spell check
    "christian-kohler.path-intellisense", // Path auto-complete
    "formulahendry.auto-rename-tag",   // Auto rename paired HTML/JSX tag
    "dsznajder.es7-react-js-snippets", // React snippets
    "kamikillerto.vscode-colorize"     // Color preview in code
  ]
}
```

### VS Code Settings

```jsonc
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "editor.rulers": [100],
  "editor.minimap.enabled": false,
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": true,

  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,

  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "(?:'|\")([^']*)(?:'|\")"]
  ],

  "files.associations": {
    "*.css": "tailwindcss"
  },

  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true,
    "**/coverage": true
  },

  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.trimFinalNewlines": true
}
```

### Useful Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Format document | `Shift + Alt + F` |
| Quick fix | `Ctrl + .` |
| Go to definition | `F12` |
| Peek definition | `Alt + F12` |
| Find all references | `Shift + F12` |
| Rename symbol | `F2` |
| Toggle terminal | `` Ctrl + ` `` |
| Command palette | `Ctrl + Shift + P` |

### Database GUI

Recommended tools for viewing PostgreSQL data:

- **TablePlus** (macOS/Windows) — fast, native
- **pgAdmin** (cross-platform) — full-featured
- **DBeaver** (cross-platform) — free, supports many databases
- **Prisma Studio** — built-in, run `npx prisma studio`

---

## Troubleshooting

### Common Issues

#### `error: password authentication failed for user "postgres"`

PostgreSQL authentication mode mismatch. Fix:
```bash
# Edit pg_hba.conf (location varies by OS)
# Change "md5" to "trust" for local connections, or
# Ensure the password matches what's in DATABASE_URL
```

#### `Error: listen EADDRINUSE: address already in use :::4000`

Another process is using port 4000. Find and kill it:
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:4000 | xargs kill -9
```

#### `Error: Prisma has detected that this environment uses an unencrypted database connection`

Supabase connection URL needs `?sslmode=require`:
```
DATABASE_URL=postgresql://...?sslmode=require
```

#### `Cannot find module '@novacrm/ui'`

Run from project root to link workspaces:
```bash
npm install
```

#### Frontend shows blank page

Check browser console for API errors. Common causes:
- Backend not running on port 4000.
- `VITE_API_URL` not set in `.env`.
- CORS error — verify `FRONTEND_URL` matches `http://localhost:5173`.

#### `prisma migrate dev` fails with "already exists"

Database has a dirty migration state. Reset:
```bash
npx prisma migrate reset
# This drops and recreates the database, then runs all migrations
```

#### Redis connection refused

Ensure Redis is running:
```bash
# Check status
redis-cli ping

# Start if not running
# macOS:
brew services start redis
# Linux:
sudo systemctl start redis
# Docker:
docker start novacrm-redis
```

### Getting Help

1. Check this guide and `README.md`.
2. Search [GitHub Issues](https://github.com/your-org/novacrm-ai/issues).
3. Ask in the team Slack channel.
4. Open a new issue with:
   - Your OS and Node.js version.
   - Full error message and stack trace.
   - Steps to reproduce.
   - What you've already tried.
