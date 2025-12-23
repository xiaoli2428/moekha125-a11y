# Custom Domain Setup Guide - onchainweb.app

## Overview

You already own `onchainweb.app` in Vercel. This guide will connect it to your frontend and set up `api.onchainweb.app` for your backend.

**Current Status:**
- ✅ Backend: `https://onchainweb-api-production.up.railway.app` (LIVE)
- ✅ Frontend: Auto-generated Vercel URL (working, but not custom domain yet)
- ⏳ Frontend should use: `https://onchainweb.app`
- ⏳ Backend should use: `https://api.onchainweb.app`

---

## Step 1: Add onchainweb.app to Frontend (Vercel)

### Option A: Using Vercel CLI (From Terminal)

```bash
npx vercel domains add onchainweb.app
```

This will automatically handle DNS configuration if your domain is already in Vercel.

### Option B: Using Vercel Dashboard

1. Go to: https://vercel.com/dashboard/onchainweb/moekha125-a11y
2. Click **Settings** → **Domains**
3. Click **Add Domain**
4. Enter: `onchainweb.app`
5. Vercel will auto-configure if domain is already managed in your account

**Expected Result:** Domain shows "Valid" ✅

---

## Step 2: Add api.onchainweb.app to Backend (Railway)

### Step 2a: Connect Railway CLI to Your Project

```bash
# Make sure you're logged in
railway login

# Link to your project
railway link

# Select: onchainweb-api project
```

### Step 2b: Add the Custom Domain

```bash
railway domains add api.onchainweb.app
```

**Output will show:**
```
Domain: api.onchainweb.app
CNAME: <some-railway-generated-value>
```

### Step 2c: Add DNS Record

Railway will provide a CNAME record. Since you own the domain in Vercel, you need to add this CNAME record:

**If using Vercel Domains:**
1. Go to: https://vercel.com/dashboard/onchainweb
2. Click on domain: `onchainweb.app`
3. Click **Records** or **DNS**
4. Add a new CNAME record:
   - **Name:** `api`
   - **Type:** `CNAME`
   - **Value:** (whatever Railway shows)
   - **TTL:** `3600`

**Wait 5-10 minutes for DNS to propagate.**

---

## Step 3: Update Frontend Environment Variable

Once domain is configured, update the API URL in Vercel:

```bash
npx vercel env set VITE_API_URL "https://api.onchainweb.app/api" --prod
```

Or via dashboard:
1. Go to: https://vercel.com/dashboard/onchainweb/moekha125-a11y
2. Click **Settings** → **Environment Variables**
3. Find `VITE_API_URL`
4. Edit to: `https://api.onchainweb.app/api`
5. Click **Save**

---

## Step 4: Redeploy Frontend

After updating env var:

```bash
npx vercel --prod --confirm
```

Wait for deployment to complete (2-3 minutes).

---

## Step 5: Verify Everything Works

### Test Frontend
```bash
curl -s https://onchainweb.app | head -20
# Should show HTML (not error page)
```

### Test Backend Health
```bash
curl https://api.onchainweb.app/health
# Should show: {"status":"ok"}
```

### Test Registration
```bash
curl -X POST https://api.onchainweb.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123","username":"testuser"}'
# Should show token and user data
```

---

## Troubleshooting

### Domain not working after 10 minutes

**Check DNS propagation:**
```bash
# Check if CNAME is resolving
nslookup api.onchainweb.app

# Check Vercel DNS
dig onchainweb.app
```

**Common Issues:**
- DNS changes take 5-15 minutes to propagate globally
- Clear browser cache: `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
- Try in Incognito/Private window

### 502 Bad Gateway on api.onchainweb.app

**Causes:**
- DNS not propagated yet (wait 10 more minutes)
- Railway domain not fully initialized (wait 2 minutes)
- Backend not running (check `railway logs`)

**Check Railway status:**
```bash
railway logs -f
```

### Vercel showing "failed deployment"

**Solution:**
1. Check build output: https://vercel.com/dashboard/onchainweb/moekha125-a11y
2. Look for error message
3. Common fixes:
   - `npm cache clean --force` then redeploy
   - Check if environment variables are set correctly
   - Verify no syntax errors in `vite.config.js`

---

## Current Production URLs (Auto-Generated)

Use these while domain setup is in progress:

```
Frontend: https://moekha125-a11y-onchainweb.vercel.app
Backend: https://onchainweb-api-production.up.railway.app/api
```

**These will keep working even after custom domain is set up!**

---

## DNS Records Reference

### Required Records

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | api | (Railway's provided value) | 3600 |
| (Optional) CNAME | www | (Vercel's value) | 3600 |

### How to Check Records

```bash
# View all DNS records for domain
dig onchainweb.app ANY

# Check specific subdomain
dig api.onchainweb.app

# Check CNAME specifically
dig api.onchainweb.app CNAME
```

---

## After Successful Setup

Once everything is working:

### Update Your Application
- Frontend automatically uses `VITE_API_URL` from env var ✅
- No code changes needed

### Update Documentation
- Update README.md with custom domain URLs
- Update API documentation
- Update deployment guide

### Monitor Health
```bash
# Monitor backend logs
railway logs -f

# Monitor frontend errors
# Check Vercel dashboard

# Test health endpoints periodically
curl https://onchainweb.app
curl https://api.onchainweb.app/health
```

---

## Quick Commands Reference

```bash
# Add domain to Vercel
npx vercel domains add onchainweb.app

# Add domain to Railway
railway domains add api.onchainweb.app

# Update environment variable
npx vercel env set VITE_API_URL "https://api.onchainweb.app/api" --prod

# Redeploy frontend
npx vercel --prod --confirm

# Check Railway logs
railway logs -f

# Check DNS records
dig api.onchainweb.app
```

---

**Status:** 🚀 Ready for custom domain configuration

**Next Steps:**
1. Add `onchainweb.app` to Vercel
2. Add `api.onchainweb.app` to Railway  
3. Configure DNS records
4. Update env var
5. Redeploy
6. Verify all endpoints work

*Last updated: December 23, 2025*
