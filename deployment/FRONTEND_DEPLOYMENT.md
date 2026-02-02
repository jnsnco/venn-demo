# Frontend Deployment Guide

## Production Deployment Process

### Prerequisites
- Frontend built with production API URL
- SSH access to production server

### Build Configuration

**IMPORTANT:** Vite bakes environment variables at **build time**, not runtime.

The frontend needs `VITE_API_URL` set before building:

```bash
# 1. Create .env file from example
cd frontend
cp .env.example .env

# 2. Edit .env with production URL
echo "VITE_API_URL=https://venn-demo.avan.academy/api" > .env

# 3. Build (this bakes the URL into the bundle)
pnpm build
```

### Deployment Steps

**From barrow (dev machine):**

```bash
# Build with production env
cd venn/frontend
pnpm build

# Deploy to severn
rsync -avz --delete dist/ baro@10.89.0.3:/var/www/venn/
```

**Verification:**

```bash
# Check deployed bundle has correct URL
ssh severn 'grep -o "venn-demo.avan.academy" /var/www/venn/assets/*.js | head -1'

# Should output: https://venn-demo.avan.academy/api
```

### Common Issues

#### Issue: Login redirects to localhost:8000

**Cause:** Frontend was built without production `VITE_API_URL`

**Fix:**
1. Ensure `frontend/.env` exists with `VITE_API_URL=https://venn-demo.avan.academy/api`
2. Rebuild: `cd frontend && pnpm build`
3. Redeploy: `rsync -avz --delete dist/ baro@10.89.0.3:/var/www/venn/`

#### Issue: Changes not appearing

**Cause:** Browser cache or Cloudflare cache

**Fix:**
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R)
- Clear browser cache
- Check bundle hash changed in `/var/www/venn/index.html`

### Build vs Runtime Config

**❌ Wrong Approach:**
```javascript
// This does NOT work - API_BASE_URL is undefined at runtime
const API_URL = process.env.VITE_API_URL || '/api';
```

**✅ Correct Approach:**
```javascript
// Vite replaces import.meta.env.VITE_API_URL at build time
const API_URL = import.meta.env.VITE_API_URL || '/api';
```

### Future: Build on Server

To avoid this issue, consider building on the server:

```bash
ssh severn
cd ~/venn/frontend
git pull
pnpm install
pnpm build
cp -r dist/* /var/www/venn/
```

This ensures the server's `.env` file is always used.

---

**Last Updated:** 2026-02-02
**Issue:** Fixed localhost:8000 appearing in production builds
