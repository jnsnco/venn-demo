# OAuth 404 Fix - Update GitHub Settings

## Issue
The GitHub OAuth callback URL was incorrect. Routes are at `/api/auth/*` not `/auth/*`.

## Quick Fix (2 minutes)

### Update your GitHub OAuth App

1. **Go to your GitHub OAuth app:**
   - https://github.com/settings/developers
   - Click on your "venn" application

2. **Update the Authorization callback URL:**
   - **OLD (incorrect):** `http://5.78.83.163:8000/auth/github/callback`
   - **NEW (correct):** `http://5.78.83.163:8000/api/auth/github/callback`
   
   Notice the `/api/` in the path!

3. **Click "Update application"**

### Test It

1. Visit: http://5.78.83.163:9000
2. Click "Sign in with GitHub"
3. Should redirect to GitHub → Authorize → Redirect back → You're logged in! 🎉

---

## What Was Fixed

- ✅ Updated backend code to use `GITHUB_CLIENT_ID` (not `OAUTH_GITHUB_CLIENT_ID`)
- ✅ Backend restarted with latest code
- ✅ Server .env file updated with correct callback URL
- ⚠️ **YOU NEED TO:** Update GitHub OAuth app callback URL (see above)

## Routes Reference

All auth routes are prefixed with `/api/auth`:

- **Login:** `http://5.78.83.163:8000/api/auth/github`
- **Callback:** `http://5.78.83.163:8000/api/auth/github/callback`  ← **Update this in GitHub**
- **Current user:** `http://5.78.83.163:8000/api/auth/me`
- **Logout:** `http://5.78.83.163:8000/api/auth/logout` (POST)

---

## Updated Files

- `backend/src/config/passport.ts` - Fixed env variable names
- `backend/.env` (on server) - Updated callback URL
- Backend code redeployed from GitHub

Everything is ready on the server side. Just update the GitHub OAuth app settings and you're done! 🚀
