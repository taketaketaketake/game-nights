# Setup Guide

Complete setup instructions for Game Night Live platform.

## Prerequisites

- Node.js 20+ and npm
- PostgreSQL 15+ (or use Supabase)
- Auth0 account
- Cloudflare account (for R2 storage)

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd gamenightlive

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Start PostgreSQL with Docker

```bash
# From project root
docker-compose up -d postgres
```

Or use Supabase:
1. Create a project at [supabase.com](https://supabase.com)
2. Get your connection string from Settings → Database

### 3. Configure Auth0

1. Go to [auth0.com](https://auth0.com) and create an account
2. Create a new Application (Single Page Application)
3. Configure settings:
   - **Allowed Callback URLs**: `http://localhost:4321/callback`
   - **Allowed Logout URLs**: `http://localhost:4321`
   - **Allowed Web Origins**: `http://localhost:4321`
4. Create an API:
   - **Name**: Game Night Live API
   - **Identifier**: `https://api.gamenightlive.com` (or your domain)
5. Note down:
   - Domain
   - Client ID
   - Client Secret
   - API Identifier

### 4. Configure Cloudflare R2

1. Go to Cloudflare Dashboard → R2
2. Create a new bucket: `gamenightlive`
3. Generate R2 API token:
   - Permissions: Object Read & Write
4. Note down:
   - Account ID
   - Access Key ID
   - Secret Access Key
5. Optional: Set up custom domain for public access

### 5. Environment Variables

**Frontend (.env):**

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```
PUBLIC_AUTH0_DOMAIN=your-domain.auth0.com
PUBLIC_AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_SECRET=generate_random_32_char_string

PUBLIC_API_URL=http://localhost:3000
PUBLIC_WS_URL=http://localhost:3000

NODE_ENV=development
```

**Backend (.env):**

```bash
cd ../backend
cp .env.example .env
```

Edit `.env`:
```
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:4321

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gamenightlive

AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=https://api.gamenightlive.com

R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET=gamenightlive
R2_PUBLIC_URL=https://your-custom-domain.com

JWT_SECRET=your_random_secret_string
```

### 6. Initialize Database

```bash
cd backend

# Run migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

### 7. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 8. Access the Application

- Frontend: http://localhost:4321
- Backend API: http://localhost:3000
- Health check: http://localhost:3000/health

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Auth0 Issues

- Verify all URLs in Auth0 dashboard match your local URLs
- Check that API permissions are configured
- Ensure Auth0 domain and client ID are correct

### R2 Upload Issues

- Verify R2 credentials are correct
- Check bucket exists and is accessible
- Ensure CORS is configured if accessing from browser

## Next Steps

1. Read [API Documentation](./API.md) to understand endpoints
2. Check [Game Types Guide](./GAMES.md) to learn about game mechanics
3. See [Deployment Guide](./DEPLOYMENT.md) for production setup
