# GitHub Issues to Create

## Issue 1: TypeScript compilation errors block CI/CD pipeline
**Priority:** Critical
**Labels:** bug, ci/cd, typescript

### Description
The codebase has 20+ TypeScript compilation errors that prevent the pre-push hook from succeeding, blocking the CI/CD pipeline.

### Details
- Errors primarily in Express route handlers (`contacts.ts`, `tickets.ts`, `roadmap.ts`)
- TypeScript can't properly infer types for `router.get()` calls with custom `AuthRequest` interface
- Missing `@types/passport-github2` package
- Code runs fine in dev mode (tsx), but won't compile with `tsc`

### Impact
- Cannot push code through CI/CD pipeline without `--no-verify`
- Defeats the purpose of the pre-push validation hook
- Type safety is compromised

### Affected Files
- `backend/src/routes/contacts.ts`
- `backend/src/routes/tickets.ts`
- `backend/src/routes/roadmap.ts`
- `backend/src/config/passport.ts`

### Reproduction
```bash
cd venn/backend
pnpm typecheck
# See 20+ compilation errors
```

---

## Issue 2: Missing Vite environment type definitions
**Priority:** High  
**Labels:** bug, frontend, typescript

### Description
Frontend build fails with "Property 'env' does not exist on type 'ImportMeta'" when trying to access `import.meta.env.VITE_API_URL`.

### Fix Applied
Created `frontend/src/vite-env.d.ts` with proper type definitions.

### Should Have Been
This file should have been included in the initial commit. It's a standard Vite setup requirement.

### Impact
- Breaks production builds
- Confusing error for new developers

---

## Issue 3: No test authentication bypass
**Priority:** Medium
**Labels:** enhancement, testing, auth

### Description
OAuth is the only authentication method, making local testing difficult without setting up Google/GitHub OAuth apps.

### Current Workaround
Manual database insertion of test users:
```sql
INSERT INTO users (email, name, role, oauth_provider, oauth_id)  
VALUES ('test@venn.local', 'Test User', 'admin', 'test', 'test123');
```

### Proposed Solution
Add a test mode that allows:
- Simple email/password login for development
- Auto-login when `NODE_ENV=development`
- Test user seeding script

### Impact
- Friction for new developers
- Cannot easily run automated tests
- Depends on external OAuth services for local dev

---

## Issue 4: ESLint fails on test files
**Priority:** Low
**Labels:** bug, ci/cd, tooling

### Description
ESLint attempts to lint test files but they're not included in `tsconfig.json`, causing parse errors.

### Fix Applied
Added `tests/**/*` to `.eslintrc.json` ignore patterns.

### Should Have Been
Test files should either be:
1. Excluded from ESLint (current fix)
2. Have their own `tsconfig.test.json` with proper includes

---

## Issue 5: Roadmap GET endpoint not protected
**Priority:** Medium
**Labels:** security, api

### Description
The `GET /api/roadmap` endpoint returns data without authentication, while other endpoints properly return 401.

### Reproduction
```bash
curl http://5.78.83.163:8000/api/roadmap
# Returns: {"data":[],"pagination":{"page":1,"limit":50,"total":0}}
# Expected: {"error":"Authentication required"}
```

### Impact
- Publicly accessible roadmap data
- Inconsistent auth pattern
- May be intentional (public roadmap feature?), but should be documented

---

## Issue 6: No production process manager
**Priority:** High
**Labels:** enhancement, deployment, ops

### Description
Backend and frontend are running with `nohup` + background processes instead of a proper process manager.

### Current State
```bash
nohup pnpm dev > ~/venn-backend.log 2>&1 &
nohup serve -l 9000 > ~/venn-frontend.log 2>&1 &
```

### Problems
- No automatic restart on crash
- No log rotation
- Running in dev mode (tsx watch) in production
- Hard to manage/monitor

### Proposed Solution
Use PM2 or systemd services:
```bash
pm2 start ecosystem.config.js
# or
systemctl start venn-backend venn-frontend
```

---

## Issue 7: PostgreSQL authentication confusion
**Priority:** Low
**Labels:** docs, deployment

### Description
Initial deployment failed with confusing SCRAM authentication error when using passwordless connection string.

### Error
```
SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string
```

### Root Cause
Empty password in `postgresql://baro:@localhost/venn` not handled gracefully by pg driver.

### Fix
Set explicit password and use full connection string.

### Improvement
Add better error messages or document PostgreSQL auth requirements in deployment guide.

---

These issues are documented in `TESTING_NOTES.md` with additional context.
