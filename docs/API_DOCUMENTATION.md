# venn API Documentation

**Status:** Current as of 2026-02-11  
**Base URL:** `https://venn-demo.avan.academy/api`  
**Authentication:** Session-based (OAuth) + API tokens (planned)

## Overview

venn provides a REST API for managing CRM contacts, support tickets, and product roadmap items. This document details current capabilities and identifies gaps for agent-first workflows.

## Authentication

### Current: Session-Based (OAuth)
- **Method:** GitHub/Google OAuth → session cookies
- **Use case:** Human users via web UI
- **Endpoints:**
  - `GET /auth/me` - Get current user
  - `POST /auth/logout` - Logout
  - `GET /auth/github` - GitHub OAuth initiate
  - `GET /auth/github/callback` - GitHub OAuth callback

### Planned: API Tokens
- **Method:** Bearer token authentication
- **Use case:** Agents and API integrations
- **Endpoints:** (to be implemented)
  - `POST /auth/tokens` - Generate API token
  - `GET /auth/tokens` - List user's tokens
  - `DELETE /auth/tokens/:id` - Revoke token

## Core Modules

---

## 1. Contacts API (CRM)

### Endpoints

#### `GET /contacts`
List all contacts with pagination and filtering.

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 50, max: 100)
- `search` (string) - Search by name/email
- `lifecycle_stage` (string) - Filter: lead, prospect, customer, churned

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+15551234567",
      "title": "CEO",
      "lifecycle_stage": "customer",
      "tags": ["vip", "enterprise"],
      "custom_fields": {},
      "created_at": "2026-01-30T12:00:00Z",
      "updated_at": "2026-02-11T08:00:00Z",
      "last_contact_at": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

#### `POST /contacts`
Create a new contact.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+15559876543",
  "title": "Product Manager",
  "lifecycle_stage": "lead",
  "tags": ["webinar-signup"],
  "custom_fields": {
    "company_size": "50-100",
    "industry": "SaaS"
  }
}
```

**Required Fields:** `name`  
**Optional Fields:** All others

#### `GET /contacts/:id`
Get a specific contact by ID.

#### `PATCH /contacts/:id`
Update a contact. Only provided fields are updated.

#### `DELETE /contacts/:id`
Delete a contact and all associated data.

### Missing Capabilities (Agent Needs)

❌ **Activities/Timeline** - No endpoint for contact history
- Need: `GET /contacts/:id/activities`
- Need: `POST /contacts/:id/activities` (log email, call, meeting)

❌ **Notes** - No dedicated notes endpoint
- Need: `GET /contacts/:id/notes`
- Need: `POST /contacts/:id/notes`

❌ **Organizations** - Contacts not linked to companies
- Need: Organization CRUD
- Need: Contact-to-organization relationship

❌ **Bulk Operations** - No batch create/update
- Need: `POST /contacts/bulk` (import/create many)
- Need: `PATCH /contacts/bulk` (update multiple)

❌ **Advanced Search** - Limited search capabilities
- Need: Full-text search across all fields
- Need: Filters by tags, custom fields, date ranges

❌ **Export** - No CSV/data export
- Need: `GET /contacts/export?format=csv`

### Missing Fields

Current fields are basic. Agents need:
- `company_name` (first-class field, not custom)
- `linkedin_url`, `twitter_handle` (social profiles)
- `lead_source` (where contact came from)
- `owner_id` (assigned sales rep)
- `last_activity_at` (auto-updated on any interaction)
- `custom_fields` schema definition

---

## 2. Tickets API (Support)

### Endpoints

#### `GET /tickets`
List all tickets with pagination and filtering.

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - Filter: open, pending, resolved, closed
- `priority` - Filter: low, medium, high, urgent
- `assigned_to` - Filter by assigned user ID
- `contact_id` - Filter by contact

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "contact_id": 5,
      "assigned_to": 2,
      "subject": "Cannot login to account",
      "status": "open",
      "priority": "high",
      "channel": "email",
      "created_at": "2026-02-11T10:00:00Z",
      "updated_at": "2026-02-11T10:30:00Z",
      "resolved_at": null
    }
  ],
  "pagination": {...}
}
```

#### `POST /tickets`
Create a new support ticket.

**Request Body:**
```json
{
  "contact_id": 5,
  "subject": "Bug: Dashboard not loading",
  "priority": "medium",
  "status": "open",
  "channel": "web"
}
```

#### `GET /tickets/:id`
Get ticket details including basic info (no messages).

#### `GET /tickets/:id/messages`
Get all messages for a ticket.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "ticket_id": 1,
      "user_id": 2,
      "contact_id": null,
      "body": "I've investigated the issue and found the root cause...",
      "is_internal": false,
      "created_at": "2026-02-11T10:15:00Z"
    }
  ]
}
```

#### `POST /tickets/:id/messages`
Add a message to a ticket.

**Request Body:**
```json
{
  "body": "Thank you for your patience. The issue has been resolved.",
  "is_internal": false
}
```

#### `PATCH /tickets/:id`
Update ticket status, priority, or assignment.

#### `DELETE /tickets/:id`
Delete a ticket.

### Missing Capabilities (Agent Needs)

❌ **Auto-Assignment** - No rules engine
- Need: `POST /tickets/:id/assign` (assign to agent)
- Need: Auto-assign based on category/keywords

❌ **Categories/Tags** - No categorization
- Need: `categories` field on tickets
- Need: `GET /tickets/categories` (list all)

❌ **SLA Tracking** - No SLA fields
- Need: `first_response_at`, `first_response_sla_met`
- Need: `resolution_sla_met`, `sla_breach_at`

❌ **Templates** - No canned responses
- Need: `GET /templates` (list templates)
- Need: `GET /templates/:id` (get template)

❌ **Email Integration** - No email sync
- Need: Create tickets from inbound email
- Need: Send replies as email

❌ **Attachments** - No file attachments
- Need: `POST /tickets/:id/attachments`
- Need: `GET /tickets/:id/attachments`

❌ **Related Tickets** - No linking
- Need: Link tickets as duplicates
- Need: Link tickets to roadmap items

### Missing Fields

- `category` (Technical, Billing, Feature Request)
- `tags` (array of keywords)
- `first_response_at`, `response_time_minutes`
- `resolution_time_minutes`
- `customer_satisfaction_rating` (CSAT)
- `internal_notes` (separate from messages)

---

## 3. Roadmap API (Product)

### Endpoints

#### `GET /roadmap`
List all roadmap items.

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - Filter: backlog, planned, in_progress, completed, cancelled
- `type` - Filter: feature, bug, improvement
- `priority` - Filter: low, medium, high

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Dark mode support",
      "description": "Add dark theme to entire application",
      "type": "feature",
      "status": "planned",
      "priority": "medium",
      "target_date": "2026-03-15",
      "completed_at": null,
      "created_by": 1,
      "created_at": "2026-02-01T12:00:00Z",
      "updated_at": "2026-02-11T08:00:00Z"
    }
  ],
  "pagination": {...}
}
```

#### `POST /roadmap`
Create a new roadmap item.

#### `GET /roadmap/:id`
Get roadmap item details.

#### `PATCH /roadmap/:id`
Update a roadmap item.

#### `DELETE /roadmap/:id`
Delete a roadmap item.

#### `POST /roadmap/:id/vote`
Vote for a roadmap item (requires contact association).

#### `GET /roadmap/:id/votes`
Get votes for a roadmap item.

### Missing Capabilities (Agent Needs)

❌ **Comments** - No discussion thread
- Need: `GET /roadmap/:id/comments`
- Need: `POST /roadmap/:id/comments`

❌ **Status Updates** - No changelog
- Need: `GET /roadmap/:id/history` (status changes)
- Need: Notify voters on status change

❌ **Ticket Links** - No customer feedback tracking
- Need: Link tickets to roadmap items
- Need: `GET /roadmap/:id/linked-tickets`

❌ **Public/Private** - All items public
- Need: `is_private` field (admin-only view)

❌ **Tags/Categories** - No organization
- Need: `tags` array field
- Need: `category` (Platform, Mobile, API, etc.)

❌ **Analytics** - No insights
- Need: `GET /roadmap/analytics` (top voted, completion rate)

### Missing Fields

- `tags` (array)
- `category` (grouping)
- `is_private` (boolean)
- `votes_count` (cached count)
- `linked_tickets_count`
- `estimated_effort` (story points/hours)
- `github_issue_url` (integration link)

---

## 4. Users API (Admin)

### Endpoints

#### `GET /users`
List all users (admin only).

**Query Parameters:**
- `page`, `limit` - Pagination

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "email": "eric@example.com",
      "name": "Eric",
      "avatar": "https://avatars.githubusercontent.com/u/...",
      "role": "admin",
      "oauth_provider": "github",
      "created_at": "2026-01-30T12:00:00Z",
      "updated_at": "2026-02-09T23:34:00Z"
    }
  ],
  "pagination": {...}
}
```

#### `GET /users/:id`
Get specific user (admin only).

#### `PATCH /users/:id`
Update user role or name (admin only).

#### `DELETE /users/:id`
Delete user (admin only, with safety checks).

### Missing Capabilities (Agent Needs)

❌ **API Tokens** - No token management
- Need: `POST /users/:id/tokens` (create token)
- Need: `GET /users/:id/tokens` (list tokens)
- Need: `DELETE /users/:id/tokens/:token_id` (revoke)

❌ **Permissions** - Only role-based, not granular
- Need: Resource-level permissions
- Need: Custom role definitions

❌ **Activity Log** - No audit trail
- Need: `GET /users/:id/activity` (actions taken)

❌ **Service Accounts** - No bot users
- Need: Create non-human accounts for agents

### Missing Fields

- `api_tokens` (list of active tokens)
- `permissions` (granular permissions array)
- `last_active_at`
- `is_service_account` (boolean)

---

## Gap Analysis Summary

### Critical Gaps for Agent Workflows

**Priority 1: Authentication**
- API token generation and management
- Token-based authentication middleware
- Service account support

**Priority 2: Rich Fields**
- Contact activities/timeline
- Ticket categories and SLA fields
- Roadmap tags and visibility

**Priority 3: Agent Operations**
- Bulk operations (create/update many)
- Advanced search and filtering
- File attachments

**Priority 4: Integrations**
- Email integration for tickets
- GitHub/Linear sync for roadmap
- Webhook notifications

### API Completeness Score

| Module    | CRUD | Search | Relations | Bulk Ops | Export | Score |
|-----------|------|--------|-----------|----------|--------|-------|
| Contacts  | ✅   | ⚠️     | ❌        | ❌       | ❌     | 40%   |
| Tickets   | ✅   | ⚠️     | ⚠️        | ❌       | ❌     | 45%   |
| Roadmap   | ✅   | ⚠️     | ❌        | ❌       | ❌     | 40%   |
| Users     | ✅   | ❌     | ❌        | ❌       | ❌     | 30%   |

**Overall API Readiness for Agents: 39%**

---

## Next Steps

1. **Implement API tokens** - Critical for agent authentication
2. **Add missing fields** - Rich data needed for workflows
3. **Build related endpoints** - Activities, notes, comments
4. **Bulk operations** - Agent efficiency
5. **MCP server** - Agent-friendly interface layer

See `USER_STORIES.md` for detailed agent workflow requirements.
