# Technology Stack

## NovaCRM AI - Enterprise AI-Powered CRM Platform

Version: 1.0
Document Type: Technology Reference
Status: Draft

---

## Table of Contents

1. [Frontend](#1-frontend)
2. [Backend](#2-backend)
3. [Database & Storage](#3-database--storage)
4. [AI & Machine Learning](#4-ai--machine-learning)
5. [DevOps & Infrastructure](#5-devops--infrastructure)
6. [Testing](#6-testing)
7. [Code Quality & Tooling](#7-code-quality--tooling)
8. [Version Summary](#8-version-summary)

---

## 1. Frontend

### Core Framework

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.x | UI library - component-based SPA architecture |
| **TypeScript** | 6.x | Static type checking for JavaScript |
| **Vite** | 8.x | Build tool, dev server, bundler |

**Why these choices:**

- **React 19**: Latest stable release with Server Components support (reserved for future use), improved Suspense, Actions API, and enhanced concurrent rendering. Largest ecosystem of any UI library.
- **TypeScript 6**: Catch type errors at compile time. Essential for a large codebase with 30+ database entities and complex state. Native to Vite.
- **Vite 8**: Lightning-fast HMR via native ESM. Outperforms Webpack by 10-100x in dev. Optimized production builds with Rollup. Native TypeScript support without `ts-node`.

### Styling

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **shadcn/ui** | 4.x (base-nova) | Pre-built accessible component library |
| **class-variance-authority** | 0.7.x | Component variant management |
| **clsx** | 2.x | Conditional className utility |
| **tailwind-merge** | 3.x | Merge Tailwind classes without conflicts |
| **tw-animate-css** | 1.4.x | Animation utilities for Tailwind |
| **Geist Variable** | 5.3.x | Geist Sans/Mono font family |

**shadcn/ui Configuration:**

```json
{
  "style": "base-nova",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

**Why these choices:**

- **Tailwind CSS v4**: New Rust-based engine (`oxc`) for faster builds. CSS-first configuration (no `tailwind.config.js`). Built-in container queries, 3D transforms, `@starting-style`.
- **shadcn/ui**: Not a dependency - copied into project. Full ownership of component code. Built on Radix UI primitives (accessibility). base-nova style provides modern aesthetic.
- **CVA + clsx + tailwind-merge**: The standard trio for managing complex Tailwind class compositions in React components without conflicts.

### State Management

| Technology | Version | Purpose |
|-----------|---------|---------|
| **TanStack Query** | 5.x | Server state management (API data) |
| **Zustand** | 5.x | Client state management (UI, auth) |

**Why this split:**

- **TanStack Query** handles all server state: API calls, caching, background refetching, optimistic updates, pagination, infinite scroll. Eliminates manual loading/error states.
- **Zustand** handles client-only state: sidebar collapsed, theme preference, command palette open, auth token. Lightweight (~1KB), no providers needed, works with middleware (persist, devtools).

### Routing

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React Router** | 7.x | Client-side routing |

**Why React Router v7:**

- File-based route conventions (via plugin)
- Layout routes for nested layouts (sidebar + content)
- Route guards for authentication
- Lazy loading with `React.lazy()` for code splitting
- Loaders/actions for pre-route data fetching (optional)

### Forms & Validation

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React Hook Form** | 7.x | Form state management and validation |
| **Zod** | 3.x | Schema-based validation (shared with backend) |

**Why this combination:**

- **React Hook Form**: Minimal re-renders (uncontrolled components). Built-in validation. Handles complex forms (multi-step, dynamic fields) common in CRM.
- **Zod**: Co-located schemas with TypeScript types (`z.infer<>`). Shared between frontend and backend. Define schema once, validate everywhere.

### Data Visualization

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Recharts** | 2.x | Chart library for dashboards and reports |

**Why Recharts:**

- Built on D3.js and React components
- Declarative API (compose charts from JSX primitives)
- Supports: Line, Bar, Area, Pie, Radar, Funnel charts
- Responsive by default
- Customizable via props (no CSS overrides needed)

### Icons & Utilities

| Technology | Version | Purpose |
|-----------|---------|---------|
| **lucide-react** | 1.25.x | Icon library (2000+ icons) |
| **date-fns** | 4.x | Date formatting and manipulation |

**Why these choices:**

- **Lucide React**: Tree-shakeable, consistent style, largest open-source icon set. Used by shadcn/ui natively.
- **date-fns**: Immutable, tree-shakeable, 200+ functions. Preferred over Moment.js (deprecated) and Day.js (smaller API).

### UI Components

| Technology | Version | Purpose |
|-----------|---------|---------|
| **@base-ui/react** | 1.6.x | Unstyled, accessible UI primitives (Radix successor) |

**Why @base-ui/react:**

- Used by shadcn/ui v4 as the underlying primitive library
- Headless components (fully customizable with Tailwind)
- WAI-ARIA compliant out of the box
- Keyboard navigation support

---

## 2. Backend

### Runtime & Framework

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 22.x LTS | JavaScript runtime |
| **Express.js** | 4.x (or Fastify 5.x) | HTTP framework |
| **TypeScript** | 6.x | Type safety |

**Why Node.js:**

- Shared TypeScript with frontend (same language, shared types/interfaces)
- Non-blocking I/O for handling concurrent API requests
- Large ecosystem of packages
- Easy deployment on Render/Railway

**Express vs Fastify consideration:**

- **Express**: Larger ecosystem, more middleware, simpler setup. Better for initial development.
- **Fastify**: 2-3x faster than Express. Schema-based validation. Better for high-throughput scenarios.
- **Recommendation**: Start with Express for rapid development. Migrate to Fastify if performance becomes a bottleneck.

### ORM & Database

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Prisma** | 6.x | Type-safe ORM |
| **PostgreSQL** | 16.x | Primary relational database |
| **Supabase** | - | Managed PostgreSQL + storage + auth |

**Why Prisma:**

- Type-safe database queries (auto-generated types from schema)
- Declarative schema (`schema.prisma`)
- Migration system with `prisma migrate`
- Prisma Studio for visual data browsing
- Supports PostgreSQL, MySQL, SQLite

**Why PostgreSQL (via Supabase):**

- Most advanced open-source RDBMS
- JSONB support for flexible data
- Full-text search (replaces Elasticsearch for basic use)
- Row-level security for multi-tenancy
- Supabase provides: managed hosting, real-time subscriptions, file storage, edge functions

### Caching & Queues

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Redis** | 7.x | In-memory data store |
| **BullMQ** | 5.x | Job queue (Redis-backed) |

**Redis use cases:**

| Use Case | TTL | Description |
|----------|-----|-------------|
| Session cache | 15 min | User sessions and permissions |
| API response cache | 5 min | Dashboard KPIs, aggregations |
| Rate limiting | 1 min window | Token bucket per user/IP |
| AI response cache | 1 hour | Cached AI responses for repeated prompts |
| Feature flags | Real-time | Dynamic feature toggles |

**BullMQ job queues:**

| Queue | Concurrency | Purpose |
|-------|------------|---------|
| `email` | 5 | Send transactional emails |
| `ai` | 3 | Process AI requests |
| `reports` | 2 | Generate PDF/Excel reports |
| `exports` | 5 | CSV/Excel data exports |
| `webhooks` | 10 | Outbound webhook calls |
| `notifications` | 10 | Push/in-app notifications |

### Authentication

| Technology | Version | Purpose |
|-----------|---------|---------|
| **jsonwebtoken** | 9.x | JWT creation and verification |
| **bcrypt** | 5.x | Password hashing |
| **helmet** | 8.x | Security HTTP headers |
| **cors** | 2.x | Cross-origin resource sharing |
| **express-rate-limit** | 7.x | API rate limiting |

### Validation & Logging

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Zod** | 3.x | Request/response validation |
| **Pino** | 9.x | Structured JSON logging |
| **Morgan** | 10.x | HTTP request logging |

**Why Pino:**

- Fastest Node.js logger (benchmarks show 5x winston)
- Structured JSON output (parsed by log aggregation tools)
- Child loggers for contextual logging
- Low overhead in production

---

## 3. Database & Storage

### Primary Database

| Technology | Purpose |
|-----------|---------|
| **PostgreSQL 16** | Relational data storage |
| **Supabase** | Managed PostgreSQL, auth, storage, real-time |

### File Storage

| Technology | Purpose |
|-----------|---------|
| **Supabase Storage** | File uploads (attachments, avatars, documents) |
| **AWS S3** (fallback) | High-volume file storage |

### Schema Management

| Technology | Purpose |
|-----------|---------|
| **Prisma Migrate** | Database migrations |
| **Prisma Seed** | Test data seeding |

---

## 4. AI & Machine Learning

### AI Providers

| Provider | Model | Use Case |
|----------|-------|----------|
| **OpenAI** | GPT-4o | Text generation, scoring, predictions, copilot |
| **Google** | Gemini 1.5 Pro | Document analysis, meeting summaries |

### AI Framework

| Technology | Version | Purpose |
|-----------|---------|---------|
| **LangChain.js** | 0.3.x | AI orchestration, prompt management, chains |

**Why LangChain:**

- Abstracts provider-specific APIs (swap OpenAI for Gemini without code changes)
- Prompt template management
- Chain composition (pipeline of AI calls)
- Memory management for conversational AI
- Output parsing and validation

### AI Integration Architecture

```
Application Code
    |
    v
LangChain.js (orchestration)
    |
    +-- Prompt Templates (stored in code, not DB)
    |
    +-- Context Manager (assembles CRM data for context)
    |
    +-- Provider Router (selects model based on feature)
    |       |
    |       +-- OpenAI Adapter --> GPT-4o API
    |       |
    |       +-- Gemini Adapter --> Gemini API
    |
    +-- Output Parser (validates and structures AI response)
    |
    v
Stored in DB (ai_responses table, linked to entity)
```

---

## 5. DevOps & Infrastructure

### Version Control

| Technology | Purpose |
|-----------|---------|
| **Git** | Version control |
| **GitHub** | Repository hosting, CI/CD, project management |

### CI/CD

| Technology | Purpose |
|-----------|---------|
| **GitHub Actions** | Automated testing, linting, deployment |

**Pipeline stages:**

```
Push to main
    |
    v
Lint (Oxlint) + Type Check (tsc)
    |
    v
Unit Tests (Vitest)
    |
    v
Build (Vite / tsc)
    |
    v
Deploy to Production (Vercel / Railway)
```

### Hosting & Deployment

| Service | Purpose | Tier |
|---------|---------|------|
| **Vercel** | Frontend hosting, CDN, edge functions | Pro |
| **Railway** | Backend API hosting | Starter/Pro |
| **Render** | Backend API hosting (alternative) | Starter/Standard |
| **Supabase** | PostgreSQL, auth, storage | Pro |

### Containerization

| Technology | Purpose |
|-----------|---------|
| **Docker** | Containerized development and deployment |
| **docker-compose** | Local multi-service development |

```yaml
# docker-compose.yml (development)
services:
  frontend:
    build: ./frontend
    ports: ["5173:5173"]
    volumes: ["./frontend:/app"]
    
  backend:
    build: ./backend
    ports: ["3000:3000"]
    volumes: ["./backend:/app"]
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/novacrm
      REDIS_URL: redis://redis:6379
    
  db:
    image: postgres:16
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: novacrm
      POSTGRES_PASSWORD: password
    volumes: ["pgdata:/var/lib/postgresql/data"]
    
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

volumes:
  pgdata:
```

### Environment Management

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `JWT_SECRET` | JWT signing secret (RS256 private key) | Yes |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Yes |
| `STRIPE_SECRET_KEY` | Stripe payment processing | Yes |
| `SENDGRID_API_KEY` | Email sending | Yes |
| `CORS_ORIGIN` | Frontend URL for CORS | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |

---

## 6. Testing

### Testing Frameworks

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Vitest** | 3.x | Unit and integration tests |
| **Playwright** | 1.x | End-to-end browser testing |
| **Supertest** | 7.x | HTTP API testing |

### Testing Strategy

| Test Type | Tool | Coverage Target | Scope |
|-----------|------|----------------|-------|
| **Unit Tests** | Vitest | 80%+ | Components, hooks, utilities, services |
| **Integration Tests** | Vitest + Supertest | 70%+ | API endpoints, database queries |
| **E2E Tests** | Playwright | Critical paths | Login, CRUD flows, checkout |
| **Visual Regression** | Playwright screenshot | Key pages | UI consistency checks |

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
```

### Testing Patterns

**Component Testing (React):**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeadCard } from './lead-card';

test('displays lead name and score', () => {
  render(<LeadCard lead={mockLead} />);
  expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  expect(screen.getByText('Score: 85')).toBeInTheDocument();
});
```

**API Testing (Supertest):**
```typescript
import request from 'supertest';
import { app } from '../src/app';

test('GET /api/leads returns paginated leads', async () => {
  const res = await request(app)
    .get('/api/leads?page=1&limit=10')
    .set('Authorization', `Bearer ${validToken}`);
  
  expect(res.status).toBe(200);
  expect(res.body.data).toHaveLength(10);
  expect(res.body.meta.total).toBeGreaterThan(0);
});
```

---

## 7. Code Quality & Tooling

### Linting & Formatting

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Oxlint** | 1.71.x | Fast JavaScript/TypeScript linter |
| **Prettier** | 3.x | Code formatting |
| **Husky** | 9.x | Git hooks |
| **lint-staged** | 15.x | Run linters on staged files |

**Why Oxlint over ESLint:**

- Written in Rust (10-100x faster than ESLint)
- Built-in rules for React, TypeScript, import, accessibility
- No configuration needed for standard rules
- Same rule names as ESLint for easy migration

### Pre-commit Hook Flow

```
git commit
    |
    v
Husky (pre-commit hook)
    |
    v
lint-staged
    |
    +-- *.ts, *.tsx --> Oxlint (auto-fix)
    +-- *.ts, *.tsx --> Prettier (format)
    +-- *.json, *.md --> Prettier (format)
    |
    v
Commit succeeds (or fails if errors found)
```

### IDE Configuration

| Tool | Purpose |
|------|---------|
| **VS Code** | Primary IDE |
| **Cursor** | AI-enhanced development (optional) |
| **DevContainers** | Consistent dev environment |

**Recommended VS Code Extensions:**

- ESLint / Oxlint
- Prettier
- Tailwind CSS IntelliSense
- Prisma (syntax highlighting)
- Error Lens (inline error display)
- GitLens (git blame, history)

---

## 8. Version Summary

### Pinned Versions (Current)

| Category | Technology | Version |
|----------|-----------|---------|
| **Frontend** | React | 19.2.7 |
| | TypeScript | 6.0.2 |
| | Vite | 8.1.1 |
| | Tailwind CSS | 4.3.3 |
| | shadcn/ui | 4.13.1 |
| | Lucide React | 1.25.0 |
| | CVA | 0.7.1 |
| | clsx | 2.1.1 |
| | tailwind-merge | 3.6.0 |
| | @base-ui/react | 1.6.0 |
| | tw-animate-css | 1.4.0 |
| | Geist Font | 5.3.0 |
| | Oxlint | 1.71.0 |
| | @vitejs/plugin-react | 6.0.3 |
| **Backend** | Node.js | 22.x LTS |
| | Express.js | 4.x |
| | Prisma | 6.x |
| | PostgreSQL | 16.x |
| | Redis | 7.x |
| | LangChain.js | 0.3.x |
| **DevOps** | Docker | 27.x |
| | GitHub Actions | - |
| | Vercel | - |
| | Railway | - |
| | Supabase | - |
| **Testing** | Vitest | 3.x |
| | Playwright | 1.x |
| | Supertest | 7.x |

### Future Additions (Planned)

| Category | Technology | When |
|----------|-----------|------|
| **State** | TanStack Query | Phase 2 |
| **State** | Zustand | Phase 2 |
| **Forms** | React Hook Form | Phase 2 |
| **Validation** | Zod | Phase 2 |
| **Charts** | Recharts | Phase 2 |
| **Dates** | date-fns | Phase 2 |
| **Routing** | React Router v7 | Phase 2 |
| **Queue** | BullMQ | Phase 3 |
| **Logger** | Pino | Phase 3 |
| **AI** | LangChain.js | Phase 3 |
| **E2E** | Playwright | Phase 3 |
| **API Test** | Supertest | Phase 3 |
| **Git Hooks** | Husky | Phase 2 |
| **Format** | Prettier | Phase 2 |
