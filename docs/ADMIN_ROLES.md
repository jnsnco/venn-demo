# Admin & User Roles

Venn now has role-based access control (RBAC) with three user roles:

## Roles

### Admin
- **Full access** to all features
- User management (view, edit roles, delete users)
- Future: App settings, billing, integrations
- **Badge:** Red "Admin" badge in sidebar

### Agent
- Access to CRM, Support, Roadmap
- Cannot manage users or settings
- Intended for support team members
- **Not yet differentiated from User role** (future enhancement)

### User (Default)
- Standard access to CRM, Support, Roadmap
- Cannot access admin features
- Default role for new signups

## Database

**Users table** includes `role` column:
```sql
role VARCHAR(50) NOT NULL DEFAULT 'user' 
  CHECK (role IN ('admin', 'agent', 'user'))
```

## Backend API

### Middleware

```typescript
import { requireAuth, requireAdmin, requireRole } from './middleware/auth';

// Require authentication
app.get('/api/some-route', requireAuth, handler);

// Require admin role
app.get('/api/admin-only', requireAdmin, handler);

// Require specific roles
app.get('/api/agent-or-admin', requireRole('admin', 'agent'), handler);
```

### Admin Routes

**All routes require admin role:**

- `GET /api/users` - List all users (paginated)
- `GET /api/users/:id` - Get specific user
- `PATCH /api/users/:id` - Update user (name, role)
- `DELETE /api/users/:id` - Delete user

**Safety features:**
- Cannot delete yourself
- Cannot delete the last admin
- Cannot demote the last admin to user/agent

## Frontend

### Admin UI

- **/admin/users** - User management page (admin only)
  - List all users with pagination
  - Change roles via dropdown
  - Delete users with confirmation
  - Shows user avatar, email, OAuth provider, join date

### Navigation

- Admin section appears in sidebar for admins only
- Admin badge next to user name
- Admin menu items grouped under "Admin" header

### Protection

Routes are protected on both frontend and backend:

```tsx
// Frontend route protection
{user.role === 'admin' && (
  <Route path="admin/users" element={<AdminUsers />} />
)}
```

Backend always enforces permissions - frontend hiding is just UX.

## First Admin

Migration `002_make_first_user_admin.sql` runs automatically:
- Promotes first user to admin if no admins exist
- Safe to run multiple times (idempotent)
- Run with: `./run-migration.sh 002_make_first_user_admin.sql`

## Future Enhancements

### Agent Role Differentiation
Currently agent and user roles have the same permissions. Future:
- Agents can access all tickets (not just assigned)
- Agents can see all contacts (not just owned)
- Agents can access canned responses
- Users only see their own data

### Custom Roles
- Define custom roles with granular permissions
- Role templates (Sales, Support, Manager, etc.)
- Per-module permissions (CRM only, Support only)

### Teams/Workspaces
- Multi-tenant support
- Users belong to teams
- Roles scoped to teams
- Cross-team visibility settings

### Audit Log
- Track who changed what
- User role changes logged
- Admin actions tracked
- Export audit log

## Security Notes

- **Trust the backend**: Frontend protection is UX, not security
- **Session-based auth**: User object includes role, re-verified on each request
- **Passport serialization**: User role stored in session, refreshed on login
- **No role escalation**: Users cannot change their own role

## Testing

1. **Login** as the first user (now admin)
2. **Navigate** to `/admin/users` in sidebar
3. **Change roles** via dropdown
4. **Verify** role badge appears next to name
5. **Try deleting** last admin (should fail)
6. **Logout** and login as non-admin (no admin menu)

## Troubleshooting

### "Admin menu not showing"
- Check user role: `SELECT email, role FROM users;`
- Ensure role is exactly 'admin' (lowercase)
- Clear browser cache and hard refresh
- Verify API returns user.role in `/api/auth/me`

### "Cannot access admin page"
- Admin menu might be hidden but route accessible via URL
- Backend will return 403 if not admin
- Check browser console for API errors

### "Migration didn't run"
- Check PostgreSQL logs: `journalctl -u postgresql`
- Verify migration file exists: `ls backend/migrations/`
- Run manually: `./run-migration.sh 002_make_first_user_admin.sql`

---

**Implemented:** 2026-02-07  
**Issue:** venn-dmt  
**Status:** ✅ Complete
