# venn API Current State Report

**Date:** 2026-02-20  
**Environment:** Production (https://venn-demo.avan.academy)  
**Purpose:** Baseline before IAM and API enhancements

---

## Test Results Summary

### ✅ Working Endpoints

| Endpoint | Auth Required | Status | Notes |
|----------|---------------|--------|-------|
| `GET /health` | No | ✅ | Returns `{"status":"ok","timestamp":"..."}` |
| `GET /auth/me` | Yes (session) | ✅ | Returns user object or 401 |
| `GET /roadmap` | **No (public)** | ✅ | Returns roadmap items with pagination |
| `GET /contacts` | Yes | ✅ | Returns 401 without auth (protected) |
| `GET /tickets` | Yes | ✅ | Returns 401 without auth (protected) |
| `GET /users` | Yes (admin) | ✅ | Returns 401 without auth (protected) |

### 📊 Current Data State

**Roadmap Items:** 1 item exists
- ID: 1
- Title: "dark mode"
- Type: improvement
- Status: backlog
- Created by: Eric (user_id: 2)
- Vote count: 0

**Users:** At least 2 users (IDs 1, 2)
**Contacts:** Unknown (requires auth to query)
**Tickets:** Unknown (requires auth to query)

---

## Authentication

### Current Implementation
- **Session-based OAuth** (GitHub, Google)
- **Cookie:** `connect.sid`
- **Middleware:** `requireAuth` on most endpoints
- **Admin check:** `requireAdmin` on `/users`

### Public Endpoints
- `/health` - Health check
- `/roadmap` - **Public roadmap** (intentional for public feature voting)
- All OAuth endpoints (`/auth/github`, `/auth/google`)

### Protected Endpoints
- `/auth/me` - Current user
- `/contacts/*` - CRM module
- `/tickets/*` - Support module
- `/users/*` - User management (admin only)

---

## API Capabilities Matrix

### Contacts API

| Operation | Endpoint | Method | Auth | Status |
|-----------|----------|--------|------|--------|
| List contacts | `/contacts` | GET | Required | ✅ Implemented |
| Get contact | `/contacts/:id` | GET | Required | ✅ Implemented |
| Create contact | `/contacts` | POST | Required | ✅ Implemented |
| Update contact | `/contacts/:id` | PATCH | Required | ✅ Implemented |
| Delete contact | `/contacts/:id` | DELETE | Required | ✅ Implemented |
| Search contacts | `/contacts?search=query` | GET | Required | ✅ Implemented |
| Filter by lifecycle | `/contacts?lifecycle_stage=X` | GET | Required | ✅ Implemented |
| Get activities | `/contacts/:id/activities` | GET | Required | ❌ Not implemented |
| Add activity | `/contacts/:id/activities` | POST | Required | ❌ Not implemented |
| Get notes | `/contacts/:id/notes` | GET | Required | ❌ Not implemented |
| Bulk create | `/contacts/bulk` | POST | Required | ❌ Not implemented |
| Export CSV | `/contacts/export` | GET | Required | ❌ Not implemented |

**Fields Available:**
- id, name, email, phone, title, lifecycle_stage
- tags (JSONB array)
- custom_fields (JSONB object)
- organization_id (foreign key, but no organizations CRUD yet)
- created_at, updated_at, last_contact_at

**Missing Fields:**
- company_name (separate field, not just org_id)
- lead_source, linkedin_url, twitter_handle
- owner_id (assigned sales rep)
- last_activity_at (auto-updated)

### Tickets API

| Operation | Endpoint | Method | Auth | Status |
|-----------|----------|--------|------|--------|
| List tickets | `/tickets` | GET | Required | ✅ Implemented |
| Get ticket | `/tickets/:id` | GET | Required | ✅ Implemented |
| Create ticket | `/tickets` | POST | Required | ✅ Implemented |
| Update ticket | `/tickets/:id` | PATCH | Required | ✅ Implemented |
| Delete ticket | `/tickets/:id` | DELETE | Required | ✅ Implemented |
| Get messages | `/tickets/:id/messages` | GET | Required | ✅ Implemented |
| Add message | `/tickets/:id/messages` | POST | Required | ✅ Implemented |
| Filter by status | `/tickets?status=X` | GET | Required | ✅ Implemented |
| Filter by priority | `/tickets?priority=X` | GET | Required | ✅ Implemented |
| Assign ticket | `/tickets/:id/assign` | POST | Required | ❌ Not implemented |
| Get categories | `/tickets/categories` | GET | Required | ❌ Not implemented |
| Link to roadmap | `/tickets/:id/roadmap-links` | POST | Required | ❌ Not implemented |
| Upload attachment | `/tickets/:id/attachments` | POST | Required | ❌ Not implemented |

**Fields Available:**
- id, contact_id, assigned_to, subject, status, priority, channel
- created_at, updated_at, resolved_at

**Missing Fields:**
- category (Technical, Billing, etc.)
- tags (keywords)
- first_response_at, response_time_minutes
- resolution_time_minutes
- customer_satisfaction_rating
- internal_notes

### Roadmap API

| Operation | Endpoint | Method | Auth | Status |
|-----------|----------|--------|------|--------|
| List items | `/roadmap` | GET | **Public** | ✅ Implemented |
| Get item | `/roadmap/:id` | GET | **Public** | ✅ Implemented |
| Create item | `/roadmap` | POST | Required | ✅ Implemented |
| Update item | `/roadmap/:id` | PATCH | Required | ✅ Implemented |
| Delete item | `/roadmap/:id` | DELETE | Required | ✅ Implemented |
| Vote for item | `/roadmap/:id/vote` | POST | Required | ✅ Implemented |
| Get votes | `/roadmap/:id/votes` | GET | Required | ✅ Implemented |
| Add comment | `/roadmap/:id/comments` | POST | Required | ❌ Not implemented |
| Get comments | `/roadmap/:id/comments` | GET | Public | ❌ Not implemented |
| Get linked tickets | `/roadmap/:id/linked-tickets` | GET | Required | ❌ Not implemented |
| Set visibility | `/roadmap/:id` (is_private) | PATCH | Admin | ❌ Not implemented |

**Fields Available:**
- id, title, description, type, status, priority
- target_date, completed_at
- created_by, created_at, updated_at
- vote_count (aggregated in query)

**Missing Fields:**
- tags/categories
- is_private (admin-only items)
- linked_tickets_count
- estimated_effort
- github_issue_url

### Users API (Admin Only)

| Operation | Endpoint | Method | Auth | Status |
|-----------|----------|--------|------|--------|
| List users | `/users` | GET | Admin | ✅ Implemented |
| Get user | `/users/:id` | GET | Admin | ✅ Implemented |
| Update user | `/users/:id` | PATCH | Admin | ✅ Implemented |
| Delete user | `/users/:id` | DELETE | Admin | ✅ Implemented |
| Generate token | `/users/:id/tokens` | POST | Admin | ❌ Not implemented |
| List tokens | `/users/:id/tokens` | GET | Admin | ❌ Not implemented |
| Create group | `/groups` | POST | Admin | ❌ Not implemented |
| Manage permissions | `/groups/:id/permissions` | POST | Admin | ❌ Not implemented |

**Fields Available:**
- id, email, name, avatar, role (admin/agent/user)
- oauth_provider, oauth_id
- created_at, updated_at

**Missing Fields/Features:**
- api_tokens relationship
- permissions (granular)
- group_memberships
- last_active_at
- is_service_account (concept doesn't exist yet)

---

## Database Schema (Current)

Based on initial migration (`001_initial_schema.sql`):

### Tables Implemented ✅
- `users` - User accounts
- `organizations` - Companies (table exists, no API)
- `contacts` - CRM contacts
- `tickets` - Support tickets
- `ticket_messages` - Ticket conversation
- `roadmap_items` - Product features
- `roadmap_votes` - Feature voting
- `activities` - Timeline events (table exists, no API)
- `ticket_roadmap_links` - Ticket-feature links (table exists, no API)

### Tables Missing ❌
- `api_tokens` - API token storage
- `groups` - Permission groups
- `group_members` - User-group relationships
- `group_hierarchy` - Nested groups
- `group_permissions` - Group permission grants
- `ticket_categories` - Ticket categorization
- `canned_responses` - Template messages
- `webhooks` - Webhook subscriptions
- `webhook_deliveries` - Delivery log

---

## API Completeness Assessment

### Overall Score by Module

| Module | CRUD | Search | Relations | Bulk | Export | Analytics | Score |
|--------|------|--------|-----------|------|--------|-----------|-------|
| Contacts | ✅ | ⚠️ Basic | ❌ | ❌ | ❌ | ❌ | 35% |
| Tickets | ✅ | ⚠️ Basic | ⚠️ Messages | ❌ | ❌ | ❌ | 40% |
| Roadmap | ✅ | ⚠️ Basic | ⚠️ Votes | ❌ | ❌ | ❌ | 45% |
| Users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | 25% |
| **Overall** | **✅** | **⚠️** | **⚠️** | **❌** | **❌** | **❌** | **36%** |

### Readiness for Agent Workflows

**Can Do Today (with current API):**
- ✅ List and view contacts, tickets, roadmap items
- ✅ Create/update/delete resources (with session auth)
- ✅ Add messages to tickets
- ✅ Vote on roadmap features
- ✅ Basic filtering (status, priority, lifecycle)
- ✅ Public roadmap access (no auth needed)

**Cannot Do Today (missing features):**
- ❌ Authenticate as agent (no API tokens)
- ❌ Track contact timeline/activities
- ❌ Categorize tickets
- ❌ Track SLA metrics
- ❌ Link tickets to roadmap
- ❌ Bulk operations
- ❌ Advanced search
- ❌ Export data
- ❌ Receive webhooks
- ❌ Generate analytics reports
- ❌ Manage permissions (no IAM)

**Workflow Readiness:**
- Auto-create ticket from email: **20%** (can create ticket, but no categories/auto-assign)
- Enrich contact from LinkedIn: **40%** (can update contact, but no activities log)
- Analyze feature requests: **30%** (can read tickets/roadmap, but no linking)
- Customer 360 view: **25%** (can get contact + tickets, but no activities/votes)
- Daily metrics report: **15%** (can read data, but no analytics aggregations)

---

## Security Posture

### Current Implementation
✅ **Good:**
- Session-based auth working
- Protected endpoints require authentication
- Admin-only endpoints check role
- HTTPS enforced (Cloudflare)
- Session cookies httpOnly, secure, sameSite
- Trust proxy configured for nginx

⚠️ **Missing:**
- No API tokens (agents can't authenticate)
- No granular permissions (only 3 roles)
- No rate limiting
- No audit logging
- No webhook signature verification
- No token expiration/rotation

### Public Endpoints Analysis
- `/health` - Public (intentional, monitoring)
- `/roadmap` - **Public** (intentional for public feature voting)
  - Anyone can see roadmap items
  - Voting requires authentication
  - Creation/update requires authentication

**Risk:** Low - public roadmap is a feature, not a bug.

---

## Performance Observations

**Response Times (from barrow to production):**
- Health check: ~150ms
- Roadmap list: ~180ms
- Protected endpoint 401: ~120ms

**Optimization Opportunities:**
- Add indexes on frequently filtered columns (status, priority)
- Implement query result caching
- Add pagination to all list endpoints
- Optimize vote count aggregation (denormalize?)

---

## Breaking Changes Required

To implement IAM (venn-73r), we'll need to:

1. **Migrate `role` column to groups**
   - Add users to default groups based on role
   - Keep role column temporarily for backward compatibility
   - Update all `requireAdmin` checks to use new permission system

2. **Add permission checks everywhere**
   - Replace role checks with permission checks
   - `requireRole('admin')` → `requirePermission('users:admin')`
   - May temporarily break admin features during migration

3. **Update frontend auth checks**
   - Change from `user.role === 'admin'` to permission checks
   - May require API changes for permission checking

**Migration Strategy:**
- Implement IAM alongside existing role system
- Dual-mode: check both old and new systems
- Migrate gradually, deprecate role column later
- No breaking changes for existing users

---

## Test Coverage Gaps

**What we can test now:**
- ✅ Basic CRUD operations (with manual auth)
- ✅ Endpoint existence and auth requirements
- ✅ Public vs protected endpoint separation

**What we cannot test yet:**
- ❌ API token authentication (doesn't exist)
- ❌ Permission-based access control (not implemented)
- ❌ Webhook delivery (no webhooks)
- ❌ Bulk operations (not implemented)
- ❌ Advanced search (basic only)
- ❌ Analytics endpoints (don't exist)

**Next Steps for Testing:**
1. Manual authentication with session cookies
2. Run full CRUD test suite
3. Document any unexpected behaviors
4. Create baseline metrics for performance

---

## Recommendations

### Immediate Priorities (Before Other Work)

1. **Document all current endpoints** ✅ Done (this doc)
2. **Run authenticated test suite** - Next step
3. **Fix any critical bugs** discovered in testing

### Foundation Work (P1)

1. **venn-73r: Implement IAM** - Required for everything else
2. **venn-271: API tokens** - Required for agent access

### Quick Wins (P2)

1. **venn-npn: Activities API** - High value, no IAM dependency
2. **venn-3bw: Ticket categories** - Simple, useful immediately

### Long Term (P3+)

- Bulk operations
- Advanced search
- Webhooks
- Analytics

---

## Next Steps

1. ✅ **Document current state** - This file
2. ⏭️ **Run authenticated tests** - Create session, run test-contacts.sh, test-tickets.sh
3. ⏭️ **Implement Activities API (venn-npn)** - Quick win before IAM
4. ⏭️ **Implement IAM (venn-73r)** - Foundation for all agent features
5. ⏭️ **Implement API tokens (venn-271)** - Enable agent authentication
6. ⏭️ **Build MCP server (venn-rzr)** - Agent interface

---

**Report Generated:** 2026-02-20 23:06 UTC  
**API Version:** Pre-IAM baseline  
**Overall Readiness:** 36% (basic CRUD working, missing agent essentials)
