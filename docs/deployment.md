# NovaCRM AI — Deployment Guide

> Production deployment instructions for frontend (Vercel), backend (Render), database (Supabase), and infrastructure.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
3. [Backend Deployment (Render)](#backend-deployment-render)
4. [Database Setup (Supabase)](#database-setup-supabase)
5. [Redis Setup](#redis-setup)
6. [Environment Variables](#environment-variables)
7. [CI/CD Pipeline](#cicd-pipeline-github-actions)
8. [SSL & Domain Configuration](#ssl--domain-configuration)
9. [Monitoring Setup](#monitoring-setup)
10. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Architecture Overview

```
                    ┌─────────────┐
                    │   Cloudflare │  ← DNS, CDN, DDoS protection
                    │   (optional) │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────┴─────┐ ┌───┴────┐ ┌────┴─────┐
        │   Vercel   │ │ Render │ │ Supabase │
        │  (Frontend)│ │ (API)  │ │ (DB+Auth)│
        │  React SPA │ │ Node.js│ │PostgreSQL│
        └───────────┘ │Express │ │ Redis    │
                      └────────┘ └──────────┘
                           │
                    ┌──────┴──────┐
                    │  Upstash /  │
                    │ Redis Cloud │
                    └─────────────┘
```

**Production URLs (example):**
- Frontend: `https://app.novacrm.ai`
- Backend API: `https://api.novacrm.ai`
- Database: `db.xxxxx.supabase.co` (internal only)

---

## Frontend Deployment (Vercel)

### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com) → **New Project**.
2. Import from GitHub: `your-org/novacrm-ai`.
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### 2. Build Configuration

Vercel auto-detects Vite. Ensure these settings in `apps/web/vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/((?!assets/|.*\\..*).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

The rewrite rule ensures client-side routing works (all paths serve `index.html`).

### 3. Environment Variables

In Vercel Dashboard → **Settings → Environment Variables**, add:

| Variable | Value | Environments |
|----------|-------|-------------|
| `VITE_API_URL` | `https://api.novacrm.ai` | Production, Preview |
| `VITE_WS_URL` | `wss://api.novacrm.ai` | Production, Preview |
| `VITE_APP_NAME` | `NovaCRM` | Production, Preview |

**Preview deployments** (PR branches) can use a staging API URL:
| Variable | Value | Environments |
|----------|-------|-------------|
| `VITE_API_URL` | `https://api-staging.novacrm.ai` | Preview |

### 4. Build & Deploy Settings

- **Node.js Version:** 20.x (in Build & Development Settings)
- **Auto-Deploy:** Enabled for `main` branch
- **Preview Deployments:** Enabled for all branches
- **Branch Override:** Production → `main`

### 5. Custom Domain

1. Vercel Dashboard → **Settings → Domains**.
2. Add custom domain: `app.novacrm.ai`.
3. Configure DNS:
   ```
   Type: CNAME
   Name: app
   Value: cname.vercel-dns.com
   TTL: Auto
   ```
4. SSL certificate is provisioned automatically (Let's Encrypt).
5. Enable "Redirect to HTTPS" if not already enabled.

### 6. Performance Optimizations

- **Edge Functions:** Use Vercel Edge for middleware (auth checks, redirects).
- **Image Optimization:** Use `next/image`-style optimization via `@vercel/image-optimization` or serve images through a CDN.
- **ISR/PPR:** Not applicable for SPA, but leverage Vercel's edge caching for static assets.

**Middleware example** (`apps/web/src/middleware.ts`):

```typescript
import { type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Redirect www to apex
  if (request.nextUrl.hostname === 'www.novacrm.ai') {
    return NextResponse.redirect(
      `https://app.novacrm.ai${request.nextUrl.pathname}`,
      301
    );
  }
}
```

---

## Backend Deployment (Render)

### 1. Create Web Service

1. Go to [render.com](https://render.com) → **New +** → **Web Service**.
2. Connect GitHub repository.
3. Configure:
   - **Name:** `novacrm-api`
   - **Region:** Oregon (or closest to your users)
   - **Branch:** `main`
   - **Root Directory:** `apps/api`
   - **Runtime:** Node
   - **Build Command:**
     ```
     npm install && npx prisma generate && npx prisma migrate deploy
     ```
   - **Start Command:**
     ```
     node dist/server.js
     ```
   - **Instance Type:** Starter ($7/mo) or Standard ($25/mo)

### 2. Environment Variables

In Render Dashboard → **Environment** → **Environment Variables**, add all backend variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `API_URL` | `https://api.novacrm.ai` |
| `FRONTEND_URL` | `https://app.novacrm.ai` |
| `DATABASE_URL` | *(from Supabase — see Database section)* |
| `REDIS_URL` | *(from Upstash — see Redis section)* |
| `JWT_ACCESS_SECRET` | *(generate a new 64-char random string)* |
| `JWT_REFRESH_SECRET` | *(generate a new 64-char random string)* |
| `JWT_ACCESS_EXPIRY` | `15m` |
| `JWT_REFRESH_EXPIRY` | `7d` |
| `RESEND_API_KEY` | `re_xxxxx` |
| `EMAIL_FROM` | `noreply@novacrm.ai` |
| `OPENAI_API_KEY` | `sk-xxxxx` |
| `GEMINI_API_KEY` | `xxxxx` |
| `SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | `xxxxx` |
| `SUPABASE_SERVICE_ROLE_KEY` | `xxxxx` |

**Generate secure secrets:**
```bash
# Run locally to generate secrets
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Background Worker (Optional)

For queue processing (workflow execution, email sending), create a separate Render **Background Worker**:

- **Same repository, same root directory.**
- **Build Command:** Same as web service.
- **Start Command:**
  ```
  node dist/worker.js
  ```
- **Instance Type:** Starter or Standard.
- **Same environment variables** as the web service.

### 4. Health Check Configuration

- **Health Check Path:** `/api/health`
- **Expected Response:** `200 OK`
- **Health Check Grace Period:** 60 seconds (allows time for Prisma migration on deploy)

### 5. Auto-Deploy

- **Auto-Deploy:** Yes, on `main` branch.
- **Deploy Preview:** Yes, for PRs.
- **Pre-Deploy Command:** `npx prisma migrate deploy` (runs before start).

### 6. Render Blueprint (Infrastructure as Code)

```yaml
# render.yaml
services:
  - type: web
    name: novacrm-api
    runtime: node
    rootDir: apps/api
    buildCommand: npm install && npx prisma generate && npx prisma migrate deploy
    startCommand: node dist/server.js
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false  # Set via dashboard
      - key: REDIS_URL
        sync: false
      # ... other env vars

  - type: worker
    name: novacrm-worker
    runtime: node
    rootDir: apps/api
    buildCommand: npm install && npx prisma generate
    startCommand: node dist/worker.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
      - key: REDIS_URL
        sync: false
```

---

## Database Setup (Supabase)

### 1. Create Project

1. Go to [supabase.com](https://supabase.com) → **New Project**.
2. Settings:
   - **Organization:** Create or select one.
   - **Project Name:** `novacrm-production`
   - **Database Password:** Use a strong, unique password (save it securely).
   - **Region:** Closest to your Render backend region.
   - **Pricing Plan:** Pro ($25/mo) for production.

### 2. Connection Configuration

Supabase provides two connection methods:

**Direct Connection (for migrations):**
```
postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

**Pooler Connection (for runtime — recommended):**
```
postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

Use the **Pooler** connection in production (handles connection pooling automatically via PgBouncer).

### 3. Enable Extensions

In Supabase Dashboard → **SQL Editor**:

```sql
-- Required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- For fuzzy search
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- For encryption

-- Optional: for vector search (Phase 5)
CREATE EXTENSION IF NOT EXISTS "vector";
```

### 4. Apply Schema

From your local machine (with the database URL pointing to Supabase):

```bash
# Set DATABASE_URL to Supabase connection
export DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Generate Prisma client
npx prisma generate

# Push schema (for initial setup)
npx prisma db push

# Or deploy migrations
npx prisma migrate deploy
```

### 5. Row-Level Security (Optional)

For additional security at the database level:

```sql
-- Enable RLS on sensitive tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Contact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Deal" ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their organization's data
CREATE POLICY org_isolation ON "Contact"
  USING ("organizationId" = current_setting('app.current_organization_id')::text);
```

Note: Application-level scoping (Prisma middleware) handles this in NovaCRM, but RLS provides an additional safety net.

### 6. Backups

**Automatic Backups (Pro plan):**
- Daily backups retained for 7 days.
- Point-in-time recovery (PITR) available on Pro plan.

**Manual Backup:**
```bash
# Via Supabase CLI
supabase db dump --db-url $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20260115.sql
```

**Scheduled Backups:**
Set up a GitHub Action for weekly backups:

```yaml
# .github/workflows/backup.yml
name: Database Backup
on:
  schedule:
    - cron: '0 2 * * 0'  # Every Sunday at 2 AM UTC
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Install Supabase CLI
        run: npm i -g supabase

      - name: Dump Database
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: supabase db dump --db-url $DATABASE_URL > backup-$(date +%Y%m%d).sql

      - name: Upload to S3
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Upload Backup
        run: |
          aws s3 cp backup-$(date +%Y%m%d).sql \
            s3://novacrm-backups/database/$(date +%Y%m%d).sql
```

### 7. Monitoring Queries

Useful queries for monitoring database health:

```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- Slow queries (requires pg_stat_statements extension)
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Table sizes
SELECT
  relname AS table_name,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Index usage
SELECT
  indexrelname AS index_name,
  idx_scan AS times_used,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

## Redis Setup

### Option A: Upstash (Recommended)

1. Go to [upstash.com](https://upstash.com) → **Create Database**.
2. Settings:
   - **Name:** `novacrm-redis`
   - **Region:** Same as your backend.
   - **Type:** Standard.
3. Copy the **Redis URL** (format: `rediss://default:[password]@[host]:6380`).
4. Add to backend environment variables as `REDIS_URL`.

**Pricing:** Pay-per-request (typically $5–10/mo for a CRM app).

### Option B: Redis Cloud

1. Go to [redis.com](https://redis.com) → **Try Free**.
2. Create a **30 MB** free database.
3. Copy the connection details.
4. Format: `redis://default:[password]@[host]:[port]`.

### Option C: Render Redis

Add a Redis instance in Render:

```yaml
# render.yaml addition
databases:
  - name: novacrm-redis
    plan: starter
    ipAllowList: []  # Only accessible from other Render services
```

Connection URL: `redis://novacrm-redis:6379` (internal Render DNS).

---

## Environment Variables

### Complete Checklist

#### Frontend (Vercel)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | ✅ | Backend API base URL | `https://api.novacrm.ai` |
| `VITE_WS_URL` | ✅ | WebSocket URL | `wss://api.novacrm.ai` |
| `VITE_APP_NAME` | ✅ | Application display name | `NovaCRM` |

#### Backend (Render)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | ✅ | Environment mode | `production` |
| `PORT` | ✅ | Server port | `10000` |
| `API_URL` | ✅ | Public API URL | `https://api.novacrm.ai` |
| `FRONTEND_URL` | ✅ | Frontend URL (CORS) | `https://app.novacrm.ai` |
| `DATABASE_URL` | ✅ | PostgreSQL connection | `postgresql://...` |
| `REDIS_URL` | ✅ | Redis connection | `redis://...` |
| `JWT_ACCESS_SECRET` | ✅ | Access token secret (min 32 chars) | `base64-random...` |
| `JWT_REFRESH_SECRET` | ✅ | Refresh token secret (min 32 chars) | `base64-random...` |
| `JWT_ACCESS_EXPIRY` | ✅ | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRY` | ✅ | Refresh token TTL | `7d` |
| `RESEND_API_KEY` | ✅ | Resend email API key | `re_xxxxx` |
| `EMAIL_FROM` | ✅ | Sender email address | `noreply@novacrm.ai` |
| `OPENAI_API_KEY` | ⚠️ | OpenAI GPT-4 key | `sk-xxxxx` |
| `GEMINI_API_KEY` | ⚠️ | Google Gemini key | `xxxxx` |
| `SUPABASE_URL` | ⚠️ | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | ⚠️ | Supabase anonymous key | `eyJhbG...` |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ | Supabase service role key | `eyJhbG...` |
| `STRIPE_SECRET_KEY` | ⚠️ | Stripe secret key (Phase 7) | `sk_live_xxx` |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ | Stripe webhook signing secret | `whsec_xxx` |
| `SENTRY_DSN` | ❌ | Sentry error tracking DSN | `https://xxx@sentry.io/xxx` |
| `POSTHOG_KEY` | ❌ | PostHog analytics key | `phc_xxx` |

> ✅ = Required for core functionality
> ⚠️ = Required for specific features (AI, billing)
> ❌ = Optional (monitoring, analytics)

---

## CI/CD Pipeline (GitHub Actions)

### Workflow Structure

```
.github/workflows/
├── ci.yml              # Lint + Test + Build (on PR + push to main)
├── deploy-staging.yml  # Deploy to staging (on PR merge to develop)
├── deploy-production.yml # Deploy to production (on push to main)
└── backup.yml          # Database backup (weekly cron)
```

### CI Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    name: Lint & Typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Oxlint
        run: npm run lint

      - name: Prettier
        run: npm run format:check

      - name: TypeScript
        run: npm run typecheck

  test:
    name: Test
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: testpassword
          POSTGRES_DB: novacrm_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    env:
      DATABASE_URL: postgresql://postgres:testpassword@localhost:5432/novacrm_test
      REDIS_URL: redis://localhost:6379
      JWT_ACCESS_SECRET: test-access-secret-for-ci-only-min-32
      JWT_REFRESH_SECRET: test-refresh-secret-for-ci-only-min-32
      NODE_ENV: test

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Run migrations
        run: npx prisma migrate deploy
        working-directory: apps/api

      - name: Run tests
        run: npm test -- --coverage
        working-directory: apps/api

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: apps/api/coverage/lcov.info
          flags: backend

      - name: Run frontend tests
        run: npm test -- --coverage
        working-directory: apps/web

      - name: Upload frontend coverage
        uses: codecov/codecov-action@v4
        with:
          files: apps/web/coverage/lcov.info
          flags: frontend

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Build frontend
        run: npm run build
        working-directory: apps/web

      - name: Build backend
        run: npm run build
        working-directory: apps/api

      - name: Check for type errors in build
        run: npm run typecheck
```

### Deploy Workflow (Production)

```yaml
# .github/workflows/deploy-production.yml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    needs: [ci]  # Reference the CI workflow
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel (Frontend)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: apps/web

      - name: Deploy to Render (Backend)
        uses: bancolima/vercel-action@v1
        # Or use Render's auto-deploy via webhook
        run: |
          curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK }}" \
            -H "Content-Type: application/json" \
            -d '{}'

      - name: Notify Slack
        if: success()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "✅ NovaCRM deployed to production",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "✅ *NovaCRM Production Deploy*\n• Commit: `${{ github.sha }}`\n• Author: ${{ github.actor }}\n• <${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Run>"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Staging vs Production

| Aspect | Staging | Production |
|--------|---------|------------|
| **Branch** | `develop` | `main` |
| **Frontend URL** | `staging.novacrm.ai` | `app.novacrm.ai` |
| **Backend URL** | `api-staging.novacrm.ai` | `api.novacrm.ai` |
| **Database** | `supabase-staging` project | `supabase-production` project |
| **Data** | Synthetic test data | Real production data |
| **API Keys** | Test/sandbox keys | Live production keys |
| **AI Features** | Enabled (test limits) | Enabled (production limits) |
| **Monitoring** | Basic logging | Full observability |
| **Deploy Trigger** | Push to `develop` | Push to `main` |

---

## SSL & Domain Configuration

### DNS Records

Configure these DNS records with your provider (Cloudflare recommended):

```
Type    Name              Value                   TTL
─────   ──────────────    ─────────────────────   ────
CNAME   app               cname.vercel-dns.com    Auto
CNAME   api               novacrm-api.onrender.com Auto
CNAME   staging-app       cname.vercel-dns.com    Auto
CNAME   staging-api       novacrm-api-staging.onrender.com  Auto
TXT     _vercel           vc-domain-verify=...    Auto
```

### SSL Certificates

- **Vercel:** Automatic SSL via Let's Encrypt (provisioned on domain add).
- **Render:** Automatic SSL for all services (custom domains).
- **Supabase:** Automatic SSL for all database connections.
- **Cloudflare:** Universal SSL (if using Cloudflare proxy).

**Force HTTPS:**
```nginx
# Cloudflare: Always Use HTTPS (SSL/TLS → Overview → Always Use HTTPS)
# Or via _redirects / vercel.json rewrites
```

### Custom Domain on Vercel

1. Add domain in Vercel Dashboard → Settings → Domains.
2. Add both `app.novacrm.ai` and `novacrm.ai`.
3. Set `app.novacrm.ai` as primary.
4. Redirect `novacrm.ai` → `app.novacrm.ai`.

### Custom Domain on Render

1. Render Dashboard → Service → Settings → Custom Domains.
2. Add `api.novacrm.ai`.
3. Update DNS with provided CNAME value.
4. SSL auto-provisions after DNS propagation.

---

## Monitoring Setup

### Error Tracking (Sentry)

1. Create account at [sentry.io](https://sentry.io).
2. Create two projects: `novacrm-frontend` and `novacrm-backend`.

**Frontend integration:**
```typescript
// apps/web/src/lib/sentry.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({ maskAllText: true }),
  ],
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

**Backend integration:**
```typescript
// apps/api/src/lib/sentry.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  integrations: [
    Sentry.prismaIntegration(),
    Sentry.expressIntegration(),
  ],
});
```

### Application Monitoring (Better Stack)

1. Create account at [betterstack.com](https://betterstack.com).
2. Configure uptime monitoring:
   - `https://api.novacrm.ai/api/health` — every 1 minute.
   - `https://app.novacrm.ai` — every 1 minute.
3. Set up alerts: email, Slack, SMS.

### Analytics (PostHog)

1. Create account at [posthog.com](https://posthog.com).
2. Install in frontend:
   ```typescript
   import posthog from 'posthog-js';

   posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
     api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
     capture_pageview: true,
     capture_pageleave: true,
   });
   ```

### Logging (Render)

Render provides built-in logging:
- View logs in Render Dashboard → Service → Logs.
- Filter by severity (info, warn, error).
- Log retention: 7 days on free/starter, 30 days on standard.

For structured logging in the backend:
```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
```

### Performance Monitoring

**API response time tracking:**
```typescript
// Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
    });
  });
  next();
});
```

**Key metrics to monitor:**
- API response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Database query time
- Redis hit/miss ratio
- Active connections
- Memory usage
- CPU usage

---

## Post-Deployment Checklist

### First Deploy

- [ ] All environment variables set correctly in Vercel and Render.
- [ ] Supabase project created with required extensions.
- [ ] Database schema deployed (migrations applied).
- [ ] Seed data loaded (or production data migrated).
- [ ] SSL certificates provisioned and valid.
- [ ] DNS records configured and propagated (`dig app.novacrm.ai`).
- [ ] Frontend loads at `https://app.novacrm.ai`.
- [ ] Backend health check returns 200 at `https://api.novacrm.ai/api/health`.
- [ ] Authentication flow works end-to-end (register → login → dashboard).
- [ ] CORS configured correctly (no browser errors).
- [ ] Email sending works (register → verify email).
- [ ] AI features functional (copilot responds).
- [ ] Sentry error tracking receives test error.
- [ ] Uptime monitoring configured and checking health endpoint.
- [ ] Database backups configured.

### Ongoing Monitoring

- [ ] Check Sentry for new errors daily.
- [ ] Review uptime monitoring reports weekly.
- [ ] Monitor database size and performance weekly.
- [ ] Review API response times weekly.
- [ ] Rotate API keys quarterly.
- [ ] Review and update dependencies monthly (Dependabot).
- [ ] Test backup restoration quarterly.
- [ ] Review access logs for suspicious activity monthly.

### Scaling Triggers

Consider upgrading when:
- Database connections consistently > 80% of limit.
- API p95 response time > 500ms.
- CPU usage consistently > 70%.
- Redis memory > 80%.
- Hitting rate limits frequently.

**Scaling options:**
| Component | Starter | Scale Up |
|-----------|---------|----------|
| Vercel | Free/Pro | Enterprise (larger instances) |
| Render | Starter ($7/mo) | Standard ($25/mo) → Pro ($85/mo) |
| Supabase | Free | Pro ($25/mo) → Team ($599/mo) |
| Redis | 30 MB free | Upstash Pay-per-request or Pro |
