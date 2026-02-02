#!/bin/bash
# Install systemd services for venn backend and frontend

set -e

echo "🔧 Installing Venn systemd services..."

# Check if running with sudo
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run with sudo: sudo bash install-systemd.sh"
    exit 1
fi

# Set the user explicitly
ACTUAL_USER="baro"
echo "📝 Installing services for user: $ACTUAL_USER"

# Stop any existing dev processes
echo "🛑 Stopping existing dev processes..."
pkill -f "tsx watch" || true
pkill -f "pnpm dev" || true
sleep 2

# Copy service files
echo "📋 Copying service files to /etc/systemd/system/..."
cp /home/$ACTUAL_USER/venn/deployment/venn-backend.service /etc/systemd/system/
cp /home/$ACTUAL_USER/venn/deployment/venn-frontend.service /etc/systemd/system/

# Reload systemd
echo "🔄 Reloading systemd daemon..."
systemctl daemon-reload

# Enable services (start on boot)
echo "✅ Enabling services..."
systemctl enable venn-backend.service
systemctl enable venn-frontend.service

# Start services
echo "🚀 Starting services..."
systemctl start venn-backend.service
systemctl start venn-frontend.service

# Check status
echo ""
echo "📊 Service Status:"
echo "=================="
systemctl status venn-backend.service --no-pager -l | head -15
echo ""
systemctl status venn-frontend.service --no-pager -l | head -15

echo ""
echo "✅ Installation complete!"
echo ""
echo "Useful commands:"
echo "  sudo systemctl status venn-backend    # Check backend status"
echo "  sudo systemctl status venn-frontend   # Check frontend status"
echo "  sudo systemctl restart venn-backend   # Restart backend"
echo "  sudo systemctl restart venn-frontend  # Restart frontend"
echo "  sudo journalctl -u venn-backend -f    # Follow backend logs"
echo "  sudo journalctl -u venn-frontend -f   # Follow frontend logs"
