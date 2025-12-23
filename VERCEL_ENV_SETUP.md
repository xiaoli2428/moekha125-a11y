# 🔐 How to Set Environment Variables in Vercel

## Step-by-Step Guide

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. You should see your projects listed

---

### Step 2: Select Your Project
- Find and click on your project (e.g., "moekha125-a11y" or similar)
- You'll enter the project settings page

---

### Step 3: Navigate to Environment Variables
1. Look at the **left sidebar**
2. Click on **Settings** (not Deployments, not Domains - Settings)
3. In the Settings page, find **Environment Variables** on the left menu
4. Click on it

You should now see a page that says "Environment Variables" with an empty list.

---

### Step 4: Add SUPABASE_URL

**Click the "+ Add" button** (top right)

Fill in the form:

| Field | Value |
|-------|-------|
| **Name** | `SUPABASE_URL` |
| **Value** | `https://qatjqymhvbdlrjmsimci.supabase.co` |
| **Scope** | Select: `Production` (or All) |

Then click **"Save"** or **"Add"**

---

### Step 5: Add SUPABASE_SERVICE_KEY

**Click the "+ Add" button again**

Fill in:

| Field | Value |
|-------|-------|
| **Name** | `SUPABASE_SERVICE_KEY` |
| **Value** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhdGpxeW1odmJkbHJqbXNpbWNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA4MDk0MiwiZXhwIjoyMDgxNjU2OTQyfQ.rtHlAII0UxYDml1Hoty7g6Uug7Xu2GoQ-If_nPa9hL8` |
| **Scope** | Select: `Production` (or All) |

Click **"Save"**

---

### Step 6: Add JWT_SECRET

**Click the "+ Add" button one more time**

Fill in:

| Field | Value |
|-------|-------|
| **Name** | `JWT_SECRET` |
| **Value** | `kv+DXcPJWprJ81nZoC0IU/5A2MlUiWyX1nEy06R/Nhq6Nd3Q9TFKsBKlcXmJ2dg+` |
| **Scope** | Select: `Production` (or All) |

Click **"Save"**

---

### Step 7: Verify All 3 Are Set

Your Environment Variables page should now show:

```
✓ SUPABASE_URL = https://qatjqymhvbdlrjmsimci.supabase.co
✓ SUPABASE_SERVICE_KEY = eyJhbGci... (partially shown)
✓ JWT_SECRET = kv+DXcPJ... (partially shown)
```

---

### Step 8: Wait for Deployment

After you add env vars, Vercel will **automatically redeploy** your app.

- You should see a **Deployments** tab show a new build starting
- Wait 2-3 minutes for it to finish
- Once it shows "Ready" ✅, your env vars are live

---

## ✅ Verification

Once deployment is done, test that env vars are working:

```bash
# This should return {"status":"ok"}
curl https://your-app.vercel.app/api/health
```

If you get `{"status":"ok"}` → Environment variables are working! ✅

If you get an error → Check that all 3 env vars are set correctly

---

## 📸 Visual Reference

**Where to click:**

1. https://vercel.com/dashboard → Click your project
2. Click **Settings** (left sidebar)
3. Click **Environment Variables** (left sidebar under Settings)
4. Click **"+ Add"** button
5. Fill in Name, Value, and Scope
6. Click **Save**
7. Repeat for all 3 variables

---

## 🔑 Your Values (Copy-Paste Ready)

**Variable 1 - SUPABASE_URL:**
```
Name: SUPABASE_URL
Value: https://qatjqymhvbdlrjmsimci.supabase.co
```

**Variable 2 - SUPABASE_SERVICE_KEY:**
```
Name: SUPABASE_SERVICE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhdGpxeW1odmJkbHJqbXNpbWNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA4MDk0MiwiZXhwIjoyMDgxNjU2OTQyfQ.rtHlAII0UxYDml1Hoty7g6Uug7Xu2GoQ-If_nPa9hL8
```

**Variable 3 - JWT_SECRET:**
```
Name: JWT_SECRET
Value: kv+DXcPJWprJ81nZoC0IU/5A2MlUiWyX1nEy06R/Nhq6Nd3Q9TFKsBKlcXmJ2dg+
```

---

**After adding all 3 and waiting for deployment, your app will have access to the database and authentication will work!** ✅
