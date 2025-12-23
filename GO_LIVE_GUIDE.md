# 🎯 QUICK START: Go Live in 30 Minutes

**You're 30 minutes away from public launch.** Follow these 5 simple steps.

---

## 🔍 Step 1: Verify Vercel Env Vars (5 min)

**In Vercel Dashboard:**
1. Go: https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Check these 3 exist:
   - `SUPABASE_URL` ✅
   - `SUPABASE_SERVICE_KEY` ✅
   - `JWT_SECRET` ✅

**If missing**: Add them now. Wait 2-3 min for deployment.

---

## 🗄️ Step 2: Verify Database (5 min)

**In Supabase SQL Editor**, run one verification query:

```sql
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public';
```

**Expected**: 16+ tables ✅

If less, you missed running some SQL files. Go back and run:
- File 3: `supabase-sql-3-kyc.sql`
- File 4: `supabase-sql-4-trading-levels.sql`

---

## 🧪 Step 3: Quick Test (5 min)

**Replace `YOUR-APP-URL` with your actual Vercel URL** (e.g., `https://myapp-xyz.vercel.app`)

```bash
# Test 1: Health check
curl YOUR-APP-URL/api/health

# Test 2: Register
curl -X POST YOUR-APP-URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","username":"testuser"}'

# Test 3: Check you got a JWT token in response
# If yes → All working! ✅
```

**If all 3 return success**: Go to Step 4 ✅

**If any fail**: Check [Troubleshooting](#troubleshooting) below ❌

---

## 📢 Step 4: Announce Launch (5 min)

Tell your users! Options:

1. **Email**: Send announcement to user list
2. **Social Media**: Post on Twitter, LinkedIn, Discord
3. **Landing Page**: Update homepage with "Now Live!"
4. **Documentation**: Share API docs link

**Sample announcement**:
```
🎉 Onchainweb v1.0.0 is LIVE!

Binary options trading, crypto wallet management, and AI arbitrage 
are now available to the public.

Visit: https://your-app.vercel.app
Start trading now!
```

---

## 📊 Step 5: Monitor (Ongoing)

**First Hour**: Watch these for issues

1. **Vercel Logs**: https://vercel.com/dashboard → Functions → Logs
2. **Supabase Logs**: https://supabase.com/dashboard → Logs
3. **Error Rate**: Should be 0% for first users
4. **Response Time**: Should be <200ms average

**If errors appear**: Check the Troubleshooting section below

---

## ⚠️ Troubleshooting

### Health check returns 500
**Cause**: Env vars not set  
**Fix**: Check Vercel Settings → Environment Variables

### Register/Login returns "User not found"
**Cause**: Database not loaded  
**Fix**: Run SQL files 1-5 in Supabase SQL Editor

### Profile returns 401
**Cause**: Invalid JWT token  
**Fix**: Get fresh token from login, copy exact token to curl header

### Trading returns "relation 'trading_levels' does not exist"
**Cause**: File 4 didn't run  
**Fix**: Copy `supabase-sql-4-trading-levels.sql` and run in Supabase

### API returns timeout errors
**Cause**: Supabase connection slow  
**Fix**: Wait 1 min, check Supabase status page

---

## ✅ Success Criteria

Your app is **LIVE** when:

✅ Health check returns `{"status":"ok"}`  
✅ Register creates user and returns JWT  
✅ Login works and returns valid token  
✅ Profile returns user data  
✅ Vercel logs show no errors  
✅ Supabase has 16+ tables  

---

## 📚 Full Documentation

For detailed info, see:
- **Release Notes**: RELEASE_NOTES_v1.0.0.md
- **Testing Guide**: TEST_PRODUCTION_API.md
- **API Reference**: VERCEL_API_REFERENCE.md
- **Deployment Guide**: VERCEL_DEPLOYMENT_READY.md

---

## 🎉 You're Live!

**Congratulations! Your app is now public!**

- **Frontend**: https://your-app.vercel.app
- **API**: https://your-app.vercel.app/api
- **Health Check**: https://your-app.vercel.app/api/health

**Now**:
1. Share the link with users
2. Monitor logs for errors
3. Respond to support requests
4. Plan v1.1.0 features

---

**Version**: 1.0.0  
**Status**: 🟢 PRODUCTION READY  
**Ready to Launch**: YES! 🚀
