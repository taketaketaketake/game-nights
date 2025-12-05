# Deployment Guide

Production deployment instructions for Game Night Live.

## Overview

Recommended production stack:
- **Frontend**: Cloudflare Pages (free)
- **Backend**: Railway or Render ($5-20/mo)
- **Database**: Supabase (free tier)
- **Storage**: Cloudflare R2 (~$5/mo)
- **Auth**: Auth0 (free up to 7,000 users)

**Total cost: $5-25/month**

## Prerequisites

- GitHub repository with your code
- Domain name (optional but recommended)
- Production accounts set up (see below)

## 1. Database Setup (Supabase)

### Create Database

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose a name and strong password
4. Select region closest to your users
5. Wait for database to provision

### Run Migrations

```bash
# Get connection string from Supabase Dashboard
# Settings → Database → Connection string (URI)

# Set as environment variable
export DATABASE_URL="postgresql://..."

# Run migrations
cd backend
npm run db:migrate
```

### Configure Backups

1. Supabase Dashboard → Settings → Database
2. Enable daily backups
3. Set retention period

## 2. Backend Deployment (Railway)

### Option A: Railway (Recommended)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Configure:
   - **Root Directory**: `/backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

6. Add Environment Variables:
```
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com
DATABASE_URL=<supabase-connection-string>
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=https://api.yourdomain.com
R2_ENDPOINT=<cloudflare-r2-endpoint>
R2_ACCESS_KEY_ID=<your-key>
R2_SECRET_ACCESS_KEY=<your-secret>
R2_BUCKET=gamenightlive
R2_PUBLIC_URL=https://cdn.yourdomain.com
JWT_SECRET=<random-string>
```

7. Deploy!

### Option B: Render

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: gamenightlive-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables (same as Railway)
6. Click "Create Web Service"

### Get Backend URL

After deployment completes, note your backend URL:
- Railway: `https://your-app.up.railway.app`
- Render: `https://your-app.onrender.com`

## 3. Frontend Deployment (Cloudflare Pages)

### Initial Setup

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Pages → "Create a project"
3. Connect to Git → Select repository
4. Configure build:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/frontend`

### Environment Variables

Add these in Cloudflare Pages settings:

```
PUBLIC_AUTH0_DOMAIN=your-domain.auth0.com
PUBLIC_AUTH0_CLIENT_ID=<your-client-id>
AUTH0_CLIENT_SECRET=<your-secret>
AUTH0_SECRET=<random-32-char-string>
PUBLIC_API_URL=https://your-backend.railway.app
PUBLIC_WS_URL=https://your-backend.railway.app
NODE_ENV=production
```

### Custom Domain (Optional)

1. Cloudflare Pages → Your project → Custom domains
2. Add your domain
3. Update DNS records as instructed
4. SSL certificate automatically provisioned

## 4. Storage Setup (Cloudflare R2)

### Create Bucket

1. Cloudflare Dashboard → R2
2. Create bucket: `gamenightlive-prod`
3. Generate API token (Object Read & Write)

### Configure CORS

1. Bucket settings → CORS policy
2. Add:
```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

### Custom Domain (Optional)

1. R2 → Custom domains → Add domain
2. Add subdomain: `cdn.yourdomain.com`
3. Update DNS automatically

## 5. Auth0 Production Configuration

### Update URLs

1. Auth0 Dashboard → Applications → Your App
2. Update:
   - **Allowed Callback URLs**: `https://yourdomain.com/callback`
   - **Allowed Logout URLs**: `https://yourdomain.com`
   - **Allowed Web Origins**: `https://yourdomain.com`

3. API settings:
   - **Identifier**: `https://api.yourdomain.com`
   - Enable RBAC (Role-Based Access Control)

### Production Checklist

- [ ] Enable MFA for admin accounts
- [ ] Configure rate limiting
- [ ] Set up email provider (SendGrid, Mailgun)
- [ ] Customize login page
- [ ] Enable bot detection
- [ ] Configure attack protection

## 6. DNS Configuration

If using custom domain:

```
Type    Name    Value
A       @       <cloudflare-pages-ip>
CNAME   www     <your-pages-url>
CNAME   cdn     <r2-bucket-url>
```

## 7. Enable Redis (When Scaling)

### Railway Redis

1. Railway project → "New" → "Database" → "Redis"
2. Copy connection URL
3. Add to backend environment variables:
```
REDIS_URL=redis://<railway-redis-url>
```

### Alternative: Upstash

1. Go to [upstash.com](https://upstash.com)
2. Create Redis database
3. Copy REST URL
4. Add to environment variables

## 8. Monitoring & Alerts

### Uptime Monitoring

Use [Better Uptime](https://betteruptime.com) or [Checkly](https://www.checklyhq.com):

- Monitor: `https://yourdomain.com/health`
- Check frequency: Every 5 minutes
- Alert via: Email, SMS, Slack

### Error Tracking (Optional)

1. Sign up for [Sentry](https://sentry.io)
2. Add Sentry SDK to backend:
```bash
npm install @sentry/node
```

3. Initialize in `server.js`:
```javascript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## 9. SSL & Security

### SSL Certificates

- ✅ Cloudflare Pages: Automatic
- ✅ Railway: Automatic
- ✅ Render: Automatic

### Security Headers

Add to backend `server.js`:

```javascript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  next();
});
```

## 10. Backups

### Database Backups

Supabase:
- Automatic daily backups (7 days retention on free tier)
- Manual backups: Dashboard → Database → Backups

### Manual Backup Script

```bash
#!/bin/bash
# backup.sh

export PGPASSWORD="your-password"
pg_dump -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  -f backup-$(date +%Y%m%d).sql

# Upload to S3/R2 for long-term storage
```

## 11. CI/CD Pipeline

Both Cloudflare Pages and Railway deploy automatically on git push:

```
main branch → production
develop branch → staging (optional)
```

### GitHub Actions (Optional)

`.github/workflows/test.yml`:
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
```

## 12. Go Live Checklist

- [ ] All environment variables set
- [ ] Database migrated and seeded
- [ ] Auth0 production URLs configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificates active
- [ ] Uptime monitoring enabled
- [ ] Backups configured
- [ ] Error tracking setup
- [ ] Load testing completed
- [ ] Documentation updated

## Troubleshooting

### Backend won't start
- Check environment variables are set
- Verify database connection string
- Check logs: Railway/Render dashboard

### Frontend build fails
- Verify Node.js version (20+)
- Check environment variables
- Review build logs in Cloudflare

### WebSocket connection fails
- Ensure backend URL is correct
- Check CORS settings
- Verify no proxy blocking WebSockets

### Database connection timeout
- Check Supabase connection string
- Verify IP allowlist (Supabase allows all by default)
- Test connection with psql

## Scaling

When you outgrow the free tiers:

1. **Database**: Upgrade Supabase plan ($25/mo for better performance)
2. **Backend**: Railway/Render scale automatically with traffic
3. **Add Redis**: Enable for multi-server Socket.io
4. **CDN**: Already using Cloudflare
5. **Load Balancer**: Railway Pro plan includes this

## Cost Projection

| Users     | Monthly Cost |
|-----------|--------------|
| 0-1,000   | $5-15        |
| 1K-10K    | $25-50       |
| 10K-100K  | $100-300     |
| 100K+     | $500+        |
