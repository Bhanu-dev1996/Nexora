# NovaCRM AI — Routing Architecture

> Complete routing documentation for the React Router v7–based navigation system.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Route Configuration](#route-configuration)
3. [Public Routes](#public-routes)
4. [Protected Routes](#protected-routes)
5. [Nested Route Structure](#nested-route-structure)
6. [Route Guards](#route-guards)
7. [Lazy Loading & Code Splitting](#lazy-loading--code-splitting)
8. [Role-Based Route Access](#role-based-route-access)
9. [404 Handling](#404-handling)
10. [Navigation Patterns](#navigation-patterns)
11. [Deep Linking & URL Parameters](#deep-linking--url-parameters)

---

## Architecture Overview

NovaCRM uses **React Router v7** with a file-system–inspired route structure. All routes are defined in a centralized route configuration at `src/routes/index.tsx`.

### Key Files

| File | Purpose |
|---|---|
| `src/routes/index.tsx` | Central route tree definition |
| `src/routes/guards/AuthGuard.tsx` | Authentication wrapper |
| `src/routes/guards/RoleGuard.tsx` | Role-based access wrapper |
| `src/routes/layouts/AuthLayout.tsx` | Authenticated layout (sidebar + topbar) |
| `src/routes/layouts/PublicLayout.tsx` | Public page layout (centered, no sidebar) |
| `src/routes/loaders.tsx` | Route-level data loaders |
| `src/routes/elements.tsx` | Lazy-loaded route elements |

### Route Tree Diagram

```
/
├── /login                          (Public)
├── /register                       (Public)
├── /forgot-password                (Public)
├── /reset-password/:token          (Public)
├── /verify-email/:token            (Public)
│
├── <AuthLayout>                    (Protected)
│   ├── /dashboard                  (Index redirect)
│   ├── /leads
│   │   ├── /                       (List)
│   │   ├── /create                 (Create)
│   │   └── /:id                    (Detail)
│   ├── /contacts
│   │   ├── /                       (List)
│   │   ├── /create                 (Create)
│   │   └── /:id                    (Detail)
│   ├── /companies
│   │   ├── /                       (List)
│   │   ├── /create                 (Create)
│   │   └── /:id                    (Detail)
│   ├── /deals
│   │   ├── /                       (List)
│   │   ├── /pipeline               (Kanban)
│   │   └── /:id                    (Detail)
│   ├── /tasks
│   │   ├── /                       (List)
│   │   ├── /create                 (Create)
│   │   └── /:id                    (Detail)
│   ├── /calendar
│   │   ├── /day                    (Day view)
│   │   ├── /week                   (Week view)
│   │   └── /month                  (Month view, default)
│   ├── /reports
│   │   ├── /revenue                (Revenue report)
│   │   ├── /sales                  (Sales report)
│   │   ├── /leads                  (Lead report)
│   │   └── /custom                 (Custom builder)
│   ├── /analytics
│   │   ├── /dashboard              (Analytics dashboard)
│   │   └── /pipeline               (Pipeline analytics)
│   ├── /ai
│   │   ├── /copilot                (AI Copilot)
│   │   └── /chat                   (AI Chat interface)
│   ├── /settings
│   │   ├── /profile                (User profile)
│   │   ├── /organization           (Org settings)
│   │   ├── /team                   (Team management)
│   │   ├── /security               (Security settings)
│   │   ├── /notifications          (Notification prefs)
│   │   ├── /integrations           (Third-party apps)
│   │   └── /billing                (Billing & plans)
│   └── /admin                      (Admin-only)
│       ├── /users                  (User management)
│       ├── /roles                  (Role management)
│       ├── /teams                  (Team management)
│       ├── /audit-logs             (Audit trail)
│       └── /api-keys               (API key management)
│
└── *                               (404 catch-all)
```

---

## Route Configuration

### `src/routes/index.tsx`

```tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";

import AuthLayout from "@/routes/layouts/AuthLayout";
import PublicLayout from "@/routes/layouts/PublicLayout";
import AuthGuard from "@/routes/guards/AuthGuard";
import RoleGuard from "@/routes/guards/RoleGuard";
import DashboardPage from "@/pages/dashboard";
import NotFoundPage from "@/pages/not-found";

// Lazy-loaded page modules
const LoginPage = lazy(() => import("@/pages/auth/login"));
const RegisterPage = lazy(() => import("@/pages/auth/register"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/forgot-password"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/reset-password"));
const VerifyEmailPage = lazy(() => import("@/pages/auth/verify-email"));

const LeadsListPage = lazy(() => import("@/pages/leads/list"));
const LeadCreatePage = lazy(() => import("@/pages/leads/create"));
const LeadDetailPage = lazy(() => import("@/pages/leads/detail"));

const ContactsListPage = lazy(() => import("@/pages/contacts/list"));
const ContactCreatePage = lazy(() => import("@/pages/contacts/create"));
const ContactDetailPage = lazy(() => import("@/pages/contacts/detail"));

const CompaniesListPage = lazy(() => import("@/pages/companies/list"));
const CompanyCreatePage = lazy(() => import("@/pages/companies/create"));
const CompanyDetailPage = lazy(() => import("@/pages/companies/detail"));

const DealsListPage = lazy(() => import("@/pages/deals/list"));
const DealsPipelinePage = lazy(() => import("@/pages/deals/pipeline"));
const DealDetailPage = lazy(() => import("@/pages/deals/detail"));

const TasksListPage = lazy(() => import("@/pages/tasks/list"));
const TaskCreatePage = lazy(() => import("@/pages/tasks/create"));
const TaskDetailPage = lazy(() => import("@/pages/tasks/detail"));

const CalendarDayPage = lazy(() => import("@/pages/calendar/day"));
const CalendarWeekPage = lazy(() => import("@/pages/calendar/week"));
const CalendarMonthPage = lazy(() => import("@/pages/calendar/month"));

const ReportsRevenuePage = lazy(() => import("@/pages/reports/revenue"));
const ReportsSalesPage = lazy(() => import("@/pages/reports/sales"));
const ReportsLeadsPage = lazy(() => import("@/pages/reports/leads"));
const ReportsCustomPage = lazy(() => import("@/pages/reports/custom"));

const AnalyticsDashboardPage = lazy(() => import("@/pages/analytics/dashboard"));
const AnalyticsPipelinePage = lazy(() => import("@/pages/analytics/pipeline"));

const AICopilotPage = lazy(() => import("@/pages/ai/copilot"));
const AIChatPage = lazy(() => import("@/pages/ai/chat"));

const SettingsProfilePage = lazy(() => import("@/pages/settings/profile"));
const SettingsOrganizationPage = lazy(() => import("@/pages/settings/organization"));
const SettingsTeamPage = lazy(() => import("@/pages/settings/team"));
const SettingsSecurityPage = lazy(() => import("@/pages/settings/security"));
const SettingsNotificationsPage = lazy(() => import("@/pages/settings/notifications"));
const SettingsIntegrationsPage = lazy(() => import("@/pages/settings/integrations"));
const SettingsBillingPage = lazy(() => import("@/pages/settings/billing"));

const AdminUsersPage = lazy(() => import("@/pages/admin/users"));
const AdminRolesPage = lazy(() => import("@/pages/admin/roles"));
const AdminTeamsPage = lazy(() => import("@/pages/admin/teams"));
const AdminAuditLogsPage = lazy(() => import("@/pages/admin/audit-logs"));
const AdminApiKeysPage = lazy(() => import("@/pages/admin/api-keys"));

export const router = createBrowserRouter([
  // ── Public Routes ─────────────────────────────────────────────
  {
    element: <PublicLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password/:token", element: <ResetPasswordPage /> },
      { path: "/verify-email/:token", element: <VerifyEmailPage /> },
    ],
  },

  // ── Protected Routes ──────────────────────────────────────────
  {
    element: (
      <AuthGuard>
        <AuthLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },

      // Dashboard
      { path: "dashboard", element: <DashboardPage /> },

      // Leads
      { path: "leads", element: <LeadsListPage /> },
      { path: "leads/create", element: <LeadCreatePage /> },
      { path: "leads/:id", element: <LeadDetailPage /> },

      // Contacts
      { path: "contacts", element: <ContactsListPage /> },
      { path: "contacts/create", element: <ContactCreatePage /> },
      { path: "contacts/:id", element: <ContactDetailPage /> },

      // Companies
      { path: "companies", element: <CompaniesListPage /> },
      { path: "companies/create", element: <CompanyCreatePage /> },
      { path: "companies/:id", element: <CompanyDetailPage /> },

      // Deals
      { path: "deals", element: <DealsListPage /> },
      { path: "deals/pipeline", element: <DealsPipelinePage /> },
      { path: "deals/:id", element: <DealDetailPage /> },

      // Tasks
      { path: "tasks", element: <TasksListPage /> },
      { path: "tasks/create", element: <TaskCreatePage /> },
      { path: "tasks/:id", element: <TaskDetailPage /> },

      // Calendar
      { path: "calendar", element: <Navigate to="/calendar/month" replace /> },
      { path: "calendar/day", element: <CalendarDayPage /> },
      { path: "calendar/week", element: <CalendarWeekPage /> },
      { path: "calendar/month", element: <CalendarMonthPage /> },

      // Reports
      { path: "reports", element: <Navigate to="/reports/revenue" replace /> },
      { path: "reports/revenue", element: <ReportsRevenuePage /> },
      { path: "reports/sales", element: <ReportsSalesPage /> },
      { path: "reports/leads", element: <ReportsLeadsPage /> },
      { path: "reports/custom", element: <ReportsCustomPage /> },

      // Analytics
      { path: "analytics", element: <Navigate to="/analytics/dashboard" replace /> },
      { path: "analytics/dashboard", element: <AnalyticsDashboardPage /> },
      { path: "analytics/pipeline", element: <AnalyticsPipelinePage /> },

      // AI
      { path: "ai", element: <Navigate to="/ai/copilot" replace /> },
      { path: "ai/copilot", element: <AICopilotPage /> },
      { path: "ai/chat", element: <AIChatPage /> },

      // Settings
      { path: "settings", element: <Navigate to="/settings/profile" replace /> },
      { path: "settings/profile", element: <SettingsProfilePage /> },
      { path: "settings/organization", element: <SettingsOrganizationPage /> },
      { path: "settings/team", element: <SettingsTeamPage /> },
      { path: "settings/security", element: <SettingsSecurityPage /> },
      { path: "settings/notifications", element: <SettingsNotificationsPage /> },
      { path: "settings/integrations", element: <SettingsIntegrationsPage /> },
      { path: "settings/billing", element: <SettingsBillingPage /> },

      // Admin (guarded)
      {
        element: <RoleGuard allowedRoles={["admin", "super_admin"]} />,
        children: [
          { path: "admin", element: <Navigate to="/admin/users" replace /> },
          { path: "admin/users", element: <AdminUsersPage /> },
          { path: "admin/roles", element: <AdminRolesPage /> },
          { path: "admin/teams", element: <AdminTeamsPage /> },
          { path: "admin/audit-logs", element: <AdminAuditLogsPage /> },
          { path: "admin/api-keys", element: <AdminApiKeysPage /> },
        ],
      },
    ],
  },

  // ── 404 Catch-All ─────────────────────────────────────────────
  { path: "*", element: <NotFoundPage /> },
]);
```

---

## Public Routes

Public routes are accessible without authentication. They use the `PublicLayout` which renders a centered card layout with the NovaCRM branding.

### `/login`

**File:** `src/pages/auth/login/index.tsx`

Email/password login form. Features:
- Email + password fields
- "Remember me" checkbox
- "Forgot password?" link
- Social login buttons (Google, Microsoft)
- Redirects to `/dashboard` on success

```tsx
// URL: /login
// Redirects to: /dashboard (if already authenticated)
// Layout: PublicLayout (centered, no sidebar)
```

### `/register`

**File:** `src/pages/auth/register/index.tsx`

New account registration. Features:
- Full name, email, company name, password, confirm password
- Password strength indicator
- Terms of service acceptance checkbox
- Redirects to `/verify-email` on success

```tsx
// URL: /register
// Redirects to: /verify-email (after registration)
// Layout: PublicLayout
```

### `/forgot-password`

**File:** `src/pages/auth/forgot-password/index.tsx`

Password reset request form. Features:
- Email input field
- Rate-limited to 3 requests per email per hour
- Shows confirmation message after submission

```tsx
// URL: /forgot-password
// Layout: PublicLayout
```

### `/reset-password/:token`

**File:** `src/pages/auth/reset-password/index.tsx`

Password reset form. Features:
- New password + confirm password
- Token validation on mount (shows error if expired/invalid)
- Redirects to `/login` on success
- Tokens expire after 1 hour

```tsx
// URL: /reset-password/:token
// Route params: token (string, 64-char hex)
// Redirects to: /login (on success)
// Layout: PublicLayout
```

### `/verify-email/:token`

**File:** `src/pages/auth/verify-email/index.tsx`

Email verification page. Features:
- Auto-verifies token on mount
- Shows success or error state
- "Resend verification email" option
- Tokens expire after 24 hours

```tsx
// URL: /verify-email/:token
// Route params: token (string, 64-char hex)
// Redirects to: /login (on success)
// Layout: PublicLayout
```

---

## Protected Routes

All routes under `AuthLayout` require authentication. Unauthenticated users are redirected to `/login` with a `returnUrl` query parameter.

### AuthGuard

**File:** `src/routes/guards/AuthGuard.tsx`

```tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return <>{children}</>;
}
```

### AuthLayout

**File:** `src/routes/layouts/AuthLayout.tsx`

Provides the authenticated application shell:
- Collapsible sidebar navigation
- Top navigation bar with search, notifications, and user menu
- `<Outlet />` for nested route content
- Command palette (⌘K) overlay
- AI Chat widget (floating)

---

## Nested Route Structure

### Dashboard

| Path | Component | Description |
|---|---|---|
| `/dashboard` | `DashboardPage` | Main dashboard with KPIs, charts, recent activity, upcoming tasks |

The dashboard displays:
- Stats cards (revenue, new leads, conversion rate, pipeline value)
- Revenue chart (line/area chart via Recharts)
- Lead funnel visualization
- Recent activity timeline
- Upcoming tasks widget
- Quick actions panel

### Leads

| Path | Component | Description |
|---|---|---|
| `/leads` | `LeadsListPage` | Filterable, sortable data table of all leads |
| `/leads/create` | `LeadCreatePage` | Multi-step lead creation form |
| `/leads/:id` | `LeadDetailPage` | Lead detail with activity timeline, notes, tasks, attachments |

#### Lead Detail Sub-routes

The lead detail page uses tab-based navigation internally:

| Tab | Content |
|---|---|
| Overview | Lead info card, score, source, tags |
| Activity | Chronological activity timeline |
| Notes | User notes with rich text editor |
| Tasks | Associated tasks with inline creation |
| Attachments | File upload and document list |

#### URL Parameters

```ts
// /leads/:id
params: {
  id: string; // UUID of the lead
}
```

#### Query Parameters

```ts
// /leads?status=qualified&source=website&page=2&sort=-createdAt
searchParams: {
  status?: "new" | "contacted" | "qualified" | "unqualified" | "converted";
  source?: string;
  assignee?: string;
  page?: number;
  limit?: number;
  sort?: string; // Prefix with - for descending
  search?: string;
}
```

### Contacts

| Path | Component | Description |
|---|---|---|
| `/contacts` | `ContactsListPage` | Contact directory with search and filters |
| `/contacts/create` | `ContactCreatePage` | Contact creation form |
| `/contacts/:id` | `ContactDetailPage` | Contact profile with linked deals, activities |

#### Query Parameters

```ts
searchParams: {
  company?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}
```

### Companies

| Path | Component | Description |
|---|---|---|
| `/companies` | `CompaniesListPage` | Company directory with industry filters |
| `/companies/create` | `CompanyCreatePage` | Company creation form |
| `/companies/:id` | `CompanyDetailPage` | Company profile, contacts, deals, revenue |

#### Company Detail Tabs

| Tab | Content |
|---|---|
| Overview | Company info, logo, description, website |
| Contacts | Associated contacts list |
| Deals | Associated deals with pipeline stage |
| Revenue | Revenue metrics and charts |
| Activity | Company-wide activity timeline |

### Deals

| Path | Component | Description |
|---|---|---|
| `/deals` | `DealsListPage` | Deals data table with stage filtering |
| `/deals/pipeline` | `DealsPipelinePage` | Kanban board pipeline view |
| `/deals/:id` | `DealDetailPage` | Deal detail with value, contacts, timeline |

#### Pipeline View

The pipeline view uses a drag-and-drop Kanban board:

```
Qualification → Proposal → Negotiation → Closed Won
                                            Closed Lost
```

Each column shows deal cards with:
- Deal name and value
- Assigned team members
- Expected close date
- Tags

#### Query Parameters

```ts
searchParams: {
  stage?: "qualification" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  minValue?: number;
  maxValue?: number;
  assignee?: string;
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}
```

### Tasks

| Path | Component | Description |
|---|---|---|
| `/tasks` | `TasksListPage` | Task list with filters for status, priority, assignee |
| `/tasks/create` | `TaskCreatePage` | Task creation form with entity association |
| `/tasks/:id` | `TaskDetailPage` | Task detail with linked entity, comments |

#### Query Parameters

```ts
searchParams: {
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
  assignee?: string;
  entityType?: "lead" | "contact" | "deal";
  dueBefore?: string; // ISO date
  dueAfter?: string;  // ISO date
  page?: number;
  limit?: number;
  sort?: string;
}
```

### Calendar

| Path | Component | Description |
|---|---|---|
| `/calendar` | Redirect → `/calendar/month` | Default to month view |
| `/calendar/day` | `CalendarDayPage` | Day view with hourly time slots |
| `/calendar/week` | `CalendarWeekPage` | Week view with 7-day columns |
| `/calendar/month` | `CalendarMonthPage` | Month grid with event dots |

#### Calendar Features

- Event creation via drag-to-select time range
- Event type color coding (meetings, calls, tasks, deadlines)
- Integration with tasks and deals
- Google Calendar / Outlook sync indicator

#### Query Parameters

```ts
searchParams: {
  date?: string;     // ISO date to focus on (default: today)
  view?: "day" | "week" | "month";
  type?: "meeting" | "call" | "task" | "deadline";
}
```

### Reports

| Path | Component | Description |
|---|---|---|
| `/reports` | Redirect → `/reports/revenue` | Default to revenue report |
| `/reports/revenue` | `ReportsRevenuePage` | Revenue trends, forecasts, comparisons |
| `/reports/sales` | `ReportsSalesPage` | Sales performance, rep leaderboard |
| `/reports/leads` | `ReportsLeadsPage` | Lead conversion funnels, source analysis |
| `/reports/custom` | `ReportsCustomPage` | Custom report builder with drag-and-drop |

#### Report Features

- Date range selector (predefined: last 7 days, 30 days, quarter, year; custom range)
- Export to CSV, PDF
- Schedule reports via email
- Widget-based dashboard builder (custom reports)

### Analytics

| Path | Component | Description |
|---|---|---|
| `/analytics` | Redirect → `/analytics/dashboard` | Default to analytics dashboard |
| `/analytics/dashboard` | `AnalyticsDashboardPage` | High-level metrics, trends, comparisons |
| `/analytics/pipeline` | `AnalyticsPipelinePage` | Pipeline velocity, stage conversion rates |

#### Analytics Dashboard Widgets

- Revenue trend (area chart)
- Lead source breakdown (pie chart)
- Conversion rate trend (line chart)
- Top performing deals (bar chart)
- Sales rep performance comparison
- Activity heatmap

### AI

| Path | Component | Description |
|---|---|---|
| `/ai` | Redirect → `/ai/copilot` | Default to copilot |
| `/ai/copilot` | `AICopilotPage` | AI-powered assistant for CRM operations |
| `/ai/chat` | `AIChatPage` | Full-screen AI chat interface |

#### AI Copilot Features

- Natural language query for CRM data
- AI-generated email drafts
- Lead scoring suggestions
- Deal risk analysis
- Meeting preparation summaries
- Follow-up recommendations

### Settings

| Path | Component | Description |
|---|---|---|
| `/settings` | Redirect → `/settings/profile` | Default to profile |
| `/settings/profile` | `SettingsProfilePage` | Name, avatar, timezone, preferences |
| `/settings/organization` | `SettingsOrganizationPage` | Company name, logo, industry, size |
| `/settings/team` | `SettingsTeamPage` | Invite/remove members, role assignment |
| `/settings/security` | `SettingsSecurityPage` | Password, MFA, session management |
| `/settings/notifications` | `SettingsNotificationsPage` | Email, push, in-app notification preferences |
| `/settings/integrations` | `SettingsIntegrationsPage` | Connected apps (Slack, Salesforce, HubSpot, etc.) |
| `/settings/billing` | `SettingsBillingPage` | Plan, payment method, invoices, usage |

### Admin

Admin routes are wrapped in `RoleGuard` and only accessible to `admin` and `super_admin` roles.

| Path | Component | Description |
|---|---|---|
| `/admin` | Redirect → `/admin/users` | Default to user management |
| `/admin/users` | `AdminUsersPage` | User CRUD, status management, impersonation |
| `/admin/roles` | `AdminRolesPage` | Role definitions, permission assignment |
| `/admin/teams` | `AdminTeamsPage` | Team CRUD, lead/limit assignment |
| `/admin/audit-logs` | `AdminAuditLogsPage` | Searchable audit trail of all system actions |
| `/admin/api-keys` | `AdminApiKeysPage` | API key generation, rotation, revocation |

---

## Route Guards

### AuthGuard

Wraps all protected routes. Checks authentication status from `authStore`.

**Behavior:**
- `isLoading === true` → renders `<FullScreenLoader />`
- `isAuthenticated === false` → redirects to `/login?returnUrl=<current-path>`
- `isAuthenticated === true` → renders children

### RoleGuard

Wraps admin routes. Checks user role from `authStore`.

```tsx
interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
```

**Behavior:**
- User role not in `allowedRoles` → redirects to `/dashboard`
- User role matches → renders children

### PermissionGuard

A more granular guard for specific actions within pages.

```tsx
import { useAuthStore } from "@/stores/auth-store";

function LeadActions({ lead }: { lead: Lead }) {
  const { hasPermission } = useAuthStore();

  return (
    <div className="flex gap-2">
      {hasPermission("leads.edit") && (
        <Button onClick={() => onEdit(lead)}>Edit</Button>
      )}
      {hasPermission("leads.delete") && (
        <Button variant="destructive" onClick={() => onDelete(lead)}>
          Delete
        </Button>
      )}
    </div>
  );
}
```

---

## Lazy Loading & Code Splitting

All page components are lazy-loaded using `React.lazy()` combined with `Suspense` at the route level.

### Route-Level Suspense

```tsx
import { Suspense } from "react";
import { Outlet } from "react-router-dom";

function LazyRouteWrapper() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Outlet />
    </Suspense>
  );
}
```

### Loading Skeletons

Each feature has a dedicated skeleton component for optimal loading UX:

| Feature | Skeleton Component |
|---|---|
| Lists (leads, contacts, etc.) | `TableSkeleton` — row placeholders matching DataTable layout |
| Detail pages | `DetailPageSkeleton` — header + card + tabs skeleton |
| Forms | `FormSkeleton` — input field placeholders |
| Dashboard | `DashboardSkeleton` — grid of stat cards and chart placeholders |
| Kanban | `KanbanSkeleton` — column + card placeholders |

### Bundle Splitting Strategy

| Bundle | Contents | Approximate Size |
|---|---|---|
| **Core** | React, Router, TanStack Query, Zustand, shadcn/ui base | ~120 KB gzipped |
| **CRM Module** | Leads, Contacts, Companies, Deals pages | ~80 KB gzipped |
| **Productivity** | Tasks, Calendar pages | ~40 KB gzipped |
| **Analytics** | Reports, Analytics charts (Recharts) | ~60 KB gzipped |
| **AI** | Copilot, Chat, AI utilities | ~30 KB gzipped |
| **Admin** | Admin pages, user/role management | ~25 KB gzipped |
| **Settings** | Settings pages | ~20 KB gzipped |

---

## Role-Based Route Access

### Role Definitions

```ts
type UserRole = "super_admin" | "admin" | "manager" | "member" | "viewer";
```

### Route Access Matrix

| Route | super_admin | admin | manager | member | viewer |
|---|:---:|:---:|:---:|:---:|:---:|
| `/dashboard` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/leads/*` | ✅ | ✅ | ✅ | ✅ | 👁 |
| `/contacts/*` | ✅ | ✅ | ✅ | ✅ | 👁 |
| `/companies/*` | ✅ | ✅ | ✅ | ✅ | 👁 |
| `/deals/*` | ✅ | ✅ | ✅ | ✅ | 👁 |
| `/tasks/*` | ✅ | ✅ | ✅ | ✅ | 👁 |
| `/calendar/*` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/reports/*` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `/analytics/*` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `/ai/*` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/settings/*` | ✅ | ✅ | ✅ | 🔒 | 🔒 |
| `/admin/*` | ✅ | ✅ | ❌ | ❌ | ❌ |

**Legend:**
- ✅ Full access
- 👁 Read-only access
- 🔒 Limited access (own profile only)
- ❌ No access (redirects to `/dashboard`)

### Data Scoping by Role

| Role | Data Scope |
|---|---|
| `super_admin` | All organizations, all data |
| `admin` | All data within organization |
| `manager` | Team data + reports + analytics |
| `member` | Assigned data only |
| `viewer` | Read-only view of assigned data |

---

## 404 Handling

### NotFoundPage

**File:** `src/pages/not-found/index.tsx`

```tsx
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Search className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-xl text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
      <Button onClick={() => navigate("/dashboard")}>
        Return to Dashboard
      </Button>
    </div>
  );
}
```

### Behavior

- Any unmatched route renders the 404 page
- 404 page is outside both `PublicLayout` and `AuthLayout`
- Provides a single "Return to Dashboard" action
- Logs the invalid URL to analytics for monitoring

---

## Navigation Patterns

### Programmatic Navigation

```tsx
import { useNavigate } from "react-router-dom";

function LeadActions() {
  const navigate = useNavigate();

  const handleCreateLead = async (data: LeadFormData) => {
    const lead = await createLead(data);
    navigate(`/leads/${lead.id}`);
  };

  const handleBack = () => {
    navigate(-1);
  };
}
```

### Link Navigation

```tsx
import { Link } from "react-router-dom";

<Link to="/leads" className="text-primary hover:underline">
  View all leads
</Link>

// With query params
<Link to={{ pathname: "/leads", search: "?status=qualified" }}>
  Qualified Leads
</Link>
```

### Active Link Styling

```tsx
import { NavLink } from "react-router-dom";

<NavLink
  to="/leads"
  className={({ isActive }) =>
    cn(
      "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
      isActive
        ? "bg-primary/10 text-primary font-medium"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    )
  }
>
  <Users className="h-4 w-4" />
  Leads
</NavLink>
```

### Sidebar Navigation

```tsx
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, Building2, DollarSign,
  CheckSquare, Calendar, BarChart3, Settings, Shield
} from "lucide-react";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Deals", href: "/deals", icon: DollarSign },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];
```

---

## Deep Linking & URL Parameters

### URL Search Parameters Convention

All list pages use consistent query parameters:

| Parameter | Type | Description |
|---|---|---|
| `search` | `string` | Full-text search query |
| `page` | `number` | Page number (1-indexed) |
| `limit` | `number` | Items per page |
| `sort` | `string` | Sort field (prefix `-` for desc) |
| `view` | `string` | View mode (`list`, `grid`, `kanban`) |

### Bookmarkable State

All filter states are reflected in the URL so users can bookmark and share filtered views:

```
/leads?status=qualified&source=website&assignee=user-123&sort=-createdAt&page=2
/deals?stage=negotiation&minValue=50000
/calendar?date=2026-03-15&type=meeting
/reports/revenue?from=2026-01-01&to=2026-03-31&granularity=monthly
```

### Return URL Pattern

After authentication, users are redirected back to their original destination:

```
/login?returnUrl=%2Fdeals%2Fpipeline
```

```tsx
import { useSearchParams } from "react-router-dom";

function LoginPage() {
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";

  // After successful login:
  navigate(returnUrl, { replace: true });
}
```
