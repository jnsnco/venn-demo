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
# SSH to production server (use internal IP from barrow)
ssh severn
# or: ssh -i ~/.ssh/venn_deploy -p 29689 baro@10.89.0.3

# Run installation script
cd ~/venn/deployment
sudo bash install-systemd.sh
```

**Note:** When connecting from barrow (dev machine), always use the internal IP `10.89.0.3` or the `severn` SSH alias.

That's it! The script will:
1. Stop existing dev processes
2. Install and enable services
3. Start both backend and frontend
4. Show status

## Daily Operations

**Check backend status:**
```bash
sudo systemctl status venn-backend
```

**Deploy frontend changes:**
```bash
cd ~/venn/frontend && git pull && pnpm build
sudo cp -r dist/* /var/www/venn/
```

**Deploy backend changes:**
```bash
cd ~/venn/backend && git pull && pnpm build
sudo systemctl restart venn-backend
```

**View logs:**
```bash
sudo journalctl -u venn-backend -f
```

**Note:** venn-frontend systemd service has been removed. nginx serves static files directly from `/var/www/venn/`.

## Learn More

Read **SYSTEMD_EXPLAINED.md** for:
- What zombie processes are
- Why systemd solves them
- Detailed config walkthrough
- Troubleshooting guide
- Complete command reference
