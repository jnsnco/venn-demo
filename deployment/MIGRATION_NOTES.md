# Deployment Migration Notes

## 2026-02-02 - Removed venn-frontend.service

**Change:** Disabled venn-frontend systemd service (port 9000)

**Reason:**  
nginx serves static files directly from `/var/www/venn/`, not via the `serve` process on port 9000. The venn-frontend service was running but not being used.

**Impact:**
- ✅ One less process to manage
- ✅ Port 9000 no longer needed
- ✅ No change to site functionality
- ✅ Slightly reduced resource usage

**What was removed:**
- systemd service: `venn-frontend.service`
- Process: `serve -s dist -l 9000`

**What remains:**
- nginx serves static files from `/var/www/venn/`
- venn-backend.service (API on port 8000, proxied via nginx)

**Deployment workflow unchanged:**
1. Build frontend: `cd ~/venn/frontend && pnpm build`
2. Deploy: `cp -r dist/* /var/www/venn/`
3. Backend: `sudo systemctl restart venn-backend` (if needed)

**Service file location:**  
The service file still exists at `/etc/systemd/system/venn-frontend.service` but is disabled. Can be removed with:
```bash
sudo rm /etc/systemd/system/venn-frontend.service
sudo systemctl daemon-reload
```
