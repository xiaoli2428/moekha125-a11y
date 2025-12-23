# 🚀 Express Backend + Railway Deployment Guide

## What Changed
- **Frontend**: Still deployed on Vercel (unchanged)
- **Backend**: Now using Express.js server instead of Vercel serverless functions
- **Benefit**: Solves native module issues (bcrypt, ethers) + enables background jobs

## Step 1: Deploy Backend to Railway

### Option A: Via Web UI (Easiest - Recommended)

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub account
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `xiaoli2428/moekha125-a11y` repository
5. Select branch: `copilot/link-with-subbase`
6. Choose root directory: `server`
7. Click "Deploy"

Railway will auto-detect:
- **Build command**: `npm install`
- **Start command**: `node index.js`
- **Port**: 3001

### Option B: Via Railway CLI (Advanced)

```bash
npm install -g @railway/cli
railway login  # Opens browser for GitHub auth
cd /workspaces/moekha125-a11y/server
railway init   # Create new project
railway up     # Deploy
```

## Step 2: Set Environment Variables on Railway

After deployment starts, go to **Settings** → **Variables** and add:

```
SUPABASE_URL=https://qatjqymhvbdlrjmsimci.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhdGpxeW1odmJkbGpybXNpbWNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDA2NzMwMCwiZXhwIjoxODkxODMzMzAwfQ.a7E4T5y0M_kPjWZJzHvX6qHzz1k0L6nK9pQwR2sT8vw
JWT_SECRET=kv+DXcPJWprJ81nZoC0IU/5A2MlUiWyX1nEy06R/Nhq6Nd3Q9TFKsBKlcXmJ2dg+
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://moekha125-a11y-bmmhczioh-onchainweb.vercel.app
NODE_ENV=production
PORT=3001
```

## Step 3: Get Your Railway Backend URL

Once deployed, Railway will give you a URL like:
```
https://onchainweb-production-production.up.railway.app
```

## Step 4: Update Frontend to Use Railway Backend

On Vercel, add a new environment variable:

```
VITE_API_URL=https://your-railway-url/api
```

Replace `your-railway-url` with the URL from Step 3.

Then redeploy Vercel:
```bash
npx vercel --prod --confirm
```

## Step 5: Test the Connection

Try email registration:
```bash
curl -X POST https://your-railway-url/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","username":"testuser"}'
```

Should return:
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here...",
  "user": { "id": "...", "email": "test@test.com", ... }
}
```

## Architecture Now

```
User → Vercel Frontend (React) → Railway Backend (Express) → Supabase (PostgreSQL)
                    ↓
             Wallet Connect
```

## Available Endpoints

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Email login
- `POST /api/auth/wallet-login` - Web3 wallet login
- `GET /api/auth/profile` - Get user profile (requires Bearer token)
- `GET /api/health` - Health check
- `GET /api/wallet/transactions` - User transactions
- `POST /api/trading/place-trade` - Place binary trade
- `GET /api/admin/dashboard` - Admin dashboard (admin role required)

## Troubleshooting

### 401 Unauthorized on /api/auth/profile
- Make sure you're sending: `Authorization: Bearer <token>`
- Token is returned from login/register response

### CORS errors
- Backend already allows all origins
- If still blocked, check browser console for actual error

### Database connection failed
- Check Vercel env vars match Step 2
- Verify Supabase project is correct: `qatjqymhvbdlrjmsimci`

### Railway deployment fails
- Check build logs on Railway dashboard
- Ensure `server/package.json` has all dependencies
- Run `npm install` locally to verify: `cd server && npm install`

## Rollback (If Needed)

If something breaks, Vercel functions on `/api` are still there but won't work. To keep app stable:
1. Keep Vercel deployment running (shows wallet connect screen)
2. Fix Railway backend
3. Update VITE_API_URL once fixed

## Next: Enable Background Jobs

Once Railway backend is live, background jobs automatically start:
- Trade settlement: Every 10 seconds
- Arbitrage execution: Every 30 seconds

These are critical for DeFi platform operation.
