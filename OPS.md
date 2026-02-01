# Operations Runbook

Quick reference for common venn operations and troubleshooting.

## Prerequisites

- Install `just`: `curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to ~/.local/bin`
- SSH access configured (key: `~/.ssh/venn_deploy`)

## Quick Commands

```bash
just health              # Check all services
just deploy              # Full deployment
just restart-backend     # Restart backend only
just logs-backend        # View live logs
just cleanup             # Remove zombie processes
```

## Common Operations

### Deployment

**Full Deployment** (frontend + backend):
```bash
just deploy
```

**Backend Only:**
```bash
just deploy-backend
```

**Frontend Only:**
```bash
just deploy-frontend
```

### Backend Management

**Restart:**
```bash
just restart-backend
```

**View Logs:**
```bash
just logs-backend           # Live tail
just logs-backend-recent    # Last 50 lines
```

**Stop:**
```bash
just stop-backend
```

### Health Checks

**All Services:**
```bash
just health
```

**Individual Services:**
```bash
just health-backend
just health-frontend
just health-db
```

**Check Running Processes:**
```bash
just status
```

## Troubleshooting

### Backend Not Responding

1. Check if backend is running:
   ```bash
   just health-backend
   ```

2. View recent logs for errors:
   ```bash
   just logs-backend-recent
   ```

3. Restart backend:
   ```bash
   just restart-backend
   ```

4. If still broken, check for zombie processes:
   ```bash
   just cleanup
   just restart-backend
   ```

### OAuth Login Broken

**Symptoms:** "Not found" or redirect errors

**Common Causes:**
1. Backend not running → `just restart-backend`
2. Frontend built with wrong env vars → Rebuild on production:
   ```bash
   ssh -i ~/.ssh/venn_deploy -p 29689 baro@5.78.83.163 \
     'source ~/.nvm/nvm.sh && cd ~/venn/frontend && pnpm build'
   ```
3. GitHub OAuth credentials missing/wrong → Check `.env` on server

**Check OAuth URL:**
Should be: `http://5.78.83.163:8000/api/auth/github`

### Database Connection Errors

1. Check database is running:
   ```bash
   just health-db
   ```

2. Verify credentials in server's `.env`:
   ```bash
   ssh -i ~/.ssh/venn_deploy -p 29689 baro@5.78.83.163 'cat ~/venn/backend/.env | grep DATABASE_URL'
   ```

3. Test connection manually:
   ```bash
   just db-connect
   ```

### Frontend Not Loading

1. Check if frontend server is running:
   ```bash
   just health-frontend
   ```

2. Check if `serve` process is running:
   ```bash
   ssh -i ~/.ssh/venn_deploy -p 29689 baro@5.78.83.163 'ps aux | grep serve'
   ```

3. Restart frontend server:
   ```bash
   just restart-frontend
   ```

### Frontend Routes 404 (e.g., /contacts refresh)

**Symptoms:** Going to http://5.78.83.163:9000/ works, but http://5.78.83.163:9000/contacts returns 404 on refresh

**Cause:** `serve` needs `--single` flag for SPA (Single Page Application) routing

**Solution:**
```bash
just restart-frontend
```

The `--single` flag tells `serve` to always return `index.html`, letting React Router handle client-side routing.

### Session Not Persisting (Login Loop)

**Symptoms:** OAuth succeeds but redirects back to login

**Common Causes:**
1. Session cookies not working
   - Check `secure: false` in `backend/src/index.ts` (required for HTTP)
2. Frontend API URL mismatch
   - Should be: `VITE_API_URL=http://5.78.83.163:8000/api` in production `.env`
3. CORS issues
   - Check `FRONTEND_URL` in backend `.env` matches actual frontend URL

## Database Operations

### Backup Database

```bash
just db-backup
```

Backups saved to: `~/venn_backup_YYYYMMDD_HHMMSS.sql` on production server

### Connect to Database

```bash
just db-connect
```

### Run Migrations

```bash
ssh -i ~/.ssh/venn_deploy -p 29689 baro@5.78.83.163 \
  'cd ~/venn/backend && source ~/.nvm/nvm.sh && pnpm migrate'
```

## Emergency Procedures

### Complete Service Restart

```bash
just cleanup              # Kill all processes
just restart-backend      # Start backend fresh
just health               # Verify all services
```

### Rollback Deployment

1. Check recent commits:
   ```bash
   git log --oneline -5
   ```

2. Rebuild from a previous commit:
   ```bash
   git checkout <commit-hash>
   just build
   just deploy
   git checkout main  # Return to main
   ```

### Full System Status

```bash
just health
just status
just logs-backend-recent
```

## Production Server Details

- **Host:** 5.78.83.163
- **User:** baro
- **Port:** 29689
- **SSH Key:** `~/.ssh/venn_deploy`
- **Frontend:** http://5.78.83.163:9000 (serve on port 9000)
- **Backend:** http://5.78.83.163:8000 (tsx watch)
- **Database:** PostgreSQL 17 (localhost:5432)

## Directory Structure on Server

```
~/venn/
├── backend/
│   ├── src/          # Backend source
│   ├── dist/         # Compiled JS
│   └── .env          # Backend config
├── frontend/
│   ├── dist/         # Built frontend (served by serve)
│   └── .env          # Frontend build config
└── .beads/           # Issue tracker
```

## Log Files

- **Backend:** `~/venn-backend.log`
- **Frontend:** `~/venn-frontend.log` (if exists)
- **Process IDs:** `~/venn-backend.pid`

## Security Notes

- Database credentials stored in local `.db-credentials` (gitignored)
- Session/JWT secrets in production `.env` (not in repo)
- OAuth secrets in production `.env` (not in repo)
- SSH key required for deployment access

## Adding to PATH

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
export PATH="$PATH:$HOME/.local/bin"  # For just
```

## Getting Help

- Check logs first: `just logs-backend-recent`
- Run health checks: `just health`
- Check Beads for known issues: `bd list`
- Ask agent to diagnose and fix
