# Support/Ticketing System Capabilities Research

**Research for:** venn-jvc  
**Date:** 2026-02-02  
**Focus:** Optimal feature set for support ticket system

---

## Executive Summary

A minimal viable support system needs:
1. **Ticket Management** - Create, assign, track, resolve tickets
2. **Communication** - Customer and internal messaging
3. **Organization** - Categories, priorities, SLAs
4. **Reporting** - Performance metrics and insights

For venn, focus on **core support workflows** that integrate well with CRM and Roadmap modules.

---

## Phase 1: MVP (Current + Essential Additions)

### ✅ Already Implemented
- Ticket CRUD
- Fields: subject, contact, priority, status, channel
- Ticket messages (customer + internal notes)
- Link tickets to contacts
- Link tickets to roadmap items
- Ticket list with filters
- Ticket detail view with conversation

### 🎯 Essential MVP Additions

#### 1. Ticket Assignment
**Why:** Route tickets to the right person

**Fields:**
- assigned_to (user_id)
- assigned_at (timestamp)
- assignment_history (who, when)

**Features:**
- Assign on creation or later
- Reassign to different agent
- Unassigned tickets view
- "My Tickets" view
- Assignment notifications

**UI:**
- Assignee dropdown on ticket detail
- Filter by assignee on list page
- Assignment indicator (avatar/initials)

---

#### 2. Ticket Categories/Tags
**Why:** Organize and route tickets

**Examples:**
- Technical Support
- Billing
- Feature Request
- Bug Report

**Implementation:**
- Add categories table or use tags
- Multi-select (ticket can have multiple tags)
- Filter tickets by category
- Auto-assignment rules based on category

---

#### 3. SLA Tracking
**Why:** Ensure timely responses

**Metrics:**
- First response time (time until first agent reply)
- Resolution time (time from open to closed)
- SLA targets by priority:
  - Urgent: 1 hour response, 4 hour resolution
  - High: 4 hour response, 24 hour resolution
  - Medium: 8 hour response, 48 hour resolution
  - Low: 24 hour response, 5 day resolution

**UI:**
- SLA timer on ticket (green/yellow/red)
- "Breached SLA" filter
- Dashboard widget showing SLA compliance %

**Implementation:**
- Calculate elapsed time (business hours)
- Flag tickets approaching SLA breach
- Report on SLA performance

---

#### 4. Canned Responses/Templates
**Why:** Save time on common replies

**Features:**
- Create message templates
- Insert template into reply box
- Variables (customer name, ticket ID, etc.)
- Categories for templates

**Examples:**
- "Password reset instructions"
- "Feature request acknowledged"
- "Ticket resolved notification"

**UI:**
- Template picker in message composer
- Search templates
- Preview before insert

---

#### 5. Ticket Search
**Why:** Find tickets quickly

**Current:** No search implemented

**Search by:**
- Subject
- Ticket ID
- Contact name/email
- Message content
- Tags/categories
- Date range

**UI:**
- Search bar on tickets list
- Advanced filters sidebar

---

## Phase 2: Enhanced Features

### 1. Email Integration
**Why:** Most support happens via email

**Inbound:**
- Create ticket from incoming email
- Parse email subject → ticket subject
- Parse email body → first message
- Identify customer by email address
- Create contact if doesn't exist

**Outbound:**
- Send ticket replies as emails
- Email includes ticket history
- Reply-to address routes back to ticket

**Implementation Options:**
- IMAP/SMTP (self-hosted)
- SendGrid/Postmark (API)
- Support email: support@venn-demo.avan.academy

**Technical:**
- Email parser (strip signatures, quotes)
- Thread ID tracking (In-Reply-To header)
- Attachment handling

---

### 2. Customer Portal
**Why:** Let customers self-serve

**Features:**
- Customer login (via email link or password)
- View their tickets
- Create new ticket via form
- Reply to tickets
- See ticket status

**Security:**
- Customers only see their own tickets
- No internal notes visible
- Rate limiting on ticket creation

**UI:**
- Simple, clean interface
- No "agent" features visible
- Responsive (mobile-friendly)

---

### 3. Ticket Merging
**Why:** Handle duplicate tickets

**Features:**
- Identify duplicate tickets
- Merge tickets (combine messages)
- Choose primary ticket
- Redirect merged ticket IDs to primary

**UI:**
- "Merge with" button on ticket detail
- Search for target ticket
- Confirm merge with preview

---

### 4. Macros/Bulk Actions
**Why:** Handle multiple tickets efficiently

**Examples:**
- Bulk assign to agent
- Bulk change status
- Bulk add tag
- Apply canned response to multiple

**UI:**
- Checkbox selection on ticket list
- "Actions" dropdown
- Confirmation before applying

---

### 5. Satisfaction Ratings (CSAT)
**Why:** Measure customer satisfaction

**Features:**
- Send rating request when ticket closed
- Simple scale: 😀 Happy, 😐 Neutral, 😞 Unhappy
- Optional comment
- Track rating by agent, category, time

**Implementation:**
- Email with rating links (tracked tokens)
- Rating form (if web-based)
- Store in ticket_ratings table

**Reporting:**
- Overall CSAT %
- CSAT by agent
- CSAT trend over time

---

## Phase 3: Advanced Features

### 1. Knowledge Base Integration
**Why:** Reduce ticket volume with self-service

**Features:**
- Create articles (how-tos, FAQs)
- Search knowledge base
- Suggest articles based on ticket subject
- Link articles in replies
- Track article helpfulness

**Structure:**
- Categories/sections
- Tags
- Search
- Markdown content

**Integration:**
- Agent can insert article links in replies
- Customer portal shows related articles

---

### 2. Automation Rules
**Why:** Reduce manual work

**Examples:**
- Auto-assign based on category
- Auto-tag based on keywords
- Auto-escalate if no response in X hours
- Auto-close if resolved + no reply for 3 days

**Rule Engine:**
- Trigger: Ticket created, updated, message added
- Conditions: Priority = X, Category = Y, Age > Z
- Actions: Assign, tag, change status, send notification

**UI:**
- Settings → Automation Rules
- Create rule wizard
- Test rules

---

### 3. Multi-Channel Support
**Current:** Supports email, chat, phone, web

**Expand:**
- Live chat widget (for web channel)
- SMS (for phone channel)
- Social media (Twitter DMs, Facebook messages)

**Implementation:**
- Unified inbox (all channels → tickets)
- Channel-specific features (typing indicators for chat)

---

### 4. Collision Detection
**Why:** Prevent two agents working same ticket

**Features:**
- Show "Agent X is viewing this ticket"
- Lock ticket when agent starts reply
- Warn if another agent replied while composing

**Implementation:**
- Real-time presence (WebSocket)
- Lock mechanism (timeout after 5min)

---

### 5. Advanced Reporting
**Beyond basic SLA metrics**

**Reports:**
- Tickets by category (bar chart)
- Resolution time trend (line chart)
- Agent performance (tickets resolved, avg time, CSAT)
- Busiest times (heatmap)
- Common issues (keyword analysis)

**Export:**
- CSV/Excel export
- Schedule email reports
- Dashboard widgets

---

### 6. Integrations
**Connect support to other tools**

**Examples:**
- Slack: Notify channel on new ticket
- Jira: Create Jira issue from ticket
- GitHub: Link ticket to GitHub issue
- Zapier: Custom integrations

**Implementation:**
- Webhooks (outbound)
- OAuth (inbound API calls)
- Integration settings per tool

---

## What NOT to Build (Out of Scope)

### ❌ Features to Avoid
1. **AI Chatbot** - Too complex, questionable value
2. **Phone System Integration** - VoIP/call center features
3. **Advanced Routing (skill-based)** - Overkill for small teams
4. **Screen Sharing** - Use external tools (Zoom, etc.)
5. **Time Tracking (detailed)** - Simple resolution time is enough
6. **Advanced Workflow (Jira-like)** - Keep it simple
7. **Custom Fields (extensive)** - Adds UI complexity
8. **Multi-brand Support** - Single brand is fine
9. **Agent Shifts/Scheduling** - HR features out of scope
10. **Ticket Approvals** - Unnecessary bureaucracy

---

## Recommended Implementation Priority

### Now (MVP):
1. ✅ Ticket CRUD - Done
2. ✅ Messages (customer + internal) - Done
3. 🔨 Ticket Assignment - Critical
4. 🔨 Categories/Tags - Organization
5. 🔨 SLA Tracking - Quality metric
6. 🔨 Canned Responses - Efficiency
7. 🔨 Ticket Search - Usability

### Next (Phase 2):
8. Email Integration - Most common channel
9. Customer Portal - Self-service
10. CSAT Ratings - Quality feedback
11. Macros/Bulk Actions - Productivity

### Later (Phase 3):
12. Knowledge Base - Reduce ticket volume
13. Automation Rules - Scale support
14. Advanced Reporting - Insights

### Probably Not:
- Multi-channel (chat, SMS, social)
- Collision detection (nice-to-have)
- Complex integrations (Slack/Jira can wait)

---

## Technical Recommendations

### Database Schema Changes:
```sql
-- Ticket assignment
ALTER TABLE tickets ADD COLUMN assigned_to INTEGER REFERENCES users(id);
ALTER TABLE tickets ADD COLUMN assigned_at TIMESTAMP;

-- Categories
CREATE TABLE ticket_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7), -- hex color
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ticket-category junction (many-to-many)
CREATE TABLE ticket_category_assignments (
  ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES ticket_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (ticket_id, category_id)
);

-- Canned responses
CREATE TABLE canned_responses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- SLA events
CREATE TABLE ticket_sla_events (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
  event_type VARCHAR(50), -- first_response, resolved
  occurred_at TIMESTAMP NOT NULL,
  within_sla BOOLEAN
);

-- CSAT ratings
CREATE TABLE ticket_ratings (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
  rating VARCHAR(20), -- happy, neutral, unhappy
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints to Add:
```
# Assignment
PATCH /api/tickets/:id/assign { user_id: number }

# Categories
GET    /api/ticket-categories
POST   /api/ticket-categories
DELETE /api/ticket-categories/:id
POST   /api/tickets/:id/categories { category_id: number }
DELETE /api/tickets/:id/categories/:categoryId

# Canned responses
GET    /api/canned-responses
POST   /api/canned-responses
DELETE /api/canned-responses/:id

# SLA
GET    /api/tickets/:id/sla-status

# Ratings
POST   /api/tickets/:id/rating { rating, comment }

# Search
GET    /api/tickets/search?q=query
```

### Frontend Components:
- `AssigneeSelect.tsx` - User picker dropdown
- `CategoryPicker.tsx` - Multi-select categories
- `CannedResponsePicker.tsx` - Template selector
- `SLAIndicator.tsx` - Timer/status badge
- `TicketFilters.tsx` - Advanced filter sidebar

---

## Integration with CRM & Roadmap

### CRM Integration:
- ✅ Tickets linked to contacts
- Show ticket count on contact card
- Show contact details on ticket page
- Filter tickets by contact lifecycle stage

### Roadmap Integration:
- ✅ Link tickets to roadmap items
- Show linked tickets on roadmap detail
- "Vote from ticket" - customer feedback
- Auto-create roadmap item from multiple similar tickets

### Future:
- Create contact from ticket (if customer new)
- Suggest related roadmap items when replying
- Show customer's other tickets in sidebar

---

## Competitive Analysis

**Zendesk:**
- ✅ Mature, feature-rich
- ✅ Good email integration
- ❌ Expensive, bloated

**Intercom:**
- ✅ Modern UI
- ✅ Great live chat
- ❌ Messaging-first (not ticket-first)

**Freshdesk:**
- ✅ Good balance of features
- ✅ Reasonable pricing
- ❌ UI feels dated

**Linear (for inspiration):**
- ✅ Clean, fast UI
- ✅ Keyboard shortcuts
- ✅ Great developer experience
- ❌ Not built for support

**venn's Approach:**
- Simple, focused ticket management
- Tight CRM + Support + Roadmap integration
- Developer-friendly
- Open-source potential

---

## Success Metrics (for venn)

**Good indicators:**
- Can create/manage tickets ✅
- Can assign and track status ⏳
- Can measure response/resolution time ⏳
- Can search and filter efficiently ⏳
- Email integration works ⏳
- Code demonstrates best practices ✅

---

## Conclusion

**For venn MVP (now):**
Focus on **assignment**, **categories**, **SLA tracking**, and **canned responses**. These make the support module professional and usable.

**For venn Phase 2:**
Add **email integration** and **customer portal** to make it truly functional.

**Skip:** Multi-channel support, AI features, complex automations.

**Total estimated work:**
- MVP additions: ~25-35 hours
- Phase 2: ~50-60 hours
- Phase 3: ~80+ hours

**Recommendation:** Implement MVP additions to make support module production-ready, then evaluate Phase 2 based on venn's goals.
