# 🚀 QUICK START GUIDE - Supabase Setup

## ✅ What's Already Done

- ✅ Frontend dependencies installed
- ✅ Backend dependencies installed  
- ✅ Environment file created (`server/.env`)
- ✅ All code ready to run

## ⚠️ What YOU Need to Do (5 minutes)

### Step 1: Create Supabase Account

**Open in browser:** https://supabase.com

1. Click **"Start your project"**
2. Sign up with **GitHub** (easiest) or email
3. Confirm your email if needed

### Step 2: Create New Project

1. Click **"New Project"** (green button)
2. Fill in the form:
   ```
   Name: onchainweb
   Database Password: [CREATE A STRONG PASSWORD AND SAVE IT!]
   Region: [Choose closest to your location]
   ```
3. Click **"Create new project"**
4. ⏳ Wait ~2 minutes while it sets up

### Step 3: Load Database Schema

1. In your Supabase dashboard, click **"SQL Editor"** (left sidebar, looks like `</>`)
2. Click **"New Query"** button
3. Open the file: `server/database/schema.sql` in VS Code
4. **Copy ALL contents** (Ctrl+A, Ctrl+C)
5. **Paste** into Supabase SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. ✅ You should see: **"Success. No rows returned"**

### Step 4: Get API Credentials

1. Click **"Settings"** (gear icon in left sidebar)
2. Click **"API"** in the settings menu
3. You'll see 3 important values. **Copy each one:**

   **A) Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   
   **B) anon public key** (long string starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   
   **C) service_role secret key** (another long string, click "Reveal" first)
   
   ⚠️ **Keep these safe! Don't share the service_role key publicly**

### Step 5: Configure Backend

**Option A - Interactive (Easiest):**
```bash
./configure-env.sh
```
Then paste your 3 values when prompted.

**Option B - Manual:**
```bash
code server/.env
```
Replace these lines:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

Also change:
```env
JWT_SECRET=generate_random_64_character_string
```
To any random 64+ character string (mash your keyboard!)

### Step 6: Start the Platform! 🎉

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3001
Environment: development
Background jobs started
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

You should see:
```
➜  Local:   http://localhost:5173/
```

**Open browser:** http://localhost:5173

---

## 🧪 Test It Works

Test the backend API:
```bash
curl http://localhost:3001/api/health
```

Should return:
```json
{"status":"ok","timestamp":"2025-12-18T..."}
```

Create your first user:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123","username":"admin"}'
```

Should return a token and user info!

---

## 🎯 Make Your User an Admin

1. Go back to Supabase dashboard
2. Click **"Table Editor"** (left sidebar)
3. Click **"users"** table
4. Find your user (email: admin@test.com)
5. Click the row to edit
6. Change `role` from `user` to `admin`
7. Click **"Save"** (checkmark icon)

Now you have full admin access!

---

## ✨ You're Ready!

Your platform is now running with:
- ✅ User authentication
- ✅ Wallet management (deposit/withdraw/transfer)
- ✅ Binary trading system
- ✅ AI arbitrage bots
- ✅ Customer support tickets
- ✅ Admin dashboard

---

## 🆘 Common Issues

**"Cannot connect to database"**
- Check your credentials in `server/.env` are correct
- Make sure you ran the SQL schema in Supabase
- Verify project isn't paused (Supabase dashboard)

**"Port 3001 already in use"**
```bash
lsof -ti:3001 | xargs kill -9
```

**CORS errors in browser**
- Check `FRONTEND_URL` in `server/.env` is `http://localhost:5173`
- No trailing slash!

---

## 📚 What's Next?

- **API Documentation**: `server/README.md`
- **Deploy to Production**: `DEPLOYMENT.md`
- **Feature Details**: `GETTING_STARTED.md`

---

Need help? All the documentation is in the project! 🚀
