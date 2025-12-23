# Quick Reference: Vercel-Only Backend

## 🔗 All 11 Routes Now on Vercel Serverless

### Authentication Routes
```
POST   /api/auth/register          Create account
POST   /api/auth/login             Login with email
POST   /api/auth/wallet-login      Login with crypto wallet
GET    /api/auth/profile           Get user profile
```

### Wallet Routes
```
GET    /api/wallet/transactions    Transaction history
GET    /api/wallet/deposit-addresses  Crypto addresses
POST   /api/wallet/deposit         Add funds
POST   /api/wallet/withdraw        Remove funds
POST   /api/wallet/transfer        Send to user
```

### Trading Routes
```
POST   /api/trading/place          Place binary trade
GET    /api/trading                Get user trades
GET    /api/trading/:id            Get trade details
```

### Support Routes
```
POST   /api/support                Create ticket
GET    /api/support                List tickets
GET    /api/support/:id            Get ticket
POST   /api/support/:id/responses  Reply to ticket
PATCH  /api/support/:id/status     Change status (admin)
```

### Admin Routes
```
GET    /api/admin/dashboard        Dashboard stats
GET    /api/admin/users            List users
GET    /api/admin/users/:id        User details
PATCH  /api/admin/users/:id/status Update status
GET    /api/admin/trades           All trades
GET    /api/admin/transactions     All transactions
GET    /api/admin/support-tickets  All tickets
POST   /api/admin/deposit-addresses Manage addresses
```

### Arbitrage Routes
```
POST   /api/arbitrage/settings     Create settings
GET    /api/arbitrage/settings     List settings
PATCH  /api/arbitrage/settings/:id/toggle  Toggle
GET    /api/arbitrage/trades       Get trades
```

### KYC Routes
```
POST   /api/kyc/submit             Submit KYC
GET    /api/kyc/status             Get status
```

### Chat Routes
```
GET    /api/chat/messages          Get messages
POST   /api/chat/messages          Send message
GET    /api/chat/unread            Unread count
GET    /api/chat/admin/all         Admin: all chats
GET    /api/chat/admin/:userId     Admin: user messages
POST   /api/chat/admin/:userId     Admin: send reply
```

### Market Routes
```
GET    /api/market/prices          All prices
GET    /api/market/price/:pair     Single price
GET    /api/market/ohlcv/:pair     OHLCV data
GET    /api/market/chart/:pair     24h chart
```

### Coins Routes
```
GET    /api/coins                  Supported coins
GET    /api/coins/deposit-addresses  User addresses
GET    /api/coins/admin/all        Admin: all coins
POST   /api/coins/admin            Create coin
PATCH  /api/coins/admin/:id        Update coin
DELETE /api/coins/admin/:id        Delete coin
```

### Telegram Routes
```
POST   /api/telegram/webhook       Telegram bot webhook
```

### Health Check
```
GET    /api/health                 Service status
```

---

## 🔑 Environment Variables (Set in Vercel)

```env
# REQUIRED
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
JWT_SECRET=random_64_character_string

# OPTIONAL
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

---

## 📁 Key Files

**Shared Libraries** (reusable helpers):
- `/api/lib/supabase.js` - Database client
- `/api/lib/jwt.js` - Token utilities
- `/api/lib/auth.js` - CORS & authentication

**Handler Patterns**:
- `/api/auth/register.js` - Simple single handler
- `/api/trading/index.js` - Multi-route handler (POST, GET, GET/:id)
- `/api/admin/index.js` - Complex admin handler (10+ routes)

---

## 🚀 Deploy Commands

```bash
# Test locally
npm install -g vercel
vercel dev                 # Starts http://localhost:3000

# Deploy to production
vercel --prod              # Interactive deployment
# OR
git push origin main       # Auto-deploy (if configured)
```

---

## ⚡ Important Notes

1. **All routes require CORS headers** ✅ (handled by lib/auth.js)
2. **Protected routes need JWT token** ✅ (Authorization: Bearer <token>)
3. **Rate limiting on auth routes** ✅ (5 attempts per 15 min)
4. **10-second timeout limit** ⚠️ (all routes should complete <2s)
5. **Background jobs not available** ⚠️ (use client polling or Vercel Cron Pro)

---

## 🔄 Request Flow

```
Browser Request
    ↓
Vercel Function
    ↓
/api/lib/auth.js (validate token)
    ↓
Handler Logic
    ↓
Supabase Query
    ↓
Response (JSON)
```

---

## 📚 Testing

```bash
# Test auth
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","username":"testuser"}'

# Test protected route
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/trading

# Test rate limiting (5 failures → blocked)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"x@x.com","password":"x"}'
done
```

---

## 🐛 Debugging

**Check function logs**:
```bash
vercel logs                      # View all function logs
vercel logs /api/auth/login      # View specific route logs
```

**Local testing**:
```bash
vercel dev                       # Run locally with hot reload
# Access at http://localhost:3000/api/...
```

---

**Version**: v1.0.0  
**All Routes**: 11/11 ✅  
**Status**: Production Ready  
**Platform**: Vercel Serverless
