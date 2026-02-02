# systemd Process Management - Explained

## What Are Zombie Processes?

**Simple explanation:**  
A zombie process is a "dead" process that hasn't been cleaned up yet. It's finished running but still appears in the process list.

**Technical explanation:**  
When a process finishes, it doesn't immediately disappear. Instead:
1. Process exits (dies)
2. OS keeps an entry with exit status
3. Parent process should call `wait()` to read the exit status
4. After `wait()`, the entry is removed

If the parent never calls `wait()`, the dead process stays as a "zombie" - taking up a slot in the process table.

**Example from our problem:**
```
tsx watch src/index.ts  (parent)
  └─ node src/index.ts  (child - restarts on file changes)
```

When file changes, `tsx` kills the old node process and starts a new one. But if `tsx` doesn't properly clean up the dead process, it becomes a zombie.

---

## Why systemd Solves This

**systemd is a "process supervisor"** - it:

1. **Becomes the parent** of your process
2. **Automatically reaps zombies** - systemd calls `wait()` on all child processes
3. **Restarts crashed processes** - if your app crashes, systemd starts it again
4. **Manages dependencies** - waits for PostgreSQL before starting your app
5. **Starts on boot** - your app runs automatically when server reboots
6. **Manages logs** - integrates with `journalctl` for centralized logging

**With systemd:**
```
systemd (PID 1)
  └─ node dist/index.js (PID 12345)
```

If node crashes → systemd restarts it  
If node spawns children → systemd reaps zombies  
If server reboots → systemd starts node automatically

---

## Better Ways to Fight Zombies?

**Short answer:** systemd (or similar supervisor) **is** the best way.

**Alternatives:**
1. **PM2** - Node.js-specific process manager (easier but less integrated)
2. **supervisord** - Python-based supervisor (cross-platform)
3. **Docker** - containerization (overkill for simple apps)
4. **Manual scripts** - writing your own init scripts (don't do this)

**Why systemd wins:**
- ✅ Native to Linux (already installed)
- ✅ Used by most production servers
- ✅ Integrates with system logging (journalctl)
- ✅ Starts on boot automatically
- ✅ Battle-tested and reliable
- ✅ No extra dependencies

**When to use PM2 instead:**
- Multiple Node.js apps on one server
- Need cluster mode (multi-core)
- Want a nice web dashboard
- Don't have root access (PM2 can run as user)

For a simple app like venn, **systemd is the right choice**.

---

## Config File Walkthrough

### venn-backend.service

```ini
[Unit]
Description=Venn Backend API Server
After=network.target postgresql.service
Wants=postgresql.service
```

**What this does:**
- `Description` - Human-readable name
- `After` - Wait for network and PostgreSQL before starting
- `Wants` - Prefer to have PostgreSQL running (but start anyway if it's not)

---

```ini
[Service]
Type=simple
User=baro
WorkingDirectory=/home/baro/venn/backend
```

**What this does:**
- `Type=simple` - Process stays in foreground (doesn't fork/daemonize)
- `User=baro` - Run as user `baro` (not root - security)
- `WorkingDirectory` - Where to run the command (sets `cwd`)

---

```ini
Environment=NODE_ENV=production
Environment=PATH=/home/baro/.nvm/versions/node/v20.20.0/bin:/usr/local/bin:/usr/bin:/bin
EnvironmentFile=/home/baro/venn/backend/.env
```

**What this does:**
- `Environment` - Set env variables directly
- `EnvironmentFile` - Load variables from `.env` file
- `PATH` - Include nvm's node binary path

This ensures your app runs with production config and can find `node`.

---

```ini
ExecStart=/home/baro/.nvm/versions/node/v20.20.0/bin/node dist/index.js
```

**What this does:**
- The actual command to run
- **Note:** We run the **compiled** code (`dist/index.js`), not dev mode (`tsx watch`)
- Must be an absolute path

---

```ini
Restart=always
RestartSec=10
```

**What this does:**
- `Restart=always` - Restart on ANY exit (crash, manual stop, etc.)
- `RestartSec=10` - Wait 10 seconds before restarting (prevents restart loops)

**Other restart options:**
- `on-failure` - Only restart on errors (exit code ≠ 0)
- `on-abnormal` - Only restart on crashes (signals, timeouts)
- `no` - Never restart

For a production API, `always` is usually best.

---

```ini
StandardOutput=journal
StandardError=journal
SyslogIdentifier=venn-backend
```

**What this does:**
- Send stdout/stderr to systemd journal
- Tag logs with `venn-backend` identifier

**View logs:**
```bash
sudo journalctl -u venn-backend        # All logs
sudo journalctl -u venn-backend -f     # Follow (tail -f style)
sudo journalctl -u venn-backend --since "1 hour ago"
sudo journalctl -u venn-backend -n 100 # Last 100 lines
```

---

```ini
NoNewPrivileges=true
PrivateTmp=true
LimitNOFILE=4096
```

**What this does (security/limits):**
- `NoNewPrivileges` - Process can't gain more privileges
- `PrivateTmp` - Process gets its own `/tmp` directory (isolation)
- `LimitNOFILE` - Max open files (4096 is generous for an API)

These are optional hardening features.

---

```ini
[Install]
WantedBy=multi-user.target
```

**What this does:**
- Tells systemd to start this service when reaching "multi-user" mode
- Multi-user = normal boot (not single-user/rescue mode)
- Required for `systemctl enable` to work

---

## How to Use systemd Services

### Installation (one-time)

```bash
# SSH to server
ssh -i ~/.ssh/venn_deploy -p 29689 baro@5.78.83.163

# Copy service files
cd ~/venn/deployment
sudo bash install-systemd.sh
```

The script will:
1. Stop existing dev processes
2. Copy service files to `/etc/systemd/system/`
3. Enable services (start on boot)
4. Start services
5. Show status

---

### Daily Operations

**Check status:**
```bash
sudo systemctl status venn-backend
sudo systemctl status venn-frontend
```

**Start/Stop/Restart:**
```bash
sudo systemctl start venn-backend
sudo systemctl stop venn-backend
sudo systemctl restart venn-backend
```

**Enable/Disable auto-start on boot:**
```bash
sudo systemctl enable venn-backend   # Start on boot
sudo systemctl disable venn-backend  # Don't start on boot
```

**View logs:**
```bash
# Follow logs (live tail)
sudo journalctl -u venn-backend -f

# View last 100 lines
sudo journalctl -u venn-backend -n 100

# View logs since 1 hour ago
sudo journalctl -u venn-backend --since "1 hour ago"

# View logs for specific time range
sudo journalctl -u venn-backend --since "2026-02-02 06:00" --until "2026-02-02 08:00"
```

---

### Deployment Workflow

**When you deploy new code:**

```bash
# 1. SSH to server
ssh -i ~/.ssh/venn_deploy -p 29689 baro@5.78.83.163

# 2. Pull latest code
cd ~/venn/backend
git pull

# 3. Install dependencies (if needed)
pnpm install

# 4. Build
pnpm build

# 5. Restart service
sudo systemctl restart venn-backend

# 6. Check it started successfully
sudo systemctl status venn-backend
sudo journalctl -u venn-backend -n 50
```

**Future improvement:** Automate this with a deploy script or CI/CD.

---

## Troubleshooting

**Service won't start:**
```bash
# Check status
sudo systemctl status venn-backend

# Check logs for errors
sudo journalctl -u venn-backend -n 100

# Common issues:
# - Wrong path in ExecStart
# - Missing environment variables
# - Port already in use
# - Build errors (check if dist/index.js exists)
```

**Service keeps restarting:**
```bash
# Check logs for crash reason
sudo journalctl -u venn-backend -f

# Temporarily disable auto-restart to debug
sudo systemctl stop venn-backend
cd ~/venn/backend
node dist/index.js  # Run manually to see errors
```

**Can't see logs:**
```bash
# Make sure service is using journal
grep StandardOutput /etc/systemd/system/venn-backend.service

# Should see:
# StandardOutput=journal
# StandardError=journal
```

---

## Process Tree Comparison

**Before (dev mode):**
```
nohup pnpm dev
  └─ pnpm dev
      └─ sh -c tsx watch src/index.ts
          └─ tsx watch src/index.ts
              └─ node src/index.ts
                  └─ [zombie processes accumulate here]
```

Problems:
- Multiple layers of indirection
- nohup doesn't reap zombies
- No auto-restart on crash
- Won't start on reboot

---

**After (systemd):**
```
systemd (PID 1)
  └─ node dist/index.js (PID 12345)
```

Benefits:
- ✅ Single clean process
- ✅ systemd reaps all zombies
- ✅ Auto-restart on crash
- ✅ Starts on boot
- ✅ Integrated logging
- ✅ Easy management

---

## Summary

**Zombie processes happen when:**
- Parent process doesn't clean up dead children
- Multiple layers of process spawning (tsx → node → esbuild)
- Dev tools (tsx watch) restarting processes

**systemd fixes this by:**
- Becoming the parent process
- Automatically reaping zombies
- Running production code directly (no dev watchers)
- Providing proper lifecycle management

**This is production-ready because:**
- Used by virtually all modern Linux servers
- Battle-tested for reliability
- Integrates with system logging
- Starts on boot automatically
- Security features built-in

**For venn, this means:**
- No more zombie processes
- App restarts if it crashes
- App starts when server reboots
- Clean logging via journalctl
- Simple deployment workflow

---

**Next steps:** Run the install script and you're done!
