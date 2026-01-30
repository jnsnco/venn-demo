# [ISSUE] Add HTTPS and Re-enable Secure Session Cookies

**Labels:** security, production, enhancement
**Priority:** High

## Description
Currently running over HTTP with session cookies set to `secure: false`. Need to set up HTTPS and re-enable secure cookies for production security.

## Current State
- Backend accessible at: `http://5.78.83.163:8000`
- Frontend accessible at: `http://5.78.83.163:9000`
- Session cookie config: `secure: false` (temporary workaround)

## Required Changes

### 1. Domain & SSL Setup
- [ ] Point a domain to `5.78.83.163`
- [ ] Install Let's Encrypt SSL certificate
- [ ] Configure auto-renewal

### 2. Nginx Reverse Proxy
- [ ] Install and configure nginx
- [ ] Frontend: serve static files from `/var/www/venn/frontend/dist`
- [ ] Backend: proxy `/api/*` to `localhost:8000`
- [ ] Enable HTTPS (port 443)
- [ ] Redirect HTTP (port 80) → HTTPS

### 3. Session Security
- [ ] Update `backend/src/index.ts`: set `secure: true` in session cookie config
- [ ] Update `.env`: `FRONTEND_URL=https://yourdomain.com`
- [ ] Update GitHub OAuth callback URL to use HTTPS

### 4. OAuth Configuration
- [ ] Update GitHub OAuth app callback URL to HTTPS version
- [ ] Test OAuth flow over HTTPS

## Security Impact
**Current risk:** Session cookies transmitted over HTTP can be intercepted.

**Post-fix:** Session cookies marked as `secure` will only be sent over HTTPS, preventing session hijacking.

## Implementation Guide
See `docs/DEPLOYMENT.md` for nginx + SSL setup instructions.

## Acceptance Criteria
- [ ] Site accessible via `https://yourdomain.com`
- [ ] HTTP automatically redirects to HTTPS
- [ ] Session cookies have `secure: true`
- [ ] OAuth login works over HTTPS
- [ ] SSL certificate auto-renews

## Related Files
- `backend/src/index.ts` (session config)
- `docs/DEPLOYMENT.md` (deployment guide)
- `.env` files (frontend/backend URLs)

## Estimated Effort
~2-3 hours (domain setup + nginx + testing)
