# NovaCRM AI — Authentication Guide

> **Version:** 1.0.0
> **Last Updated:** 2026-07-20

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication Architecture](#authentication-architecture)
3. [JWT Token Structure](#jwt-token-structure)
4. [Registration Flow](#registration-flow)
5. [Login Flow](#login-flow)
6. [Token Refresh Mechanism](#token-refresh-mechanism)
7. [Password Reset Flow](#password-reset-flow)
8. [Two-Factor Authentication (2FA/MFA)](#two-factor-authentication-2famfa)
9. [Magic Link Authentication](#magic-link-authentication)
10. [Social OAuth Login](#social-oauth-login)
11. [Session Management](#session-management)
12. [Device Management](#device-management)
13. [Security Considerations](#security-considerations)
14. [API Reference](#api-reference)

---

## Overview

NovaCRM AI uses a dual-token JWT authentication system with short-lived access tokens and long-lived refresh tokens. The system supports multiple authentication methods including email/password, social OAuth, magic links, and two-factor authentication.

### Key Properties

| Property                     | Value                                              |
|------------------------------|----------------------------------------------------|
| Access Token Lifetime        | 15 minutes                                         |
| Refresh Token Lifetime       | 7 days                                              |
| Token Algorithm              | RS256 (RSA Signature with SHA-256)                 |
| Refresh Token Rotation       | Enabled (single-use tokens)                        |
| Maximum Sessions Per User    | 10                                                  |
| Password Hashing             | bcrypt (cost factor 12)                            |
| Email Verification Required  | Yes                                                 |
| Account Lockout Threshold    | 5 failed attempts                                  |
| Account Lockout Duration     | 30 minutes                                          |

---

## Authentication Architecture

```
+--------------------+       +-------------------+       +------------------+
|   Client (React)   | <-->  |   API Gateway     | <-->  |   Auth Service   |
|   Frontend App     |       |   Rate Limiter    |       |   JWT Issuer     |
+--------------------+       |   CORS Handler    |       |   Token Store    |
                             +-------------------+       +------------------+
                                      |                          |
                                      v                          v
                             +-------------------+       +------------------+
                             |   Load Balancer   |       |   Redis Cache    |
                             |   SSL Termination |       |   Session Store  |
                             +-------------------+       +------------------+
```

The authentication flow consists of:

1. **Client** sends credentials to the API Gateway
2. **API Gateway** applies rate limiting and CORS checks, then forwards to Auth Service
3. **Auth Service** validates credentials, issues JWT tokens, and stores session data
4. **Redis Cache** stores active sessions, refresh token allow/deny lists, and rate limit counters
5. Subsequent requests use the Bearer token, validated at the API Gateway without hitting Auth Service

---

## JWT Token Structure

### Access Token (RS256)

The access token is a signed JWT containing user identity and authorization claims. It expires after **15 minutes**.

**Header:**

```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "nova-key-2026-07"
}
```

**Payload:**

```json
{
  "sub": "usr_3xk9f2m",
  "iss": "https://auth.novacrm.io",
  "aud": "https://api.novacrm.io",
  "exp": 1721473800,
  "iat": 1721472900,
  "jti": "tok_a1b2c3d4e5",
  "org_id": "org_m4k2n8p",
  "role": "organization_admin",
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
  ],
  "email": "jane@acme.com",
  "mfa_verified": true,
  "session_id": "ses_p2o9i8u7"
}
```

**Claims Reference:**

| Claim          | Type     | Description                                    |
|----------------|----------|------------------------------------------------|
| `sub`          | string   | User ID (`usr_...`)                            |
| `iss`          | string   | Token issuer (Auth service URL)                |
| `aud`          | string   | Token audience (API gateway URL)               |
| `exp`          | number   | Expiration time (Unix timestamp)               |
| `iat`          | number   | Issued-at time (Unix timestamp)                |
| `jti`          | string   | Unique token ID (for revocation)               |
| `org_id`       | string   | Organization scope                             |
| `role`         | string   | Primary role identifier                        |
| `permissions`  | string[] | Array of granted permission strings            |
| `email`        | string   | User email address                             |
| `mfa_verified` | boolean  | Whether MFA was completed for this session     |
| `session_id`   | string   | Session identifier (links to Redis session)    |

### Refresh Token

Refresh tokens are opaque strings (not JWTs) with the prefix `rt_`. They are stored server-side in Redis and mapped to a session record.

**Refresh Token Record (Redis):**

```json
{
  "tokenId": "rt_8f7e6d5c4b3a2",
  "userId": "usr_3xk9f2m",
  "sessionId": "ses_p2o9i8u7",
  "organizationId": "org_m4k2n8p",
  "deviceFingerprint": "fp AppleWebKit Chrome Mac OS",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/126.0.0.0",
  "createdAt": "2026-07-20T10:30:00Z",
  "expiresAt": "2026-07-27T10:30:00Z",
  "lastUsedAt": "2026-07-20T10:30:00Z",
  "isRevoked": false,
  "family": "fam_x1y2z3"
}
```

The `family` field links all refresh tokens issued from the same original login. If a revoked token is reused (possible token theft), all tokens in that family are immediately revoked and the user is notified.

---

## Registration Flow

```
User                    Frontend                 Backend                 Email Service
 |                         |                        |                        |
 |  Enter registration    |                        |                        |
 |  details               |                        |                        |
 |------------------------>|                        |                        |
 |                         |  POST /auth/register  |                        |
 |                         |----------------------->|                        |
 |                         |                        |  Validate input        |
 |                         |                        |  Check email unique    |
 |                         |                        |  Hash password (bcrypt)|
 |                         |                        |  Create user record    |
 |                         |                        |  Generate verify token |
 |                         |                        |  Issue JWT tokens      |
 |                         |                        |----------------------->|
 |                         |  201 + tokens          |  Send verification     |
 |                         |<-----------------------|  email                 |
 |  Display success +     |                        |                        |
 |  verification banner   |                        |                        |
 |<------------------------|                        |                        |
 |                         |                        |                        |
 |  Click verification    |                        |                        |
 |  link in email         |                        |                        |
 |  (opens /verify?token) |                        |                        |
 |------------------------>|                        |                        |
 |                         |  POST /auth/verify-   |                        |
 |                         |  email                 |                        |
 |                         |----------------------->|                        |
 |                         |                        |  Validate token        |
 |                         |                        |  Mark email verified   |
 |                         |  200 OK                |                        |
 |                         |<-----------------------|                        |
 |  Show verified status  |                        |                        |
 |<------------------------|                        |                        |
```

### Registration Request

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "jane@acme.com",
  "password": "SecureP@ss123",
  "firstName": "Jane",
  "lastName": "Doe",
  "organizationName": "Acme Corp",
  "role": "organization_admin"
}
```

### Password Validation Rules

| Rule                          | Requirement                                    |
|-------------------------------|------------------------------------------------|
| Minimum length                | 8 characters                                   |
| Maximum length                | 128 characters                                 |
| Uppercase letters             | At least 1                                     |
| Lowercase letters             | At least 1                                     |
| Numbers                       | At least 1                                     |
| Special characters            | At least 1 (`!@#$%^&*()_+-=[]{}|;:,.<>?`)     |
| Common password check         | Checked against HaveIBeenPwned password list   |
| Sequential characters         | Max 3 consecutive same-type characters         |

### Registration Response

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

### Verification Email Content

The verification email contains a link in the format:

```
https://app.novacrm.io/verify?token=ev_x1y2z3w4v5u6t7s8r9q0p
```

The token expires after **24 hours**. Users can request a new verification email via `POST /auth/resend-verification`.

---

## Login Flow

### Email/Password Login

```
User                    Frontend                 Backend                 Redis
 |                         |                        |                       |
 |  Enter credentials      |                        |                       |
 |------------------------>|                        |                       |
 |                         |  POST /auth/login      |                       |
 |                         |----------------------->|                       |
 |                         |                        |  Find user by email   |
 |                         |                        |  Check lockout status |
 |                         |                        |  Verify password hash |
 |                         |                        |  (bcrypt compare)     |
 |                         |                        |                       |
 |                         |                        |  [If 2FA enabled:]    |
 |                         |  200 + tempToken       |  Issue temp token     |
 |                         |  (2FA required)        |  (5 min expiry)       |
 |                         |<-----------------------|                       |
 |  Show 2FA input form    |                        |                       |
 |<------------------------|                        |                       |
 |                         |                        |                       |
 |  Enter TOTP code        |                        |                       |
 |------------------------>|                        |                       |
 |                         |  POST /auth/verify-2fa |                       |
 |                         |----------------------->|                       |
 |                         |                        |  Verify TOTP code     |
 |                         |                        |  Issue full tokens    |
 |                         |                        |  Create session       |
 |                         |  200 + tokens          |                       |
 |                         |  (full access)         |  Store refresh token  |
 |                         |<-----------------------|  + session            |
 |  Store tokens in        |                        |                       |
 |  httpOnly cookies       |                        |                       |
 |  Navigate to dashboard  |                        |                       |
 |<------------------------|                        |                       |
```

### Login Request

```http
POST /api/v1/auth/login
Content-Type: application/json

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

### Login Response (No 2FA)

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

### Login Response (2FA Required)

```json
{
  "success": true,
  "data": null,
  "meta": {
    "twoFactorRequired": true,
    "tempToken": "tmp_x9y8z7w6v5u4t3s2...",
    "tempTokenExpiresAt": "2026-07-20T10:35:00Z",
    "method": "totp"
  }
}
```

### Failed Login Response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": [],
    "remainingAttempts": 3
  }
}
```

After 5 consecutive failed attempts, the account is locked for 30 minutes:

```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account temporarily locked due to too many failed login attempts",
    "details": [],
    "lockedUntil": "2026-07-20T11:00:00Z",
    "retryAfterSeconds": 1800
  }
}
```

---

## Token Refresh Mechanism

Token refresh uses a rotation strategy where each refresh token is single-use. Using a revoked refresh token triggers a security response.

### Normal Refresh Flow

```
Client                     Backend                    Redis
  |                           |                          |
  |  Access token expired     |                          |
  |  (401 response)           |                          |
  |                           |                          |
  |  POST /auth/refresh-token |                          |
  |  { refreshToken: rt_old } |                          |
  |-------------------------->|                          |
  |                           |  Look up rt_old in Redis |
  |                           |<------------------------>|
  |                           |  rt_old found, not revoked|
  |                           |  Mark rt_old as revoked  |
  |                           |  Generate rt_new         |
  |                           |  Store rt_new in Redis   |
  |                           |  Generate new access JWT |
  |  200 + new tokens         |                          |
  |<--------------------------|                          |
  |  Store new tokens         |                          |
```

### Refresh Request

```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "rt_8f7e6d5c4b3a2..."
}
```

### Refresh Response

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

### Token Theft Detection

If a revoked refresh token is presented:

```
Client                     Backend                    Redis
  |                           |                          |
  |  POST /auth/refresh-token |                          |
  |  { refreshToken: rt_old } |                          |
  |-------------------------->|                          |
  |                           |  Look up rt_old in Redis |
  |                           |<------------------------>|
  |                           |  rt_old found, IS revoked|
  |                           |  DETECTED: Token reuse!  |
  |                           |  Revoke entire token     |
  |                           |  family (all sessions)   |
  |                           |  Send security alert     |
  |                           |  to user                 |
  |  401 + security alert     |                          |
  |<--------------------------|                          |
```

```json
{
  "success": false,
  "error": {
    "code": "REFRESH_TOKEN_REUSE_DETECTED",
    "message": "A previously used refresh token was detected. All sessions have been terminated for security. Please log in again.",
    "details": [],
    "securityAlert": true
  }
}
```

All sessions for the user are terminated, and a security notification is sent via email and push notification.

---

## Password Reset Flow

```
User                    Frontend                 Backend                 Email Service
 |                         |                        |                        |
 |  Click "Forgot Password"|                        |                        |
 |------------------------>|                        |                        |
 |                         |  POST /auth/forgot-    |                        |
 |                         |  password              |                        |
 |                         |----------------------->|                        |
 |                         |                        |  Find user by email   |
 |                         |                        |  Generate reset token |
 |                         |                        |  Store hashed token   |
 |                         |                        |  (15 min expiry)      |
 |                         |                        |----------------------->|
 |                         |  200 OK                |  Send reset email     |
 |                         |<-----------------------|  (generic message)    |
 |  Show "check email"     |                        |                        |
 |<------------------------|                        |                        |
 |                         |                        |                        |
 |  Click reset link in    |                        |                        |
 |  email (opens /reset)   |                        |                        |
 |------------------------>|                        |                        |
 |  Enter new password     |                        |                        |
 |------------------------>|                        |                        |
 |                         |  POST /auth/reset-     |                        |
 |                         |  password              |                        |
 |                         |----------------------->|                        |
 |                         |                        |  Validate token       |
 |                         |                        |  Hash new password    |
 |                         |                        |  Update password      |
 |                         |                        |  Revoke all sessions  |
 |                         |                        |  Delete reset token   |
 |                         |  200 OK                |                        |
 |                         |<-----------------------|                        |
 |  Show success +         |                        |                        |
 |  redirect to login      |                        |                        |
 |<------------------------|                        |                        |
```

### Forgot Password Request

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "jane@acme.com"
}
```

**Important Security Note:** The response is always identical regardless of whether the email exists:

```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "If an account exists with this email, a password reset link has been sent"
  }
}
```

This prevents email enumeration attacks where an attacker could determine valid email addresses by checking response differences.

### Reset Password Request

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "rst_a1b2c3d4e5f6g7h8...",
  "newPassword": "NewSecureP@ss456"
}
```

### Reset Password Response

```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "Password has been reset successfully. All other sessions have been terminated for security"
  }
}
```

**Side Effects of Password Reset:**

- All active sessions (except the current one after re-login) are terminated
- All refresh tokens in the token family are revoked
- A security notification email is sent to the user
- The user must re-authenticate on all devices
- If 2FA is enabled, it remains active

---

## Two-Factor Authentication (2FA/MFA)

NovaCRM AI supports TOTP-based (Time-based One-Time Password) two-factor authentication compatible with Google Authenticator, Authy, 1Password, and other TOTP apps.

### 2FA Setup Flow

```
User                    Frontend                 Backend
  |                         |                        |
  |  Enable 2FA in          |                        |
  |  Settings > Security    |                        |
  |------------------------>|                        |
  |                         |  POST /auth/2fa/setup  |
  |                         |----------------------->|
  |                         |                        |  Generate TOTP secret
  |                         |                        |  Store encrypted
  |                         |  200 + QR + codes      |
  |                         |<-----------------------|
  |  Show QR code +         |                        |
  |  recovery codes         |                        |
  |<------------------------|                        |
  |                         |                        |
  |  Scan QR with app       |                        |
  |  Enter 6-digit code     |                        |
  |------------------------>|                        |
  |                         |  POST /auth/2fa/verify |
  |                         |  + enable              |
  |                         |----------------------->|
  |                         |                        |  Verify TOTP code
  |                         |                        |  Enable 2FA for user
  |                         |  200 OK                |
  |                         |<-----------------------|
  |  2FA now active         |                        |
  |<------------------------|                        |
```

### 2FA Setup Request

```http
POST /api/v1/auth/2fa/setup
Authorization: Bearer <access_token>
```

### 2FA Setup Response

```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCodeUrl": "otpauth://totp/NovaCRM:jane@acme.com?secret=JBSWY3DPEHPK3PXP&issuer=NovaCRM",
    "qrCodeImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "recoveryCodes": [
      "a1b2-c3d4-e5f6",
      "g7h8-i9j0-k1l2",
      "m3n4-o5p6-q7r8",
      "s9t0-u1v2-w3x4",
      "y5z6-a7b8-c9d0",
      "e1f2-g3h4-i5j6",
      "k7l8-m9n0-o1p2",
      "q3r4-s5t6-u7v8"
    ],
    "algorithm": "SHA1",
    "digits": 6,
    "period": 30
  }
}
```

### 2FA Verify and Enable Request

```http
POST /api/v1/auth/2fa/verify-and-enable
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "code": "482916",
  "secret": "JBSWY3DPEHPK3PXP"
}
```

### 2FA Verification During Login

After password is verified and 2FA is enabled, the user receives a temporary token and must verify the TOTP code:

```http
POST /api/v1/auth/2fa/verify
Content-Type: application/json

{
  "tempToken": "tmp_x9y8z7w6v5u4t3s2...",
  "code": "482916"
}
```

### 2FA Verification Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_3xk9f2m",
      "email": "jane@acme.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "organization_admin"
    }
  },
  "meta": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "rt_8f7e6d5c4b3a2...",
    "accessTokenExpiresAt": "2026-07-20T10:45:00Z",
    "refreshTokenExpiresAt": "2026-07-27T10:30:00Z",
    "sessionId": "ses_p2o9i8u7"
  }
}
```

### Recovery Code Usage

If the user loses access to their TOTP device, they can use a recovery code:

```http
POST /api/v1/auth/2fa/recovery
Content-Type: application/json

{
  "tempToken": "tmp_x9y8z7w6v5u4t3s2...",
  "recoveryCode": "a1b2-c3d4-e5f6"
}
```

Each recovery code can only be used once. After use, it is invalidated. Recovery codes should be stored securely offline.

### 2FA Disable

```http
POST /api/v1/auth/2fa/disable
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "password": "SecureP@ss123",
  "code": "482916"
}
```

---

## Magic Link Authentication

Magic links provide passwordless authentication via email. A one-time login link is sent to the user's email, valid for **15 minutes**.

### Magic Link Flow

```
User                    Frontend                 Backend                 Email Service
 |                         |                        |                        |
 |  Click "Sign in with   |                        |                        |
 |  magic link"            |                        |                        |
 |------------------------>|                        |                        |
 |                         |  POST /auth/magic-link |                        |
 |                         |----------------------->|                        |
 |                         |                        |  Validate email       |
 |                         |                        |  Generate magic token |
 |                         |                        |  Store with 15m TTL   |
 |                         |                        |----------------------->|
 |                         |  200 OK                |  Send magic link email|
 |                         |<-----------------------|                        |
 |  Show "check email"     |                        |                        |
 |<------------------------|                        |                        |
 |                         |                        |                        |
 |  Click magic link in    |                        |                        |
 |  email                  |                        |                        |
 |  (opens /magic-login)   |                        |                        |
 |------------------------>|                        |                        |
 |                         |  GET /auth/magic-link  |                        |
 |                         |  /verify?token=xxx     |                        |
 |                         |----------------------->|                        |
 |                         |                        |  Validate token       |
 |                         |                        |  Check not expired    |
 |                         |                        |  Issue JWT tokens     |
 |                         |                        |  Create session       |
 |                         |  200 + tokens          |                        |
 |                         |<-----------------------|                        |
 |  Store tokens,          |                        |                        |
 |  navigate to dashboard  |                        |                        |
 |<------------------------|                        |                        |
```

### Send Magic Link Request

```http
POST /api/v1/auth/magic-link
Content-Type: application/json

{
  "email": "jane@acme.com"
}
```

### Magic Link Response

```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "If an account exists with this email, a magic login link has been sent",
    "expiresIn": 900
  }
}
```

### Verify Magic Link

```http
GET /api/v1/auth/magic-link/verify?token=mgl_x1y2z3w4v5u6t7s8r9q0p
```

### Magic Link Verify Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_3xk9f2m",
      "email": "jane@acme.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "organization_admin"
    }
  },
  "meta": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "rt_8f7e6d5c4b3a2...",
    "accessTokenExpiresAt": "2026-07-20T10:45:00Z",
    "refreshTokenExpiresAt": "2026-07-27T10:30:00Z",
    "sessionId": "ses_p2o9i8u7",
    "isNewUser": false
  }
}
```

If the email does not belong to an existing user and registration is enabled, a new account is created automatically (the `isNewUser` flag will be `true`).

---

## Social OAuth Login

NovaCRM AI supports OAuth 2.0 login via third-party providers.

### Supported Providers

| Provider     | Scopes Requested                          | Status    |
|--------------|-------------------------------------------|-----------|
| Google       | `openid email profile`                    | Active    |
| Microsoft    | `openid email profile`                    | Active    |
| GitHub       | `user:email read:user`                    | Active    |
| LinkedIn     | `openid email profile`                    | Active    |
| Apple        | `name email`                              | Active    |

### OAuth Flow

```
User                    Frontend                 Backend                 Provider
 |                         |                        |                        |
 |  Click "Sign in with   |                        |                        |
 |  Google"               |                        |                        |
 |------------------------>|                        |                        |
 |                         |  Redirect to           |                        |
 |                         |  /auth/oauth/google    |                        |
 |                         |----------------------->|                        |
 |                         |                        |  Generate OAuth URL    |
 |                         |  302 Redirect          |                        |
 |                         |<-----------------------|                        |
 |                         |                        |                        |
 |  User authenticates     |                        |                        |
 |  with Google            |                        |                        |
 |  (consent screen)       |                        |----------------------->|
 |                         |                        |                        |
 |                         |  Callback with         |  User authorizes       |
 |                         |  authorization code    |                        |
 |                         |<-----------------------|------------------------|
 |                         |                        |                        |
 |                         |  POST /auth/oauth/     |  Exchange code for     |
 |                         |  callback              |  access token          |
 |                         |----------------------->|                        |
 |                         |                        |  Fetch user profile    |
 |                         |                        |  Find/create user      |
 |                         |                        |  Link account          |
 |                         |                        |  Issue JWT tokens      |
 |                         |  200 + tokens          |                        |
 |                         |<-----------------------|                        |
 |  Store tokens,          |                        |                        |
 |  navigate to dashboard  |                        |                        |
 |<------------------------|                        |                        |
```

### OAuth Login Request

```http
GET /api/v1/auth/oauth/google?redirect_uri=https://app.novacrm.io/auth/callback
```

### OAuth Callback

```http
POST /api/v1/auth/oauth/callback
Content-Type: application/json

{
  "provider": "google",
  "code": "4/0AX4XfWh...",
  "state": "csrf_token_here"
}
```

### OAuth Callback Response

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
      "avatar": "https://lh3.googleusercontent.com/...",
      "organizationId": "org_m4k2n8p",
      "emailVerified": true,
      "linkedProviders": ["google", "github"]
    }
  },
  "meta": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "rt_8f7e6d5c4b3a2...",
    "accessTokenExpiresAt": "2026-07-20T10:45:00Z",
    "refreshTokenExpiresAt": "2026-07-27T10:30:00Z",
    "sessionId": "ses_p2o9i8u7",
    "isNewUser": false,
    "linkedAccount": false
  }
}
```

### Linking Additional Providers

An existing user can link additional OAuth providers from Settings > Security:

```http
POST /api/v1/auth/oauth/link
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "provider": "github",
  "redirect_uri": "https://app.novacrm.io/settings/security"
}
```

---

## Session Management

Each login creates a session record stored in Redis. Sessions track device information, IP addresses, and last activity timestamps.

### Session Record Structure

```json
{
  "sessionId": "ses_p2o9i8u7",
  "userId": "usr_3xk9f2m",
  "organizationId": "org_m4k2n8p",
  "device": {
    "name": "MacBook Pro",
    "os": "macOS 14.5",
    "browser": "Chrome 126",
    "type": "desktop",
    "fingerprint": "fp AppleWebKit Chrome Mac OS"
  },
  "ipAddress": "192.168.1.100",
  "location": {
    "city": "New York",
    "region": "NY",
    "country": "US"
  },
  "createdAt": "2026-07-20T10:30:00Z",
  "lastActivityAt": "2026-07-20T10:42:00Z",
  "expiresAt": "2026-07-27T10:30:00Z",
  "isActive": true,
  "mfaCompleted": true
}
```

### Listing Active Sessions

```http
GET /api/v1/auth/sessions
Authorization: Bearer <access_token>
```

### Sessions Response

```json
{
  "success": true,
  "data": [
    {
      "sessionId": "ses_p2o9i8u7",
      "device": {
        "name": "MacBook Pro",
        "os": "macOS 14.5",
        "browser": "Chrome 126",
        "type": "desktop"
      },
      "ipAddress": "192.168.1.100",
      "location": {
        "city": "New York",
        "country": "US"
      },
      "createdAt": "2026-07-20T10:30:00Z",
      "lastActivityAt": "2026-07-20T10:42:00Z",
      "isCurrent": true
    },
    {
      "sessionId": "ses_q3r4s5t",
      "device": {
        "name": "iPhone 15 Pro",
        "os": "iOS 18.0",
        "browser": "NovaCRM Mobile",
        "type": "mobile"
      },
      "ipAddress": "10.0.0.55",
      "location": {
        "city": "New York",
        "country": "US"
      },
      "createdAt": "2026-07-19T08:00:00Z",
      "lastActivityAt": "2026-07-20T09:15:00Z",
      "isCurrent": false
    }
  ]
}
```

### Terminating a Session

```http
DELETE /api/v1/auth/sessions/:sessionId
Authorization: Bearer <access_token>
```

### Terminating All Other Sessions

```http
POST /api/v1/auth/sessions/revoke-all
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "exceptCurrent": true
}
```

---

## Device Management

NovaCRM AI tracks and manages devices for security purposes. Users can view and manage trusted devices.

### Device Registration

When a user logs in from a new device, the device is recorded. If the device is not recognized, a notification is sent.

### Trusted Devices

Users can mark devices as trusted. Trusted devices skip 2FA on subsequent logins (configurable by organization admin).

```http
POST /api/v1/auth/devices/:deviceId/trust
Authorization: Bearer <access_token>
```

```json
{
  "success": true,
  "data": {
    "deviceId": "dev_a1b2c3d4",
    "trusted": true,
    "trustedAt": "2026-07-20T11:00:00Z"
  }
}
```

### Revoke Device Trust

```http
DELETE /api/v1/auth/devices/:deviceId/trust
Authorization: Bearer <access_token>
```

---

## Security Considerations

### Password Storage

- Passwords are hashed using **bcrypt** with a cost factor of **12**
- Each password uses a unique salt generated by bcrypt
- Plaintext passwords are never stored or logged
- Password hash comparison is constant-time to prevent timing attacks

### Rate Limiting

| Action                      | Rate Limit                  | Window       |
|-----------------------------|-----------------------------|-------------|
| Login attempts              | 5 per email                 | 15 minutes  |
| Registration                | 3 per IP                    | 1 hour      |
| Password reset requests     | 3 per email                 | 1 hour      |
| Magic link requests         | 3 per email                 | 1 hour      |
| Token refresh               | 10 per session              | 15 minutes  |
| 2FA verification            | 5 per temp token            | 5 minutes   |
| OAuth callbacks             | 10 per IP                   | 1 hour      |

### Token Security

- Access tokens are **stateless** and validated locally (no database lookup per request)
- Refresh tokens are **stateful** and validated against Redis
- Tokens use **RS256** (RSA with SHA-256) asymmetric signing
- Private keys are rotated every 90 days
- Old keys are kept for verification during a 24-hour grace period
- Token IDs (`jti`) are stored for immediate revocation capability

### Transport Security

- All authentication endpoints require **HTTPS** (TLS 1.2+)
- HSTS headers are set with `max-age=63072000; includeSubDomains; preload`
- Cookies use `Secure`, `HttpOnly`, and `SameSite=Strict` flags
- Refresh tokens are stored in `httpOnly` cookies, never accessible via JavaScript

### CORS Configuration

```
Access-Control-Allow-Origin: https://app.novacrm.io
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Request-ID
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

### Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
```

### Audit Logging

All authentication events are logged for security auditing:

| Event                        | Logged Data                                      |
|------------------------------|--------------------------------------------------|
| Login success                | userId, IP, userAgent, timestamp                 |
| Login failure                | email, IP, userAgent, reason, timestamp          |
| Account locked               | userId, IP, failureCount, timestamp              |
| Password changed             | userId, IP, userAgent, timestamp                 |
| Password reset requested     | email, IP, userAgent, timestamp                  |
| 2FA enabled                  | userId, IP, userAgent, timestamp                 |
| 2FA disabled                 | userId, IP, userAgent, timestamp                 |
| Session created              | userId, sessionId, device, IP, timestamp         |
| Session terminated           | userId, sessionId, reason, timestamp             |
| Token refresh                | userId, sessionId, timestamp                     |
| Token reuse detected         | userId, sessionId, timestamp, alertSent          |
| OAuth account linked         | userId, provider, timestamp                      |
| Magic link generated         | email, IP, timestamp                             |
| Magic link used              | email, IP, userId, timestamp                     |

### Account Recovery

If a user is locked out and cannot access their email:

1. Contact organization admin to manually unlock the account
2. Super Admin can override via `POST /admin/users/:id/unlock`
3. Organization admin can reset 2FA via `POST /admin/users/:id/reset-2fa`

---

## API Reference

### Complete Authentication Endpoints

| Method | Endpoint                          | Auth Required | Description                    |
|--------|-----------------------------------|---------------|--------------------------------|
| POST   | `/auth/register`                  | No            | Register a new account         |
| POST   | `/auth/login`                     | No            | Login with email/password      |
| POST   | `/auth/logout`                    | Yes           | Invalidate session             |
| POST   | `/auth/forgot-password`           | No            | Request password reset         |
| POST   | `/auth/reset-password`            | No            | Reset password with token      |
| POST   | `/auth/verify-email`              | No            | Verify email with token        |
| POST   | `/auth/resend-verification`       | No            | Resend verification email      |
| POST   | `/auth/refresh-token`             | No            | Refresh access token           |
| POST   | `/auth/magic-link`                | No            | Send magic login link          |
| GET    | `/auth/magic-link/verify`         | No            | Verify magic link token        |
| GET    | `/auth/oauth/:provider`           | No            | Initiate OAuth flow            |
| POST   | `/auth/oauth/callback`            | No            | OAuth callback handler         |
| POST   | `/auth/oauth/link`                | Yes           | Link additional OAuth provider |
| POST   | `/auth/2fa/setup`                 | Yes           | Generate 2FA secret + QR code  |
| POST   | `/auth/2fa/verify-and-enable`     | Yes           | Verify code and enable 2FA     |
| POST   | `/auth/2fa/verify`                | No (temp)     | Verify 2FA during login        |
| POST   | `/auth/2fa/recovery`              | No (temp)     | Use recovery code              |
| POST   | `/auth/2fa/disable`               | Yes           | Disable 2FA                    |
| GET    | `/auth/sessions`                  | Yes           | List active sessions           |
| DELETE | `/auth/sessions/:sessionId`       | Yes           | Terminate a session            |
| POST   | `/auth/sessions/revoke-all`       | Yes           | Terminate all sessions         |
| GET    | `/auth/devices`                   | Yes           | List known devices             |
| POST   | `/auth/devices/:id/trust`         | Yes           | Trust a device                 |
| DELETE | `/auth/devices/:id/trust`         | Yes           | Revoke device trust            |
