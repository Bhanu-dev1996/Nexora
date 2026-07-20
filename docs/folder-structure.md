# Folder Structure

## NovaCRM AI - Enterprise AI-Powered CRM Platform

Version: 1.0
Document Type: Project Structure Reference
Status: Draft

---

## Table of Contents

1. [Monorepo Overview](#1-monorepo-overview)
2. [Root Directory](#2-root-directory)
3. [Frontend Structure](#3-frontend-structure)
4. [Backend Structure](#4-backend-structure)
5. [Shared Types](#5-shared-types)
6. [Key Files Reference](#6-key-files-reference)

---

## 1. Monorepo Overview

NovaCRM AI uses a **monorepo** structure with two primary packages:

```
D:\Web Projects\Nexora\
|
+-- frontend/          # React 19 SPA (Vite 8 + TypeScript 6)
+-- backend/           # Node.js REST API (Express + Prisma)
+-- docs/              # Project documentation
+-- .git/              # Git repository
```

**Why monorepo:**

- Shared TypeScript types between frontend and backend
- Atomic commits across both packages
- Single repository for code review and CI/CD
- Easy to understand project structure for new contributors

---

## 2. Root Directory

```
Nexora/                              # Repository root
|
+-- .gitignore                       # Global git ignores (node_modules, .env, dist)
+-- README.md                        # Project overview, setup instructions
+-- LICENSE                          # MIT License
+-- package.json                     # Root workspace config (if using npm workspaces)
+-- turbo.json                       # Turborepo config (optional, for monorepo task runner)
|
+-- docs/                            # Project documentation
|   +-- requirements.md              # Product Requirements Document (PRD)
|   +-- architecture.md              # System architecture
|   +-- tech-stack.md                # Technology stack reference
|   +-- folder-structure.md          # This file
|   +-- database-design.md           # Database schema and design
|   +-- er-diagram.md                # Entity Relationship Diagram
|   +-- api-reference.md             # API endpoint documentation (future)
|   +-- deployment.md                # Deployment guide (future)
|   +-- contributing.md              # Contribution guidelines (future)
|
+-- frontend/                        # Frontend application (React SPA)
+-- backend/                         # Backend application (Node.js API)
```

---

## 3. Frontend Structure

```
frontend/
|
+-- .gitignore                       # Frontend-specific ignores
+-- .oxlintrc.json                   # Oxlint configuration
+-- components.json                  # shadcn/ui configuration
+-- index.html                       # HTML entry point (Vite SPA)
+-- package.json                     # Dependencies and scripts
+-- package-lock.json                # Lockfile
+-- tsconfig.json                    # Base TypeScript config
+-- tsconfig.app.json                # App-specific TypeScript config
+-- tsconfig.node.json               # Node/Vite TypeScript config
+-- vite.config.ts                   # Vite build configuration
+-- README.md                        # Frontend-specific docs
|
+-- public/                          # Static assets (served as-is)
|   +-- favicon.ico                  # App favicon
|   +-- logo.svg                     # App logo
|   +-- robots.txt                   # Search engine directives
|   +-- manifest.json                # PWA manifest (future)
|
+-- src/                             # Source code
|   |
|   +-- main.tsx                     # Application entry point
|   +-- App.tsx                      # Root component (providers, router)
|   +-- index.css                    # Global styles + Tailwind imports
|   +-- vite-env.d.ts               # Vite type declarations
|   |
|   +-- app/                         # Application shell and routing
|   |   +-- layout/                  # Layout components
|   |   |   +-- root-layout.tsx      # Root layout (sidebar + topbar + content)
|   |   |   +-- auth-layout.tsx      # Auth pages layout (centered card)
|   |   |   +-- dashboard-layout.tsx # Dashboard layout (sidebar + main)
|   |   |   +-- blank-layout.tsx     # Full-width layout (reports, settings)
|   |   |
|   |   +-- routes/                  # Route definitions
|   |   |   +-- index.tsx            # Route tree configuration
|   |   |   +-- auth-routes.tsx      # Auth routes (login, register, etc.)
|   |   |   +-- dashboard-routes.tsx # Dashboard module routes
|   |   |   +-- leads-routes.tsx     # Leads module routes
|   |   |   +-- contacts-routes.tsx  # Contacts module routes
|   |   |   +-- companies-routes.tsx # Companies module routes
|   |   |   +-- deals-routes.tsx     # Deals module routes
|   |   |   +-- tasks-routes.tsx     # Tasks module routes
|   |   |   +-- calendar-routes.tsx  # Calendar module routes
|   |   |   +-- emails-routes.tsx    # Emails module routes
|   |   |   +-- meetings-routes.tsx  # Meetings module routes
|   |   |   +-- marketing-routes.tsx # Marketing module routes
|   |   |   +-- support-routes.tsx   # Support module routes
|   |   |   +-- reports-routes.tsx   # Reports module routes
|   |   |   +-- settings-routes.tsx  # Settings module routes
|   |   |   +-- admin-routes.tsx     # Admin module routes
|   |   |   +-- billing-routes.tsx   # Billing module routes
|   |   |
|   |   +-- guards/                  # Route guards
|   |       +-- auth-guard.tsx       # Redirects to login if not authenticated
|   |       +-- role-guard.tsx       # Checks user role/permissions
|   |
|   +-- components/                  # Shared/reusable components
|   |   |
|   |   +-- ui/                      # shadcn/ui base components
|   |   |   +-- button.tsx           # Button (variants: default, destructive, outline, ghost)
|   |   |   +-- card.tsx             # Card, CardHeader, CardContent, CardTitle
|   |   |   +-- dialog.tsx           # Modal dialog
|   |   |   +-- dropdown-menu.tsx    # Dropdown menu
|   |   |   +-- input.tsx            # Text input
|   |   |   +-- label.tsx            # Form label
|   |   |   +-- select.tsx           # Select dropdown
|   |   |   +-- table.tsx            # Data table
|   |   |   +-- tabs.tsx             # Tab navigation
|   |   |   +-- toast.tsx            # Toast notifications
|   |   |   +-- tooltip.tsx          # Tooltip
|   |   |   +-- badge.tsx            # Status badges
|   |   |   +-- avatar.tsx           # User avatars
|   |   |   +-- separator.tsx        # Horizontal/vertical divider
|   |   |   +-- skeleton.tsx         # Loading skeleton
|   |   |   +-- scroll-area.tsx      # Scrollable container
|   |   |   +-- sheet.tsx            # Side sheet/drawer
|   |   |   +-- command.tsx          # Command palette (Cmd+K)
|   |   |   +-- popover.tsx          # Popover
|   |   |   +-- calendar.tsx         # Date picker calendar
|   |   |   +-- checkbox.tsx         # Checkbox
|   |   |   +-- switch.tsx           # Toggle switch
|   |   |   +-- textarea.tsx         # Multi-line text input
|   |   |   +-- form.tsx             # Form field wrapper
|   |   |   +-- alert.tsx            # Alert messages
|   |   |   +-- progress.tsx         # Progress bar
|   |   |   +-- slider.tsx           # Range slider
|   |   |   +-- breadcrumb.tsx       # Breadcrumb navigation
|   |   |   +-- pagination.tsx       # Pagination controls
|   |   |   +-- accordion.tsx        # Collapsible sections
|   |   |   +-- alert-dialog.tsx     # Confirmation dialog
|   |   |   +-- context-menu.tsx     # Right-click context menu
|   |   |   +-- radio-group.tsx      # Radio button group
|   |   |   +-- toggle.tsx           # Toggle button
|   |   |   +-- toggle-group.tsx     # Toggle button group
|   |   |   +-- resizable.tsx        # Resizable panels
|   |   |   +-- chart.tsx            # Recharts wrapper
|   |   |
|   |   +-- layout/                  # Layout components
|   |   |   +-- sidebar.tsx          # Main navigation sidebar
|   |   |   +-- sidebar-item.tsx     # Individual sidebar link
|   |   |   +-- sidebar-group.tsx    # Sidebar navigation group
|   |   |   +-- topbar.tsx           # Top navigation bar
|   |   |   +-- search-command.tsx   # Global search (Cmd+K)
|   |   |   +-- notification-bell.tsx # Notification indicator
|   |   |   +-- user-menu.tsx        # User avatar dropdown
|   |   |   +-- breadcrumbs.tsx      # Dynamic breadcrumbs
|   |   |   +-- page-header.tsx      # Page title + actions
|   |   |   +-- theme-toggle.tsx     # Light/dark theme switch
|   |   |
|   |   +-- data-display/            # Data visualization components
|   |   |   +-- data-table.tsx       # Reusable data table with sorting, filtering, pagination
|   |   |   +-- data-table-toolbar.tsx # Table search, filters, bulk actions
|   |   |   +-- data-table-pagination.tsx # Table pagination controls
|   |   |   +-- data-table-column-header.tsx # Sortable column headers
|   |   |   +-- kanban-board.tsx     # Drag-and-drop Kanban board
|   |   |   +-- kanban-column.tsx    # Single Kanban column
|   |   |   +-- kanban-card.tsx      # Draggable Kanban card
|   |   |   +-- stat-card.tsx        # KPI stat card with icon
|   |   |   +-- empty-state.tsx      # Empty state illustration
|   |   |   +-- error-state.tsx      # Error state display
|   |   |
|   |   +-- forms/                   # Form components
|   |   |   +-- form-field.tsx       # Label + Input + Error message wrapper
|   |   |   +-- form-section.tsx     # Grouped form section with title
|   |   |   +-- form-actions.tsx     # Submit/cancel button group
|   |   |   +-- search-input.tsx     # Debounced search input
|   |   |   +-- multi-select.tsx     # Multi-select dropdown
|   |   |   +-- file-upload.tsx      # File upload with drag-and-drop
|   |   |   +-- rich-text-editor.tsx # Rich text input (future)
|   |   |
|   |   +-- feedback/                # Feedback and status components
|   |   |   +-- loading-spinner.tsx  # Loading indicator
|   |   |   +-- toast-provider.tsx   # Toast context provider
|   |   |   +-- confirm-dialog.tsx   # Reusable confirmation modal
|   |   |   +-- progress-bar.tsx     # Step progress indicator
|   |   |
|   |   +-- ai/                      # AI-specific components
|   |       +-- ai-chat.tsx          # AI copilot chat panel
|   |       +-- ai-chat-message.tsx  # Individual chat message
|   |       +-- ai-insight-card.tsx  # AI-generated insight display
|   |       +-- ai-suggestion.tsx    # Action suggestion chip
|   |       +-- ai-score-badge.tsx   # AI score indicator (lead score)
|   |       +-- ai-loading.tsx       # AI thinking indicator
|   |
|   +-- features/                    # Domain feature modules
|   |   |
|   |   +-- auth/                    # Authentication
|   |   |   +-- components/
|   |   |   |   +-- login-form.tsx
|   |   |   |   +-- register-form.tsx
|   |   |   |   +-- forgot-password-form.tsx
|   |   |   |   +-- reset-password-form.tsx
|   |   |   |   +-- mfa-verify-form.tsx
|   |   |   |   +-- social-login-buttons.tsx
|   |   |   +-- pages/
|   |   |   |   +-- login-page.tsx
|   |   |   |   +-- register-page.tsx
|   |   |   |   +-- forgot-password-page.tsx
|   |   |   |   +-- reset-password-page.tsx
|   |   |   |   +-- verify-email-page.tsx
|   |   |   +-- hooks/
|   |   |   |   +-- use-login.ts
|   |   |   |   +-- use-register.ts
|   |   |   +-- api/
|   |   |       +-- auth-api.ts
|   |   |
|   |   +-- dashboard/               # Dashboard
|   |   |   +-- components/
|   |   |   |   +-- kpi-cards.tsx
|   |   |   |   +-- revenue-chart.tsx
|   |   |   |   +-- sales-funnel.tsx
|   |   |   |   +-- recent-activities.tsx
|   |   |   |   +-- upcoming-meetings.tsx
|   |   |   |   +-- ai-insights.tsx
|   |   |   |   +-- pipeline-summary.tsx
|   |   |   |   +-- calendar-widget.tsx
|   |   |   |   +-- tasks-widget.tsx
|   |   |   +-- pages/
|   |   |   |   +-- dashboard-page.tsx
|   |   |   +-- hooks/
|   |   |       +-- use-dashboard-stats.ts
|   |   |
|   |   +-- leads/                   # Lead Management
|   |   |   +-- components/
|   |   |   |   +-- lead-list.tsx
|   |   |   |   +-- lead-table.tsx
|   |   |   |   +-- lead-detail.tsx
|   |   |   |   +-- lead-form.tsx
|   |   |   |   +-- lead-pipeline.tsx
|   |   |   |   +-- lead-timeline.tsx
|   |   |   |   +-- lead-score-badge.tsx
|   |   |   |   +-- lead-filters.tsx
|   |   |   |   +-- lead-convert-dialog.tsx
|   |   |   +-- pages/
|   |   |   |   +-- leads-page.tsx
|   |   |   |   +-- lead-detail-page.tsx
|   |   |   +-- hooks/
|   |   |   |   +-- use-leads.ts
|   |   |   |   +-- use-lead.ts
|   |   |   |   +-- use-lead-scoring.ts
|   |   |   +-- api/
|   |   |   |   +-- leads-api.ts
|   |   |   +-- types/
|   |   |       +-- lead-types.ts
|   |   |
|   |   +-- contacts/                # Contact Management
|   |   |   +-- components/
|   |   |   +-- pages/
|   |   |   +-- hooks/
|   |   |   +-- api/
|   |   |   +-- types/
|   |   |
|   |   +-- companies/               # Company Management
|   |   |   +-- components/
|   |   |   +-- pages/
|   |   |   +-- hooks/
|   |   |   +-- api/
|   |   |   +-- types/
|   |   |
|   |   +-- deals/                   # Deal Management
|   |   |   +-- components/
|   |   |   |   +-- deal-pipeline.tsx
|   |   |   |   +-- deal-kanban.tsx
|   |   |   |   +-- deal-detail.tsx
|   |   |   |   +-- deal-form.tsx
|   |   |   |   +-- deal-forecast.tsx
|   |   |   |   +-- deal-products.tsx
|   |   |   +-- pages/
|   |   |   +-- hooks/
|   |   |   +-- api/
|   |   |   +-- types/
|   |   |
|   |   +-- tasks/                   # Task Management
|   |   |   +-- components/
|   |   |   |   +-- task-list.tsx
|   |   |   |   +-- task-board.tsx (Kanban)
|   |   |   |   +-- task-calendar.tsx
|   |   |   |   +-- task-form.tsx
|   |   |   |   +-- task-detail.tsx
|   |   |   +-- pages/
|   |   |   +-- hooks/
|   |   |   +-- api/
|   |   |   +-- types/
|   |   |
|   |   +-- calendar/                # Calendar
|   |   |   +-- components/
|   |   |   |   +-- day-view.tsx
|   |   |   |   +-- week-view.tsx
|   |   |   |   +-- month-view.tsx
|   |   |   |   +-- agenda-view.tsx
|   |   |   |   +-- calendar-event.tsx
|   |   |   |   +-- event-form.tsx
|   |   |   +-- pages/
|   |   |   +-- hooks/
|   |   |   +-- api/
|   |   |   +-- types/
|   |   |
|   |   +-- emails/                  # Email Center
|   |   |   +-- components/
|   |   |   |   +-- inbox-list.tsx
|   |   |   |   +-- email-reader.tsx
|   |   |   |   +-- email-compose.tsx
|   |   |   |   +-- email-template-selector.tsx
|   |   |   +-- pages/
|   |   |   +-- hooks/
|   |   |   +-- api/
|   |   |   +-- types/
|   |   |
|   |   +-- meetings/                # Meeting Scheduler
|   |   |   +-- components/
|   |   |   +-- pages/
|   |   |   +-- hooks/
|   |   |   +-- api/
|   |   |   +-- types/
|   |   |
|   |   +-- marketing/               # Marketing
|   |   |   +-- components/
|   |   |   |   +-- campaign-list.tsx
|   |   |   |   +-- campaign-builder.tsx
|   |   |   |   +-- campaign-analytics.tsx
|   |   |   +-- pages/
|   |   |   +-- hooks/
|   |   |   +-- api/
|   |   |   +-- types/
|   |   |
|   |   +-- support/                 # Customer Support
|   |   |   +-- components/
|   |   |   |   +-- ticket-list.tsx
|   |   |   |   +-- ticket-detail.tsx
|   |   |   |   +-- ticket-form.tsx
|   |   |   |   +-- knowledge-base.tsx
|   |   |   +-- pages/
|   |   |   +-- hooks/
|   |   |   +-- api/
|   |   |   +-- types/
|   |   |
|   |   +-- reports/                 # Reports & Analytics
|   |   |   +-- components/
|   |   |   |   +-- report-builder.tsx
|   |   |   |   +-- chart-card.tsx
|   |   |   |   +-- report-export.tsx
|   |   |   |   +-- kpi-dashboard.tsx
|   |   |   +-- pages/
|   |   |   +-- hooks/
|   |   |   +-- api/
|   |   |   +-- types/
|   |   |
|   |   +-- ai-assistant/            # AI Assistant
|   |   |   +-- components/
|   |   |   |   +-- ai-copilot-panel.tsx
|   |   |   |   +-- ai-chat-window.tsx
|   |   |   |   +-- ai-suggestion-bar.tsx
|   |   |   +-- pages/
|   |   |   +-- hooks/
|   |   |   |   +-- use-ai-chat.ts
|   |   |   |   +-- use-ai-suggestions.ts
|   |   |   +-- api/
|   |   |       +-- ai-api.ts
|   |   |
|   |   +-- settings/                # Settings
|   |   |   +-- components/
|   |   |   |   +-- profile-settings.tsx
|   |   |   |   +-- organization-settings.tsx
|   |   |   |   +-- appearance-settings.tsx
|   |   |   |   +-- notification-settings.tsx
|   |   |   |   +-- security-settings.tsx
|   |   |   +-- pages/
|   |   |   +-- hooks/
|   |   |   +-- api/
|   |   |   +-- types/
|   |   |
|   |   +-- admin/                   # Administration
|   |   |   +-- components/
|   |   |   |   +-- user-management.tsx
|   |   |   |   +-- role-management.tsx
|   |   |   |   +-- team-management.tsx
|   |   |   |   +-- audit-log-table.tsx
|   |   |   +-- pages/
|   |   |   +-- hooks/
|   |   |   +-- api/
|   |   |   +-- types/
|   |   |
|   |   +-- billing/                 # Billing & Subscriptions
|   |       +-- components/
|   |       |   +-- plan-card.tsx
|   |       |   +-- subscription-status.tsx
|   |       |   +-- invoice-table.tsx
|   |       |   +-- payment-method.tsx
|   |       +-- pages/
|   |       +-- hooks/
|   |       +-- api/
|   |       +-- types/
|   |
|   +-- hooks/                       # Global custom hooks
|   |   +-- use-auth.ts              # Authentication state and methods
|   |   +-- use-debounce.ts          # Debounce input values
|   |   +-- use-local-storage.ts     # Persistent client state
|   |   +-- use-media-query.ts       # Responsive breakpoint detection
|   |   +-- use-pagination.ts        # Pagination state management
|   |   +-- use-permissions.ts       # Role-based permission checks
|   |   +-- use-organization.ts      # Current organization context
|   |   +-- use-theme.ts             # Theme (light/dark) management
|   |   +-- use-command-palette.ts   # Command palette open/close
|   |
|   +-- lib/                         # Utility functions and helpers
|   |   +-- utils.ts                 # cn() class merge, formatDate, formatCurrency
|   |   +-- api-client.ts            # Axios instance with interceptors
|   |   +-- constants.ts             # App constants, route paths, API URLs
|   |   +-- validators.ts            # Shared Zod validation schemas
|   |   +-- permissions.ts           # Permission constants and helpers
|   |
|   +-- stores/                      # Zustand stores
|   |   +-- auth-store.ts            # User, token, login/logout actions
|   |   +-- ui-store.ts              # Sidebar, theme, command palette
|   |   +-- notification-store.ts    # Notifications, unread count
|   |
|   +-- types/                       # TypeScript type definitions
|   |   +-- api.ts                   # API request/response types
|   |   +-- models.ts                # Domain entity interfaces
|   |   +-- index.ts                 # Re-exports
|   |
|   +-- test/                        # Test setup and utilities
|       +-- setup.ts                 # Vitest setup (jest-dom, mocks)
|       +-- test-utils.tsx           # Custom render with providers
|       +-- mocks/                   # Mock data and handlers
|           +-- handlers.ts          # MSW API handlers
|           +-- data.ts              # Mock entity data
|
+-- .vscode/                         # VS Code workspace settings (optional)
    +-- settings.json                # Editor preferences
    +-- extensions.json              # Recommended extensions
```

---

## 4. Backend Structure

```
backend/
|
+-- .gitignore                       # Backend-specific ignores
+-- .env.example                     # Environment variable template
+-- .env                             # Local environment variables (gitignored)
+-- package.json                     # Dependencies and scripts
+-- package-lock.json                # Lockfile
+-- tsconfig.json                    # TypeScript configuration
+-- Dockerfile                       # Docker build instructions
+-- docker-compose.yml               # Local development services
+-- README.md                        # Backend-specific docs
|
+-- prisma/                          # Prisma ORM
|   +-- schema.prisma                # Database schema (single source of truth)
|   +-- seed.ts                      # Database seed script
|   +-- migrations/                  # Auto-generated migrations
|       +-- migration_lock.toml      # Migration provider lock
|       +-- 20240101000000_init/     # Initial migration
|           +-- migration.sql
|
+-- src/                             # Source code
|   |
|   +-- index.ts                     # Application entry point
|   +-- app.ts                       # Express app setup (middleware, routes)
|   +-- server.ts                    # HTTP server startup
|   |
|   +-- config/                      # Configuration
|   |   +-- index.ts                 # Central config (env vars, defaults)
|   |   +-- database.ts              # Prisma client singleton
|   |   +-- redis.ts                 # Redis client setup
|   |   +-- cors.ts                  # CORS configuration
|   |   +-- env.ts                   # Environment variable validation (Zod)
|   |
|   +-- middleware/                   # Express middleware
|   |   +-- auth.middleware.ts       # JWT verification
|   |   +-- rbac.middleware.ts       # Role-based access control
|   |   +-- validate.middleware.ts   # Request validation (Zod schema)
|   |   +-- rate-limit.middleware.ts # Rate limiting (Redis)
|   |   +-- logger.middleware.ts     # Request logging (Pino)
|   |   +-- error.middleware.ts      # Global error handler
|   |   +-- audit.middleware.ts      # Audit logging
|   |   +-- organization.middleware.ts # Org context extraction
|   |
|   +-- modules/                     # Domain modules (controller + service + repository)
|   |   |
|   |   +-- auth/                    # Authentication module
|   |   |   +-- auth.controller.ts   # POST /login, /register, /refresh, /logout
|   |   |   +-- auth.service.ts      # Validate credentials, hash passwords
|   |   |   +-- auth.repository.ts   # Find user, create user
|   |   |   +-- auth.routes.ts       # Route definitions
|   |   |   +-- auth.validation.ts   # Zod schemas
|   |   |   +-- auth.types.ts        # DTOs and response types
|   |   |   +-- auth.middleware.ts    # Token refresh middleware
|   |   |
|   |   +-- users/                   # User management
|   |   |   +-- users.controller.ts
|   |   |   +-- users.service.ts
|   |   |   +-- users.repository.ts
|   |   |   +-- users.routes.ts
|   |   |   +-- users.validation.ts
|   |   |   +-- users.types.ts
|   |   |
|   |   +-- organizations/           # Organization management
|   |   |   +-- organizations.controller.ts
|   |   |   +-- organizations.service.ts
|   |   |   +-- organizations.repository.ts
|   |   |   +-- organizations.routes.ts
|   |   |   +-- organizations.validation.ts
|   |   |   +-- organizations.types.ts
|   |   |
|   |   +-- teams/                   # Team management
|   |   |   +-- teams.controller.ts
|   |   |   +-- teams.service.ts
|   |   |   +-- teams.repository.ts
|   |   |   +-- teams.routes.ts
|   |   |   +-- teams.validation.ts
|   |   |   +-- teams.types.ts
|   |   |
|   |   +-- roles/                   # Role & permission management
|   |   |   +-- roles.controller.ts
|   |   |   +-- roles.service.ts
|   |   |   +-- roles.repository.ts
|   |   |   +-- roles.routes.ts
|   |   |   +-- roles.validation.ts
|   |   |   +-- roles.types.ts
|   |   |
|   |   +-- leads/                   # Lead management
|   |   |   +-- leads.controller.ts
|   |   |   +-- leads.service.ts
|   |   |   +-- leads.repository.ts
|   |   |   +-- leads.routes.ts
|   |   |   +-- leads.validation.ts
|   |   |   +-- leads.types.ts
|   |   |
|   |   +-- contacts/                # Contact management
|   |   +-- companies/               # Company management
|   |   +-- deals/                   # Deal management
|   |   +-- products/                # Product catalog
|   |   +-- orders/                  # Order management
|   |   +-- invoices/                # Invoice management
|   |   +-- payments/                # Payment processing
|   |   +-- campaigns/               # Marketing campaigns
|   |   +-- tasks/                   # Task management
|   |   +-- events/                  # Calendar events
|   |   +-- meetings/                # Meeting scheduler
|   |   +-- messages/                # Internal messaging
|   |   +-- emails/                  # Email management
|   |   +-- notifications/           # Notification system
|   |   +-- tickets/                 # Support tickets
|   |   +-- reports/                 # Report generation
|   |   +-- activities/              # Activity logging
|   |   +-- comments/                # Comments system
|   |   +-- tags/                    # Tag management
|   |   +-- files/                   # File upload management
|   |   +-- workflows/               # Workflow automation
|   |   +-- ai/                      # AI service integration
|   |   |   +-- ai.controller.ts
|   |   |   +-- ai.service.ts
|   |   |   +-- ai.routes.ts
|   |   |   +-- ai.types.ts
|   |   |   +-- prompts/             # AI prompt templates
|   |   |   |   +-- lead-scoring.ts
|   |   |   |   +-- email-generation.ts
|   |   |   |   +-- deal-prediction.ts
|   |   |   |   +-- meeting-summary.ts
|   |   |   |   +-- next-best-action.ts
|   |   |   |   +-- document-summary.ts
|   |   |   +-- providers/           # AI provider adapters
|   |   |       +-- openai.adapter.ts
|   |   |       +-- gemini.adapter.ts
|   |   +-- settings/                # Application settings
|   |   +-- admin/                   # Admin operations
|   |   +-- billing/                 # Billing & subscriptions
|   |   +-- audit-logs/              # Audit trail
|   |   +-- api-keys/                # API key management
|   |
|   +-- shared/                      # Shared utilities
|   |   +-- errors/                  # Custom error classes
|   |   |   +-- app-error.ts         # Base application error
|   |   |   +-- not-found.error.ts
|   |   |   +-- unauthorized.error.ts
|   |   |   +-- forbidden.error.ts
|   |   |   +-- validation.error.ts
|   |   |   +-- conflict.error.ts
|   |   |
|   |   +-- utils/                   # Utility functions
|   |   |   +-- password.ts          # bcrypt hash/compare
|   |   |   +-- token.ts             # JWT sign/verify
|   |   |   +-- pagination.ts        # Pagination helper
|   |   |   +-- email.ts             # Send email helper
|   |   |   +-- file.ts              # File upload helper
|   |   |   +-- slug.ts              # URL slug generator
|   |   |   +-- uuid.ts              # UUID generation
|   |   |
|   |   +-- types/                   # Shared TypeScript types
|   |   |   +-- index.ts
|   |   |
|   |   +-- constants/               # Shared constants
|   |       +-- roles.ts             # Role names
|   |       +-- permissions.ts       # Permission strings
|   |       +-- statuses.ts          # Entity status enums
|   |       +-- error-codes.ts       # API error codes
|   |
|   +-- jobs/                        # Background job definitions
|   |   +-- email.job.ts             # Email sending jobs
|   |   +-- ai-score.job.ts          # AI lead scoring jobs
|   |   +-- report.job.ts            # Report generation jobs
|   |   +-- export.job.ts            # Data export jobs
|   |   +-- webhook.job.ts           # Outbound webhook jobs
|   |   +-- cleanup.job.ts           # Data cleanup/archival jobs
|   |
|   +-- integrations/                # Third-party service integrations
|   |   +-- stripe/                  # Stripe payment integration
|   |   |   +-- stripe.service.ts
|   |   |   +-- stripe.webhooks.ts
|   |   +-- sendgrid/                # SendGrid email integration
|   |   |   +-- sendgrid.service.ts
|   |   +-- google/                  # Google Calendar/OAuth
|   |   |   +-- google.service.ts
|   |   +-- slack/                   # Slack notifications
|   |       +-- slack.service.ts
|   |
|   +-- test/                        # Test files
|       +-- setup.ts                 # Test setup
|       +-- helpers.ts               # Test utilities
|       +-- fixtures/                # Test data
|           +-- users.fixture.ts
|           +-- leads.fixture.ts
|
+-- scripts/                         # Utility scripts
    +-- seed.ts                      # Seed database
    +-- migrate.ts                   # Run migrations
    +-- generate-types.ts            # Generate TypeScript types from schema
```

---

## 5. Shared Types

Types shared between frontend and backend live in a common structure:

```
Frontend: src/types/models.ts   (mirrors backend Prisma-generated types)
Backend:  src/modules/*/types.ts (module-specific DTOs)

// Both reference the same Prisma schema as the source of truth
// Types are kept in sync manually (or via code generation in future)
```

---

## 6. Key Files Reference

### Configuration Files

| File | Purpose |
|------|---------|
| `frontend/vite.config.ts` | Vite build configuration, aliases, plugins |
| `frontend/tsconfig.json` | Base TypeScript config (shared) |
| `frontend/tsconfig.app.json` | App-specific TypeScript config |
| `frontend/tsconfig.node.json` | Node/Vite TypeScript config |
| `frontend/components.json` | shadcn/ui configuration |
| `frontend/.oxlintrc.json` | Oxlint rules |
| `backend/tsconfig.json` | Backend TypeScript config |
| `backend/prisma/schema.prisma` | Database schema (source of truth) |
| `backend/.env.example` | Environment variable template |

### Entry Points

| File | Purpose |
|------|---------|
| `frontend/index.html` | HTML shell (Vite entry) |
| `frontend/src/main.tsx` | React app bootstrap |
| `frontend/src/App.tsx` | Root component with providers |
| `backend/src/index.ts` | Application bootstrap |
| `backend/src/app.ts` | Express app configuration |
| `backend/src/server.ts` | HTTP server startup |

### Build Outputs

| Directory | Purpose |
|-----------|---------|
| `frontend/dist/` | Vite production build output |
| `backend/dist/` | TypeScript compilation output |

### Documentation Files

| File | Purpose |
|------|---------|
| `docs/requirements.md` | Product Requirements Document |
| `docs/architecture.md` | System architecture |
| `docs/tech-stack.md` | Technology stack |
| `docs/folder-structure.md` | This document |
| `docs/database-design.md` | Database schema documentation |
| `docs/er-diagram.md` | Entity Relationship Diagram |
