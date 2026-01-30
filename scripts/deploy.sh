#!/bin/bash
# Deployment script for venn
# Usage: ./scripts/deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 Deploying venn to $ENVIRONMENT..."

# Pre-flight checks
echo "✈️  Running pre-flight checks..."

# Check if we're in a git repository
if [ ! -d "$PROJECT_ROOT/.git" ]; then
  echo "❌ Error: Not in a git repository"
  exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "⚠️  Warning: You have uncommitted changes"
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Run tests locally
echo "🧪 Running tests..."
cd "$PROJECT_ROOT"
pnpm test || {
  echo "❌ Tests failed. Aborting deployment."
  exit 1
}

# Build production artifacts
echo "🔨 Building production artifacts..."
pnpm build || {
  echo "❌ Build failed. Aborting deployment."
  exit 1
}

echo "📦 Production build complete!"

# TODO: Once server access is configured, add deployment steps here:
# - Backup current deployment
# - Transfer files to server
# - Run database migrations
# - Restart services
# - Run smoke tests
# - Rollback on failure

echo "⚠️  Server deployment not yet configured."
echo "   Artifacts are ready in backend/dist and frontend/dist"
echo "   Configure server access and update this script to complete deployment."

exit 0
