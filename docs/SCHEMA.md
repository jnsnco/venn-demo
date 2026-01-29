# Database Schema

## Tables

### users
Core user accounts (team members).

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| email | VARCHAR(255) | Unique email |
| name | VARCHAR(255) | Display name |
| avatar | TEXT | Profile picture URL |
| role | VARCHAR(50) | admin, agent, or user |
| oauth_provider | VARCHAR(50) | google or github |
| oauth_id | VARCHAR(255) | OAuth provider user ID |
| created_at | TIMESTAMP | Account creation |
| updated_at | TIMESTAMP | Last update |

**Indexes:** email, (oauth_provider, oauth_id)

### organizations
Customer companies/organizations.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| name | VARCHAR(255) | Company name |
| domain | VARCHAR(255) | Company domain |
| plan_tier | VARCHAR(50) | free, starter, pro, enterprise |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Indexes:** domain

### contacts
Individual contacts (CRM).

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| organization_id | INTEGER | FK to organizations |
| name | VARCHAR(255) | Contact name |
| email | VARCHAR(255) | Email address |
| phone | VARCHAR(50) | Phone number |
| title | VARCHAR(255) | Job title |
| lifecycle_stage | VARCHAR(50) | lead, prospect, customer, churned |
| tags | JSONB | Array of tag strings |
| custom_fields | JSONB | Custom data object |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| last_contact_at | TIMESTAMP | Last interaction |

**Indexes:** email, organization_id, lifecycle_stage, tags (GIN)

### tickets
Support tickets.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| contact_id | INTEGER | FK to contacts |
| assigned_to | INTEGER | FK to users |
| subject | VARCHAR(500) | Ticket subject |
| status | VARCHAR(50) | open, pending, resolved, closed |
| priority | VARCHAR(50) | low, medium, high, urgent |
| channel | VARCHAR(50) | email, chat, phone, web |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| resolved_at | TIMESTAMP | Resolution timestamp |

**Indexes:** contact_id, assigned_to, status, priority

### ticket_messages
Messages within tickets.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| ticket_id | INTEGER | FK to tickets |
| user_id | INTEGER | FK to users (agent) |
| contact_id | INTEGER | FK to contacts (customer) |
| body | TEXT | Message content |
| is_internal | BOOLEAN | Internal note vs customer-facing |
| created_at | TIMESTAMP | |

**Indexes:** ticket_id, created_at

### roadmap_items
Product roadmap items.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| title | VARCHAR(500) | Feature/bug title |
| description | TEXT | Detailed description |
| type | VARCHAR(50) | feature, bug, improvement |
| status | VARCHAR(50) | backlog, planned, in_progress, completed, cancelled |
| priority | VARCHAR(50) | low, medium, high |
| target_date | DATE | Target completion date |
| completed_at | TIMESTAMP | Actual completion |
| created_by | INTEGER | FK to users |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Indexes:** status, priority, target_date

### roadmap_votes
Customer votes for roadmap items.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| roadmap_item_id | INTEGER | FK to roadmap_items |
| contact_id | INTEGER | FK to contacts |
| organization_id | INTEGER | FK to organizations |
| created_at | TIMESTAMP | |

**Unique:** (roadmap_item_id, contact_id)  
**Indexes:** roadmap_item_id, contact_id

### activities
Unified activity timeline.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| type | VARCHAR(50) | note, email, call, ticket, roadmap_update, meeting |
| contact_id | INTEGER | FK to contacts |
| user_id | INTEGER | FK to users |
| subject | VARCHAR(500) | Activity summary |
| body | TEXT | Activity details |
| metadata | JSONB | Type-specific data |
| created_at | TIMESTAMP | |

**Indexes:** contact_id, type, created_at (DESC)

### ticket_roadmap_links
Links between tickets and roadmap items.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| ticket_id | INTEGER | FK to tickets |
| roadmap_item_id | INTEGER | FK to roadmap_items |
| created_at | TIMESTAMP | |

**Unique:** (ticket_id, roadmap_item_id)  
**Indexes:** ticket_id, roadmap_item_id

## Relationships

```
organizations
  └─→ contacts
       ├─→ tickets
       │    └─→ ticket_messages
       ├─→ activities
       └─→ roadmap_votes

roadmap_items
  ├─→ roadmap_votes
  └─→ ticket_roadmap_links ←─ tickets

users
  ├─→ tickets (assigned_to)
  ├─→ ticket_messages
  ├─→ activities
  └─→ roadmap_items (created_by)
```

## Constraints

- All foreign keys use `ON DELETE` policies (SET NULL or CASCADE)
- Enums enforced via CHECK constraints
- Unique constraints on OAuth identity, votes
- Timestamps auto-updated via triggers

## Migrations

Run SQL files in order:
```bash
psql $DATABASE_URL < backend/migrations/001_initial_schema.sql
```
