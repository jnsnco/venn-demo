#!/bin/bash
# Fix user services - remove User= directive that causes GROUP error
# Run on severn as baro

set -e

echo "Stopping services..."
systemctl --user stop venn-backend venn-frontend

echo "Removing User= directive from service files..."
sed -i "/^User=baro/d" /home/baro/.config/systemd/user/venn-backend.service
sed -i "/^User=baro/d" /home/baro/.config/systemd/user/venn-frontend.service

echo "Reloading daemon..."
systemctl --user daemon-reload

echo "Starting services..."
systemctl --user start venn-backend venn-frontend

echo "Checking status..."
systemctl --user status venn-backend --no-pager | head -10
echo ""
systemctl --user status venn-frontend --no-pager | head -10

echo ""
echo "Fix complete!"
