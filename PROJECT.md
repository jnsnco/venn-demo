# venn - CRM, Support & Roadmap (Demo)

**Status:** Demo/Learning Project  
**Purpose:** Teaching ground for agentic development, testing, and operations

---

## Project Context

### What This Is

**venn** is a **demo-quality application** used as a vehicle for learning and documenting:
- Agentic development workflows
- Testing strategies and automation
- Production operations and deployment
- Process creation and documentation
- System design patterns

**The product is NOT venn itself.**  
**The product IS:**
- The organization (avan)
- The processes we create
- The learnings we document
- The systems and tools we build
- The operational muscle memory

### Terminology

- **avan** - Organization/top-level project
- **avan.academy** - Primary domain
- **venn** - Current demo project (this repo)
- **barrow** - The agent (me)

### Domain Structure

All environments run on a single server: `5.78.83.163`

- **venn.avan.academy** - Production (active)
- **test.avan.academy** - Test environment (active)
- **staging.avan.academy** - Staging (configured, dormant)

Multiple environments teach:
- Environment management
- Deployment isolation
- Configuration differences
- DNS/subdomain routing

---

## What venn Does (Technically)

venn is a simple SaaS application with three modules:

1. **Contacts** - Basic CRM (create, edit, view contacts)
2. **Tickets** - Support ticket system (messages, status, assignments)
3. **Roadmap** - Public roadmap with voting

**Tech Stack:**
- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL 17
- **Auth:** GitHub OAuth
- **Deployment:** nginx reverse proxy + Let's Encrypt SSL

---

## Why venn Exists

venn provides a **realistic but simple** application to practice:

✅ **Development:**
- Frontend/backend coordination
- Database design and migrations
- OAuth integration
- Error handling

✅ **Testing:**
- Unit tests (backend routes, business logic)
- Integration tests (API endpoints)
- UI testing (browser automation)

✅ **Operations:**
- Server provisioning and management
- DNS and SSL configuration
- Process management (PM2/systemd)
- Monitoring and health checks
- Backup and recovery procedures
- Deployment automation

✅ **Process:**
- Issue tracking (Beads)
- Documentation (runbooks, guides)
- Git workflow
- Change management

---

## Success Metrics

For venn, success is NOT measured by:
- ❌ User growth
- ❌ Revenue
- ❌ Feature completeness
- ❌ Production readiness

Success IS measured by:
- ✅ Operational skills developed
- ✅ Processes documented
- ✅ Systems built and understood
- ✅ Learnings captured
- ✅ Agent capabilities improved

---

## Project Principles

1. **Learning over perfection** - It's okay to break things, that's how we learn
2. **Document everything** - The docs are more valuable than the code
3. **Real-world patterns** - Use production-grade tools and practices
4. **Iterate quickly** - Speed teaches more than polish
5. **Keep it simple** - Complexity for its own sake teaches bad habits

---

## Key Documents

- **README.md** - Technical setup and architecture
- **PROJECT.md** - This file (context and purpose)
- **OPS.md** - Operations runbook (deployment, troubleshooting)
- **AGENTS.md** - Agent workflow and commands
- **TOOLS.md** - Server details and deployment config

---

## Current Focus

See Beads for active work:
```bash
bd ready    # Show available work
bd list     # All issues
```

**Active priorities:**
1. HTTPS setup (venn-10y) - Production SSL with Let's Encrypt
2. Process management (venn-957) - PM2 or systemd
3. Testing (venn-4rp) - Verify all features work
4. Browser automation (venn-b14) - Agent can test UI independently

---

## Future Evolution

venn may eventually be replaced by another demo project. That's fine.

The processes, documentation, and systems we build here will transfer to whatever comes next.

**avan** is the constant.  
**venn** is temporary.  
**The learning** is permanent.
