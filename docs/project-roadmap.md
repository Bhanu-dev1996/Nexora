# NovaCRM AI — Project Roadmap

> Milestone-based development roadmap for the NovaCRM AI platform.

---

## Table of Contents

1. [Vision & Mission](#vision--mission)
2. [Phase 1 — MVP](#phase-1--mvp)
3. [Phase 2 — Beta](#phase-2--beta)
4. [Phase 3 — Production](#phase-3--production)
5. [Phase 4 — Future Enhancements](#phase-4--future-enhancements)
6. [Technical Infrastructure](#technical-infrastructure)
7. [Team & Resources](#team--resources)
8. [Risk Register](#risk-register)
9. [Success Metrics](#success-metrics)

---

## Vision & Mission

### Vision

Build an enterprise-grade CRM platform that combines the usability of modern SaaS tools with AI-powered automation — enabling sales teams to close deals faster, manage relationships smarter, and operate with data-driven confidence.

### Mission

Deliver a modular, extensible CRM that replaces legacy systems with a modern React/TypeScript stack, AI copilot integration, and real-time collaboration — accessible on web, with mobile support on the horizon.

### Core Principles

1. **AI-First Design** — Every feature considers how AI can augment or automate the workflow.
2. **Developer Experience** — Clean architecture, strict TypeScript, and comprehensive documentation ensure maintainability.
3. **User-Centric UX** — shadcn/ui with the `base-nova` theme provides a consistent, accessible, and beautiful interface.
4. **Scalability** — Multi-tenant architecture from day one, even if not immediately exposed.
5. **Extensibility** — Plugin system, API-first design, and webhook support enable integrations.

---

## Phase 1 — MVP

**Duration:** 8–10 weeks
**Goal:** Core CRM functionality — authentication, dashboard, lead/contact/company management.

### Milestones

#### M1.1 — Project Foundation (Week 1–2)

| Task | Status | Priority |
|---|---|---|
| Initialize Vite 8 + React 19 + TypeScript 6 project | 🔲 | Critical |
| Configure Tailwind CSS v4 with `base-nova` theme | 🔲 | Critical |
| Install and configure shadcn/ui base components | 🔲 | Critical |
| Set up project structure (pages, components, stores, queries) | 🔲 | Critical |
| Configure path aliases, ESLint, Prettier | 🔲 | High |
| Set up Git repository with branch protection | 🔲 | High |
| Create CI/CD pipeline (GitHub Actions) | 🔲 | High |
| Configure environment variables (dev, staging, prod) | 🔲 | Medium |
| Set up error tracking (Sentry) | 🔲 | Medium |
| Set up analytics (Plausible / PostHog) | 🔲 | Low |

**Deliverable:** Project skeleton compiles, lints, and runs with a placeholder dashboard page.

---

#### M1.2 — Authentication System (Week 2–3)

| Task | Status | Priority |
|---|---|---|
| Design and implement login page | 🔲 | Critical |
| Design and implement registration page | 🔲 | Critical |
| Design and implement forgot/reset password flow | 🔲 | Critical |
| Implement email verification flow | 🔲 | Critical |
| Set up JWT token management (access + refresh) | 🔲 | Critical |
| Implement AuthGuard and route protection | 🔲 | Critical |
| Build AuthLayout with sidebar navigation | 🔲 | Critical |
| Implement token refresh with axios interceptors | 🔲 | Critical |
| Add social login (Google, Microsoft) | 🔲 | Medium |
| Implement session management in settings | 🔲 | Low |

**Deliverable:** Complete auth flow — register, login, logout, password reset, email verification. Protected routes redirect to login.

---

#### M1.3 — Dashboard (Week 3–4)

| Task | Status | Priority |
|---|---|---|
| Build stats cards (revenue, leads, conversion rate, pipeline value) | 🔲 | Critical |
| Implement revenue trend chart (Recharts area chart) | 🔲 | Critical |
| Build lead source breakdown (pie chart) | 🔲 | High |
| Create recent activity timeline | 🔲 | High |
| Build upcoming tasks widget | 🔲 | High |
| Add quick actions panel | 🔲 | Medium |
| Implement responsive grid layout | 🔲 | Critical |
| Add date range selector for dashboard metrics | 🔲 | Medium |

**Deliverable:** Fully functional dashboard with real data, responsive layout, and date-range filtering.

---

#### M1.4 — Lead Management (Week 4–6)

| Task | Status | Priority |
|---|---|---|
| Create lead list page with DataTable | 🔲 | Critical |
| Implement lead filtering (status, source, assignee, date) | 🔲 | Critical |
| Implement lead sorting and pagination | 🔲 | Critical |
| Build lead creation form with validation | 🔲 | Critical |
| Build lead detail page with tabs (Overview, Activity, Notes, Tasks) | 🔲 | Critical |
| Implement lead status updates | 🔲 | Critical |
| Implement lead assignment to team members | 🔲 | High |
| Add lead scoring display and manual score adjustment | 🔲 | High |
| Implement lead tagging system | 🔲 | Medium |
| Build bulk actions (bulk delete, bulk assign) | 🔲 | Medium |
| Implement lead source tracking | 🔲 | Medium |
| Add lead import from CSV | 🔲 | Low |

**Deliverable:** Complete CRUD for leads with filtering, sorting, assignment, and activity tracking.

---

#### M1.5 — Contact Management (Week 6–7)

| Task | Status | Priority |
|---|---|---|
| Create contact list page with DataTable | 🔲 | Critical |
| Implement contact filtering and search | 🔲 | Critical |
| Build contact creation form | 🔲 | Critical |
| Build contact detail page with linked deals and activities | 🔲 | Critical |
| Implement contact-company association | 🔲 | Critical |
| Add contact merge functionality | 🔲 | Medium |
| Implement contact export (CSV) | 🔲 | Low |

**Deliverable:** Full contact CRUD with company associations and activity history.

---

#### M1.6 — Company Management (Week 7–8)

| Task | Status | Priority |
|---|---|---|
| Create company list page with DataTable | 🔲 | Critical |
| Implement company filtering by industry, size | 🔲 | High |
| Build company creation form | 🔲 | Critical |
| Build company detail page (contacts, deals, revenue) | 🔲 | Critical |
| Implement company logo upload | 🔲 | Medium |
| Add company website enrichment | 🔲 | Low |

**Deliverable:** Full company CRUD with contact and deal associations.

---

#### M1.7 — Polish & Launch (Week 9–10)

| Task | Status | Priority |
|---|---|---|
| End-to-end testing (Cypress / Playwright) | 🔲 | Critical |
| Unit tests for critical paths (>80% coverage) | 🔲 | Critical |
| Accessibility audit (WCAG AA) | 🔲 | Critical |
| Performance audit (Lighthouse >90) | 🔲 | High |
| Dark mode testing and fixes | 🔲 | High |
| Mobile responsive testing | 🔲 | High |
| Documentation update | 🔲 | Medium |
| Deploy to staging environment | 🔲 | Critical |
| Internal dogfooding | 🔲 | High |
| Deploy to production | 🔲 | Critical |

**Deliverable:** Production-ready MVP with auth, dashboard, leads, contacts, and companies.

### Phase 1 Timeline

```
Week:  1    2    3    4    5    6    7    8    9    10
       ├────┤────┤────┤────┤────┤────┤────┤────┤────┤
M1.1   ████████████
M1.2          ████████████
M1.3               ████████████
M1.4                    ████████████████████
M1.5                                    ████████████
M1.6                                         ████████████
M1.7                                              ████████████
```

---

## Phase 2 — Beta

**Duration:** 10–12 weeks
**Goal:** Full sales pipeline management, productivity tools, reporting, and notifications.

### Milestones

#### M2.1 — Deal Management & Pipeline (Week 1–4)

| Task | Status | Priority |
|---|---|---|
| Create deal list page with DataTable | 🔲 | Critical |
| Build deal creation form with stage selection | 🔲 | Critical |
| Build deal detail page (value, contacts, timeline, notes) | 🔲 | Critical |
| Implement Kanban pipeline board (drag-and-drop) | 🔲 | Critical |
| Configure pipeline stages (Qualification → Closed Won/Lost) | 🔲 | Critical |
| Implement deal value tracking and forecasting | 🔲 | High |
| Add deal contact association (multiple contacts per deal) | 🔲 | High |
| Implement deal win/loss tracking | 🔲 | High |
| Build deal activity timeline | 🔲 | Medium |
| Add deal document/attachment support | 🔲 | Medium |
| Implement deal collaboration (comments) | 🔲 | Low |

**Deliverable:** Complete deal management with Kanban pipeline, value tracking, and activity history.

---

#### M2.2 — Task Management (Week 4–6)

| Task | Status | Priority |
|---|---|---|
| Create task list page with filters | 🔲 | Critical |
| Build task creation form with entity association | 🔲 | Critical |
| Build task detail page | 🔲 | Critical |
| Implement task status workflow (Pending → In Progress → Completed) | 🔲 | Critical |
| Add task priority levels (Low, Medium, High, Urgent) | 🔲 | High |
| Implement task assignment to team members | 🔲 | High |
| Add due date and overdue indicators | 🔲 | High |
| Implement task recurring patterns | 🔲 | Medium |
| Build bulk task actions | 🔲 | Medium |
| Add task templates | 🔲 | Low |

**Deliverable:** Full task management with assignment, priorities, and entity associations.

---

#### M2.3 — Calendar (Week 6–8)

| Task | Status | Priority |
|---|---|---|
| Implement month view calendar grid | 🔲 | Critical |
| Implement week view with hourly time slots | 🔲 | Critical |
| Implement day view | 🔲 | High |
| Build event creation via drag-to-select | 🔲 | Critical |
| Add event types (Meeting, Call, Task, Deadline) | 🔲 | High |
| Implement event color coding | 🔲 | Medium |
| Add calendar event sync status indicators | 🔲 | Medium |
| Implement Google Calendar integration | 🔲 | Medium |
| Implement Outlook Calendar integration | 🔲 | Medium |
| Add calendar sharing between team members | 🔲 | Low |

**Deliverable:** Functional calendar with day/week/month views, event creation, and basic integrations.

---

#### M2.4 — Reports (Week 8–10)

| Task | Status | Priority |
|---|---|---|
| Build revenue report page | 🔲 | Critical |
| Build sales performance report (rep leaderboard) | 🔲 | Critical |
| Build lead conversion funnel report | 🔲 | High |
| Build lead source analysis report | 🔲 | High |
| Implement date range selector for reports | 🔲 | Critical |
| Add report export (CSV, PDF) | 🔲 | High |
| Build custom report builder (drag-and-drop widgets) | 🔲 | Medium |
| Implement scheduled report delivery via email | 🔲 | Low |
| Add report sharing (URL / email) | 🔲 | Low |

**Deliverable:** Revenue, sales, and lead reports with date filtering and export.

---

#### M2.5 — Notifications System (Week 10–11)

| Task | Status | Priority |
|---|---|---|
| Implement in-app notification center | 🔲 | Critical |
| Build notification bell with unread count | 🔲 | Critical |
| Implement notification preferences (email, push, in-app) | 🔲 | Critical |
| Set up Server-Sent Events (SSE) for real-time notifications | 🔲 | High |
| Implement email notification templates | 🔲 | High |
| Add notification grouping and batching | 🔲 | Medium |
| Implement notification read/dismiss actions | 🔲 | Medium |
| Add push notifications (browser) | 🔲 | Low |

**Deliverable:** Real-time in-app and email notifications with user preferences.

---

#### M2.6 — Settings & User Profile (Week 11–12)

| Task | Status | Priority |
|---|---|---|
| Build user profile settings page | 🔲 | Critical |
| Implement avatar upload | 🔲 | High |
| Build organization settings (name, logo, industry) | 🔲 | High |
| Build team management (invite, remove, roles) | 🔲 | Critical |
| Implement password change and MFA setup | 🔲 | Critical |
| Build notification preferences | 🔲 | High |
| Build integrations settings (connected apps) | 🔲 | Medium |
| Build billing/plan settings | 🔲 | Medium |

**Deliverable:** Complete settings pages for profile, organization, team, and security.

---

#### M2.7 — Beta Testing & QA (Week 12)

| Task | Status | Priority |
|---|---|---|
| Internal beta testing | 🔲 | Critical |
| Bug fixes and UX improvements | 🔲 | Critical |
| Performance optimization | 🔲 | High |
| Security audit | 🔲 | Critical |
| Beta user onboarding flow | 🔲 | High |
| Feedback collection system | 🔲 | Medium |

**Deliverable:** Beta release ready for external testers.

### Phase 2 Timeline

```
Week:  1    2    3    4    5    6    7    8    9    10   11   12
       ├────┤────┤────┤────┤────┤────┤────┤────┤────┤────┤────┤
M2.1   ████████████████████████████
M2.2                    ████████████████████
M2.3                              ████████████████████
M2.4                                        ████████████████████
M2.5                                                  ████████████
M2.6                                                  ████████████
M2.7                                                         ████
```

---

## Phase 3 — Production

**Duration:** 12–16 weeks
**Goal:** AI features, automation, marketing tools, customer support module, and production hardening.

### Milestones

#### M3.1 — AI Copilot & Chat (Week 1–5)

| Task | Status | Priority |
|---|---|---|
| Design AI copilot architecture (LLM integration) | 🔲 | Critical |
| Implement AI chat interface (full-screen) | 🔲 | Critical |
| Implement floating AI chat widget | 🔲 | Critical |
| Build natural language CRM query engine | 🔲 | Critical |
| Implement AI-generated email drafts | 🔲 | High |
| Build lead scoring AI model | 🔲 | High |
| Implement deal risk analysis | 🔲 | High |
| Build meeting preparation summaries | 🔲 | Medium |
| Implement follow-up recommendations | 🔲 | Medium |
| Add AI activity summarization | 🔲 | Medium |
| Implement prompt templates for common queries | 🔲 | Medium |
| Build AI analytics dashboard | 🔲 | Low |

**Deliverable:** Fully functional AI copilot with natural language queries, email drafts, and predictive analytics.

---

#### M3.2 — Automation Engine (Week 4–8)

| Task | Status | Priority |
|---|---|---|
| Design automation workflow builder (visual) | 🔲 | Critical |
| Implement trigger system (lead created, deal stage change, etc.) | 🔲 | Critical |
| Implement action system (send email, create task, update field) | 🔲 | Critical |
| Build pre-built automation templates | 🔲 | High |
| Implement delay/schedule actions | 🔲 | High |
| Add conditional logic (if/then/else) | 🔲 | High |
| Build automation execution log | 🔲 | Medium |
| Implement automation testing/simulation | 🔲 | Medium |
| Add webhook triggers and actions | 🔲 | Medium |

**Deliverable:** Visual workflow builder with triggers, conditions, and actions for common CRM automations.

---

#### M3.3 — Email Integration (Week 6–9)

| Task | Status | Priority |
|---|---|---|
| Implement email inbox integration (Gmail, Outlook) | 🔲 | Critical |
| Build email tracking (opens, clicks) | 🔲 | High |
| Implement email templates with merge fields | 🔲 | High |
| Build email scheduling | 🔲 | High |
| Add email thread view in contact/deal detail | 🔲 | Medium |
| Implement email alias support | 🔲 | Medium |
| Build email campaign basics (bulk send with limits) | 🔲 | Low |

**Deliverable:** Two-way email sync, tracking, templates, and scheduling.

---

#### M3.4 — Marketing Module (Week 8–12)

| Task | Status | Priority |
|---|---|---|
| Build landing page builder (basic drag-and-drop) | 🔲 | Medium |
| Implement form builder for lead capture | 🔲 | High |
| Build email campaign manager | 🔲 | Medium |
| Implement campaign analytics (open rate, CTR, conversions) | 🔲 | High |
| Add A/B testing for email campaigns | 🔲 | Low |
| Build audience segmentation tool | 🔲 | High |
| Implement campaign ROI tracking | 🔲 | Medium |

**Deliverable:** Basic marketing tools — forms, email campaigns, and audience segmentation.

---

#### M3.5 — Customer Support Module (Week 10–14)

| Task | Status | Priority |
|---|---|---|
| Build ticketing system (create, assign, resolve) | 🔲 | High |
| Implement SLA tracking and alerts | 🔲 | High |
| Build knowledge base (articles with categories) | 🔲 | Medium |
| Implement live chat widget | 🔲 | Medium |
| Add CSAT surveys after ticket resolution | 🔲 | Low |
| Build support analytics dashboard | 🔲 | Medium |
| Implement ticket priority and escalation | 🔲 | High |

**Deliverable:** Basic ticketing system with SLA tracking and knowledge base.

---

#### M3.6 — Production Hardening (Week 12–16)

| Task | Status | Priority |
|---|---|---|
| Load testing (target: 1000 concurrent users) | 🔲 | Critical |
| Security penetration testing | 🔲 | Critical |
| Implement rate limiting (API) | 🔲 | Critical |
| Add request validation and sanitization | 🔲 | Critical |
| Implement audit logging for all mutations | 🔲 | High |
| Build admin panel (users, roles, API keys, audit logs) | 🔲 | High |
| Implement data encryption at rest and in transit | 🔲 | Critical |
| Add backup and disaster recovery procedures | 🔲 | High |
| Implement SOC 2 compliance controls | 🔲 | Medium |
| Performance optimization pass | 🔲 | High |
| Documentation finalization | 🔲 | Medium |
| Public launch preparation | 🔲 | Critical |

**Deliverable:** Production-ready platform with security, compliance, and monitoring.

### Phase 3 Timeline

```
Week:  1    2    3    4    5    6    7    8    9    10   11   12   13   14   15   16
       ├────┤────┤────┤────┤────┤────┤────┤────┤────┤────┤────┤────┤────┤────┤────┤
M3.1   ████████████████████████████
M3.2                ████████████████████████████████
M3.3                     ████████████████████████████
M3.4                          ████████████████████████████████
M3.5                                    ████████████████████████████████
M3.6                                        ████████████████████████████████████████
```

---

## Phase 4 — Future Enhancements

**Duration:** Ongoing
**Goal:** Platform expansion, advanced AI, mobile, and ecosystem growth.

### 4.1 — Mobile Application

| Task | Priority |
|---|---|
| Evaluate React Native vs Flutter for cross-platform mobile | High |
| Implement mobile-optimized dashboard | High |
| Build mobile lead/contact management | High |
| Implement push notifications (iOS/Android) | High |
| Build mobile calendar with native integration | Medium |
| Implement offline mode with sync | Medium |
| Add biometric authentication | Medium |
| Implement mobile-specific gestures (swipe, pull-to-refresh) | Low |
| App Store and Play Store submission | High |

### 4.2 — Advanced AI Features

| Task | Priority |
|---|---|
| Implement predictive deal scoring with ML models | High |
| Build AI-powered sales forecasting | High |
| Implement conversation intelligence (call analysis) | Medium |
| Build AI-driven email prioritization | Medium |
| Implement smart follow-up timing | Medium |
| Add AI-generated sales playbooks | Low |
| Build sentiment analysis for customer interactions | Medium |
| Implement AI-driven team performance insights | Low |
| Add AI meeting summarization (transcription) | Medium |

### 4.3 — Integrations Marketplace

| Task | Priority |
|---|---|
| Build integration marketplace UI | High |
| Implement Slack integration (notifications, commands) | High |
| Implement Salesforce data import/migration | Medium |
| Implement HubSpot data import/migration | Medium |
| Build Zapier / Make integration | Medium |
| Implement Twilio integration (SMS, calls) | Medium |
| Build Stripe integration (payments, invoicing) | Low |
| Implement QuickBooks / Xero integration (accounting) | Low |
| Add Zoom / Google Meet integration (meeting scheduling) | Medium |
| Build custom integration SDK for developers | Low |

### 4.4 — Enterprise & Multi-Tenant

| Task | Priority |
|---|---|
| Implement multi-tenant architecture | High |
| Build tenant admin panel | High |
| Implement tenant-level feature flags | Medium |
| Add tenant-level data isolation | Critical |
| Implement SSO (SAML, OIDC) | High |
| Build tenant usage analytics | Medium |
| Implement tenant billing and subscription management | High |
| Add tenant data export and portability | Medium |
| Implement tenant-level custom branding | Low |
| Build tenant onboarding wizard | Medium |

### 4.5 — Developer Platform

| Task | Priority |
|---|---|
| Build public REST API with comprehensive docs | High |
| Implement API key management and rate limiting | High |
| Build webhook system with delivery guarantees | High |
| Implement OAuth 2.0 for third-party apps | Medium |
| Build developer portal (docs, SDKs, playground) | Medium |
| Implement custom field system (extensible schema) | Medium |
| Build plugin/extension architecture | Low |
| Add GraphQL API layer | Low |

### Phase 4 Timeline (Estimated)

```
Quarter:  Q1         Q2         Q3         Q4
          ├──────────┼──────────┼──────────┼──────────┤
Mobile    ████████████████████
AI Adv.        ████████████████████
Integrations        ████████████████████████████
Enterprise               ████████████████████████████████
Dev Platform                     ████████████████████████████████
```

---

## Technical Infrastructure

### Architecture Evolution

| Phase | Architecture |
|---|---|
| MVP | Monolithic SPA + REST API |
| Beta | Modular monolith + SSE for real-time |
| Production | Microservices (Auth, CRM, AI, Billing) + WebSocket |
| Future | Event-driven microservices + message queue (Kafka/RabbitMQ) |

### Database Strategy

| Phase | Database |
|---|---|
| MVP | PostgreSQL (single instance) |
| Beta | PostgreSQL (read replicas) |
| Production | PostgreSQL + Redis (caching, sessions) + Elasticsearch (search) |
| Future | Multi-tenant PostgreSQL + Redis Cluster + S3 (file storage) |

### Deployment

| Phase | Platform |
|---|---|
| MVP | Vercel (frontend) + Railway/Render (API) |
| Beta | Vercel + Railway + managed PostgreSQL |
| Production | AWS (ECS/EKS) + RDS + CloudFront + S3 |
| Future | AWS multi-region + CDN + edge functions |

---

## Team & Resources

### Core Team (Phase 1–2)

| Role | Count | Responsibilities |
|---|---|---|
| Full-Stack Lead | 1 | Architecture, code review, complex features |
| Frontend Engineer | 1–2 | UI components, pages, state management |
| Backend Engineer | 1 | API development, database, auth |
| UI/UX Designer | 1 | Design system, user flows, prototyping |

### Extended Team (Phase 3–4)

| Role | Count | Responsibilities |
|---|---|---|
| AI/ML Engineer | 1 | AI copilot, scoring models, NLP |
| DevOps Engineer | 1 | CI/CD, infrastructure, monitoring |
| QA Engineer | 1 | Testing strategy, E2E tests, performance |
| Security Engineer | 1 (part-time) | Security audits, compliance, penetration testing |
| Product Manager | 1 | Roadmap, priorities, user research |

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| AI LLM costs exceed budget | High | High | Implement token budgets, caching, and tiered AI access |
| Scope creep delays MVP | Medium | High | Strict feature freeze, weekly sprint reviews |
| Key developer leaves | Low | High | Documentation, code reviews, pair programming |
| Security vulnerability in production | Medium | Critical | Penetration testing, bug bounty, SOC 2 |
| Performance degradation at scale | Medium | High | Load testing, monitoring, CDN, caching |
| Third-party API dependency failure | Medium | Medium | Fallback mechanisms, circuit breakers |
| User adoption below targets | Medium | High | Beta feedback loop, UX research, onboarding flow |
| Regulatory compliance gaps | Low | Critical | Legal review, privacy-by-design, DPA templates |

---

## Success Metrics

### Phase 1 — MVP

| Metric | Target |
|---|---|
| Core CRM features (leads, contacts, companies) | 100% implemented |
| Auth flow completion rate | > 95% |
| Dashboard load time | < 2s |
| Test coverage (critical paths) | > 80% |
| Lighthouse performance score | > 90 |

### Phase 2 — Beta

| Metric | Target |
|---|---|
| Beta user signups | 50+ |
| Daily active beta users | 20+ |
| Feature completion (deals, tasks, calendar) | 100% |
| Bug report resolution time | < 48h |
| NPS score from beta testers | > 40 |

### Phase 3 — Production

| Metric | Target |
|---|---|
| Registered organizations | 100+ |
| Monthly active users | 500+ |
| AI copilot adoption rate | > 30% of users |
| System uptime | > 99.9% |
| Average page load time | < 1.5s |
| Customer support response time | < 4h |
| Revenue (ARR) | $50K+ |

### Phase 4 — Growth

| Metric | Target |
|---|---|
| Monthly active users | 5,000+ |
| Mobile app downloads | 1,000+ |
| Integration marketplace apps | 20+ |
| Enterprise customers | 10+ |
| ARR | $500K+ |
| Churn rate | < 5% monthly |

---

## Release Strategy

### Versioning

| Version | Phase | Description |
|---|---|---|
| `0.1.0` | Phase 1 | MVP — internal alpha |
| `0.5.0` | Phase 2 | Beta — closed beta release |
| `1.0.0` | Phase 3 | Production — public launch |
| `1.x.0` | Phase 4 | Feature releases |
| `x.0.0` | Phase 4 | Major releases (breaking changes) |

### Release Cadence

| Phase | Cadence |
|---|---|
| MVP | Weekly internal releases |
| Beta | Bi-weekly beta releases |
| Production | Monthly stable releases + hotfixes as needed |
| Future | Bi-weekly releases (stable) + monthly (major) |

### Changelog

All releases maintain a `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [1.2.0] - 2026-06-15

### Added
- AI-powered lead scoring with ML model
- Email template merge fields
- Calendar event drag-to-create

### Changed
- Improved pipeline drag-and-drop performance
- Updated dashboard charts to use Recharts v3

### Fixed
- Fixed lead filter reset not clearing URL params
- Fixed deal stage transition not updating activity timeline
- Fixed mobile sidebar not closing on navigation

### Security
- Upgraded dependencies to patch CVE-2026-XXXX
```
