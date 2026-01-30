# CI/CD Workflow Specification

**Goal:** Local-first, automated testing and deployment pipeline for venn SaaS platform

## Requirements

- **Local execution** (no external CI services initially)
- **Fast feedback** (< 2 minutes for full validation)
- **Pre-deployment validation** (catch issues before they hit production)
- **Automated deployment** with rollback capability
- **Minimal dependencies** (use what we have)

## Workflow Stages

### 1. Pre-Commit (Optional, Fast)
- **Trigger:** `git commit`
- **Actions:**
  - Lint staged files (ESLint)
  - Format check (Prettier)
  - TypeScript type check (tsc --noEmit)
- **Time budget:** < 10 seconds
- **Tool:** Husky + lint-staged

### 2. Pre-Push (Required, Thorough)
- **Trigger:** `git push`
- **Actions:**
  - Run all tests (backend + frontend)
  - Build validation (ensure production builds succeed)
  - Schema validation (check migrations are valid)
- **Time budget:** < 2 minutes
- **Tool:** Husky pre-push hook
- **Failure:** Block push

### 3. Deployment (Manual Trigger)
- **Trigger:** `./deploy.sh [staging|production]`
- **Actions:**
  1. Pre-flight checks (target server reachable, env vars set)
  2. Run tests locally (same as pre-push)
  3. Build production artifacts
  4. Backup current deployment (if exists)
  5. Deploy to target
  6. Run smoke tests (health endpoint, database connectivity)
  7. If smoke tests fail → automatic rollback
- **Time budget:** < 5 minutes
- **Environments:** staging (optional), production

## Test Strategy

### Backend Tests (Jest)
- **Unit tests:** Core business logic (contacts, tickets, roadmap)
- **Integration tests:** API endpoints (auth, CRUD operations)
- **Database tests:** Migrations, schema validation
- **Coverage target:** 70% (pragmatic, not dogmatic)

### Frontend Tests (Vitest + Testing Library)
- **Component tests:** Key UI components
- **Integration tests:** User flows (login, create ticket, vote on roadmap)
- **Coverage target:** 60%

### Smoke Tests (Production Health)
- Health endpoint responds 200
- Database connection successful
- OAuth redirect URLs configured
- Critical API endpoints respond

## File Structure

```
venn/
├── .husky/                 # Git hooks
│   ├── pre-commit
│   └── pre-push
├── scripts/
│   ├── test.sh            # Run all tests
│   ├── build.sh           # Build all artifacts
│   ├── deploy.sh          # Deployment orchestration
│   └── rollback.sh        # Rollback to previous version
├── tests/
│   ├── backend/           # Backend tests
│   └── frontend/          # Frontend tests
└── CI_CD.md               # This document

```

## Implementation Steps

1. **Setup test infrastructure**
   - Install Jest, Vitest, Testing Library
   - Configure test runners
   - Write initial test suite (smoke tests + critical paths)

2. **Setup git hooks**
   - Install Husky
   - Configure pre-commit (lint/format)
   - Configure pre-push (tests + build)

3. **Create deployment scripts**
   - `deploy.sh` with staging + production targets
   - `rollback.sh` for quick recovery
   - Health check utilities

4. **Documentation**
   - Update DEPLOYMENT.md with CI/CD workflow
   - Add TESTING.md with test writing guidelines

## GitHub Account Requirements

To enable GitHub integration:
- Create service account (e.g., `barrow-bot`)
- Generate SSH key pair
- Add deploy key to venn repository
- Configure git identity in workspace

## Future Enhancements (Phase 2)

- GitHub Actions for automated deployment on push to main
- Automated dependency updates (Dependabot)
- Performance testing (Lighthouse, load tests)
- Security scanning (npm audit, OWASP checks)

## Token Budget Notes

- Spec created: 2026-01-29 23:41 UTC
- Context saved in CI_CD_SPEC.md
- Memory updated in memory/2026-01-29.md
- Ready for implementation after review

---

**Next steps:** Review spec → Create GitHub account → Implement workflow
