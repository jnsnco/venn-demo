# Venn Deployment Files

This directory contains production deployment configurations for systemd process management.

## Files

- **venn-backend.service** - systemd unit file for backend API
- **venn-frontend.service** - systemd unit file for frontend static server
- **install-systemd.sh** - Installation script (run with sudo)
- **SYSTEMD_EXPLAINED.md** - Detailed explanation of how systemd works and why we use it

## Quick Start

**To install systemd services:**

```bash
# SSH to production server
ssh -i ~/.ssh/venn_deploy -p 29689 baro@5.78.83.163

# Run installation script
cd ~/venn/deployment
sudo bash install-systemd.sh
```

That's it! The script will:
1. Stop existing dev processes
2. Install and enable services
3. Start both backend and frontend
4. Show status

## Daily Operations

**Check status:**
```bash
sudo systemctl status venn-backend
sudo systemctl status venn-frontend
```

**Restart after deploying new code:**
```bash
cd ~/venn/backend && git pull && pnpm build
sudo systemctl restart venn-backend
```

**View logs:**
```bash
sudo journalctl -u venn-backend -f
```

## Learn More

Read **SYSTEMD_EXPLAINED.md** for:
- What zombie processes are
- Why systemd solves them
- Detailed config walkthrough
- Troubleshooting guide
- Complete command reference
