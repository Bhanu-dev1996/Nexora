# Changelog

## NovaCRM AI — Enterprise AI-Powered CRM Platform

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

#### AI Features
- AI Copilot with context-aware assistance, natural language commands, and proactive suggestions
- Smart Search combining full-text search with AI-powered semantic ranking and entity recognition
- Email Generator with template-based and AI-generated modes, tone customization, and personalization
- Proposal Generator with AI-written executive summaries, dynamic pricing tables, and PDF export
- Meeting Summary with audio transcription, speaker diarization, and automated action item creation
- Call Summary with call recording analysis, sentiment tracking, and objection detection
- AI Lead Scoring using ML-based scoring on engagement, fit, and intent signals with real-time updates
- Deal Prediction for win probability, expected close dates, risk factor analysis, and recommendations
- Next Best Action engine recommending optimal actions per lead/deal based on predictive analysis
- Customer Insights including behavioral analysis, churn prediction, LTV estimation, and health scoring
- Sales Forecast with pipeline-based, historical, and AI-enhanced forecasting models
- Document Summarization supporting contracts, proposals, emails, and support tickets
- AI Chat conversational interface for CRM data queries and manipulation
- Natural Language Search allowing plain English questions about CRM data

#### Integration
- Google Calendar OAuth 2.0 integration with bi-directional event sync (5-minute intervals)
- Microsoft Outlook MSAL integration with calendar, email, and contact sync
- Slack bot integration with real-time notifications, slash commands, and interactive messages
- Stripe payment processing with subscription management, invoicing, and webhook event handling
- OpenAI GPT-4 and text-embedding-3-small integration for AI features
- Google Gemini integration for multimodal AI, document analysis, and audio transcription
- Custom outgoing webhook system with HMAC-SHA256 signing and configurable retry logic
- Public REST API for third-party integrations with API key authentication
- Zapier integration with 10+ triggers and 10+ actions for no-code automation

#### Frontend
- React 19 application shell with TypeScript 6 and Vite 8
- Tailwind CSS v4 styling with custom base-nova design system (shadcn/ui)
- Lucide React icons throughout the UI
- TanStack Query for server state management with caching and background refetching
- Zustand stores for client-side state management
- Route-level code splitting with React.lazy and Suspense
- Virtual scrolling for large lists (TanStack Virtual)
- Responsive layout supporting desktop, laptop, tablet, and mobile
- Dark mode and light mode themes
- Accessibility compliance with WCAG AA standards
- Skeleton loading states, empty states, and error states
- Global search bar with keyboard shortcut (Cmd+K)
- AI Copilot floating widget with slide-out drawer
- Notifications center with real-time updates
- Onboarding wizard for new users

#### Backend
- Node.js and Express REST API server
- Prisma ORM with PostgreSQL for data persistence
- Redis for caching, session management, and rate limiting
- Role-based access control (RBAC) with granular permissions
- JWT authentication with short-lived access tokens and HTTP-only refresh cookies
- Multi-factor authentication (TOTP)
- Social login (Google, Microsoft, GitHub, LinkedIn)
- Email service for transactional emails (password reset, verification, notifications)
- File upload service with type validation and virus scanning
- Audit logging for all security-relevant events
- Webhook delivery system with retry logic and logging
- Rate limiting per endpoint, per IP, and per user with Redis backing
,

- Password hashing with bcrypt (12 salt rounds) and comprehensive password policy
- JWT security with RS256 signing, 15-minute access tokens, and 7-day refresh token rotation
- CORS configuration with strict origin whitelist per environment
- Zod schema validation on all API inputs
- Tiered rate limiting (global, auth, API, AI, webhook, file upload)
- XSS prevention via DOMPurify sanitization, CSP headers, and React escaping
- CSRF protection with SameSite cookies and double-submit cookie pattern
- SQL injection prevention via Prisma ORM parameterized queries
- Secrets management with environment variables, no secrets in code
- HTTPS enforcement with TLS 1.3, HSTS preload, and automatic certificate renewal
- Security headers via Helmet.js (CSP, HSTS, X-Frame-Options, etc.)
- Session management with 30-minute idle timeout and 12-hour absolute timeout
- IP restrictions with configurable whitelist, CIDR support, and geolocation blocking
- Data encryption at rest (AES-256) and in transit (TLS 1.3)
- Audit logging with 7-year retention and SIEM export capability

#### Performance
- Lazy loading at route and component level with React.lazy
- Image optimization with WebP format, lazy loading, and responsive srcset
- Bundle analysis with Vite rollup-plugin-visualizer
- Tree shaking with named imports and modular libraries
- Route and data prefetching (TanStack Query prefetchQuery)
- Database indexing strategy with composite and GIN indexes
- Query optimization with eager loading (Prisma includes) and cursor pagination
- Redis caching for sessions, query results, and API responses
- Connection pooling for PostgreSQL and Redis
- Response compression (Brotli preferred, Gzip fallback)
- CDN delivery via Vercel Edge Network (100+ locations)
- HTTP/2 multiplexing and HTTP/3 (QUIC) support

#### Documentation
- Product Requirements Document (PRD)
- Security documentation covering all security measures and OWASP Top 10 compliance
- Performance optimization strategies and budgets
- AI features documentation for all 15 AI capabilities
- Integrations documentation for all 7 third-party integrations
- Changelog following Keep a Changelog format
- Release notes for all versions

### Changed

- N/A (initial release)

### Deprecated

- N/A (initial release)

### Removed

- N/A (initial release)

### Fixed

- N/A (initial release)

### Security

- N/A (initial release - security fully integrated from the start)

---

## [0.1.0] - 2026-07-20

### Added

- Project initialization with monorepo structure
- Frontend application setup (React 19, TypeScript 6, Vite 8, Tailwind CSS v4)
- Backend application setup (Node.js, Express, Prisma, PostgreSQL)
- Authentication system (email/password, JWT, MFA, social login)
- User management with roles and permissions
- Organization and team management
- Lead management module (CRUD, import, export, scoring)
- Contact management module with merge and deduplication
- Company management module with hierarchy support
- Deal management module with Kanban pipeline and stages
- Task management with priorities, checklists, and dependencies
- Calendar with day/week/month/agenda views
- Dashboard with KPI cards, charts, and activity feed
- Reporting and analytics engine
- Notification system (in-app, email, push)
- Settings and administration modules
- API documentation and public REST API
- Product Requirements Document (PRD)

---

[Unreleased]: https://github.com/novacrm/novacrm-ai/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/novacrm/novacrm-ai/releases/tag/v0.1.0
