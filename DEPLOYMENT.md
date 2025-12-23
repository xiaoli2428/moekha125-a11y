# Deployment Guide

Complete deployment instructions for Onchainweb platform.

## Architecture Overview

- **Frontend**: React + Vite → Vercel
- **Backend**: Node.js + Express → Railway/Render
- **Database**: PostgreSQL → Supabase

## Part 1: Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and set project details:
   - Name: `onchainweb`
   - Database Password: (save this securely)
   - Region: Choose closest to your users

### 2. Load Database Schema (In This Order)

Open **SQL Editor** in Supabase dashboard and run each file in order:

#### Step 1: Core Schema
1. Create new query
2. Open `server/database/schema.sql`
3. Copy entire contents and paste into SQL Editor
4. Click **Run** and verify no errors
5. Check "Tables" section - should see: users, wallets, transactions, binary_trades, support_tickets

#### Step 2: Additional Tables (Run Each Separately)
5. Run `server/database/deposit_addresses_and_coins.sql` (deposit addresses for cryptocurrencies)
6. Run `server/database/kyc_tables.sql` (KYC verification tables)
7. Run `server/database/trading_levels.sql` (user trading tier configurations)
8. Run `server/database/master_account.sql` (master admin role setup)

**⚠️ Important**: Run these files in order because they may have foreign key dependencies.

### 3. Get API Credentials

1. Go to Settings → API
2. Copy and save:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon key**: `eyJ...` (public, used by frontend)
   - **service_role secret**: `eyJ...` (⚠️ KEEP SECURE - used by backend only)

### 4. Verify Schema Loaded

In Supabase SQL Editor, run:
```sql
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema = 'public';
```

Expected: At least 10+ tables should exist

## Part 2: Backend Deployment (Railway)

### Option A: Railway (Recommended)

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub account and select your repo
4. Configure build settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. Add environment variables:
```env
PORT=3001
NODE_ENV=production
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=generate_random_64_char_string
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-url.vercel.app
```

6. Deploy and copy the generated URL (e.g., `https://xxx.railway.app`)

### Option B: Render

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect repository
4. Configure:
   - **Name**: `onchainweb-api`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add environment variables (same as Railway above)
6. Create web service and copy URL

## Part 3: Frontend Deployment (Vercel)

### 1. Update Frontend API URL

Before deploying, update the API URL in your frontend code:

```javascript
// src/config/api.js
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add environment variable:
   - Key: `VITE_API_URL`
   - Value: Your Railway/Render backend URL (e.g., `https://xxx.railway.app/api`)

6. Click "Deploy"

### 3. Update Backend CORS

After getting your Vercel URL:

1. Go back to Railway/Render dashboard
2. Update `FRONTEND_URL` environment variable to your Vercel URL
3. Redeploy backend

## Part 4: Testing Deployment

### 1. Test Backend

```bash
# Health check
curl https://your-backend-url.railway.app/api/health

# Expected: {"status":"ok","timestamp":"..."}
```

### 2. Test Frontend

1. Open your Vercel URL in browser
2. Try registering a new account
3. Test login
4. Check if API calls work

### 3. Create Admin Account

```bash
# Register admin via API
curl -X POST https://your-backend-url.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@onchainweb.com",
    "password": "your_secure_password",
    "username": "admin"
  }'

# Then manually update role in Supabase dashboard:
# Go to Table Editor → users → find your admin user
# Change role from "user" to "admin"
```

## Part 5: Post-Deployment Configuration

### Security Checklist

- ✅ Change all default passwords
- ✅ Generate strong JWT_SECRET (64+ characters)
- ✅ Enable HTTPS (automatic on Vercel/Railway)
- ✅ Set secure CORS origins
- ✅ Never commit `.env` files
- ✅ Rotate Supabase service key periodically

### Performance Optimization

1. **Enable Caching**: Add Redis for session management
2. **Database Indexes**: Already included in schema
3. **CDN**: Vercel automatically provides CDN
4. **Monitoring**: Add Sentry for error tracking

## Troubleshooting

### CORS Errors

Problem: `Access-Control-Allow-Origin` error

Solution:
1. Verify `FRONTEND_URL` in backend env vars matches Vercel URL
2. Ensure no trailing slash in URLs
3. Check browser console for exact origin

### Database Connection Fails

Problem: Cannot connect to Supabase

Solution:
1. Verify credentials are correct
2. Check Supabase project is not paused
3. Ensure service key has proper permissions

### Authentication Not Working

Problem: Login returns 401

Solution:
1. Check JWT_SECRET is set in backend
2. Verify user exists in database
3. Check user status is 'active'
4. Clear browser cookies/localStorage

## Environment Variables Reference

### Backend (Railway/Render)

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| NODE_ENV | Environment | production |
| SUPABASE_URL | Supabase project URL | https://xxx.supabase.co |
| SUPABASE_ANON_KEY | Public anon key | eyJhbGc... |
| SUPABASE_SERVICE_KEY | Secret service key | eyJhbGc... |
| JWT_SECRET | Token signing secret | random_64_char_string |
| JWT_EXPIRES_IN | Token expiration | 7d |
| FRONTEND_URL | Frontend origin | https://xxx.vercel.app |

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | https://xxx.railway.app/api |

## Costs (Free Tier Limits)

- **Supabase**: 500MB database, 2GB bandwidth/month
- **Railway**: 500 hours/month, $5 credit
- **Render**: 750 hours/month
- **Vercel**: Unlimited bandwidth, 100GB/month

All can run on free tier for development/testing.

## Monitoring & Logs

### Railway
- View logs in dashboard under "Deployments"
- Set up log drains for persistent storage

### Render
- Logs available in dashboard
- Set up alerts for errors

### Vercel
- Function logs in dashboard
- Runtime logs for debugging

## Scaling Considerations

When traffic grows:

1. **Database**: Upgrade Supabase plan for more connections
2. **Backend**: Railway/Render auto-scales, or move to AWS/GCP
3. **Frontend**: Vercel handles scaling automatically
4. **Caching**: Add Redis for sessions/rate limiting
5. **CDN**: Use Cloudflare in front of everything

## Support

If deployment issues persist:

1. Check service status pages (Vercel, Railway, Supabase)
2. Review application logs
3. Test each component independently
4. Verify all environment variables are set

## Next Steps

After successful deployment:

1. Set up custom domain
2. Configure email service (SendGrid, Mailgun)
3. Add monitoring (Sentry, LogRocket)
4. Set up backup strategy
5. Implement rate limiting
6. Add analytics (Google Analytics, Plausible)
