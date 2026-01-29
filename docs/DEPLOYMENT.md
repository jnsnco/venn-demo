# Deployment Guide - Debian Server

Complete guide for deploying venn to a Debian server.

## Prerequisites

- Debian 11+ server with root/sudo access
- Domain name pointing to your server
- PostgreSQL 15+ installed
- Node.js 18+ installed
- Nginx installed

## Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y postgresql postgresql-contrib nginx certbot python3-certbot-nginx git build-essential

# Install Node.js 18+ (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm pm2
```

## Step 2: Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# In psql:
CREATE DATABASE venn;
CREATE USER venn WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE venn TO venn;
\q
```

## Step 3: Clone and Deploy Application

```bash
# Create deployment directory
sudo mkdir -p /var/www/venn
sudo chown $USER:$USER /var/www/venn

# Clone repository (or upload files)
cd /var/www/venn
# git clone your-repo-url .
# OR upload the venn directory contents here

# Install backend dependencies
cd /var/www/venn/backend
pnpm install

# Install frontend dependencies
cd /var/www/venn/frontend
pnpm install
```

## Step 4: Configure Environment

```bash
# Backend configuration
cd /var/www/venn/backend
cp .env.example .env
nano .env
```

Update `.env` with your values:
```env
DATABASE_URL=postgresql://venn:your_password@localhost:5432/venn
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com

# OAuth credentials (get from Google/GitHub)
OAUTH_GOOGLE_CLIENT_ID=your_google_client_id
OAUTH_GOOGLE_CLIENT_SECRET=your_google_client_secret
OAUTH_GITHUB_CLIENT_ID=your_github_client_id
OAUTH_GITHUB_CLIENT_SECRET=your_github_client_secret

# Generate random secrets:
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)
```

## Step 5: Run Database Migrations

```bash
cd /var/www/venn/backend

# Run migrations
psql $DATABASE_URL < migrations/001_initial_schema.sql
```

## Step 6: Build Applications

```bash
# Build backend
cd /var/www/venn/backend
pnpm build

# Build frontend
cd /var/www/venn/frontend
pnpm build
```

## Step 7: Setup PM2 for Backend

```bash
cd /var/www/venn/backend

# Start with PM2
pm2 start dist/index.js --name venn-api

# Save PM2 config
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs
```

## Step 8: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/venn
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend (static files)
    location / {
        root /var/www/venn/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/venn /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 9: SSL Certificate (Let's Encrypt)

```bash
sudo certbot --nginx -d yourdomain.com
```

Follow the prompts. Certbot will automatically configure SSL and set up auto-renewal.

## Step 10: Configure OAuth Redirect URLs

In your OAuth provider settings (Google/GitHub Developer Console), add these authorized redirect URIs:
- `https://yourdomain.com/api/auth/google/callback`
- `https://yourdomain.com/api/auth/github/callback`

## Step 11: Verify Deployment

```bash
# Check backend status
pm2 status
pm2 logs venn-api

# Check nginx status
sudo systemctl status nginx

# Check database connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

Visit `https://yourdomain.com` and test login.

## Maintenance

### Update Application

```bash
cd /var/www/venn

# Pull latest code
git pull

# Update backend
cd backend
pnpm install
pnpm build
pm2 restart venn-api

# Update frontend
cd ../frontend
pnpm install
pnpm build
```

### View Logs

```bash
# Application logs
pm2 logs venn-api

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Database logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### Backup Database

```bash
# Create backup
pg_dump $DATABASE_URL > venn_backup_$(date +%Y%m%d).sql

# Restore backup
psql $DATABASE_URL < venn_backup_20250129.sql
```

## Troubleshooting

### Backend won't start
```bash
pm2 logs venn-api
# Check .env file
# Verify database connection
```

### Database connection errors
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Verify user permissions
sudo -u postgres psql -c "\du"
```

### OAuth not working
- Verify redirect URIs in OAuth provider settings
- Check FRONTEND_URL in .env matches your domain
- Ensure SSL is working (OAuth requires HTTPS in production)

### 502 Bad Gateway
```bash
# Backend might be down
pm2 status
pm2 restart venn-api

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## Security Checklist

- [x] PostgreSQL user has strong password
- [x] JWT_SECRET and SESSION_SECRET are random
- [x] SSL certificate installed
- [x] Firewall configured (allow 80, 443, SSH only)
- [x] OAuth secrets not committed to git
- [x] Database backups configured
- [x] PM2 startup configured
- [x] Nginx security headers added (optional)

## Performance Optimization

```bash
# Enable gzip in nginx
sudo nano /etc/nginx/nginx.conf
# Add:
# gzip on;
# gzip_types text/plain text/css application/json application/javascript;

# Configure PostgreSQL for production
sudo nano /etc/postgresql/15/main/postgresql.conf
# Adjust shared_buffers, effective_cache_size based on server RAM
```
