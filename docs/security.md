# Security Documentation

## NovaCRM AI — Enterprise AI-Powered CRM Platform

**Version:** 1.0  
**Last Updated:** July 2026  
**Classification:** Internal — Security Team

---

## Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Password Security](#2-password-security)
3. [JWT Security](#3-jwt-security)
4. [CORS Configuration](#4-cors-configuration)
5. [Input Validation](#5-input-validation)
6. [Rate Limiting](#6-rate-limiting)
7. [XSS Prevention](#7-xss-prevention)
8. [CSRF Protection](#8-csrf-protection)
9. [SQL Injection Prevention](#9-sql-injection-prevention)
10. [Secrets Management](#10-secrets-management)
11. [HTTPS Enforcement](#11-https-enforcement)
12. [Security Headers (Helmet.js)](#12-security-headers-helmetjs)
13. [Session Management](#13-session-management)
14. [IP Restrictions](#14-ip-restrictions)
15. [Data Encryption](#15-data-encryption)
16. [Audit Logging](#16-audit-logging)
17. [OWASP Top 10 Compliance](#17-owasp-top-10-compliance)
18. [Incident Response Plan](#18-incident-response-plan)

---

## 1. Authentication & Authorization

### Authentication Flow

`
Client → POST /api/auth/login → Server validates credentials → Issues JWT access token + HTTP-only refresh cookie → Client stores access token in memory → Refresh flow via cookie
`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Email + password authentication |
| POST | /api/auth/register | New user registration with email verification |
| POST | /api/auth/refresh | Refresh access token via HTTP-only cookie |
| POST | /api/auth/logout | Invalidate refresh token |
| POST | /api/auth/forgot-password | Send password reset email |
| POST | /api/auth/reset-password | Reset password with token |
| POST | /api/auth/mfa/setup | Enable MFA (TOTP) |
| POST | /api/auth/mfa/verify | Verify MFA code |
| POST | /api/auth/oauth/:provider | Social login (Google, Microsoft, GitHub, LinkedIn) |

### Role-Based Access Control (RBAC)

| Role | Scope | Permissions |
|------|-------|-------------|
| Super Admin | System-wide | Full access, tenant management, billing |
| Organization Admin | Organization | User management, settings, all modules |
| Sales Manager | Team | Team performance, deal assignment, reports |
| Sales Executive | Personal | Leads, contacts, deals, tasks |
| Marketing Manager | Department | Campaigns, email marketing, analytics |
| Support Agent | Department | Tickets, knowledge base, customer portal |
| Finance | Organization | Invoices, payments, subscriptions, refunds |
| HR | Organization | Employee data, access management |
| Viewer | Organization | Read-only access to assigned modules |

### Permission Model

Permissions follow a hierarchical structure:

`
System > Organization > Department > Team > Individual
`

Each permission is defined as a string in the format: module:action (e.g., leads:create, deals:delete). Permissions are assigned to roles, and roles are assigned to users.

---

## 2. Password Security

### Hashing Algorithm

- **Algorithm:** bcrypt
- **Salt Rounds:** 12
- **Library:** bcrypt (Node.js)

### Password Policy

| Requirement | Value |
|-------------|-------|
| Minimum length | 12 characters |
| Maximum length | 128 characters |
| Uppercase letters | At least 1 |
| Lowercase letters | At least 1 |
| Numbers | At least 1 |
| Special characters | At least 1 |
| Password history | Last 10 passwords blocked |
| Maximum failed attempts | 5 before temporary lockout |
| Lockout duration | 15 minutes |
| Password expiry | 90 days |
| Force change on first login | Yes |
| Common password check | Yes (against 10k most common passwords) |

### Password Reset Flow

1. User requests password reset via /api/auth/forgot-password
2. Server generates a cryptographically secure random token (256 bits via crypto.randomBytes(32))
3. Token hash is stored in database with 15-minute expiry
4. Email sent with reset link containing raw token
5. User clicks link → token verified against hash → password reset form shown
6. New password validated against policy before update

---

## 3. JWT Security

### Token Strategy

| Property | Access Token | Refresh Token |
|----------|-------------|---------------|
| Storage | In-memory (JavaScript variable) | HTTP-only, Secure, SameSite=Strict cookie |
| Lifetime | 15 minutes | 7 days |
| Rotation | N/A | Rotated on each use |
| Reuse detection | N/A | Old refresh tokens invalidated on rotation |
| Signature algorithm | RS256 | RS256 |

### Access Token Payload

`json
{
  "sub": "user_uuid",
  "orgId": "org_uuid",
  "role": "sales_executive",
  "permissions": ["leads:read", "leads:write", "deals:read"],
  "iat": 1680000000,
  "exp": 1680000900,
  "jti": "unique-token-id"
}
`

### Refresh Token Cookie Configuration

`	ypescript
const refreshCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
`

### Key Management

- RSA key pair (RS256) generated at deployment
- Private key stored in environment variable JWT_PRIVATE_KEY (base64-encoded)
- Public key stored in JWT_PUBLIC_KEY
- Key rotation supported via kid (key ID) header
- Old keys retained for token validation during rotation period

---

## 4. CORS Configuration

### Allowed Origins

`	ypescript
const corsOptions = {
  origin: [
    'https://app.novacrm.ai',
    'https://admin.novacrm.ai',
    'https://api.novacrm.ai',
    /\.novacrm\.ai$/,
    'https://localhost:5173',
    'https://staging.novacrm.ai',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token', 'X-API-Key'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  credentials: true,
  maxAge: 86400,
};
`

### Environment-Specific Rules

| Environment | CORS Policy |
|-------------|-------------|
| Production | Strict whitelist: ['https://app.novacrm.ai', 'https://admin.novacrm.ai'] |
| Staging | Whitelist includes staging URLs |
| Development | Localhost allowed |

---

## 5. Input Validation

### Zod Schema Validation

All API inputs are validated using Zod schemas before reaching route handlers.

### Validation Rules by Data Type

| Data Type | Validation Rules |
|-----------|-----------------|
| Email | Valid format, max 255 chars, lowercase, trimmed |
| Phone | E.164 format, min 7 digits, max 15 digits |
| URLs | Valid URL format, protocol required, domain whitelist |
| UUIDs | Valid UUID v4 format |
| Dates | ISO 8601 format, within reasonable range |
| Monetary values | Non-negative, max 2 decimal places, within bounds |
| Text fields | Sanitized HTML stripped, max length enforced |
| File uploads | Type whitelist, size limit (10MB), virus scan |

### Example Schema

`	ypescript
const createLeadSchema = z.object({
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  email: z.string().email().max(255).toLowerCase().trim(),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/).optional(),
  company: z.string().max(200).trim().optional(),
  source: z.enum(['WEBSITE', 'REFERRAL', 'SOCIAL', 'COLD_CALL', 'EVENT', 'OTHER']),
  notes: z.string().max(5000).trim().optional(),
  assignedTo: z.string().uuid().optional(),
});
`

---

## 6. Rate Limiting

### Tiered Rate Limiting

| Tier | Scope | Limit | Window | Burst |
|------|-------|-------|--------|-------|
| Global | All requests (per IP) | 1000 | 1 minute | 1500 |
| Authentication | /api/auth/* (per IP) | 10 | 15 minutes | 15 |
| Login attempts | /api/auth/login (per user) | 5 | 15 minutes | N/A |
| Registration | /api/auth/register (per IP) | 3 | 1 hour | N/A |
| Password reset | /api/auth/forgot-password (per email) | 3 | 1 hour | N/A |
| MFA verification | /api/auth/mfa/verify (per user) | 5 | 15 minutes | N/A |
| API endpoints | /api/* (per user) | 300 | 1 minute | 450 |
| AI endpoints | /api/ai/* (per user) | 20 | 1 minute | 30 |
| Webhook endpoints | /api/webhooks/* (per IP) | 100 | 1 minute | 150 |
| File upload | /api/files/upload (per user) | 10 | 1 minute | N/A |

### Response Headers

Every API response includes rate limit headers:

`
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 287
X-RateLimit-Reset: 1680000900
Retry-After: 45
`

### Bypass Rules

- Internal service accounts (API keys with service scope) bypass rate limits
- Rate limits are per-user for authenticated endpoints, per-IP for unauthenticated endpoints
- Rate limits are configurable per organization by Super Admin

---

## 7. XSS Prevention

### Input Sanitization

All user-generated content is sanitized before storage and rendering using DOMPurify. Allowed HTML tags are restricted to safe elements (b, i, em, strong, a, p, br, ul, ol, li). All event handler attributes (onclick, onerror, etc.) are stripped. Script tags, iframes, and object/embed elements are forbidden.

### Content Security Policy (CSP)

`
default-src 'self'
script-src 'self' 'strict-dynamic' 'nonce-{random}'
style-src 'self' 'unsafe-inline'
img-src 'self' data: https: blob:
font-src 'self' https://fonts.googleapis.com
connect-src 'self' https://api.novacrm.ai
frame-src 'none'
object-src 'none'
base-uri 'self'
form-action 'self'
`

### Frontend Protections

- React's built-in JSX escaping prevents injection in rendered content
- dangerouslySetInnerHTML is banned by ESLint rule
- All URLs are validated with the URL constructor before use in href or src attributes

---

## 8. CSRF Protection

### Strategy

NovaCRM uses a dual-layer CSRF protection approach:

1. **SameSite Cookies:** All cookies use SameSite=Strict or SameSite=Lax
2. **CSRF Tokens:** State-changing requests (POST, PUT, PATCH, DELETE) require a CSRF token

### CSRF Token Flow

1. Frontend requests CSRF token via GET /api/auth/csrf-token
2. Server returns token in response body AND sets it as an HTTP-only cookie with SameSite=Strict
3. Frontend includes token in X-CSRF-Token header for all state-changing requests
4. Server validates that header value matches cookie value

### Additional Protections

- Custom headers required for AJAX requests (X-Requested-With: XMLHttpRequest)
- CORS restricted to known origins
- SameSite=Strict on all authentication cookies

---

## 9. SQL Injection Prevention

### Prisma ORM

NovaCRM uses Prisma ORM which inherently protects against SQL injection through parameterized queries. All queries use Prisma's type-safe query builder, which automatically parameterizes inputs.

### Raw Queries (When Necessary)

When raw SQL is required for complex reporting, template literal tagged queries are enforced:

`sql
SELECT u.id, u.email, COUNT(l.id) as lead_count
FROM "User" u
LEFT JOIN "Lead" l ON l.assigned_to = u.id
WHERE u.organization_id = 
GROUP BY u.id, u.email
`

Parameters are always passed separately, never interpolated into the SQL string.

### Database Hardening

- Application database user has minimum required permissions (SELECT, INSERT, UPDATE, DELETE on specific tables)
- No DDL permissions for the application user
- Database connections use TLS 1.3
- Connection pooling limits concurrent connections
- Query timeout set at 30 seconds

---

## 10. Secrets Management

### Environment Variables

All secrets are stored in environment variables, never in code. Production secrets are injected via Vercel's encrypted environment variable system.

### Secret Management Policies

| Policy | Implementation |
|--------|---------------|
| No secrets in code | ESLint rule enforcing env-var access only in config files |
| No secrets in logs | Secret patterns redacted by logger middleware |
| .env files in .gitignore | All .env* files excluded from version control |
| Secret rotation | Quarterly rotation enforced, emergency rotation on compromise |
| Access control | Secrets management restricted to DevOps team |
| Audit trail | All secret access logged |

### Production Secret Delivery

- **Vercel:** Secrets injected via Vercel Environment Variables (encrypted at rest)
- **AWS Parameter Store:** For non-Vercel deployments with KMS encryption
- **HashiCorp Vault:** Planned for enterprise deployments (v2.0+)

---

## 11. HTTPS Enforcement

### TLS Configuration

- Minimum TLS version: TLS 1.2
- Preferred TLS version: TLS 1.3
- HSTS max-age: 2 years (63072000 seconds)
- HSTS includeSubDomains: Yes
- HSTS preload: Yes
- Cipher suites: Only AEAD ciphers (GCM/ChaCha20)
- Weak ciphers: All RC4, 3DES, CBC-mode ciphers disabled

All HTTP traffic is redirected to HTTPS in production via middleware that checks the x-forwarded-proto header.

### Certificate Management

- Certificates issued via Let's Encrypt with automatic renewal
- Auto-renewal via certbot (weekly check)
- Monitoring alerts 30, 14, and 7 days before expiry
- Wildcard certificate for *.novacrm.ai

---

## 12. Security Headers (Helmet.js)

### Header Configuration

NovaCRM uses Helmet.js to set secure HTTP headers:

| Header | Value | Purpose |
|--------|-------|---------|
| Content-Security-Policy | (see XSS section) | Prevents XSS and data injection |
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload | Enforces HTTPS |
| X-Content-Type-Options | nosniff | Prevents MIME type sniffing |
| X-Frame-Options | DENY | Prevents clickjacking |
| X-XSS-Protection | 1; mode=block | Legacy XSS filter |
| Referrer-Policy | strict-origin-when-cross-origin | Controls referrer header |
| Permissions-Policy | camera=(), microphone=(), geolocation=() | Restricts browser features |
| Cross-Origin-Embedder-Policy | require-corp | Resource isolation |
| Cross-Origin-Opener-Policy | same-origin | Window isolation |

---

## 13. Session Management

### Session Timeout

| Session Type | Timeout | Action |
|-------------|---------|--------|
| Access token | 15 minutes | Silent refresh via refresh token |
| Refresh token | 7 days | User must re-authenticate |
| Idle session | 30 minutes | Inactivity detected, session locked |
| Absolute session | 12 hours | Force re-authentication |

### Idle Session Detection

Idle session detection is implemented server-side using Redis. Each authenticated request updates a timestamp in Redis. If the last activity timestamp exceeds 30 minutes, the refresh token is invalidated and the user is redirected to login. The frontend also monitors user activity (mouse movements, clicks, keypresses) and sends heartbeat signals.

### Concurrent Session Policy

- Maximum 5 concurrent sessions per user
- New session beyond limit triggers oldest session invalidation
- Users can view and revoke active sessions from Settings > Security
- Session revocation alerts sent via email

---

## 14. IP Restrictions

### Configurable IP Whitelist

Administrators can configure IP whitelists at the organization level. When enabled, access to the platform is restricted to requests originating from whitelisted IP addresses or CIDR ranges.

### Implementation

`	ypescript
interface IPRestriction {
  enabled: boolean;
  whitelist: string[];       // IPs and CIDR ranges
  strictMode: boolean;        // Block all non-whitelisted IPs
  exemptPaths: string[];     // Paths exempt from IP restrictions
  exemptRoles: string[];     // Roles exempt from IP restrictions
}
`

### IP Restriction Tiers

| Tier | Scope | Configuration |
|------|-------|---------------|
| System | Global | All organizations (Super Admin only) |
| Organization | Per-org | Organization-level whitelist |
| User | Per-user | User-specific allow/block list |

### Geolocation Blocking

- Option to block countries by ISO code
- IP geolocation via MaxMind GeoIP2 database
- Database updated monthly

---

## 15. Data Encryption

### Encryption at Rest

| Data Layer | Encryption Method |
|-----------|------------------|
| PostgreSQL | AES-256 (TDE), encrypted EBS volumes |
| Redis | AES-256, TLS-enabled connections |
| File Storage | AES-256-GCM server-side encryption (S3-compatible) |
| Backups | AES-256 encryption before storage |
| Secrets | KMS envelope encryption |

### Encryption in Transit

| Connection | Protocol | Cipher |
|-----------|----------|--------|
| Client → Server | TLS 1.3 | TLS_AES_256_GCM_SHA384 |
| API → Database | TLS 1.3 | TLS_CHACHA20_POLY1305_SHA256 |
| API → Redis | TLS 1.2+ | ECDHE-RSA-AES256-GCM |
| API → Third-party | TLS 1.2+ | Strongest mutual cipher |
| Internal services | mTLS | Mutual TLS authentication |

### Application-Level Encryption

Sensitive fields (SSN, credit card numbers, API keys) are encrypted at the application layer before storage using AES-256-GCM with a separate encryption key. Decryption occurs only when needed and is audited.

`	ypescript
// Encryption service pattern
const encrypted = encrypt(plaintext, ENCRYPTION_KEY);
// stored in database as base64-encoded ciphertext
const decrypted = decrypt(encrypted, ENCRYPTION_KEY);
// used only in memory, never logged
`

---

## 16. Audit Logging

### Logged Events

All security-relevant events are logged with the following structure:

| Category | Events Logged |
|----------|--------------|
| Authentication | Login, logout, failed login, MFA setup/verify, password reset |
| Authorization | Permission changes, role changes, access denied |
| Data Access | View/export sensitive data, bulk operations |
| Data Changes | Create/update/delete on all major entities |
| Configuration | Settings changes, security policy changes |
| Admin Actions | User management, organization changes |
| API Access | API key usage, rate limit hits |

### Audit Log Structure

`json
{
  "id": "audit_uuid",
  "timestamp": "2026-07-20T10:30:00Z",
  "actor": {
    "userId": "user_uuid",
    "email": "user@example.com",
    "role": "admin",
    "ip": "203.0.113.1",
    "userAgent": "Mozilla/5.0..."
  },
  "action": "user.login",
  "resource": {
    "type": "session",
    "id": "session_uuid"
  },
  "context": {
    "organizationId": "org_uuid",
    "correlationId": "req_uuid"
  },
  "outcome": "success",
  "details": {}
}
`

### Audit Log Storage

- Stored in PostgreSQL audit_logs table (append-only, insert-only)
- Partitioned by month for performance
- Retention: 7 years (compliance), 1 year for non-critical events
- Immutable: audit logs cannot be deleted or modified
- Exportable to SIEM systems via syslog or webhook

### Audit Log Viewer

Available in Settings > Security > Audit Logs with filtering by:
- Date range
- Actor
- Action type
- Resource type
- Outcome (success/failure)
- IP address

---

## 17. OWASP Top 10 Compliance

### A01:2021 – Broken Access Control

| Control | Implementation |
|---------|---------------|
| RBAC | Role-based access control with granular permissions |
| Deny by default | All endpoints require explicit permission grant |
| CORS | Strict origin whitelist |
| JWT validation | Token signature + expiry + permission verification |
| IDOR prevention | Resource ownership verification on all endpoints |

### A02:2021 – Cryptographic Failures

| Control | Implementation |
|---------|---------------|
| TLS 1.3 | All traffic encrypted in transit |
| AES-256-GCM | Data encrypted at rest |
| bcrypt (12 rounds) | Password hashing |
| RS256 | JWT signing |
| Key rotation | Quarterly key rotation policy |

### A03:2021 – Injection

| Control | Implementation |
|---------|---------------|
| Prisma ORM | Parameterized queries prevent SQL injection |
| Zod validation | Input validation on all endpoints |
| DOMPurify | HTML sanitization prevents XSS |
| No eval() | Dynamic code execution is banned |

### A04:2021 – Insecure Design

| Control | Implementation |
|---------|---------------|
| Rate limiting | Per-endpoint, per-user, per-IP limits |
| MFA | TOTP-based multi-factor authentication |
| Session management | 30-min idle timeout, 12-hour absolute timeout |
| Security review | All features undergo security review before release |

### A05:2021 – Security Misconfiguration

| Control | Implementation |
|---------|---------------|
| Helmet.js | Secure HTTP headers automatically applied |
| Automated scanning | Daily security scans with Trivy |
| Infrastructure as Code | All configurations version-controlled |
| Environment separation | Development/staging/production isolation |

### A06:2021 – Vulnerable and Outdated Components

| Control | Implementation |
|---------|---------------|
| Dependabot | Automated dependency update PRs |
| Weekly audits | npm audit run on CI |
| Version pinning | Exact versions in package.json |
| Snyk | Continuous vulnerability monitoring |

### A07:2021 – Identification and Authentication Failures

| Control | Implementation |
|---------|---------------|
| bcrypt | Secure password hashing |
| Rate limiting | Login attempt throttling |
| MFA | TOTP mandatory for admin roles |
| Session management | Secure cookie configuration |
| Password policy | 12-char minimum, complexity requirements |

### A08:2021 – Software and Data Integrity Failures

| Control | Implementation |
|---------|---------------|
| Subresource Integrity | SRI hashes on all CDN resources |
| npm package signing | Package integrity verification |
| CI/CD pipeline | Code signing and verification |
| Deployment approval | Required for production deployments |

### A09:2021 – Security Logging and Monitoring Failures

| Control | Implementation |
|---------|---------------|
| Audit logging | Comprehensive event logging |
| Real-time alerts | Slack notifications for security events |
| SIEM integration | Syslog export capability |
| Log retention | 7 years for compliance, 1 year for operational |

### A10:2021 – Server-Side Request Forgery (SSRF)

| Control | Implementation |
|---------|---------------|
| URL whitelist | Outbound requests limited to approved domains |
| URL validation | Strict URL parsing and validation |
| Network isolation | Backend services on isolated VPC |
| No raw URL input | SSRF attempts blocked at network level |

---

## 18. Incident Response Plan

### Severity Levels

| Level | Definition | Response Time |
|-------|-----------|---------------|
| SEV-1 | Critical: Data breach, system compromise, RCE | 15 minutes |
| SEV-2 | High: Authentication bypass, privilege escalation | 1 hour |
| SEV-3 | Medium: XSS, CSRF, information disclosure | 4 hours |
| SEV-4 | Low: Minor misconfiguration, policy violation | 24 hours |

### Response Process

1. **Detection:** Automated monitoring alerts, user reports, penetration tests
2. **Triage:** Confirm vulnerability, assess severity, assign incident lead
3. **Containment:** Block affected endpoints, rotate keys, isolate systems
4. **Eradication:** Deploy fix, verify patch, scan for persistence
5. **Recovery:** Restore from clean backup, validate functionality
6. **Post-mortem:** Root cause analysis, timeline, improvements

### Communication Channels

- **Internal:** #security-alerts Slack channel (P1/P2)
- **Engineering:** #eng-security Slack channel
- **Management:** Email notification to CTO/CEO (SEV-1 only)
- **Customers:** Status page update for service-impacting incidents
- **Regulatory:** Data protection authority notification within 72 hours (GDPR)

---

*This document is maintained by the NovaCRM Security Team. Last reviewed: July 2026.*
