# Product Roadmap Capabilities Research

**Research for:** venn-yr8  
**Date:** 2026-02-02  
**Focus:** Optimal feature set for public product roadmap

---

## Executive Summary

A public product roadmap serves two purposes:
1. **Transparency** - Show customers what's coming
2. **Prioritization** - Let customers vote and influence direction

For venn, focus on **customer-facing roadmap** with voting and feedback, integrated tightly with CRM and Support.

---

## Phase 1: MVP (Current + Essential Additions)

### ✅ Already Implemented
- Roadmap item CRUD
- Fields: title, description, type, status, priority, target_date
- Vote count display
- Link items to tickets
- Roadmap list with filters (by status)
- Detail view with linked tickets
- Voter tracking (who voted, when)

### 🎯 Essential MVP Additions

#### 1. Public vs Admin Views
**Why:** Customers see roadmap, only admins can edit

**Public View:**
- No edit/delete buttons
- Can vote if logged in
- Can comment (if enabled)
- Clean, minimal UI

**Admin View:**
- Edit button on each item
- Create new items
- Drag-and-drop to reorder
- Bulk actions

**Implementation:**
- Check user role (admin vs regular)
- Conditionally render admin features
- Public route: /roadmap (no auth required?)
- Admin route: /admin/roadmap or same with role check

---

#### 2. Voting Improvements
**Current:** Vote count shown, voters list on detail page

**Needed:**
- Vote/unvote button visible on list view
- Vote count badge prominent
- "Trending" indicator (votes in last 7 days)
- User can see what they've voted for
- Prevent duplicate votes

**UI:**
- Thumbs up icon + count
- Filled/outlined state (voted/not voted)
- Hover tooltip: "X people want this"

---

#### 3. Roadmap Quarters/Timeline
**Why:** Show when features are planned

**Views:**
- List view (current) - Filterable by status
- Timeline view - Items on calendar
- Kanban view - Columns for each status

**Timeline Features:**
- Group by quarter (Q1 2026, Q2 2026)
- Items without date go to "Backlog"
- Visual progress indicators

**Implementation:**
- Date-based grouping
- CSS/JS for visual timeline
- Drag to change target date (admin only)

---

#### 4. Roadmap Comments/Discussions
**Why:** Gather customer feedback

**Features:**
- Comment on roadmap items
- Reply to comments (threaded)
- Upvote comments
- Admin can mark comments as "planned" or "won't do"

**Moderation:**
- Admin can delete spam
- Edit own comments (within time limit)
- Email notification on replies (optional)

**UI:**
- Comments section on detail page
- Sort by newest/most upvoted
- Comment composer (markdown support)

---

#### 5. Roadmap Item Status Updates
**Why:** Keep customers informed

**Features:**
- Status changelog (backlog → planned → in progress → completed)
- Who changed status, when
- Optional note on status change
- Email notification to voters on status change

**UI:**
- Status history timeline
- "Subscribe to updates" button
- Status change indicator (badge/animation)

---

## Phase 2: Enhanced Features

### 1. Changelog / Release Notes
**Why:** Show what was shipped

**Features:**
- Automatically create changelog entry when item marked "completed"
- Group items by release/version
- Public changelog page (/changelog)
- RSS feed for changelog
- Email notification for new releases

**Structure:**
- Release: version number, date, description
- Items: list of completed roadmap items
- Grouped by type (features, bugs, improvements)

**UI:**
- Changelog page with version list
- Click version to see details
- Filter by type

---

### 2. Roadmap Integrations
**Why:** Sync with development workflow

**GitHub Integration:**
- Link roadmap item to GitHub issue/PR
- Auto-update status when issue closed
- Show PR status on roadmap item

**Linear/Jira:**
- Similar to GitHub
- Two-way sync (roadmap item ↔ issue)

**Implementation:**
- OAuth for each platform
- Webhook handlers
- Background sync jobs

---

### 3. Private Roadmap Items
**Why:** Some items shouldn't be public yet

**Features:**
- Mark item as "private" (admin only)
- Private items only visible to admins
- Can make public later

**Use Cases:**
- Competitive features (keep secret)
- Uncertain plans (don't want to promise)
- Internal refactors (not customer-facing)

**UI:**
- "Private" badge on admin view
- Toggle public/private button

---

### 4. Roadmap Categories/Tags
**Why:** Organize items by theme

**Examples:**
- Platform: Web, Mobile, API
- Area: CRM, Support, Analytics
- Size: Small, Medium, Large

**Features:**
- Multi-select tags
- Filter by tag
- Color-coded tags
- Tag management (admin)

**UI:**
- Tag chips on roadmap cards
- Filter bar with tag pills
- Tag autocomplete in create form

---

### 5. Customer Request Tracking
**Why:** Link customer feedback to roadmap

**Flow:**
1. Customer submits feature request (via support ticket)
2. Agent creates/links to roadmap item
3. Customer automatically "subscribes" to item
4. Customer notified when status changes

**Benefits:**
- Close feedback loop
- Show customers their voice matters
- Prioritize by customer demand

**Implementation:**
- "Create roadmap item from ticket" button
- Auto-link ticket to roadmap item
- Auto-subscribe ticket contact to item updates

---

## Phase 3: Advanced Features

### 1. Roadmap Analytics
**Why:** Understand customer priorities

**Metrics:**
- Most voted items (all time, this month)
- Vote distribution by customer segment
- Items with most comments
- Completion rate (planned → shipped)
- Time to completion (planned date vs actual)

**Reports:**
- Dashboard with charts
- Export to CSV
- Trend analysis (what's gaining traction)

---

### 2. Custom Roadmap Views
**Why:** Different audiences need different views

**Examples:**
- Customer view: Only "planned" and "in progress"
- Investor view: Only high-level strategic items
- Engineering view: All items with technical details

**Implementation:**
- Shareable filtered views
- URL with filter params
- Save view as "preset"

---

### 3. Roadmap Embedding
**Why:** Show roadmap on marketing site

**Features:**
- Embed roadmap as widget/iframe
- Customizable styling (colors, fonts)
- Filter what's shown (status, tags)

**Implementation:**
- Embeddable JS widget
- Iframe with query params
- API endpoint for roadmap data

---

### 4. Impact Scoring
**Why:** Prioritize objectively

**Scoring Factors:**
- Vote count (customer demand)
- Linked tickets (support burden)
- Estimated effort (complexity)
- Strategic value (manual input)

**Formula:**
```
Impact Score = (Votes × 1) + (Linked Tickets × 2) + (Strategic Value × 3) - (Effort × 0.5)
```

**UI:**
- Impact score badge
- Sort by impact
- Score calculator (admin tool)

---

### 5. Roadmap Swimlanes
**Why:** Show multiple tracks

**Examples:**
- Swimlane per product (if multiple)
- Swimlane per team (Platform, Mobile, API)
- Swimlane per theme (UX, Performance, Features)

**UI:**
- Horizontal lanes
- Items in lanes by category
- Drag between lanes

---

## What NOT to Build (Out of Scope)

### ❌ Features to Avoid
1. **Gantt Charts** - Too complex, not customer-friendly
2. **Resource Planning** - Project management, out of scope
3. **Time Tracking** - Not relevant for public roadmap
4. **Dependencies (complex)** - Blocks/blocked-by relationships
5. **Private Comments** - Use internal notes in tickets instead
6. **Multi-workspace** - Single product focus
7. **Custom Fields (extensive)** - Keep it simple
8. **Approvals/Workflows** - Unnecessary bureaucracy
9. **Roadmap Templates** - One roadmap is enough
10. **AI Predictions** - Gimmicky, not useful

---

## Recommended Implementation Priority

### Now (MVP):
1. ✅ Roadmap item CRUD - Done
2. ✅ Voting - Done (basic)
3. 🔨 Public vs Admin views - Critical
4. 🔨 Improved voting UI - UX
5. 🔨 Comments/Discussions - Engagement
6. 🔨 Status updates - Communication

### Next (Phase 2):
7. Changelog/Release Notes - Transparency
8. Categories/Tags - Organization
9. Customer Request Tracking - CRM integration
10. Private items - Flexibility

### Later (Phase 3):
11. Roadmap Analytics - Insights
12. GitHub/Linear integration - Developer workflow

### Probably Not:
- Custom views (nice-to-have)
- Embedding (low priority)
- Swimlanes (complex UI)
- Impact scoring (can do manually)

---

## Technical Recommendations

### Database Schema Changes:
```sql
-- Roadmap comments
CREATE TABLE roadmap_comments (
  id SERIAL PRIMARY KEY,
  roadmap_item_id INTEGER REFERENCES roadmap_items(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  parent_comment_id INTEGER REFERENCES roadmap_comments(id), -- for threading
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Status change history
CREATE TABLE roadmap_status_history (
  id SERIAL PRIMARY KEY,
  roadmap_item_id INTEGER REFERENCES roadmap_items(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  changed_by INTEGER REFERENCES users(id),
  note TEXT,
  changed_at TIMESTAMP DEFAULT NOW()
);

-- Roadmap subscriptions (for notifications)
CREATE TABLE roadmap_subscriptions (
  roadmap_item_id INTEGER REFERENCES roadmap_items(id) ON DELETE CASCADE,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
  subscribed_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (roadmap_item_id, contact_id)
);

-- Tags/categories
CREATE TABLE roadmap_tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(7), -- hex
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE roadmap_item_tags (
  roadmap_item_id INTEGER REFERENCES roadmap_items(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES roadmap_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (roadmap_item_id, tag_id)
);

-- Private flag
ALTER TABLE roadmap_items ADD COLUMN is_private BOOLEAN DEFAULT FALSE;

-- Changelog releases
CREATE TABLE releases (
  id SERIAL PRIMARY KEY,
  version VARCHAR(50) NOT NULL,
  release_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Link roadmap items to releases
ALTER TABLE roadmap_items ADD COLUMN release_id INTEGER REFERENCES releases(id);
```

### API Endpoints to Add:
```
# Comments
GET    /api/roadmap/:id/comments
POST   /api/roadmap/:id/comments { content, parent_comment_id }
DELETE /api/roadmap/comments/:id
POST   /api/roadmap/comments/:id/upvote

# Status history
GET    /api/roadmap/:id/history

# Subscriptions
POST   /api/roadmap/:id/subscribe
DELETE /api/roadmap/:id/unsubscribe
GET    /api/roadmap/:id/subscribers

# Tags
GET    /api/roadmap-tags
POST   /api/roadmap-tags (admin only)
POST   /api/roadmap/:id/tags { tag_id }
DELETE /api/roadmap/:id/tags/:tagId

# Changelog
GET    /api/changelog
GET    /api/releases/:id

# Public endpoint (no auth)
GET    /api/public/roadmap (filtered: only public items)
```

### Frontend Components:
- `RoadmapComments.tsx` - Comment thread display
- `AddCommentForm.tsx` - Comment composer
- `StatusHistory.tsx` - Timeline of status changes
- `VoteButton.tsx` - Improved voting UI
- `RoadmapTimeline.tsx` - Calendar/quarter view
- `ChangelogPage.tsx` - Public changelog

---

## Integration with CRM & Support

### CRM Integration:
- Track which customers voted for what
- Segment customers by roadmap interests
- Show customer's voted items on contact page
- Notify sales when high-value customer votes

### Support Integration:
- ✅ Link tickets to roadmap items - Done
- Create roadmap item from common support requests
- Auto-subscribe ticket contact to roadmap item
- Show progress in ticket replies ("We're working on this!")

### Future:
- "Top requests from your customers" view (sales tool)
- Automated follow-up when feature ships
- Customer satisfaction survey after feature launch

---

## Competitive Analysis

**ProductBoard:**
- ✅ Professional roadmap tool
- ✅ Strong customer feedback loops
- ❌ Expensive, complex

**Canny:**
- ✅ Clean public roadmap
- ✅ Great voting UX
- ❌ Limited integrations

**Trello (public boards):**
- ✅ Simple, visual
- ✅ Free
- ❌ Not purpose-built for roadmaps

**Linear Roadmaps:**
- ✅ Beautiful UI
- ✅ Great for internal teams
- ❌ Not customer-facing

**venn's Approach:**
- Public-first roadmap
- Tight CRM + Support integration
- Simple, transparent
- Developer-friendly

---

## Success Metrics (for venn)

**Good indicators:**
- Can vote on items ✅
- Can see item details ✅
- Can filter by status ✅
- Comments work ⏳
- Status updates communicated ⏳
- Changelog auto-generated ⏳

---

## Unique Insights for venn

### 1. Three-Way Integration
Most tools separate CRM, Support, and Roadmap. venn's strength is **tight integration**:

**Example Flow:**
1. Customer reports bug via ticket (Support)
2. Agent links to existing roadmap item "Fix login bug"
3. Customer auto-subscribed to roadmap item
4. When fixed, customer gets email: "Good news! We fixed the login bug you reported."
5. Customer satisfaction tracked (CRM)

### 2. Feedback Loop Closure
**Problem:** Customers submit feedback but never hear back.

**venn Solution:**
- Ticket → Roadmap item link is explicit
- Status changes trigger notifications
- Changelog shows completed items
- Customer sees their impact

### 3. Roadmap as Sales Tool
**For Sales/CRM:**
- Show prospects the roadmap ("Look, we're shipping X next month!")
- Track which features close deals (voted items → customer type)
- Prioritize features that win customers

---

## Conclusion

**For venn MVP (now):**
Focus on **public/admin views**, **improved voting**, **comments**, and **status updates**. These make the roadmap truly useful for customers and admins.

**For venn Phase 2:**
Add **changelog**, **tags**, and **customer request tracking** to close the feedback loop.

**Skip:** Complex analytics, embedding, custom views (diminishing returns).

**Total estimated work:**
- MVP additions: ~20-30 hours
- Phase 2: ~35-45 hours
- Phase 3: ~50+ hours

**Recommendation:** Implement MVP additions to make roadmap customer-ready, then evaluate Phase 2 based on feedback.

---

## Key Takeaway

**venn's roadmap should be:**
1. **Transparent** - Customers see what's coming
2. **Interactive** - Voting and comments
3. **Integrated** - Tight links to Support and CRM
4. **Simple** - No Gantt charts or complex PM features

Focus on being the **best public-facing roadmap** rather than trying to be a full project management tool.
