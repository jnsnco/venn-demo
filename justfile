# venn Operations - Common Commands
# Install just: https://github.com/casey/just
# Usage: just <command>

# Default: show available commands
default:
    @just --list

# Production server details
prod_host := "5.78.83.163"
prod_user := "baro"
prod_port := "29689"
prod_key := "~/.ssh/venn_deploy"
ssh_cmd := "ssh -i " + prod_key + " -p " + prod_port + " " + prod_user + "@" + prod_host

# ============================================================================
# DEPLOYMENT
# ============================================================================

# Deploy frontend and backend to production
deploy:
    @echo "🚀 Deploying to production..."
    @just build
    @just deploy-backend
    @just deploy-frontend
    @echo "✅ Deployment complete!"

# Build frontend and backend locally
build:
    @echo "🔨 Building locally..."
    cd frontend && pnpm build
    cd backend && pnpm build

# Deploy backend code and restart
deploy-backend:
    @echo "📦 Deploying backend..."
    {{ssh_cmd}} 'cd ~/venn/backend && source ~/.nvm/nvm.sh && pnpm install'
    scp -i {{prod_key}} -P {{prod_port}} -r backend/src {{prod_user}}@{{prod_host}}:~/venn/backend/
    @just restart-backend

# Deploy frontend build
deploy-frontend:
    @echo "📦 Deploying frontend..."
    {{ssh_cmd}} 'source ~/.nvm/nvm.sh && cd ~/venn/frontend && pnpm build'
    @just restart-frontend

# ============================================================================
# FRONTEND OPERATIONS
# ============================================================================

# Restart frontend (with SPA routing support)
restart-frontend:
    @echo "🔄 Restarting frontend..."
    {{ssh_cmd}} 'lsof -ti:9000 | xargs kill -9 2>/dev/null || true; sleep 2; source ~/.nvm/nvm.sh && cd ~/venn/frontend/dist && serve --single -l 9000 > ~/venn-frontend.log 2>&1 & echo $! > ~/venn-frontend.pid'
    @sleep 2
    @echo "✅ Frontend restarted with SPA routing"

# ============================================================================
# BACKEND OPERATIONS
# ============================================================================

# Restart backend (clean up zombies and start fresh)
restart-backend:
    @echo "🔄 Restarting backend..."
    {{ssh_cmd}} 'pkill -f "tsx.*venn" || true; sleep 2; source ~/.nvm/nvm.sh && cd ~/venn/backend && pnpm dev > ~/venn-backend.log 2>&1 & echo $! > ~/venn-backend.pid'
    @sleep 3
    @just health-backend

# Stop backend
stop-backend:
    @echo "🛑 Stopping backend..."
    {{ssh_cmd}} 'pkill -f "tsx.*venn" || true'

# View backend logs (live tail)
logs-backend:
    {{ssh_cmd}} 'tail -f ~/venn-backend.log'

# View last 50 lines of backend logs
logs-backend-recent:
    {{ssh_cmd}} 'tail -50 ~/venn-backend.log'

# Check backend health
health-backend:
    @echo "🏥 Checking backend health..."
    @{{ssh_cmd}} 'curl -s http://localhost:8000/health' || echo "❌ Backend not responding"

# ============================================================================
# DATABASE OPERATIONS
# ============================================================================

# Connect to PostgreSQL on production
db-connect:
    {{ssh_cmd}} "PGPASSWORD='$(cat .db-credentials | grep PGADMIN_PASSWORD | cut -d'=' -f2)' psql -U baro -h localhost -d venn"

# Backup database
db-backup:
    @echo "💾 Backing up database..."
    {{ssh_cmd}} "PGPASSWORD='$(cat .db-credentials | grep PGADMIN_PASSWORD | cut -d'=' -f2)' pg_dump -U baro -h localhost venn > ~/venn_backup_$(date +%Y%m%d_%H%M%S).sql"

# ============================================================================
# HEALTH & STATUS
# ============================================================================

# Check all services
health:
    @echo "🏥 Health Check"
    @echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    @just health-backend
    @just health-frontend
    @just health-db

# Check frontend
health-frontend:
    @echo "🎨 Frontend: http://{{prod_host}}:9000"
    @{{ssh_cmd}} 'curl -s -o /dev/null -w "%{http_code}" http://localhost:9000' || echo "❌"

# Check database
health-db:
    @echo "🗄️  Database:"
    @{{ssh_cmd}} "PGPASSWORD='iYgb4Ij4Z3HVWWx1an4LTaaeR+tdgUTSohsfINDnDEg=' psql -U venn -h localhost -d venn -c 'SELECT 1;' > /dev/null 2>&1 && echo '✅ Connected' || echo '❌ Failed'"

# Show running processes
status:
    @echo "📊 Production Status"
    @echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    @{{ssh_cmd}} 'ps aux | grep -E "(tsx|serve)" | grep -v grep'

# Clean up zombie processes
cleanup:
    @echo "🧹 Cleaning up zombie processes..."
    {{ssh_cmd}} 'pkill -9 -f "tsx.*venn" || true'
    @echo "✅ Cleanup complete"

# ============================================================================
# DEVELOPMENT
# ============================================================================

# Run tests
test:
    pnpm test

# Lint and type check
check:
    pnpm lint:fix
    pnpm typecheck

# Full CI check (tests + build + lint)
ci:
    @just test
    @just check
    @just build
