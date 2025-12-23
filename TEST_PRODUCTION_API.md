# 🧪 Testing Your Live API

**Status**: Code deployed ✅ | Build ready ✅ | Database pending ⏳  
**Next**: Verify env vars set + database loaded, then test

---

## 📝 Quick Checklist Before Testing

**Have you done these?**

- [ ] 1. Set 3 env vars in Vercel Dashboard:
  - SUPABASE_URL
  - SUPABASE_SERVICE_KEY
  - JWT_SECRET

- [ ] 2. Run all 5 SQL files in Supabase SQL Editor (in SUPABASE_SETUP_GUIDE.md)

- [ ] 3. Verify database has 16+ tables (run verification query in Supabase)

**If all checked ✅**, continue below. If not, finish those first!

---

## 🚀 Test Your Production API

**Your API URL**: `https://your-app.vercel.app` (replace with your actual Vercel URL)

### 1️⃣ Health Check (No Auth Needed)

Test if your API is alive:

```bash
curl https://your-app.vercel.app/api/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-12-23T..."
}
```

**Status**: 🟢 API is running

---

### 2️⃣ Register New User

Create a test account:

```bash
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "username": "testuser"
  }'
```

**Expected Response**:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "test@example.com",
    "username": "testuser",
    "role": "user",
    "balance": "0.00000000"
  }
}
```

**Status**: 🟢 User created + JWT token received

---

### 3️⃣ Login (Get JWT Token)

Use your credentials:

```bash
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

**Expected Response** (same as above with token):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

**⚠️ Save this token!** You'll need it for protected routes.

**If login fails**: 
- Check email/password are correct
- Wait 2 min for Vercel env vars to propagate
- Check Vercel Functions logs: Vercel Dashboard → Functions → Logs

---

### 4️⃣ Get Your Profile (Protected Route)

This requires the JWT token from step 3:

```bash
# Replace TOKEN with your actual JWT from step 3
TOKEN="eyJhbGciOiJIUzI1NiIs..."

curl -H "Authorization: Bearer $TOKEN" \
  https://your-app.vercel.app/api/auth/profile
```

**Expected Response**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "test@example.com",
  "username": "testuser",
  "role": "user",
  "balance": "0.00000000",
  "status": "active"
}
```

**Status**: 🟢 Authentication working ✅

---

### 5️⃣ Get Deposit Addresses

Get list of available crypto deposit addresses:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://your-app.vercel.app/api/wallet/deposit-addresses
```

**Expected Response**:
```json
{
  "addresses": [
    {
      "symbol": "BTC",
      "network": "Bitcoin",
      "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
    },
    {
      "symbol": "ETH",
      "network": "ERC20",
      "address": "0x742d35Cc6634C0532925a3b844Bc1e7595f88c1C"
    }
    ...
  ]
}
```

**Status**: 🟢 Wallet data accessible ✅

---

## 🔄 Complete Testing Sequence (Copy & Paste)

Save this as `test-production.sh` and run it:

```bash
#!/bin/bash

API="https://your-app.vercel.app"  # 👈 Replace with your Vercel URL

echo "🧪 Testing Production API"
echo "Target: $API"
echo ""

# 1. Health check
echo "1️⃣ Health Check..."
curl -s $API/api/health | jq '.'
echo ""

# 2. Register
echo "2️⃣ Register User..."
REG_RESPONSE=$(curl -s -X POST $API/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test'$(date +%s)'@example.com",
    "password": "TestPassword123!",
    "username": "testuser'$(date +%s)'"
  }')
echo "$REG_RESPONSE" | jq '.'
TOKEN=$(echo "$REG_RESPONSE" | jq -r '.token')
echo "💾 Token saved: ${TOKEN:0:20}..."
echo ""

# 3. Login
echo "3️⃣ Login User..."
LOGIN_RESPONSE=$(curl -s -X POST $API/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test'$(date +%s)'@example.com",
    "password": "TestPassword123!"
  }')
echo "$LOGIN_RESPONSE" | jq '.'
echo ""

# 4. Get Profile
echo "4️⃣ Get Profile..."
curl -s -H "Authorization: Bearer $TOKEN" \
  $API/api/auth/profile | jq '.'
echo ""

# 5. Get Wallet
echo "5️⃣ Get Wallet Transactions..."
curl -s -H "Authorization: Bearer $TOKEN" \
  $API/api/wallet/transactions | jq '.'
echo ""

echo "✅ All tests complete!"
```

**To run**:
```bash
chmod +x test-production.sh
./test-production.sh
```

---

## 🐛 Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Connection refused` | Vercel URL not deployed yet | Wait 2-3 min, check Vercel dashboard |
| `401 Unauthorized` | Invalid/expired JWT token | Get fresh token with login request |
| `500 Internal Server` | Env vars not set | Set SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET in Vercel |
| `FATAL: remaining connection slots reserved for non-replication superuser connections` | Database connection pool full | Supabase connection issue, wait 1 min |
| `relation 'users' does not exist` | Database schema not loaded | Run SUPABASE_SETUP_GUIDE.md (5 SQL files) |

---

## 📊 Performance Targets

After testing, check Vercel logs for:

| Metric | Target | Check |
|--------|--------|-------|
| **Response Time** | < 200ms | Vercel Functions logs |
| **Cold Start** | < 500ms | First request to function |
| **Database Query** | < 100ms | Supabase performance |
| **Error Rate** | 0% | Vercel error tracking |

---

## ✅ Success Criteria

**You're LIVE when:**

- ✅ Health check returns 200
- ✅ Registration creates user + returns JWT
- ✅ Login returns JWT token
- ✅ Profile endpoint returns user data with valid token
- ✅ Wallet endpoints return data
- ✅ No 500 errors in logs

---

## 📈 Next Steps After Testing

1. **Test other routes**:
   - Trading: `POST /api/trading/place`
   - Support: `POST /api/support/create`
   - Admin: `GET /api/admin/dashboard` (requires admin role)

2. **Monitor production**:
   - Vercel Dashboard → Functions → Logs
   - Supabase Dashboard → Logs
   - Set up alerts for errors

3. **Production hardening**:
   - Change master account password
   - Enable RLS policies in Supabase
   - Set up rate limiting alerts

---

**Your Production API is ready! 🚀**

Test it now and let me know if you hit any issues.
