#!/bin/bash
set -e

echo "🚀 venn deployment script"

# Configuration
APP_DIR="/var/www/venn"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${GREEN}▶ $1${NC}"
}

print_warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if running in correct directory
if [ ! -f "package.json" ] || [ ! -d "../backend" ]; then
    print_warn "Please run this script from the venn project root"
    exit 1
fi

# Pull latest code (if git)
if [ -d ".git" ]; then
    print_step "Pulling latest code..."
    git pull
fi

# Backend deployment
print_step "Deploying backend..."
cd "$BACKEND_DIR"
pnpm install --production=false
pnpm build

# Frontend deployment
print_step "Deploying frontend..."
cd "$FRONTEND_DIR"
pnpm install --production=false
pnpm build

# Restart backend
print_step "Restarting backend..."
pm2 restart venn-api || pm2 start "$BACKEND_DIR/dist/index.js" --name venn-api

# Save PM2 config
pm2 save

print_step "Deployment complete! ✨"
echo ""
echo "Next steps:"
echo "  - Visit your domain to verify"
echo "  - Check logs: pm2 logs venn-api"
echo "  - Monitor: pm2 monit"
