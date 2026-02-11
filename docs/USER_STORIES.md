# Agent User Stories for venn

This document defines key agent workflows and their API requirements. Each story identifies capabilities needed to enable agent-first operations.

---

## 1. Support Automation Workflows

### Story 1.1: Auto-Create Ticket from Email

**As a** support agent (AI),  
**I want to** receive an email and automatically create a support ticket,  
**So that** no customer inquiry is missed.

**Workflow:**
1. Agent receives email via webhook/API
2. Agent extracts sender info (name, email)
3. Agent searches for existing contact by email
4. If no contact exists, create new contact
5. Create ticket with email subject and body
6. Categorize ticket based on keywords
7. Auto-assign to appropriate agent based on category
8. Send confirmation email to customer

**API Requirements:**
- ✅ `GET /contacts?email=...` (search contact)
- ✅ `POST /contacts` (create if needed)
- ✅ `POST /tickets` (create ticket)
- ❌ `POST /tickets/:id/assign` (assign to agent)
- ❌ Ticket `category` field
- ❌ Auto-assignment rules engine
- ❌ Email send integration

**Missing:** Ticket categories, auto-assignment, email integration

---

### Story 1.2: Intelligent Ticket Triage

**As a** support agent (AI),  
**I want to** analyze new tickets and prioritize them,  
**So that** urgent issues get immediate attention.

**Workflow:**
1. Agent monitors new tickets via webhook or polling
2. Analyze ticket subject and first message
3. Detect urgency keywords ("down", "urgent", "critical")
4. Check if customer is enterprise/VIP (from contact tags)
5. Update ticket priority if urgent
6. Escalate to on-call engineer if critical
7. Add internal note explaining triage decision

**API Requirements:**
- ✅ `GET /tickets?status=open` (monitor new tickets)
- ✅ `GET /contacts/:id` (check customer status)
- ✅ `PATCH /tickets/:id` (update priority)
- ❌ `POST /tickets/:id/notes` (internal notes separate from messages)
- ❌ Ticket `category` and `tags` fields
- ❌ Webhook notifications for new tickets
- ❌ SLA fields to track urgency

**Missing:** Internal notes, webhooks, SLA tracking

---

### Story 1.3: Suggest Canned Responses

**As a** support agent (AI),  
**I want to** read a ticket and suggest relevant template responses,  
**So that** human agents can respond faster.

**Workflow:**
1. Human agent opens ticket in UI
2. Agent analyzes ticket subject and messages
3. Search knowledge base or templates for similar issues
4. Rank templates by relevance
5. Present top 3 suggestions to human agent
6. Human selects and customizes response
7. Agent posts response and updates ticket status

**API Requirements:**
- ✅ `GET /tickets/:id` (read ticket)
- ✅ `GET /tickets/:id/messages` (read conversation)
- ❌ `GET /templates` (list canned responses)
- ❌ `GET /templates/search?query=...` (semantic search)
- ❌ `POST /tickets/:id/messages` (already exists, but needs template variables)
- ❌ Knowledge base integration

**Missing:** Templates API, knowledge base

---

### Story 1.4: Link Ticket to Roadmap Feature Request

**As a** support agent (AI),  
**I want to** recognize when a ticket is a feature request and link it to the roadmap,  
**So that** customer feedback is captured for product planning.

**Workflow:**
1. Agent analyzes ticket for feature request keywords
2. Search existing roadmap items for similar requests
3. If match found, link ticket to roadmap item
4. If no match, suggest creating new roadmap item
5. Update roadmap item vote count
6. Notify customer their feedback was recorded

**API Requirements:**
- ✅ `GET /tickets/:id` (read ticket)
- ✅ `GET /roadmap?search=...` (search features)
- ❌ `POST /tickets/:id/roadmap-links` (link ticket to roadmap)
- ❌ `POST /roadmap/:id/votes` (already exists, but needs contact association)
- ❌ Automatic vote from ticket link
- ❌ Customer notification system

**Missing:** Ticket-roadmap linking, automated voting

---

## 2. CRM Automation Workflows

### Story 2.1: Enrich Contact from LinkedIn

**As a** CRM agent (AI),  
**I want to** automatically enrich contact data from LinkedIn,  
**So that** sales reps have complete information.

**Workflow:**
1. Agent receives new contact with email
2. Search LinkedIn API for profile by email
3. Extract: current company, title, location, profile URL
4. Update contact with enriched data
5. Add note: "Auto-enriched from LinkedIn on [date]"
6. Tag contact as "enriched"

**API Requirements:**
- ✅ `GET /contacts/:id` (read contact)
- ✅ `PATCH /contacts/:id` (update contact)
- ❌ `POST /contacts/:id/notes` (add enrichment note)
- ❌ `POST /contacts/:id/activities` (log enrichment activity)
- ❌ Contact fields: `linkedin_url`, `company_name`, `location`
- ❌ LinkedIn integration

**Missing:** Activities/notes endpoints, company field, LinkedIn integration

---

### Story 2.2: Track Lead Source and Attribution

**As a** marketing agent (AI),  
**I want to** track where each lead came from,  
**So that** we know which channels are most effective.

**Workflow:**
1. Lead signs up via form with UTM parameters
2. Agent creates contact with lead source data
3. Track: campaign, source, medium, referrer
4. Store in custom fields or dedicated fields
5. Generate attribution report by source
6. Identify highest-converting channels

**API Requirements:**
- ✅ `POST /contacts` (create contact)
- ❌ `lead_source`, `campaign`, `utm_*` fields
- ❌ `GET /contacts/analytics/by-source` (attribution report)
- ❌ Bulk analytics endpoint

**Missing:** Lead source fields, analytics API

---

### Story 2.3: Automated Lead Scoring

**As a** sales agent (AI),  
**I want to** score leads based on activity and profile,  
**So that** sales reps prioritize high-value prospects.

**Workflow:**
1. Agent monitors contact activities (email opens, page visits)
2. Calculate score based on:
   - Email engagement
   - Website activity
   - Company size
   - Job title relevance
3. Update contact with `lead_score` field
4. Move to "hot lead" status if score > 80
5. Notify sales rep of hot leads

**API Requirements:**
- ✅ `GET /contacts/:id` (read contact)
- ✅ `PATCH /contacts/:id` (update score)
- ❌ `GET /contacts/:id/activities` (read activity history)
- ❌ `POST /contacts/:id/activities` (log website visits, email opens)
- ❌ `lead_score` field on contacts
- ❌ Webhook for score threshold alerts

**Missing:** Activities API, lead_score field, webhooks

---

### Story 2.4: Bulk Import Contacts from CSV

**As a** sales ops agent (AI),  
**I want to** import 1000s of contacts from a CSV file,  
**So that** we can migrate from another CRM.

**Workflow:**
1. Agent receives CSV file upload
2. Parse CSV and validate fields
3. Deduplicate by email
4. Batch create contacts (100 at a time)
5. Handle errors gracefully
6. Generate import report (created, skipped, failed)
7. Notify admin when complete

**API Requirements:**
- ✅ `POST /contacts` (create individual contact)
- ❌ `POST /contacts/bulk` (batch create)
- ❌ `POST /contacts/import` (CSV upload endpoint)
- ❌ Duplicate detection by email
- ❌ Import job status tracking
- ❌ Error reporting

**Missing:** Bulk endpoints, CSV import, job tracking

---

## 3. Product/Roadmap Workflows

### Story 3.1: Analyze Feature Requests from Tickets

**As a** product agent (AI),  
**I want to** analyze all open tickets for common feature requests,  
**So that** the product team knows what to build next.

**Workflow:**
1. Agent fetches all tickets with "feature-request" category
2. Extract feature descriptions using NLP
3. Group similar requests (semantic clustering)
4. Rank by frequency and customer tier
5. Check if roadmap items already exist
6. Create new roadmap items for top requests
7. Link tickets to roadmap items
8. Generate weekly report for product team

**API Requirements:**
- ✅ `GET /tickets?category=feature-request` (if categories existed)
- ❌ `GET /tickets?tags=feature-request` (current alternative)
- ✅ `GET /roadmap` (check existing features)
- ✅ `POST /roadmap` (create feature)
- ❌ `POST /tickets/:id/roadmap-links` (link ticket to feature)
- ❌ Semantic search on tickets
- ❌ Analytics: feature request frequency

**Missing:** Ticket categories, ticket-roadmap links, analytics

---

### Story 3.2: Notify Voters When Feature Ships

**As a** product agent (AI),  
**I want to** automatically notify all voters when a feature is completed,  
**So that** customers know their feedback mattered.

**Workflow:**
1. Agent monitors roadmap items for status changes
2. When item moves to "completed":
   - Get all voters for the item
   - For each voter, create personalized message
   - Send email: "The feature you voted for is live!"
   - Include release notes and link
3. Track notification delivery
4. Log activity on contact records

**API Requirements:**
- ❌ Webhook: roadmap item status changed
- ✅ `GET /roadmap/:id/votes` (get voters)
- ❌ `GET /roadmap/:id/votes/contacts` (get contact details for voters)
- ❌ Email sending API
- ❌ `POST /contacts/:id/activities` (log notification sent)
- ❌ Notification preferences per contact

**Missing:** Webhooks, voter-contact association, email API, activities

---

### Story 3.3: Generate Changelog from Completed Items

**As a** product agent (AI),  
**I want to** auto-generate a changelog when features are completed,  
**So that** customers and internal team stay informed.

**Workflow:**
1. Weekly cron job runs
2. Agent fetches roadmap items completed this week
3. Group by category (Platform, Mobile, API, etc.)
4. Format as markdown changelog
5. Publish to `/changelog` page
6. Generate RSS feed
7. Post summary to Slack/Discord
8. Send changelog email to subscribers

**API Requirements:**
- ✅ `GET /roadmap?status=completed&completed_after=2026-02-04` (if date filter existed)
- ❌ `GET /roadmap?completed_this_week=true` (convenience filter)
- ❌ `POST /changelog` (publish changelog entry)
- ❌ `GET /changelog` (list published changelogs)
- ❌ Roadmap `category` field
- ❌ Roadmap `release_version` field
- ❌ RSS feed generation

**Missing:** Changelog system, date filtering, categories

---

## 4. Cross-Module Workflows

### Story 4.1: Customer 360 View

**As a** sales/support agent (AI),  
**I want to** get a complete view of a customer,  
**So that** I understand their full history and context.

**Workflow:**
1. Given a contact ID or email
2. Agent fetches:
   - Contact details
   - All tickets (open and closed)
   - All activities (emails, calls, meetings)
   - All roadmap votes
   - Lifetime value metrics
3. Generate customer summary:
   - "Active customer since Jan 2025"
   - "3 open tickets (1 high priority)"
   - "Voted for 5 features"
   - "Last contact: 3 days ago"
4. Present in UI or return as structured data

**API Requirements:**
- ✅ `GET /contacts/:id` (contact details)
- ✅ `GET /tickets?contact_id=:id` (tickets)
- ❌ `GET /contacts/:id/activities` (activity timeline)
- ❌ `GET /contacts/:id/roadmap-votes` (feature votes)
- ❌ `GET /contacts/:id/summary` (360 view endpoint)
- ❌ Lifetime value calculation

**Missing:** Activities API, vote history, summary endpoint

---

### Story 4.2: Smart Ticket Routing Based on Contact

**As a** routing agent (AI),  
**I want to** assign tickets to the right agent based on contact history,  
**So that** customers get consistent support.

**Workflow:**
1. New ticket created for existing contact
2. Agent checks: who handled previous tickets for this contact?
3. If same agent available, assign to them
4. If not, check contact tags for VIP/enterprise
5. Route VIP to senior agent
6. Route based on ticket category as fallback
7. Log routing decision in ticket notes

**API Requirements:**
- ✅ `GET /tickets?contact_id=:id` (previous tickets)
- ✅ `GET /contacts/:id` (check tags/tier)
- ✅ `PATCH /tickets/:id` (assign ticket)
- ❌ `GET /users?role=agent&available=true` (agent availability)
- ❌ Routing rules engine
- ❌ Internal notes on tickets

**Missing:** Agent availability, routing rules, internal notes

---

## 5. Analytics & Monitoring Workflows

### Story 5.1: Daily Metrics Report

**As a** analytics agent (AI),  
**I want to** generate a daily summary of key metrics,  
**So that** leadership stays informed.

**Workflow:**
1. Every morning at 8am
2. Agent calculates:
   - New contacts added (yesterday)
   - New tickets opened/closed (yesterday)
   - Open ticket backlog (by priority)
   - Average ticket resolution time
   - Top voted roadmap items
   - User signups
3. Format as readable report
4. Post to Slack #metrics channel
5. Store historical data for trends

**API Requirements:**
- ✅ `GET /contacts?created_after=...` (new contacts)
- ✅ `GET /tickets?created_after=...` (new tickets)
- ✅ `GET /tickets?status=open` (backlog)
- ❌ `GET /analytics/tickets/resolution-time` (avg resolution)
- ❌ `GET /analytics/roadmap/top-voted` (popular features)
- ❌ `GET /analytics/users/signups` (new users)
- ❌ Historical metrics storage

**Missing:** Analytics endpoints, aggregation APIs

---

### Story 5.2: Alert on SLA Breaches

**As a** monitoring agent (AI),  
**I want to** detect tickets at risk of SLA breach,  
**So that** support team can take action.

**Workflow:**
1. Every 15 minutes
2. Agent checks all open tickets
3. Calculate time since creation
4. Compare to SLA targets by priority:
   - Urgent: 1 hour first response
   - High: 4 hours first response
   - Medium: 8 hours
   - Low: 24 hours
5. If >80% of SLA time elapsed with no response:
   - Alert support manager
   - Escalate ticket
   - Add urgent tag

**API Requirements:**
- ✅ `GET /tickets?status=open` (open tickets)
- ❌ `first_response_at` field on tickets
- ❌ `sla_target_minutes` field by priority
- ❌ `sla_breach_risk` calculated field
- ❌ Webhook alerts
- ❌ `PATCH /tickets/:id` (add urgent tag, if tags existed)

**Missing:** SLA fields, time tracking, alerts

---

## API Requirements Summary

### Critical (Blocking Agent Workflows)

**Authentication:**
- ❌ API token generation (`POST /auth/tokens`)
- ❌ Token-based auth middleware
- ❌ Service accounts for agents

**Core Enhancements:**
- ❌ Activities API (`/contacts/:id/activities`)
- ❌ Notes endpoints (`/contacts/:id/notes`, `/tickets/:id/notes`)
- ❌ Ticket categories and tags
- ❌ Ticket-roadmap linking
- ❌ SLA fields on tickets

### High Priority (Major Workflows)

**Bulk Operations:**
- ❌ Bulk contact import (`POST /contacts/bulk`)
- ❌ CSV import endpoint
- ❌ Batch updates

**Search & Filter:**
- ❌ Advanced search across all fields
- ❌ Semantic search on tickets/roadmap
- ❌ Date range filtering

**Webhooks:**
- ❌ Ticket created/updated
- ❌ Roadmap status changed
- ❌ Contact updated

### Medium Priority (Nice to Have)

**Analytics:**
- ❌ Summary endpoints (`/contacts/:id/summary`)
- ❌ Aggregation APIs (metrics, reports)
- ❌ Export endpoints (CSV, JSON)

**Integrations:**
- ❌ Email send/receive
- ❌ LinkedIn enrichment
- ❌ GitHub/Linear sync

**Advanced Features:**
- ❌ Knowledge base
- ❌ Templates/canned responses
- ❌ Changelog system

---

## Next: MCP Server Design

Based on these user stories, the MCP server should expose:

**High-level tools for common workflows:**
- `handle_support_email` (story 1.1)
- `triage_ticket` (story 1.2)
- `enrich_contact` (story 2.1)
- `analyze_feature_requests` (story 3.1)
- `get_customer_360` (story 4.1)

**Low-level CRUD tools for building blocks:**
- `create_contact`, `update_contact`, `search_contacts`
- `create_ticket`, `add_ticket_message`, `assign_ticket`
- `create_feature`, `link_ticket_to_feature`, `vote_for_feature`

See `MCP_DESIGN.md` for detailed MCP server specification.
