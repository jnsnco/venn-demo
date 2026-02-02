# Deployment Retrospective - OAuth Login Fix

**Date:** 2026-02-02  
**Deployment:** venn-demo.avan.academy  
**Status:** ✅ Successfully deployed and working

---

## Objective

Deploy the Venn CRM application to production with working GitHub OAuth authentication.

## Initial Setup

- **Frontend:** React SPA built with Vite, served via nginx at `/var/www/venn`
- **Backend:** Express.js API running on port 8000, proxied through nginx at `/api`
- **Infrastructure:** Debian server behind Cloudflare, nginx with Cloudflare Origin Certificate
- **OAuth Provider:** GitHub OAuth App

---

## Issues Encountered & Solutions

### Issue #1: React Router Intercepting OAuth Links

**Problem:**  
The "Sign in with GitHub" button was implemented as an `<a>` tag with `href="/api/auth/github"`. React Router intercepted the click event and treated it as an internal route, preventing the browser from navigating to the OAuth endpoint.

**Symptoms:**
- Button click did nothing
- No network request to `/api/auth/github` appeared in DevTools
- User stayed on login page

**Root Cause:**  
React Router's `<BrowserRouter>` wraps the entire app and intercepts all `<a>` tag clicks by default to enable client-side routing.

**Solution:**  
Changed the login button from an `<a>` tag to a `<button>` with explicit `window.location.href` assignment:

```tsx
// Before (didn't work):
<a href={`${API_URL}/auth/github`}>Sign in with GitHub</a>

// After (works):
<button onClick={() => window.location.href = `${API_URL}/auth/github`}>
  Sign in with GitHub
</button>
```

**File Modified:** `venn/frontend/src/pages/Login.tsx`

**Lesson:** When you need to navigate outside a React app (API endpoints, OAuth flows, external sites), use `window.location.href` or `window.location.replace()` to bypass React Router.

---

### Issue #2: Session Cookies Not Being Set

**Problem:**  
After successful GitHub OAuth (user approved, callback received with auth code), the backend didn't create a session. User was redirected back to the login page instead of the dashboard.

**Symptoms:**
- OAuth flow completed successfully (visible in Network tab)
- Callback endpoint returned 302 redirect to frontend
- No session cookie was set in browser
- `/api/auth/me` returned 401 Unauthorized

**Root Cause:**  
Express session middleware was configured with `secure: true` for cookies (HTTPS-only). However, Express didn't know it was behind an nginx reverse proxy, so it saw the connection as HTTP (localhost:8000) and refused to set secure cookies.

**Solution:**  
Added `app.set('trust proxy', 1)` to tell Express to trust the `X-Forwarded-Proto` header from nginx:

```typescript
// venn/backend/src/index.ts
const app = express();
app.set('trust proxy', 1); // Trust nginx proxy headers
```

This allows Express to correctly detect that the original client connection was HTTPS, even though nginx → backend communication is over HTTP.

**File Modified:** `venn/backend/src/index.ts`

**Lesson:** When running Node.js behind a reverse proxy (nginx, Apache, load balancer), always set `trust proxy` if you're using secure cookies or need to read client IP addresses.

---

### Issue #3: Aggressive Browser/Cloudflare Caching

**Problem:**  
Even after fixing the code and deploying, users (including in incognito mode) still saw the old broken behavior. The OAuth flow worked, but after redirect users landed back on the login page with the old JavaScript.

**Symptoms:**
- Hard refresh (Ctrl+Shift+R) didn't help initially
- Incognito mode showed the same issue
- Network tab showed cached JavaScript files

**Root Cause:**  
Nginx was configured to cache all static assets (including HTML) for 1 year. Browsers served cached `index.html`, which referenced cached (old) JavaScript files.

**Solution:**  
Updated nginx configuration to differentiate caching strategies:

```nginx
# No cache for HTML files (they're small and reference hashed assets)
location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
}

# Cache static assets with hash in filename (safe to cache forever)
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

**File Modified:** `/etc/nginx/sites-available/venn-demo.avan.academy`

**Why This Works:**
- HTML files are never cached (always fresh)
- JS/CSS files have content hashes in filenames (`index-BcKLEi6N.js`)
- When you deploy, the HTML references new hashed files
- Old cached JS files become unreferenced and naturally age out

**Lesson:** For Single Page Apps, never cache the root HTML file. Cache JS/CSS with long expiry because build tools add content hashes to filenames.

---

## What Worked Well

✅ **Cloudflare Origin Certificates**  
- Easy to set up, no Let's Encrypt renewal needed
- Worked perfectly with nginx

✅ **Systemd Service Management**  
- Backend ran reliably as a systemd service
- Easy to restart and check logs

✅ **Environment Variable Separation**  
- `.env` files kept secrets out of code
- Easy to configure different values for local vs production

✅ **DevTools Network Tab Debugging**  
- Essential for diagnosing the React Router interception
- Showed exactly when OAuth flow started working

✅ **Incremental Debugging**  
- Testing each layer (backend locally, nginx locally, through Cloudflare) helped isolate issues

---

## What Didn't Work Well

❌ **TypeScript Build Errors in Production**  
- Had to edit compiled JavaScript directly because TypeScript wouldn't compile
- Missing `@types/pg` dependency caused build to fail
- **Fix Needed:** Clean up TypeScript configuration and dependencies

❌ **No Build Hash Visible in Deployed Assets**  
- Hard to verify which version was deployed
- Had to grep through minified JavaScript
- **Improvement:** Add build info endpoint (e.g., `/api/version` returning git commit hash)

❌ **Manual Deployment Process**  
- Every change required:
  1. Local edit
  2. SCP to server
  3. SSH in
  4. Build
  5. Copy to web root
  6. Restart services
- **Improvement:** Set up CI/CD (GitHub Actions) for automated deployments

❌ **No Logging/Monitoring**  
- Had to guess what was happening in the backend
- Couldn't easily check if session creation succeeded
- **Improvement:** Add structured logging (pino/winston), set up log aggregation

❌ **Cache Debugging Was Painful**  
- Hard to tell if we were seeing old code or new code
- No version info in responses
- **Improvement:** Add build hash to HTML meta tag or API response

---

## Production Checklist (For Future Deployments)

Before going live:

- [ ] Set `trust proxy` if behind reverse proxy
- [ ] Configure proper cache headers (no-cache HTML, long-cache hashed assets)
- [ ] Test OAuth flow end-to-end in production environment
- [ ] Verify secure cookies work over HTTPS
- [ ] Set up error logging and monitoring
- [ ] Document rollback procedure
- [ ] Test with browser cache disabled (DevTools)
- [ ] Test in incognito/private window
- [ ] Add health check endpoint
- [ ] Set up automated deployments (CI/CD)

---

## Architecture Diagram

```
Browser (HTTPS)
    ↓
Cloudflare CDN
    ↓
Origin Server (HTTPS, Cloudflare cert)
    ↓
nginx (reverse proxy)
    ├─ / → /var/www/venn (React SPA)
    └─ /api → localhost:8000 (Express API)
           ↓
    Express.js + Passport OAuth
           ↓
    PostgreSQL (sessions + data)
```

---

## Final Configuration

### Backend (`venn/backend/src/index.ts`)
```typescript
app.set('trust proxy', 1); // Trust nginx reverse proxy

session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,      // HTTPS only
    httpOnly: true,    // No JS access
    maxAge: 24 * 60 * 60 * 1000, // 24h
    sameSite: 'lax',   // CSRF protection
  },
})
```

### Frontend (`venn/frontend/src/pages/Login.tsx`)
```typescript
const handleGitHubLogin = () => {
  window.location.href = `${API_URL}/auth/github`;
};
```

### Nginx Cache Strategy
- HTML: No cache
- JS/CSS/images with hashes: 1 year cache
- API proxied with no caching

---

## Metrics

- **Time to First Deploy:** ~45 minutes
- **Issues Encountered:** 3 major (React Router, proxy trust, caching)
- **Time to Debug & Fix:** ~90 minutes
- **Final Status:** ✅ Working in production

---

## Lessons Learned

1. **Test OAuth in production early** - localhost != production for cookies/HTTPS
2. **Always set `trust proxy`** when behind a reverse proxy
3. **Cache HTML = bad** for SPAs; cache hashed assets = good
4. **DevTools Network tab is essential** for debugging web flows
5. **React Router intercepts everything** - use `window.location` for external navigation
6. **Incognito mode isn't always cache-free** - use DevTools "Disable cache"

---

## Next Steps

**Immediate:**
- ✅ OAuth working in production
- ✅ Proper cache strategy deployed
- ✅ Session persistence working

**Short Term:**
- [ ] Fix TypeScript build issues
- [ ] Add structured logging
- [ ] Set up CI/CD pipeline
- [ ] Add `/api/version` endpoint with build info

**Long Term:**
- [ ] Set up monitoring/alerting
- [ ] Add integration tests for OAuth flow
- [ ] Document deployment runbook
- [ ] Consider session store upgrade (Redis vs PostgreSQL)

---

**Deployed By:** Barrow (AI agent)  
**Supervised By:** Fiction & Eric  
**Status:** ✅ Production-ready
