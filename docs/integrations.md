# Integrations Documentation

## NovaCRM AI — Enterprise AI-Powered CRM Platform

**Version:** 1.0
**Last Updated:** July 2026

---

## Table of Contents

1. [Integration Architecture](#1-integration-architecture)
2. [Google Calendar](#2-google-calendar)
3. [Microsoft Outlook](#3-microsoft-outlook)
4. [Slack](#4-slack)
5. [Stripe](#5-stripe)
6. [OpenAI](#6-openai)
7. [Google Gemini](#7-google-gemini)
8. [Webhooks (Outgoing)](#8-webhooks-outgoing)
9. [REST API](#9-rest-api)
10. [Zapier](#10-zapier)
11. [Integration Management](#11-integration-management)

---

## 1. Integration Architecture

### Integration Layer

~~~
Frontend (React)
  |
  v
NovaCRM API Gateway
  |
  v
Integration Service Layer
  |           |           |           |           |
  v           v           v           v           v
[Google]   [Outlook]   [Slack]    [Stripe]   [Webhooks]
  |           |           |           |           |
  v           v           v           v           v
OAuth2.0    MSAL      Bot Token   API Key    HTTP POST
~~~

### Integration Registry

All integrations are registered in a central Integration Registry that manages:
- Authentication credentials (encrypted at rest)
- Connection status and health checks
- Sync schedules and frequency
- Rate limit tracking per provider
- Error logs and retry queues
- Webhook endpoints and event mappings

---

## 2. Google Calendar

### Overview

Synchronizes NovaCRM calendar events with Google Calendar. Supports bi-directional sync for events, meetings, and availability.

### Authentication

**Type:** OAuth 2.0

**Setup Steps:**
1. Create a project in Google Cloud Console
2. Enable Google Calendar API
3. Configure OAuth consent screen (External)
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI: https://api.novacrm.ai/integrations/google/callback
6. Copy Client ID and Client Secret
7. Add credentials to NovaCRM integration settings

**Required Scopes:**
~~~
https://www.googleapis.com/auth/calendar.readonly
https://www.googleapis.com/auth/calendar.events
~~~

### API Keys Needed

| Key | Source | Storage |
|-----|--------|---------|
| GOOGLE_CLIENT_ID | Google Cloud Console | Environment variable |
| GOOGLE_CLIENT_SECRET | Google Cloud Console | Environment variable (encrypted) |
| OAuth Refresh Token | Generated on auth | Database (encrypted) |
| OAuth Access Token | Generated on auth | In-memory (short-lived) |

### Sync Details

| Direction | Frequency | Data Synced |
|-----------|-----------|-------------|
| Google → NovaCRM | Every 5 minutes | Events, meetings, reminders |
| NovaCRM → Google | Real-time | Created/updated/deleted events |
| Initial sync | One-time | All events from last 90 days |

### Features

- Create events in NovaCRM → appear in Google Calendar
- Respond to Google Calendar invites → events created in NovaCRM
- View Google Calendar availability when scheduling meetings
- Sync meeting details, location, attendees, and descriptions
- Recurring event support
- Conflict detection

### Error Handling

| Error | Handling |
|-------|----------|
| Token expired | Automatic refresh via refresh token |
| API rate limit | Exponential backoff, queue remaining requests |
| Event conflict | Flag and notify user via in-app notification |
| Network failure | Retry queue with 3 attempts, then manual sync prompt |
| Deleted event (source) | Remove from NovaCRM |
| Permission revoked | Disable integration, notify user |

---

## 3. Microsoft Outlook

### Overview

Integrates NovaCRM with Microsoft 365 services including calendar sync, email sync, and contact sync.

### Authentication

**Type:** Microsoft Authentication Library (MSAL) v2 - OAuth 2.0 + OpenID Connect

**Setup Steps:**
1. Register application in Azure Portal (App Registrations)
2. Set Redirect URI: https://api.novacrm.ai/integrations/outlook/callback
3. Configure API Permissions (Microsoft Graph):
   - Calendar.ReadWrite
   - Mail.ReadWrite
   - Contacts.ReadWrite
   - offline_access
   - User.Read
4. Generate Client Secret in Certificates & Secrets
5. Copy Application (Client) ID and Directory (Tenant) ID
6. Add credentials to NovaCRM integration settings

**Required Permissions:**
~~~
Calendars.ReadWrite
Mail.ReadWrite
Contacts.ReadWrite
offline_access
User.Read
~~~

### API Keys Needed

| Key | Source | Storage |
|-----|--------|---------|
| AZURE_CLIENT_ID | Azure Portal | Environment variable |
| AZURE_CLIENT_SECRET | Azure Portal | Environment variable (encrypted) |
| AZURE_TENANT_ID | Azure Portal | Environment variable |
| OAuth tokens | Generated on auth | Database (encrypted) |

### Sync Details

| Direction | Frequency | Data Synced |
|-----------|-----------|-------------|
| Outlook → NovaCRM | Every 5 minutes | Calendar events, emails, contacts |
| NovaCRM → Outlook | Real-time | Created/updated calendar events |
| Email sync | Every 10 minutes | New emails from tracked contacts |
| Contact sync | Daily | Contacts updated in both directions |

### Calendar Sync Features

- Same as Google Calendar (events, meetings, availability, conflict detection)
- Free/busy lookup for scheduling
- Meeting room availability
- Exchange Online support

### Email Sync Features

- Auto-link emails to leads/contacts/deals
- Track email opens and replies
- Email templates with mail merge from Outlook
- Send emails via Outlook SMTP
- Email threading in CRM timeline

### Error Handling

| Error | Handling |
|-------|----------|
| Token expired | Automatic refresh using refresh token |
| Consent revoked | Disable integration, notify admin |
| API throttling | Retry-After header respected, queue remaining |
| Mailbox full | Notify user, skip email sync |
| Network failures | Retry queue with exponential backoff |
| Graph API errors | Log and alert engineering team |

---

## 4. Slack

### Overview

Slack integration provides bot notifications, slash commands, and interactive messaging for CRM updates and actions.

### Authentication

**Type:** Slack Bot Token + OAuth 2.0

**Setup Steps:**
1. Create Slack App at api.slack.com/apps
2. Select "From Manifest" and paste NovaCRM app manifest
3. Install App to Workspace
4. Copy Bot Token and Signing Secret
5. Set Request URL for events: https://api.novacrm.ai/integrations/slack/events
6. Set Slash Command URL: https://api.novacrm.ai/integrations/slack/commands
7. Add credentials to NovaCRM integration settings

**Bot Token Scopes:**
~~~
chat:write
chat:write.public
commands
events:message.channels
events:message.im
reactions:read
users:read
users:read.email
channels:read
~~~

### Features

#### Notifications

| Event | Notification | Destination |
|-------|--------------|-------------|
| New lead assigned | "New lead: Acme Corp (score: 85)" | DM or channel |
| Deal stage change | "Acme Corp moved to Negotiation ($50k)" | Deal channel |
| Task overdue | "Task: Follow-up call (overdue 2 days)" | User DM |
| Meeting reminder | "Meeting: Q3 Review in 15 min" | DM + channel |
| High-value activity | "John Smith viewed pricing page" | Sales channel |
| Report ready | "Q2 Report is ready for review" | Reports channel |

#### Slash Commands

| Command | Description |
|---------|-------------|
| /novacrm search <query> | Search leads, contacts, deals |
| /novacrm deals | List your open deals |
| /novacrm tasks | List your pending tasks |
| /novacrm pipeline | Show pipeline summary |
| /novacrm lead <email> | Quick lookup lead by email |
| /novacrm create lead | Interactive lead creation form |
| /novacrm status | CRM health and stats |

#### Interactive Messages

- Deal approval requests with Approve/Reject buttons
- Task completion confirmation
- Meeting RSVP directly from Slack
- Lead assignment notifications with Accept/Reassign actions

### API Keys Needed

| Key | Source | Storage |
|-----|--------|---------|
| SLACK_BOT_TOKEN | Slack App Dashboard | Environment variable |
| SLACK_SIGNING_SECRET | Slack App Dashboard | Environment variable |
| SLACK_CLIENT_ID | Slack App Dashboard | Environment variable |
| SLACK_CLIENT_SECRET | Slack App Dashboard | Environment variable (encrypted) |

### Error Handling

| Error | Handling |
|-------|----------|
| Invalid token | Re-authenticate integration |
| Rate limited | Retry after Retry-After header delay |
| Channel not found | Log and skip, notify admin |
| Message too long | Truncate with "Show more" link |
| Bot not in channel | Auto-join on notification send |

---

## 5. Stripe

### Overview

Payment processing integration for subscription management, invoicing, and billing operations.

### Authentication

**Type:** API Key + Webhook Secret

**Setup Steps:**
1. Create Stripe account
2. Retrieve API keys from Stripe Dashboard > Developers > API Keys
3. Create Webhook endpoint in Stripe Dashboard
4. Set Webhook URL: https://api.novacrm.ai/integrations/stripe/webhook
5. Select events to listen for (see below)
6. Copy Webhook Signing Secret
7. Add credentials to NovaCRM integration settings

### API Keys Needed

| Key | Source | Storage |
|-----|--------|---------|
| STRIPE_SECRET_KEY | Stripe Dashboard | Environment variable (encrypted) |
| STRIPE_PUBLISHABLE_KEY | Stripe Dashboard | Environment variable |
| STRIPE_WEBHOOK_SECRET | Stripe Dashboard | Environment variable |
| STRIPE_PRICE_IDS | NovaCRM product config | Database |

### Features

#### Payment Processing

- One-time payments (credit card, ACH)
- Recurring subscriptions (monthly, annual, custom)
- Usage-based billing for API access
- Invoice generation and PDF delivery
- Payment method management (add, update, remove)
- Refund processing
- Coupon and discount codes
- Tax calculation (Stripe Tax)

#### Subscription Management

| Action | API Method | Description |
|--------|-----------|-------------|
| Create subscription | POST /v1/subscriptions | Start new plan |
| Upgrade plan | POST /v1/subscriptions/:id | Change to higher tier |
| Downgrade plan | POST /v1/subscriptions/:id | Change to lower tier |
| Cancel subscription | POST /v1/subscriptions/:id | End subscription at period end |
| Pause subscription | POST /v1/subscriptions/:id | Temporary suspension |
| Reactivate | POST /v1/subscriptions/:id | Resume canceled subscription |

#### Webhook Events

| Event | Action |
|-------|--------|
| checkout.session.completed | Activate subscription, grant access |
| invoice.paid | Mark invoice as paid, extend subscription |
| invoice.payment_failed | Notify user, attempt retry, apply late fee |
| customer.subscription.updated | Sync plan changes to NovaCRM |
| customer.subscription.deleted | Downgrade to free tier |
| payment_intent.succeeded | Update payment status |
| payment_intent.payment_failed | Notify user, offer retry |
| charge.refunded | Process refund, update invoice status |

### Sync Details

| Direction | Frequency | Data Synced |
|-----------|-----------|-------------|
| Stripe → NovaCRM | Real-time (webhook) | Payments, invoices, subscriptions |
| Stripe → NovaCRM | Every 6 hours | Reconciliation sync |
| NovaCRM → Stripe | Real-time | Subscription changes, invoice creation |

### Error Handling

| Error | Handling |
|-------|----------|
| Card declined | Return specific decline reason, suggest retry with different card |
| Insufficient funds | Notify user, auto-retry in 3 days |
| Invalid API key | Alert engineering team |
| Webhook signature invalid | Reject request, log security event |
| Rate limit | Retry with exponential backoff |
| Duplicate webhook | Idempotency key validation |
| Payment failed | Send notification with retry link |

---

## 6. OpenAI

### Overview

Integration with OpenAI APIs for AI-powered CRM features including GPT-4 for complex reasoning and text-embedding-3-small for semantic search.

### Authentication

**Type:** API Key

**Setup Steps:**
1. Create OpenAI account at platform.openai.com
2. Navigate to API Keys section
3. Create new API key
4. Copy API key (cannot be viewed again)
5. Add to NovaCRM integration settings
6. (Optional) Set usage limits and alerts in OpenAI dashboard

### API Keys Needed

| Key | Source | Storage |
|-----|--------|---------|
| OPENAI_API_KEY | OpenAI Dashboard | Environment variable (encrypted) |
| OPENAI_ORG_ID | OpenAI Dashboard (optional) | Environment variable |

### Models Used

| Model | Purpose | Max Tokens | Cost per 1K tokens |
|-------|---------|-----------|-------------------|
| gpt-4-turbo | Complex reasoning, sales analysis, email generation | 128K | $0.01 / $0.03 |
| gpt-4o | Chat interface, general AI features | 128K | $0.005 / $0.015 |
| text-embedding-3-small | Vector embeddings for search | N/A | $0.00002 |

### Usage Tracking

- Token usage logged per request, per user, per feature
- Monthly cost tracking and budget alerts
- Per-user token quotas configurable by admin
- Usage dashboard with cost breakdown by model and feature
- Automatic rate limiting to prevent runaway costs

---

## 7. Google Gemini

### Overview

Integration with Google Gemini for multimodal AI features including image analysis, document understanding, and audio transcription.

### Authentication

**Type:** API Key

**Setup Steps:**
1. Create Google Cloud project
2. Enable Generative Language API
3. Create API key in Google Cloud Console > APIs & Services > Credentials
4. (Optional) Restrict API key to Generative Language API
5. Add to NovaCRM integration settings

### API Keys Needed

| Key | Source | Storage |
|-----|--------|---------|
| GOOGLE_API_KEY | Google Cloud Console | Environment variable (encrypted) |

### Models Used

| Model | Purpose | Context Window |
|-------|---------|---------------|
| gemini-1.5-pro | Multimodal analysis, document understanding | 1M tokens |
| gemini-1.5-flash | Quick responses, transcription | 1M tokens |

---

## 8. Webhooks (Outgoing)

### Overview

Custom webhook system that allows NovaCRM to send real-time event notifications to external systems.

### Configuration

Users can configure webhooks in Settings > Integrations > Webhooks:

| Field | Description |
|-------|-------------|
| URL | HTTPS endpoint to receive payloads |
| Events | One or more events to subscribe to |
| Secret | HMAC-SHA256 signing secret |
| Format | JSON payload format |
| Retry | Number of retry attempts (default: 3) |
| Status | Active or paused |

### Available Events

| Event Category | Specific Events |
|---------------|-----------------|
| Leads | lead.created, lead.updated, lead.deleted, lead.converted, lead.score_changed |
| Contacts | contact.created, contact.updated, contact.deleted, contact.merged |
| Deals | deal.created, deal.updated, deal.deleted, deal.stage_changed, deal.won, deal.lost |
| Tasks | task.created, task.updated, task.completed, task.overdue |
| Meetings | meeting.created, meeting.updated, meeting.cancelled |
| Invoices | invoice.created, invoice.paid, invoice.overdue |
| Subscriptions | subscription.created, subscription.updated, subscription.cancelled |
| Activities | activity.logged, activity.email_sent, activity.call_logged |

### Payload Format

~~~json
{
  "event": "deal.stage_changed",
  "timestamp": "2026-07-20T10:30:00Z",
  "organizationId": "org_abc123",
  "data": {
    "id": "deal_xyz789",
    "previousStage": "proposal",
    "currentStage": "negotiation",
    "value": 50000,
    "contactName": "John Smith",
    "companyName": "Acme Corp"
  },
  "signature": "sha256=abc123def456..."
}
~~~

### Retry Logic

| Attempt | Delay |
|---------|-------|
| 1 | 10 seconds |
| 2 | 1 minute |
| 3 | 5 minutes |
| 4 | 15 minutes |
| 5 | 1 hour |

After all retries exhausted, the webhook is marked as failed and logged. Admins receive a notification if failure rate exceeds 10% in 1 hour.

---

## 9. REST API

### Overview

Public REST API for third-party integrations, custom application building, and data access. Full API documentation available at https://api.novacrm.ai/docs.

### Authentication

**Type:** API Key (Bearer token)

**Setup Steps:**
1. Navigate to Settings > API Keys in NovaCRM
2. Click "Generate API Key"
3. Select permissions (read, write, admin)
4. Set expiration (30 days, 90 days, 1 year, or custom)
5. Copy the key (shown once)
6. Use as Bearer token in Authorization header

### Rate Limits

| Tier | Requests/min | Requests/day |
|------|-------------|--------------|
| Free | 60 | 1,000 |
| Pro | 300 | 10,000 |
| Enterprise | 1,000 | 100,000 |
| Custom | Negotiable | Negotiable |

### Endpoints

| Module | Base Path |
|--------|-----------|
| Authentication | /api/v1/auth |
| Leads | /api/v1/leads |
| Contacts | /api/v1/contacts |
| Companies | /api/v1/companies |
| Deals | /api/v1/deals |
| Tasks | /api/v1/tasks |
| Meetings | /api/v1/meetings |
| Emails | /api/v1/emails |
| Invoices | /api/v1/invoices |
| Reports | /api/v1/reports |
| AI | /api/v1/ai |

---

## 10. Zapier

### Overview

NovaCRM provides Zapier triggers and actions for no-code automation with 5,000+ other apps.

### Triggers

| Trigger | Description |
|---------|-------------|
| New Lead | Fires when a new lead is created |
| New Contact | Fires when a new contact is created |
| New Deal | Fires when a new deal is created |
| Updated Deal | Fires when a deal is updated |
| Deal Stage Changed | Fires when a deal moves to a new stage |
| Deal Won | Fires when a deal is marked as won |
| New Task | Fires when a new task is created |
| Task Completed | Fires when a task is marked complete |
| New Invoice | Fires when a new invoice is created |
| Invoice Paid | Fires when an invoice is paid |

### Actions

| Action | Description |
|--------|-------------|
| Create Lead | Creates a new lead in NovaCRM |
| Create Contact | Creates a new contact |
| Create Deal | Creates a new deal |
| Create Task | Creates a new task |
| Update Lead | Updates an existing lead |
| Update Deal | Updates an existing deal |
| Find Lead | Searches for a lead by email |
| Find Contact | Searches for a contact by email |
| Send Email | Sends an email from NovaCRM |
| Log Activity | Logs an activity entry |

### Search/Find

| Search | Description |
|--------|-------------|
| Find Lead | Find lead by email or name |
| Find Contact | Find contact by email or name |
| Find Deal | Find deal by ID or name |
| Find Company | Find company by name or domain |

---

## 11. Integration Management

### Integration Dashboard

All integrations are managed from a central dashboard in Settings > Integrations:

| Feature | Description |
|---------|-------------|
| Status indicator | Connected, Disconnected, Error, Pending |
| Last sync time | When data was last synchronized |
| Error count | Number of recent errors |
| Quick actions | Sync now, disconnect, reconfigure |
| Connection health | Success rate (%), latency (ms) |
| Data volume | Records synced in last 24 hours |

### Security

- All API keys and tokens encrypted at rest using AES-256-GCM
- OAuth tokens stored with limited scope and expiry
- Webhook payloads signed with HMAC-SHA256
- Failed authentication attempts logged and alerted
- API keys rotatable without downtime
- Integration access can be restricted by user role

### Monitoring

| Metric | Alert Threshold |
|--------|-----------------|
| Sync failure rate | > 5% in 1 hour |
| API latency | > 5s average in 10 min |
| Auth failures | > 3 in 5 minutes |
| Rate limit hits | > 80% of quota |
| Webhook delivery failure | > 10% in 1 hour |

---

*This document is maintained by the NovaCRM Integrations Team. Last reviewed: July 2026.*
