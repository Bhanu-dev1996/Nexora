# Database Design

## NovaCRM AI - Enterprise AI-Powered CRM Platform

Version: 1.0
Document Type: Database Schema Reference
Status: Draft

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Naming Conventions](#2-naming-conventions)
3. [Common Columns](#3-common-columns)
4. [Table Definitions](#4-table-definitions)
5. [Index Strategy](#5-index-strategy)
6. [Soft Delete Pattern](#6-soft-delete-pattern)
7. [Migration Strategy](#7-migration-strategy)

---

## 1. Design Principles

| Principle | Implementation |
|-----------|---------------|
| **UUID Primary Keys** | All tables use `UUID` (v4) as primary key. Generated server-side via `gen_random_uuid()`. |
| **Snake Case** | All table and column names use `snake_case` (PostgreSQL convention). |
| **Timestamps** | Every table has `created_at` and `updated_at` columns. |
| **Soft Deletes** | All business-critical tables use `deleted_at` timestamp instead of hard deletes. |
| **Multi-Tenancy** | Every data table has an `organization_id` foreign key for data isolation. |
| **Referential Integrity** | Foreign keys enforce relationships. ON DELETE is `SET NULL` or `RESTRICT`. |
| **Indexes** | Composite indexes on `(organization_id, status)` and `(organization_id, created_at)` for filtered queries. |
| **No Orphan Records** | Cascade rules prevent orphaned child records. |

---

## 2. Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Tables | Plural, snake_case | `lead_activities`, `user_roles` |
| Columns | Singular, snake_case | `first_name`, `created_at` |
| Primary Keys | `id` (UUID) | `id UUID PRIMARY KEY` |
| Foreign Keys | `{entity}_id` | `organization_id`, `user_id` |
| Join Tables | `{entity1}_{entity2}` (alphabetical) | `user_roles`, `tag_contacts` |
| Indexes | `idx_{table}_{columns}` | `idx_leads_org_status` |
| Unique Constraints | `uq_{table}_{columns}` | `uq_users_org_email` |
| Check Constraints | `chk_{table}_{rule}` | `chk_deals_stage` |
| Enums | Singular, PascalCase (in Prisma) or `snake_case` values | `LeadStatus.NEW` |

---

## 3. Common Columns

Every table includes:

```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

Business tables additionally include:

```sql
organization_id UUID NOT NULL REFERENCES organizations(id),
deleted_at      TIMESTAMPTZ  -- soft delete (NULL = active)
```

---

## 4. Table Definitions

### 4.1 organizations

Top-level tenant. Every piece of data belongs to an organization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| `name` | VARCHAR(255) | NOT NULL | Organization name |
| `slug` | VARCHAR(255) | NOT NULL, UNIQUE | URL-friendly identifier |
| `domain` | VARCHAR(255) | UNIQUE | Company domain (e.g., acme.com) |
| `logo_url` | TEXT | | Organization logo |
| `industry` | VARCHAR(100) | | Industry classification |
| `size` | VARCHAR(50) | | Employee count range (1-10, 11-50, etc.) |
| `phone` | VARCHAR(20) | | Main phone number |
| `email` | VARCHAR(255) | | Main contact email |
| `website` | TEXT | | Company website |
| `address_line1` | VARCHAR(255) | | Street address |
| `address_line2` | VARCHAR(255) | | Suite/floor |
| `city` | VARCHAR(100) | | City |
| `state` | VARCHAR(100) | | State/province |
| `postal_code` | VARCHAR(20) | | Postal/zip code |
| `country` | VARCHAR(100) | DEFAULT 'US' | Country |
| `timezone` | VARCHAR(50) | DEFAULT 'America/New_York' | Default timezone |
| `locale` | VARCHAR(10) | DEFAULT 'en' | Language preference |
| `currency` | VARCHAR(3) | DEFAULT 'USD' | ISO 4217 currency code |
| `subscription_id` | UUID | FK -> subscriptions(id) | Current subscription |
| `settings` | JSONB | DEFAULT '{}' | Organization-level settings |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |
| `deleted_at` | TIMESTAMPTZ | | Soft delete timestamp |

**Indexes:**
- `uq_organizations_slug` UNIQUE on `slug`
- `uq_organizations_domain` UNIQUE on `domain`

---

### 4.2 users

System users who belong to one or more organizations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Login email |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `first_name` | VARCHAR(100) | NOT NULL | First name |
| `last_name` | VARCHAR(100) | NOT NULL | Last name |
| `avatar_url` | TEXT | | Profile picture URL |
| `phone` | VARCHAR(20) | | Phone number |
| `job_title` | VARCHAR(100) | | Job title |
| `is_active` | BOOLEAN | DEFAULT true | Account active flag |
| `email_verified_at` | TIMESTAMPTZ | | Email verification timestamp |
| `phone_verified_at` | TIMESTAMPTZ | | Phone verification timestamp |
| `mfa_enabled` | BOOLEAN | DEFAULT false | MFA enabled flag |
| `mfa_secret` | VARCHAR(255) | | TOTP secret (encrypted) |
| `last_login_at` | TIMESTAMPTZ | | Last login timestamp |
| `last_login_ip` | INET | | Last login IP address |
| `password_changed_at` | TIMESTAMPTZ | | Password last changed |
| `settings` | JSONB | DEFAULT '{}' | User preferences (theme, locale, etc.) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | Soft delete |

**Indexes:**
- `uq_users_email` UNIQUE on `email`
- `idx_users_active` on `is_active` WHERE `is_active = true`

---

### 4.3 user_organizations

Join table for multi-tenancy. Users can belong to multiple organizations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `user_id` | UUID | NOT NULL, FK -> users(id) | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `role_id` | UUID | NOT NULL, FK -> roles(id) | Role within this org |
| `is_default` | BOOLEAN | DEFAULT false | Default organization |
| `status` | VARCHAR(20) | DEFAULT 'active', CHECK IN ('active','inactive','pending') | Membership status |
| `joined_at` | TIMESTAMPTZ | DEFAULT NOW() | When user joined org |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `uq_user_org` UNIQUE on `(user_id, organization_id)`
- `idx_user_org_org` on `organization_id`

---

### 4.4 teams

Teams within an organization for grouping users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `name` | VARCHAR(255) | NOT NULL | Team name |
| `description` | TEXT | | Team description |
| `lead_user_id` | UUID | FK -> users(id) | Team lead/manager |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | |

**Indexes:**
- `idx_teams_org` on `organization_id`
- `uq_teams_org_name` UNIQUE on `(organization_id, name)` WHERE `deleted_at IS NULL`

---

### 4.5 team_members

Join table for team membership.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `team_id` | UUID | NOT NULL, FK -> teams(id) | |
| `user_id` | UUID | NOT NULL, FK -> users(id) | |
| `role` | VARCHAR(50) | DEFAULT 'member' | Role within team (lead, member) |
| `joined_at` | TIMESTAMPTZ | DEFAULT NOW() | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `uq_team_member` UNIQUE on `(team_id, user_id)`
- `idx_team_members_user` on `user_id`

---

### 4.6 roles

RBAC roles within an organization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | FK -> organizations(id) | NULL for system roles |
| `name` | VARCHAR(100) | NOT NULL | Role display name |
| `slug` | VARCHAR(100) | NOT NULL | Role identifier |
| `description` | TEXT | | Role description |
| `is_system` | BOOLEAN | DEFAULT false | Built-in role (cannot delete) |
| `is_default` | BOOLEAN | DEFAULT false | Assigned to new users |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | |

**Indexes:**
- `uq_roles_org_slug` UNIQUE on `(organization_id, slug)` WHERE `deleted_at IS NULL`
- `idx_roles_org` on `organization_id`

**Predefined System Roles:**
- `super_admin` - Full system access
- `org_admin` - Organization administrator
- `sales_manager` - Sales team management
- `sales_executive` - Lead and deal management
- `marketing_manager` - Campaign management
- `support_agent` - Customer support
- `hr` - Human resources
- `finance` - Financial management
- `viewer` - Read-only access

---

### 4.7 permissions

Available permissions in the system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `resource` | VARCHAR(50) | NOT NULL | Resource name (e.g., 'leads', 'deals') |
| `action` | VARCHAR(50) | NOT NULL | Action (e.g., 'create', 'read', 'update', 'delete') |
| `description` | TEXT | | Human-readable description |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `uq_permissions_resource_action` UNIQUE on `(resource, action)`

---

### 4.8 role_permissions

Join table linking roles to permissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `role_id` | UUID | NOT NULL, FK -> roles(id) ON DELETE CASCADE | |
| `permission_id` | UUID | NOT NULL, FK -> permissions(id) ON DELETE CASCADE | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `uq_role_permission` UNIQUE on `(role_id, permission_id)`
- `idx_role_permissions_role` on `role_id`

---

### 4.9 leads

Potential customers or prospects.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `first_name` | VARCHAR(100) | NOT NULL | Lead first name |
| `last_name` | VARCHAR(100) | NOT NULL | Lead last name |
| `email` | VARCHAR(255) | | Email address |
| `phone` | VARCHAR(20) | | Phone number |
| `company_name` | VARCHAR(255) | | Company name |
| `job_title` | VARCHAR(100) | | Job title |
| `website` | TEXT | | Company website |
| `industry` | VARCHAR(100) | | Industry |
| `source` | VARCHAR(50) | | How they found us (web, referral, ad, etc.) |
| `status` | VARCHAR(30) | DEFAULT 'new' | NEW, CONTACTED, QUALIFIED, UNQUALIFIED, CONVERTED, LOST |
| `stage` | VARCHAR(50) | | Pipeline stage |
| `score` | INTEGER | DEFAULT 0 | AI-generated lead score (0-100) |
| `score_updated_at` | TIMESTAMPTZ | | When score was last computed |
| `owner_user_id` | UUID | FK -> users(id) | Assigned sales rep |
| `team_id` | UUID | FK -> teams(id) | Assigned team |
| `budget` | DECIMAL(12,2) | | Estimated budget |
| `expected_revenue` | DECIMAL(12,2) | | Expected revenue |
| `conversion_date` | TIMESTAMPTZ | | When converted to contact/deal |
| `converted_contact_id` | UUID | FK -> contacts(id) | Converted contact |
| `converted_deal_id` | UUID | FK -> deals(id) | Converted deal |
| `assigned_at` | TIMESTAMPTZ | | When last assigned |
| `last_contacted_at` | TIMESTAMPTZ | | Last contact date |
| `next_follow_up_at` | TIMESTAMPTZ | | Next scheduled follow-up |
| `address_line1` | VARCHAR(255) | | |
| `address_line2` | VARCHAR(255) | | |
| `city` | VARCHAR(100) | | |
| `state` | VARCHAR(100) | | |
| `postal_code` | VARCHAR(20) | | |
| `country` | VARCHAR(100) | | |
| `custom_fields` | JSONB | DEFAULT '{}' | Dynamic custom field values |
| `created_by` | UUID | FK -> users(id) | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | |

**Indexes:**
- `idx_leads_org` on `organization_id`
- `idx_leads_org_status` on `(organization_id, status)`
- `idx_leads_org_owner` on `(organization_id, owner_user_id)`
- `idx_leads_org_created` on `(organization_id, created_at DESC)`
- `idx_leads_score` on `(organization_id, score DESC)` WHERE `deleted_at IS NULL`

---

### 4.10 contacts

Confirmed contacts / customers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `first_name` | VARCHAR(100) | NOT NULL | |
| `last_name` | VARCHAR(100) | NOT NULL | |
| `email` | VARCHAR(255) | | |
| `phone` | VARCHAR(20) | | |
| `mobile` | VARCHAR(20) | | |
| `job_title` | VARCHAR(100) | | |
| `department` | VARCHAR(100) | | |
| `company_id` | UUID | FK -> companies(id) | Associated company |
| `owner_user_id` | UUID | FK -> users(id) | Account owner |
| `lead_id` | UUID | FK -> leads(id) | Source lead (if converted) |
| `birthday` | DATE | | Date of birth |
| `gender` | VARCHAR(20) | | Gender |
| `language` | VARCHAR(10) | DEFAULT 'en' | Preferred language |
| `address_line1` | VARCHAR(255) | | |
| `address_line2` | VARCHAR(255) | | |
| `city` | VARCHAR(100) | | |
| `state` | VARCHAR(100) | | |
| `postal_code` | VARCHAR(20) | | |
| `country` | VARCHAR(100) | | |
| `linkedin_url` | TEXT | | LinkedIn profile |
| `twitter_url` | TEXT | | Twitter profile |
| `facebook_url` | TEXT | | Facebook profile |
| `custom_fields` | JSONB | DEFAULT '{}' | |
| `tags` | TEXT[] | DEFAULT '{}' | Denormalized tags for fast search |
| `created_by` | UUID | FK -> users(id) | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | |

**Indexes:**
- `idx_contacts_org` on `organization_id`
- `idx_contacts_org_company` on `(organization_id, company_id)`
- `idx_contacts_org_owner` on `(organization_id, owner_user_id)`
- `idx_contacts_email` on `(organization_id, email)` WHERE `email IS NOT NULL`

---

### 4.11 companies

Business accounts / organizations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `name` | VARCHAR(255) | NOT NULL | Company name |
| `domain` | VARCHAR(255) | | Company website domain |
| `industry` | VARCHAR(100) | | Industry classification |
| `sub_industry` | VARCHAR(100) | | Sub-industry |
| `size` | VARCHAR(50) | | Employee count range |
| `revenue` | DECIMAL(15,2) | | Annual revenue |
| `founded_year` | INTEGER | | Year founded |
| `phone` | VARCHAR(20) | | Main phone |
| `email` | VARCHAR(255) | | Main email |
| `website` | TEXT | | Company website |
| `logo_url` | TEXT | | Company logo |
| `description` | TEXT | | Company description |
| `ticker_symbol` | VARCHAR(10) | | Stock ticker |
| `parent_company_id` | UUID | FK -> companies(id) | Parent company |
| `owner_user_id` | UUID | FK -> users(id) | Account owner |
| `billing_address_line1` | VARCHAR(255) | | |
| `billing_city` | VARCHAR(100) | | |
| `billing_state` | VARCHAR(100) | | |
| `billing_postal_code` | VARCHAR(20) | | |
| `billing_country` | VARCHAR(100) | | |
| `shipping_address_line1` | VARCHAR(255) | | |
| `shipping_city` | VARCHAR(100) | | |
| `shipping_state` | VARCHAR(100) | | |
| `shipping_postal_code` | VARCHAR(20) | | |
| `shipping_country` | VARCHAR(100) | | |
| `custom_fields` | JSONB | DEFAULT '{}' | |
| `created_by` | UUID | FK -> users(id) | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | |

**Indexes:**
- `idx_companies_org` on `organization_id`
- `idx_companies_org_name` on `(organization_id, name)`
- `uq_companies_org_domain` UNIQUE on `(organization_id, domain)` WHERE `domain IS NOT NULL AND deleted_at IS NULL`

---

### 4.12 deals

Sales opportunities / deals in the pipeline.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `title` | VARCHAR(255) | NOT NULL | Deal name |
| `description` | TEXT | | Deal description |
| `stage` | VARCHAR(50) | NOT NULL, DEFAULT 'qualification' | Pipeline stage |
| `status` | VARCHAR(30) | DEFAULT 'open' | OPEN, WON, LOST, ABANDONED |
| `amount` | DECIMAL(12,2) | | Deal value |
| `currency` | VARCHAR(3) | DEFAULT 'USD' | |
| `probability` | INTEGER | DEFAULT 0 | Win probability (0-100) |
| `expected_close_date` | DATE | | Expected close date |
| `actual_close_date` | DATE | | Actual close date |
| `contact_id` | UUID | FK -> contacts(id) | Primary contact |
| `company_id` | UUID | FK -> companies(id) | Associated company |
| `owner_user_id` | UUID | FK -> users(id) | Deal owner |
| `team_id` | UUID | FK -> teams(id) | Assigned team |
| `lead_id` | UUID | FK -> leads(id) | Source lead |
| `lost_reason` | TEXT | | Reason for loss |
| `competitor_notes` | TEXT | | Competitive intelligence |
| `ai_win_probability` | DECIMAL(5,2) | | AI-predicted win probability |
| `ai_predicted_close_date` | DATE | | AI-predicted close date |
| `ai_score_updated_at` | TIMESTAMPTZ | | |
| `custom_fields` | JSONB | DEFAULT '{}' | |
| `created_by` | UUID | FK -> users(id) | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | |

**Indexes:**
- `idx_deals_org` on `organization_id`
- `idx_deals_org_stage` on `(organization_id, stage)`
- `idx_deals_org_status` on `(organization_id, status)`
- `idx_deals_org_owner` on `(organization_id, owner_user_id)`
- `idx_deals_org_close_date` on `(organization_id, expected_close_date)`

---

### 4.13 products

Product catalog for deals, orders, and invoices.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `name` | VARCHAR(255) | NOT NULL | Product name |
| `sku` | VARCHAR(100) | | Stock keeping unit |
| `description` | TEXT | | Product description |
| `category` | VARCHAR(100) | | Product category |
| `type` | VARCHAR(50) | DEFAULT 'product' | PRODUCT, SERVICE, SUBSCRIPTION |
| `price` | DECIMAL(12,2) | NOT NULL | Unit price |
| `cost` | DECIMAL(12,2) | | Unit cost |
| `currency` | VARCHAR(3) | DEFAULT 'USD' | |
| `unit` | VARCHAR(50) | DEFAULT 'unit' | Unit of measure |
| `tax_rate` | DECIMAL(5,2) | DEFAULT 0 | Tax percentage |
| `is_active` | BOOLEAN | DEFAULT true | Available for sale |
| `image_url` | TEXT | | Product image |
| `created_by` | UUID | FK -> users(id) | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | |

**Indexes:**
- `idx_products_org` on `organization_id`
- `uq_products_org_sku` UNIQUE on `(organization_id, sku)` WHERE `sku IS NOT NULL AND deleted_at IS NULL`

---

### 4.14 orders

Customer orders linked to deals.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `order_number` | VARCHAR(50) | NOT NULL | Auto-generated order number |
| `deal_id` | UUID | FK -> deals(id) | Source deal |
| `contact_id` | UUID | FK -> contacts(id) | Customer |
| `company_id` | UUID | FK -> companies(id) | Company |
| `status` | VARCHAR(30) | DEFAULT 'draft' | DRAFT, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED |
| `subtotal` | DECIMAL(12,2) | NOT NULL | Subtotal before tax/discount |
| `discount_amount` | DECIMAL(12,2) | DEFAULT 0 | Discount amount |
| `tax_amount` | DECIMAL(12,2) | DEFAULT 0 | Tax amount |
| `shipping_amount` | DECIMAL(12,2) | DEFAULT 0 | Shipping cost |
| `total` | DECIMAL(12,2) | NOT NULL | Order total |
| `currency` | VARCHAR(3) | DEFAULT 'USD' | |
| `payment_status` | VARCHAR(30) | DEFAULT 'unpaid' | UNPAID, PARTIALLY_PAID, PAID, REFUNDED |
| `shipping_address` | JSONB | | Shipping address object |
| `billing_address` | JSONB | | Billing address object |
| `notes` | TEXT | | Order notes |
| `owner_user_id` | UUID | FK -> users(id) | |
| `created_by` | UUID | FK -> users(id) | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | |

**Indexes:**
- `idx_orders_org` on `organization_id`
- `idx_orders_org_status` on `(organization_id, status)`
- `uq_orders_org_number` UNIQUE on `(organization_id, order_number)`

---

### 4.15 order_items

Individual line items in an order.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `order_id` | UUID | NOT NULL, FK -> orders(id) ON DELETE CASCADE | |
| `product_id` | UUID | NOT NULL, FK -> products(id) | |
| `quantity` | INTEGER | NOT NULL, DEFAULT 1 | |
| `unit_price` | DECIMAL(12,2) | NOT NULL | Price at time of order |
| `discount_percent` | DECIMAL(5,2) | DEFAULT 0 | Line item discount |
| `tax_rate` | DECIMAL(5,2) | DEFAULT 0 | |
| `total` | DECIMAL(12,2) | NOT NULL | Line total |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_order_items_order` on `order_id`

---

### 4.16 invoices

Billing invoices.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `invoice_number` | VARCHAR(50) | NOT NULL | Auto-generated |
| `deal_id` | UUID | FK -> deals(id) | |
| `contact_id` | UUID | FK -> contacts(id) | Customer |
| `company_id` | UUID | FK -> companies(id) | |
| `order_id` | UUID | FK -> orders(id) | |
| `status` | VARCHAR(30) | DEFAULT 'draft' | DRAFT, SENT, VIEWED, PAID, PARTIALLY_PAID, OVERDUE, CANCELLED |
| `type` | VARCHAR(20) | DEFAULT 'invoice' | INVOICE, CREDIT_NOTE, PROFORMA |
| `issue_date` | DATE | NOT NULL | |
| `due_date` | DATE | NOT NULL | |
| `paid_date` | DATE | | |
| `subtotal` | DECIMAL(12,2) | NOT NULL | |
| `discount_amount` | DECIMAL(12,2) | DEFAULT 0 | |
| `tax_amount` | DECIMAL(12,2) | DEFAULT 0 | |
| `total` | DECIMAL(12,2) | NOT NULL | |
| `amount_paid` | DECIMAL(12,2) | DEFAULT 0 | Amount received |
| `amount_due` | DECIMAL(12,2) | NOT NULL | Remaining balance |
| `currency` | VARCHAR(3) | DEFAULT 'USD' | |
| `notes` | TEXT | | Invoice notes |
| `terms` | TEXT | | Payment terms |
| `payment_terms_days` | INTEGER | DEFAULT 30 | Net days |
| `billing_address` | JSONB | | |
| `shipping_address` | JSONB | | |
| `pdf_url` | TEXT | | Generated PDF link |
| `sent_at` | TIMESTAMPTZ | | When sent to customer |
| `viewed_at` | TIMESTAMPTZ | | When customer viewed |
| `owner_user_id` | UUID | FK -> users(id) | |
| `created_by` | UUID | FK -> users(id) | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | |

**Indexes:**
- `idx_invoices_org` on `organization_id`
- `idx_invoices_org_status` on `(organization_id, status)`
- `idx_invoices_org_due_date` on `(organization_id, due_date)`
- `uq_invoices_org_number` UNIQUE on `(organization_id, invoice_number)`

---

### 4.17 invoice_items

Line items on an invoice.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `invoice_id` | UUID | NOT NULL, FK -> invoices(id) ON DELETE CASCADE | |
| `product_id` | UUID | FK -> products(id) | |
| `description` | VARCHAR(500) | NOT NULL | Line item description |
| `quantity` | INTEGER | NOT NULL, DEFAULT 1 | |
| `unit_price` | DECIMAL(12,2) | NOT NULL | |
| `discount_percent` | DECIMAL(5,2) | DEFAULT 0 | |
| `tax_rate` | DECIMAL(5,2) | DEFAULT 0 | |
| `total` | DECIMAL(12,2) | NOT NULL | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_invoice_items_invoice` on `invoice_id`

---

### 4.18 payments

Payment records against invoices.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `invoice_id` | UUID | NOT NULL, FK -> invoices(id) | |
| `amount` | DECIMAL(12,2) | NOT NULL | Payment amount |
| `currency` | VARCHAR(3) | DEFAULT 'USD' | |
| `method` | VARCHAR(30) | | CREDIT_CARD, BANK_TRANSFER, CASH, CHECK, STRIPE, PAYPAL |
| `status` | VARCHAR(30) | DEFAULT 'pending' | PENDING, COMPLETED, FAILED, REFUNDED |
| `transaction_id` | VARCHAR(255) | | External payment processor ID |
| `payment_date` | TIMESTAMPTZ | NOT NULL | |
| `reference` | VARCHAR(255) | | Payment reference number |
| `notes` | TEXT | | |
| `refund_amount` | DECIMAL(12,2) | DEFAULT 0 | Amount refunded |
| `refund_reason` | TEXT | | |
| `processed_by` | UUID | FK -> users(id) | |
| `created_by` | UUID | FK -> users(id) | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | |

**Indexes:**
- `idx_payments_org` on `organization_id`
- `idx_payments_invoice` on `invoice_id`
- `idx_payments_org_date` on `(organization_id, payment_date DESC)`

---

### 4.19 campaigns

Marketing campaigns.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `name` | VARCHAR(255) | NOT NULL | Campaign name |
| `description` | TEXT | | Campaign description |
| `type` | VARCHAR(50) | NOT NULL | EMAIL, SMS, SOCIAL, ADS, EVENT, CONTENT |
| `status` | VARCHAR(30) | DEFAULT 'draft' | DRAFT, SCHEDULED, ACTIVE, PAUSED, COMPLETED, CANCELLED |
| `channel` | VARCHAR(50) | | Delivery channel |
| `target_audience` | JSONB | | Target segment criteria |
| `start_date` | TIMESTAMPTZ | | |
| `end_date` | TIMESTAMPTZ | | |
| `budget` | DECIMAL(12,2) | | Campaign budget |
| `spent` | DECIMAL(12,2) | DEFAULT 0 | Amount spent |
| `expected_leads` | INTEGER | | Expected lead count |
| `actual_leads` | INTEGER | DEFAULT 0 | Actual leads generated |
| `expected_revenue` | DECIMAL(12,2) | | Expected revenue |
| `actual_revenue` | DECIMAL(12,2) | DEFAULT 0 | Revenue generated |
| `email_subject` | VARCHAR(255) | | For email campaigns |
| `email_body` | TEXT | | |
| `landing_page_url` | TEXT | | Campaign landing page |
| `utm_source` | VARCHAR(100) | | UTM tracking |
| `utm_medium` | VARCHAR(100) | | |
| `utm_campaign` | VARCHAR(100) | | |
| `owner_user_id` | UUID | FK -> users(id) | |
| `created_by` | UUID | FK -> users(id) | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | |

**Indexes:**
- `idx_campaigns_org` on `organization_id`
- `idx_campaigns_org_status` on `(organization_id, status)`

---

### 4.20 tasks

Tasks assigned to users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `title` | VARCHAR(255) | NOT NULL | Task title |
| `description` | TEXT | | Task description |
| `status` | VARCHAR(30) | DEFAULT 'pending' | PENDING, IN_PROGRESS, COMPLETED, CANCELLED |
| `priority` | VARCHAR(20) | DEFAULT 'medium' | LOW, MEDIUM, HIGH, URGENT |
| `type` | VARCHAR(50) | | TASK, FOLLOW_UP, CALL, EMAIL, MEETING |
| `due_date` | TIMESTAMPTZ | | |
| `completed_at` | TIMESTAMPTZ | | |
| `assigned_to` | UUID | FK -> users(id) | Assignee |
| `assigned_by` | UUID | FK -> users(id) | Who created the assignment |
| `team_id` | UUID | FK -> teams(id) | Assigned team |
| `contact_id` | UUID | FK -> contacts(id) | Related contact |
| `lead_id` | UUID | FK -> leads(id) | Related lead |
| `deal_id` | UUID | FK -> deals(id) | Related deal |
| `company_id` | UUID | FK -> companies(id) | Related company |
| `parent_task_id` | UUID | FK -> tasks(id) | Parent task (for subtasks) |
| `is_recurring` | BOOLEAN | DEFAULT false | |
| `recurrence_rule` | VARCHAR(255) | | iCal recurrence rule |
| `estimated_hours` | DECIMAL(6,2) | | Estimated time |
| `actual_hours` | DECIMAL(6,2) | | Actual time spent |
| `tags` | TEXT[] | DEFAULT '{}' | |
| `custom_fields` | JSONB | DEFAULT '{}' | |
| `created_by` | UUID | FK -> users(id) | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | |

**Indexes:**
- `idx_tasks_org` on `organization_id`
- `idx_tasks_org_status` on `(organization_id, status)`
- `idx_tasks_org_assigned` on `(organization_id, assigned_to)`
- `idx_tasks_org_due` on `(organization_id, due_date)` WHERE `status != 'completed'`

---

### 4.21 events

Calendar events (non-meeting).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `title` | VARCHAR(255) | NOT NULL | |
| `description` | TEXT | | |
| `type` | VARCHAR(50) | DEFAULT 'event' | EVENT, REMINDER, HOLIDAY |
| `start_time` | TIMESTAMPTZ | NOT NULL | |
| `end_time` | TIMESTAMPTZ | NOT NULL | |
| `all_day` | BOOLEAN | DEFAULT false | |
| `location` | VARCHAR(255) | | |
| `recurring_rule` | VARCHAR(255) | | iCal RRULE |
| `owner_user_id` | UUID | FK -> users(id) | |
| `contact_id` | UUID | FK -> contacts(id) | |
| `deal_id` | UUID | FK -> deals(id) | |
| `created_by` | UUID | FK -> users(id) | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | |

**Indexes:**
- `idx_events_org` on `organization_id`
- `idx_events_org_time` on `(organization_id, start_time, end_time)`

---

### 4.22 meetings

Scheduled meetings with attendees.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `title` | VARCHAR(255) | NOT NULL | |
| `description` | TEXT | | |
| `status` | VARCHAR(30) | DEFAULT 'scheduled' | SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW |
| `start_time` | TIMESTAMPTZ | NOT NULL | |
| `end_time` | TIMESTAMPTZ | NOT NULL | |
| `location` | VARCHAR(255) | | Physical location |
| `meeting_url` | TEXT | | Virtual meeting link (Zoom, Teams, etc.) |
| `meeting_provider` | VARCHAR(50) | | ZOOM, TEAMS, GOOGLE_MEET, OTHER |
| `meeting_notes` | TEXT | | |
| `meeting_summary` | TEXT | | AI-generated summary |
| `recording_url` | TEXT | | Meeting recording link |
| `contact_id` | UUID | FK -> contacts(id) | Client contact |
| `deal_id` | UUID | FK -> deals(id) | Related deal |
| `owner_user_id` | UUID | FK -> users(id) | Organizer |
| `created_by` | UUID | FK -> users(id) | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | |

**Indexes:**
- `idx_meetings_org` on `organization_id`
- `idx_meetings_org_time` on `(organization_id, start_time)`

---

### 4.23 meeting_attendees

Join table for meeting participants.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `meeting_id` | UUID | NOT NULL, FK -> meetings(id) ON DELETE CASCADE | |
| `user_id` | UUID | FK -> users(id) | Internal attendee |
| `contact_id` | UUID | FK -> contacts(id) | External attendee |
| `email` | VARCHAR(255) | NOT NULL | Attendee email |
| `name` | VARCHAR(255) | NOT NULL | Attendee name |
| `status` | VARCHAR(20) | DEFAULT 'pending' | PENDING, ACCEPTED, DECLINED, TENTATIVE |
| `role` | VARCHAR(20) | DEFAULT 'required' | REQUIRED, OPTIONAL |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_meeting_attendees_meeting` on `meeting_id`
- `idx_meeting_attendees_user` on `user_id` WHERE `user_id IS NOT NULL`

---

### 4.24 messages

Internal messaging between users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `conversation_id` | UUID | | Groups messages in a thread |
| `sender_id` | UUID | NOT NULL, FK -> users(id) | |
| `recipient_id` | UUID | FK -> users(id) | Direct message recipient |
| `subject` | VARCHAR(255) | | Message subject |
| `body` | TEXT | NOT NULL | Message content |
| `type` | VARCHAR(20) | DEFAULT 'direct' | DIRECT, GROUP, SYSTEM |
| `is_read` | BOOLEAN | DEFAULT false | |
| `read_at` | TIMESTAMPTZ | | |
| `parent_message_id` | UUID | FK -> messages(id) | For threaded replies |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | |

**Indexes:**
- `idx_messages_org` on `organization_id`
- `idx_messages_sender` on `sender_id`
- `idx_messages_recipient` on `recipient_id`
- `idx_messages_conversation` on `conversation_id`

---

### 4.25 emails

Email communications tracked by the system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `direction` | VARCHAR(10) | NOT NULL | INBOUND, OUTBOUND |
| `from_email` | VARCHAR(255) | NOT NULL | Sender email |
| `from_name` | VARCHAR(255) | | Sender display name |
| `to_emails` | TEXT[] | NOT NULL | Recipient emails |
| `cc_emails` | TEXT[] | DEFAULT '{}' | CC recipients |
| `bcc_emails` | TEXT[] | DEFAULT '{}' | BCC recipients |
| `subject` | VARCHAR(500) | NOT NULL | Email subject |
| `body_text` | TEXT | | Plain text body |
| `body_html` | TEXT | | HTML body |
| `status` | VARCHAR(20) | DEFAULT 'draft' | DRAFT, QUEUED, SENT, DELIVERED, OPENED, BOUNCED, FAILED |
| `sent_at` | TIMESTAMPTZ | | |
| `delivered_at` | TIMESTAMPTZ | | |
| `opened_at` | TIMESTAMPTZ | | |
| `click_count` | INTEGER | DEFAULT 0 | Link clicks |
| `attachments` | JSONB | DEFAULT '[]` | Attachment metadata |
| `contact_id` | UUID | FK -> contacts(id) | Related contact |
| `lead_id` | UUID | FK -> leads(id) | Related lead |
| `deal_id` | UUID | FK -> deals(id) | Related deal |
| `campaign_id` | UUID | FK -> campaigns(id) | Marketing campaign |
| `template_id` | VARCHAR(100) | | Email template used |
| `user_id` | UUID | FK -> users(id) | Owner/sender |
| `external_id` | VARCHAR(255) | | Provider message ID (SendGrid, etc.) |
| `thread_id` | VARCHAR(255) | | Email thread grouping |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | |

**Indexes:**
- `idx_emails_org` on `organization_id`
- `idx_emails_org_direction` on `(organization_id, direction)`
- `idx_emails_contact` on `contact_id` WHERE `contact_id IS NOT NULL`
- `idx_emails_sent` on `(organization_id, sent_at DESC)`

---

### 4.26 notifications

System notifications for users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `user_id` | UUID | NOT NULL, FK -> users(id) | Recipient |
| `title` | VARCHAR(255) | NOT NULL | |
| `message` | TEXT | NOT NULL | |
| `type` | VARCHAR(50) | NOT NULL | SYSTEM, MENTION, TASK_ASSIGNED, DEAL_UPDATE, etc. |
| `category` | VARCHAR(50) | | INFO, WARNING, SUCCESS, ERROR |
| `is_read` | BOOLEAN | DEFAULT false | |
| `read_at` | TIMESTAMPTZ | | |
| `action_url` | TEXT | | Deep link to related entity |
| `entity_type` | VARCHAR(50) | | Related entity type |
| `entity_id` | UUID | | Related entity ID |
| `sender_id` | UUID | FK -> users(id) | Who triggered it |
| `metadata` | JSONB | DEFAULT '{}' | Additional data |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_notifications_user` on `(user_id, is_read)`
- `idx_notifications_org_user` on `(organization_id, user_id)`
- `idx_notifications_created` on `(created_at DESC)`

---

### 4.27 tickets

Customer support tickets.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `ticket_number` | VARCHAR(50) | NOT NULL | Auto-generated |
| `subject` | VARCHAR(255) | NOT NULL | |
| `description` | TEXT | NOT NULL | |
| `status` | VARCHAR(30) | DEFAULT 'open' | OPEN, IN_PROGRESS, WAITING, RESOLVED, CLOSED |
| `priority` | VARCHAR(20) | DEFAULT 'medium' | LOW, MEDIUM, HIGH, URGENT |
| `category` | VARCHAR(100) | | Bug, Feature Request, Question, etc. |
| `type` | VARCHAR(50) | | BUG, FEATURE, QUESTION, COMPLAINT |
| `channel` | VARCHAR(30) | | EMAIL, PHONE, CHAT, WEB, SOCIAL |
| `contact_id` | UUID | FK -> contacts(id) | Customer |
| `company_id` | UUID | FK -> companies(id) | Company |
| `assigned_to` | UUID | FK -> users(id) | Agent |
| `team_id` | UUID | FK -> teams(id) | Support team |
| `deal_id` | UUID | FK -> deals(id) | Related deal |
| `first_response_at` | TIMESTAMPTZ | | First response time |
| `resolved_at` | TIMESTAMPTZ | | Resolution time |
| `sla_deadline` | TIMESTAMPTZ | | SLA deadline |
| `sla_breached` | BOOLEAN | DEFAULT false | |
| `satisfaction_rating` | INTEGER | | 1-5 rating |
| `satisfaction_feedback` | TEXT | | |
| `tags` | TEXT[] | DEFAULT '{}' | |
| `custom_fields` | JSONB | DEFAULT '{}' | |
| `created_by` | UUID | FK -> users(id) | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | |

**Indexes:**
- `idx_tickets_org` on `organization_id`
- `idx_tickets_org_status` on `(organization_id, status)`
- `idx_tickets_org_assigned` on `(organization_id, assigned_to)`
- `idx_tickets_org_priority` on `(organization_id, priority)` WHERE `status NOT IN ('resolved', 'closed')`
- `uq_tickets_org_number` UNIQUE on `(organization_id, ticket_number)`

---

### 4.28 ticket_comments

Comments and responses on tickets.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `ticket_id` | UUID | NOT NULL, FK -> tickets(id) ON DELETE CASCADE | |
| `user_id` | UUID | FK -> users(id) | Agent/internal user |
| `contact_id` | UUID | FK -> contacts(id) | Customer comment |
| `body` | TEXT | NOT NULL | Comment content |
| `is_internal` | BOOLEAN | DEFAULT false | Internal note vs customer-facing |
| `attachments` | JSONB | DEFAULT '[]` | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | |

**Indexes:**
- `idx_ticket_comments_ticket` on `ticket_id`

---

### 4.29 reports

Saved report configurations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `name` | VARCHAR(255) | NOT NULL | Report name |
| `description` | TEXT | | |
| `type` | VARCHAR(50) | NOT NULL | SALES, LEAD, ACTIVITY, REVENUE, CUSTOM, AI |
| `config` | JSONB | NOT NULL | Report configuration (filters, columns, grouping) |
| `data` | JSONB | | Cached report results |
| `is_public` | BOOLEAN | DEFAULT false | Visible to all org users |
| `is_scheduled` | BOOLEAN | DEFAULT false | |
| `schedule_cron` | VARCHAR(100) | | Cron expression |
| `last_generated_at` | TIMESTAMPTZ | | |
| `owner_user_id` | UUID | FK -> users(id) | |
| `created_by` | UUID | FK -> users(id) | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | |

**Indexes:**
- `idx_reports_org` on `organization_id`

---

### 4.30 audit_logs

Immutable audit trail for compliance and security.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `user_id` | UUID | FK -> users(id) | Actor (NULL for system) |
| `action` | VARCHAR(20) | NOT NULL | CREATE, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT, etc. |
| `entity_type` | VARCHAR(50) | NOT NULL | leads, deals, contacts, etc. |
| `entity_id` | UUID | | Affected entity |
| `changes` | JSONB | | Before/after diff |
| `ip_address` | INET | | Client IP |
| `user_agent` | TEXT | | Browser user agent |
| `metadata` | JSONB | DEFAULT '{}' | Additional context |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_audit_logs_org` on `organization_id`
- `idx_audit_logs_user` on `user_id`
- `idx_audit_logs_entity` on `(entity_type, entity_id)`
- `idx_audit_logs_action` on `(organization_id, action)`
- `idx_audit_logs_created` on `(created_at DESC)`

**Note:** Audit logs are never soft-deleted. Partitioned by month for performance in production.

---

### 4.31 api_keys

API keys for external integrations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `user_id` | UUID | NOT NULL, FK -> users(id) | Creator |
| `name` | VARCHAR(255) | NOT NULL | Key name/label |
| `key_hash` | VARCHAR(255) | NOT NULL | Hashed API key (never store raw) |
| `key_prefix` | VARCHAR(10) | NOT NULL | First 8 chars for identification (e.g., 'nvc_abc1') |
| `scopes` | TEXT[] | NOT NULL | Allowed API scopes/permissions |
| `is_active` | BOOLEAN | DEFAULT true | |
| `last_used_at` | TIMESTAMPTZ | | |
| `expires_at` | TIMESTAMPTZ | | Expiration date (NULL = never) |
| `rate_limit` | INTEGER | DEFAULT 1000 | Requests per hour |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | |

**Indexes:**
- `idx_api_keys_org` on `organization_id`
- `uq_api_keys_hash` UNIQUE on `key_hash`

---

### 4.32 settings

Application and organization settings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | FK -> organizations(id) | NULL for global settings |
| `key` | VARCHAR(255) | NOT NULL | Setting name (e.g., 'email.signature') |
| `value` | JSONB | NOT NULL | Setting value |
| `type` | VARCHAR(20) | DEFAULT 'string' | string, number, boolean, json |
| `category` | VARCHAR(50) | | general, email, notification, security |
| `description` | TEXT | | |
| `is_public` | BOOLEAN | DEFAULT false | Visible to non-admins |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `uq_settings_org_key` UNIQUE on `(organization_id, key)` (NULL org_id for globals)
- `idx_settings_org` on `organization_id`

---

### 4.33 files

File and attachment records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `name` | VARCHAR(255) | NOT NULL | Original filename |
| `file_name` | VARCHAR(255) | NOT NULL | Stored filename |
| `mime_type` | VARCHAR(100) | NOT NULL | MIME type |
| `size` | BIGINT | NOT NULL | File size in bytes |
| `url` | TEXT | NOT NULL | Storage URL |
| `path` | VARCHAR(500) | | Storage path |
| `entity_type` | VARCHAR(50) | | Attached to (lead, contact, deal, etc.) |
| `entity_id` | UUID | | Attached entity ID |
| `uploaded_by` | UUID | NOT NULL, FK -> users(id) | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | |

**Indexes:**
- `idx_files_org` on `organization_id`
- `idx_files_entity` on `(entity_type, entity_id)`

---

### 4.34 comments

Polymorphic comments on any entity.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `entity_type` | VARCHAR(50) | NOT NULL | leads, deals, contacts, tasks, etc. |
| `entity_id` | UUID | NOT NULL | Parent entity |
| `user_id` | UUID | NOT NULL, FK -> users(id) | Author |
| `body` | TEXT | NOT NULL | Comment content |
| `parent_comment_id` | UUID | FK -> comments(id) | Threaded replies |
| `mentions` | UUID[] | DEFAULT '{}' | Mentioned user IDs |
| `is_edited` | BOOLEAN | DEFAULT false | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | |

**Indexes:**
- `idx_comments_entity` on `(entity_type, entity_id)`
- `idx_comments_org` on `organization_id`

---

### 4.35 tags

Tags for categorizing any entity.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `name` | VARCHAR(100) | NOT NULL | Tag name |
| `color` | VARCHAR(7) | DEFAULT '#6366f1' | Hex color code |
| `created_by` | UUID | FK -> users(id) | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | |

**Indexes:**
- `uq_tags_org_name` UNIQUE on `(organization_id, name)` WHERE `deleted_at IS NULL`

---

### 4.36 entity_tags

Polymorphic join table for tagging any entity.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `tag_id` | UUID | NOT NULL, FK -> tags(id) ON DELETE CASCADE | |
| `entity_type` | VARCHAR(50) | NOT NULL | |
| `entity_id` | UUID | NOT NULL | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `uq_entity_tags` UNIQUE on `(tag_id, entity_type, entity_id)`
- `idx_entity_tags_entity` on `(entity_type, entity_id)`

---

### 4.37 activities

Activity log for timeline views on any entity.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `user_id` | UUID | FK -> users(id) | Actor |
| `action` | VARCHAR(50) | NOT NULL | CREATED, UPDATED, COMMENTED, ASSIGNED, STATUS_CHANGED, etc. |
| `entity_type` | VARCHAR(50) | NOT NULL | |
| `entity_id` | UUID | NOT NULL | |
| `description` | TEXT | | Human-readable description |
| `changes` | JSONB | | Before/after values |
| `metadata` | JSONB | DEFAULT '{}' | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_activities_entity` on `(entity_type, entity_id, created_at DESC)`
- `idx_activities_org` on `organization_id`
- `idx_activities_user` on `user_id`

**Note:** Activities are append-only (never updated or deleted). Partitioned by month for performance.

---

### 4.38 workflows

Automation workflow definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `name` | VARCHAR(255) | NOT NULL | |
| `description` | TEXT | | |
| `is_active` | BOOLEAN | DEFAULT true | |
| `trigger_type` | VARCHAR(50) | NOT NULL | CREATED, UPDATED, STATUS_CHANGED, SCHEDULED, MANUAL |
| `trigger_entity` | VARCHAR(50) | NOT NULL | Entity type that triggers |
| `trigger_conditions` | JSONB | DEFAULT '[]' | Conditions that must match |
| `actions` | JSONB | NOT NULL | Ordered list of actions |
| `run_count` | INTEGER | DEFAULT 0 | Times executed |
| `last_run_at` | TIMESTAMPTZ | | |
| `last_error` | TEXT | | Last error message |
| `owner_user_id` | UUID | FK -> users(id) | |
| `created_by` | UUID | FK -> users(id) | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | | |

**Indexes:**
- `idx_workflows_org` on `organization_id`
- `idx_workflows_trigger` on `(trigger_entity, trigger_type)` WHERE `is_active = true`

---

### 4.39 subscriptions

Organization subscription records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `organization_id` | UUID | NOT NULL, FK -> organizations(id) | |
| `plan_id` | UUID | NOT NULL, FK -> plans(id) | |
| `status` | VARCHAR(30) | DEFAULT 'active' | ACTIVE, TRIALING, PAST_DUE, CANCELED, EXPIRED |
| `billing_cycle` | VARCHAR(20) | DEFAULT 'monthly' | MONTHLY, YEARLY |
| `current_period_start` | TIMESTAMPTZ | NOT NULL | |
| `current_period_end` | TIMESTAMPTZ | NOT NULL | |
| `trial_start` | TIMESTAMPTZ | | |
| `trial_end` | TIMESTAMPTZ | | |
| `cancel_at` | TIMESTAMPTZ | | When subscription will cancel |
| `canceled_at` | TIMESTAMPTZ | | When canceled |
| `cancel_reason` | TEXT | | |
| `stripe_subscription_id` | VARCHAR(255) | | Stripe sub ID |
| `stripe_customer_id` | VARCHAR(255) | | Stripe customer ID |
| `current_usage` | JSONB | DEFAULT '{}' | Feature usage counters |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_subscriptions_org` on `organization_id`
- `uq_subscriptions_org` UNIQUE on `organization_id` (one active sub per org)

---

### 4.40 plans

Available subscription plans.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `name` | VARCHAR(100) | NOT NULL | Plan name (Starter, Professional, Enterprise) |
| `slug` | VARCHAR(100) | NOT NULL, UNIQUE | URL-friendly identifier |
| `description` | TEXT | | |
| `price_monthly` | DECIMAL(10,2) | NOT NULL | Monthly price |
| `price_yearly` | DECIMAL(10,2) | NOT NULL | Yearly price |
| `currency` | VARCHAR(3) | DEFAULT 'USD' | |
| `max_users` | INTEGER | NOT NULL | User seat limit |
| `max_contacts` | INTEGER | NOT NULL | Contact limit |
| `max_deals` | INTEGER | NOT NULL | Deal limit |
| `max_storage_gb` | INTEGER | NOT NULL | Storage limit in GB |
| `features` | JSONB | NOT NULL | Feature flags and limits |
| `is_active` | BOOLEAN | DEFAULT true | Available for purchase |
| `is_custom` | BOOLEAN | DEFAULT false | Enterprise custom pricing |
| `stripe_price_monthly` | VARCHAR(255) | | Stripe price ID |
| `stripe_price_yearly` | VARCHAR(255) | | Stripe price ID |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `uq_plans_slug` UNIQUE on `slug`

---

## 5. Index Strategy

### Index Naming Convention

```
idx_{table}_{columns}          -- Standard index
uq_{table}_{columns}          -- Unique constraint
```

### Performance-Critical Indexes

| Table | Index | Columns | Reason |
|-------|-------|---------|--------|
| `leads` | `idx_leads_org_status` | `(organization_id, status)` | Dashboard filtered views |
| `deals` | `idx_deals_org_stage` | `(organization_id, stage)` | Pipeline view |
| `tasks` | `idx_tasks_org_assigned` | `(organization_id, assigned_to)` | My tasks view |
| `activities` | `idx_activities_entity` | `(entity_type, entity_id, created_at DESC)` | Timeline rendering |
| `notifications` | `idx_notifications_user` | `(user_id, is_read)` | Notification badge |
| `audit_logs` | `idx_audit_logs_created` | `(created_at DESC)` | Chronological queries |
| `emails` | `idx_emails_sent` | `(organization_id, sent_at DESC)` | Email inbox |

### Composite Index Pattern

Every data table follows this pattern:

```sql
-- Primary lookup index (most queries filter by org + status)
CREATE INDEX idx_{table}_org_status ON {table}(organization_id, status);

-- Ownership index (my items queries)
CREATE INDEX idx_{table}_org_owner ON {table}(organization_id, owner_user_id);

-- Chronological index (recent items, sorting)
CREATE INDEX idx_{table}_org_created ON {table}(organization_id, created_at DESC);
```

---

## 6. Soft Delete Pattern

All business-critical tables use soft deletes via a `deleted_at` column:

```sql
-- Active record (visible)
WHERE deleted_at IS NULL

-- Soft delete
UPDATE leads SET deleted_at = NOW() WHERE id = '...';

-- Restore
UPDATE leads SET deleted_at = NULL WHERE id = '...';

-- Permanent delete (admin only, after 30 days)
DELETE FROM leads WHERE deleted_at < NOW() - INTERVAL '30 days';
```

**Unique constraints account for soft deletes:**

```sql
-- PostgreSQL partial unique index
CREATE UNIQUE UNIQUE idx_leads_org_email 
ON leads(organization_id, email) 
WHERE email IS NOT NULL AND deleted_at IS NULL;
```

**Prisma implementation:**

```prisma
model Lead {
  id        String    @id @default(uuid())
  // ...
  deletedAt DateTime? @map("deleted_at")

  @@index([organizationId, status])
  @@map("leads")
}
```

---

## 7. Migration Strategy

### Migration Workflow

```
1. Edit prisma/schema.prisma
2. Run: npx prisma migrate dev --name add_leads_table
3. Review generated SQL in prisma/migrations/
4. Commit migration files to Git
5. On deploy: npx prisma migrate deploy
```

### Seed Data

```typescript
// prisma/seed.ts
async function main() {
  // Create system roles
  // Create default permissions
  // Create demo organization
  // Create demo users
  // Create sample leads, contacts, deals
  // Create sample tasks, meetings
}
```

### Data Types Summary

| Category | Tables | Count |
|----------|--------|-------|
| **Core Entities** | users, organizations, teams, team_members | 4 |
| **Access Control** | roles, permissions, role_permissions, user_organizations | 4 |
| **CRM** | leads, contacts, companies, deals | 4 |
| **Commerce** | products, orders, order_items, invoices, invoice_items, payments | 6 |
| **Marketing** | campaigns | 1 |
| **Tasks & Calendar** | tasks, events, meetings, meeting_attendees | 4 |
| **Communication** | messages, emails, notifications | 3 |
| **Support** | tickets, ticket_comments | 2 |
| **Analytics** | reports | 1 |
| **System** | audit_logs, api_keys, settings, files, comments, tags, entity_tags, activities | 8 |
| **Automation** | workflows | 1 |
| **Billing** | subscriptions, plans | 2 |
| **Total** | | **40** |
