# venn - Design Decisions

## Application Architecture

### Core Modules
1. **CRM Module** - Customer relationship management
2. **Support Module** - Ticket/support system
3. **Roadmap Module** - Product planning and issue tracking

### Data Model Philosophy
- **Unified customer view**: One customer record ties together CRM contacts, support tickets, and product feedback
- **Activity timeline**: All interactions (CRM notes, support tickets, roadmap mentions) in one chronological view
- **Smart linking**: Tickets can reference roadmap items, roadmap items can track customer requests

### Database Schema (PostgreSQL)

#### Core Entities

**users**
- id, email, name, avatar, role (admin/agent/user)
- oauth_provider, oauth_id
- created_at, updated_at

**organizations**
- id, name, domain, plan_tier
- created_at, updated_at

**contacts** (CRM)
- id, organization_id, name, email, phone, title
- lifecycle_stage (lead/prospect/customer/churned)
- tags (JSONB)
- custom_fields (JSONB)
- created_at, updated_at, last_contact_at

**tickets** (Support)
- id, contact_id, assigned_to (user_id)
- subject, status (open/pending/resolved/closed)
- priority (low/medium/high/urgent)
- channel (email/chat/phone)
- created_at, updated_at, resolved_at

**ticket_messages**
- id, ticket_id, user_id, contact_id
- body, is_internal (boolean for internal notes)
- created_at

**roadmap_items** (Product)
- id, title, description
- type (feature/bug/improvement)
- status (backlog/planned/in-progress/completed/cancelled)
- priority (low/medium/high)
- target_date, completed_at
- created_by (user_id)
- created_at, updated_at

**roadmap_votes**
- id, roadmap_item_id, contact_id, organization_id
- created_at
- Tracks customer interest in features

**activities**
- id, type (note/email/call/ticket/roadmap_update)
- contact_id, user_id
- subject, body
- metadata (JSONB for type-specific data)
- created_at

### Key Features

#### CRM
- Contact/organization management
- Activity timeline per contact
- Custom fields and tags
- Lifecycle stage tracking
- Email integration (future)

#### Support
- Multi-channel ticket creation
- Assignment and status tracking
- Internal notes vs customer-facing messages
- SLA tracking (future enhancement)

#### Roadmap
- Public-facing roadmap view
- Customer voting/feedback
- Ticket → roadmap item linking
- Progress tracking

### UI/UX Decisions

**Layout:**
- Left sidebar: Module navigation (CRM / Support / Roadmap / Settings)
- Main area: List view + detail panel (split view for efficiency)
- Unified search across all modules

**Design System:**
- Tailwind CSS for rapid development
- Shadcn/ui components for consistency
- Dark mode support
- Mobile-responsive

**Key Workflows:**
1. **Support agent flow**: Ticket list → ticket detail → customer context (CRM) in sidebar
2. **Product flow**: Roadmap planning → see customer votes → link to support tickets
3. **Sales flow**: Contact management → see support history → track product engagement

### Authentication
- OAuth 2.0 (Google + GitHub initially)
- Passport.js for Node.js
- JWT for session management
- Role-based access control (RBAC)

### API Design
- RESTful API
- `/api/v1/contacts`, `/api/v1/tickets`, `/api/v1/roadmap`
- Pagination on all list endpoints
- Filter/search query params
- Standardized error responses

### Deployment Strategy
- Backend: Node.js process (PM2 for process management)
- Frontend: Static build served by nginx
- Database: PostgreSQL 15+
- Reverse proxy: nginx
- SSL: Let's Encrypt (to be configured)

### Environment Configuration
```
DATABASE_URL=postgresql://user:pass@localhost:5432/venn
OAUTH_GOOGLE_CLIENT_ID=...
OAUTH_GOOGLE_CLIENT_SECRET=...
OAUTH_GITHUB_CLIENT_ID=...
OAUTH_GITHUB_CLIENT_SECRET=...
JWT_SECRET=...
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://venn.example.com
```

### Future Enhancements (v2+)
- Email integration (IMAP/SMTP)
- Slack/Discord integration for support
- Advanced analytics dashboard
- Webhook/API for integrations
- Custom workflow automation
- Multi-tenant architecture

---
*Updated: 2025-01-29 09:30 UTC*
