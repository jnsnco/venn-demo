# OAuth Setup Guide - GitHub Only

## Quick Setup (5 minutes)

### Step 1: Create GitHub OAuth App

1. **Go to GitHub Developer Settings**
   - Visit: https://github.com/settings/developers
   - Or: GitHub.com → Click your profile → Settings → Developer settings → OAuth Apps

2. **Click "New OAuth App"**

3. **Fill in the form:**
   - **Application name:** `venn` (or `avan-venn`)
   - **Homepage URL:** `http://5.78.83.163:9000`
   - **Application description:** (optional) `venn - CRM, Support & Roadmap`
   - **Authorization callback URL:** `http://5.78.83.163:8000/auth/github/callback`

4. **Click "Register application"**

5. **Copy your credentials:**
   - **Client ID:** Shows immediately (looks like: `Ov23liABC123xyz`)
   - **Client secrets:** Click "Generate a new client secret"
     - ⚠️ **Copy it immediately!** You won't see it again
     - (looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0`)

---

### Step 2: Update Server Configuration

SSH into your server:

```bash
ssh -p 29689 baro@5.78.83.163
```

Edit the backend `.env` file:

```bash
nano ~/venn/backend/.env
```

**Find these lines and update with YOUR credentials:**

```bash
# GitHub OAuth (REQUIRED)
GITHUB_CLIENT_ID=Ov23liABC123xyz     # ← Replace with your Client ID
GITHUB_CLIENT_SECRET=a1b2c3d4...      # ← Replace with your Client Secret
GITHUB_CALLBACK_URL=http://5.78.83.163:8000/auth/github/callback
```

**Remove/comment out the Google lines** (no longer needed):

```bash
# Google OAuth is disabled (GitHub only for now)
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
# GOOGLE_CALLBACK_URL=...
```

**Save and exit:**
- Press `Ctrl+O` (save)
- Press `Enter` (confirm)
- Press `Ctrl+X` (exit)

---

### Step 3: Restart the Backend

Still on the server:

```bash
# Kill the current backend process
kill $(cat ~/venn-backend.pid)

# Load Node.js
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Start the backend
cd ~/venn/backend
nohup pnpm dev > ~/venn-backend.log 2>&1 &
echo $! > ~/venn-backend.pid

# Check it started
tail -5 ~/venn-backend.log
```

You should see:
```
🚀 venn API server running on port 8000
```

---

### Step 4: Test It!

1. **Open the app:** http://5.78.83.163:9000

2. **Click "Sign in with GitHub"**

3. **You'll be redirected to GitHub** to authorize the app

4. **After authorizing,** you'll be redirected back to venn and logged in!

---

## Troubleshooting

### "Error: Missing required parameter: client_id"
- Check that `GITHUB_CLIENT_ID` is set in `.env`
- Make sure you restarted the backend after editing `.env`

### "The redirect_uri MUST match the registered callback URL"
- GitHub OAuth app callback URL must be: `http://5.78.83.163:8000/auth/github/callback`
- Check for typos (http not https, correct port 8000)

### "Application error occurred"
- Check backend logs: `tail -50 ~/venn-backend.log`
- Database might not be running: `psql -d venn -c "SELECT 1;"`

### Backend won't start
```bash
# Check if port is in use
lsof -i :8000

# View recent logs
tail -50 ~/venn-backend.log

# Check if Node.js is available
node --version
```

---

## Adding Google OAuth Later

If you want to add Google login later:

1. Uncomment Google routes in `backend/src/routes/auth.ts`
2. Add Google OAuth credentials to `.env`
3. Update frontend `Login.tsx` to show both buttons
4. Restart backend

See `github-issues.md` for the full Google Cloud Console setup guide.

---

## Security Notes

- **Never commit `.env` files to git** (already in `.gitignore`)
- The callback URL must exactly match what's registered on GitHub
- For production: use HTTPS and a proper domain
- Keep your Client Secret private

---

**Questions?** Check the logs or refer to GitHub's OAuth documentation:
https://docs.github.com/en/apps/oauth-apps/building-oauth-apps
