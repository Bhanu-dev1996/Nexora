# Entity Relationship Diagram

## NovaCRM AI - Enterprise AI-Powered CRM Platform

Version: 1.0
Document Type: Entity Relationship Diagram
Status: Draft

---

## Table of Contents

1. [Diagram Overview](#1-diagram-overview)
2. [Core Module: Users & Organizations](#2-core-module-users--organizations)
3. [CRM Module: Leads, Contacts, Companies](#3-crm-module-leads-contacts-companies)
4. [Deals & Pipeline Module](#4-deals--pipeline-module)
5. [Commerce Module: Products, Orders, Invoices, Payments](#5-commerce-module-products-orders-invoices-payments)
6. [Communication Module: Messages, Emails, Notifications](#6-communication-module-messages-emails-notifications)
7. [Tasks & Calendar Module](#7-tasks--calendar-module)
8. [Marketing & Support Module](#8-marketing--support-module)
9. [System Module: Files, Comments, Tags, Activities, Audit Logs](#9-system-module-files-comments-tags-activities-audit-logs)
10. [Billing & Settings Module](#10-billing--settings-module)
11. [Full System ER Diagram](#11-full-system-er-diagram)
12. [Relationship Reference Table](#12-relationship-reference-table)

---

## 1. Diagram Overview

NovaCRM AI uses a **multi-tenant architecture** where every data table references an `organization_id` foreign key. The system consists of **40 tables** organized into the following modules:

| Module | Tables | Description |
|--------|--------|-------------|
| Core | 8 | Users, organizations, teams, roles, permissions |
| CRM | 4 | Leads, contacts, companies, deals |
| Commerce | 6 | Products, orders, invoices, payments |
| Communication | 3 | Messages, emails, notifications |
| Tasks & Calendar | 4 | Tasks, events, meetings, attendees |
| Marketing | 1 | Campaigns |
| Support | 2 | Tickets, comments |
| System | 8 | Files, tags, activities, audit logs, API keys, settings |
| Analytics | 1 | Reports |
| Automation | 1 | Workflows |
| Billing | 2 | Subscriptions, plans |
| **Total** | **40** | |

---

## 2. Core Module: Users & Organizations

```mermaid
erDiagram
    organizations {
        uuid id PK
        varchar name
        varchar slug UK
        varchar domain
        text logo_url
        varchar industry
        varchar size
        varchar phone
        varchar email
        text website
        varchar address_line1
        varchar city
        varchar state
        varchar postal_code
        varchar country
        varchar timezone
        varchar locale
        varchar currency
        uuid subscription_id FK
        jsonb settings
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    users {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar first_name
        varchar last_name
        text avatar_url
        varchar phone
        varchar job_title
        boolean is_active
        timestamptz email_verified_at
        timestamptz phone_verified_at
        boolean mfa_enabled
        varchar mfa_secret
        timestamptz last_login_at
        inet last_login_ip
        timestamptz password_changed_at
        jsonb settings
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    user_organizations {
        uuid id PK
        uuid user_id FK
        uuid organization_id FK
        uuid role_id FK
        boolean is_default
        varchar status
        timestamptz joined_at
        timestamptz created_at
        timestamptz updated_at
    }

    teams {
        uuid id PK
        uuid organization_id FK
        varchar name
        text description
        uuid lead_user_id FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    team_members {
        uuid id PK
        uuid team_id FK
        uuid user_id FK
        varchar role
        timestamptz joined_at
        timestamptz created_at
        timestamptz updated_at
    }

    roles {
        uuid id PK
        uuid organization_id FK
        varchar name
        varchar slug
        text description
        boolean is_system
        boolean is_default
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    permissions {
        uuid id PK
        varchar resource
        varchar action
        text description
        timestamptz created_at
        timestamptz updated_at
    }

    role_permissions {
        uuid id PK
        uuid role_id FK
        uuid permission_id FK
        timestamptz created_at
    }

    %% Relationships
    organizations ||--o{ user_organizations : "has members"
    users ||--o{ user_organizations : "belongs to"
    roles ||--o{ user_organizations : "assigned via"
    organizations ||--o{ teams : "has"
    users ||--o{ teams : "leads"
    teams ||--o{ team_members : "has members"
    users ||--o{ team_members : "belongs to"
    organizations ||--o{ roles : "defines"
    roles ||--o{ role_permissions : "grants"
    permissions ||--o{ role_permissions : "assigned to"
```

### Relationship Explanations

| Relationship | Type | Description |
|-------------|------|-------------|
| `organizations` -> `user_organizations` | 1:N | An organization has many member records |
| `users` -> `user_organizations` | 1:N | A user can belong to multiple organizations |
| `roles` -> `user_organizations` | 1:N | A role is assigned to many user-org memberships |
| `organizations` -> `teams` | 1:N | An organization has many teams |
| `users` -> `teams` | 1:N | A user can lead many teams |
| `teams` -> `team_members` | 1:N | A team has many members |
| `users` -> `team_members` | 1:N | A user can be in many teams |
| `organizations` -> `roles` | 1:N | An organization defines custom roles |
| `roles` -> `role_permissions` | 1:N | A role has many permissions |
| `permissions` -> `role_permissions` | 1:N | A permission can be in many roles |

---

## 3. CRM Module: Leads, Contacts, Companies

```mermaid
erDiagram
    leads {
        uuid id PK
        uuid organization_id FK
        varchar first_name
        varchar last_name
        varchar email
        varchar phone
        varchar company_name
        varchar job_title
        varchar industry
        varchar source
        varchar status
        varchar stage
        integer score
        timestamptz score_updated_at
        uuid owner_user_id FK
        uuid team_id FK
        decimal budget
        decimal expected_revenue
        timestamptz conversion_date
        uuid converted_contact_id FK
        uuid converted_deal_id FK
        timestamptz assigned_at
        timestamptz last_contacted_at
        timestamptz next_follow_up_at
        jsonb custom_fields
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    contacts {
        uuid id PK
        uuid organization_id FK
        varchar first_name
        varchar last_name
        varchar email
        varchar phone
        varchar mobile
        varchar job_title
        varchar department
        uuid company_id FK
        uuid owner_user_id FK
        uuid lead_id FK
        date birthday
        varchar gender
        varchar language
        varchar address_line1
        varchar city
        varchar state
        varchar postal_code
        varchar country
        text linkedin_url
        text twitter_url
        jsonb custom_fields
        text[] tags
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    companies {
        uuid id PK
        uuid organization_id FK
        varchar name
        varchar domain
        varchar industry
        varchar sub_industry
        varchar size
        decimal revenue
        integer founded_year
        varchar phone
        varchar email
        text website
        text logo_url
        text description
        varchar ticker_symbol
        uuid parent_company_id FK
        uuid owner_user_id FK
        jsonb custom_fields
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    %% Relationships
    leads ||--o| contacts : "converts to"
    leads ||--o| deals : "converts to"
    leads }o--|| users : "owned by"
    leads }o--o| teams : "assigned to"
    leads }o--|| users : "created by"

    contacts }o--|| companies : "works at"
    contacts }o--|| users : "owned by"
    contacts }o--o| leads : "converted from"

    companies ||--o{ contacts : "has employees"
    companies ||--o{ deals : "has deals"
    companies }o--o| companies : "parent of"
    companies }o--|| users : "owned by"
```

### Relationship Explanations

| Relationship | Type | Description |
|-------------|------|-------------|
| `leads` -> `contacts` | 1:0..1 | A lead can be converted into a contact |
| `leads` -> `deals` | 1:0..1 | A lead can be converted into a deal |
| `leads` -> `users` (owner) | N:1 | A lead is assigned to one sales rep |
| `leads` -> `teams` | N:0..1 | A lead can be assigned to a team |
| `contacts` -> `companies` | N:1 | A contact works at one company |
| `contacts` -> `leads` | N:0..1 | A contact may have originated from a lead |
| `companies` -> `contacts` | 1:N | A company has many contacts |
| `companies` -> `companies` | 1:0..1 | Self-referencing parent company hierarchy |

---

## 4. Deals & Pipeline Module

```mermaid
erDiagram
    deals {
        uuid id PK
        uuid organization_id FK
        varchar title
        text description
        varchar stage
        varchar status
        decimal amount
        varchar currency
        integer probability
        date expected_close_date
        date actual_close_date
        uuid contact_id FK
        uuid company_id FK
        uuid owner_user_id FK
        uuid team_id FK
        uuid lead_id FK
        text lost_reason
        decimal ai_win_probability
        date ai_predicted_close_date
        jsonb custom_fields
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    %% Relationships
    deals }o--|| users : "owned by"
    deals }o--o| contacts : "contact"
    deals }o--o| companies : "company"
    deals }o--o| leads : "from lead"
    deals }o--o| teams : "assigned to"
```

### Relationship Explanations

| Relationship | Type | Description |
|-------------|------|-------------|
| `deals` -> `users` (owner) | N:1 | Each deal has one owner |
| `deals` -> `contacts` | N:0..1 | A deal is associated with one contact |
| `deals` -> `companies` | N:0..1 | A deal belongs to one company |
| `deals` -> `leads` | N:0..1 | A deal may have originated from a lead |
| `deals` -> `teams` | N:0..1 | A deal can be assigned to a team |

---

## 5. Commerce Module: Products, Orders, Invoices, Payments

```mermaid
erDiagram
    products {
        uuid id PK
        uuid organization_id FK
        varchar name
        varchar sku UK
        text description
        varchar category
        varchar type
        decimal price
        decimal cost
        varchar currency
        varchar unit
        decimal tax_rate
        boolean is_active
        text image_url
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    orders {
        uuid id PK
        uuid organization_id FK
        varchar order_number UK
        uuid deal_id FK
        uuid contact_id FK
        uuid company_id FK
        varchar status
        decimal subtotal
        decimal discount_amount
        decimal tax_amount
        decimal shipping_amount
        decimal total
        varchar currency
        varchar payment_status
        jsonb shipping_address
        jsonb billing_address
        text notes
        uuid owner_user_id FK
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    order_items {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        integer quantity
        decimal unit_price
        decimal discount_percent
        decimal tax_rate
        decimal total
        timestamptz created_at
        timestamptz updated_at
    }

    invoices {
        uuid id PK
        uuid organization_id FK
        varchar invoice_number UK
        uuid deal_id FK
        uuid contact_id FK
        uuid company_id FK
        uuid order_id FK
        varchar status
        varchar type
        date issue_date
        date due_date
        date paid_date
        decimal subtotal
        decimal discount_amount
        decimal tax_amount
        decimal total
        decimal amount_paid
        decimal amount_due
        varchar currency
        text notes
        text terms
        integer payment_terms_days
        jsonb billing_address
        jsonb shipping_address
        text pdf_url
        timestamptz sent_at
        timestamptz viewed_at
        uuid owner_user_id FK
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    invoice_items {
        uuid id PK
        uuid invoice_id FK
        uuid product_id FK
        varchar description
        integer quantity
        decimal unit_price
        decimal discount_percent
        decimal tax_rate
        decimal total
        timestamptz created_at
        timestamptz updated_at
    }

    payments {
        uuid id PK
        uuid organization_id FK
        uuid invoice_id FK
        decimal amount
        varchar currency
        varchar method
        varchar status
        varchar transaction_id
        timestamptz payment_date
        varchar reference
        text notes
        decimal refund_amount
        text refund_reason
        uuid processed_by FK
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    %% Relationships
    deals ||--o{ orders : "generates"
    orders ||--o{ order_items : "has items"
    products ||--o{ order_items : "referenced in"
    orders ||--o| invoices : "generates"
    deals ||--o{ invoices : "generates"
    invoices ||--o{ invoice_items : "has items"
    products ||--o{ invoice_items : "referenced in"
    invoices ||--o{ payments : "receives"
```

### Relationship Explanations

| Relationship | Type | Description |
|-------------|------|-------------|
| `deals` -> `orders` | 1:N | A deal can generate multiple orders |
| `orders` -> `order_items` | 1:N | An order has many line items |
| `products` -> `order_items` | 1:N | A product appears in many order items |
| `orders` -> `invoices` | 1:0..1 | An order generates one invoice |
| `deals` -> `invoices` | 1:N | A deal can have multiple invoices |
| `invoices` -> `invoice_items` | 1:N | An invoice has many line items |
| `invoices` -> `payments` | 1:N | An invoice receives multiple payments |

---

## 6. Communication Module: Messages, Emails, Notifications

```mermaid
erDiagram
    messages {
        uuid id PK
        uuid organization_id FK
        uuid conversation_id
        uuid sender_id FK
        uuid recipient_id FK
        varchar subject
        text body
        varchar type
        boolean is_read
        timestamptz read_at
        uuid parent_message_id FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    emails {
        uuid id PK
        uuid organization_id FK
        varchar direction
        varchar from_email
        varchar from_name
        text[] to_emails
        text[] cc_emails
        text[] bcc_emails
        varchar subject
        text body_text
        text body_html
        varchar status
        timestamptz sent_at
        timestamptz delivered_at
        timestamptz opened_at
        integer click_count
        jsonb attachments
        uuid contact_id FK
        uuid lead_id FK
        uuid deal_id FK
        uuid campaign_id FK
        varchar template_id
        uuid user_id FK
        varchar external_id
        varchar thread_id
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    notifications {
        uuid id PK
        uuid organization_id FK
        uuid user_id FK
        varchar title
        text message
        varchar type
        varchar category
        boolean is_read
        timestamptz read_at
        text action_url
        varchar entity_type
        uuid entity_id
        uuid sender_id FK
        jsonb metadata
        timestamptz created_at
        timestamptz updated_at
    }

    %% Relationships
    messages }o--|| users : "sender"
    messages }o--o| users : "recipient"
    messages ||--o{ messages : "threaded replies"

    emails }o--|| users : "owner"
    emails }o--o| contacts : "related contact"
    emails }o--o| leads : "related lead"
    emails }o--o| deals : "related deal"
    emails }o--o| campaigns : "from campaign"

    notifications }o--|| users : "recipient"
    notifications }o--o| users : "triggered by"
```

### Relationship Explanations

| Relationship | Type | Description |
|-------------|------|-------------|
| `messages` -> `users` (sender) | N:1 | Each message has one sender |
| `messages` -> `users` (recipient) | N:0..1 | Direct messages have one recipient |
| `messages` -> `messages` (thread) | 1:N | Self-referencing for threaded replies |
| `emails` -> `contacts` | N:0..1 | An email is related to one contact |
| `emails` -> `campaigns` | N:0..1 | Marketing emails link to campaigns |
| `notifications` -> `users` (recipient) | N:1 | Each notification goes to one user |

---

## 7. Tasks & Calendar Module

```mermaid
erDiagram
    tasks {
        uuid id PK
        uuid organization_id FK
        varchar title
        text description
        varchar status
        varchar priority
        varchar type
        timestamptz due_date
        timestamptz completed_at
        uuid assigned_to FK
        uuid assigned_by FK
        uuid team_id FK
        uuid contact_id FK
        uuid lead_id FK
        uuid deal_id FK
        uuid company_id FK
        uuid parent_task_id FK
        boolean is_recurring
        varchar recurrence_rule
        decimal estimated_hours
        decimal actual_hours
        text[] tags
        jsonb custom_fields
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    events {
        uuid id PK
        uuid organization_id FK
        varchar title
        text description
        varchar type
        timestamptz start_time
        timestamptz end_time
        boolean all_day
        varchar location
        varchar recurring_rule
        uuid owner_user_id FK
        uuid contact_id FK
        uuid deal_id FK
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    meetings {
        uuid id PK
        uuid organization_id FK
        varchar title
        text description
        varchar status
        timestamptz start_time
        timestamptz end_time
        varchar location
        text meeting_url
        varchar meeting_provider
        text meeting_notes
        text meeting_summary
        text recording_url
        uuid contact_id FK
        uuid deal_id FK
        uuid owner_user_id FK
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    meeting_attendees {
        uuid id PK
        uuid meeting_id FK
        uuid user_id FK
        uuid contact_id FK
        varchar email
        varchar name
        varchar status
        varchar role
        timestamptz created_at
        timestamptz updated_at
    }

    %% Relationships
    tasks ||--o{ tasks : "parent of subtasks"
    tasks }o--|| users : "assigned to"
    tasks }o--o| users : "assigned by"
    tasks }o--o| contacts : "related contact"
    tasks }o--o| leads : "related lead"
    tasks }o--o| deals : "related deal"

    events }o--|| users : "owned by"
    events }o--o| contacts : "related contact"

    meetings }o--|| users : "organized by"
    meetings }o--o| contacts : "with contact"
    meetings ||--o{ meeting_attendees : "has attendees"
    meeting_attendees }o--o| users : "user attendee"
    meeting_attendees }o--o| contacts : "contact attendee"
```

### Relationship Explanations

| Relationship | Type | Description |
|-------------|------|-------------|
| `tasks` -> `tasks` | 1:0..N | Self-referencing for subtasks |
| `tasks` -> `users` (assigned_to) | N:1 | A task is assigned to one user |
| `meetings` -> `meeting_attendees` | 1:N | A meeting has many attendees |
| `meeting_attendees` -> `users` | N:0..1 | Internal attendees are linked to users |
| `meeting_attendees` -> `contacts` | N:0..1 | External attendees are linked to contacts |

---

## 8. Marketing & Support Module

```mermaid
erDiagram
    campaigns {
        uuid id PK
        uuid organization_id FK
        varchar name
        text description
        varchar type
        varchar status
        varchar channel
        jsonb target_audience
        timestamptz start_date
        timestamptz end_date
        decimal budget
        decimal spent
        integer expected_leads
        integer actual_leads
        decimal expected_revenue
        decimal actual_revenue
        varchar email_subject
        text email_body
        text landing_page_url
        uuid owner_user_id FK
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    tickets {
        uuid id PK
        uuid organization_id FK
        varchar ticket_number UK
        varchar subject
        text description
        varchar status
        varchar priority
        varchar category
        varchar type
        varchar channel
        uuid contact_id FK
        uuid company_id FK
        uuid assigned_to FK
        uuid team_id FK
        uuid deal_id FK
        timestamptz first_response_at
        timestamptz resolved_at
        timestamptz sla_deadline
        boolean sla_breached
        integer satisfaction_rating
        text satisfaction_feedback
        text[] tags
        jsonb custom_fields
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    ticket_comments {
        uuid id PK
        uuid ticket_id FK
        uuid user_id FK
        uuid contact_id FK
        text body
        boolean is_internal
        jsonb attachments
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    %% Relationships
    campaigns }o--|| users : "owned by"

    tickets }o--o| contacts : "from customer"
    tickets }o--o| companies : "from company"
    tickets }o--|| users : "assigned to"
    tickets ||--o{ ticket_comments : "has comments"
    ticket_comments }o--o| users : "by agent"
    ticket_comments }o--o| contacts : "by customer"
```

---

## 9. System Module: Files, Comments, Tags, Activities, Audit Logs

```mermaid
erDiagram
    files {
        uuid id PK
        uuid organization_id FK
        varchar name
        varchar file_name
        varchar mime_type
        bigint size
        text url
        varchar path
        varchar entity_type
        uuid entity_id
        uuid uploaded_by FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    comments {
        uuid id PK
        uuid organization_id FK
        varchar entity_type
        uuid entity_id
        uuid user_id FK
        text body
        uuid parent_comment_id FK
        uuid[] mentions
        boolean is_edited
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    tags {
        uuid id PK
        uuid organization_id FK
        varchar name
        varchar color
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    entity_tags {
        uuid id PK
        uuid tag_id FK
        varchar entity_type
        uuid entity_id
        timestamptz created_at
    }

    activities {
        uuid id PK
        uuid organization_id FK
        uuid user_id FK
        varchar action
        varchar entity_type
        uuid entity_id
        text description
        jsonb changes
        jsonb metadata
        timestamptz created_at
    }

    audit_logs {
        uuid id PK
        uuid organization_id FK
        uuid user_id FK
        varchar action
        varchar entity_type
        uuid entity_id
        jsonb changes
        inet ip_address
        text user_agent
        jsonb metadata
        timestamptz created_at
    }

    %% Relationships
    files }o--|| users : "uploaded by"
    comments }o--|| users : "authored by"
    comments ||--o{ comments : "threaded replies"
    tags ||--o{ entity_tags : "tagged on"
    activities }o--o| users : "performed by"
    audit_logs }o--o| users : "performed by"
```

---

## 10. Billing & Settings Module

```mermaid
erDiagram
    plans {
        uuid id PK
        varchar name
        varchar slug UK
        text description
        decimal price_monthly
        decimal price_yearly
        varchar currency
        integer max_users
        integer max_contacts
        integer max_deals
        integer max_storage_gb
        jsonb features
        boolean is_active
        boolean is_custom
        varchar stripe_price_monthly
        varchar stripe_price_yearly
        timestamptz created_at
        timestamptz updated_at
    }

    subscriptions {
        uuid id PK
        uuid organization_id FK
        uuid plan_id FK
        varchar status
        varchar billing_cycle
        timestamptz current_period_start
        timestamptz current_period_end
        timestamptz trial_start
        timestamptz trial_end
        timestamptz cancel_at
        timestamptz canceled_at
        text cancel_reason
        varchar stripe_subscription_id
        varchar stripe_customer_id
        jsonb current_usage
        timestamptz created_at
        timestamptz updated_at
    }

    settings {
        uuid id PK
        uuid organization_id FK
        varchar key
        jsonb value
        varchar type
        varchar category
        text description
        boolean is_public
        timestamptz created_at
        timestamptz updated_at
    }

    api_keys {
        uuid id PK
        uuid organization_id FK
        uuid user_id FK
        varchar name
        varchar key_hash
        varchar key_prefix
        text[] scopes
        boolean is_active
        timestamptz last_used_at
        timestamptz expires_at
        integer rate_limit
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    workflows {
        uuid id PK
        uuid organization_id FK
        varchar name
        text description
        boolean is_active
        varchar trigger_type
        varchar trigger_entity
        jsonb trigger_conditions
        jsonb actions
        integer run_count
        timestamptz last_run_at
        text last_error
        uuid owner_user_id FK
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    reports {
        uuid id PK
        uuid organization_id FK
        varchar name
        text description
        varchar type
        jsonb config
        jsonb data
        boolean is_public
        boolean is_scheduled
        varchar schedule_cron
        timestamptz last_generated_at
        uuid owner_user_id FK
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    %% Relationships
    plans ||--o{ subscriptions : "subscribed to"
    organizations ||--o{ subscriptions : "has"
    organizations ||--o{ settings : "configured by"
    organizations ||--o{ api_keys : "has"
    organizations ||--o{ workflows : "has"
    organizations ||--o{ reports : "has"
    users ||--o{ api_keys : "created"
    users ||--o{ workflows : "owns"
```

---

## 11. Full System ER Diagram

The following diagram shows all major entities and their relationships across the entire system. Polymorphic relationships (files, comments, tags, activities) connect to multiple entity types.

```mermaid
erDiagram
    %% ===== CORE ENTITIES =====
    organizations ||--o{ user_organizations : "members"
    organizations ||--o{ teams : "teams"
    organizations ||--o{ roles : "roles"
    organizations ||--o{ leads : "leads"
    organizations ||--o{ contacts : "contacts"
    organizations ||--o{ companies : "companies"
    organizations ||--o{ deals : "deals"
    organizations ||--o{ tasks : "tasks"
    organizations ||--o{ events : "events"
    organizations ||--o{ meetings : "meetings"
    organizations ||--o{ messages : "messages"
    organizations ||--o{ emails : "emails"
    organizations ||--o{ notifications : "notifications"
    organizations ||--o{ campaigns : "campaigns"
    organizations ||--o{ tickets : "tickets"
    organizations ||--o{ reports : "reports"
    organizations ||--o{ audit_logs : "audit trail"
    organizations ||--o{ api_keys : "api keys"
    organizations ||--o{ settings : "settings"
    organizations ||--o{ files : "files"
    organizations ||--o{ comments : "comments"
    organizations ||--o{ tags : "tags"
    organizations ||--o{ activities : "activity log"
    organizations ||--o{ workflows : "workflows"
    organizations ||--o{ subscriptions : "subscriptions"

    %% ===== USER RELATIONSHIPS =====
    users ||--o{ user_organizations : "org memberships"
    users ||--o{ teams : "leads"
    users ||--o{ team_members : "team memberships"
    users ||--o{ leads : "owns"
    users ||--o{ contacts : "owns"
    users ||--o{ companies : "owns"
    users ||--o{ deals : "owns"
    users ||--o{ tasks : "assigned tasks"
    users ||--o{ events : "owns"
    users ||--o{ meetings : "organizes"
    users ||--o{ messages : "sends"
    users ||--o{ notifications : "receives"
    users ||--o{ api_keys : "creates"

    %% ===== ROLE / PERMISSION =====
    roles ||--o{ user_organizations : "assignments"
    roles ||--o{ role_permissions : "grants"
    permissions ||--o{ role_permissions : "assigned to"

    %% ===== CRM =====
    leads ||--o| contacts : "converts to"
    leads ||--o| deals : "converts to"
    contacts }o--|| companies : "works at"
    companies ||--o{ contacts : "employees"
    companies ||--o{ deals : "deals"
    companies ||--o| companies : "parent company"

    %% ===== DEALS =====
    deals }o--o| contacts : "contact"
    deals }o--o| companies : "company"
    deals ||--o{ orders : "orders"
    deals ||--o{ invoices : "invoices"

    %% ===== COMMERCE =====
    orders ||--o{ order_items : "items"
    products ||--o{ order_items : "referenced in"
    orders ||--o| invoices : "generates"
    invoices ||--o{ invoice_items : "items"
    products ||--o{ invoice_items : "referenced in"
    invoices ||--o{ payments : "payments"

    %% ===== TASKS =====
    tasks ||--o{ tasks : "subtasks"
    tasks }o--o| contacts : "related"
    tasks }o--o| leads : "related"
    tasks }o--o| deals : "related"

    %% ===== MEETINGS =====
    meetings ||--o{ meeting_attendees : "attendees"

    %% ===== COMMUNICATION =====
    messages ||--o{ messages : "replies"
    emails }o--o| contacts : "related"
    emails }o--o| campaigns : "from campaign"
    notifications }o--|| users : "recipient"

    %% ===== SUPPORT =====
    tickets }o--o| contacts : "customer"
    tickets ||--o{ ticket_comments : "comments"

    %% ===== SYSTEM =====
    tags ||--o{ entity_tags : "tagged on"

    %% ===== BILLING =====
    plans ||--o{ subscriptions : "plan"
```

---

## 12. Relationship Reference Table

### All Relationships with Cardinality

| Parent Entity | Child Entity | Cardinality | FK Column | Description |
|--------------|-------------|-------------|-----------|-------------|
| organizations | users (via user_organizations) | M:N | organization_id, user_id | Users belong to multiple orgs |
| organizations | teams | 1:N | organization_id | Org has many teams |
| organizations | roles | 1:N | organization_id | Org defines custom roles |
| organizations | leads | 1:N | organization_id | Org has many leads |
| organizations | contacts | 1:N | organization_id | Org has many contacts |
| organizations | companies | 1:N | organization_id | Org has many companies |
| organizations | deals | 1:N | organization_id | Org has many deals |
| organizations | products | 1:N | organization_id | Org has product catalog |
| organizations | orders | 1:N | organization_id | Org has many orders |
| organizations | invoices | 1:N | organization_id | Org has many invoices |
| organizations | payments | 1:N | organization_id | Org has many payments |
| organizations | campaigns | 1:N | organization_id | Org has many campaigns |
| organizations | tasks | 1:N | organization_id | Org has many tasks |
| organizations | events | 1:N | organization_id | Org has many events |
| organizations | meetings | 1:N | organization_id | Org has many meetings |
| organizations | messages | 1:N | organization_id | Org has many messages |
| organizations | emails | 1:N | organization_id | Org tracks many emails |
| organizations | notifications | 1:N | organization_id | Org has many notifications |
| organizations | tickets | 1:N | organization_id | Org has many tickets |
| organizations | reports | 1:N | organization_id | Org has many reports |
| organizations | audit_logs | 1:N | organization_id | Org has audit trail |
| organizations | api_keys | 1:N | organization_id | Org has API keys |
| organizations | settings | 1:N | organization_id | Org has many settings |
| organizations | files | 1:N | organization_id | Org has many files |
| organizations | comments | 1:N | organization_id | Org has many comments |
| organizations | tags | 1:N | organization_id | Org has many tags |
| organizations | activities | 1:N | organization_id | Org has activity log |
| organizations | workflows | 1:N | organization_id | Org has automations |
| organizations | subscriptions | 1:1 | organization_id | One active subscription |
| organizations | plans (via subscriptions) | M:N | subscription.plan_id | Subscriptions link to plans |
| roles | user_organizations | 1:N | role_id | Role assigned to users |
| permissions | role_permissions | 1:N | permission_id | Permission in many roles |
| roles | role_permissions | 1:N | role_id | Role grants permissions |
| teams | team_members | 1:N | team_id | Team has members |
| users | team_members | 1:N | user_id | User in many teams |
| users | leads | 1:N | owner_user_id | User owns many leads |
| users | contacts | 1:N | owner_user_id | User owns many contacts |
| users | companies | 1:N | owner_user_id | User owns many companies |
| users | deals | 1:N | owner_user_id | User owns many deals |
| users | tasks (assigned_to) | 1:N | assigned_to | User has many tasks |
| users | tasks (assigned_by) | 1:N | assigned_by | User assigns many tasks |
| users | events | 1:N | owner_user_id | User owns many events |
| users | meetings | 1:N | owner_user_id | User organizes meetings |
| users | messages (sender) | 1:N | sender_id | User sends many messages |
| users | messages (recipient) | 1:N | recipient_id | User receives messages |
| users | notifications | 1:N | user_id | User receives notifications |
| users | emails | 1:N | user_id | User owns emails |
| users | api_keys | 1:N | user_id | User creates API keys |
| users | audit_logs | 1:N | user_id | User generates audit logs |
| leads | contacts | 1:0..1 | converted_contact_id | Lead converts to contact |
| leads | deals | 1:0..1 | converted_deal_id | Lead converts to deal |
| contacts | companies | N:1 | company_id | Contact works at company |
| companies | companies | 1:0..1 | parent_company_id | Parent-subsidiary hierarchy |
| deals | contacts | N:0..1 | contact_id | Deal linked to contact |
| deals | companies | N:0..1 | company_id | Deal linked to company |
| deals | orders | 1:N | deal_id | Deal generates orders |
| deals | invoices | 1:N | deal_id | Deal generates invoices |
| products | order_items | 1:N | product_id | Product in order items |
| products | invoice_items | 1:N | product_id | Product in invoice items |
| orders | order_items | 1:N | order_id | Order has line items |
| orders | invoices | 1:0..1 | order_id | Order generates invoice |
| invoices | invoice_items | 1:N | invoice_id | Invoice has line items |
| invoices | payments | 1:N | invoice_id | Invoice has payments |
| tasks | tasks | 1:0..N | parent_task_id | Task has subtasks |
| tasks | contacts | N:0..1 | contact_id | Task related to contact |
| tasks | leads | N:0..1 | lead_id | Task related to lead |
| tasks | deals | N:0..1 | deal_id | Task related to deal |
| meetings | meeting_attendees | 1:N | meeting_id | Meeting has attendees |
| campaigns | emails | 1:N | campaign_id | Campaign sends emails |
| tickets | ticket_comments | 1:N | ticket_id | Ticket has comments |
| tickets | contacts | N:0..1 | contact_id | Ticket from customer |
| tickets | users | N:1 | assigned_to | Ticket assigned to agent |
| tags | entity_tags | 1:N | tag_id | Tag applied to entities |
| messages | messages | 1:N | parent_message_id | Threaded replies |
| comments | comments | 1:N | parent_comment_id | Threaded comments |

### Polymorphic Relationships

Several tables use polymorphic associations (entity_type + entity_id) to connect to any entity:

| Table | entity_type values | Description |
|-------|--------------------|-------------|
| `files` | leads, contacts, companies, deals, tasks, meetings, tickets, campaigns | Attachments on any entity |
| `comments` | leads, contacts, companies, deals, tasks, meetings, tickets, campaigns, orders, invoices | Comments on any entity |
| `entity_tags` | leads, contacts, companies, deals, tasks, campaigns, tickets | Tags on any entity |
| `activities` | leads, contacts, companies, deals, tasks, meetings, campaigns, tickets, orders, invoices | Activity timeline on any entity |
| `audit_logs` | users, leads, contacts, companies, deals, tasks, campaigns, tickets, settings, roles | Audit trail for any entity |
| `notifications` | leads, deals, tasks, meetings, tickets, comments, orders, invoices | Notifications for any entity |
| `emails` | (via contact_id, lead_id, deal_id, campaign_id) | Emails linked to specific entities |

### Cascade Rules

| Parent | Child | On Delete | On Update |
|--------|-------|-----------|-----------|
| organizations | (all child tables) | RESTRICT | CASCADE |
| users | user_organizations | CASCADE | CASCADE |
| users | team_members | CASCADE | CASCADE |
| roles | user_organizations | RESTRICT | CASCADE |
| roles | role_permissions | CASCADE | CASCADE |
| permissions | role_permissions | CASCADE | CASCADE |
| teams | team_members | CASCADE | CASCADE |
| orders | order_items | CASCADE | CASCADE |
| invoices | invoice_items | CASCADE | CASCADE |
| invoices | payments | RESTRICT | CASCADE |
| meetings | meeting_attendees | CASCADE | CASCADE |
| tickets | ticket_comments | CASCADE | CASCADE |
| tags | entity_tags | CASCADE | CASCADE |
| (any) | files | SET NULL | CASCADE |
| (any) | comments | SET NULL | CASCADE |
| (any) | activities | RESTRICT | CASCADE |
| (any) | audit_logs | RESTRICT | CASCADE |
