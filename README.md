# venn

A unified SaaS platform combining CRM, customer support, and product roadmap management.

## Overview

venn brings together three essential business tools:
- **CRM**: Manage contacts, organizations, and customer relationships
- **Support**: Handle customer tickets with full context
- **Roadmap**: Plan features with customer feedback and voting

## Tech Stack

- **Backend**: Node.js + TypeScript + Express
- **Frontend**: React + TypeScript + Vite
- **Database**: PostgreSQL
- **Auth**: OAuth (Google/GitHub)

## Project Structure

```
venn/
├── backend/           # Node.js API server
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── models/    # Database models
│   │   ├── middleware/# Auth, validation, etc.
│   │   ├── services/  # Business logic
│   │   └── utils/     # Helpers
│   ├── migrations/    # Database migrations
│   └── package.json
├── frontend/          # React application
│   ├── src/
│   │   ├── components/# React components
│   │   ├── pages/     # Page components
│   │   ├── hooks/     # Custom hooks
│   │   ├── api/       # API client
│   │   └── utils/     # Helpers
│   └── package.json
├── docs/              # Additional documentation
├── scripts/           # Deployment scripts
└── DESIGN.md          # Architecture decisions

```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- pnpm (recommended)

### Setup

1. **Database**
   ```bash
   createdb venn
   ```

2. **Backend**
   ```bash
   cd backend
   pnpm install
   cp .env.example .env
   # Configure .env with database and OAuth credentials
   pnpm migrate
   pnpm dev
   ```

3. **Frontend**
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

Visit `http://localhost:5173` to access the application.

## Deployment

See `docs/DEPLOYMENT.md` for Debian server deployment instructions.

## Documentation

- [Design Decisions](DESIGN.md)
- [API Documentation](docs/API.md)
- [Database Schema](docs/SCHEMA.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## License

MIT
