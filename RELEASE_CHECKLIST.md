curl https://your-app.vercel.app/api/health# Public Release Checklist for Onchainweb

**Last Updated**: December 23, 2025  
**Current Status**: Pre-Release Review

---

## 🔴 BLOCKING ISSUES (Must Fix Before Release)

### 1. **Version Numbers** ❌
- **Current**: Frontend v0.1.0, Server v1.0.0
- **Action**: Bump to v1.0.0 across all packages (consistent versioning)
- **Files**: `package.json`, `server/package.json`
- **Impact**: GitHub releases, npm registry, production tracking

### 2. **Environment Variables** ⚠️
- **Status**: `.env.example` files exist but need final verification
- **Files to check**:
  - `server/.env.example` — Complete ✅
  - Root `.env.example` — Add `VITE_API_URL` example
- **Missing docs**: No guide on which vars are **required** vs **optional**
- **Action**: Document required vs optional vars in DEPLOYMENT.md

### 3. **Hardcoded Values** ⚠️
- **Location**: `src/web3modal/setup.js` line 20
  - `projectId = '8e351899f7e19103239159c134bd210b'` (hardcoded)
- **Action**: Either keep as default OR move to .env if clients need custom values
- **Decision needed**: Is this the official Onchainweb Web3Modal project?

### 4. **Database Schema Deployment** ⚠️
- **Current state**: SQL files exist but not all are documented
- **Files**: `server/database/schema.sql`, `deposit_addresses_and_coins.sql`, `kyc_tables.sql`, `trading_levels.sql`, `master_account.sql`
- **Issue**: Migration files in `migrations/` folder not tracked in DEPLOYMENT.md
- **Action**: 
  1. Test entire `schema.sql` runs without errors on fresh Supabase
  2. Document migration order if dependencies exist
  3. Add step-by-step SQL execution guide

### 5. **Build Testing** ❌
- **Status**: No confirmation `npm run build` works in production
- **Action**: 
  ```bash
  npm ci  # Clean install (production)
  npm run build  # Should create dist/
  ```
- **Expected output**: `dist/` folder with all chunks

### 6. **Error Handling & Logging** ⚠️
- **Current**: `console.error()` statements in APIs (catches errors but no structured logging)
- **Files affected**: `api/auth/login.js`, `api/wallet/transactions.js`, etc.
- **Action**: 
  1. Decide on logging strategy (console, file, service)
  2. Add error codes/types for debugging
  3. Implement rate limiting on auth endpoints

---

## 🟡 CRITICAL ITEMS (Should Have Before Release)

### 7. **CORS Configuration** ⚠️
- **Current**: `server/index.js` lines 27-33 whitelist hardcoded
- **URLs whitelisted**:
  - localhost:5173 (dev)
  - dist-vert-phi.vercel.app (old)
  - moekha125-a11y.vercel.app (current)
  - onchainweb.app (production domain)
- **Action**: 
  - [ ] Update to exact production Vercel URL
  - [ ] Remove localhost:5173 before production
  - [ ] Add environment-based config

### 8. **API Documentation** ⚠️
- **Status**: `server/README.md` exists but missing endpoint examples
- **Current endpoints documented**: ✅ 90%
- **Action**: Add example request/response for each endpoint

### 9. **Security Audit** ⚠️
- **Checklist**:
  - [x] JWT validation in middleware
  - [x] Password hashing with bcrypt
  - [x] Role-based access control (requireAdmin, requireMaster)
  - [ ] SQL injection prevention (using Supabase client - safe)
  - [ ] Rate limiting on auth endpoints (MISSING)
  - [ ] Input validation with Zod (PARTIAL - auth only)
  - [ ] HTTPS enforcement in production (handled by Vercel)
  - [x] JWT secret in environment variables
  - [ ] API key/secret management (if needed)

### 10. **Database Credentials** ⚠️
- **Status**: Service role key used (correct for server)
- **Action**:
  - [x] Confirm using `SUPABASE_SERVICE_KEY` (not anon key)
  - [ ] Document that anon key is NOT needed
  - [ ] Add Row Level Security (RLS) policies if needed

---

## 🟢 READY / VERIFIED

### ✅ Frontend Architecture
- Lazy loading: Only LoginPage eager ✅
- Code splitting configured ✅
- Web3Modal lazy-loaded ✅
- Vite build configured ✅
- Tailwind CSS setup ✅

### ✅ Backend Structure
- Express.js routes organized ✅
- Controllers separate from routes ✅
- Middleware authentication implemented ✅
- Background jobs for trade settlement ✅
- Background jobs for arbitrage ✅

### ✅ Deployment Configuration
- `vercel.json` configured ✅
- `render.yaml` configured ✅
- Vite config optimized ✅
- SPA routing configured ✅

### ✅ Documentation
- README.md complete ✅
- DEPLOYMENT.md comprehensive ✅
- server/README.md detailed ✅
- .github/copilot-instructions.md updated ✅

### ✅ GitHub Repository
- Code of Conduct ✅
- Security policy ✅
- License (add LICENSE file) ⚠️

---

## 📋 PRE-LAUNCH TASKS

### Phase 1: Final Testing (1 day)
- [ ] Run `npm ci && npm run build` on fresh machine
- [ ] Run `cd server && npm ci && npm start` on fresh machine
- [ ] Test auth endpoints with curl
- [ ] Test wallet/trading endpoints with auth
- [ ] Test admin endpoints with admin JWT
- [ ] Verify Supabase schema loads without errors
- [ ] Test frontend connects to local backend
- [ ] Test frontend connects to Vercel backend

### Phase 2: Deployment Staging (1-2 days)
- [ ] Deploy to Vercel (frontend) with production settings
- [ ] Deploy to Railway/Render (backend)
- [ ] Deploy Supabase schema to production project
- [ ] Test end-to-end with staging URLs
- [ ] Verify environment variables are set
- [ ] Check CORS accepts Vercel domain
- [ ] Test user registration → login → trade flow

### Phase 3: Pre-Release Cleanup (1 day)
- [ ] Remove localhost:5173 from CORS
- [ ] Update version numbers to 1.0.0
- [ ] Finalize README.md for public audience
- [ ] Add CONTRIBUTING.md (if accepting PRs)
- [ ] Create CHANGELOG.md with initial release notes
- [ ] Double-check all secrets are NOT in repo
- [ ] Update package.json description and keywords

### Phase 4: Public Release (1 day)
- [ ] Create GitHub release with release notes
- [ ] Publish to npm (if applicable)
- [ ] Update landing page / website
- [ ] Set up analytics/monitoring
- [ ] Create user documentation/tutorials
- [ ] Set up support channels (Discord, email, GitHub issues)

---

## 🔐 Security Checklist Before Release

- [x] No API keys in code
- [x] No plaintext passwords in docs
- [x] Environment variables for all secrets
- [ ] Rate limiting on auth endpoints
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Supabase handles)
- [ ] XSS protection (React + Tailwind)
- [ ] CSRF token handling (if needed)
- [ ] HTTPS forced (Vercel/Railway handles)
- [ ] Secrets not logged to console
- [ ] JWT expiry set (7 days)

---

## 📦 What's Missing for v1.0.0

### Optional but Recommended
1. **Unit tests** for critical functions (auth, trading calculations)
2. **Integration tests** for API endpoints
3. **End-to-end tests** for user flows
4. **Monitoring/Logging** (Sentry, LogRocket, etc.)
5. **Analytics** (Mixpanel, Amplitude, Plausible)
6. **Load testing** before scaling
7. **Database backups** setup in Supabase
8. **CDN setup** for static assets (Vercel auto-handles)

### Can Add Post-Launch
- [ ] WebSocket for real-time updates
- [ ] Mobile app (React Native/Flutter)
- [ ] GraphQL API (currently REST)
- [ ] Streaming charts/TradingView integration
- [ ] Deposit/withdrawal gate integrations

---

## 🚀 Go/No-Go Decision Matrix

| Item | Status | Blocker? | Notes |
|------|--------|----------|-------|
| Frontend builds | ⚠️ Not tested | YES | Test before release |
| Backend runs | ✅ Ready | NO | Works locally |
| Database schema | ⚠️ Needs test | YES | Test on fresh Supabase |
| Auth working | ✅ Ready | NO | JWT + bcrypt solid |
| API responses | ⚠️ Needs docs | NO | Can add later |
| Deployment configs | ✅ Ready | NO | vercel.json, render.yaml OK |
| Environment setup | ⚠️ Needs clarity | YES | Clarify required vs optional |
| Security | ⚠️ Audit needed | YES | Check rate limiting, validation |
| Documentation | ✅ 90% Done | NO | Good enough for v1.0 |
| Testing | ❌ None | NO | Not blocking, post-v1.0 OK |

---

## 📞 Next Steps

**Do first (blocking)**:
1. Update package.json versions to 1.0.0
2. Test `npm run build` → `dist/` creation
3. Test Supabase schema on fresh project
4. Update CORS for production domain
5. Add .env setup documentation

**Do second (important)**:
6. Add rate limiting to auth endpoints
7. Add input validation to all endpoints
8. Document all hardcoded values
9. Final end-to-end testing

**Can defer post-launch**:
10. Add unit tests
11. Set up monitoring
12. Add analytics
