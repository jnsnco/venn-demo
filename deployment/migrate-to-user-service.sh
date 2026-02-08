#!/bin/bash
# Migrate venn services from system to user services
# Run as any user with sudo access
# Exits immediately on any error

set -e  # Exit on any error
set -u  # Exit on undefined variable
set -o pipefail  # Exit on pipe failures

echo "=== Migrating venn services to user services ==="
echo ""

echo "Step 1: Stopping system services..."
sudo systemctl stop venn-backend venn-frontend
sudo systemctl disable venn-backend venn-frontend
echo "✓ System services stopped and disabled"
echo ""

echo "Step 2: Creating user service directory..."
sudo mkdir -p /home/baro/.config/systemd/user/
echo "✓ Directory created"
echo ""

echo "Step 3: Copying service files..."
sudo cp /etc/systemd/system/venn-backend.service /home/baro/.config/systemd/user/
sudo cp /etc/systemd/system/venn-frontend.service /home/baro/.config/systemd/user/
echo "✓ Service files copied"
echo ""

echo "Step 4: Fixing service files (multi-user.target → default.target)..."
sudo sed -i "s/WantedBy=multi-user.target/WantedBy=default.target/" /home/baro/.config/systemd/user/venn-backend.service
sudo sed -i "s/WantedBy=multi-user.target/WantedBy=default.target/" /home/baro/.config/systemd/user/venn-frontend.service
echo "✓ Service files fixed"
echo ""

echo "Step 5: Setting ownership to baro..."
sudo chown baro:baro /home/baro/.config/systemd/user/venn-backend.service
sudo chown baro:baro /home/baro/.config/systemd/user/venn-frontend.service
echo "✓ Ownership set"
echo ""

echo "Step 6: Creating target directories..."
sudo mkdir -p /home/baro/.config/systemd/user/default.target.wants
sudo chown baro:baro /home/baro/.config/systemd/user/default.target.wants
echo "✓ Target directories created"
echo ""

echo "Step 7: Reloading user daemon..."
sudo -u baro XDG_RUNTIME_DIR=/run/user/$(id -u baro) systemctl --user daemon-reload
echo "✓ Daemon reloaded"
echo ""

echo "Step 8: Enabling user services..."
sudo -u baro XDG_RUNTIME_DIR=/run/user/$(id -u baro) systemctl --user enable venn-backend
sudo -u baro XDG_RUNTIME_DIR=/run/user/$(id -u baro) systemctl --user enable venn-frontend
echo "✓ Services enabled"
echo ""

echo "Step 9: Starting user services..."
sudo -u baro XDG_RUNTIME_DIR=/run/user/$(id -u baro) systemctl --user start venn-backend
sudo -u baro XDG_RUNTIME_DIR=/run/user/$(id -u baro) systemctl --user start venn-frontend
echo "✓ Services started"
echo ""

echo "Step 10: Enabling lingering (auto-start on boot)..."
sudo loginctl enable-linger baro
echo "✓ Lingering enabled"
echo ""

echo "Step 11: Verifying services..."
sudo -u baro XDG_RUNTIME_DIR=/run/user/$(id -u baro) systemctl --user status venn-backend --no-pager
echo ""
sudo -u baro XDG_RUNTIME_DIR=/run/user/$(id -u baro) systemctl --user status venn-frontend --no-pager
echo ""

echo "=== Migration complete! ==="
echo ""
echo "Barrow can now manage services with:"
echo "  systemctl --user restart venn-backend"
echo "  systemctl --user restart venn-frontend"
echo "  systemctl --user status venn-backend"
echo "  journalctl --user -u venn-backend -f"
