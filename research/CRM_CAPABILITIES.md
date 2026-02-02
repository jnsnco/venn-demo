# CRM Capabilities Research

**Research for:** venn-06j  
**Date:** 2026-02-02  
**Focus:** Optimal feature set for basic CRM system

---

## Executive Summary

A minimal viable CRM needs:
1. **Contact Management** - Store and organize customer information
2. **Activity Tracking** - Log interactions and touchpoints
3. **Pipeline Management** - Track deals through sales stages
4. **Basic Reporting** - Understand customer data and sales performance

For venn's scope as a demo/learning project, we should implement a **focused subset** that demonstrates core CRM concepts without overwhelming complexity.

---

## Phase 1: MVP (Current + Essential Additions)

### ✅ Already Implemented
- Contact CRUD (create, read, update, delete)
- Basic contact fields (name, email, phone, title)
- Lifecycle stages (lead, prospect, customer, churned)
- Organization linking
- Contact list with search
- Contact detail view
- Ticket count per contact

### 🎯 Essential MVP Additions

#### 1. Contact Activities/Timeline
**Why:** Core CRM feature - see all interactions with a contact in one place

**Fields:**
- Activity type (email, call, meeting, note)
- Date/time
- Subject/title
- Description/notes
- Created by (user)

**UI:**
- Timeline view on contact detail page
- "Add Activity" button
- Filter by activity type
- Sort by date (newest first)

**API:**
```
POST /api/contacts/:id/activities
GET /api/contacts/:id/activities
```

---

#### 2. Contact Notes
**Why:** Quick way to record important information

**Fields:**
- Note content (text)
- Created at
- Created by

**UI:**
- Notes section on contact detail page
- Rich text editor (simple)
- Markdown support optional

**Implementation:** Could use activities table with type="note"

---

#### 3. Contact Tags
**Why:** Flexible categorization and segmentation

**Current:** Tags field exists but no UI

**UI Needed:**
- Tag input on contact create/edit
- Tag chips display
- Filter contacts by tag
- Tag autocomplete

**DB:** Already in custom_fields JSON

---

#### 4. Contact Search Improvements
**Why:** Find contacts quickly

**Enhancements:**
- Search by email, phone (not just name)
- Search by organization
- Search by tag
- Search by lifecycle stage

**Backend:** Update SQL query to search multiple fields

---

#### 5. Contact Import/Export
**Why:** Get data in/out easily

**Import:**
- CSV upload
- Map columns to fields
- Validation and error reporting
- Bulk create

**Export:**
- Export filtered contacts to CSV
- Select fields to include
- Download as file

**Nice to have:** Excel support, vCard export

---

## Phase 2: Enhanced Features

### 1. Organizations as First-Class Objects
**Current:** organization_id references external table, but no org management

**Needed:**
- Organizations CRUD
- Organization detail page
- List contacts by organization
- Organization fields: name, website, industry, size, notes
- Link contacts to organizations

**UI:**
- /organizations page
- Organization detail: contacts list, activities, deals

---

### 2. Custom Fields
**Current:** custom_fields JSON column exists

**Needed:**
- Define custom field schema (admin)
- Field types: text, number, date, dropdown, checkbox
- Display custom fields in UI
- Edit custom fields in forms
- Search/filter by custom fields

**Admin UI:**
- Settings → Custom Fields
- Create/edit/delete custom field definitions
- Order fields

---

### 3. Contact Segmentation/Lists
**Why:** Group contacts for campaigns, workflows

**Features:**
- Smart lists (dynamic filters)
- Static lists (manually added)
- List membership tracking
- Export list to CSV

**Examples:**
- "High-value customers" (customer stage + activity > X)
- "Churned in last 30 days"
- "Leads from webinar"

---

### 4. Duplicate Detection
**Why:** Keep database clean

**Features:**
- Find potential duplicates (fuzzy match email, name, phone)
- Merge duplicates (choose primary, merge data)
- Prevent duplicates on creation (warning)

**Algorithm:**
- Exact match: email or phone
- Fuzzy match: name similarity + domain match

---

### 5. Contact Ownership/Assignment
**Current:** No user assignment

**Needed:**
- Assign contact to user (owner)
- Filter by owner
- Reassign contacts
- Team-based views

**Use Cases:**
- Sales rep territories
- Support agent assignment
- Round-robin assignment

---

### 6. Bulk Actions
**Why:** Manage multiple contacts at once

**Actions:**
- Bulk edit (change stage, add tag, assign owner)
- Bulk delete
- Bulk export

**UI:**
- Checkboxes on contact list
- "Actions" dropdown when items selected

---

## Phase 3: Advanced Features

### 1. Contact Scoring
**Why:** Prioritize high-value leads

**Scoring Factors:**
- Activity level (more touchpoints = higher score)
- Lifecycle stage (customer > prospect > lead)
- Organization size (if applicable)
- Engagement (email opens, link clicks)
- Custom rules

**Display:** Score badge on contact card

---

### 2. Contact Relationships
**Why:** Map connections between contacts

**Types:**
- Reports to (manager/subordinate)
- Related contacts (colleagues at same org)
- Influencer/decision-maker roles

**UI:** Relationship graph on contact detail

---

### 3. Email Integration
**Why:** Track email conversations

**Features:**
- Log emails as activities (via BCC or integration)
- Send emails from CRM
- Email templates
- Track opens/clicks

**Integrations:** Gmail API, Outlook API, SMTP

---

### 4. Deal Pipeline
**Why:** Track sales opportunities

**Structure:**
- Deal: name, value, stage, expected close date
- Pipeline stages: Lead → Qualified → Proposal → Negotiation → Won/Lost
- Link deal to contact(s)
- Move deal through stages (kanban)

**Reporting:**
- Pipeline value by stage
- Win rate
- Average deal size
- Sales forecast

---

### 5. Calendar Integration
**Why:** Schedule meetings, set reminders

**Features:**
- Create meetings linked to contacts
- Sync with Google Calendar / Outlook
- Meeting notes
- Follow-up reminders

---

### 6. Workflow Automation
**Why:** Reduce manual work

**Examples:**
- Auto-assign leads based on rules
- Auto-add tag when condition met
- Auto-send email on stage change
- Auto-create task for follow-up

**Implementation:** Rule engine + background jobs

---

## What NOT to Build (Out of Scope)

### ❌ Features to Avoid (For venn)
1. **Marketing Automation** - Too complex, separate product category
2. **Social Media Integration** - Nice-to-have, not essential CRM
3. **Mobile App** - Web-first, responsive design sufficient
4. **Telephony Integration** - Call center features not needed
5. **AI/ML Predictions** - Overkill for demo project
6. **Multi-currency** - Adds complexity without learning value
7. **Multi-language** - English-only is fine for demo
8. **Advanced Security (SSO, SAML)** - OAuth is enough
9. **API Rate Limiting** - Not needed for internal tool
10. **Audit Logs (comprehensive)** - created_at/updated_at is enough

---

## Recommended Implementation Priority

### Now (MVP):
1. ✅ Contact CRUD - Done
2. 🔨 Contact Activities - Essential
3. 🔨 Contact Tags UI - Quick win
4. 🔨 Improved Search - Important
5. 🔨 CSV Import/Export - Data portability

### Next (Phase 2):
6. Organizations Management - Common CRM pattern
7. Contact Segmentation - Useful for demos
8. Duplicate Detection - Data quality
9. Bulk Actions - Productivity feature

### Later (Phase 3):
10. Deal Pipeline - Classic CRM feature, good learning
11. Contact Scoring - Shows data-driven approach
12. Email Integration - Complex but valuable

### Probably Not:
- Workflow automation (too complex for demo)
- Advanced relationships (not essential)
- Calendar integration (nice-to-have)

---

## Technical Recommendations

### Database Schema Changes Needed:
```sql
-- Activities table
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  type VARCHAR(50) NOT NULL, -- email, call, meeting, note
  subject VARCHAR(255),
  body TEXT,
  activity_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Organizations table (if Phase 2)
CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  website VARCHAR(255),
  industry VARCHAR(100),
  size VARCHAR(50), -- small, medium, large, enterprise
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Update contacts.organization_id to reference organizations
ALTER TABLE contacts 
  ADD CONSTRAINT fk_organization 
  FOREIGN KEY (organization_id) REFERENCES organizations(id);
```

### API Endpoints to Add:
```
# Activities
POST   /api/contacts/:id/activities
GET    /api/contacts/:id/activities
DELETE /api/activities/:id

# Tags
GET    /api/tags (list all unique tags)
POST   /api/contacts/:id/tags
DELETE /api/contacts/:id/tags/:tag

# Import/Export
POST   /api/contacts/import (CSV upload)
GET    /api/contacts/export?format=csv

# Organizations (Phase 2)
GET    /api/organizations
POST   /api/organizations
GET    /api/organizations/:id
PATCH  /api/organizations/:id
DELETE /api/organizations/:id
GET    /api/organizations/:id/contacts
```

### Frontend Components to Add:
- `ActivityTimeline.tsx` - Display activities on contact detail
- `AddActivityModal.tsx` - Form to log activity
- `TagInput.tsx` - Multi-select tag input
- `ImportContactsModal.tsx` - CSV upload wizard
- `ContactFilters.tsx` - Advanced search/filter UI

---

## Competitive Analysis

### What Other CRMs Do Well:

**HubSpot (Free CRM):**
- ✅ Clean, intuitive UI
- ✅ Strong activity timeline
- ✅ Good deal pipeline
- ❌ Overwhelming feature count

**Pipedrive:**
- ✅ Visual pipeline (kanban)
- ✅ Simple contact management
- ✅ Good mobile experience
- ❌ Limited customization

**Copper (Google Workspace):**
- ✅ Gmail integration
- ✅ Minimal UI
- ✅ Automatic data capture
- ❌ Too Google-dependent

**Streak (Gmail CRM):**
- ✅ Lives in Gmail
- ✅ Pipelines in email threads
- ✅ Simple for small teams
- ❌ Limited outside email

### venn's Differentiator:
- **Unified CRM + Support + Roadmap** - Most tools separate these
- **Developer-friendly** - Clean API, open source potential
- **Learning-focused** - Clear, well-documented code
- **Lightweight** - No bloat, just essential features

---

## Success Metrics (for venn)

Since venn is a demo/learning project, success = **demonstrating CRM concepts**, not user adoption.

**Good indicators:**
- Can create/manage contacts ✅
- Can log activities ⏳
- Can see contact timeline ⏳
- Can track deals through pipeline ⏳
- Can export data ⏳
- Code is clean and understandable ✅
- Documentation explains why features exist ✅

---

## Conclusion

**For venn MVP (now):**
Focus on **activities** and **better contact data management** (tags, improved search, import/export). These are core CRM features that teach important concepts without overwhelming complexity.

**For venn Phase 2:**
Add **organizations** and **deal pipeline** to show classic CRM patterns.

**Skip:** Marketing automation, advanced analytics, complex integrations.

**Total estimated work:**
- MVP additions: ~20-30 hours
- Phase 2: ~40-50 hours
- Phase 3: ~60+ hours

**Recommendation:** Implement MVP additions first, evaluate if Phase 2 makes sense for venn's goals.
