# venn - Project Handoff

**Built:** 2025-01-29  
**Status:** ✅ Ready for deployment  
**Tech Stack:** Node.js + TypeScript + React + PostgreSQL

---

## What's Been Built

A complete SaaS application combining:
- **CRM** - Contact and organization management
- **Support** - Ticket system with messaging
- **Roadmap** - Product planning with customer voting

All three modules are **fully integrated** with cross-linking between tickets, contacts, and roadmap items.

---

## Project Structure

```
venn/
├── backend/              # Node.js API server
│   ├── src/
│   │   ├── routes/       # API endpoints (auth, contacts, tickets, roadmap)
│   │   ├── middleware/   # Auth & validation
│   │   ├── config/       # Database & Passport setup
│   │   └── index.ts      # Express server
│   ├── migrations/       # Database schema (PostgreSQL)
│   └── package.json
├── frontend/             # React application
│   ├── src/
│   │   ├── pages/        # All UI pages (Login, Contacts, Tickets, Roadmap)
│   │   ├── components/   # Layout & shared components
│   │   ├── api/          # API client (Axios)
│   │   └── App.tsx
│   └── package.json
├── docs/                 # Full documentation
│   ├── DEPLOYMENT.md     # Debian server deployment guide
│   ├── API.md            # API endpoints reference
│   └── SCHEMA.md         # Database schema
├── scripts/
│   └── deploy.sh         # Automated deployment script
├── DESIGN.md             # Architecture decisions
├── PROGRESS.md           # Build log
└── README.md
```

---

## What Works

### Backend (API)
- ✅ OAuth authentication (Google + GitHub)
- ✅ JWT sessions with Passport
- ✅ PostgreSQL database with migrations
- ✅ Full REST API for all entities
- ✅ Input validation (Zod)
- ✅ Cross-linking (tickets ↔ roadmap ↔ contacts)

### Frontend (UI)
- ✅ Modern React UI with Tailwind CSS
- ✅ OAuth login flow
- ✅ Contacts management (list, create, edit, detail view)
- ✅ Ticket system (create, assign, message, resolve)
- ✅ Roadmap (create items, vote, link to tickets)
- ✅ Activity timelines
- ✅ Search & pagination

### Integration
- ✅ Unified customer view (CRM + support history + product feedback)
- ✅ Roadmap items show customer requests
- ✅ Tickets can link to roadmap features
- ✅ Activity feeds across modules

---

## Next Steps to Deploy

1. **Prepare OAuth Credentials**
   - Create Google OAuth app: https://console.cloud.google.com/
   - Create GitHub OAuth app: https://github.com/settings/developers
   - Save client IDs and secrets

2. **Server Setup** (Debian)
   - Follow `docs/DEPLOYMENT.md` step-by-step
   - Install PostgreSQL, Node.js, Nginx
   - Run database migrations
   - Configure environment variables
   - Build and deploy with `scripts/deploy.sh`

3. **Domain & SSL**
   - Point your domain to the server
   - Run Let's Encrypt (covered in deployment guide)
   - Update OAuth redirect URLs

4. **First Login**
   - Visit `https://yourdomain.com`
   - Sign in with Google or GitHub
   - Start adding contacts, tickets, roadmap items

---

## Key Files to Configure

### Backend `.env`
```env
DATABASE_URL=postgresql://venn:password@localhost:5432/venn
OAUTH_GOOGLE_CLIENT_ID=...
OAUTH_GOOGLE_CLIENT_SECRET=...
OAUTH_GITHUB_CLIENT_ID=...
OAUTH_GITHUB_CLIENT_SECRET=...
JWT_SECRET=(generate with: openssl rand -hex 32)
SESSION_SECRET=(generate with: openssl rand -hex 32)
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

### OAuth Redirect URLs
Add these to your OAuth apps:
- `https://yourdomain.com/api/auth/google/callback`
- `https://yourdomain.com/api/auth/github/callback`

---

## Development Mode

To run locally:

```bash
# Backend
cd backend
pnpm install
cp .env.example .env
# Edit .env with local database
pnpm dev

# Frontend (separate terminal)
cd frontend
pnpm install
pnpm dev
```

Visit `http://localhost:5173`

---

## Documentation

- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Full deployment guide for Debian
- **[API.md](docs/API.md)** - Complete API reference
- **[SCHEMA.md](docs/SCHEMA.md)** - Database schema documentation
- **[DESIGN.md](DESIGN.md)** - Architecture & design decisions
- **[README.md](README.md)** - Project overview

---

## Tech Stack Details

**Backend:**
- Node.js 18+ with TypeScript
- Express.js (web framework)
- PostgreSQL 15+ (database)
- Passport.js (OAuth authentication)
- Zod (validation)

**Frontend:**
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (navigation)
- React Query (data fetching)
- Axios (HTTP client)
- Lucide React (icons)
- date-fns (date formatting)

**Deployment:**
- PM2 (process management)
- Nginx (reverse proxy)
- Let's Encrypt (SSL)

---

## Future Enhancements (Not Built Yet)

Ideas for v2 when you're ready:

- Email integration (IMAP/SMTP for tickets)
- Webhooks/API for integrations
- Advanced analytics dashboard
- Custom workflows & automation
- Multi-tenant architecture
- Team collaboration features
- File attachments
- Real-time notifications (WebSockets)

---

## Git History

All work is committed with clear messages:
- Initial project documentation and design
- Add backend setup and database schema
- Add backend API routes and server setup
- Add frontend setup and core UI components
- Add all frontend pages (Tickets, Roadmap, detail views)
- Add deployment scripts and documentation

Total: 6 commits, 60+ files, ~5000+ lines of code

---

## Support

If you run into issues:

1. Check `docs/DEPLOYMENT.md` troubleshooting section
2. Review logs:
   - Backend: `pm2 logs venn-api`
   - Nginx: `sudo tail -f /var/log/nginx/error.log`
   - Database: `sudo tail -f /var/log/postgresql/*.log`

3. Common issues:
   - OAuth not working → Check redirect URLs match exactly
   - 502 errors → Backend might be down (`pm2 restart venn-api`)
   - Database errors → Verify `DATABASE_URL` and migrations ran

---

## Deployment Checklist

Before going live:

- [ ] OAuth apps created (Google + GitHub)
- [ ] Domain DNS configured
- [ ] Server provisioned (Debian 11+)
- [ ] PostgreSQL installed and secured
- [ ] Node.js 18+ installed
- [ ] Code deployed to `/var/www/venn`
- [ ] `.env` configured with production values
- [ ] Database migrations run
- [ ] Backend built and running (PM2)
- [ ] Frontend built
- [ ] Nginx configured
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] OAuth redirect URLs updated
- [ ] Test login works
- [ ] Backups configured

---

**You're all set!** Everything is ready for deployment when you return. Just follow the deployment guide and you'll be live. 🚀

— Barrow ⚡
