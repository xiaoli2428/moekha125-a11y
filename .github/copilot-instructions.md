# Copilot Instructions for Onchainweb

Full-stack DeFi trading platform: React frontend (Vite), Express/Supabase backend, binary options trading, wallet management, and AI arbitrage.

## Architecture Overview

**Frontend** (`src/`) — React 18 + Vite + Tailwind:
- `App.jsx`: Router with lazy-loaded pages (LoginPage eager, all others via `React.lazy()`)
- `pages/`: LoginPage, DappPage, Admin, BinaryTrading, Wallet, Support, Market, News, Account, Settings, Referral, AssetHistory
- `components/`: SideMenu, BottomNav, WalletConnect, CustomerService, ProfileDropdown, MultiWalletConnect
- `services/api.js`: Centralized API client (authAPI, walletAPI, tradingAPI, supportAPI, adminAPI, arbitrageAPI)
- Code splitting: vendor chunks (react, ethers, @web3modal) in `vite.config.js`

**Backend** (`server/`) — Node.js + Express ES modules:
- `index.js`: Route registration + background job loops (trade settlement every 10s, arbitrage every 30s)
- `routes/`: auth, wallet, trading, support, admin, arbitrage, kyc, chat, coins, market, telegram
- `controllers/`: Business logic (authController, walletController, tradingController, arbitrageController, kycController, etc.)
- `middleware/auth.js`: JWT verification + role guards (`requireAdmin`, `requireMaster`)
- `config/database.js`: Supabase client (service role, no auto-refresh)

**Database** (Supabase PostgreSQL) — Schema files in `server/database/`:
- `schema.sql`: Core tables (users, wallets, transactions, binary_trades, support_tickets)
- `deposit_addresses_and_coins.sql`, `kyc_tables.sql`, `trading_levels.sql`, `master_account.sql`

**Vercel Serverless API** (`api/`) — Edge functions (optional, used in Vercel deployment):
- `api/health.js`: Health check endpoint
- `api/auth/`: login, register, profile, wallet-login
- `api/wallet/`: transactions, deposit-addresses
- `api/admin/`: deposit-addresses management

**Reference** — `fast-homepage/`: TypeScript + React Query + PWA (reference implementation; not currently primary)

## Development Workflow

```bash
# Backend (watch mode auto-reload)
cd server && npm run dev           # Port 3001

# Frontend (Vite dev server)
npm run dev                        # Port 5173

# Build frontend
npm run build                      # Outputs to dist/

# Backend production
cd server && npm start             # Port 3001
```

No test suite. Backend uses `node --watch` for auto-reload. Supabase schemas already deployed.

## API Communication Pattern

All frontend calls use `src/services/api.js` wrapper (auto-injects Bearer token from localStorage):

```javascript
import { authAPI, walletAPI, tradingAPI, adminAPI } from './services/api';

// Auto-attached: Authorization: Bearer <token>
const user = await authAPI.getProfile();
const txs = await walletAPI.getTransactions(50, 0);
const trades = await tradingAPI.getTrades('all');
const admin = await adminAPI.getDashboard(); // requires admin role
```

API base URL: `import.meta.env.VITE_API_URL || '/api'` (defaults to Vercel serverless `/api/`).

## Vercel Serverless Functions (`api/` directory)

Edge functions automatically deploy to `/api/` path. Handler signature:

```javascript
// api/auth/login.js
export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  // Logic here (JWT generation, Supabase queries)
  return res.status(200).json({ token, user });
}
```

**Available endpoints** (auto-mapped from `api/` directory):
- `POST /api/auth/login` — {email, password} → {token, user}
- `POST /api/auth/register` — {email, password, username}
- `GET /api/auth/profile` — Requires Authorization header
- `POST /api/auth/wallet-login` — Web3 authentication
- `GET /api/wallet/transactions` — User transaction history
- `GET /api/wallet/deposit-addresses` — Crypto addresses
- `GET /api/admin/deposit-addresses` — Admin view
- `GET /api/health` — {status: "ok", timestamp: "..."}

**Config** (`vercel.json`):
- Memory: 256MB, Max duration: 10s per request
- CORS configured for all origins
- SPA routing rewrites non-API paths to `/index.html`

## Backend Request Pattern

**Request flow**: Route → Middleware (`authenticate` + role checks) → Controller → Supabase query

**Example route** (`server/routes/wallet.js`):
```javascript
import { authenticate } from '../middleware/auth.js';
router.post('/deposit', authenticate, walletController.deposit);
// req.user = {id, email, username, role, status} from auth middleware
```

**Role-based access**:
- `authenticate`: Verifies JWT, attaches `req.user`, checks account active status
- `requireAdmin`: admin OR master access
- `requireMaster`: master access only

**Background jobs** (server/index.js):
- `settleExpiredTrades()`: Every 10 sec, settles expired binary trades and updates user balances
- `executeArbitrage()`: Every 30 sec, AI arbitrage bot execution

## Frontend Performance Optimizations

- **Lazy loading**: Only LoginPage imports eagerly; all other pages via `React.lazy()` + `Suspense`
- **Code splitting**: Vendor chunks isolated in vite.config.js (react, ethers, web3modal separate)
- **Web3Modal on-demand**: `src/web3modal/setup.js` only imports heavy deps (ethers, @web3modal) when user clicks "Connect Wallet" — kept out of bundle until needed
- **PageLoader fallback**: Shows while route chunks load
- **No blocking auth**: localStorage token read synchronously, validation in background

## Adding Features

**New API endpoint**:
1. Create controller method in `server/controllers/XyzController.js`
2. Add route in `server/routes/xyz.js` with `authenticate` middleware (add `requireAdmin` if needed)
3. Register route in `server/index.js`: `app.use('/api/xyz', xyzRoutes)`
4. Add client method in `src/services/api.js`

**New frontend page**:
1. Create `src/pages/XyzPage.jsx`
2. Add lazy route in `src/App.jsx` (wrap with `lazy()` + `Suspense`)
3. For authenticated-only pages, check `localStorage.getItem('token')` or use login redirect

**New component**: Add to `src/components/`, import in pages/routes as needed.

## Key Conventions

- **ES modules**: `"type": "module"` in both frontend and server `package.json`
- **No ORM**: Direct Supabase queries (`.from().select().eq()` pattern in controllers)
- **JWT expiry**: 7 days (config: `server/config/jwt.js`)
- **CORS**: Configured for localhost:5173, Vercel deploy URLs, onchainweb.app
- **Styling**: Dark theme (bg-gray-900), gradients (purple-600 to indigo-500), mobile-first, glass-morphism (bg-black/50 backdrop-blur-lg)
- **Routing**: DappPage for web3-heavy features; AppLayout for authenticated dashboard (bottom nav on mobile pages)
- **Database**: Supabase service role (not anon); use direct client queries, no ORM
- **API URLs**: ALWAYS use `src/services/api.js` centralized wrapper (not hardcoded URLs in components)
- **Error responses**: Consistent format `{error: "message"}` in status 400/401/403/500

## Error Handling & Database Patterns

**Backend Supabase queries** — Always destructure and handle errors:
```javascript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single()

if (error) {
  return res.status(400).json({ error: error.message })
}
```

**Response status codes**:
- `400`: Bad request / validation failure
- `401`: Missing/invalid auth token
- `403`: Auth valid but insufficient permissions (e.g., not admin)
- `500`: Server error (log details, don't expose to client)

**Graceful degradation**: Supabase client in `server/config/database.js` throws only when actually used (not instantiation).

## Web3 Integration

**Web3Modal lazy loading**: Heavy deps (ethers, @web3modal) are excluded from build optimizations. They're only loaded when:
1. User navigates to DappPage (eager import) or
2. User clicks "Connect Wallet" button (triggers lazy dynamic import in `src/web3modal/setup.js`)

**Key files**:
- `src/pages/DappPage.jsx`: Eager import (wallet connect screen)
- `src/web3modal/setup.js`: Dynamic imports + initialization
- `vite.config.js`: Vendor chunk separation for bundle optimization

Never import ethers or @web3modal at module root level in non-DappPage components.

## Environment Variables

**Frontend** (`.env`):
```
VITE_API_URL=http://localhost:3001/api  # Optional; defaults to /api
```

**Backend** (`server/.env`):
```
PORT=3001
NODE_ENV=development
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=random_64_char_string
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

## Critical Development Warnings

⚠️ **API URL Anti-Pattern**: Components across the codebase have hardcoded API URL fallbacks (e.g., `Support.jsx`, `WalletConnect.jsx`, `MultiWalletConnect.jsx`). This is a major issue because during deployment URL changes, you must update multiple files. 

✅ **Solution**: ALL frontend API calls should use `src/services/api.js` centralized wrapper:
```javascript
// ✅ ALWAYS DO THIS
import { walletAPI, tradingAPI } from './services/api'
const txs = await walletAPI.getTransactions()

// ❌ NEVER DO THIS
const API_URL = import.meta.env.VITE_API_URL || 'https://hardcoded-url.app/api'
```

This single source of truth (`api.js`) handles auth token injection, error handling, and respects `VITE_API_URL` environment variable (defaults to `/api` for Vercel).

⚠️ **Other critical patterns**:
- Never import ethers or @web3modal outside of DappPage context (breaks tree-shaking)
- Always use `authenticate` middleware for protected routes
- Check `user.status === 'active'` in auth middleware to prevent suspended accounts
- Never expose sensitive errors to client — log server-side, return generic messages

## Deployment

### Database (Supabase) — Already configured
Schema is deployed. For new migrations, add SQL files to `server/database/` and run in Supabase SQL Editor:
- `schema.sql` — Core tables (users, wallets, transactions, binary_trades, support_tickets)
- `deposit_addresses_and_coins.sql` — Crypto deposit addresses
- `kyc_tables.sql` — KYC verification
- `trading_levels.sql` — User trading tiers
- `master_account.sql` — Master role setup

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Set framework: Vite
5. Environment variables:
```env
VITE_API_URL=https://your-backend-domain.com/api  # Optional; only needed if using separate backend
```

If `VITE_API_URL` is not set, frontend automatically uses Vercel's `/api/` serverless functions.

**SPA routing** is auto-configured in `vercel.json` (all non-API requests → `/index.html`).

### Backend (Express.js on Railway or Render)

**Railway**:
1. Connect GitHub
2. Set root directory: `server`
3. Set startup command: `npm start`
4. Environment variables (see Backend section above)

**Render**:
1. Connect GitHub
2. Select `render.yaml` for auto-config (already in repo)
3. Add environment variables at deployment time

**Required env vars**:
```env
PORT=3001
NODE_ENV=production
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
JWT_SECRET=random_64_char_string
FRONTEND_URL=https://your-app.vercel.app  # Allow CORS from frontend
```

### Vercel Serverless Functions (`api/` directory)
If deploying both frontend and API on Vercel (no separate backend):

1. Vercel auto-deploys `/api/*.js` functions
2. Environment variables needed:
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=random_64_char_string
```

3. Functions config in `vercel.json`:
   - Memory: 256MB per function
   - Timeout: 10 seconds max
   - CORS: Enabled for all origins

**Deployment choice**:
- **Vercel serverless only**: Fast, simple, no separate backend needed (uses `api/` functions)
- **Express backend + Vercel frontend**: More control, background jobs (trade settlement, arbitrage), better for complex business logic
## Debugging Deployment URL Issues

If API calls fail after deployment, follow this checklist:

1. **Check VITE_API_URL environment variable**:
   - Vercel frontend: Set `VITE_API_URL=https://your-backend-url.com/api` in Vercel Environment Variables
   - If not set, frontend defaults to `/api` (works only if backend is on same domain)
   - View current value in browser console: `import.meta.env.VITE_API_URL`

2. **Verify centralized API wrapper is used**:
   ```bash
   # Search for hardcoded API URLs (should find none in recent code)
   grep -r "const API_URL = import.meta.env" src/
   # All calls should use: import { authAPI, walletAPI, ... } from '../services/api'
   ```

3. **Check backend is responding**:
   ```bash
   curl https://your-backend-domain.com/api/health
   # Should return: {"status":"ok"}
   ```

4. **CORS issues**: Backend sets `Access-Control-Allow-Origin: *` in `server/index.js`. If still blocked:
   - Check browser DevTools → Network tab for CORS error details
   - Verify `CORS` middleware is before routes: `app.use(cors())`

5. **Token authentication fails**: Check if localStorage has `token`:
   ```javascript
   // In browser console
   localStorage.getItem('token')  // Should have JWT
   // If missing, user isn't logged in
   ```

6. **Specific endpoint not found**:
   - Check route registration in `server/index.js` (e.g., `app.use('/api/support', supportRoutes)`)
   - Verify route file exists (e.g., `server/routes/support.js`)
   - Check middleware is applied: `router.use(authenticate)` or specific route guards