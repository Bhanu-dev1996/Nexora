# NovaCRM AI — Authorization & Role-Based Access Control

> **Version:** 1.0.0
> **Last Updated:** 2026-07-20

---

## Table of Contents

1. [Overview](#overview)
2. [Role Hierarchy](#role-hierarchy)
3. [User Roles](#user-roles)
4. [Permissions](#permissions)
5. [Permission Matrix](#permission-matrix)
6. [Multi-Tenancy](#multi-tenancy)
7. [Custom Roles](#custom-roles)
8. [Middleware Implementation](#middleware-implementation)
9. [Frontend Route Guards](#frontend-route-guards)
10. [API Authorization](#api-authorization)
11. [Examples](#examples)

---

## Overview

NovaCRM AI implements a Role-Based Access Control (RBAC) system with hierarchical roles, granular permissions, and organization-scoped multi-tenancy. Every API request is authorized against the user's role, permissions, and organizational scope.

### Core Concepts

| Concept           | Description                                                       |
|-------------------|-------------------------------------------------------------------|
| **Role**          | A named set of permissions (e.g., `sales_executive`)              |
| **Permission**    | A specific allowed action (e.g., `leads.create`)                  |
| **Scope**         | The organizational boundary within which permissions apply        |
| **Hierarchy**     | Parent-child relationships between roles (inheritance)            |
| **Custom Role**   | Organization-defined roles extending base permissions             |
| **Resource**      | A CRM entity (leads, contacts, deals, etc.)                       |
| **Policy**        | A rule determining access to specific resource instances           |

### Authorization Flow

```
Request --> API Gateway --> Auth Middleware --> RBAC Middleware --> Route Handler
                |                 |                  |
                v                 v                  v
            Rate Limit     Validate JWT       Check permissions:
            CORS Check     Extract claims     1. Role has permission?
                           Set user context   2. Resource in scope?
                                              3. Resource ownership?
```

---

## Role Hierarchy

NovaCRM AI defines a strict role hierarchy where higher roles inherit all permissions of lower roles. The hierarchy from highest to lowest:

```
Super Admin
  └── Organization Admin
        ├── Sales Manager
        │     └── Sales Executive
        ├── Marketing Manager
        │     └── Marketing Executive
        ├── Support Manager
        │     └── Support Agent
        ├── HR Manager
        │     └── HR
        ├── Finance Manager
        │     └── Finance
        └── Viewer
```

### Inheritance Rules

- A role inherits **all** permissions from its children
- `Super Admin` bypasses all permission checks (full system access)
- `Organization Admin` has full access within their organization
- Custom roles can be inserted at any level in the hierarchy
- Permission inheritance can be selectively overridden in custom roles

---

## User Roles

### 1. Super Admin

**System-level administrator with unrestricted access across all organizations.**

| Property          | Value                                                        |
|-------------------|--------------------------------------------------------------|
| Scope             | Global (all organizations)                                   |
| Assignable By     | System only (initial setup)                                  |
| Can Manage Users  | All users across all organizations                           |
| Can Manage Orgs   | Create, update, delete, archive organizations                |
| Can Access Billing| Full billing and subscription management                     |
| Can Access AI     | System-level AI configuration                                |
| Can View Audit Log| Global audit log access                                      |

**Typical User:** Platform owner, DevOps engineer, system administrator.

---

### 2. Organization Admin

**Full administrative control within a single organization.**

| Property          | Value                                                        |
|-------------------|--------------------------------------------------------------|
| Scope             | Own organization only                                         |
| Assignable By     | Super Admin, Organization Admin (for their org)              |
| Can Manage Users  | All users within their organization                           |
| Can Manage Orgs   | Update own organization settings                              |
| Can Access Billing| Organization billing and subscription                         |
| Can Access AI     | AI copilot and features within organization                   |
| Can Manage Pipelines | Create, edit, delete pipelines and stages                 |
| Can Manage Workflows | Create, edit, delete automation workflows                 |
| Can Manage Settings | Full organization settings access                         |

**Typical User:** CEO, VP of Sales, operations director, IT administrator.

---

### 3. Sales Manager

**Manages the sales team and pipeline performance.**

| Property          | Value                                                        |
|-------------------|--------------------------------------------------------------|
| Scope             | Own organization, sales team members                         |
| Assignable By     | Organization Admin, Sales Manager                            |
| Can Manage Users  | Cannot manage users                                           |
| Can View Team     | Full view of all sales team activities                        |
| Can Manage Deals  | Full CRUD on all deals within team                            |
| Can Manage Leads  | Full CRUD + assign leads to team members                      |
| Can Convert Leads | Convert leads to contacts/companies/deals                     |
| Can View Reports  | Sales and revenue reports                                    |
| Can Export Data   | Export leads, contacts, deals                                 |
| Can Import Data   | Import leads from CSV                                         |

**Typical User:** Sales director, VP of Sales, regional sales manager.

---

### 4. Sales Executive

**Individual contributor managing their own leads and deals.**

| Property          | Value                                                        |
|-------------------|--------------------------------------------------------------|
| Scope             | Own records only (assigned leads, owned deals)               |
| Assignable By     | Organization Admin, Sales Manager                            |
| Can Manage Users  | Cannot manage users                                           |
| Can View Team     | Limited — own activities only                                 |
| Can Manage Deals  | CRUD on own deals, read-only on team deals                   |
| Can Manage Leads  | CRUD on assigned leads                                        |
| Can Convert Leads | Convert assigned leads                                        |
| Can View Reports  | Own performance only                                          |
| Can Export Data   | Export own leads and contacts                                 |
| Can Import Data   | Cannot import                                                 |

**Typical User:** Account executive, sales rep, business development representative.

---

### 5. Marketing Manager

**Manages marketing campaigns, lead generation, and content.**

| Property          | Value                                                        |
|-------------------|--------------------------------------------------------------|
| Scope             | Marketing modules, read access to sales data                 |
| Assignable By     | Organization Admin                                            |
| Can Manage Campaigns | Full CRUD on campaigns                                    |
| Can Manage Leads  | Create, read, import leads; cannot assign to sales            |
| Can View Deals    | Read-only view of deals (for attribution)                     |
| Can View Reports  | Marketing analytics and lead source reports                   |
| Can Manage Content| Email templates, landing pages                                |
| Can Export Data   | Export marketing data and leads                               |

**Typical User:** Marketing director, growth manager, content strategist.

---

### 6. Support Agent

**Handles customer support tickets and communications.**

| Property          | Value                                                        |
|-------------------|--------------------------------------------------------------|
| Scope             | Support module, read access to contacts                      |
| Assignable By     | Organization Admin, Support Manager                           |
| Can Manage Tickets| Full CRUD on assigned tickets                                 |
| Can View Contacts | Read-only access to contacts for context                     |
| Can View Companies| Read-only access to companies                                |
| Can View Deals    | Read-only access to deals                                    |
| Can Create Tasks  | Create tasks related to support cases                         |
| Can View Reports  | Support metrics and SLA reports                               |

**Typical User:** Customer support specialist, success manager, help desk agent.

---

### 7. HR Manager / HR

**Manages human resources functions within the organization.**

| Property          | Value                                                        |
|-------------------|--------------------------------------------------------------|
| Scope             | HR module, user management (read), no CRM data               |
| Assignable By     | Organization Admin                                            |
| Can Manage Users  | Read-only access to user directory                            |
| Can View Org      | Organization structure and team assignments                   |
| Can Manage HR     | Employee records, time-off, policies                          |
| Can View Reports  | HR analytics, headcount reports                               |
| Cannot Access     | Leads, deals, contacts, invoices (CRM data)                   |

**Typical User:** HR director, people operations manager.

---

### 8. Finance Manager / Finance

**Manages financial records, invoicing, and payments.**

| Property          | Value                                                        |
|-------------------|--------------------------------------------------------------|
| Scope             | Invoices, payments, revenue reports                           |
| Assignable By     | Organization Admin                                            |
| Can Manage Invoices | Full CRUD on invoices                                      |
| Can Manage Payments | Full CRUD on payments                                      |
| Can View Deals    | Read-only (for revenue correlation)                           |
| Can View Contacts | Read-only (for billing contacts)                              |
| Can View Reports  | Financial reports, revenue forecasting                        |
| Can Export Data   | Financial data exports                                        |
| Cannot Access     | Leads, tasks, workflows, AI copilot                           |

**Typical User:** CFO, finance director, accounts receivable manager.

---

### 9. Viewer

**Read-only access across all CRM modules within the organization.**

| Property          | Value                                                        |
|-------------------|--------------------------------------------------------------|
| Scope             | Read-only across all accessible modules                      |
| Assignable By     | Organization Admin                                            |
| Can Do            | Read-only on all records                                      |
| Cannot Do         | Create, update, delete, export, import, manage settings       |

**Typical User:** Executive observer, consultant, auditor, intern.

---

## Permissions

Permissions follow a `resource.action` naming convention. Every API endpoint maps to one or more permissions.

### Permission Format

```
<resource>.<action>
```

### Resource Types

| Resource        | Description                                     |
|-----------------|-------------------------------------------------|
| `users`         | User account management                         |
| `organizations` | Organization management                         |
| `leads`         | Lead records                                    |
| `contacts`      | Contact records                                 |
| `companies`     | Company records                                 |
| `deals`         | Deal/opportunity records                        |
| `tasks`         | Task management                                 |
| `events`        | Calendar events                                 |
| `meetings`      | Meeting records                                 |
| `invoices`      | Invoice records                                 |
| `payments`      | Payment records                                 |
| `notifications` | Notification management                         |
| `reports`       | Reporting and analytics                         |
| `analytics`     | Dashboard and analytics                         |
| `ai`            | AI copilot and features                         |
| `workflows`     | Workflow automation                             |
| `settings`      | Organization and system settings                |
| `billing`       | Billing and subscription                        |
| `audit_log`     | Security and audit logs                         |
| `teams`         | Team management                                 |
| `pipelines`     | Deal pipeline configuration                     |
| `email_templates` | Email template management                     |
| `custom_fields` | Custom field configuration                      |

### Action Types

| Action       | Description                                      |
|--------------|--------------------------------------------------|
| `create`     | Create new records                               |
| `read`       | View records                                     |
| `update`     | Modify existing records                          |
| `delete`     | Remove records                                   |
| `assign`     | Assign records to users                          |
| `export`     | Export data                                      |
| `import`     | Import data                                      |
| `manage`     | Full administrative access                       |
| `configure`  | Modify configuration/settings                    |
| `execute`    | Trigger actions (workflows, AI)                  |
| `share`      | Share records with others                        |
| `merge`      | Merge duplicate records                          |

### Complete Permission List

```
users.create              users.read                users.update
users.delete              users.manage              users.invite
users.assign_role

organizations.read        organizations.update      organizations.manage
organizations.delete

leads.create              leads.read                leads.update
leads.delete              leads.assign              leads.convert
leads.import              leads.export              leads.merge

contacts.create           contacts.read             contacts.update
contacts.delete           contacts.merge            contacts.export
contacts.share

companies.create          companies.read            companies.update
companies.delete          companies.export

deals.create              deals.read                deals.update
deals.delete              deals.assign              deals.move_stage
deals.export

tasks.create              tasks.read                tasks.update
tasks.delete              tasks.assign

events.create             events.read               events.update
events.delete             events.sync

meetings.create           meetings.read             meetings.update
meetings.delete

invoices.create           invoices.read             invoices.update
invoices.delete           invoices.send             invoices.void

payments.create           payments.read             payments.update
payments.delete           payments.refund

notifications.read        notifications.manage

reports.read              reports.export
analytics.read            analytics.configure

ai.copilot                ai.score_lead             ai.generate_email
ai.summarize

workflows.create          workflows.read            workflows.update
workflows.delete          workflows.execute

settings.read             settings.manage           settings.billing

billing.read              billing.manage

audit_log.read

teams.create              teams.read                teams.update
teams.delete              teams.manage

pipelines.create          pipelines.read            pipelines.update
pipelines.delete          pipelines.manage

email_templates.create    email_templates.read
email_templates.update    email_templates.delete

custom_fields.create      custom_fields.read
custom_fields.update      custom_fields.delete
```

---

## Permission Matrix

The following matrix shows the default permissions for each built-in role. `X` = granted, `-` = denied, `R` = read-only.

### Leads

| Permission         | Super Admin | Org Admin | Sales Mgr | Sales Exec | Marketing Mgr | Support | HR | Finance | Viewer |
|--------------------|-------------|-----------|-----------|------------|---------------|---------|----|---------|--------|
| leads.create       | X           | X         | X         | X          | X             | -       | -  | -       | -      |
| leads.read         | X           | X         | X         | X*         | X             | R       | -  | -       | R      |
| leads.update       | X           | X         | X         | X*         | -             | -       | -  | -       | -      |
| leads.delete       | X           | X         | X         | X*         | -             | -       | -  | -       | -      |
| leads.assign       | X           | X         | X         | -          | -             | -       | -  | -       | -      |
| leads.convert      | X           | X         | X         | X          | -             | -       | -  | -       | -      |
| leads.import       | X           | X         | X         | -          | X             | -       | -  | -       | -      |
| leads.export       | X           | X         | X         | X          | X             | -       | -  | -       | -      |
| leads.merge        | X           | X         | X         | X          | -             | -       | -  | -       | -      |

`X*` = Own records only (or records assigned to the user)

### Contacts

| Permission         | Super Admin | Org Admin | Sales Mgr | Sales Exec | Marketing Mgr | Support | HR | Finance | Viewer |
|--------------------|-------------|-----------|-----------|------------|---------------|---------|----|---------|--------|
| contacts.create    | X           | X         | X         | X          | X             | -       | -  | -       | -      |
| contacts.read      | X           | X         | X         | X*         | X             | R       | R  | R       | R      |
| contacts.update    | X           | X         | X         | X*         | -             | -       | -  | -       | -      |
| contacts.delete    | X           | X         | X         | -          | -             | -       | -  | -       | -      |
| contacts.merge     | X           | X         | X         | X          | -             | -       | -  | -       | -      |
| contacts.export    | X           | X         | X         | X          | X             | -       | -  | -       | -      |
| contacts.share     | X           | X         | X         | X          | X             | X       | -  | -       | -      |

### Companies

| Permission         | Super Admin | Org Admin | Sales Mgr | Sales Exec | Marketing Mgr | Support | HR | Finance | Viewer |
|--------------------|-------------|-----------|-----------|------------|---------------|---------|----|---------|--------|
| companies.create   | X           | X         | X         | X          | X             | -       | -  | -       | -      |
| companies.read     | X           | X         | X         | X          | X             | R       | R  | R       | R      |
| companies.update   | X           | X         | X         | X*         | -             | -       | -  | -       | -      |
| companies.delete   | X           | X         | X         | -          | -             | -       | -  | -       | -      |
| companies.export   | X           | X         | X         | X          | X             | -       | -  | -       | -      |

### Deals

| Permission         | Super Admin | Org Admin | Sales Mgr | Sales Exec | Marketing Mgr | Support | HR | Finance | Viewer |
|--------------------|-------------|-----------|-----------|------------|---------------|---------|----|---------|--------|
| deals.create       | X           | X         | X         | X          | -             | -       | -  | -       | -      |
| deals.read         | X           | X         | X         | X*         | R             | R       | -  | R       | R      |
| deals.update       | X           | X         | X         | X*         | -             | -       | -  | -       | -      |
| deals.delete       | X           | X         | X         | X*         | -             | -       | -  | -       | -      |
| deals.assign       | X           | X         | X         | -          | -             | -       | -  | -       | -      |
| deals.move_stage   | X           | X         | X         | X*         | -             | -       | -  | -       | -      |
| deals.export       | X           | X         | X         | X          | -             | -       | -  | X       | -      |

### Tasks

| Permission         | Super Admin | Org Admin | Sales Mgr | Sales Exec | Marketing Mgr | Support | HR | Finance | Viewer |
|--------------------|-------------|-----------|-----------|------------|---------------|---------|----|---------|--------|
| tasks.create       | X           | X         | X         | X          | X             | X       | X  | -       | -      |
| tasks.read         | X           | X         | X         | X*         | X*            | X*      | X* | -       | R      |
| tasks.update       | X           | X         | X         | X*         | X*            | X*      | X* | -       | -      |
| tasks.delete       | X           | X         | X         | X*         | X*            | X*      | -  | -       | -      |
| tasks.assign       | X           | X         | X         | -          | -             | -       | -  | -       | -      |

### Invoices & Payments

| Permission         | Super Admin | Org Admin | Sales Mgr | Sales Exec | Marketing Mgr | Support | HR | Finance | Viewer |
|--------------------|-------------|-----------|-----------|------------|---------------|---------|----|---------|--------|
| invoices.create    | X           | X         | -         | -          | -             | -       | -  | X       | -      |
| invoices.read      | X           | X         | R         | R          | -             | -       | -  | X       | R      |
| invoices.update    | X           | X         | -         | -          | -             | -       | -  | X       | -      |
| invoices.send      | X           | X         | -         | -          | -             | -       | -  | X       | -      |
| invoices.void      | X           | X         | -         | -          | -             | -       | -  | X       | -      |
| payments.create    | X           | X         | -         | -          | -             | -       | -  | X       | -      |
| payments.read      | X           | X         | R         | -          | -             | -       | -  | X       | R      |
| payments.refund    | X           | X         | -         | -          | -             | -       | -  | X       | -      |

### Settings, Reports & AI

| Permission         | Super Admin | Org Admin | Sales Mgr | Sales Exec | Marketing Mgr | Support | HR | Finance | Viewer |
|--------------------|-------------|-----------|-----------|------------|---------------|---------|----|---------|--------|
| settings.read      | X           | X         | X         | R          | R             | R       | R  | R       | R      |
| settings.manage    | X           | X         | -         | -          | -             | -       | -  | -       | -      |
| reports.read       | X           | X         | X         | R*         | X             | R       | R  | X       | R      |
| reports.export     | X           | X         | X         | -          | X             | -       | -  | X       | -      |
| analytics.read     | X           | X         | X         | R*         | X             | R       | -  | X       | R      |
| ai.copilot         | X           | X         | X         | X          | X             | -       | -  | -       | -      |
| workflows.create   | X           | X         | X         | -          | -             | -       | -  | -       | -      |
| workflows.execute  | X           | X         | X         | X          | X             | X       | -  | -       | -      |
| billing.manage     | X           | X         | -         | -          | -             | -       | -  | -       | -      |

`R*` = Own data or team data only

---

## Multi-Tenancy

NovaCRM AI is fully multi-tenant. All data is scoped to the organization.

### Organization Scoping

Every record in the system is tagged with an `organizationId`. The authorization middleware ensures:

1. Users can only access data within their own organization
2. Organization IDs are injected into queries at the middleware level
3. Users cannot craft requests to access cross-tenant data
4. The `organizationId` in the JWT token is the source of truth

### Data Isolation

```
+-----------------------------------------------------+
|                  NovaCRM Platform                     |
|                                                       |
|  +------------------+   +------------------+          |
|  | Organization A   |   | Organization B   |          |
|  |                  |   |                  |          |
|  | - Users          |   | - Users          |          |
|  | - Leads          |   | - Leads          |          |
|  | - Contacts       |   | - Contacts       |          |
|  | - Deals          |   | - Deals          |          |
|  | - Invoices       |   | - Invoices       |          |
|  | - Settings       |   | - Settings       |          |
|  +------------------+   +------------------+          |
|                                                       |
|  Shared: AI models, system config, audit logs         |
+-----------------------------------------------------+
```

### Cross-Organization Access

Only `Super Admin` users can access data across organizations. This is enforced by:

1. The `role` claim in the JWT token
2. Middleware that checks for `super_admin` role before allowing cross-org queries
3. Audit logging for all cross-org access events

### Tenant Isolation Middleware

```typescript
// Conceptual middleware (TypeScript)
function tenantIsolation(req, res, next) {
  const orgId = req.user.org_id;
  
  // Inject organization scope into all database queries
  req.dbScope = { organizationId: orgId };
  
  // Block cross-org access attempts
  if (req.params.orgId && req.params.orgId !== orgId) {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Cannot access resources in another organization'
        }
      });
    }
  }
  
  next();
}
```

---

## Custom Roles

Organizations can create custom roles that extend the built-in role set. Custom roles can combine permissions from multiple base roles or define entirely new permission sets.

### Creating a Custom Role

```http
POST /api/v1/settings/roles
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Sales Development Rep",
  "description": "SDR role focused on lead qualification and initial outreach",
  "basedOn": "sales_executive",
  "permissions": {
    "add": [
      "leads.import",
      "leads.export",
      "reports.read"
    ],
    "remove": [
      "deals.create",
      "deals.update",
      "leads.convert"
    ]
  },
  "restrictions": {
    "maxTeamSize": null,
    "canExport": true,
    "canImport": true,
    "dataVisibility": "assigned_only"
  }
}
```

### Custom Role Response

```json
{
  "success": true,
  "data": {
    "id": "role_custom_sdr",
    "name": "Sales Development Rep",
    "description": "SDR role focused on lead qualification and initial outreach",
    "isCustom": true,
    "basedOn": "sales_executive",
    "permissions": [
      "leads.create",
      "leads.read",
      "leads.update",
      "leads.delete",
      "leads.assign",
      "leads.import",
      "leads.export",
      "leads.merge",
      "contacts.create",
      "contacts.read",
      "contacts.update",
      "contacts.merge",
      "contacts.export",
      "tasks.create",
      "tasks.read",
      "tasks.update",
      "events.create",
      "events.read",
      "meetings.create",
      "meetings.read",
      "ai.copilot",
      "reports.read"
    ],
    "effectiveFrom": "sales_executive",
    "createdAt": "2026-07-20T10:00:00Z"
  }
}
```

### Custom Role Constraints

| Constraint           | Description                                          |
|----------------------|------------------------------------------------------|
| Cannot exceed base   | Custom roles cannot grant permissions beyond Org Admin |
| Cannot remove core   | `settings.read`, `notifications.read` always granted |
| Unique name          | Role names must be unique within the organization    |
| Max custom roles     | 20 custom roles per organization                     |
| Audit logged         | All custom role changes are audit-logged              |

---

## Middleware Implementation

### Server-Side Authorization Middleware

Every API route passes through a chain of authorization middleware:

```
1. Authentication Middleware    -> Validates JWT, attaches user to request
2. Tenant Isolation Middleware  -> Enforces organization scoping
3. Permission Middleware        -> Checks route-level permissions
4. Resource Middleware          -> Checks instance-level access (optional)
```

### Permission Middleware (TypeScript)

```typescript
// Conceptual implementation
function requirePermission(...permissions: string[]) {
  return (req, res, next) => {
    const userPermissions = req.user.permissions;
    
    // Super Admin bypasses all permission checks
    if (req.user.role === 'super_admin') {
      return next();
    }
    
    // Check if user has ALL required permissions
    const hasAll = permissions.every(p => userPermissions.includes(p));
    
    if (!hasAll) {
      // Audit the denied access attempt
      auditLog({
        event: 'permission_denied',
        userId: req.user.sub,
        resource: req.route.path,
        requiredPermissions: permissions,
        userPermissions: userPermissions,
        timestamp: new Date().toISOString()
      });
      
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions for this action',
          details: {
            required: permissions,
            missing: permissions.filter(p => !userPermissions.includes(p))
          }
        }
      });
    }
    
    next();
  };
}
```

### Resource Ownership Middleware

```typescript
// Check if user owns or has access to a specific resource
function requireOwnership(resourceType: string) {
  return async (req, res, next) => {
    const resourceId = req.params.id;
    const userId = req.user.sub;
    const orgId = req.user.org_id;
    const role = req.user.role;
    
    // Managers and admins can access all resources in their org
    if (['super_admin', 'organization_admin', 'sales_manager'].includes(role)) {
      return next();
    }
    
    // Check ownership
    const resource = await db.findOne(resourceType, {
      id: resourceId,
      organizationId: orgId
    });
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `${resourceType} not found`
        }
      });
    }
    
    if (resource.assignedTo !== userId && resource.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this resource'
        }
      });
    }
    
    req.resource = resource;
    next();
  };
}
```

### Route Permission Mapping

```typescript
// Express route definitions with permissions
const leadRoutes = Router();

leadRoutes.get('/leads',
  requirePermission('leads.read'),
  leadController.list
);

leadRoutes.post('/leads',
  requirePermission('leads.create'),
  leadController.create
);

leadRoutes.get('/leads/:id',
  requirePermission('leads.read'),
  requireOwnership('lead'),
  leadController.getById
);

leadRoutes.put('/leads/:id',
  requirePermission('leads.update'),
  requireOwnership('lead'),
  leadController.update
);

leadRoutes.delete('/leads/:id',
  requirePermission('leads.delete'),
  requireOwnership('lead'),
  leadController.delete
);

leadRoutes.post('/leads/:id/assign',
  requirePermission('leads.assign'),
  leadController.assign
);

leadRoutes.post('/leads/:id/convert',
  requirePermission('leads.convert'),
  requireOwnership('lead'),
  leadController.convert
);

leadRoutes.post('/leads/import',
  requirePermission('leads.import'),
  leadController.import
);

leadRoutes.get('/leads/export',
  requirePermission('leads.export'),
  leadController.export
);
```

---

## Frontend Route Guards

The React frontend implements route guards using a context-based authorization system.

### Route Configuration

```typescript
// Conceptual route configuration
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    permissions: [],  // Any authenticated user
    roles: []
  },
  {
    path: '/leads',
    component: Leads,
    permissions: ['leads.read'],
    roles: []
  },
  {
    path: '/leads/:id',
    component: LeadDetail,
    permissions: ['leads.read'],
    roles: []
  },
  {
    path: '/deals',
    component: Deals,
    permissions: ['deals.read'],
    roles: []
  },
  {
    path: '/pipeline',
    component: Pipeline,
    permissions: ['deals.read', 'deals.move_stage'],
    roles: []
  },
  {
    path: '/contacts',
    component: Contacts,
    permissions: ['contacts.read'],
    roles: []
  },
  {
    path: '/invoices',
    component: Invoices,
    permissions: ['invoices.read'],
    roles: []
  },
  {
    path: '/reports',
    component: Reports,
    permissions: ['reports.read'],
    roles: []
  },
  {
    path: '/ai/copilot',
    component: AICopilot,
    permissions: ['ai.copilot'],
    roles: []
  },
  {
    path: '/settings',
    component: Settings,
    permissions: ['settings.manage'],
    roles: ['super_admin', 'organization_admin']
  },
  {
    path: '/settings/users',
    component: UserManagement,
    permissions: ['users.manage'],
    roles: ['super_admin', 'organization_admin']
  },
  {
    path: '/admin',
    component: AdminPanel,
    permissions: [],
    roles: ['super_admin']
  }
];
```

### Route Guard Component

```typescript
// Conceptual ProtectedRoute component
function ProtectedRoute({ children, permissions, roles }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role-based access
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Check permission-based access
  if (permissions.length > 0) {
    const hasPermission = permissions.every(p => 
      user.permissions.includes(p)
    );
    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  return children;
}
```

### UI Element Visibility

Beyond route guards, UI elements are conditionally rendered based on permissions:

```typescript
// Conditional button rendering
function LeadActions({ lead }) {
  const { user } = useAuth();
  
  return (
    <div className="flex gap-2">
      <Button
        onClick={() => editLead(lead)}
        visible={hasPermission(user, 'leads.update')}
      >
        Edit
      </Button>
      
      <Button
        onClick={() => assignLead(lead)}
        visible={hasPermission(user, 'leads.assign')}
      >
        Assign
      </Button>
      
      <Button
        onClick={() => convertLead(lead)}
        visible={hasPermission(user, 'leads.convert')}
      >
        Convert
      </Button>
      
      <Button
        variant="destructive"
        onClick={() => deleteLead(lead)}
        visible={hasPermission(user, 'leads.delete')}
      >
        Delete
      </Button>
    </div>
  );
}
```

---

## API Authorization

### Authorization Header

All authenticated requests must include the Bearer token:

```
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

### Permission Check Flow

```
1. Extract JWT from Authorization header
2. Validate signature (RS256)
3. Check expiration (exp claim)
4. Check issuer (iss claim)
5. Check audience (aud claim)
6. Extract user claims (sub, org_id, role, permissions)
7. Verify organization exists and is active
8. Check account status (not locked, not disabled)
9. Match route permission requirements
10. Check resource ownership (if applicable)
11. Allow or deny request
```

### Common Authorization Responses

**Missing Token:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing authentication token"
  }
}
```

**Expired Token:**

```json
{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Access token has expired. Please refresh",
    "details": {
      "expiredAt": "2026-07-20T10:45:00Z"
    }
  }
}
```

**Insufficient Permissions:**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions for this action",
    "details": {
      "required": ["leads.delete"],
      "missing": ["leads.delete"],
      "userRole": "sales_executive"
    }
  }
}
```

**Cross-Tenant Access Denied:**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Cannot access resources outside your organization"
  }
}
```

---

## Examples

### Example 1: Sales Executive Creating a Lead

```http
POST /api/v1/leads
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...

{
  "firstName": "John",
  "lastName": "Connor",
  "email": "john@skynet.com",
  "source": "website"
}
```

**Authorization Check:**
1. Token valid? Yes
2. `org_id` matches organization? Yes
3. `leads.create` in permissions? Yes
4. **Result: 201 Created**

### Example 2: Sales Executive Deleting Another User's Lead

```http
DELETE /api/v1/leads/ld_a1b2c3d4
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

**Authorization Check:**
1. Token valid? Yes
2. `leads.delete` in permissions? Yes (but ownership check needed)
3. User owns lead `ld_a1b2c3d4`? No (assigned to another user)
4. **Result: 403 Forbidden**

### Example 3: Viewer Trying to Create a Deal

```http
POST /api/v1/deals
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...

{
  "name": "New Deal",
  "amount": 50000
}
```

**Authorization Check:**
1. Token valid? Yes
2. `deals.create` in permissions? No (Viewer role has no create permissions)
3. **Result: 403 Forbidden**

### Example 4: Marketing Manager Importing Leads

```http
POST /api/v1/leads/import
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: multipart/form-data

[file: leads.csv]
[defaultStatus: new]
```

**Authorization Check:**
1. Token valid? Yes
2. `leads.import` in permissions? Yes
3. **Result: 202 Accepted** (import queued for processing)

### Example 5: Support Agent Accessing Deal Details

```http
GET /api/v1/deals/dl_u4v5w6x
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

**Authorization Check:**
1. Token valid? Yes
2. `deals.read` in permissions? Yes (read-only for Support)
3. Organization scope matches? Yes
4. **Result: 200 OK** (returns deal data; update/delete buttons hidden on frontend)

---

## Changelog

| Version | Date       | Changes                                              |
|---------|------------|------------------------------------------------------|
| 1.0.0   | 2026-07-20 | Initial release — 9 base roles, 120+ permissions     |
