<div align="center">

# NovaCRM AI

### Enterprise AI-Powered CRM Platform

A modern, AI-driven Customer Relationship Management platform built to help organizations manage customers, sales, marketing, and support through one intelligent dashboard.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-base--nova-000?style=flat-square)](https://ui.shadcn.com)

[Documentation](./docs/) | [Requirements](./docs/requirements.md) | [Architecture](./docs/architecture.md) | [Setup Guide](./docs/setup-guide.md)

</div>

---

## Overview

NovaCRM AI is a full-featured CRM platform with AI capabilities designed for sales teams, marketing departments, and customer support organizations. It combines traditional CRM functionality with modern AI-powered automation and insights.

### Key Features

- **Lead Management** - Full lifecycle tracking with AI-powered lead scoring and qualification
- **Contact & Company Management** - Centralized customer database with timeline and activity tracking
- **Deal Pipeline** - Visual Kanban pipeline with stage management and revenue forecasting
- **Task Management** - Assign, track, and automate tasks with recurring schedules and dependencies
- **Calendar** - Integrated calendar with Google/Outlook sync and meeting management
- **AI Copilot** - Natural language assistant for generating emails, proposals, and meeting summaries
- **Smart Search** - AI-enhanced full-text search across all entities
- **Reports & Analytics** - Revenue, sales, and activity reports with interactive charts
- **Automation** - Workflow builder with triggers, conditions, and actions
- **Multi-tenancy** - Organization-scoped data isolation with role-based access control
- **Dark Mode** - Full light/dark theme support with CSS variables
- **Responsive** - Works across desktop, tablet, and mobile

---

## Tech Stack

### Frontend

| Technology | Purpose |
|-----------|---------|
| React 19 | UI library |
| TypeScript 6 | Type safety |
| Vite 8 | Build tool & dev server |
| Tailwind CSS v4 | Utility-first styling |
| shadcn/ui (base-nova) | Component library |
| TanStack Query | Server state management |
| Zustand | Client state management |
| React Router v7 | Routing |
| React Hook Form + Zod | Form handling & validation |
| Recharts | Charts & data visualization |
| Lucide React | Icon library |

### Backend

| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime |
| Express.js | HTTP framework |
| Prisma ORM | Database access |
| PostgreSQL | Primary database |
| Redis | Caching & sessions |
| JWT | Authentication |

### AI & Services

| Technology | Purpose |
|-----------|---------|
| OpenAI GPT-4 | AI copilot, email generation, summarization |
| Google Gemini | Multimodal AI, smart search |
| Stripe | Payment processing |
| SendGrid | Transactional email |

### DevOps

| Technology | Purpose |
|-----------|---------|
| Vercel | Frontend deployment |
| Render | Backend deployment |
| Supabase | PostgreSQL hosting |
| GitHub Actions | CI/CD |
| Docker | Containerization |

---

## Project Structure

```
Nexora/
├── docs/                          # Project documentation
│   ├── requirements.md            # Product requirements document
│   ├── architecture.md            # System architecture
│   ├── tech-stack.md              # Technology reference
│   ├── database-design.md         # Database schema
│   ├── er-diagram.md              # Entity relationship diagrams
│   ├── api-specification.md       # REST API documentation
│   ├── ui-design-system.md        # Design system
│   ├── setup-guide.md             # Development setup
│   ├── deployment.md              # Deployment instructions
│   └── ...                        # 25+ documentation files
├── frontend/                      # React SPA
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   │   └── ui/                # shadcn/ui components
│   │   ├── pages/                 # Route pages
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── lib/                   # Utilities & helpers
│   │   ├── stores/                # Zustand stores
│   │   ├── services/              # API client & services
│   │   ├── types/                 # TypeScript types
│   │   ├── index.css              # Global styles & Tailwind
│   │   ├── main.tsx               # App entry point
│   │   └── App.tsx                # Root component
│   ├── public/                    # Static assets
│   ├── components.json            # shadcn/ui config
│   ├── vite.config.ts             # Vite configuration
│   ├── tsconfig.json              # TypeScript config
│   └── package.json
├── backend/                       # Node.js API server
│   ├── src/
│   │   ├── controllers/           # Request handlers
│   │   ├── services/              # Business logic
│   │   ├── repositories/          # Data access layer
│   │   ├── middleware/            # Auth, validation, error handling
│   │   ├── routes/               # API route definitions
│   │   ├── prisma/               # Schema & migrations
│   │   ├── utils/                # Helpers & utilities
│   │   └── index.ts              # Server entry point
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- PostgreSQL 16+ (or Supabase account)
- Redis 7+ (optional, for caching)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/nexora.git
cd nexora

# Setup frontend
cd frontend
npm install
cp .env.example .env
npm run dev

# Setup backend (in a separate terminal)
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Environment Variables

**Backend `.env`**

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/novacrm"

# Authentication
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
ACCESS_TOKEN_EXPIRY="15m"
REFRESH_TOKEN_EXPIRY="7d"

# Redis
REDIS_URL="redis://localhost:6379"

# AI Services
OPENAI_API_KEY="sk-..."
GEMINI_API_KEY="..."

# Integrations
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
SENDGRID_API_KEY="SG..."

# App
NODE_ENV="development"
PORT=5000
CORS_ORIGIN="http://localhost:5173"
```

**Frontend `.env`**

```env
VITE_API_URL="http://localhost:5000/api/v1"
VITE_STRIPE_PUBLISHABLE_KEY="pk_..."
```

---

## Demo

**Live Demo:** [https://nova-crm.vercel.app](https://nova-crm.vercel.app)

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@novacrm.com | admin123 |
| Sales Manager | manager@novacrm.com | manager123 |
| Sales Executive | sales@novacrm.com | sales123 |
| Support Agent | support@novacrm.com | support123 |
| Viewer | viewer@novacrm.com | viewer123 |

---

## Screenshots

> Screenshots will be added as features are implemented.

| Dashboard | Lead Pipeline | AI Copilot |
|-----------|--------------|------------|
| ![Dashboard](./docs/screenshots/dashboard.png) | ![Pipeline](./docs/screenshots/pipeline.png) | ![AI Copilot](./docs/screenshots/ai-copilot.png) |

| Contacts | Reports | Dark Mode |
|----------|---------|-----------|
| ![Contacts](./docs/screenshots/contacts.png) | ![Reports](./docs/screenshots/reports.png) | ![Dark Mode](./docs/screenshots/dark-mode.png) |

---

## Documentation

| Document | Description |
|----------|-------------|
| [Requirements](./docs/requirements.md) | Product requirements document (PRD) |
| [Architecture](./docs/architecture.md) | System architecture & data flow |
| [Tech Stack](./docs/tech-stack.md) | Technology choices & rationale |
| [Database Design](./docs/database-design.md) | Schema, tables, relationships |
| [ER Diagram](./docs/er-diagram.md) | Entity relationship diagrams |
| [API Specification](./docs/api-specification.md) | REST API endpoints & examples |
| [UI Design System](./docs/ui-design-system.md) | Colors, typography, components |
| [Design Tokens](./docs/design-tokens.md) | Reusable design values |
| [Component Library](./docs/component-library.md) | Component documentation |
| [Routing](./docs/routing.md) | Route structure & guards |
| [State Management](./docs/state-management.md) | Zustand & TanStack Query |
| [Authentication](./docs/authentication.md) | Auth flow & JWT |
| [Authorization & RBAC](./docs/authorization-rbac.md) | Roles & permissions |
| [Security](./docs/security.md) | Security practices |
| [Coding Standards](./docs/coding-standards.md) | Style guide & conventions |
| [Implementation Plan](./docs/implementation-plan.md) | Phase-by-phase plan |
| [Project Roadmap](./docs/project-roadmap.md) | Milestones & timeline |
| [Setup Guide](./docs/setup-guide.md) | Development environment setup |
| [Development Guide](./docs/development-guide.md) | Contributor guidelines |
| [Deployment](./docs/deployment.md) | Production deployment |
| [Testing](./docs/testing.md) | Testing strategy |
| [Performance](./docs/performance.md) | Optimization strategies |
| [AI Features](./docs/ai-features.md) | AI capabilities |
| [Integrations](./docs/integrations.md) | Third-party integrations |
| [Changelog](./docs/changelog.md) | Version history |
| [Release Notes](./docs/release-notes.md) | Release summaries |

---

## User Roles

| Role | Access Level |
|------|-------------|
| Super Admin | Full system access |
| Organization Admin | Manage organization settings & users |
| Sales Manager | Manage sales team, view all leads & deals |
| Sales Executive | Manage assigned leads & deals |
| Marketing Manager | Campaign management, lead capture |
| Support Agent | Ticket management, customer support |
| HR | Employee management |
| Finance | Invoices, payments, subscriptions |
| Viewer | Read-only access |

---

## Roadmap

### Phase 1 - MVP

- [ ] Authentication (login, register, OAuth, 2FA)
- [ ] Dashboard with KPI cards
- [ ] Lead management (CRUD, import/export, timeline)
- [ ] Contact management
- [ ] Company management
- [ ] Basic routing & navigation

### Phase 2 - Beta

- [ ] Deal pipeline (Kanban, stages, forecasting)
- [ ] Task management (Kanban, calendar view)
- [ ] Calendar integration (Google, Outlook)
- [ ] Notifications system
- [ ] Reports & analytics
- [ ] Search functionality

### Phase 3 - Production

- [ ] AI Copilot (email gen, summaries, suggestions)
- [ ] AI lead scoring & deal prediction
- [ ] Workflow automation
- [ ] Marketing campaigns
- [ ] Customer support tickets
- [ ] Billing & subscriptions

### Phase 4 - Future

- [ ] Mobile app (React Native)
- [ ] Advanced AI features (voice, predictions)
- [ ] Marketplace & plugin system
- [ ] Multi-tenant SaaS
- [ ] White-label support

See [project-roadmap.md](./docs/project-roadmap.md) for detailed timeline.

---

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.0s |
| API Response Time | < 300ms |
| Bundle Size (initial) | < 200KB gzipped |
| Lighthouse Score | 90+ |

---

## Security

- JWT access tokens (15 min) + refresh tokens (7 days, httpOnly cookies)
- bcrypt password hashing (12 rounds)
- Role-based access control (RBAC) with 9 roles
- Rate limiting on all endpoints
- CORS, CSP, and security headers via Helmet
- Input validation with Zod schemas
- SQL injection prevention via Prisma parameterized queries
- Audit logging for all critical operations

See [security.md](./docs/security.md) for full details.

---

## License

This project is private and proprietary.

---

<div align="center">

**Built with React 19, TypeScript 6, Vite 8, Tailwind CSS v4, and shadcn/ui**

</div>
