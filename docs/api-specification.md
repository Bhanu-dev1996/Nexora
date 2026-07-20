# NovaCRM AI — REST API Specification

> **Version:** 1.0.0  
> **Base URL:** `https://api.novacrm.io/api/v1`  
> **Content-Type:** `application/json`  
> **Last Updated:** 2026-07-20

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Versioning](#versioning)
4. [Pagination](#pagination)
5. [Filtering & Sorting](#filtering--sorting)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [API Modules](#api-modules)
   - [Auth](#1-auth)
   - [Users](#2-users)
   - [Organizations](#3-organizations)
   - [Leads](#4-leads)
   - [Contacts](#5-contacts)
   - [Companies](#6-companies)
   - [Deals](#7-deals)
   - [Tasks](#8-tasks)
   - [Calendar & Events](#9-calendar--events)
   - [Meetings](#10-meetings)
   - [Invoices](#11-invoices)
   - [Payments](#12-payments)
   - [Notifications](#13-notifications)
   - [Reports](#14-reports)
   - [Analytics](#15-analytics)
   - [AI](#16-ai)
   - [Workflows](#17-workflows)
   - [Settings](#18-settings)
9. [Status Codes](#status-codes)

---

## Overview

The NovaCRM AI REST API provides programmatic access to all CRM functionality including lead management, deal pipelines, contact records, invoicing, AI-powered copilot features, analytics, and workflow automation.

All requests must be made over HTTPS. HTTP requests will be rejected with a `301 Moved Permanently` redirect.

### Request Format

All request bodies must be sent as JSON with the `Content-Type: application/json` header.

### Response Format

All responses are returned as JSON. Successful responses wrap the result in a `data` envelope:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

Single-resource responses omit the `meta` field:

```json
{
  "success": true,
  "data": {
    "id": "usr_3xk9f2m",
    "email": "jane@acme.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "role": "sales_executive",
    "createdAt": "2026-07-20T10:30:00Z"
  }
}
```

---

## Authentication

All API requests (except public auth endpoints) require a valid Bearer token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

Tokens are obtained via the [Auth](#1-auth) endpoints. Tokens expire after **15 minutes** and must be refreshed using the `/auth/refresh-token` endpoint.

Unauthenticated requests receive:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid authentication token"
  }
}
```

---

## Versioning

The API is versioned via the URL path: `/api/v1/`. Breaking changes will only be introduced in new major versions. Deprecation notices will be sent via email and included in response headers at least 6 months before removal.

```
X-API-Version: 1.0.0
X-API-Deprecated: false
```

---

## Pagination

All list endpoints support cursor-based and offset-based pagination via query parameters:

| Parameter | Type    | Default | Description                             |
|-----------|---------|---------|-----------------------------------------|
| `page`    | integer | `1`     | Page number (1-indexed)                 |
| `limit`   | integer | `20`    | Items per page (max: `100`)             |
| `cursor`  | string  | —       | Cursor for cursor-based pagination      |

### Paginated Response Envelope

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 347,
    "totalPages": 18,
    "nextCursor": "eyJpZCI6ImxkX3oxIn0=",
    "prevCursor": null
  }
}
```

---

## Filtering & Sorting

### Filtering

Most list endpoints support filtering via query parameters using a field-value pair syntax:

```
GET /api/v1/leads?status=qualified&source=website&assignedTo=usr_3xk9f2m
```

Multiple values for the same field are comma-separated:

```
GET /api/v1/leads?status=new,qualified
```

Date range filtering uses the `_from` and `_to` suffixes:

```
GET /api/v1/deals?createdAt_from=2026-01-01&createdAt_to=2026-06-30
```

### Searching

Full-text search is available via the `q` parameter:

```
GET /api/v1/contacts?q=john+smith
```

### Sorting

Sort results via the `sortBy` and `sortOrder` parameters:

```
GET /api/v1/deals?sortBy=amount&sortOrder=desc
```

Allowed values for `sortOrder`: `asc`, `desc`.

---

## Error Handling

All error responses follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request body contains invalid fields",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      },
      {
        "field": "password",
        "message": "Must be at least 8 characters"
      }
    ]
  },
  "requestId": "req_9f8e7d6c5b"
}
```

### Error Codes

| HTTP Status | Error Code              | Description                                |
|-------------|-------------------------|--------------------------------------------|
| `400`       | `VALIDATION_ERROR`      | Request body or query params are invalid   |
| `400`       | `BAD_REQUEST`           | Malformed request                          |
| `401`       | `UNAUTHORIZED`          | Missing or invalid auth token              |
| `401`       | `TOKEN_EXPIRED`         | Access token has expired                   |
| `403`       | `FORBIDDEN`             | Insufficient permissions for this action   |
| `404`       | `NOT_FOUND`             | Requested resource does not exist          |
| `409`       | `CONFLICT`              | Resource already exists or version conflict|
| `422`       | `UNPROCESSABLE_ENTITY`  | Semantically invalid request               |
| `429`       | `RATE_LIMIT_EXCEEDED`   | Too many requests — retry after delay      |
| `500`       | `INTERNAL_SERVER_ERROR` | Unexpected server error                    |
| `503`       | `SERVICE_UNAVAILABLE`   | Service temporarily unavailable            |

---

## Rate Limiting

API requests are rate-limited per authenticated user:

| Tier            | Requests per minute | Requests per day |
|-----------------|---------------------|------------------|
| Free            | 60                  | 1,000            |
| Professional    | 300                 | 50,000           |
| Enterprise      | 1,000               | 500,000          |

Rate limit status is communicated via response headers:

```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 287
X-RateLimit-Reset: 1721472000
X-RateLimit-Policy: 300;w=60
```

When rate limited, the response includes:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Retry after 23 seconds",
    "retryAfter": 23
  }
}
```

---

## API Modules

---

### 1. Auth

Authentication, registration, and session management endpoints.

---

#### `POST /auth/register`

Register a new user account.

**Request Body:**

```json
{
  "email": "jane@acme.com",
  "password": "SecureP@ss123",
  "firstName": "Jane",
  "lastName": "Doe",
  "organizationName": "Acme Corp",
  "role": "organization_admin"
}
```

**Response — `201 Created`:**

```json
{
  "success": true,
  "data": {
    "id": "usr_3xk9f2m",
    "email": "jane@acme.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "role": "organization_admin",
    "organizationId": "org_m4k2n8p",
    "emailVerified": false,
    "createdAt": "2026-07-20T10:30:00Z"
  },
  "meta": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "rt_8f7e6d5c4b3a2...",
    "accessTokenExpiresAt": "2026-07-20T10:45:00Z"
  }
}
```

**Validation Rules:**

- `email`: Valid email, unique within system
- `password`: Min 8 chars, must include uppercase, lowercase, number, and special character
- `firstName`: 1–100 characters, required
- `lastName`: 1–100 characters, required
- `organizationName`: 2–200 characters, required
- `role`: One of `organization_admin`, `sales_manager`, `sales_executive`

**Side Effects:** A verification email is sent to the provided address.

---

#### `POST /auth/login`

Authenticate with email and password.

**Request Body:**

```json
{
  "email": "jane@acme.com",
  "password": "SecureP@ss123",
  "deviceInfo": {
    "deviceName": "MacBook Pro",
    "os": "macOS 14.5",
    "browser": "Chrome 126"
  }
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_3xk9f2m",
      "email": "jane@acme.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "organization_admin",
      "avatar": "https://cdn.novacrm.io/avatars/usr_3xk9f2m.jpg",
      "organizationId": "org_m4k2n8p",
      "permissions": [
        "leads.create",
        "leads.read",
        "leads.update",
        "leads.delete",
        "deals.create",
        "deals.read",
        "deals.update",
        "contacts.create",
        "contacts.read",
        "contacts.update",
        "settings.manage"
      ]
    }
  },
  "meta": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "rt_8f7e6d5c4b3a2...",
    "accessTokenExpiresAt": "2026-07-20T10:45:00Z",
    "refreshTokenExpiresAt": "2026-07-27T10:30:00Z",
    "sessionId": "ses_p2o9i8u7",
    "twoFactorRequired": false
  }
}
```

**If 2FA is enabled:**

```json
{
  "success": true,
  "data": null,
  "meta": {
    "twoFactorRequired": true,
    "tempToken": "tmp_x9y8z7w6...",
    "tempTokenExpiresAt": "2026-07-20T10:31:00Z"
  }
}
```

**Error — `401 Unauthorized`:**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": [],
    "remainingAttempts": 4
  }
}
```

---

#### `POST /auth/logout`

Invalidate the current session and refresh token.

**Request Body:**

```json
{
  "refreshToken": "rt_8f7e6d5c4b3a2...",
  "allDevices": false
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "Successfully logged out"
  }
}
```

When `allDevices` is `true`, all active sessions for the user are terminated.

---

#### `POST /auth/forgot-password`

Request a password reset email.

**Request Body:**

```json
{
  "email": "jane@acme.com"
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "If an account exists with this email, a reset link has been sent"
  }
}
```

> **Note:** The response is identical for existing and non-existing emails to prevent email enumeration attacks.

---

#### `POST /auth/reset-password`

Reset password using the token from the email.

**Request Body:**

```json
{
  "token": "rst_a1b2c3d4e5f6...",
  "newPassword": "NewSecureP@ss456"
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "Password has been reset successfully. All other sessions have been terminated"
  }
}
```

**Error — `400 Bad Request`:**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Reset token is invalid or has expired"
  }
}
```

---

#### `POST /auth/verify-email`

Verify email address using the token sent during registration.

**Request Body:**

```json
{
  "token": "ev_x1y2z3w4v5..."
}
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "Email verified successfully"
  }
}
```

---

#### `POST /auth/refresh-token`

Obtain a new access token using a valid refresh token.

**Request Body:**

```json
{
  "refreshToken": "rt_8f7e6d5c4b3a2..."
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": null,
  "meta": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "rt_new7g6f5e4d3...",
    "accessTokenExpiresAt": "2026-07-20T10:45:00Z",
    "refreshTokenExpiresAt": "2026-07-27T10:30:00Z"
  }
}
```

**Token Rotation:** Each refresh token is single-use. The old token is invalidated and a new one is issued with every refresh request.

---

### 2. Users

Manage user accounts within an organization.

---

#### `GET /users`

List all users in the current organization.

**Query Parameters:**

| Parameter   | Type   | Description                         |
|-------------|--------|-------------------------------------|
| `page`      | int    | Page number (default: `1`)          |
| `limit`     | int    | Items per page (default: `20`)      |
| `role`      | string | Filter by role                       |
| `status`    | string | Filter by status (`active`,`invited`,`disabled`) |
| `search`    | string | Search by name or email              |
| `sortBy`    | string | Sort field (default: `createdAt`)    |
| `sortOrder` | string | `asc` or `desc` (default: `desc`)   |

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "usr_3xk9f2m",
      "email": "jane@acme.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "organization_admin",
      "status": "active",
      "avatar": "https://cdn.novacrm.io/avatars/usr_3xk9f2m.jpg",
      "lastLoginAt": "2026-07-20T10:30:00Z",
      "createdAt": "2026-07-01T08:00:00Z"
    },
    {
      "id": "usr_k7j8h9g",
      "email": "bob@acme.com",
      "firstName": "Bob",
      "lastName": "Smith",
      "role": "sales_executive",
      "status": "active",
      "avatar": null,
      "lastLoginAt": "2026-07-19T14:22:00Z",
      "createdAt": "2026-07-05T09:15:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "totalPages": 1
  }
}
```

---

#### `POST /users`

Invite a new user to the organization.

**Request Body:**

```json
{
  "email": "sarah@acme.com",
  "firstName": "Sarah",
  "lastName": "Connor",
  "role": "sales_executive",
  "teams": ["team_alpha", "team_beta"]
}
```

**Response — `201 Created`:**

```json
{
  "success": true,
  "data": {
    "id": "usr_n4m5l6k",
    "email": "sarah@acme.com",
    "firstName": "Sarah",
    "lastName": "Connor",
    "role": "sales_executive",
    "status": "invited",
    "teams": ["team_alpha", "team_beta"],
    "createdAt": "2026-07-20T11:00:00Z"
  }
}
```

---

#### `GET /users/:id`

Get a single user by ID.

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "usr_3xk9f2m",
    "email": "jane@acme.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "role": "organization_admin",
    "status": "active",
    "avatar": "https://cdn.novacrm.io/avatars/usr_3xk9f2m.jpg",
    "phone": "+1-555-0142",
    "timezone": "America/New_York",
    "locale": "en-US",
    "teams": ["team_alpha"],
    "preferences": {
      "theme": "dark",
      "notifications": {
        "email": true,
        "push": true,
        "sms": false
      }
    },
    "lastLoginAt": "2026-07-20T10:30:00Z",
    "createdAt": "2026-07-01T08:00:00Z",
    "updatedAt": "2026-07-15T16:45:00Z"
  }
}
```

---

#### `PUT /users/:id`

Update a user's profile or settings.

**Request Body:**

```json
{
  "firstName": "Jane",
  "lastName": "Doe-Smith",
  "phone": "+1-555-0199",
  "timezone": "America/New_York",
  "role": "sales_manager",
  "teams": ["team_alpha", "team_gamma"]
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "usr_3xk9f2m",
    "firstName": "Jane",
    "lastName": "Doe-Smith",
    "role": "sales_manager",
    "updatedAt": "2026-07-20T11:15:00Z"
  }
}
```

---

#### `DELETE /users/:id`

Remove a user from the organization. The user's data is anonymized rather than deleted.

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "User removed from organization"
  }
}
```

---

### 3. Organizations

Manage organization accounts and multi-tenant settings.

---

#### `GET /organizations`

List all organizations (Super Admin only).

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "org_m4k2n8p",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "plan": "enterprise",
      "status": "active",
      "userCount": 47,
      "logo": "https://cdn.novacrm.io/logos/org_m4k2n8p.png",
      "createdAt": "2026-01-15T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

#### `POST /organizations`

Create a new organization (Super Admin only).

**Request Body:**

```json
{
  "name": "Globex Industries",
  "slug": "globex-industries",
  "plan": "professional",
  "billingEmail": "billing@globex.com",
  "settings": {
    "timezone": "America/Chicago",
    "locale": "en-US",
    "currency": "USD",
    "fiscalYearStart": "january"
  }
}
```

**Response — `201 Created`:**

```json
{
  "success": true,
  "data": {
    "id": "org_r3q4s5t",
    "name": "Globex Industries",
    "slug": "globex-industries",
    "plan": "professional",
    "status": "active",
    "createdAt": "2026-07-20T12:00:00Z"
  }
}
```

---

#### `GET /organizations/:id`

Get a single organization by ID.

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "org_m4k2n8p",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "plan": "enterprise",
    "status": "active",
    "logo": "https://cdn.novacrm.io/logos/org_m4k2n8p.png",
    "billingEmail": "billing@acme.com",
    "settings": {
      "timezone": "America/New_York",
      "locale": "en-US",
      "currency": "USD",
      "fiscalYearStart": "january",
      "dateFormat": "MM/DD/YYYY"
    },
    "userCount": 47,
    "storageUsedBytes": 1073741824,
    "storageLimitBytes": 10737418240,
    "createdAt": "2026-01-15T00:00:00Z",
    "updatedAt": "2026-07-10T08:00:00Z"
  }
}
```

---

#### `PUT /organizations/:id`

Update organization settings.

**Request Body:**

```json
{
  "name": "Acme Corporation",
  "logo": "https://cdn.novacrm.io/logos/acme-new.png",
  "settings": {
    "timezone": "America/New_York",
    "currency": "EUR"
  }
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "org_m4k2n8p",
    "name": "Acme Corporation",
    "updatedAt": "2026-07-20T12:30:00Z"
  }
}
```

---

#### `DELETE /organizations/:id`

Archive an organization (Super Admin only). All data is soft-deleted and recoverable for 90 days.

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "Organization archived. Data recoverable for 90 days",
    "recoverableUntil": "2026-10-18T12:30:00Z"
  }
}
```

---

### 4. Leads

Full lead lifecycle management with assignment, conversion, and import/export.

---

#### `GET /leads`

List all leads.

**Query Parameters:**

| Parameter    | Type   | Description                                    |
|--------------|--------|------------------------------------------------|
| `status`     | string | `new`, `contacted`, `qualified`, `unqualified`, `converted`, `lost` |
| `source`     | string | `website`, `referral`, `cold_call`, `social`, `advertisement`, `event`, `other` |
| `assignedTo` | string | User ID of assigned sales rep                  |
| `minScore`   | int    | Minimum AI lead score (0–100)                  |
| `maxScore`   | int    | Maximum AI lead score (0–100)                  |
| `createdFrom`| string | ISO date — created after                       |
| `createdTo`  | string | ISO date — created before                      |

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "ld_a1b2c3d4",
      "firstName": "John",
      "lastName": "Connor",
      "email": "john@skynet.com",
      "phone": "+1-555-0177",
      "company": "Skynet",
      "jobTitle": "CTO",
      "source": "website",
      "status": "qualified",
      "score": 85,
      "assignedTo": {
        "id": "usr_3xk9f2m",
        "name": "Jane Doe"
      },
      "tags": ["enterprise", "high-priority"],
      "customFields": {
        "annualRevenue": "$5M-$10M",
        "employeeCount": "200-500"
      },
      "createdAt": "2026-07-15T09:00:00Z",
      "updatedAt": "2026-07-19T14:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 89,
    "totalPages": 5
  }
}
```

---

#### `POST /leads`

Create a new lead.

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Connor",
  "email": "john@skynet.com",
  "phone": "+1-555-0177",
  "company": "Skynet",
  "jobTitle": "CTO",
  "source": "website",
  "status": "new",
  "assignedTo": "usr_3xk9f2m",
  "tags": ["enterprise", "high-priority"],
  "notes": "Interested in enterprise plan. Requested demo.",
  "customFields": {
    "annualRevenue": "$5M-$10M",
    "employeeCount": "200-500"
  }
}
```

**Response — `201 Created`:**

```json
{
  "success": true,
  "data": {
    "id": "ld_e5f6g7h8",
    "firstName": "John",
    "lastName": "Connor",
    "email": "john@skynet.com",
    "status": "new",
    "score": 0,
    "createdAt": "2026-07-20T13:00:00Z"
  }
}
```

---

#### `GET /leads/:id`

Get a single lead with full details including timeline and activities.

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "ld_a1b2c3d4",
    "firstName": "John",
    "lastName": "Connor",
    "email": "john@skynet.com",
    "phone": "+1-555-0177",
    "company": "Skynet",
    "jobTitle": "CTO",
    "source": "website",
    "status": "qualified",
    "score": 85,
    "assignedTo": {
      "id": "usr_3xk9f2m",
      "name": "Jane Doe",
      "email": "jane@acme.com"
    },
    "tags": ["enterprise", "high-priority"],
    "customFields": {
      "annualRevenue": "$5M-$10M",
      "employeeCount": "200-500"
    },
    "timeline": [
      {
        "id": "evt_x1",
        "type": "note",
        "content": "Interested in enterprise plan",
        "createdAt": "2026-07-15T09:10:00Z",
        "createdBy": "usr_3xk9f2m"
      },
      {
        "id": "evt_x2",
        "type": "email",
        "content": "Sent intro email",
        "createdAt": "2026-07-16T08:00:00Z",
        "createdBy": "usr_3xk9f2m"
      },
      {
        "id": "evt_x3",
        "type": "call",
        "content": "Discovery call — discussed requirements",
        "duration": 1800,
        "createdAt": "2026-07-18T14:00:00Z",
        "createdBy": "usr_3xk9f2m"
      }
    ],
    "createdAt": "2026-07-15T09:00:00Z",
    "updatedAt": "2026-07-19T14:30:00Z"
  }
}
```

---

#### `PUT /leads/:id`

Update a lead.

**Request Body:**

```json
{
  "status": "contacted",
  "assignedTo": "usr_k7j8h9g",
  "tags": ["enterprise", "high-priority", "demo-scheduled"]
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "ld_a1b2c3d4",
    "status": "contacted",
    "assignedTo": "usr_k7j8h9g",
    "updatedAt": "2026-07-20T13:30:00Z"
  }
}
```

---

#### `DELETE /leads/:id`

Delete a lead.

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "Lead deleted successfully"
  }
}
```

---

#### `POST /leads/:id/assign`

Assign a lead to a sales rep.

**Request Body:**

```json
{
  "assignedTo": "usr_k7j8h9g",
  "note": "Reassigned to Bob for enterprise portfolio"
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "ld_a1b2c3d4",
    "assignedTo": {
      "id": "usr_k7j8h9g",
      "name": "Bob Smith"
    },
    "updatedAt": "2026-07-20T13:45:00Z"
  },
  "meta": {
    "message": "Lead assigned to Bob Smith"
  }
}
```

---

#### `POST /leads/:id/convert`

Convert a lead into a contact, company, and optionally a deal.

**Request Body:**

```json
{
  "createContact": true,
  "createCompany": true,
  "createDeal": true,
  "deal": {
    "name": "Skynet Enterprise License",
    "amount": 120000,
    "currency": "USD",
    "stageId": "stg_proposal",
    "expectedCloseDate": "2026-08-30"
  },
  "assignTo": "usr_3xk9f2m"
}
```

**Response — `201 Created`:**

```json
{
  "success": true,
  "data": {
    "lead": {
      "id": "ld_a1b2c3d4",
      "status": "converted"
    },
    "contact": {
      "id": "cnt_m8n9o0p",
      "firstName": "John",
      "lastName": "Connor",
      "email": "john@skynet.com"
    },
    "company": {
      "id": "cmp_q1r2s3t",
      "name": "Skynet",
      "industry": "Technology"
    },
    "deal": {
      "id": "dl_u4v5w6x",
      "name": "Skynet Enterprise License",
      "amount": 120000,
      "stageId": "stg_proposal"
    }
  }
}
```

---

#### `POST /leads/import`

Import leads from a CSV file.

**Request:** `multipart/form-data`

| Field    | Type   | Description                          |
|----------|--------|--------------------------------------|
| `file`   | file   | CSV file (max 10MB, max 5000 rows)   |
| `mapping`| string | JSON string mapping CSV columns to lead fields |
| `defaultStatus` | string | Default status for imported leads |
| `assignedTo` | string | User ID to assign all imported leads |

**Mapping Example:**

```json
{
  "First Name": "firstName",
  "Last Name": "lastName",
  "Email Address": "email",
  "Phone Number": "phone",
  "Company Name": "company",
  "Job Title": "jobTitle"
}
```

**Response — `202 Accepted`:**

```json
{
  "success": true,
  "data": {
    "importId": "imp_y7z8a9b",
    "status": "processing",
    "totalRows": 1250,
    "estimatedCompletion": "2026-07-20T13:05:00Z"
  }
}
```

---

#### `GET /leads/export`

Export leads as CSV.

**Query Parameters:**

| Parameter    | Type   | Description                              |
|--------------|--------|------------------------------------------|
| `status`     | string | Filter by status                         |
| `format`     | string | `csv` (default) or `xlsx`               |
| `fields`     | string | Comma-separated field names to export    |

**Response — `200 OK`** (Content-Type: `text/csv`):

```
id,firstName,lastName,email,phone,company,status,score,createdAt
ld_a1b2c3d4,John,Connor,john@skynet.com,+1-555-0177,Skynet,qualified,85,2026-07-15T09:00:00Z
ld_e5f6g7h8,Jane,Smith,jane@wayne.ent,+1-555-0234,Wayne Enterprises,new,42,2026-07-16T11:30:00Z
```

---

### 5. Contacts

Contact management with merge capabilities and interaction timeline.

---

#### `GET /contacts`

List all contacts.

**Query Parameters:**

| Parameter   | Type   | Description                         |
|-------------|--------|-------------------------------------|
| `company`   | string | Filter by company ID                |
| `tag`       | string | Filter by tag                       |
| `q`         | string | Full-text search (name, email)      |
| `hasDeal`   | bool   | Filter contacts with/without deals  |

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "cnt_m8n9o0p",
      "firstName": "John",
      "lastName": "Connor",
      "email": "john@skynet.com",
      "phone": "+1-555-0177",
      "jobTitle": "CTO",
      "companyId": "cmp_q1r2s3t",
      "companyName": "Skynet",
      "avatar": "https://cdn.novacrm.io/avatars/cnt_m8n9o0p.jpg",
      "tags": ["enterprise", "decision-maker"],
      "dealCount": 2,
      "totalDealValue": 185000,
      "lastActivityAt": "2026-07-19T14:30:00Z",
      "createdAt": "2026-07-15T09:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 234,
    "totalPages": 12
  }
}
```

---

#### `POST /contacts`

Create a new contact.

**Request Body:**

```json
{
  "firstName": "Bruce",
  "lastName": "Wayne",
  "email": "bruce@wayne.ent",
  "phone": "+1-555-0199",
  "jobTitle": "CEO",
  "companyId": "cmp_v9w0x1y",
  "address": {
    "street": "1007 Mountain Drive",
    "city": "Gotham",
    "state": "NJ",
    "postalCode": "07001",
    "country": "US"
  },
  "tags": ["vip", "enterprise", "decision-maker"],
  "customFields": {
    "linkedin": "linkedin.com/in/brucewayne",
    "preferredContactMethod": "email"
  }
}
```

**Response — `201 Created`:**

```json
{
  "success": true,
  "data": {
    "id": "cnt_z2a3b4c",
    "firstName": "Bruce",
    "lastName": "Wayne",
    "email": "bruce@wayne.ent",
    "createdAt": "2026-07-20T14:00:00Z"
  }
}
```

---

#### `GET /contacts/:id`

Get a single contact with full timeline.

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "cnt_m8n9o0p",
    "firstName": "John",
    "lastName": "Connor",
    "email": "john@skynet.com",
    "phone": "+1-555-0177",
    "jobTitle": "CTO",
    "company": {
      "id": "cmp_q1r2s3t",
      "name": "Skynet"
    },
    "address": {
      "street": "18144 El Camino Real",
      "city": "Sunnyvale",
      "state": "CA",
      "postalCode": "94087",
      "country": "US"
    },
    "tags": ["enterprise", "decision-maker"],
    "deals": [
      {
        "id": "dl_u4v5w6x",
        "name": "Skynet Enterprise License",
        "amount": 120000,
        "stage": "Proposal"
      }
    ],
    "timeline": [
      {
        "id": "evt_t1",
        "type": "contact_created",
        "content": "Contact created from lead conversion",
        "createdAt": "2026-07-18T16:00:00Z"
      },
      {
        "id": "evt_t2",
        "type": "email",
        "content": "Welcome email sent",
        "createdAt": "2026-07-18T16:05:00Z"
      },
      {
        "id": "evt_t3",
        "type": "meeting",
        "content": "Onboarding kickoff meeting",
        "duration": 3600,
        "createdAt": "2026-07-22T10:00:00Z"
      }
    ],
    "createdAt": "2026-07-18T16:00:00Z",
    "updatedAt": "2026-07-20T14:30:00Z"
  }
}
```

---

#### `PUT /contacts/:id`

Update a contact.

**Request Body:**

```json
{
  "jobTitle": "Chief Technology Officer",
  "tags": ["enterprise", "decision-maker", "champion"]
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "cnt_m8n9o0p",
    "jobTitle": "Chief Technology Officer",
    "updatedAt": "2026-07-20T14:30:00Z"
  }
}
```

---

#### `DELETE /contacts/:id`

Delete a contact.

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "Contact deleted successfully"
  }
}
```

---

#### `POST /contacts/merge`

Merge duplicate contacts. The primary contact retains all data; the secondary contact's unique fields are merged in, and the secondary is archived.

**Request Body:**

```json
{
  "primaryContactId": "cnt_m8n9o0p",
  "secondaryContactId": "cnt_d4e5f6g",
  "keepSecondaryEmail": false,
  "keepSecondaryPhone": true
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "cnt_m8n9o0p",
    "email": "john@skynet.com",
    "phone": "+1-555-0177",
    "mergedFrom": ["cnt_d4e5f6g"],
    "mergedAt": "2026-07-20T15:00:00Z"
  },
  "meta": {
    "message": "Contacts merged successfully"
  }
}
```

---

#### `GET /contacts/:id/timeline`

Get the full interaction timeline for a contact.

**Query Parameters:**

| Parameter  | Type   | Description                          |
|------------|--------|--------------------------------------|
| `type`     | string | Filter by event type                 |
| `from`     | string | ISO date — events after              |
| `to`       | string | ISO date — events before             |

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "evt_t1",
      "type": "note",
      "content": "Discussed enterprise requirements in detail",
      "createdAt": "2026-07-18T16:05:00Z",
      "createdBy": {
        "id": "usr_3xk9f2m",
        "name": "Jane Doe"
      }
    },
    {
      "id": "evt_t2",
      "type": "email",
      "direction": "outbound",
      "subject": "Welcome to NovaCRM",
      "content": "Hi John, thank you for your interest...",
      "createdAt": "2026-07-19T09:00:00Z",
      "createdBy": {
        "id": "usr_3xk9f2m",
        "name": "Jane Doe"
      }
    },
    {
      "id": "evt_t3",
      "type": "call",
      "content": "Follow-up call — confirmed budget approval",
      "duration": 1200,
      "outcome": "positive",
      "createdAt": "2026-07-20T11:00:00Z",
      "createdBy": {
        "id": "usr_k7j8h9g",
        "name": "Bob Smith"
      }
    }
  ]
}
```

---

### 6. Companies

Company records with hierarchy and relationship management.

---

#### `GET /companies`

List all companies.

**Query Parameters:**

| Parameter    | Type   | Description                         |
|--------------|--------|-------------------------------------|
| `industry`   | string | Filter by industry                  |
| `size`       | string | `startup`, `smb`, `mid_market`, `enterprise` |
| `parentId`   | string | Filter by parent company            |
| `q`          | string | Full-text search                    |

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "cmp_q1r2s3t",
      "name": "Skynet",
      "domain": "skynet.com",
      "industry": "Technology",
      "size": "enterprise",
      "annualRevenue": 50000000,
      "employeeCount": 1200,
      "logo": "https://cdn.novacrm.io/logos/cmp_q1r2s3t.png",
      "parentId": null,
      "subsidiaryCount": 3,
      "contactCount": 15,
      "dealCount": 4,
      "totalDealValue": 480000,
      "createdAt": "2026-07-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 67,
    "totalPages": 4
  }
}
```

---

#### `POST /companies`

Create a new company.

**Request Body:**

```json
{
  "name": "Wayne Enterprises",
  "domain": "wayne.enterprises",
  "industry": "Conglomerate",
  "size": "enterprise",
  "annualRevenue": 200000000,
  "employeeCount": 5000,
  "logo": "https://example.com/wayne-logo.png",
  "address": {
    "street": "1007 Mountain Drive",
    "city": "Gotham",
    "state": "NJ",
    "postalCode": "07001",
    "country": "US"
  },
  "parentId": null,
  "tags": ["fortune500", "strategic-account"],
  "customFields": {
    "founded": "1940",
    "stockTicker": "WAYN"
  }
}
```

**Response — `201 Created`:**

```json
{
  "success": true,
  "data": {
    "id": "cmp_v9w0x1y",
    "name": "Wayne Enterprises",
    "domain": "wayne.enterprises",
    "industry": "Conglomerate",
    "createdAt": "2026-07-20T15:30:00Z"
  }
}
```

---

#### `GET /companies/:id`

Get a single company with full hierarchy.

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "cmp_q1r2s3t",
    "name": "Skynet",
    "domain": "skynet.com",
    "industry": "Technology",
    "size": "enterprise",
    "annualRevenue": 50000000,
    "employeeCount": 1200,
    "logo": "https://cdn.novacrm.io/logos/cmp_q1r2s3t.png",
    "address": {
      "street": "18144 El Camino Real",
      "city": "Sunnyvale",
      "state": "CA",
      "postalCode": "94087",
      "country": "US"
    },
    "parentCompany": null,
    "subsidiaries": [
      {
        "id": "cmp_a1b2c3d",
        "name": "Skynet Defense Systems",
        "industry": "Defense"
      },
      {
        "id": "cmp_e5f6g7h",
        "name": "Skynet AI Labs",
        "industry": "Artificial Intelligence"
      }
    ],
    "contacts": [
      {
        "id": "cnt_m8n9o0p",
        "name": "John Connor",
        "jobTitle": "CTO",
        "isPrimary": true
      }
    ],
    "deals": [
      {
        "id": "dl_u4v5w6x",
        "name": "Enterprise License",
        "amount": 120000,
        "stage": "Proposal"
      }
    ],
    "tags": ["enterprise", "strategic-account"],
    "createdAt": "2026-07-01T00:00:00Z",
    "updatedAt": "2026-07-18T12:00:00Z"
  }
}
```

---

#### `PUT /companies/:id`

Update a company.

**Request Body:**

```json
{
  "annualRevenue": 55000000,
  "employeeCount": 1350,
  "tags": ["enterprise", "strategic-account", "upsell-opportunity"]
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "cmp_q1r2s3t",
    "annualRevenue": 55000000,
    "updatedAt": "2026-07-20T15:45:00Z"
  }
}
```

---

#### `DELETE /companies/:id`

Delete a company. Associated contacts are unlinked (not deleted).

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "Company deleted. 15 associated contacts have been unlinked"
  }
}
```

---

### 7. Deals

Deal pipeline management with stage transitions and forecasting.

---

#### `GET /deals`

List all deals.

**Query Parameters:**

| Parameter     | Type   | Description                              |
|---------------|--------|------------------------------------------|
| `stageId`     | string | Filter by pipeline stage                 |
| `assignedTo`  | string | Filter by assigned user                  |
| `minAmount`   | number | Minimum deal amount                      |
| `maxAmount`   | number | Maximum deal amount                      |
| `closeDateFrom` | string | Expected close date after              |
| `closeDateTo` | string | Expected close date before               |
| `status`      | string | `open`, `won`, `lost`, `cancelled`       |
| `pipelineId`  | string | Filter by pipeline                       |

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "dl_u4v5w6x",
      "name": "Skynet Enterprise License",
      "amount": 120000,
      "currency": "USD",
      "probability": 65,
      "stage": {
        "id": "stg_proposal",
        "name": "Proposal",
        "color": "#6366f1"
      },
      "pipeline": {
        "id": "pl_main",
        "name": "Sales Pipeline"
      },
      "contact": {
        "id": "cnt_m8n9o0p",
        "name": "John Connor"
      },
      "company": {
        "id": "cmp_q1r2s3t",
        "name": "Skynet"
      },
      "assignedTo": {
        "id": "usr_3xk9f2m",
        "name": "Jane Doe"
      },
      "expectedCloseDate": "2026-08-30",
      "status": "open",
      "tags": ["enterprise", "q3-target"],
      "createdAt": "2026-07-18T16:00:00Z",
      "updatedAt": "2026-07-20T10:00:00Z"
    },
    {
      "id": "dl_y8z9a0b",
      "name": "Wayne Security Audit",
      "amount": 85000,
      "currency": "USD",
      "probability": 30,
      "stage": {
        "id": "stg_discovery",
        "name": "Discovery",
        "color": "#f59e0b"
      },
      "pipeline": {
        "id": "pl_main",
        "name": "Sales Pipeline"
      },
      "contact": {
        "id": "cnt_z2a3b4c",
        "name": "Bruce Wayne"
      },
      "company": {
        "id": "cmp_v9w0x1y",
        "name": "Wayne Enterprises"
      },
      "assignedTo": {
        "id": "usr_k7j8h9g",
        "name": "Bob Smith"
      },
      "expectedCloseDate": "2026-09-15",
      "status": "open",
      "tags": ["enterprise", "security"],
      "createdAt": "2026-07-19T08:00:00Z",
      "updatedAt": "2026-07-20T11:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 43,
    "totalPages": 3
  }
}
```

---

#### `POST /deals`

Create a new deal.

**Request Body:**

```json
{
  "name": "Wayne Security Audit",
  "amount": 85000,
  "currency": "USD",
  "pipelineId": "pl_main",
  "stageId": "stg_discovery",
  "contactId": "cnt_z2a3b4c",
  "companyId": "cmp_v9w0x1y",
  "assignedTo": "usr_k7j8h9g",
  "expectedCloseDate": "2026-09-15",
  "tags": ["enterprise", "security"],
  "customFields": {
    "dealType": "new_business",
    "competitor": "Legacy CRM Co"
  }
}
```

**Response — `201 Created`:**

```json
{
  "success": true,
  "data": {
    "id": "dl_c1d2e3f4",
    "name": "Wayne Security Audit",
    "amount": 85000,
    "stageId": "stg_discovery",
    "status": "open",
    "createdAt": "2026-07-20T16:00:00Z"
  }
}
```

---

#### `GET /deals/:id`

Get a single deal with full details.

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "dl_u4v5w6x",
    "name": "Skynet Enterprise License",
    "amount": 120000,
    "currency": "USD",
    "probability": 65,
    "stage": {
      "id": "stg_proposal",
      "name": "Proposal",
      "order": 4,
      "color": "#6366f1"
    },
    "pipeline": {
      "id": "pl_main",
      "name": "Sales Pipeline"
    },
    "contact": {
      "id": "cnt_m8n9o0p",
      "name": "John Connor",
      "email": "john@skynet.com"
    },
    "company": {
      "id": "cmp_q1r2s3t",
      "name": "Skynet"
    },
    "assignedTo": {
      "id": "usr_3xk9f2m",
      "name": "Jane Doe"
    },
    "expectedCloseDate": "2026-08-30",
    "actualCloseDate": null,
    "status": "open",
    "tags": ["enterprise", "q3-target"],
    "lineItems": [
      {
        "id": "li_x1",
        "name": "Enterprise License — Annual",
        "quantity": 1,
        "unitPrice": 100000,
        "discount": 0,
        "total": 100000
      },
      {
        "id": "li_x2",
        "name": "Premium Support Package",
        "quantity": 1,
        "unitPrice": 20000,
        "discount": 0,
        "total": 20000
      }
    ],
    "stageHistory": [
      {
        "stageId": "stg_lead",
        "stageName": "Lead",
        "enteredAt": "2026-07-15T09:00:00Z",
        "exitedAt": "2026-07-16T10:00:00Z"
      },
      {
        "stageId": "stg_qualified",
        "stageName": "Qualified",
        "enteredAt": "2026-07-16T10:00:00Z",
        "exitedAt": "2026-07-18T14:00:00Z"
      },
      {
        "stageId": "stg_negotiation",
        "stageName": "Negotiation",
        "enteredAt": "2026-07-18T14:00:00Z",
        "exitedAt": "2026-07-19T16:00:00Z"
      },
      {
        "stageId": "stg_proposal",
        "stageName": "Proposal",
        "enteredAt": "2026-07-19T16:00:00Z",
        "exitedAt": null
      }
    ],
    "activities": [
      {
        "id": "evt_d1",
        "type": "note",
        "content": "Sent initial proposal with pricing breakdown",
        "createdAt": "2026-07-19T16:30:00Z"
      }
    ],
    "createdAt": "2026-07-18T16:00:00Z",
    "updatedAt": "2026-07-20T10:00:00Z"
  }
}
```

---

#### `PUT /deals/:id`

Update a deal.

**Request Body:**

```json
{
  "amount": 135000,
  "probability": 75,
  "expectedCloseDate": "2026-08-15",
  "tags": ["enterprise", "q3-target", "fast-track"]
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "dl_u4v5w6x",
    "amount": 135000,
    "updatedAt": "2026-07-20T16:30:00Z"
  }
}
```

---

#### `DELETE /deals/:id`

Delete a deal.

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "Deal deleted successfully"
  }
}
```

---

#### `PUT /deals/:id/stage`

Move a deal to a new pipeline stage.

**Request Body:**

```json
{
  "stageId": "stg_negotiation",
  "note": "Client confirmed budget — moving to negotiation"
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "dl_u4v5w6x",
    "stage": {
      "id": "stg_negotiation",
      "name": "Negotiation",
      "color": "#8b5cf6"
    },
    "probability": 50,
    "updatedAt": "2026-07-20T17:00:00Z"
  },
  "meta": {
    "message": "Deal moved to Negotiation"
  }
}
```

---

### 8. Tasks

Task management with assignment, recurring schedules, and priority levels.

---

#### `GET /tasks`

List tasks.

**Query Parameters:**

| Parameter   | Type   | Description                              |
|-------------|--------|------------------------------------------|
| `status`    | string | `pending`, `in_progress`, `completed`, `cancelled` |
| `priority`  | string | `low`, `medium`, `high`, `urgent`       |
| `assignedTo`| string | Filter by assigned user                  |
| `dueFrom`   | string | Due date after                           |
| `dueTo`     | string | Due date before                          |
| `relatedTo` | string | Filter by related entity type and ID (`lead:ld_xxx`, `deal:dl_xxx`, `contact:cnt_xxx`) |
| `isRecurring` | bool | Filter recurring tasks                   |

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "tsk_m1n2o3p",
      "title": "Follow up on proposal",
      "description": "Call John to discuss proposal feedback and address objections",
      "status": "pending",
      "priority": "high",
      "dueDate": "2026-07-22T17:00:00Z",
      "assignedTo": {
        "id": "usr_3xk9f2m",
        "name": "Jane Doe"
      },
      "relatedTo": {
        "type": "deal",
        "id": "dl_u4v5w6x",
        "name": "Skynet Enterprise License"
      },
      "isRecurring": false,
      "reminderAt": "2026-07-22T16:00:00Z",
      "createdAt": "2026-07-20T10:00:00Z"
    },
    {
      "id": "tsk_q4r5s6t",
      "title": "Monthly pipeline review",
      "description": "Review all open deals and update forecasts",
      "status": "pending",
      "priority": "medium",
      "dueDate": "2026-07-31T10:00:00Z",
      "assignedTo": {
        "id": "usr_3xk9f2m",
        "name": "Jane Doe"
      },
      "relatedTo": null,
      "isRecurring": true,
      "recurrence": {
        "frequency": "monthly",
        "dayOfMonth": 1,
        "nextOccurrence": "2026-08-01T10:00:00Z"
      },
      "createdAt": "2026-07-01T08:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 28,
    "totalPages": 2
  }
}
```

---

#### `POST /tasks`

Create a new task.

**Request Body:**

```json
{
  "title": "Prepare demo environment",
  "description": "Set up sandbox environment with sample data for Skynet demo",
  "status": "pending",
  "priority": "high",
  "dueDate": "2026-07-23T12:00:00Z",
  "assignedTo": "usr_k7j8h9g",
  "relatedTo": {
    "type": "deal",
    "id": "dl_u4v5w6x"
  },
  "isRecurring": false,
  "reminderAt": "2026-07-23T11:00:00Z",
  "tags": ["demo", "setup"]
}
```

**Response — `201 Created`:**

```json
{
  "success": true,
  "data": {
    "id": "tsk_u7v8w9x",
    "title": "Prepare demo environment",
    "status": "pending",
    "priority": "high",
    "dueDate": "2026-07-23T12:00:00Z",
    "createdAt": "2026-07-20T17:30:00Z"
  }
}
```

---

#### `GET /tasks/:id`

Get a single task.

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "tsk_m1n2o3p",
    "title": "Follow up on proposal",
    "description": "Call John to discuss proposal feedback and address objections",
    "status": "pending",
    "priority": "high",
    "dueDate": "2026-07-22T17:00:00Z",
    "assignedTo": {
      "id": "usr_3xk9f2m",
      "name": "Jane Doe",
      "email": "jane@acme.com"
    },
    "createdBy": {
      "id": "usr_3xk9f2m",
      "name": "Jane Doe"
    },
    "relatedTo": {
      "type": "deal",
      "id": "dl_u4v5w6x",
      "name": "Skynet Enterprise License"
    },
    "isRecurring": false,
    "reminderAt": "2026-07-22T16:00:00Z",
    "tags": ["follow-up", "sales"],
    "subtasks": [
      {
        "id": "st_a1",
        "title": "Review proposal document",
        "status": "completed"
      },
      {
        "id": "st_a2",
        "title": "Prepare objection responses",
        "status": "pending"
      }
    ],
    "comments": [
      {
        "id": "cmt_x1",
        "content": "John mentioned budget concerns on last call",
        "createdAt": "2026-07-20T14:00:00Z",
        "createdBy": "usr_k7j8h9g"
      }
    ],
    "createdAt": "2026-07-20T10:00:00Z",
    "updatedAt": "2026-07-20T14:00:00Z"
  }
}
```

---

#### `PUT /tasks/:id`

Update a task.

**Request Body:**

```json
{
  "status": "in_progress",
  "priority": "urgent"
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "tsk_m1n2o3p",
    "status": "in_progress",
    "priority": "urgent",
    "updatedAt": "2026-07-20T18:00:00Z"
  }
}
```

---

#### `DELETE /tasks/:id`

Delete a task.

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "Task deleted successfully"
  }
}
```

---

#### `POST /tasks/:id/assign`

Reassign a task.

**Request Body:**

```json
{
  "assignedTo": "usr_n4m5l6k",
  "note": "Reassigned to Sarah — she has context on the Wayne account"
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "tsk_m1n2o3p",
    "assignedTo": {
      "id": "usr_n4m5l6k",
      "name": "Sarah Connor"
    },
    "updatedAt": "2026-07-20T18:15:00Z"
  }
}
```

---

### 9. Calendar & Events

Calendar management with external sync support.

---

#### `GET /events`

List calendar events.

**Query Parameters:**

| Parameter   | Type   | Description                              |
|-------------|--------|------------------------------------------|
| `from`      | string | ISO date — events after                  |
| `to`        | string | ISO date — events before                 |
| `type`      | string | `meeting`, `task`, `reminder`, `custom`  |
| `assignedTo`| string | Filter by owner                          |

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "evt_c1d2e3f",
      "title": "Skynet Demo",
      "description": "Product demo for Skynet team",
      "type": "meeting",
      "startDateTime": "2026-07-24T14:00:00Z",
      "endDateTime": "2026-07-24T15:30:00Z",
      "location": "Zoom — https://zoom.us/j/123456789",
      "owner": {
        "id": "usr_3xk9f2m",
        "name": "Jane Doe"
      },
      "attendees": [
        {
          "id": "usr_k7j8h9g",
          "name": "Bob Smith",
          "status": "accepted"
        },
        {
          "id": "ext_john",
          "name": "John Connor",
          "email": "john@skynet.com",
          "status": "accepted",
          "external": true
        }
      ],
      "relatedTo": {
        "type": "deal",
        "id": "dl_u4v5w6x"
      },
      "isRecurring": false,
      "syncStatus": "synced",
      "createdAt": "2026-07-20T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 18,
    "totalPages": 1
  }
}
```

---

#### `POST /events`

Create a new calendar event.

**Request Body:**

```json
{
  "title": "Skynet Demo",
  "description": "Product demo for Skynet team — cover enterprise features, security, and pricing",
  "type": "meeting",
  "startDateTime": "2026-07-24T14:00:00Z",
  "endDateTime": "2026-07-24T15:30:00Z",
  "location": "Zoom — https://zoom.us/j/123456789",
  "attendees": [
    {
      "type": "user",
      "id": "usr_k7j8h9g"
    },
    {
      "type": "external",
      "email": "john@skynet.com",
      "name": "John Connor"
    }
  ],
  "relatedTo": {
    "type": "deal",
    "id": "dl_u4v5w6x"
  },
  "reminders": [
    {
      "minutes": 60,
      "type": "notification"
    },
    {
      "minutes": 15,
      "type": "email"
    }
  ]
}
```

**Response — `201 Created`:**

```json
{
  "success": true,
  "data": {
    "id": "evt_g4h5i6j",
    "title": "Skynet Demo",
    "startDateTime": "2026-07-24T14:00:00Z",
    "endDateTime": "2026-07-24T15:30:00Z",
    "createdAt": "2026-07-20T18:30:00Z"
  }
}
```

---

#### `GET /events/:id`

Get a single event.

---

#### `PUT /events/:id`

Update an event.

**Request Body:**

```json
{
  "startDateTime": "2026-07-24T15:00:00Z",
  "endDateTime": "2026-07-24T16:30:00Z",
  "location": "Google Meet — https://meet.google.com/abc-defg-hij"
}
```

---

#### `DELETE /events/:id`

Delete an event and notify all attendees.

---

#### `POST /events/:id/sync`

Sync event with external calendar provider.

**Request Body:**

```json
{
  "provider": "google",
  "calendarId": "primary"
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "syncId": "gcal_abc123def456",
    "provider": "google",
    "externalEventId": "evt_google_789xyz",
    "syncedAt": "2026-07-20T18:35:00Z"
  }
}
```

---

### 10. Meetings

Meeting records with notes, outcomes, and follow-up actions.

---

#### `GET /meetings`

List meetings.

**Query Parameters:**

| Parameter   | Type   | Description                              |
|-------------|--------|------------------------------------------|
| `status`    | string | `scheduled`, `in_progress`, `completed`, `cancelled`, `no_show` |
| `from`      | string | Meetings after this date                 |
| `to`        | string | Meetings before this date                |
| `contactId` | string | Filter by contact                        |
| `dealId`    | string | Filter by deal                           |

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "mtg_a1b2c3d",
      "title": "Discovery Call — Wayne Enterprises",
      "status": "completed",
      "scheduledAt": "2026-07-18T14:00:00Z",
      "duration": 3600,
      "location": "Zoom",
      "contact": {
        "id": "cnt_z2a3b4c",
        "name": "Bruce Wayne"
      },
      "deal": {
        "id": "dl_y8z9a0b",
        "name": "Wayne Security Audit"
      },
      "organizer": {
        "id": "usr_k7j8h9g",
        "name": "Bob Smith"
      },
      "hasNotes": true,
      "hasRecording": true,
      "outcome": "positive",
      "createdAt": "2026-07-15T09:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

#### `POST /meetings`

Create a new meeting record.

**Request Body:**

```json
{
  "title": "Discovery Call — Wayne Enterprises",
  "description": "Initial discovery meeting to understand security requirements",
  "scheduledAt": "2026-07-18T14:00:00Z",
  "duration": 3600,
  "location": "Zoom — https://zoom.us/j/987654321",
  "contactId": "cnt_z2a3b4c",
  "dealId": "dl_y8z9a0b",
  "attendees": [
    {
      "type": "user",
      "id": "usr_k7j8h9g"
    },
    {
      "type": "external",
      "email": "bruce@wayne.ent",
      "name": "Bruce Wayne"
    },
    {
      "type": "external",
      "email": "alfred@wayne.ent",
      "name": "Alfred Pennyworth"
    }
  ],
  "reminders": [
    {
      "minutes": 30,
      "type": "notification"
    }
  ]
}
```

**Response — `201 Created`:**

```json
{
  "success": true,
  "data": {
    "id": "mtg_e5f6g7h",
    "title": "Discovery Call — Wayne Enterprises",
    "status": "scheduled",
    "scheduledAt": "2026-07-18T14:00:00Z",
    "createdAt": "2026-07-16T09:00:00Z"
  }
}
```

---

#### `GET /meetings/:id`

Get a single meeting with notes.

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "mtg_a1b2c3d",
    "title": "Discovery Call — Wayne Enterprises",
    "status": "completed",
    "scheduledAt": "2026-07-18T14:00:00Z",
    "startedAt": "2026-07-18T14:02:00Z",
    "endedAt": "2026-07-18T15:05:00Z",
    "duration": 3720,
    "location": "Zoom",
    "contact": {
      "id": "cnt_z2a3b4c",
      "name": "Bruce Wayne",
      "email": "bruce@wayne.ent"
    },
    "deal": {
      "id": "dl_y8z9a0b",
      "name": "Wayne Security Audit"
    },
    "organizer": {
      "id": "usr_k7j8h9g",
      "name": "Bob Smith"
    },
    "notes": "## Key Discussion Points\n\n- Current security infrastructure is outdated\n- Need comprehensive audit of all systems\n- Budget approved for $80K-$100K range\n- Decision timeline: end of Q3\n\n## Action Items\n\n- [ ] Send detailed security assessment proposal\n- [ ] Schedule technical deep-dive with IT team\n- [ ] Share case studies from similar enterprises\n\n## Next Steps\n\nFollow up next Tuesday with proposal",
    "outcome": "positive",
    "recordingUrl": "https://cdn.novacrm.io/recordings/mtg_a1b2c3d.mp4",
    "followUpTask": {
      "id": "tsk_new1",
      "title": "Send security assessment proposal",
      "dueDate": "2026-07-22T17:00:00Z"
    },
    "createdAt": "2026-07-15T09:00:00Z"
  }
}
```

---

#### `PUT /meetings/:id`

Update a meeting.

**Request Body:**

```json
{
  "notes": "Updated notes with additional context from follow-up conversation",
  "outcome": "positive",
  "status": "completed"
}
```

---

#### `DELETE /meetings/:id`

Delete a meeting. Attendees are notified of cancellation.

---

### 11. Invoices

Invoice generation, management, and payment tracking.

---

#### `GET /invoices`

List all invoices.

**Query Parameters:**

| Parameter   | Type   | Description                              |
|-------------|--------|------------------------------------------|
| `status`    | string | `draft`, `sent`, `viewed`, `paid`, `overdue`, `cancelled` |
| `dealId`    | string | Filter by deal                           |
| `contactId` | string | Filter by billing contact                |
| `minAmount` | number | Minimum amount                           |
| `maxAmount` | number | Maximum amount                           |
| `dueFrom`   | string | Due date after                           |
| `dueTo`     | string | Due date before                          |

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "inv_k1l2m3n",
      "invoiceNumber": "INV-2026-0042",
      "status": "sent",
      "dealId": "dl_u4v5w6x",
      "dealName": "Skynet Enterprise License",
      "contact": {
        "id": "cnt_m8n9o0p",
        "name": "John Connor",
        "email": "john@skynet.com"
      },
      "company": {
        "id": "cmp_q1r2s3t",
        "name": "Skynet"
      },
      "subtotal": 120000,
      "taxRate": 0.08,
      "taxAmount": 9600,
      "discount": 0,
      "total": 129600,
      "currency": "USD",
      "issueDate": "2026-07-20",
      "dueDate": "2026-08-19",
      "paidAt": null,
      "createdAt": "2026-07-20T10:00:00Z"
    },
    {
      "id": "inv_o4p5q6r",
      "invoiceNumber": "INV-2026-0041",
      "status": "paid",
      "dealId": "dl_s7t8u9v",
      "dealName": "Acme Consulting Engagement",
      "contact": {
        "id": "cnt_w1x2y3z",
        "name": "Alice Johnson"
      },
      "company": {
        "id": "cmp_a4b5c6d",
        "name": "Acme Corp"
      },
      "subtotal": 45000,
      "taxRate": 0.08,
      "taxAmount": 3600,
      "discount": 2250,
      "total": 46350,
      "currency": "USD",
      "issueDate": "2026-07-01",
      "dueDate": "2026-07-31",
      "paidAt": "2026-07-15T09:00:00Z",
      "createdAt": "2026-07-01T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 34,
    "totalPages": 2
  }
}
```

---

#### `POST /invoices`

Create a new invoice.

**Request Body:**

```json
{
  "dealId": "dl_u4v5w6x",
  "contactId": "cnt_m8n9o0p",
  "companyId": "cmp_q1r2s3t",
  "lineItems": [
    {
      "description": "Enterprise License — Annual",
      "quantity": 1,
      "unitPrice": 100000,
      "taxable": true
    },
    {
      "description": "Premium Support Package",
      "quantity": 1,
      "unitPrice": 20000,
      "taxable": true
    }
  ],
  "taxRate": 0.08,
  "discount": 0,
  "currency": "USD",
  "issueDate": "2026-07-20",
  "dueDate": "2026-08-19",
  "notes": "Net 30 payment terms. Late payments subject to 1.5% monthly interest.",
  "paymentTerms": "net_30",
  "billingAddress": {
    "street": "18144 El Camino Real",
    "city": "Sunnyvale",
    "state": "CA",
    "postalCode": "94087",
    "country": "US"
  }
}
```

**Response — `201 Created`:**

```json
{
  "success": true,
  "data": {
    "id": "inv_k1l2m3n",
    "invoiceNumber": "INV-2026-0042",
    "status": "draft",
    "subtotal": 120000,
    "taxRate": 0.08,
    "taxAmount": 9600,
    "discount": 0,
    "total": 129600,
    "currency": "USD",
    "issueDate": "2026-07-20",
    "dueDate": "2026-08-19",
    "createdAt": "2026-07-20T10:00:00Z"
  }
}
```

---

#### `GET /invoices/:id`

Get a single invoice with full line items.

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "inv_k1l2m3n",
    "invoiceNumber": "INV-2026-0042",
    "status": "sent",
    "deal": {
      "id": "dl_u4v5w6x",
      "name": "Skynet Enterprise License"
    },
    "contact": {
      "id": "cnt_m8n9o0p",
      "name": "John Connor",
      "email": "john@skynet.com"
    },
    "company": {
      "id": "cmp_q1r2s3t",
      "name": "Skynet"
    },
    "lineItems": [
      {
        "id": "li_inv1",
        "description": "Enterprise License — Annual",
        "quantity": 1,
        "unitPrice": 100000,
        "discount": 0,
        "taxable": true,
        "total": 100000
      },
      {
        "id": "li_inv2",
        "description": "Premium Support Package",
        "quantity": 1,
        "unitPrice": 20000,
        "discount": 0,
        "taxable": true,
        "total": 20000
      }
    ],
    "subtotal": 120000,
    "taxRate": 0.08,
    "taxAmount": 9600,
    "discount": 0,
    "total": 129600,
    "currency": "USD",
    "issueDate": "2026-07-20",
    "dueDate": "2026-08-19",
    "paidAt": null,
    "notes": "Net 30 payment terms.",
    "paymentTerms": "net_30",
    "billingAddress": {
      "street": "18144 El Camino Real",
      "city": "Sunnyvale",
      "state": "CA",
      "postalCode": "94087",
      "country": "US"
    },
    "pdfUrl": "https://cdn.novacrm.io/invoices/inv_k1l2m3n.pdf",
    "viewedAt": "2026-07-21T08:30:00Z",
    "createdAt": "2026-07-20T10:00:00Z",
    "updatedAt": "2026-07-21T08:30:00Z"
  }
}
```

---

#### `PUT /invoices/:id`

Update an invoice (only `draft` invoices can be edited).

**Request Body:**

```json
{
  "lineItems": [
    {
      "description": "Enterprise License — Annual",
      "quantity": 1,
      "unitPrice": 110000,
      "taxable": true
    },
    {
      "description": "Premium Support Package",
      "quantity": 1,
      "unitPrice": 25000,
      "taxable": true
    }
  ],
  "notes": "Updated pricing per negotiation on 2026-07-20"
}
```

---

#### `DELETE /invoices/:id`

Delete a draft invoice.

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "Draft invoice deleted"
  }
}
```

---

#### `POST /invoices/:id/send`

Send an invoice to the billing contact.

**Request Body:**

```json
{
  "recipients": ["john@skynet.com", "ap@skynet.com"],
  "subject": "Invoice INV-2026-0042 from NovaCRM",
  "message": "Please find attached the invoice for your enterprise license. Payment is due within 30 days.",
  "ccFinance": true
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "inv_k1l2m3n",
    "status": "sent",
    "sentAt": "2026-07-20T11:00:00Z",
    "sentTo": ["john@skynet.com", "ap@skynet.com"]
  },
  "meta": {
    "message": "Invoice sent successfully"
  }
}
```

---

#### `POST /invoices/:id/pay`

Record a payment for an invoice.

**Request Body:**

```json
{
  "amount": 129600,
  "currency": "USD",
  "paymentMethod": "bank_transfer",
  "reference": "TXN-2026-ABC123",
  "paidAt": "2026-07-25T09:00:00Z",
  "notes": "Full payment received via wire transfer"
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "inv_k1l2m3n",
    "status": "paid",
    "paidAt": "2026-07-25T09:00:00Z",
    "payment": {
      "id": "pmt_s1t2u3v",
      "amount": 129600,
      "method": "bank_transfer",
      "reference": "TXN-2026-ABC123"
    }
  },
  "meta": {
    "message": "Payment recorded and invoice marked as paid"
  }
}
```

---

### 12. Payments

Payment tracking and reconciliation.

---

#### `GET /payments`

List all payments.

**Query Parameters:**

| Parameter    | Type   | Description                              |
|--------------|--------|------------------------------------------|
| `invoiceId`  | string | Filter by invoice                        |
| `method`     | string | `credit_card`, `bank_transfer`, `paypal`, `stripe`, `cash`, `check` |
| `status`     | string | `pending`, `completed`, `failed`, `refunded` |
| `dateFrom`   | string | Payments after this date                 |
| `dateTo`     | string | Payments before this date                |

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "pmt_s1t2u3v",
      "invoiceId": "inv_k1l2m3n",
      "invoiceNumber": "INV-2026-0042",
      "amount": 129600,
      "currency": "USD",
      "paymentMethod": "bank_transfer",
      "status": "completed",
      "reference": "TXN-2026-ABC123",
      "paidAt": "2026-07-25T09:00:00Z",
      "contact": {
        "id": "cnt_m8n9o0p",
        "name": "John Connor"
      },
      "createdAt": "2026-07-25T09:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 89,
    "totalPages": 5
  }
}
```

---

#### `POST /payments`

Record a new payment.

**Request Body:**

```json
{
  "invoiceId": "inv_k1l2m3n",
  "amount": 129600,
  "currency": "USD",
  "paymentMethod": "credit_card",
  "status": "completed",
  "reference": "stripe_pi_1234567890",
  "paidAt": "2026-07-25T09:00:00Z",
  "metadata": {
    "stripePaymentIntentId": "pi_1234567890",
    "cardLast4": "4242"
  },
  "notes": "Payment via Stripe"
}
```

**Response — `201 Created`:**

```json
{
  "success": true,
  "data": {
    "id": "pmt_w4x5y6z",
    "invoiceId": "inv_k1l2m3n",
    "amount": 129600,
    "status": "completed",
    "createdAt": "2026-07-25T09:00:00Z"
  }
}
```

---

#### `GET /payments/:id`

Get a single payment.

---

#### `PUT /payments/:id`

Update payment details (e.g., add reference, correct amount).

**Request Body:**

```json
{
  "reference": "TXN-2026-ABC123-CORRECTED",
  "notes": "Corrected reference number"
}
```

---

#### `DELETE /payments/:id`

Void a payment record.

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "Payment voided. Invoice status updated to 'sent'"
  }
}
```

---

### 13. Notifications

In-app and push notification management.

---

#### `GET /notifications`

List notifications for the current user.

**Query Parameters:**

| Parameter  | Type   | Description                              |
|------------|--------|------------------------------------------|
| `isRead`   | bool   | Filter by read/unread status             |
| `type`     | string | `mention`, `assignment`, `reminder`, `deal_update`, `system`, `ai_insight` |
| `from`     | string | Notifications after this date            |

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "ntf_a1b2c3d",
      "type": "assignment",
      "title": "New lead assigned to you",
      "message": "John Connor (Skynet) has been assigned to you",
      "isRead": false,
      "actionUrl": "/leads/ld_a1b2c3d",
      "relatedTo": {
        "type": "lead",
        "id": "ld_a1b2c3d"
      },
      "createdAt": "2026-07-20T10:30:00Z"
    },
    {
      "id": "ntf_e5f6g7h",
      "type": "deal_update",
      "title": "Deal stage changed",
      "message": "Skynet Enterprise License moved to Proposal",
      "isRead": false,
      "actionUrl": "/deals/dl_u4v5w6x",
      "relatedTo": {
        "type": "deal",
        "id": "dl_u4v5w6x"
      },
      "createdAt": "2026-07-19T16:00:00Z"
    },
    {
      "id": "ntf_i8j9k0l",
      "type": "ai_insight",
      "title": "AI Lead Score Updated",
      "message": "John Connor's lead score increased from 72 to 85 based on recent engagement",
      "isRead": true,
      "actionUrl": "/leads/ld_a1b2c3d",
      "relatedTo": {
        "type": "lead",
        "id": "ld_a1b2c3d"
      },
      "createdAt": "2026-07-19T12:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 47,
    "totalPages": 3,
    "unreadCount": 12
  }
}
```

---

#### `PUT /notifications/:id/read`

Mark a notification as read.

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "ntf_a1b2c3d",
    "isRead": true,
    "readAt": "2026-07-20T11:00:00Z"
  }
}
```

---

### 14. Reports

Pre-built and custom reporting endpoints.

---

#### `GET /reports/revenue`

Revenue report with configurable time periods.

**Query Parameters:**

| Parameter  | Type   | Description                              |
|------------|--------|------------------------------------------|
| `period`   | string | `daily`, `weekly`, `monthly`, `quarterly`, `yearly` |
| `from`     | string | Report start date                        |
| `to`       | string | Report end date                          |
| `groupBy`  | string | `status`, `source`, `assignedTo`, `company` |

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 1847500,
      "totalDeals": 34,
      "averageDealSize": 54338,
      "winRate": 0.68,
      "periodComparison": {
        "revenueChange": 0.15,
        "dealCountChange": 0.08
      }
    },
    "breakdown": [
      {
        "period": "2026-01",
        "revenue": 142000,
        "deals": 3,
        "averageDealSize": 47333
      },
      {
        "period": "2026-02",
        "revenue": 198000,
        "deals": 4,
        "averageDealSize": 49500
      },
      {
        "period": "2026-03",
        "revenue": 267000,
        "deals": 5,
        "averageDealSize": 53400
      },
      {
        "period": "2026-04",
        "revenue": 315000,
        "deals": 6,
        "averageDealSize": 52500
      },
      {
        "period": "2026-05",
        "revenue": 423000,
        "deals": 7,
        "averageDealSize": 60429
      },
      {
        "period": "2026-06",
        "revenue": 502500,
        "deals": 9,
        "averageDealSize": 55833
      }
    ],
    "bySource": [
      { "source": "referral", "revenue": 645000, "percentage": 0.349 },
      { "source": "website", "revenue": 520000, "percentage": 0.281 },
      { "source": "cold_call", "revenue": 382500, "percentage": 0.207 },
      { "source": "social", "revenue": 300000, "percentage": 0.162 }
    ]
  }
}
```

---

#### `GET /reports/sales`

Sales performance report.

**Query Parameters:**

| Parameter  | Type   | Description                              |
|------------|--------|------------------------------------------|
| `period`   | string | `weekly`, `monthly`, `quarterly`         |
| `from`     | string | Report start date                        |
| `to`       | string | Report end date                          |
| `teamId`   | string | Filter by sales team                     |

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalContactsMade": 1247,
      "totalMeetingsHeld": 89,
      "totalProposalsSent": 42,
      "conversionRate": 0.068,
      "averageSalesCycleDays": 34
    },
    "byRepresentative": [
      {
        "userId": "usr_3xk9f2m",
        "name": "Jane Doe",
        "contactsMade": 312,
        "meetingsHeld": 24,
        "proposalsSent": 12,
        "dealsWon": 8,
        "revenue": 485000
      },
      {
        "userId": "usr_k7j8h9g",
        "name": "Bob Smith",
        "contactsMade": 287,
        "meetingsHeld": 19,
        "proposalsSent": 10,
        "dealsWon": 6,
        "revenue": 392000
      },
      {
        "userId": "usr_n4m5l6k",
        "name": "Sarah Connor",
        "contactsMade": 265,
        "meetingsHeld": 22,
        "proposalsSent": 11,
        "dealsWon": 7,
        "revenue": 412500
      }
    ],
    "funnel": [
      { "stage": "Leads", "count": 1247, "percentage": 1.0 },
      { "stage": "Contacted", "count": 892, "percentage": 0.715 },
      { "stage": "Qualified", "count": 345, "percentage": 0.277 },
      { "stage": "Proposal", "count": 142, "percentage": 0.114 },
      { "stage": "Negotiation", "count": 67, "percentage": 0.054 },
      { "stage": "Closed Won", "count": 43, "percentage": 0.034 }
    ]
  }
}
```

---

#### `GET /reports/leads`

Lead source and conversion report.

**Query Parameters:**

| Parameter  | Type   | Description                              |
|------------|--------|------------------------------------------|
| `period`   | string | `daily`, `weekly`, `monthly`             |
| `from`     | string | Report start date                        |
| `to`       | string | Report end date                          |

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalLeads": 892,
      "convertedLeads": 142,
      "conversionRate": 0.159,
      "averageTimeToConvertDays": 18
    },
    "bySource": [
      {
        "source": "website",
        "count": 312,
        "converted": 52,
        "conversionRate": 0.167,
        "averageScore": 68
      },
      {
        "source": "referral",
        "count": 189,
        "converted": 45,
        "conversionRate": 0.238,
        "averageScore": 74
      },
      {
        "source": "cold_call",
        "count": 156,
        "converted": 18,
        "conversionRate": 0.115,
        "averageScore": 52
      },
      {
        "source": "social",
        "count": 134,
        "converted": 15,
        "conversionRate": 0.112,
        "averageScore": 48
      },
      {
        "source": "advertisement",
        "count": 101,
        "converted": 12,
        "conversionRate": 0.119,
        "averageScore": 55
      }
    ],
    "trend": [
      { "period": "2026-01", "leads": 98, "converted": 14 },
      { "period": "2026-02", "leads": 112, "converted": 18 },
      { "period": "2026-03", "leads": 134, "converted": 22 },
      { "period": "2026-04", "leads": 148, "converted": 26 },
      { "period": "2026-05", "leads": 167, "converted": 30 },
      { "period": "2026-06", "leads": 133, "converted": 32 }
    ]
  }
}
```

---

### 15. Analytics

Real-time dashboard and pipeline analytics.

---

#### `GET /analytics/dashboard`

Dashboard summary with key metrics and KPIs.

**Query Parameters:**

| Parameter  | Type   | Description                              |
|------------|--------|------------------------------------------|
| `period`   | string | `today`, `this_week`, `this_month`, `this_quarter`, `this_year` |
| `userId`   | string | Filter by specific user (managers only)  |

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalRevenue": {
        "value": 1847500,
        "change": 0.15,
        "trend": "up"
      },
      "activeDeals": {
        "value": 43,
        "change": 0.08,
        "trend": "up"
      },
      "openLeads": {
        "value": 89,
        "change": -0.05,
        "trend": "down"
      },
      "pipelineValue": {
        "value": 4250000,
        "change": 0.22,
        "trend": "up"
      },
      "conversionRate": {
        "value": 0.159,
        "change": 0.03,
        "trend": "up"
      },
      "averageDealSize": {
        "value": 54338,
        "change": 0.12,
        "trend": "up"
      }
    },
    "recentActivity": [
      {
        "id": "act_x1",
        "type": "deal_created",
        "description": "New deal: Wayne Security Audit ($85K)",
        "user": "Bob Smith",
        "timestamp": "2026-07-20T16:00:00Z"
      },
      {
        "id": "act_x2",
        "type": "deal_stage_changed",
        "description": "Skynet Enterprise License moved to Proposal",
        "user": "Jane Doe",
        "timestamp": "2026-07-19T16:00:00Z"
      },
      {
        "id": "act_x3",
        "type": "invoice_paid",
        "description": "Invoice INV-2026-0041 paid ($46,350)",
        "user": "System",
        "timestamp": "2026-07-15T09:00:00Z"
      }
    ],
    "upcomingTasks": [
      {
        "id": "tsk_m1n2o3p",
        "title": "Follow up on proposal",
        "dueDate": "2026-07-22T17:00:00Z",
        "priority": "high"
      },
      {
        "id": "tsk_u7v8w9x",
        "title": "Prepare demo environment",
        "dueDate": "2026-07-23T12:00:00Z",
        "priority": "high"
      }
    ],
    "topDeals": [
      {
        "id": "dl_u4v5w6x",
        "name": "Skynet Enterprise License",
        "amount": 120000,
        "stage": "Proposal",
        "probability": 65
      },
      {
        "id": "dl_y8z9a0b",
        "name": "Wayne Security Audit",
        "amount": 85000,
        "stage": "Discovery",
        "probability": 30
      }
    ],
    "aiInsights": [
      {
        "type": "opportunity",
        "title": "High-conversion lead detected",
        "message": "John Connor (Skynet) shows 85% engagement score. Recommend immediate follow-up.",
        "entityType": "lead",
        "entityId": "ld_a1b2c3d"
      },
      {
        "type": "risk",
        "title": "Deal at risk",
        "message": "Wayne Security Audit has had no activity in 12 days. Consider re-engagement.",
        "entityType": "deal",
        "entityId": "dl_y8z9a0b"
      }
    ]
  }
}
```

---

#### `GET /analytics/pipeline`

Pipeline analytics with stage breakdown.

**Query Parameters:**

| Parameter  | Type   | Description                              |
|------------|--------|------------------------------------------|
| `pipelineId` | string | Filter by pipeline                     |

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "pipeline": {
      "id": "pl_main",
      "name": "Sales Pipeline"
    },
    "totalValue": 4250000,
    "totalDeals": 43,
    "weightedValue": 2187500,
    "stages": [
      {
        "id": "stg_discovery",
        "name": "Discovery",
        "color": "#f59e0b",
        "dealCount": 12,
        "totalValue": 980000,
        "weightedValue": 196000,
        "averageTimeInStage": 8,
        "conversionRate": 0.75
      },
      {
        "id": "stg_qualification",
        "name": "Qualification",
        "color": "#3b82f6",
        "dealCount": 9,
        "totalValue": 720000,
        "weightedValue": 360000,
        "averageTimeInStage": 6,
        "conversionRate": 0.67
      },
      {
        "id": "stg_proposal",
        "name": "Proposal",
        "color": "#6366f1",
        "dealCount": 11,
        "totalValue": 1450000,
        "weightedValue": 942500,
        "averageTimeInStage": 5,
        "conversionRate": 0.64
      },
      {
        "id": "stg_negotiation",
        "name": "Negotiation",
        "color": "#8b5cf6",
        "dealCount": 7,
        "totalValue": 680000,
        "weightedValue": 476000,
        "averageTimeInStage": 7,
        "conversionRate": 0.71
      },
      {
        "id": "stg_closed_won",
        "name": "Closed Won",
        "color": "#22c55e",
        "dealCount": 4,
        "totalValue": 420000,
        "weightedValue": 420000,
        "averageTimeInStage": 0,
        "conversionRate": 1.0
      }
    ],
    "forecast": {
      "thisMonth": {
        "expectedRevenue": 680000,
        "dealCount": 8,
        "confidence": 0.72
      },
      "nextMonth": {
        "expectedRevenue": 920000,
        "dealCount": 11,
        "confidence": 0.55
      },
      "thisQuarter": {
        "expectedRevenue": 2187500,
        "dealCount": 43,
        "confidence": 0.62
      }
    },
    "velocity": {
      "dealsPerMonth": 7.2,
      "averageCycleDays": 34,
      "averageDealSize": 54338,
      "quotaAttainment": 0.78
    }
  }
}
```

---

### 16. AI

AI-powered features including copilot, lead scoring, email generation, and summarization.

---

#### `POST /ai/copilot`

Interact with the AI copilot for CRM assistance.

**Request Body:**

```json
{
  "message": "What deals are at risk of slipping this quarter?",
  "context": {
    "currentView": "pipeline",
    "userId": "usr_3xk9f2m",
    "organizationId": "org_m4k2n8p"
  },
  "conversationId": "conv_abc123"
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "conversationId": "conv_abc123",
    "messageId": "msg_def456",
    "response": "Based on current pipeline data, I've identified 3 deals at risk of slipping:\n\n1. **Wayne Security Audit** ($85K) — No activity in 12 days, expected close was July 31. Assigned to Bob Smith. Suggest re-engagement call.\n\n2. **Globex Integration** ($45K) — Still in Discovery after 18 days (average is 8). The contact hasn't responded to last 2 emails.\n\n3. **TechCorp Migration** ($120K) — Competitor mentioned in last meeting notes. May need executive sponsor involvement.\n\nWould you like me to draft re-engagement emails for any of these?",
    "suggestions": [
      {
        "type": "action",
        "label": "Draft re-engagement email for Wayne Security Audit",
        "action": "generate_email",
        "params": {
          "dealId": "dl_y8z9a0b",
          "type": "reengagement"
        }
      },
      {
        "type": "action",
        "label": "Assign executive sponsor to TechCorp Migration",
        "action": "assign_executive",
        "params": {
          "dealId": "dl_tc_migration"
        }
      },
      {
        "type": "navigation",
        "label": "View at-risk deals in pipeline",
        "action": "navigate",
        "params": {
          "view": "pipeline",
          "filter": "at_risk"
        }
      }
    ],
    "citations": [
      {
        "type": "deal",
        "id": "dl_y8z9a0b",
        "relevance": "high"
      },
      {
        "type": "deal",
        "id": "dl_globex",
        "relevance": "medium"
      },
      {
        "type": "deal",
        "id": "dl_tc_migration",
        "relevance": "high"
      }
    ],
    "tokensUsed": 842,
    "model": "novacrm-ai-v2"
  }
}
```

---

#### `POST /ai/score-lead`

Calculate or recalculate an AI-powered lead score.

**Request Body:**

```json
{
  "leadId": "ld_a1b2c3d4",
  "factors": true
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "leadId": "ld_a1b2c3d4",
    "previousScore": 72,
    "currentScore": 85,
    "change": 13,
    "factors": [
      {
        "factor": "email_engagement",
        "impact": 15,
        "description": "Opened 8 of 10 emails, clicked 5 links",
        "direction": "positive"
      },
      {
        "factor": "website_activity",
        "impact": 12,
        "description": "Visited pricing page 3 times, viewed enterprise features",
        "direction": "positive"
      },
      {
        "factor": "company_fit",
        "impact": 20,
        "description": "Company size (1200 employees) and revenue ($50M) match ideal customer profile",
        "direction": "positive"
      },
      {
        "factor": "job_title",
        "impact": 10,
        "description": "CTO role indicates decision-making authority",
        "direction": "positive"
      },
      {
        "factor": "response_time",
        "impact": -5,
        "description": "Average email response time is 48 hours (target: 24 hours)",
        "direction": "negative"
      },
      {
        "factor": "geographic_fit",
        "impact": 8,
        "description": "Located in target market (US, West Coast)",
        "direction": "positive"
      }
    ],
    "recommendation": "High-priority lead. Strong fit with enterprise profile. Recommend scheduling a demo within 48 hours.",
    "calculatedAt": "2026-07-20T18:00:00Z"
  }
}
```

---

#### `POST /ai/generate-email`

Generate a personalized email using AI.

**Request Body:**

```json
{
  "type": "follow_up",
  "context": {
    "contactId": "cnt_m8n9o0p",
    "dealId": "dl_u4v5w6x",
    "previousInteraction": "Sent proposal on July 19, no response yet"
  },
  "tone": "professional",
  "length": "medium",
  "customInstructions": "Mention the specific pricing from the proposal and offer to address any questions"
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "subject": "Following Up — Skynet Enterprise License Proposal",
    "body": "Hi John,\n\nI hope this message finds you well. I wanted to follow up on the enterprise license proposal we sent over on July 19th.\n\nThe proposal includes:\n• Enterprise License (Annual): $100,000\n• Premium Support Package: $20,000\n• Total: $120,000 (excluding applicable tax)\n\nI understand evaluating a solution of this scale takes time, and I'm happy to walk through any questions about the proposal, pricing, or how NovaCRM can specifically address Skynet's needs.\n\nWould you have 15 minutes this week for a quick call? I'm available Tuesday or Wednesday afternoon.\n\nLooking forward to hearing from you.\n\nBest regards,\nJane Doe\nSenior Account Executive | NovaCRM",
    "personalizationScore": 0.92,
    "suggestedSendTime": "2026-07-21T09:00:00Z",
    "tokensUsed": 324,
    "model": "novacrm-ai-v2"
  }
}
```

---

#### `POST /ai/summarize`

Generate an AI summary of a record or conversation.

**Request Body:**

```json
{
  "entityType": "deal",
  "entityId": "dl_u4v5w6x",
  "summaryType": "full",
  "maxTokens": 500
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "entityType": "deal",
    "entityId": "dl_u4v5w6x",
    "summary": "## Skynet Enterprise License — Deal Summary\n\n**Value:** $120,000 | **Stage:** Proposal | **Close Date:** Aug 30, 2026\n\n**Overview:** John Connor (CTO, Skynet) expressed interest in an enterprise license after visiting the pricing page multiple times. Lead was qualified on July 16 and has progressed through Discovery → Qualification → Negotiation → Proposal stages.\n\n**Key Activities:**\n- July 15: Lead created from website form\n- July 16: Intro email sent\n- July 18: Discovery call — discussed requirements, budget confirmed at $120K\n- July 19: Proposal sent with enterprise license + premium support\n\n**Current Status:** Proposal sent, awaiting response. No activity since July 19 (2 days).\n\n**Risk Factors:**\n- Response latency — no acknowledgment of proposal yet\n- No competitor concerns identified\n\n**Recommended Actions:**\n1. Follow up on proposal (draft email available)\n2. Schedule demo if not yet conducted\n3. Identify additional stakeholders",
    "keyMetrics": {
      "daysInPipeline": 6,
      "activitiesLogged": 7,
      "stagesCompleted": 4,
      "engagementScore": 85
    },
    "tokensUsed": 456,
    "model": "novacrm-ai-v2"
  }
}
```

---

### 17. Workflows

Workflow automation — create, manage, and execute automated processes.

---

#### `GET /workflows`

List all workflows.

**Query Parameters:**

| Parameter  | Type   | Description                              |
|------------|--------|------------------------------------------|
| `status`   | string | `active`, `draft`, `paused`, `archived` |
| `trigger`  | string | Filter by trigger type                   |

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "wf_k1l2m3n",
      "name": "New Lead Auto-Assignment",
      "description": "Automatically assign new leads based on round-robin within sales teams",
      "status": "active",
      "trigger": {
        "type": "event",
        "event": "lead.created"
      },
      "actionCount": 3,
      "executionCount": 247,
      "lastExecutedAt": "2026-07-20T10:30:00Z",
      "failureRate": 0.008,
      "createdBy": {
        "id": "usr_3xk9f2m",
        "name": "Jane Doe"
      },
      "createdAt": "2026-06-01T10:00:00Z",
      "updatedAt": "2026-07-15T08:00:00Z"
    },
    {
      "id": "wf_o4p5q6r",
      "name": "Deal Stage Notification",
      "description": "Notify team when deals move to critical stages",
      "status": "active",
      "trigger": {
        "type": "event",
        "event": "deal.stage_changed"
      },
      "actionCount": 2,
      "executionCount": 89,
      "lastExecutedAt": "2026-07-19T16:00:00Z",
      "failureRate": 0,
      "createdBy": {
        "id": "usr_3xk9f2m",
        "name": "Jane Doe"
      },
      "createdAt": "2026-06-15T14:00:00Z",
      "updatedAt": "2026-07-01T12:00:00Z"
    },
    {
      "id": "wf_s7t8u9v",
      "name": "Overdue Invoice Reminder",
      "description": "Send reminder emails for invoices past due date",
      "status": "active",
      "trigger": {
        "type": "schedule",
        "cron": "0 9 * * 1-5"
      },
      "actionCount": 2,
      "executionCount": 63,
      "lastExecutedAt": "2026-07-20T09:00:00Z",
      "failureRate": 0.016,
      "createdBy": {
        "id": "usr_3xk9f2m",
        "name": "Jane Doe"
      },
      "createdAt": "2026-07-01T08:00:00Z",
      "updatedAt": "2026-07-01T08:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "totalPages": 1
  }
}
```

---

#### `POST /workflows`

Create a new workflow.

**Request Body:**

```json
{
  "name": "New Lead Auto-Assignment",
  "description": "Automatically assign new leads based on round-robin within sales teams",
  "status": "active",
  "trigger": {
    "type": "event",
    "event": "lead.created"
  },
  "conditions": [
    {
      "field": "source",
      "operator": "in",
      "value": ["website", "referral", "advertisement"]
    },
    {
      "field": "score",
      "operator": "gte",
      "value": 50
    }
  ],
  "actions": [
    {
      "type": "assign_round_robin",
      "params": {
        "teamId": "team_sales",
        "excludeUsers": ["usr_admin"]
      }
    },
    {
      "type": "update_field",
      "params": {
        "field": "status",
        "value": "qualified"
      }
    },
    {
      "type": "send_notification",
      "params": {
        "recipient": "assigned_to",
        "title": "New lead assigned",
        "message": "You have been assigned a new lead: {{lead.firstName}} {{lead.lastName}}",
        "channels": ["push", "email"]
      }
    }
  ]
}
```

**Response — `201 Created`:**

```json
{
  "success": true,
  "data": {
    "id": "wf_w1x2y3z",
    "name": "New Lead Auto-Assignment",
    "status": "active",
    "createdAt": "2026-07-20T19:00:00Z"
  }
}
```

---

#### `GET /workflows/:id`

Get a single workflow with execution history.

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "wf_k1l2m3n",
    "name": "New Lead Auto-Assignment",
    "description": "Automatically assign new leads based on round-robin within sales teams",
    "status": "active",
    "trigger": {
      "type": "event",
      "event": "lead.created"
    },
    "conditions": [
      {
        "field": "source",
        "operator": "in",
        "value": ["website", "referral", "advertisement"]
      }
    ],
    "actions": [
      {
        "type": "assign_round_robin",
        "params": {
          "teamId": "team_sales"
        }
      }
    ],
    "stats": {
      "executionCount": 247,
      "successCount": 245,
      "failureCount": 2,
      "averageExecutionTimeMs": 340,
      "lastExecutedAt": "2026-07-20T10:30:00Z"
    },
    "recentExecutions": [
      {
        "id": "exec_a1",
        "triggeredBy": "lead.ld_new123",
        "status": "success",
        "executedAt": "2026-07-20T10:30:00Z",
        "durationMs": 312
      },
      {
        "id": "exec_a2",
        "triggeredBy": "lead.ld_new122",
        "status": "success",
        "executedAt": "2026-07-19T14:15:00Z",
        "durationMs": 298
      },
      {
        "id": "exec_a3",
        "triggeredBy": "lead.ld_new121",
        "status": "failure",
        "executedAt": "2026-07-19T11:00:00Z",
        "durationMs": 156,
        "error": "No available users in team_sales for round-robin"
      }
    ],
    "createdBy": {
      "id": "usr_3xk9f2m",
      "name": "Jane Doe"
    },
    "createdAt": "2026-06-01T10:00:00Z",
    "updatedAt": "2026-07-15T08:00:00Z"
  }
}
```

---

#### `PUT /workflows/:id`

Update a workflow.

**Request Body:**

```json
{
  "status": "paused",
  "conditions": [
    {
      "field": "source",
      "operator": "in",
      "value": ["website", "referral", "advertisement", "event"]
    }
  ]
}
```

---

#### `DELETE /workflows/:id`

Archive a workflow.

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "Workflow archived"
  }
}
```

---

#### `POST /workflows/:id/execute`

Manually trigger a workflow execution.

**Request Body:**

```json
{
  "context": {
    "leadId": "ld_manual123",
    "source": "manual_test"
  }
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "executionId": "exec_b1",
    "status": "success",
    "actionsCompleted": 3,
    "durationMs": 287,
    "executedAt": "2026-07-20T19:15:00Z"
  }
}
```

---

### 18. Settings

Organization and user settings management.

---

#### `GET /settings`

Get current organization settings.

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "organization": {
      "id": "org_m4k2n8p",
      "name": "Acme Corp",
      "timezone": "America/New_York",
      "locale": "en-US",
      "currency": "USD",
      "dateFormat": "MM/DD/YYYY",
      "timeFormat": "12h"
    },
    "branding": {
      "logo": "https://cdn.novacrm.io/logos/org_m4k2n8p.png",
      "primaryColor": "#6366f1",
      "accentColor": "#3b82f6"
    },
    "notifications": {
      "emailNotifications": true,
      "pushNotifications": true,
      "dailyDigest": true,
      "digestTime": "08:00",
      "weeklyReport": true
    },
    "features": {
      "aiCopilot": true,
      "advancedReporting": true,
      "workflowAutomation": true,
      "customFields": true,
      "apiAccess": true,
      "ssoEnabled": false
    },
    "integrations": [
      {
        "provider": "google",
        "type": "calendar",
        "status": "connected",
        "connectedAt": "2026-06-15T10:00:00Z"
      },
      {
        "provider": "stripe",
        "type": "payments",
        "status": "connected",
        "connectedAt": "2026-07-01T08:00:00Z"
      },
      {
        "provider": "slack",
        "type": "notifications",
        "status": "disconnected"
      }
    ],
    "pipeline": {
      "id": "pl_main",
      "name": "Sales Pipeline",
      "stages": [
        { "id": "stg_discovery", "name": "Discovery", "order": 1, "color": "#f59e0b", "probability": 10 },
        { "id": "stg_qualification", "name": "Qualification", "order": 2, "color": "#3b82f6", "probability": 25 },
        { "id": "stg_proposal", "name": "Proposal", "order": 3, "color": "#6366f1", "probability": 50 },
        { "id": "stg_negotiation", "name": "Negotiation", "order": 4, "color": "#8b5cf6", "probability": 75 },
        { "id": "stg_closed_won", "name": "Closed Won", "order": 5, "color": "#22c55e", "probability": 100 },
        { "id": "stg_closed_lost", "name": "Closed Lost", "order": 6, "color": "#ef4444", "probability": 0 }
      ]
    }
  }
}
```

---

#### `PUT /settings`

Update organization settings.

**Request Body:**

```json
{
  "organization": {
    "timezone": "America/Chicago",
    "currency": "EUR"
  },
  "notifications": {
    "dailyDigest": false,
    "weeklyReport": true
  },
  "branding": {
    "primaryColor": "#4f46e5"
  }
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "organization": {
      "timezone": "America/Chicago",
      "currency": "EUR"
    },
    "notifications": {
      "dailyDigest": false,
      "weeklyReport": true
    },
    "branding": {
      "primaryColor": "#4f46e5"
    },
    "updatedAt": "2026-07-20T19:30:00Z"
  },
  "meta": {
    "message": "Settings updated successfully"
  }
}
```

---

## Status Codes

| Code | Meaning                    | Description                                          |
|------|----------------------------|------------------------------------------------------|
| `200` | OK                        | Request succeeded                                    |
| `201` | Created                   | Resource created successfully                        |
| `202` | Accepted                  | Request accepted for async processing                |
| `204` | No Content                | Request succeeded, no response body                  |
| `400` | Bad Request               | Invalid request syntax or parameters                 |
| `401` | Unauthorized              | Authentication required or token invalid/expired     |
| `403` | Forbidden                 | Authenticated but insufficient permissions          |
| `404` | Not Found                 | Requested resource does not exist                    |
| `409` | Conflict                  | Resource conflict (duplicate, version mismatch)      |
| `422` | Unprocessable Entity      | Request is semantically invalid                      |
| `429` | Too Many Requests         | Rate limit exceeded — retry after `Retry-After` time |
| `500` | Internal Server Error     | Unexpected server error                              |
| `502` | Bad Gateway               | Upstream service error                               |
| `503` | Service Unavailable       | Service temporarily unavailable (maintenance/overload) |

---

## Changelog

| Version | Date       | Changes                                              |
|---------|------------|------------------------------------------------------|
| 1.0.0   | 2026-07-20 | Initial release — 18 modules, full CRUD operations   |
