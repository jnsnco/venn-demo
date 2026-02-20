# IAM Architecture - Identity and Access Management

**Status:** Design finalized 2026-02-20  
**Implementation:** venn-73r (P1), venn-271 (P2)

## Overview

venn uses a group-based Identity and Access Management (IAM) system with resource-level permissions. All users are equal - there are no "service accounts" or special user types. Access control is entirely managed through group membership and permission grants.

---

## Core Principles

1. **All users are users** - No distinction between human and bot accounts at the user level
2. **Groups control access** - All permissions granted via groups
3. **Multiple group membership** - Users can belong to many groups
4. **Nested groups** - Groups can contain other groups
5. **Permission inheritance** - Child groups inherit parent permissions
6. **Override capability** - Child groups can explicitly override inherited permissions
7. **Dual auth methods** - OAuth for UI, API tokens for programmatic access

---

## Authentication Methods

### OAuth (UI Access)
- **Purpose:** Human users accessing web interface
- **Providers:** GitHub, Google (extensible)
- **Flow:** OAuth redirect → session cookie
- **Permission required:** `oauth:use`
- **Default for:** Human Users group

### API Tokens (Programmatic Access)
- **Purpose:** Agents, scripts, integrations
- **Format:** Bearer token in Authorization header
- **Generation:** Requires `tokens:generate` permission
- **Storage:** Hashed in database (bcrypt)
- **Default for:** AI Agents group

### Both Methods
- Users can have OAuth AND API tokens
- Controlled by group permissions
- Same permission system underneath

---

## Permission Model

### Format
`resource:action`

**Examples:**
- `contacts:read` - View contacts
- `contacts:write` - Create/update contacts
- `contacts:delete` - Delete contacts
- `contacts:*` - All contact operations
- `*:*` - All operations on all resources (admin)

### Resources

| Resource   | Description              | Example Permissions              |
|------------|--------------------------|----------------------------------|
| `oauth`    | UI access control        | `oauth:use`                      |
| `tokens`   | API token management     | `tokens:generate`                |
| `contacts` | CRM module               | `contacts:read`, `contacts:write`|
| `tickets`  | Support module           | `tickets:*`                      |
| `roadmap`  | Product module           | `roadmap:read`, `roadmap:vote`   |
| `users`    | User management          | `users:admin`                    |
| `groups`   | Group management         | `groups:admin`                   |
| `analytics`| Reports and metrics      | `analytics:read`                 |

### Actions

| Action   | Scope                          |
|----------|--------------------------------|
| `read`   | View, list, search             |
| `write`  | Create, update                 |
| `delete` | Delete                         |
| `admin`  | Full control + management      |
| `use`    | Special (oauth, tokens)        |
| `vote`   | Special (roadmap voting)       |
| `*`      | All actions on this resource   |

### Wildcards

- `contacts:*` - All actions on contacts
- `*:read` - Read all resources
- `*:*` - All actions on all resources (superuser)

---

## Groups

### Default Groups

#### Human Users (auto-assigned on OAuth signup)
```
Name: "Human Users"
Auto-assign: OAuth signups
Permissions:
  - oauth:use
  - contacts:read
  - tickets:read
  - tickets:write (create tickets)
  - roadmap:read
  - roadmap:vote
```

Users can view CRM, create support tickets, vote on features. Cannot generate API tokens by default.

#### AI Agents (auto-assigned on programmatic user creation)
```
Name: "AI Agents"
Auto-assign: API user creation
Permissions:
  - tokens:generate
  - contacts:*
  - tickets:*
  - roadmap:*
  - analytics:read
```

Full API access to core modules, can generate tokens. No UI access by default.

#### Admins (manually assigned)
```
Name: "Admins"
Assignment: Manual
Permissions:
  - *:* (superuser)
```

Full access to everything, including user/group management.

### Custom Groups

Admins can create custom groups for specific use cases:

**Example: Support Team**
```
Permissions:
  - oauth:use
  - tokens:generate (for Slack bot integration)
  - contacts:*
  - tickets:*
  - analytics:read
```

**Example: Read-Only Analytics Bot**
```
Permissions:
  - tokens:generate
  - analytics:read
  - contacts:read
  - tickets:read
  - roadmap:read
```

**Example: Sales Team**
```
Permissions:
  - oauth:use
  - contacts:*
  - tickets:read
  - roadmap:read
```

### Nested Groups

Groups can contain other groups, forming a hierarchy.

**Example Hierarchy:**
```
Group: "Engineering"
  Permissions: contacts:read, tickets:read
  
  Child: "Backend Team"
    Inherits: contacts:read, tickets:read
    Adds: tickets:write, roadmap:write
    Final: contacts:read, tickets:read, tickets:write, roadmap:write
  
  Child: "Frontend Team"
    Inherits: contacts:read, tickets:read
    Adds: roadmap:vote
    Final: contacts:read, tickets:read, roadmap:vote
```

### Permission Inheritance

**Rules:**
1. Child groups inherit all parent permissions (union)
2. Child groups can ADD additional permissions
3. Child groups can REMOVE inherited permissions (explicit override)

**Example: Override**
```
Parent: "All Engineers"
  Permissions: tickets:write

Child: "Junior Engineers"
  Inherits: tickets:write
  Removes: tickets:write (override)
  Adds: tickets:read
  Final: tickets:read (only)
```

---

## Permission Resolution

When checking if a user has permission `contacts:write`:

1. **Collect groups:**
   - Get all groups user is a direct member of
   - Recursively get all parent groups

2. **Collect permissions:**
   - Get permissions from all groups
   - Apply inheritance (child adds/removes)

3. **Check match:**
   - Exact match: `contacts:write` matches `contacts:write`
   - Wildcard action: `contacts:*` matches `contacts:write`
   - Wildcard resource: `*:write` matches `contacts:write`
   - Superuser: `*:*` matches everything

4. **Cache:**
   - Cache resolved permissions for performance
   - Invalidate on group membership or permission changes

---

## Database Schema

### groups
```sql
CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  is_system_group BOOLEAN DEFAULT FALSE, -- for default groups
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### group_members
```sql
CREATE TABLE group_members (
  group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (group_id, user_id)
);

CREATE INDEX idx_group_members_user ON group_members(user_id);
```

### group_hierarchy
```sql
CREATE TABLE group_hierarchy (
  parent_group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
  child_group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (parent_group_id, child_group_id),
  CHECK (parent_group_id != child_group_id) -- prevent self-reference
);

CREATE INDEX idx_group_hierarchy_child ON group_hierarchy(child_group_id);
```

### group_permissions
```sql
CREATE TABLE group_permissions (
  group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
  permission VARCHAR(255) NOT NULL, -- format: "resource:action"
  is_override BOOLEAN DEFAULT FALSE, -- true if removing inherited permission
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (group_id, permission)
);

CREATE INDEX idx_group_permissions_group ON group_permissions(group_id);
```

### api_tokens
```sql
CREATE TABLE api_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- friendly name (e.g., "Slack Bot")
  token_hash VARCHAR(255) NOT NULL, -- bcrypt hash
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP, -- NULL = never expires
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_tokens_user ON api_tokens(user_id);
CREATE UNIQUE INDEX idx_api_tokens_hash ON api_tokens(token_hash);
```

---

## API Endpoints

### Groups Management

```
POST   /groups                    Create group
GET    /groups                    List all groups
GET    /groups/:id                Get group details
PATCH  /groups/:id                Update group
DELETE /groups/:id                Delete group

POST   /groups/:id/members        Add user to group
DELETE /groups/:id/members/:uid   Remove user from group
GET    /groups/:id/members        List group members

POST   /groups/:id/subgroups      Add child group
DELETE /groups/:id/subgroups/:cid Remove child group
GET    /groups/:id/tree           Get group hierarchy

POST   /groups/:id/permissions    Add permission
DELETE /groups/:id/permissions    Remove permission
GET    /groups/:id/permissions    List permissions
```

### User Groups

```
GET    /users/:id/groups          List user's groups
POST   /users/:id/groups          Add user to group (admin)
```

### API Tokens

```
POST   /auth/tokens               Generate token
GET    /auth/tokens               List user's tokens
DELETE /auth/tokens/:id           Revoke token
```

### Permission Checks

Middleware for route protection:

```typescript
import { requirePermission } from './middleware/auth';

// Single permission
router.get('/contacts', requirePermission('contacts:read'), handler);

// Multiple permissions (any)
router.post('/tickets', 
  requirePermission(['tickets:write', 'tickets:admin']), 
  handler
);

// Check in handler
if (!hasPermission(req.user, 'contacts:delete')) {
  return res.status(403).json({ error: 'Insufficient permissions' });
}
```

---

## MCP Tools (for Agents)

Agents can manage IAM via MCP server:

```typescript
// Group management
create_group({ name, description, permissions })
add_user_to_group({ user_id, group_id })
remove_user_from_group({ user_id, group_id })
list_user_groups({ user_id })

// Permission checks
check_permission({ user_id, permission })
list_user_permissions({ user_id })

// Token management (agents can create tokens for themselves)
generate_token({ name, expires_in_days })
list_tokens()
revoke_token({ token_id })
```

---

## Migration from Current Roles

Current system has simple `role` column: admin, agent, user.

**Migration strategy:**

1. Create default groups (Human Users, AI Agents, Admins)
2. Migrate users:
   - `role = 'admin'` → add to Admins group
   - `role = 'agent'` → add to Support Agents group (new)
   - `role = 'user'` → add to Human Users group
3. Keep `role` column temporarily for backward compatibility
4. Update all permission checks to use new system
5. Deprecate and remove `role` column in future release

**Support Agents group** (new):
```
Permissions:
  - oauth:use
  - tokens:generate
  - contacts:*
  - tickets:*
  - analytics:read
```

---

## Security Considerations

### Token Security
- Tokens hashed with bcrypt (cost 10+)
- Plaintext token shown ONLY on creation
- Stored hash never exposed via API
- Last used timestamp for audit trail
- Optional expiration enforcement

### Permission Caching
- Resolved permissions cached per user
- Cache invalidated on:
  - Group membership change
  - Group permission change
  - Group hierarchy change
- Cache TTL: 5 minutes (configurable)

### Audit Logging (future)
- Log all permission grants/revokes
- Log group membership changes
- Log token creation/revocation
- Track who made changes (admin user)

### Rate Limiting (future)
- Limit token generation (5 per hour)
- Limit permission check API calls
- Prevent permission enumeration attacks

---

## UI Components

### Admin Pages

**`/admin/groups`** - Group Management
- List all groups
- Create new group button
- Edit/delete actions
- Member count

**`/admin/groups/:id`** - Group Detail
- Group info (name, description)
- Permissions editor (add/remove)
- Members list (add/remove users)
- Hierarchy visualization
- Effective permissions calculator

**`/admin/users/:id`** - User Management
- User's groups (badges)
- Add to group button
- Remove from group
- Effective permissions view

**`/settings/api-tokens`** - User Settings
- Generate API token
- List active tokens (name, created, last used)
- Revoke button
- Copy token to clipboard (on creation only)

### Permission Checks in UI

Hide/disable features based on permissions:

```tsx
{hasPermission(user, 'contacts:write') && (
  <button onClick={createContact}>Create Contact</button>
)}

{hasPermission(user, 'groups:admin') && (
  <Link to="/admin/groups">Manage Groups</Link>
)}
```

---

## Testing Strategy

### Unit Tests
- Permission resolution algorithm
- Nested group inheritance
- Override logic (child removes parent permission)
- Wildcard matching

### Integration Tests
- Group CRUD via API
- User-group assignment
- Permission middleware on protected routes
- Token generation and validation

### E2E Tests
- Admin creates group with permissions
- Admin adds user to group
- User gains access to protected resource
- User loses access when removed from group

---

## Implementation Order

1. **venn-73r (P1):** IAM system
   - Database schema
   - Permission resolution
   - Middleware for checks
   - Default groups

2. **venn-271 (P2):** API tokens
   - Token generation
   - Bearer auth middleware
   - Token CRUD endpoints

3. **Admin UI (P3):**
   - Group management pages
   - User-group assignment
   - Permission editor

4. **MCP Tools (P2):**
   - Expose IAM via MCP
   - Agent self-service

---

## Example Scenarios

### Scenario 1: Support Agent
**User:** Alice  
**Groups:** Human Users, Support Team  
**Effective Permissions:**
- From Human Users: `oauth:use`, `contacts:read`, `tickets:read`, `roadmap:read`
- From Support Team: `contacts:*`, `tickets:*`
- **Final (union):** `oauth:use`, `contacts:*`, `tickets:*`, `roadmap:read`

Alice can use OAuth, has full access to contacts and tickets, can view roadmap.

### Scenario 2: Analytics Bot
**User:** analytics-bot  
**Groups:** AI Agents, Read-Only Bots  
**Effective Permissions:**
- From AI Agents: `tokens:generate`, `contacts:*`, `tickets:*`, `roadmap:*`
- From Read-Only Bots: Override to remove write permissions
- **Final:** `tokens:generate`, `contacts:read`, `tickets:read`, `roadmap:read`, `analytics:read`

Bot can generate tokens, read all data, no write access.

### Scenario 3: Engineering Team Hierarchy
**User:** Bob  
**Groups:** Engineering → Backend Team  
**Effective Permissions:**
- From Engineering (parent): `contacts:read`, `tickets:read`
- From Backend Team (child): Inherits + adds `tickets:write`, `roadmap:write`
- **Final:** `contacts:read`, `tickets:read`, `tickets:write`, `roadmap:write`

Bob inherits engineering base permissions plus backend-specific permissions.

---

## Future Enhancements

### Resource-Level Permissions
Currently permission checks are at module level (`contacts:read`). Could extend to resource level:
- `contacts:123:read` - Read specific contact
- `tickets:owner:*` - Full access to own tickets only

### Conditional Permissions
Permissions based on context:
- `tickets:read if priority != urgent`
- `contacts:write if lifecycle_stage = lead`

### Time-Based Permissions
Temporary access grants:
- Grant `contacts:*` for 24 hours
- Auto-revoke after expiration

### External Identity Providers
- SAML/LDAP integration
- Sync groups from external systems
- SSO with enterprise providers

---

**Status:** Design complete, ready for implementation.  
**Next:** Implement venn-73r (IAM system), then venn-271 (API tokens).
