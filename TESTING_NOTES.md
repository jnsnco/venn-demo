# Testing Notes - 2026-01-30

## Deployment Status
✅ **Successfully Deployed**
- Server: http://5.78.83.163:9000 (frontend)
- API: http://5.78.83.163:8000 (backend)
- Database: PostgreSQL 17, migrations applied
- Test user created: test@venn.local (admin)

## Issues Found

### 🔴 Critical (Blocking)

1. **TypeScript Compilation Errors** - PRIORITY 1
   - 20+ type errors in route handlers (contacts, tickets, roadmap)
   - Blocks CI/CD pre-push hook
   - Errors related to Express Router type definitions and AuthRequest interface
   - Code runs fine (dev mode with tsx), but won't compile with tsc
   - **Impact:** Cannot push code through CI/CD pipeline
   - **Files affected:**
     - `backend/src/routes/contacts.ts`
     - `backend/src/routes/tickets.ts`
     - `backend/src/routes/roadmap.ts`
     - `backend/src/config/passport.ts` (missing @types/passport-github2)

2. **Missing Vite Environment Types** - PRIORITY 2
   - Frontend build failed with "Property 'env' does not exist on type 'ImportMeta'"
   - **Fix applied:** Created `frontend/src/vite-env.d.ts`
   - **Should be:** Added to repository in initial commit
   - **Impact:** Breaks production builds

3. **No Authentication Bypass for Testing** - PRIORITY 2
   - OAuth is the only auth method
   - No way to test locally without OAuth setup
   - **Workaround:** Manual database insert of test user
   - **Should have:** Test mode with simple email/password or dev bypass

### ⚠️ High (Should Fix Soon)

4. **PostgreSQL Authentication Issue** - PRIORITY 3
   - Initial connection string failed with SCRAM auth error
   - Required setting explicit password on baro user
   - **Fix applied:** Set password and updated DATABASE_URL
   - **Root cause:** Empty password in connection string not handled properly
   - **Impact:** Deployment friction, confusing error messages

5. **No Production Process Manager** - PRIORITY 3
   - Running with `nohup` + background processes
   - No automatic restart on crash
   - No log rotation
   - **Should use:** PM2 or systemd service
   - **Impact:** Not production-ready, will crash and stay down

6. **Frontend API URL Hardcoded** - PRIORITY 3
   - Uses VITE_API_URL from .env (good)
   - But defaults to `/api` which won't work without reverse proxy
   - **Current:** Hardcoded IP http://5.78.83.163:8000
   - **Should be:** Relative path `/api` with nginx proxy, or dynamic detection

### 📝 Medium (Nice to Have)

7. **No Reverse Proxy Setup**
   - Frontend on :9000, Backend on :8000
   - CORS required between them
   - **Should have:** Nginx serving frontend + proxying /api/* to backend
   - **Impact:** Extra configuration, CORS complexity

8. **OAuth Credentials Placeholders**
   - Expected (mentioned in HANDOFF.md)
   - Need Google Cloud Console + GitHub OAuth app setup
   - **Impact:** Can't test authentication flow

9. **No Health Check UI**
   - `/health` endpoint exists and works
   - But not linked from frontend
   - Useful for monitoring

10. **Development Mode in Production**
    - Backend running with `pnpm dev` (tsx watch)
    - Should build and run compiled code in production
    - **Impact:** Performance, security (source maps exposed)

### ✅ Working Well

- Database schema migration ✓
- PostgreSQL setup and connectivity ✓
- Health endpoint responding ✓
- Frontend builds successfully (after vite-env.d.ts fix) ✓
- API authentication working (returns proper 401) ✓
- Both servers running stable ✓

## Testing Recommendations

### For You (Fiction)
Without OAuth configured, you can test by:

**Option 1: Direct database access (current workaround)**
```sql
-- Already created for you:
-- User ID: 1
-- Email: test@venn.local
-- Password: (none - OAuth bypass)
```

**Option 2: API testing with curl**
```bash
# Health check
curl http://5.78.83.163:8000/health

# Test auth requirement
curl http://5.78.83.163:8000/api/contacts
# Returns: {"error":"Authentication required"}
```

**Option 3: Set up OAuth**
1. Google Cloud Console → Create OAuth 2.0 Client
2. GitHub Settings → Developer Settings → OAuth Apps
3. Update .env with real credentials
4. Restart backend

### For Me (Automated Testing)
- Can't use browser (not available in this environment)
- Will create API test scripts
- Can test endpoints with curl
- Can verify database state

## Next Steps
1. Fix TypeScript compilation errors (unblock CI/CD)
2. Add vite-env.d.ts to repository
3. Create test authentication bypass mode
4. Set up PM2 or systemd for process management
5. Configure nginx reverse proxy
6. Move to production build mode
