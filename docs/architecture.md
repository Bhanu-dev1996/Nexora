# Architecture Document

## NovaCRM AI - Enterprise AI-Powered CRM Platform

Version: 1.0
Document Type: System Architecture
Status: Draft

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Frontend Architecture](#2-frontend-architecture)
3. [Backend Architecture](#3-backend-architecture)
4. [Data Flow Diagrams](#4-data-flow-diagrams)
5. [Deployment Architecture](#5-deployment-architecture)
6. [Security Architecture](#6-security-architecture)
7. [AI Service Integration](#7-ai-service-integration)
8. [Scalability Considerations](#8-scalability-considerations)

---

## 1. System Overview

NovaCRM AI follows a **client-server architecture** with a decoupled frontend and backend communicating over a RESTful API. The system is designed as a multi-tenant SaaS platform where each organization operates in an isolated data environment.

### High-Level Architecture

```
+------------------------------------------------------------------+
|                          CLIENT LAYER                             |
|                                                                  |
|   +----------------+    +----------------+    +----------------+  |
|   |  React 19 SPA  |    |  Mobile App    |    |  Third-Party   |  |
|   |  (Vite 8)      |    |  (Future)      |    |  Integrations  |  |
|   +-------+--------+    +-------+--------+    +-------+--------+  |
|           |                     |                     |           |
+-----------+---------------------+---------------------+-----------+
            |                     |                     |
            v                     v                     v
+------------------------------------------------------------------+
|                         API GATEWAY                               |
|                                                                  |
|   +------------------------------------------------------------+ |
|   |  Rate Limiter  |  JWT Auth  |  RBAC  |  Request Validator | |
|   +------------------------------------------------------------+ |
+------------------------------------------------------------------+
            |                     |                     |
            v                     v                     v
+------------------------------------------------------------------+
|                       SERVICE LAYER                               |
|                                                                  |
|   +----------+  +----------+  +----------+  +----------+         |
|   |  Auth    |  |  CRM     |  |  AI      |  |  Billing |         |
|   |  Service |  |  Service |  |  Service |  |  Service |         |
|   +----------+  +----------+  +----------+  +----------+         |
|   +----------+  +----------+  +----------+  +----------+         |
|   |  Email   |  |  Report  |  |  Workflow|  |  Notif   |         |
|   |  Service |  |  Service |  |  Service |  |  Service |         |
|   +----------+  +----------+  +----------+  +----------+         |
+------------------------------------------------------------------+
            |                     |                     |
            v                     v                     v
+------------------------------------------------------------------+
|                        DATA LAYER                                 |
|                                                                  |
|   +----------------+    +----------------+    +----------------+  |
|   |  PostgreSQL    |    |  Redis         |    |  File Storage  |  |
|   |  (Supabase)    |    |  (Cache/Queue) |    |  (S3/R2)      |  |
|   +----------------+    +----------------+    +----------------+  |
+------------------------------------------------------------------+
            |                     |
            v                     v
+------------------------------------------------------------------+
|                     EXTERNAL SERVICES                             |
|                                                                  |
|   +------------+  +------------+  +------------+  +-----------+  |
|   | OpenAI     |  | Google     |  | Stripe     |  | SendGrid  |  |
|   | GPT-4      |  | Gemini     |  | Payments   |  | Email     |  |
|   +------------+  +------------+  +------------+  +-----------+  |
+------------------------------------------------------------------+
```

### Core Design Principles

| Principle | Description |
|-----------|-------------|
| **Separation of Concerns** | Frontend, backend, and AI services are independently deployable |
| **Multi-Tenancy** | Data isolation at the database level via organization_id foreign keys |
| **API-First** | All features exposed through RESTful API endpoints |
| **Event-Driven** | Background jobs for notifications, emails, and AI processing |
| **Security by Default** | JWT authentication, RBAC, encryption, and audit logging at every layer |

---

## 2. Frontend Architecture

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript 6 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Component Library | shadcn/ui (base-nova style) |
| State Management | Zustand |
| Server State | TanStack Query |
| Routing | React Router v7 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Icons | Lucide React |

### Component Architecture

```
src/
+-- app/                          # Application shell, routing, layout
|   +-- layout/                   # Root layout, sidebar, topbar
|   +-- routes/                   # Route definitions and guards
|
+-- components/                   # Shared/reusable components
|   +-- ui/                       # shadcn/ui base components (Button, Dialog, Table, etc.)
|   +-- layout/                   # Sidebar, Topbar, Breadcrumb, CommandPalette
|   +-- data-display/             # DataTable, KanbanBoard, Charts
|   +-- forms/                    # FormField, FormSection, FormActions
|   +-- feedback/                 # Toast, Alert, Skeleton, EmptyState
|   +-- ai/                       # AIChat, AIInsightCard, AIAssistant
|
+-- features/                     # Domain-specific feature modules
|   +-- auth/                     # Login, Register, ForgotPassword, MFA
|   +-- dashboard/                # KPI cards, charts, widgets
|   +-- leads/                    # Lead list, detail, pipeline
|   +-- contacts/                 # Contact list, detail
|   +-- companies/                # Company directory, detail
|   +-- deals/                    # Deal pipeline, Kanban, detail
|   +-- tasks/                    # Task list, board, calendar view
|   +-- calendar/                 # Day/week/month views
|   +-- emails/                   # Inbox, compose, templates
|   +-- meetings/                 # Meeting scheduler, detail
|   +-- marketing/                # Campaigns, forms, landing pages
|   +-- support/                  # Tickets, knowledge base
|   +-- reports/                  # Report builder, dashboards
|   +-- ai-assistant/             # AI copilot panel, suggestions
|   +-- settings/                 # Profile, organization, preferences
|   +-- admin/                    # Users, roles, teams, audit logs
|   +-- billing/                  # Plans, subscriptions, invoices
|
+-- hooks/                        # Custom React hooks
|   +-- use-auth.ts
|   +-- use-debounce.ts
|   +-- use-local-storage.ts
|   +-- use-media-query.ts
|   +-- use-pagination.ts
|   +-- use-permissions.ts
|
+-- lib/                          # Utilities and helpers
|   +-- utils.ts                  # cn(), formatCurrency(), formatDate()
|   +-- api-client.ts             # Axios/fetch wrapper with interceptors
|   +-- constants.ts              # API routes, config values
|   +-- validators.ts             # Zod schemas
|
+-- stores/                       # Zustand stores
|   +-- auth-store.ts
|   +-- ui-store.ts               # Sidebar state, theme, command palette
|   +-- notification-store.ts
|
+-- types/                        # TypeScript type definitions
|   +-- api.ts                    # API request/response types
|   +-- models.ts                 # Domain entity types
|   +-- index.ts                  # Re-exports
```

### Rendering Strategy

- **SPA (Single Page Application)**: Client-side routing with React Router v7
- **Code Splitting**: Route-based lazy loading via `React.lazy()` and `Suspense`
- **SSR**: Not planned initially; SPA is sufficient for B2B CRM
- **ISR/SSG**: Not applicable for authenticated dashboard application

### State Management Pattern

```
Server State (TanStack Query)
    |
    +-- API calls, caching, mutations, optimistic updates
    +-- Automatic cache invalidation
    +-- Background refetching
    +-- Pagination and infinite scroll support

Client State (Zustand)
    |
    +-- Authentication state (user, token, permissions)
    +-- UI state (sidebar collapsed, theme, command palette open)
    +-- Notification state (unread count, recent notifications)
    +-- Form wizard state (multi-step forms)
```

### Component Design Patterns

1. **Compound Components**: Complex components like DataTable, KanbanBoard
2. **Render Props**: For flexible data rendering in lists
3. **Custom Hooks**: Encapsulate reusable logic (auth, pagination, permissions)
4. **Feature Modules**: Domain logic isolated in `/features` directory
5. **Provider Pattern**: AuthProvider, QueryProvider, ThemeProvider wrap the app

---

## 3. Backend Architecture

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 22 LTS |
| Framework | Express.js (or Fastify) |
| Language | TypeScript |
| ORM | Prisma |
| Database | PostgreSQL (Supabase) |
| Cache | Redis |
| Authentication | JWT (access + refresh tokens) |
| Validation | Zod |
| Queue | BullMQ (Redis-backed) |
| File Storage | Supabase Storage / AWS S3 |

### Layered Architecture

```
+----------------------------------------------------------+
|                  CONTROLLER LAYER                         |
|                                                          |
|  Handles HTTP requests, validates input, returns         |
|  responses. Thin layer - delegates to services.          |
|                                                          |
|  /src/modules/*/controller.ts                            |
+----------------------------------------------------------+
            |
            v
+----------------------------------------------------------+
|                  SERVICE LAYER                            |
|                                                          |
|  Contains business logic. Orchestrates operations.       |
|  No HTTP/express dependencies here.                      |
|                                                          |
|  /src/modules/*/service.ts                               |
+----------------------------------------------------------+
            |
            v
+----------------------------------------------------------+
|                  REPOSITORY LAYER                         |
|                                                          |
|  Data access via Prisma. Handles queries, transactions.  |
|  Abstracts database from service layer.                  |
|                                                          |
|  /src/modules/*/repository.ts                            |
+----------------------------------------------------------+
            |
            v
+----------------------------------------------------------+
|                  DATABASE LAYER                           |
|                                                          |
|  PostgreSQL via Prisma ORM. Migrations, seeds.           |
|                                                          |
|  /prisma/schema.prisma                                   |
+----------------------------------------------------------+
```

### Module Structure

Each domain module follows this structure:

```
src/modules/
+-- auth/
|   +-- auth.controller.ts     # POST /login, POST /register, POST /refresh
|   +-- auth.service.ts        # Validate credentials, generate tokens, hash passwords
|   +-- auth.repository.ts     # Find user by email, create user, update password
|   +-- auth.routes.ts         # Route definitions
|   +-- auth.types.ts          # Request/response DTOs
|   +-- auth.validation.ts     # Zod schemas for input validation
|   +-- auth.middleware.ts     # Token verification middleware
|
+-- leads/
|   +-- leads.controller.ts
|   +-- leads.service.ts
|   +-- leads.repository.ts
|   +-- leads.routes.ts
|   +-- leads.types.ts
|   +-- leads.validation.ts
|
+-- [same pattern for all modules]
```

### Middleware Pipeline

```
Request
    |
    v
[CORS] --> [Rate Limiter] --> [Body Parser] --> [Request Logger]
    |
    v
[JWT Auth Middleware] --> [RBAC Permission Check]
    |
    v
[Input Validation (Zod)] --> [Controller]
    |
    v
[Service] --> [Repository] --> [Database]
    |
    v
[Response Serializer] --> [Audit Logger] --> Response
```

### Background Job Processing

```
+----------------+     +-----------------+     +-------------------+
| Trigger Event  | --> | BullMQ Queue    | --> | Worker Process    |
| (DB trigger,   |     | (Redis-backed)  |     | (Isolated)        |
|  API call,     |     |                 |     |                   |
|  scheduled)    |     | - Email Queue   |     | - Send emails     |
+----------------+     | - AI Queue      |     | - AI processing   |
                       | - Report Queue  |     | - Report gen      |
                       | - Export Queue  |     | - CSV exports     |
                       | - Webhook Queue |     | - Webhook calls   |
                       +-----------------+     +-------------------+
```

---

## 4. Data Flow Diagrams

### Authentication Flow

```
+--------+          +-----------+          +----------+          +--------+
| Client |          | API       |          | Auth     |          | DB     |
|        |          | Gateway   |          | Service  |          |        |
+---+----+          +-----+-----+          +----+-----+          +---+----+
    |                     |                    |                    |
    | POST /auth/login   |                    |                    |
    | {email, password}  |                    |                    |
    +-------------------->+                    |                    |
    |                     | validate input    |                    |
    |                     +------------------->+                    |
    |                     |                    | find user by email |
    |                     |                    +------------------->+
    |                     |                    |  user record       |
    |                     |                    +<-------------------+
    |                     |                    |                    |
    |                     |                    | bcrypt.compare()   |
    |                     |                    | generate JWT       |
    |                     |  {accessToken,     |                    |
    |                     |   refreshToken}    |                    |
    |                     +<-------------------+                    |
    |  {accessToken,      |                    |                    |
    |   refreshToken,     |                    |                    |
    |   user}             |                    |                    |
    +<--------------------+                    |                    |
    |                     |                    |                    |
    | GET /api/leads     |                    |                    |
    | Authorization:      |                    |                    |
    | Bearer <token>      |                    |                    |
    +-------------------->+                    |                    |
    |                     | verify JWT         |                    |
    |                     +------------------->+                    |
    |                     |  decoded user      |                    |
    |                     +<-------------------+                    |
    |                     |                    |                    |
    |                     | find leads WHERE   |                    |
    |                     | org_id = user.org  |                    |
    |                     +--------------------------------------->+
    |                     |  leads[]           |                    |
    |                     +<---------------------------------------+
    |  {leads[], total,   |                    |                    |
    |   page, pageSize}   |                    |                    |
    +<--------------------+                    |                    |
```

### AI Lead Scoring Flow

```
+--------+       +---------+       +----------+       +--------+       +--------+
| Client |       | API     |       | AI       |       | OpenAI |       | DB     |
|        |       | Server  |       | Service  |       | GPT-4  |       |        |
+---+----+       +----+----+       +----+-----+       +---+----+       +---+----+
    |                 |                 |                  |                |
    | POST /ai/score |                 |                  |                |
    | {leadId}       |                 |                  |                |
    +---------------->+                 |                  |                |
    |                 | get lead data   |                  |                |
    |                 +----------------------------------------------->    |
    |                 | lead + history  |                  |                |
    |                 +<----------------------------------------------    |
    |                 |                 |                  |                |
    |                 | scoreLead()     |                  |                |
    |                 +---------------->+                  |                |
    |                 |                 | build prompt     |                |
    |                 |                 | with lead data   |                |
    |                 |                 | + interaction    |                |
    |                 |                 | history          |                |
    |                 |                 |                  |                |
    |                 |                 | POST /chat/      |                |
    |                 |                 | completions      |                |
    |                 |                 +----------------->+                |
    |                 |                 |                  | AI response    |
    |                 |                 |                  | (score,        |
    |                 |                 |                  |  reasoning)    |
    |                 |                 +<-----------------+                |
    |                 |                 |                  |                |
    |                 |                 | parse response   |                |
    |                 |                 | update lead      |                |
    |                 |                 +---------------------------------->+
    |                 |                 | lead.updated     |                |
    |                 |                 +<----------------------------------+
    |                 |  {score,        |                  |                |
    |                 |   reasoning,    |                  |                |
    |                 |   suggestions}  |                  |                |
    |                 +<----------------+                  |                |
    |  {score,        |                 |                  |                |
    |   reasoning,    |                 |                  |                |
    |   suggestions}  |                 |                  |                |
    +<----------------+                 |                  |                |
```

### Deal Pipeline Data Flow

```
+---------+    +-------+    +---------+    +------+    +-------+
| Create  |--->| Valid |--->| Persist |--->| Emit |--->| Notif |
| Deal    |    | Input |    | to DB   |    | Event|    | Users |
+---------+    +-------+    +---------+    +------+    +-------+
                                    |
                                    v
                             +-----------+
                             | Update    |
                             | Pipeline  |
                             | Metrics   |
                             +-----------+
                                    |
                                    v
                             +-----------+
                             | AI        |
                             | Predict   |
                             | Close     |
                             | Date      |
                             +-----------+
```

### Real-Time Notification Flow

```
+--------+     +---------+     +----------+     +--------+     +--------+
| Action |     | API     |     | Notif    |     | Redis  |     | Client |
| (any)  |     | Server  |     | Service  |     | Pub/Sub|     | (WS)   |
+---+----+     +----+----+     +----+-----+     +---+----+     +---+----+
    |               |               |               |              |
    | trigger       |               |               |              |
    +-------------->+               |               |              |
    |               | create notif  |               |              |
    |               +-------------->+               |              |
    |               |               | store in DB   |              |
    |               |               +-------------->+              |
    |               |               |               | publish      |
    |               |               |               +------------->+
    |               |               |               |              |
    |               |               |               | display toast|
    |               |               |               | update badge |
    |               |               |               |              |
```

---

## 5. Deployment Architecture

### Production Deployment

```
+------------------------------------------------------------------+
|                        PRODUCTION ENV                              |
|                                                                  |
|  +------------------+          +-------------------------------+ |
|  |  Vercel          |          |  Railway / Render              | |
|  |  (Frontend)      |          |  (Backend API)                 | |
|  |                  |  HTTPS   |                               | |
|  |  - React SPA     |<-------->|  - Node.js + Express          | |
|  |  - Vite Build    |  REST    |  - TypeScript                 | |
|  |  - CDN Global    |  API     |  - Prisma                     | |
|  |  - Auto Deploy   |          |  - Auto Deploy                | |
|  +------------------+          +---------------+---------------+ |
|                                            |                     |
|                                            v                     |
|                                +-------------------------------+ |
|                                |  Supabase                      | |
|                                |                                | |
|                                |  - PostgreSQL (managed)        | |
|                                |  - Auth (optional)             | |
|                                |  - Storage (files/attachments) | |
|                                |  - Realtime (WebSocket)        | |
|                                +-------------------------------+ |
|                                            |                     |
|                                            v                     |
|                                +-------------------------------+ |
|                                |  Upstash Redis                 | |
|                                |                                | |
|                                |  - Session cache               | |
|                                |  - Rate limiting               | |
|                                |  - BullMQ job queue            | |
|                                |  - Real-time pub/sub           | |
|                                +-------------------------------+ |
+------------------------------------------------------------------+
```

### Environment Strategy

| Environment | Frontend | Backend | Database | Purpose |
|-------------|----------|---------|----------|---------|
| **Development** | localhost:5173 | localhost:3000 | Local PostgreSQL / Supabase dev | Local development |
| **Preview** | Vercel preview URL | Railway PR environment | Supabase staging | PR preview/testing |
| **Staging** | staging.novacrm.ai | staging-api.novacrmai.com | Supabase staging | Pre-production QA |
| **Production** | novacrm.ai | api.novacrmai.com | Supabase production | Live users |

### CI/CD Pipeline

```
+--------+     +----------+     +--------+     +---------+     +----------+
| GitHub |     | GitHub   |     | Lint + |     | Build   |     | Deploy   |
| Push/  |---->| Actions  |---->| Test   |---->|         |---->|          |
| PR     |     | Trigger  |     |        |     |         |     |          |
+--------+     +----------+     +--------+     +---------+     +----------+
                                    |              |               |
                                    v              v               v
                               +--------+    +---------+    +----------+
                               | Oxlint |    | tsc     |    | Vercel   |
                               | Prettier|   | vite    |    | Railway  |
                               | Vitest |    | build   |    | Supabase |
                               +--------+    +---------+    +----------+
```

---

## 6. Security Architecture

### Authentication & Authorization

```
+----------------------------------------------------------+
|                    AUTHENTICATION                          |
|                                                          |
|  1. User submits credentials (email + password)          |
|  2. Backend validates against bcrypt hash                |
|  3. Backend issues:                                      |
|     - Access Token (JWT, 15 min expiry)                  |
|     - Refresh Token (JWT, 7 days expiry, HttpOnly cookie)|
|  4. Client stores access token in memory/localStorage    |
|  5. Client attaches Bearer token to all API requests     |
|  6. On 401, client attempts refresh via /auth/refresh    |
|  7. On refresh failure, redirect to login                |
+----------------------------------------------------------+

+----------------------------------------------------------+
|                 AUTHORIZATION (RBAC)                      |
|                                                          |
|  Roles: super_admin, org_admin, sales_manager,           |
|         sales_executive, marketing_manager,              |
|         support_agent, hr, finance, viewer               |
|                                                          |
|  Permissions: per-resource, per-action                   |
|  (leads:create, leads:read, leads:update, leads:delete)  |
|                                                          |
|  Check: role -> permissions -> resource access            |
+----------------------------------------------------------+
```

### Security Layers

| Layer | Mechanism | Implementation |
|-------|-----------|----------------|
| **Transport** | TLS 1.3 | Enforced by Vercel/Railway/Supabase |
| **Authentication** | JWT (RS256) | Access + Refresh token pair |
| **Authorization** | RBAC | Role-permission matrix checked per route |
| **Input Validation** | Zod schemas | Every API endpoint validates input |
| **SQL Injection** | Prisma ORM | Parameterized queries, no raw SQL |
| **XSS** | React escaping + CSP | React auto-escapes; CSP headers set |
| **CSRF** | SameSite cookies | Refresh token in HttpOnly SameSite=Strict cookie |
| **Rate Limiting** | Redis-based | 100 req/min general, 5 req/min auth endpoints |
| **Encryption at Rest** | AES-256 | PostgreSQL column encryption for sensitive fields |
| **Audit Logging** | audit_logs table | All create/update/delete operations logged |
| **File Upload** | Validation | Type checking, size limits, virus scanning |
| **Secrets** | Environment vars | No secrets in code; managed via platform env |

### JWT Token Structure

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "uuid-user-id",
    "org_id": "uuid-org-id",
    "role": "sales_manager",
    "permissions": ["leads:read", "leads:write", "deals:read"],
    "iat": 1700000000,
    "exp": 1700000900,
    "iss": "novacrm-api"
  }
}
```

### Data Isolation (Multi-Tenancy)

Every database query is scoped to the authenticated user's `organization_id`. Repository methods automatically inject this filter:

```
Request -> JWT decode -> org_id extracted
    -> Repository query: WHERE org_id = :org_id AND ...
    -> Result: Only organization data returned
```

---

## 7. AI Service Integration

### AI Architecture Overview

```
+----------------------------------------------------------+
|                    AI SERVICE LAYER                        |
|                                                          |
|  +-------------------+    +---------------------------+  |
|  |  AI Router        |    |  Prompt Templates         |  |
|  |                   |    |                           |  |
|  |  Routes requests  |    |  - Lead scoring           |  |
|  |  to appropriate   |    |  - Email generation       |  |
|  |  model/provider   |    |  - Deal prediction        |  |
|  +---------+---------+    |  - Meeting summary        |  |
|            |              |  - Next best action       |  |
|            v              |  - Document summary       |  |
|  +-------------------+    +---------------------------+  |
|  |  Provider Adapters |                                  |
|  |                   |    +---------------------------+  |
|  |  - OpenAI Adapter |    |  Context Manager           |  |
|  |  - Gemini Adapter |    |                           |  |
|  |  - Local Adapter  |    |  Assembles relevant CRM   |  |
|  |    (future)       |    |  data as context for AI   |  |
|  +-------------------+    +---------------------------+  |
+----------------------------------------------------------+
            |                          |
            v                          v
+-------------------+      +-------------------+
| OpenAI API        |      | Google Gemini API  |
| (GPT-4o)          |      | (Gemini Pro)       |
+-------------------+      +-------------------+
```

### AI Feature Matrix

| Feature | Model | Trigger | Input | Output |
|---------|-------|---------|-------|--------|
| Lead Scoring | GPT-4o | On lead create/update | Lead data + history | Score (1-100), reasoning |
| Email Generation | GPT-4o | User request | Contact context + intent | Draft email body |
| Deal Prediction | GPT-4o | On deal update | Deal data + pipeline | Win probability, close date |
| Meeting Summary | Gemini Pro | Post-meeting | Transcript/notes | Summary + action items |
| Next Best Action | GPT-4o | On demand | Lead/deal context | Recommended actions |
| Smart Search | GPT-4o | User query | Natural language query | SQL-like filter results |
| Document Summary | Gemini Pro | File upload | Document content | Summary + key points |
| AI Copilot | GPT-4o | Chat interface | User prompt + CRM context | Response + suggested actions |

### Context Assembly

For each AI request, the context manager assembles relevant CRM data:

```
System Prompt (role, rules, output format)
    +
Organization Context (industry, size, products)
    +
Entity Context (specific lead/deal/contact data)
    +
Historical Context (past interactions, notes, activities)
    +
User Context (current user role, preferences)
    =
Complete Prompt -> AI Provider -> Response -> Parse & Store
```

---

## 8. Scalability Considerations

### Horizontal Scaling

```
+----------------------------------------------------------+
|                     LOAD BALANCER                          |
|                  (Platform managed)                        |
+----------------------------------------------------------+
        |                    |                    |
        v                    v                    v
+----------+          +----------+          +----------+
| API      |          | API      |          | API      |
| Instance |          | Instance |          | Instance |
| 1        |          | 2        |          | N        |
+----------+          +----------+          +----------+
        |                    |                    |
        +--------------------+--------------------+
                             |
                             v
                    +-----------------+
                    | Shared Redis    | (sessions, cache)
                    +-----------------+
                             |
                             v
                    +-----------------+
                    | PostgreSQL      | (Supabase managed)
                    | Read Replicas   |
                    +-----------------+
```

### Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| First Contentful Paint | < 1.5s | Vite code splitting, CDN |
| Largest Contentful Paint | < 2.5s | Image optimization, lazy loading |
| Time to Interactive | < 3s | Tree shaking, bundle analysis |
| API Response Time (p95) | < 300ms | Redis caching, query optimization |
| API Response Time (p99) | < 500ms | Database indexes, connection pooling |
| Database Query Time | < 50ms | Indexes, Prisma query optimization |
| Concurrent Users | 10,000+ | Horizontal scaling, load balancing |
| Uptime | 99.9% | Health checks, auto-restart, redundancy |

### Caching Strategy

| Layer | What | TTL | Tool |
|-------|------|-----|------|
| **Browser** | Static assets, API responses | Varies | HTTP Cache-Control headers |
| **CDN** | JS bundles, CSS, images | 1 year | Vercel Edge Network |
| **Application** | Dashboard KPIs, aggregations | 5 min | Redis |
| **Application** | User sessions, permissions | 15 min | Redis |
| **Application** | AI responses (repeated prompts) | 1 hour | Redis |
| **Database** | Query result cache | N/A | PostgreSQL (materialized views) |

### Database Optimization

- **Connection Pooling**: Supabase PgBouncer (default pool size: 20)
- **Read Replicas**: For report queries and analytics (future)
- **Partitioning**: audit_logs, activities, notifications partitioned by month
- **Archiving**: Data older than 2 years moved to cold storage
- **Indexes**: Composite indexes on frequently filtered columns (org_id + status, org_id + created_at)
