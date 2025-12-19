# Production Deployment Guide

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │   Backend       │     │   Database      │
│   (Vercel)      │────▶│   (Render)      │────▶│   (Supabase)    │
│   React/Vite    │     │   Node/Express  │     │   PostgreSQL    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 1. Frontend Deployment (Vercel - Recommended)

### Option A: Deploy via GitHub (Easiest)

1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for production"
   git push origin main
   ```

2. Go to [vercel.com](https://vercel.com) and sign in with GitHub

3. Click "Add New Project" → Select your repository

4. Configure Build Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variable:
   - Click "Environment Variables"
   - Add: `VITE_API_URL` = `https://your-backend.onrender.com/api`

6. Click "Deploy" - Your site will be live in ~1 minute!

### Option B: Deploy via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (follow prompts)
vercel

# Deploy to production
vercel --prod
```

---

## 2. Backend Deployment (Render - Free)

### Step 1: Go to Render

1. Visit [render.com](https://render.com)
2. Sign up/Login with GitHub

### Step 2: Create Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select the repo

### Step 3: Configure Service

| Setting | Value |
|---------|-------|
| **Name** | `onchainweb-api` |
| **Region** | Oregon (US West) |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node index.js` |
| **Plan** | Free |

### Step 4: Add Environment Variables

Click "Environment" and add these:

```
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://qatjqymhvbdlrjmsimci.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here
JWT_SECRET=your_generated_secret
FRONTEND_URL=https://your-app.vercel.app
```

### Step 5: Deploy

Click "Create Web Service" - Render will build and deploy automatically.

Your API will be at: `https://onchainweb-api.onrender.com`

---

## 3. Update Frontend with Backend URL

After backend is deployed:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `VITE_API_URL` to your Render URL:
   ```
   VITE_API_URL=https://onchainweb-api.onrender.com/api
   ```
3. Redeploy: Go to "Deployments" → Click "..." → "Redeploy"

---

## 4. Database Setup (Supabase)

Your database is already hosted on Supabase. Just run the migrations:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to SQL Editor
4. Run these files in order:
   - `server/database/schema.sql`
   - `server/database/complete_setup.sql`

---

## 5. Custom Domain (Optional)

### On Vercel (Frontend)
1. Project Settings → Domains
2. Add `www.yourdomain.com`
3. Update your DNS:
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`

### On Render (Backend)
1. Service Settings → Custom Domains
2. Add `api.yourdomain.com`
3. Follow DNS instructions

---

## Quick Reference

| Component | URL | Service |
|-----------|-----|---------|
| Frontend | `https://your-app.vercel.app` | Vercel |
| Backend API | `https://your-api.onrender.com` | Render |
| Database | `https://xxx.supabase.co` | Supabase |

---

## Troubleshooting

### CORS Errors
Make sure `FRONTEND_URL` in Render matches your Vercel URL exactly.

### API Not Responding
Check Render logs: Dashboard → Your Service → Logs

### Build Failures
- Frontend: Check `npm run build` works locally
- Backend: Ensure all dependencies are in `package.json`

---

## Cost Summary (Free Tier)

| Service | Free Tier |
|---------|-----------|
| Vercel | Unlimited static sites |
| Render | 750 hours/month (sleeps after 15min inactivity) |
| Supabase | 500MB database, 2GB bandwidth |

**Total Monthly Cost: $0** (within free tier limits)

---

## Production Checklist

- [ ] Push code to GitHub
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Vercel
- [ ] Set environment variables on both
- [ ] Run database migrations
- [ ] Test login/registration
- [ ] Test all features
- [ ] Set up custom domain (optional)
