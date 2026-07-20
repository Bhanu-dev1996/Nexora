# NovaCRM AI — Implementation Plan

> Enterprise AI-Powered CRM Platform  
> Phase-by-phase delivery plan — 22 weeks, 8 phases

---

## Overview

| Phase | Name | Weeks | Key Deliverables |
|-------|------|-------|-----------------|
| 1 | Foundation | 1–3 | Project scaffolding, database, auth, base UI |
| 2 | Core CRM | 4–7 | Leads, contacts, companies, deals, tasks |
| 3 | Productivity | 8–10 | Calendar, email, notifications, search |
| 4 | Analytics | 11–12 | Reports, dashboards, charts, export |
| 5 | AI Features | 13–15 | Copilot, scoring, email gen, summaries, smart search |
| 6 | Automation | 16–17 | Workflows, triggers, approvals, webhooks |
| 7 | Enterprise | 18–20 | Admin panel, billing, multi-tenancy, API keys, audit logs |
| 8 | Polish & Launch | 21–22 | Testing, performance, security, deployment, docs |

**Tech Stack Reference**

- **Frontend:** React 19, TypeScript 6, Vite 8, Tailwind CSS v4, shadcn/ui (base-nova style), Lucide icons, TanStack Query, Zustand
- **Backend:** Node.js, Express, Prisma ORM, PostgreSQL, Redis
- **AI:** OpenAI GPT-4, Google Gemini
- **Infra:** Vercel (FE), Render (BE), Supabase (DB), Redis Cloud

---

## Phase 1 — Foundation (Weeks 1–3)

> Goal: Ship a runnable application skeleton with authentication, a design system, and a deployment pipeline.

### Week 1 — Project Scaffolding & Tooling

#### Task 1.1 — Repository & Monorepo Setup
- Initialize Git repository with GitHub Flow branching strategy.
- Configure `package.json` workspaces (or Turborepo) for monorepo layout:
  ```
  /
  ├── apps/
  │   ├── web/          ← React 19 + Vite 8 frontend
  │   └── api/          ← Express backend
  ├── packages/
  │   ├── ui/           ← Shared shadcn/ui components (base-nova theme)
  │   ├── tsconfig/     ← Shared TypeScript configs
  │   └── eslint/       ← Shared lint rules
  ├── prisma/           ← Schema & migrations
  ├── docs/
  ├── docker-compose.yml
  └── turbo.json
  ```
- Add root-level `package.json` scripts: `dev`, `build`, `lint`, `test`, `typecheck`.
- Configure `.gitignore` for Node, Vite, Prisma, env files, IDE artifacts.
- Add `.editorconfig` for consistent formatting across contributors.

#### Task 1.2 — Frontend Scaffolding
- Scaffold React 19 project with Vite 8 (`react-ts` template).
- Install and configure Tailwind CSS v4 with the `base-nova` shadcn/ui theme.
- Initialize shadcn/ui CLI; install core components: `Button`, `Input`, `Card`, `Dialog`, `DropdownMenu`, `Toast`, `Avatar`, `Badge`, `Table`, `Tabs`, `Tooltip`.
- Configure Lucide icons package.
- Set up path aliases (`@/components`, `@/hooks`, `@/lib`, `@/stores`).
- Configure Vite proxy for `/api` → `localhost:4000` during development.
- Add React 19 compiler plugin to Vite config for automatic memoization.
- Create base layout shell: `AppShell` with sidebar, topbar, and content area.

#### Task 1.3 — Backend Scaffolding
- Initialize Node.js project with TypeScript (ESM modules).
- Install Express, helmet, cors, morgan, compression, dotenv, zod.
- Create Express application factory pattern:
  ```
  src/
  ├── app.ts            ← Express app configuration
  ├── server.ts         ← HTTP server entry
  ├── config/
  │   ├── env.ts        ← Validated env schema (zod)
  │   └── redis.ts      ← Redis client setup
  ├── middleware/
  │   ├── errorHandler.ts
  │   ├── rateLimiter.ts
  │   ├── authenticate.ts
  │   └── validate.ts
  ├── routes/
  │   └── index.ts      ← Route registry
  ├── controllers/
  ├── services/
  ├── lib/
  │   ├── prisma.ts     ← Prisma client singleton
  │   └── redis.ts      ← Redis client singleton
  └── types/
  ```
- Configure global error handler with typed AppError class.
- Add request logging (morgan + custom structured logger).
- Add CORS configuration for frontend origin.
- Add rate limiting with Redis store (100 req/min general, 10 req/min auth).
- Add request ID middleware (UUID per request for tracing).
- Add response compression (gzip).
- Add security headers via helmet.

#### Task 1.4 — Development Environment
- Create `.env.example` for both frontend and backend with all required variables.
- Configure VS Code `settings.json` and `extensions.json` for the team.
- Set up Husky + lint-staged for pre-commit hooks (lint, format, typecheck).
- Add Oxlint configuration for fast linting.
- Add Prettier configuration with Tailwind CSS plugin.
- Create `Makefile` or npm scripts for common dev commands.

### Week 2 — Database & Authentication

#### Task 2.1 — Database Schema (Prisma)
- Initialize Prisma with PostgreSQL provider.
- Design and implement core schema models:

  **User & Auth**
  ```prisma
  model User {
    id            String    @id @default(cuid())
    email         String    @unique
    passwordHash  String
    firstName     String
    lastName      String
    avatar        String?
    role          UserRole  @default(MEMBER)
    isActive      Boolean   @default(true)
    lastLoginAt   DateTime?
    createdAt     DateTime  @default(now())
    updatedAt     DateTime  @updatedAt
    organization  Organization @relation(fields: [organizationId], references: [id])
    organizationId String
    // relations: tasks, activities, deals (as owner), etc.
  }

  enum UserRole {
    SUPER_ADMIN
    ADMIN
    MANAGER
    MEMBER
    VIEWER
  }
  ```

  **Organization (Multi-tenancy)**
  ```prisma
  model Organization {
    id          String   @id @default(cuid())
    name        String
    slug        String   @unique
    logo        String?
    plan        PlanType @default(FREE)
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
    users       User[]
    contacts    Contact[]
    companies   Company[]
    deals       Deal[]
    pipelines   Pipeline[]
    tasks       Task[]
    // ... more relations
  }

  enum PlanType {
    FREE
    STARTER
    PROFESSIONAL
    ENTERPRISE
  }
  ```

  **CRM Core**
  ```prisma
  model Contact {
    id              String   @id @default(cuid())
    email           String?
    firstName       String
    lastName        String
    phone           String?
    avatar          String?
    jobTitle        String?
    lifecycleStage  LifecycleStage @default(LEAD)
    leadSource      String?
    score           Int      @default(0)
    tags            String[]
    customFields    Json?
    createdAt       DateTime @default(now())
    updatedAt       DateTime @updatedAt
    organizationId  String
    owner           User?    @relation(fields: [ownerId], references: [id])
    ownerId         String?
    company         Company? @relation(fields: [companyId], references: [id])
    companyId       String?
    deals           Deal[]
    activities      Activity[]
    notes           Note[]
  }

  enum LifecycleStage {
    SUBSCRIBER
    LEAD
    MQL
    SQL
    OPPORTUNITY
    CUSTOMER
    EVANGELIST
  }

  model Company {
    id              String   @id @default(cuid())
    name            String
    domain          String?
    industry        String?
    size            String?
    logo            String?
    address         String?
    phone           String?
    website         String?
    annualRevenue   Float?
    customFields    Json?
    createdAt       DateTime @default(now())
    updatedAt       DateTime @updatedAt
    organizationId  String
    contacts        Contact[]
    deals            Deal[]
  }

  model Deal {
    id              String     @id @default(cuid())
    title           String
    value           Float
    currency        String     @default("USD")
    stage           DealStage  @default(QUALIFICATION)
    probability     Int        @default(0)
    expectedClose   DateTime?
    closedAt        DateTime?
    lostReason      String?
    createdAt       DateTime  @default(now())
    updatedAt       DateTime  @updatedAt
    organizationId  String
    pipelineId      String
    pipeline        Pipeline   @relation(fields: [pipelineId], references: [id])
    ownerId         String?
    owner           User?      @relation(fields: [ownerId], references: [id])
    contactId       String?
    contact         Contact?   @relation(fields: [contactId], references: [id])
    companyId       String?
    company         Company?   @relation(fields: [companyId], references: [id])
    activities      Activity[]
    notes           Note[]
  }

  enum DealStage {
    QUALIFICATION
    NEEDS_ANALYSIS
    PROPOSAL
    NEGOTIATION
    CLOSED_WON
    CLOSED_LOST
  }

  model Pipeline {
    id              String   @id @default(cuid())
    name            String
    isDefault       Boolean  @default(false)
    stages          Json     // Array of stage configs
    createdAt       DateTime @default(now())
    updatedAt       DateTime @updatedAt
    organizationId  String
    deals           Deal[]
  }
  ```

  **Activity & Task Models**
  ```prisma
  model Activity {
    id              String   @id @default(cuid())
    type            ActivityType
    subject         String
    description     String?
    date            DateTime @default(now())
    duration        Int?     // minutes
    contactId       String?
    dealId          String?
    userId          String
    createdAt       DateTime @default(now())
  }

  enum ActivityType {
    CALL
    EMAIL
    MEETING
    NOTE
    TASK
    WHATSAPP
  }

  model Task {
    id              String     @id @default(cuid())
    title           String
    description     String?
    dueDate         DateTime?
    priority        TaskPriority @default(MEDIUM)
    status          TaskStatus   @default(PENDING)
    createdAt       DateTime   @default(now())
    updatedAt       DateTime   @updatedAt
    organizationId  String
    assigneeId      String?
    assignee        User?      @relation(fields: [assigneeId], references: [id])
    contactId       String?
    dealId          String?
  }

  enum TaskPriority { LOW, MEDIUM, HIGH, URGENT }
  enum TaskStatus { PENDING, IN_PROGRESS, COMPLETED, CANCELLED }
  ```

  **Note Model**
  ```prisma
  model Note {
    id              String   @id @default(cuid())
    content         String
    isPinned        Boolean  @default(false)
    createdAt       DateTime @default(now())
    updatedAt       DateTime @updatedAt
    userId          String
    contactId       String?
    dealId          String?
  }
  ```

- Run initial migration: `npx prisma migrate dev --name init`.
- Create Prisma seed script with TypeScript.
- Configure Prisma Studio access for development.

#### Task 2.2 — Authentication System
- **Registration endpoint** (`POST /api/auth/register`):
  - Validate input with Zod (email, password, firstName, lastName, orgName).
  - Hash password with bcrypt (12 rounds).
  - Create organization and user in a Prisma transaction.
  - Generate JWT access token (15 min) and refresh token (7 days).
  - Store refresh token hash in Redis with TTL.
  - Return tokens and user profile.

- **Login endpoint** (`POST /api/auth/login`):
  - Validate credentials against stored hash.
  - Update `lastLoginAt` timestamp.
  - Generate new token pair.
  - Return tokens and user profile.

- **Token refresh** (`POST /api/auth/refresh`):
  - Validate refresh token against Redis store.
  - Rotate refresh token (invalidate old, issue new).
  - Issue new access token.

- **Logout** (`POST /api/auth/logout`):
  - Invalidate refresh token in Redis.
  - Return 204 No Content.

- **Password reset flow**:
  - `POST /api/auth/forgot-password` — generate 6-digit code, store in Redis (15 min TTL), send email.
  - `POST /api/auth/reset-password` — validate code, update password, invalidate all sessions.

- **Middleware**:
  - `authenticate` — verify JWT, attach `req.user`.
  - `authorize(...roles)` — role-based access control.
  - `requireOrganization` — ensure user belongs to an organization.

- **JWT configuration**:
  - Access token: RS256, 15-minute expiry.
  - Refresh token: random 64-byte hex, stored as SHA-256 hash in Redis.
  - Token family tracking for refresh token rotation detection.

### Week 3 — Layout, Design System & CI/CD

#### Task 3.1 — Application Layout
- Build `AppShell` component:
  - Collapsible sidebar with navigation groups (CRM, Activities, Analytics, Settings).
  - Top bar with global search trigger, notifications bell, user menu dropdown.
  - Breadcrumb navigation.
  - Responsive: sidebar collapses to icons on tablet, becomes drawer on mobile.
- Sidebar navigation items:
  ```
  CRM
  ├── Dashboard
  ├── Contacts
  ├── Companies
  ├── Deals
  └── Pipeline
  Activities
  ├── Tasks
  ├── Calendar
  └── Email
  Analytics
  ├── Reports
  └── Dashboards
  Automation
  ├── Workflows
  └── Webhooks
  Settings
  ├── General
  ├── Members
  ├── Billing
  ├── API Keys
  └── Audit Log
  ```
- Implement route-based active state highlighting.
- Add keyboard shortcut indicator in sidebar items.
- Persist sidebar state (collapsed/expanded) in localStorage via Zustand.

#### Task 3.2 — Design System Components
- Configure shadcn/ui `base-nova` theme tokens:
  - Color palette: primary, secondary, accent, muted, destructive, border, input, ring, background, foreground, card, popover.
  - Typography scale: h1–h6, body, small, caption.
  - Spacing scale: consistent 4px grid.
  - Border radius tokens.
  - Shadow tokens.
  - Animation tokens (fade, slide, scale).
- Build shared layout components:
  - `PageHeader` — title, description, action buttons slot.
  - `PageContainer` — max-width wrapper with padding.
  - `EmptyState` — icon, title, description, action button.
  - `LoadingState` — skeleton loaders matching content shapes.
  - `ErrorState` — error icon, message, retry button.
- Build data display components:
  - `DataTable` — wrapper around TanStack Table with sorting, filtering, pagination, row selection, bulk actions.
  - `StatsCard` — metric display with trend indicator.
  - `Timeline` — chronological activity feed.
  - `AvatarGroup` — stacked avatars with count overflow.
- Build form components:
  - `Form` — React Hook Form + Zod resolver integration.
  - `FormField` — label, input, error message, helper text.
  - `SearchInput` — debounced search with icon.
  - `MultiSelect` — combobox with async search.
  - `DatePicker` — calendar popover with range support.

#### Task 3.3 — Global State & Data Layer
- Set up Zustand stores:
  ```typescript
  // stores/auth.store.ts
  interface AuthState {
    user: User | null;
    organization: Organization | null;
    isAuthenticated: boolean;
    login: (credentials: LoginInput) => Promise<void>;
    logout: () => void;
    refreshToken: () => Promise<void>;
  }

  // stores/ui.store.ts
  interface UIState {
    sidebarCollapsed: boolean;
    theme: 'light' | 'dark' | 'system';
    toggleSidebar: () => void;
    setTheme: (theme: Theme) => void;
  }

  // stores/search.store.ts
  interface SearchState {
    query: string;
    isOpen: boolean;
    setQuery: (q: string) => void;
    openSearch: () => void;
    closeSearch: () => void;
  }
  ```
- Set up TanStack Query providers:
  - QueryClient with staleTime (5 min), retry (3), refetchOnWindowFocus.
  - Global error handler (401 → redirect to login, toast for others).
  - Optimistic updates configuration.
  - Query invalidation utilities.

#### Task 3.4 — CI/CD Pipeline
- Create GitHub Actions workflow (`.github/workflows/ci.yml`):
  ```yaml
  name: CI
  on:
    push: [main]
    pull_request: [main]
  jobs:
    lint:
      - Checkout
      - Setup Node 20
      - Install dependencies
      - Run Oxlint
      - Run Prettier check
      - Run TypeScript typecheck
    test:
      - Checkout
      - Setup Node 20
      - Install dependencies
      - Start PostgreSQL + Redis (services)
      - Run Prisma migrate
      - Run Vitest
      - Upload coverage
    build:
      - Checkout
      - Setup Node 20
      - Install dependencies
      - Build frontend (Vite)
      - Build backend (tsc)
  ```
- Add branch protection rules: require CI pass, require 1 review, no force push to main.
- Configure Dependabot for dependency updates.
- Add CodeQL analysis workflow for security scanning.

#### Task 3.5 — Environment Configuration
- Create `.env.example` with all variables documented:

  **Backend**
  ```env
  # App
  NODE_ENV=development
  PORT=4000
  API_URL=http://localhost:4000
  FRONTEND_URL=http://localhost:5173

  # Database
  DATABASE_URL=postgresql://postgres:password@localhost:5432/novacrm

  # Redis
  REDIS_URL=redis://localhost:6379

  # Auth
  JWT_ACCESS_SECRET=your-access-secret-min-32-chars
  JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
  JWT_ACCESS_EXPIRY=15m
  JWT_REFRESH_EXPIRY=7d

  # Email (Resend)
  RESEND_API_KEY=re_xxxxx
  EMAIL_FROM=noreply@novacrm.ai

  # AI
  OPENAI_API_KEY=sk-xxxxx
  GEMINI_API_KEY=xxxxx

  # Storage (Supabase)
  SUPABASE_URL=https://xxxxx.supabase.co
  SUPABASE_ANON_KEY=xxxxx
  SUPABASE_SERVICE_ROLE_KEY=xxxxx
  ```

  **Frontend**
  ```env
  VITE_API_URL=http://localhost:4000
  VITE_WS_URL=ws://localhost:4000
  VITE_APP_NAME=NovaCRM
  ```

---

## Phase 2 — Core CRM (Weeks 4–7)

> Goal: Full CRUD operations for leads, contacts, companies, deals, and tasks with filtering, sorting, search, and bulk actions.

### Week 4 — Contact & Company Management

#### Task 4.1 — Contacts API
- **Endpoints:**
  ```
  GET    /api/contacts            — List (paginated, filterable, sortable)
  GET    /api/contacts/:id        — Detail with relations
  POST   /api/contacts            — Create
  PATCH  /api/contacts/:id        — Update
  DELETE /api/contacts/:id        — Soft delete
  POST   /api/contacts/bulk       — Bulk create (CSV import)
  PATCH  /api/contacts/bulk       — Bulk update (tag, owner, stage)
  DELETE /api/contacts/bulk       — Bulk delete
  POST   /api/contacts/:id/restore — Restore soft-deleted
  GET    /api/contacts/:id/activities — Activity timeline
  POST   /api/contacts/:id/notes  — Add note
  POST   /api/contacts/import     — CSV/Excel import with field mapping
  GET    /api/contacts/export     — Export as CSV
  ```

- **Query parameters for listing:**
  - `page`, `limit` (default 20, max 100)
  - `search` — full-text search across firstName, lastName, email, company name
  - `lifecycleStage` — filter by stage
  - `ownerId` — filter by owner
  - `companyId` — filter by company
  - `tags` — filter by tag (comma-separated, AND logic)
  - `createdAfter`, `createdBefore` — date range
  - `sort` — field + direction (e.g., `createdAt:desc`, `score:asc`)
  - `fields` — sparse fieldset (select specific columns)

- **Service layer** with business logic:
  - Email uniqueness validation within organization.
  - Automatic lifecycle stage progression rules.
  - Activity logging for all mutations.
  - Search vector update on contact change (for PostgreSQL full-text search).

#### Task 4.2 — Companies API
- **Endpoints:**
  ```
  GET    /api/companies           — List (paginated, filterable)
  GET    /api/companies/:id       — Detail with contacts & deals
  POST   /api/companies           — Create
  PATCH  /api/companies/:id       — Update
  DELETE /api/companies/:id       — Delete
  GET    /api/companies/:id/contacts — Associated contacts
  GET    /api/companies/:id/deals    — Associated deals
  ```

- **Filters:** industry, size, annualRevenue range, domain, ownerId (of associated contacts).
- **Automatic features:**
  - Domain normalization (lowercase, strip protocol/www).
  - Company logo fetch from Clearbit or Gravatar based on domain.
  - Aggregate metrics: total contacts, total deal value, activities count.

#### Task 4.3 — Contact & Company UI
- **Contacts List Page:**
  - DataTable with columns: checkbox, avatar+name, email, phone, company, lifecycle stage badge, score, owner avatar, created date.
  - Filter sidebar/drawer with facets for each filterable field.
  - Quick filters bar (All, My Contacts, New This Week, Needs Attention).
  - Bulk action toolbar: Add Tag, Change Owner, Change Stage, Export Selected, Delete.
  - Empty state for no contacts with "Import" and "Add Contact" CTAs.
  - Import modal: file upload → field mapping preview → import with progress.

- **Contact Detail Page:**
  - Header: avatar, name, email, phone, lifecycle stage selector, score badge, owner, actions menu.
  - Tabs: Overview, Activities, Deals, Notes, Files.
  - Overview tab: key fields card, company card, recent activities.
  - Activity timeline with filter by type.
  - Quick-add activity: call, email, meeting, note.
  - Side panel: AI insights (placeholder for Phase 5).

- **Company Detail Page:**
  - Header: logo, name, industry, website, metrics bar (revenue, contacts, deals).
  - Associated contacts table.
  - Associated deals pipeline view.
  - Activity feed.

### Week 5 — Deal Pipeline

#### Task 5.1 — Deals & Pipeline API
- **Endpoints:**
  ```
  GET    /api/pipelines                — List pipelines
  POST   /api/pipelines                — Create pipeline
  PATCH  /api/pipelines/:id            — Update pipeline (reorder stages)
  DELETE /api/pipelines/:id            — Delete pipeline

  GET    /api/deals                    — List deals (paginated)
  GET    /api/deals/:id                — Deal detail
  POST   /api/deals                    — Create deal
  PATCH  /api/deals/:id                — Update deal
  DELETE /api/deals/:id                — Delete deal
  PATCH  /api/deals/:id/stage          — Move deal to stage (drag-drop)
  PATCH  /api/deals/:id/owner          — Reassign owner
  POST   /api/deals/bulk               — Bulk operations
  GET    /api/deals/pipeline-view      — Pipeline board data
  GET    /api/deals/forecast           — Revenue forecast
  GET    /api/deals/lost               — Lost deals with reasons
  ```

- **Pipeline data structure:**
  ```typescript
  interface PipelineView {
    pipeline: Pipeline;
    stages: {
      id: string;
      name: string;
      dealCount: number;
      totalValue: number;
      deals: DealCard[];
    }[];
    summary: {
      totalDeals: number;
      totalValue: number;
      weightedValue: number; // value × probability
      averageDealSize: number;
      averageCycleLength: number; // days
    };
  }
  ```

- **Business logic:**
  - Auto-calculate probability based on stage (configurable per pipeline).
  - When moving to CLOSED_WON: set `closedAt`, probability = 100%.
  - When moving to CLOSED_LOST: prompt for lost reason, probability = 0%.
  - Forecast calculation: sum of (value × probability) per stage.
  - Winning streak and conversion rate tracking.

#### Task 5.2 — Pipeline UI (Kanban Board)
- **Kanban Board View:**
  - Horizontal scrollable columns for each pipeline stage.
  - Stage header: name, deal count, total value.
  - Deal cards: title, value, contact/company avatar, owner avatar, expected close date, probability badge.
  - Drag-and-drop between stages (using `@dnd-kit/core`):
    - Visual drop indicators.
    - Optimistic update on drop.
    - Rollback on API failure.
  - Stage column colors (configurable).
  - Board controls: view switcher (Board / List), pipeline selector, add deal button.
  - Deal creation modal: quick-add (title, value, contact) with expand for full form.

- **List View:**
  - Full DataTable with all deal fields.
  - Sort by any column, filter by stage/owner/value/date.

- **Deal Detail Page:**
  - Header: deal title, value (editable inline), stage badge, probability, owner, actions.
  - Sidebar: contact, company, expected close date, lost reason (if closed lost).
  - Tabs: Activities, Notes, Files, AI Insights.
  - Activity log: all interactions with this deal.
  - Revenue timeline chart (placeholder for Phase 4).

### Week 6 — Task Management

#### Task 6.1 — Tasks API
- **Endpoints:**
  ```
  GET    /api/tasks              — List tasks (paginated, filterable)
  GET    /api/tasks/:id          — Task detail
  POST   /api/tasks              — Create task
  PATCH  /api/tasks/:id          — Update task
  DELETE /api/tasks/:id          — Delete task
  PATCH  /api/tasks/:id/status   — Quick status toggle
  GET    /api/tasks/my           — Current user's tasks
  GET    /api/tasks/overdue      — Overdue tasks
  GET    /api/tasks/upcoming     — Tasks due today/this week
  ```

- **Filters:** status, priority, assignee, contact, deal, due date range, created date range.
- **Default sort:** due date ascending, then priority descending.

#### Task 6.2 — Tasks UI
- **Task List Page:**
  - View modes: List, Board (by status), Calendar (by due date).
  - Priority color coding: Low (gray), Medium (blue), High (orange), Urgent (red).
  - Inline status toggle (checkbox or dropdown).
  - Quick filters: My Tasks, Overdue, Due Today, Due This Week, Completed.
  - Bulk actions: assign, change priority, change status, delete.
  - Task creation: inline at top of list or modal from anywhere.

- **Task Board View:**
  - Columns: Pending, In Progress, Completed, Cancelled.
  - Drag-and-drop between columns.
  - Task cards: title, priority badge, due date, assignee, linked contact/deal.

- **Calendar Integration:**
  - Tasks with due dates appear on calendar (Phase 3 preview).

### Week 7 — Activities & Notes

#### Task 7.1 — Activities API
- **Endpoints:**
  ```
  GET    /api/activities              — List activities
  POST   /api/activities              — Log activity
  PATCH  /api/activities/:id          — Update activity
  DELETE /api/activities/:id          — Delete activity
  GET    /api/activities/timeline     — Timeline view (for contact/deal)
  ```

- **Activity types:** Call, Email, Meeting, Note, Task, WhatsApp.
- **Logging:** Each activity records type, subject, description, date, duration, and linked entities (contact, deal).
- **Automatic logging:** Task completion creates activity. Deal stage change creates activity.

#### Task 7.2 — Notes API
- **Endpoints:**
  ```
  GET    /api/notes                  — List notes for entity
  POST   /api/notes                  — Create note
  PATCH  /api/notes/:id              — Update note
  DELETE /api/notes/:id              — Delete note
  PATCH  /api/notes/:id/pin          — Toggle pin
  ```

#### Task 7.3 — Activity & Notes UI
- **Activity Timeline Component:**
  - Chronological feed with type icons and color coding.
  - Expandable activity cards with full description.
  - Filter by type, date range, user.
  - Quick-add button with activity type selector.

- **Notes Component:**
  - Rich text editor (TipTap or similar) with markdown support.
  - Pinned notes appear at top.
  - Search within notes.
  - Markdown preview toggle.

---

## Phase 3 — Productivity (Weeks 8–10)

> Goal: Calendar integration, email capabilities, notification system, and global search.

### Week 8 — Calendar

#### Task 8.1 — Calendar API
- **Endpoints:**
  ```
  GET    /api/calendar/events         — List events (date range)
  POST   /api/calendar/events         — Create event
  PATCH  /api/calendar/events/:id     — Update event
  DELETE /api/calendar/events/:id     — Delete event
  GET    /api/calendar/availability   — Free/busy data
  ```

- **Event model:**
  ```prisma
  model CalendarEvent {
    id              String   @id @default(cuid())
    title           String
    description     String?
    startTime       DateTime
    endTime         DateTime
    allDay          Boolean  @default(false)
    type            EventType @default(MEETING)
    location        String?
    meetingUrl      String?  // Google Meet / Zoom link
    recurrence      Json?    // RRULE format
    createdAt       DateTime @default(now())
    updatedAt       DateTime @updatedAt
    organizationId  String
    creatorId       String
    creator         User     @relation(fields: [creatorId], references: [id])
    attendees       CalendarAttendee[]
    contactId       String?
    dealId          String?
    taskId          String?
  }

  model CalendarAttendee {
    id        String @id @default(cuid())
    eventId   String
    event     CalendarEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)
    userId    String
    user      User   @relation(fields: [userId], references: [id])
    status    AttendeeStatus @default(PENDING)
  }

  enum EventType { MEETING, CALL, TASK, REMINDER, OTHER }
  enum AttendeeStatus { PENDING, ACCEPTED, DECLINED, TENTATIVE }
  ```

#### Task 8.2 — Calendar UI
- **Calendar Views:**
  - Month view: grid with event dots, click to expand day.
  - Week view: hourly time slots with event blocks.
  - Day view: detailed hourly schedule.
  - Agenda view: list of upcoming events.
- **Event creation:** Click on time slot to create, drag to extend duration.
- **Color coding:** by event type.
- **Integration with tasks:** tasks with due dates show as all-day events.
- **Mini calendar** in sidebar for quick navigation.

### Week 9 — Email Integration & Notifications

#### Task 9.1 — Email System
- **Email sending** (via Resend):
  - Template engine for common emails (welcome, password reset, notifications).
  - Email tracking: open tracking pixel, click tracking.
  - Email logging: sent emails appear in contact activity timeline.

- **Email UI:**
  - Compose modal: rich text editor, template selector, contact picker.
  - Email templates: pre-built + custom templates per organization.
  - Email preview before send.
  - Scheduled send support.
  - Thread view: emails grouped by conversation (contact + subject).
  - Email tracking indicators: sent, delivered, opened, clicked.

- **Email API:**
  ```
  POST   /api/emails/send              — Send email
  POST   /api/emails/send-template     — Send from template
  GET    /api/emails/templates         — List templates
  POST   /api/emails/templates         — Create template
  PATCH  /api/emails/templates/:id     — Update template
  DELETE /api/emails/templates/:id     — Delete template
  GET    /api/emails/track/:id/open    — Tracking pixel
  GET    /api/emails/track/:id/click   — Click redirect
  ```

#### Task 9.2 — Notification System
- **Notification model:**
  ```prisma
  model Notification {
    id              String   @id @default(cuid())
    type            NotificationType
    title           String
    message         String
    actionUrl       String?
    isRead          Boolean  @default(false)
    createdAt       DateTime @default(now())
    userId          String
    metadata        Json?    // additional context
  }

  enum NotificationType {
    TASK_ASSIGNED
    TASK_COMPLETED
    DEAL_STAGE_CHANGED
    DEAL_WON
    DEAL_LOST
    MENTION
    COMMENT
    SYSTEM
  }
  ```

- **Notification API:**
  ```
  GET    /api/notifications            — List (paginated, unread count)
  PATCH  /api/notifications/:id/read   — Mark as read
  PATCH  /api/notifications/read-all   — Mark all as read
  DELETE /api/notifications/:id        — Delete
  ```

- **Real-time notifications** via Server-Sent Events (SSE) or WebSocket.
- **Notification preferences** per user (email digest, in-app, push).
- **Toast notifications** in UI for real-time events.

### Week 10 — Global Search

#### Task 10.1 — Search API
- **Endpoints:**
  ```
  GET /api/search?q=query             — Global search across all entities
  GET /api/search/contacts?q=query    — Search contacts only
  GET /api/search/companies?q=query   — Search companies only
  GET /api/search/deals?q=query       — Search deals only
  ```

- **Search implementation:**
  - PostgreSQL full-text search with `tsvector` and `tsquery`.
  - Search across: contacts (name, email, phone), companies (name, domain, industry), deals (title).
  - Weighted ranking: name matches > email > other fields.
  - Highlighted snippets in results.
  - Search index updated via Prisma middleware on create/update.

#### Task 10.2 — Global Search UI
- **Search component:**
  - Triggered by `Cmd+K` / `Ctrl+K` keyboard shortcut.
  - Modal overlay with search input.
  - Real-time results as you type (debounced 300ms).
  - Results grouped by entity type with icons.
  - Keyboard navigation (↑↓ to select, Enter to open).
  - Recent searches (stored in localStorage).
  - Quick actions: Create Contact, Create Deal, Create Task.
- **Search results format:**
  ```
  Contacts (3)
  ├── 👤 John Smith — john@acme.com — Acme Corp
  ├── 👤 Jane Doe — jane@techco.io — TechCo
  └── 👤 Bob Johnson — bob@startup.io — Startup Inc

  Companies (2)
  ├── 🏢 Acme Corp — acme.com — 12 contacts — $250K in deals
  └── 🏢 TechCo — techco.io — 8 contacts — $180K in deals

  Deals (1)
  ├── 💰 Enterprise License — Acme Corp — $50,000 — Negotiation
  ```

---

## Phase 4 — Analytics (Weeks 11–12)

> Goal: Reporting dashboards with interactive charts, data export, and custom report builder.

### Week 11 — Reporting Engine

#### Task 11.1 — Analytics API
- **Endpoints:**
  ```
  GET    /api/analytics/dashboard       — Overview dashboard data
  GET    /api/analytics/pipeline        — Pipeline analytics
  GET    /api/analytics/activities      — Activity analytics
  GET    /api/analytics/team            — Team performance
  GET    /api/analytics/revenue         — Revenue analytics
  GET    /api/analytics/forecast        — Revenue forecast
  GET    /api/analytics/custom          — Custom report query
  POST   /api/analytics/reports         — Save custom report
  GET    /api/analytics/reports         — List saved reports
  GET    /api/analytics/reports/:id     — Get saved report
  DELETE /api/analytics/reports/:id     — Delete saved report
  ```

- **Dashboard data structure:**
  ```typescript
  interface DashboardData {
    summary: {
      totalContacts: number;
      newContactsThisMonth: number;
      contactGrowth: number; // percentage change
      totalDeals: number;
      totalDealValue: number;
      openDeals: number;
      wonDealsThisMonth: number;
      revenueThisMonth: number;
      revenueGrowth: number;
      tasksCompleted: number;
      tasksPending: number;
    };
    pipeline: {
      stageDistribution: { stage: string; count: number; value: number }[];
      conversionRates: { from: string; to: string; rate: number }[];
      averageCycleLength: number;
      averageDealSize: number;
    };
    activities: {
      byType: { type: string; count: number }[];
      byDay: { date: string; count: number }[];
      topPerformers: { userId: string; name: string; count: number }[];
    };
    revenue: {
      monthly: { month: string; revenue: number; forecast: number }[];
      quarterly: { quarter: string; revenue: number }[];
    };
  }
  ```

- **Custom report builder:**
  - Select entity type (contacts, deals, companies).
  - Choose metrics (count, sum, average, min, max).
  - Group by (stage, owner, industry, date, etc.).
  - Filter by any field.
  - Sort by any metric.
  - Save reports for later access.

### Week 12 — Dashboard UI & Charts

#### Task 12.1 — Dashboard UI
- **Main Dashboard:**
  - Stats cards row: total contacts, total revenue, open deals, tasks due today.
  - Revenue chart (line chart, monthly, with forecast).
  - Pipeline funnel chart.
  - Activity bar chart (by type, weekly).
  - Top deals table (top 5 by value).
  - Recent activity feed.
  - Team performance leaderboard.
  - Quick links: create contact, create deal, view reports.

- **Chart library:** Recharts (works well with React).
  - Line charts for revenue trends.
  - Bar charts for activity counts.
  - Pie/Donut charts for distribution.
  - Funnel charts for pipeline.
  - Area charts for growth.
  - Responsive sizing.

- **Report Builder UI:**
  - Step 1: Choose entity type.
  - Step 2: Select columns/metrics.
  - Step 3: Add filters.
  - Step 4: Choose chart type and grouping.
  - Step 5: Preview and save.
  - Saved reports appear in sidebar.

#### Task 12.2 — Data Export
- **Export endpoints:**
  ```
  GET /api/export/contacts.csv
  GET /api/export/deals.csv
  GET /api/export/activities.csv
  GET /api/export/reports/:id/pdf
  ```

- **Export features:**
  - CSV export with all visible columns.
  - PDF export for reports with charts.
  - Excel export (xlsx) with multiple sheets.
  - Large dataset handling: streaming export for >10k records.
  - Scheduled export to email.

---

## Phase 5 — AI Features (Weeks 13–15)

> Goal: AI-powered productivity features using OpenAI GPT-4 and Google Gemini.

### Week 13 — AI Copilot & Chat

#### Task 13.1 — AI Service Layer
- **AI provider abstraction:**
  ```typescript
  interface AIProvider {
    chat(messages: ChatMessage[], options: ChatOptions): Promise<ChatResponse>;
    analyze(prompt: string, context: string): Promise<string>;
    embed(text: string): Promise<number[]>;
  }

  class OpenAIProvider implements AIProvider { ... }
  class GeminiProvider implements AIProvider { ... }
  ```

- **AI context pipeline:**
  - Fetch relevant CRM data based on current view.
  - Build context window with entity details, recent activities, and conversation history.
  - Token management: count tokens, truncate if needed.
  - Rate limiting: per-user, per-organization.

- **AI endpoints:**
  ```
  POST   /api/ai/chat                — Chat with AI copilot
  POST   /api/ai/generate-email      — Generate email content
  POST   /api/ai/summarize-meeting   — Summarize meeting notes
  POST   /api/ai/score-lead          — Score a lead
  POST   /api/ai/suggest-next-action — Suggest next action
  POST   /api/ai/search              — Semantic search
  POST   /api/ai/extract-contacts    — Extract contacts from text
  ```

#### Task 13.2 — AI Copilot UI
- **Chat panel:**
  - Floating AI assistant button (bottom-right corner).
  - Expandable chat panel with message history.
  - Context-aware: knows current page, selected entity.
  - Suggested prompts based on context:
    - Contact page: "Summarize this contact", "Suggest next steps", "Draft follow-up email".
    - Deal page: "What's the win probability?", "Draft proposal", "Analyze deal risk".
    - Dashboard: "Why is revenue down?", "Top opportunities", "Team performance insights".
  - Markdown rendering for AI responses.
  - Copy to clipboard button on responses.
  - Loading state with streaming text.

- **Command palette AI actions:**
  - `Cmd+Shift+A`: Open AI command palette.
  - Quick actions: Generate Email, Summarize, Score Lead, Find Similar.
  - Results appear in chat panel or inline.

### Week 14 — Smart Features

#### Task 14.1 — AI Lead Scoring
- **Scoring model:**
  - Factors: engagement (activities count, recency), fit (company size, industry match), behavior (email opens, page views).
  - Score: 0–100, color-coded (red: 0–30, yellow: 31–70, green: 71–100).
  - Auto-update on data changes.
  - AI explanation for score: "Score is 78 because: High engagement (12 activities this month), Good fit (enterprise company in target industry), Recent email opens (3 in last week)."

- **Scoring UI:**
  - Score badge on contact cards and detail pages.
  - Score breakdown modal with factor visualization.
  - Score trend chart (historical).
  - Filter contacts by score range.
  - Bulk re-score action.

#### Task 14.2 — AI Email Generation
- **Email generation flow:**
  1. User clicks "AI Generate" in email compose.
  2. AI receives: contact details, recent interactions, email type (follow-up, proposal, cold outreach), tone (professional, friendly, urgent).
  3. AI generates email with subject line and body.
  4. User can regenerate, edit, or accept.
  5. Accepted email is populated in compose form.

- **Email templates powered by AI:**
  - Cold outreach generator.
  - Follow-up email generator.
  - Proposal cover letter.
  - Meeting recap email.
  - Thank you / relationship building.

#### Task 14.3 — Meeting Summaries
- **Meeting summary flow:**
  1. User pastes meeting notes or transcript.
  2. AI extracts: key points, action items, decisions, follow-ups.
  3. Summary is structured with headers and bullet points.
  4. Action items are suggested as tasks (with assignees, due dates).
  5. Summary is saved as activity and attached to related entities.

### Week 15 — Smart Search & Insights

#### Task 15.1 — Semantic Search
- **Vector embeddings:**
  - Embed contact summaries, deal descriptions, notes, activity descriptions.
  - Store embeddings in PostgreSQL with pgvector extension.
  - On search: embed query, find nearest neighbors (cosine similarity).
  - Combine vector search with full-text search for hybrid results.

- **Search UI enhancements:**
  - "Semantic" toggle in global search.
  - AI-powered search suggestions.
  - "Related to" links on entity detail pages.

#### Task 15.2 — AI Insights
- **Deal insights:**
  - Win probability prediction.
  - Risk factors: "No activity in 14 days", "Budget not discussed", "Multiple competitors".
  - Recommended next actions.
  - Similar deals that won/lost.

- **Contact insights:**
  - Engagement score.
  - Best time to contact.
  - Preferred communication channel.
  - Relationship strength indicator.

- **Pipeline insights:**
  - Bottleneck detection: "Deals spend average 23 days in Negotiation (industry avg: 12 days)".
  - Revenue forecast with confidence intervals.
  - Pipeline health score.

---

## Phase 6 — Automation (Weeks 16–17)

> Goal: Visual workflow builder, automated triggers, approval flows, and webhook integrations.

### Week 16 — Workflows & Triggers

#### Task 16.1 — Workflow Engine
- **Workflow model:**
  ```prisma
  model Workflow {
    id              String   @id @default(cuid())
    name            String
    description     String?
    isActive        Boolean  @default(false)
    trigger         Json     // Trigger configuration
    actions         Json     // Action steps array
    executionCount  Int      @default(0)
    lastExecutedAt  DateTime?
    createdAt       DateTime @default(now())
    updatedAt       DateTime @updatedAt
    organizationId  String
    createdBy       String
  }
  ```

- **Trigger types:**
  - Record created (contact, deal, company)
  - Record updated (field changed, stage moved)
  - Date/time based (deal expected close, task due date)
  - Score threshold (lead score > 80)
  - Form submission
  - Email received/opened
  - Webhook received
  - Manual trigger

- **Action types:**
  - Send email
  - Create task
  - Update record (set field values)
  - Add/remove tag
  - Change owner
  - Send notification
  - HTTP request (webhook out)
  - Delay (wait X minutes/hours/days)
  - If/else condition branch
  - Create activity

- **Workflow execution engine:**
  - Queue-based execution (BullMQ on Redis).
  - Step-by-step execution with logging.
  - Error handling: retry, skip, halt.
  - Execution history with input/output per step.

#### Task 16.2 — Workflow Builder UI
- **Visual workflow builder:**
  - Drag-and-drop node editor.
  - Trigger node configuration panel.
  - Action node configuration panels.
  - Connection lines between nodes.
  - Zoom and pan.
  - Minimap.
  - Validation: highlight errors, missing config.

- **Workflow list page:**
  - Table: name, trigger type, status (active/inactive), execution count, last run.
  - Toggle active/inactive.
  - Duplicate workflow.
  - View execution history.
  - Test workflow with sample data.

### Week 17 — Approvals & Webhooks

#### Task 17.1 — Approval Flows
- **Approval model:**
  ```prisma
  model Approval {
    id              String   @id @default(cuid())
    type            ApprovalType
    status          ApprovalStatus @default(PENDING)
    requestData     Json
    responseNote    String?
    requestedById   String
    approverId      String?
    createdAt       DateTime @default(now())
    resolvedAt      DateTime?
    organizationId  String
  }

  enum ApprovalType { DEAL_DISCOUNT, BUDGET_OVERRIDE, DATA_EXPORT, USER_INVITE }
  enum ApprovalStatus { PENDING, APPROVED, REJECTED }
  ```

- **Approval UI:**
  - Pending approvals queue.
  - Approve/reject with comments.
  - Notification on new approval request.
  - Approval history.

#### Task 17.2 — Webhook System
- **Webhook API:**
  ```
  GET    /api/webhooks              — List webhooks
  POST   /api/webhooks              — Create webhook
  PATCH  /api/webhooks/:id          — Update webhook
  DELETE /api/webhooks/:id          — Delete webhook
  POST   /api/webhooks/:id/test     — Test webhook
  GET    /api/webhooks/:id/logs     — Delivery logs
  ```

- **Webhook configuration:**
  - URL, events (contact.created, deal.stage_changed, etc.), secret (for HMAC signing), active toggle.
  - Event filtering (e.g., only when deal value > $10k).
  - Retry policy: exponential backoff, max 5 retries.
  - Delivery logs: request/response, status code, timestamps.

- **Webhook payload format:**
  ```json
  {
    "id": "evt_xxx",
    "type": "deal.stage_changed",
    "timestamp": "2026-01-15T10:30:00Z",
    "data": {
      "deal": { ... },
      "previousStage": "PROPOSAL",
      "newStage": "NEGOTIATION"
    }
  }
  ```

- **Webhook security:**
  - HMAC-SHA256 signature in `X-NovaCRM-Signature` header.
  - Timestamp-based replay protection (5 min window).
  - IP allowlisting (optional).

---

## Phase 7 — Enterprise (Weeks 18–20)

> Goal: Admin panel, billing, multi-tenancy hardening, API key management, and audit logging.

### Week 18 — Admin Panel

#### Task 18.1 — Admin API
- **Endpoints:**
  ```
  GET    /api/admin/overview          — System overview stats
  GET    /api/admin/users             — All users (all orgs)
  PATCH  /api/admin/users/:id         — Update user (admin)
  GET    /api/admin/organizations     — All organizations
  GET    /api/admin/organizations/:id — Org detail with usage
  PATCH  /api/admin/organizations/:id — Update org plan/settings
  GET    /api/admin/system/health     — System health check
  GET    /api/admin/system/metrics    — System metrics
  ```

- **System health endpoint:**
  - Database connection status and response time.
  - Redis connection status and memory usage.
  - API response times (p50, p95, p99).
  - Error rate (last hour).
  - Active users (last 5 min).
  - Queue depth (pending jobs).

#### Task 18.2 — Admin UI
- **Admin dashboard:**
  - System health indicators.
  - User count, organization count, total deals, total revenue.
  - Recent signups.
  - Plan distribution chart.
  - System resource usage (DB, Redis, API).

- **User management:**
  - User list with search, filter by org, filter by role.
  - User detail: activity, sessions, API usage.
  - Actions: suspend, impersonate, reset password, delete.

- **Organization management:**
  - Org list with plan, user count, storage usage.
  - Org detail: users, billing, usage metrics.
  - Plan upgrade/downgrade.
  - Feature flag overrides.

### Week 19 — Billing & API Keys

#### Task 19.1 — Billing System (Stripe Integration)
- **Plans:**
  | Plan | Price | Contacts | Users | AI Credits | Storage |
  |------|-------|----------|-------|------------|---------|
  | Free | $0/mo | 500 | 3 | 50/mo | 1 GB |
  | Starter | $29/user/mo | 5,000 | 10 | 500/mo | 10 GB |
  | Professional | $59/user/mo | 50,000 | 50 | 5,000/mo | 100 GB |
  | Enterprise | Custom | Unlimited | Unlimited | Unlimited | 1 TB |

- **Billing endpoints:**
  ```
  GET    /api/billing/subscription    — Current subscription
  POST   /api/billing/checkout        — Create Stripe checkout session
  POST   /api/billing/portal          — Create Stripe customer portal
  POST   /api/billing/webhook         — Stripe webhook handler
  GET    /api/billing/invoices        — Invoice history
  POST   /api/billing/usage/check     — Check usage against limits
  ```

- **Stripe webhook events handled:**
  - `checkout.session.completed` — activate subscription.
  - `invoice.paid` — record payment.
  - `invoice.payment_failed` — notify admin, retry.
  - `customer.subscription.updated` — plan change.
  - `customer.subscription.deleted` — downgrade to free.

- **Usage tracking:**
  - Track contacts count, AI credits used, storage used.
  - Mid-cycle enforcement: soft limit warnings at 80%, hard limits at 100%.
  - Usage reset on billing cycle start.

#### Task 19.2 — API Key Management
- **API Key model:**
  ```prisma
  model ApiKey {
    id              String   @id @default(cuid())
    name            String
    keyHash         String   @unique
    keyPrefix       String   // first 8 chars for display: "nova_xxxx..."
    scopes          String[] // ['read:contacts', 'write:deals', etc.]
    expiresAt       DateTime?
    lastUsedAt      DateTime?
    isActive        Boolean  @default(true)
    createdAt       DateTime @default(now())
    organizationId  String
    createdById     String
  }
  ```

- **API Key endpoints:**
  ```
  GET    /api/api-keys              — List organization's API keys
  POST   /api/api-keys              — Create new key
  DELETE /api/api-keys/:id          — Revoke key
  GET    /api/api-keys/:id/usage    — Usage stats for key
  ```

- **API authentication:**
  - `Authorization: Bearer nova_xxxxxxxx...`
  - Rate limiting per key (1000 req/min default).
  - Scope-based access control.

#### Task 19.3 — Audit Logging
- **Audit log model:**
  ```prisma
  model AuditLog {
    id              String   @id @default(cuid())
    action          String   // 'user.login', 'deal.update', 'contact.delete'
    entityType      String?  // 'Contact', 'Deal', 'User'
    entityId        String?
    changes         Json?    // { field: { from, to } }
    ipAddress       String?
    userAgent       String?
    createdAt       DateTime @default(now())
    userId          String
    organizationId  String
  }
  ```

- **Automatic logging:** all CRUD operations on sensitive entities.
- **Audit log UI:** filterable list with action, entity, user, timestamp.
- **Export:** CSV export of audit logs for compliance.

### Week 20 — Multi-tenancy & Security

#### Task 20.1 — Multi-tenancy Hardening
- **Row-level security:** all queries scoped to organization via Prisma middleware.
  ```typescript
  prisma.$use(async (params, next) => {
    const orgId = getOrganizationId();
    if (orgId && params.model && isTenantScoped(params.model)) {
      params.args.where = { ...params.args.where, organizationId: orgId };
    }
    return next(params);
  });
  ```

- **Data isolation:**
  - Organization slug in URL path (`/app/:orgSlug/...`).
  - Subdomain support (`orgname.novacrm.ai`).
  - Cross-org access prevention at middleware level.

- **Feature flags:**
  - Per-plan feature availability.
  - Beta feature opt-in per organization.
  - Feature flag service with Redis cache.

#### Task 20.2 — Security Measures
- **Input validation:** Zod schemas for all API inputs.
- **SQL injection prevention:** Prisma parameterized queries.
- **XSS prevention:** React's built-in escaping + Content-Security-Policy headers.
- **CSRF protection:** SameSite cookies + custom header for API requests.
- **Rate limiting:** per-IP, per-user, per-organization, per-API-key.
- **Content Security Policy:** strict CSP headers.
- **CORS:** whitelist frontend origins only.
- **Password policy:** minimum 8 chars, at least one number and special char.
- **Session management:** max 5 active sessions per user.
- **IP allowlisting:** optional per-organization.
- **Two-factor authentication:** TOTP-based 2FA (optional).

---

## Phase 8 — Polish & Launch (Weeks 21–22)

> Goal: Production-ready application with comprehensive testing, performance optimization, and documentation.

### Week 21 — Testing & Performance

#### Task 21.1 — Testing (see `testing.md` for full details)
- **Unit tests:** 80%+ coverage for services, utils, hooks.
- **Integration tests:** all API endpoints tested.
- **E2E tests:** critical user flows with Playwright.
- **Load testing:** k6 scripts for performance baselines.
- **Security testing:** OWASP ZAP scan.

#### Task 21.2 — Performance Optimization
- **Frontend:**
  - Bundle analysis and code splitting.
  - Lazy loading for routes and heavy components.
  - Image optimization (blur placeholders, WebP).
  - Font optimization (subset, preload).
  - Service worker for static assets.
  - Lighthouse audit: target 90+ on all metrics.

- **Backend:**
  - Database query optimization (explain analyze, add indexes).
  - N+1 query detection and resolution.
  - Response caching with Redis (TTL-based).
  - Pagination optimization (cursor-based for large datasets).
  - Connection pooling (PgBouncer for Supabase).
  - API response compression.

- **Infrastructure:**
  - CDN for static assets (Vercel Edge Network).
  - Database connection pooling.
  - Redis memory optimization.
  - Horizontal scaling readiness.

#### Task 21.3 — Accessibility (a11y)
- WCAG 2.1 AA compliance.
- Keyboard navigation for all interactive elements.
- Screen reader testing with VoiceOver/NVDA.
- Color contrast verification.
- Focus management for modals and dialogs.
- Skip navigation link.
- ARIA labels for all icons and interactive elements.

### Week 22 — Deployment & Documentation

#### Task 22.1 — Deployment (see `deployment.md` for full details)
- Frontend deployed to Vercel.
- Backend deployed to Render.
- Database on Supabase (PostgreSQL 16).
- Redis on Upstash or Redis Cloud.
- DNS configuration with Cloudflare.
- SSL certificates (automatic via providers).
- Environment variables configured in deployment platforms.

#### Task 22.2 — Documentation
- **Developer docs:**
  - API documentation (OpenAPI/Swagger).
  - Architecture decision records (ADRs).
  - Component storybook.

- **User docs:**
  - Getting started guide.
  - Feature guides with screenshots.
  - FAQ.
  - Video tutorials (optional).

- **Ops docs:**
  - Runbook for common issues.
  - Scaling guide.
  - Backup and recovery procedures.
  - Incident response playbook.

#### Task 22.3 — Launch Checklist
- [ ] All tests passing in CI.
- [ ] No critical/high security vulnerabilities (OWASP scan).
- [ ] Performance benchmarks met (Lighthouse 90+, API p95 < 500ms).
- [ ] Error monitoring configured (Sentry).
- [ ] Analytics configured (PostHog or Mixpanel).
- [ ] Uptime monitoring configured (Better Stack).
- [ ] Backup verification (database, Redis).
- [ ] SSL certificates valid.
- [ ] DNS configured and propagated.
- [ ] Rate limiting configured and tested.
- [ ] Email sending verified (all templates).
- [ ] AI features tested with production API keys.
- [ ] Billing integration tested (Stripe test mode).
- [ ] Audit logging verified.
- [ ] Documentation published.
- [ ] README updated with setup instructions.
- [ ] CHANGELOG created.
- [ ] LICENSE file present.

---

## Milestone Summary

| Week | Milestone | Demo-able Features |
|------|-----------|-------------------|
| 1 | Foundation scaffolded | App runs locally, builds successfully |
| 2 | Auth system complete | Register, login, logout, token refresh |
| 3 | Layout & CI/CD | App shell, sidebar, GitHub Actions passing |
| 4 | Contacts & Companies | CRUD, list views, detail pages |
| 5 | Deal Pipeline | Kanban board, drag-drop, stage management |
| 6 | Tasks | Task list, board view, calendar basics |
| 7 | Activities & Notes | Timeline, notes, activity logging |
| 8 | Calendar | Full calendar views, event management |
| 9 | Email & Notifications | Send emails, templates, real-time notifications |
| 10 | Global Search | Cmd+K search, entity search, results |
| 11 | Analytics API | Dashboard data, reports, custom queries |
| 12 | Dashboard UI | Charts, dashboards, export |
| 13 | AI Copilot | Chat interface, context-aware responses |
| 14 | Smart Features | Lead scoring, email generation, meeting summaries |
| 15 | AI Insights | Semantic search, deal insights, recommendations |
| 16 | Workflow Builder | Visual builder, triggers, actions |
| 17 | Approvals & Webhooks | Approval flows, webhook management |
| 18 | Admin Panel | System admin, user management |
| 19 | Billing & API Keys | Stripe integration, API key management |
| 20 | Enterprise Security | Multi-tenancy, audit logs, 2FA |
| 21 | Testing & Performance | Full test suite, performance optimization |
| 22 | Launch | Deployed, documented, production-ready |
