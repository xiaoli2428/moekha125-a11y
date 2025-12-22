# Copilot Instructions for Onchainweb

Full-stack DeFi trading platform with React frontend, Express/Supabase backend, and Web3 wallet integration.

## Architecture Overview

```
src/                  # Main React frontend (Vite + Tailwind)
├── pages/            # Route components (LoginPage, DappPage, Admin, etc.)
├── components/       # UI components (WalletConnect, CustomerService, etc.)
├── services/api.js   # Centralized API client (authAPI, walletAPI, tradingAPI)
└── web3modal/setup.js # Lazy-loaded Web3Modal (heavy deps only on wallet connect)

server/               # Express.js backend (ES modules)
├── controllers/      # Business logic (auth, trading, wallet, admin)
├── routes/           # API route definitions (/api/auth, /api/wallet, etc.)
├── middleware/auth.js # JWT auth + role guards (requireAdmin, requireMaster)
├── config/database.js # Supabase client setup
└── database/schema.sql # PostgreSQL schema (run in Supabase SQL Editor)

fast-homepage/        # Performance-optimized frontend (TypeScript + React Query)
                      # INTENDED TO REPLACE main src/ frontend - uses multicall, lazy loading

api/                  # Vercel Serverless Functions (edge deployment alternative)
```

## Development Workflow

```bash
# Terminal 1: Backend (port 3001)
cd server && npm run dev

# Terminal 2: Frontend (port 5173)
npm run dev

# fast-homepage alternative (port 4173)
cd fast-homepage && npm run dev
```

**No test infrastructure exists.** Backend uses `node --watch` for auto-reload.

## Deployment

### Database (Supabase) — Already configured
Schema is deployed. For new migrations, add SQL files to `server/database/` and run in Supabase SQL Editor:
- `schema.sql` — Core tables (users, transactions, binary_trades, support_tickets)
- `deposit_addresses_and_coins.sql` — Crypto deposit addresses
- `kyc_tables.sql` — KYC verification
- `trading_levels.sql` — User trading tiers
- `master_account.sql` — Master role setup

### Backend (Railway or Render)
```bash
# Railway: Connect GitHub, set root directory to "server"
# Render: Use render.yaml for auto-config
```
**Required env vars:**
```env
PORT=3001
NODE_ENV=production
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
JWT_SECRET=random_64_char_string
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (Vercel)
- Framework: Vite, Output: `dist`
- Set `VITE_API_URL` only if using separate backend (Railway/Render)
- If omitted, uses Vercel Serverless `/api/` routes automatically
- SPA routing configured in `vercel.json`

**Required Vercel env vars (for serverless API):**
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=random_64_char_string
```

### Vercel Serverless API (`/api/` directory)
Available endpoints (edge functions, no separate backend needed):
- `/api/health` — Health check
- `/api/auth/login`, `/api/auth/register`, `/api/auth/profile`
- `/api/auth/wallet-login` — Web3 wallet authentication
- `/api/wallet/transactions`, `/api/wallet/deposit-addresses`
- `/api/admin/deposit-addresses`

## Core API Reference

### Authentication
```bash
POST /api/auth/register  # {email, password, username}
POST /api/auth/login     # {email, password} → returns {token, user}
GET  /api/auth/profile   # Requires: Authorization: Bearer <token>
```

### Wallet Operations
```bash
POST /api/wallet/deposit     # {amount}
POST /api/wallet/withdraw    # {amount, address, network, coin_symbol}
POST /api/wallet/transfer    # {toUsername, amount}
GET  /api/wallet/transactions
```

### Binary Trading
```bash
POST /api/trading/place  # {pair, direction: "up"|"down", amount, duration}
GET  /api/trading        # ?status=pending|win|loss|all
```

### Admin (requires admin/master role)
```bash
GET   /api/admin/dashboard        # Platform stats
GET   /api/admin/users            # All users
PATCH /api/admin/users/:id/balance  # {amount, operation: "add"|"subtract"}
PATCH /api/admin/users/:id/status   # {status: "active"|"suspended"|"banned"}
```

### Health Check
```bash
curl https://your-backend/api/health  # {"status":"ok","timestamp":"..."}
```

## Key Integration Patterns

### Performance Optimizations (Homepage Speed)
- **Lazy loading**: All pages except `LoginPage` use `React.lazy()` - see `src/App.jsx`
- **Code splitting**: `vite.config.js` splits vendor chunks (react, ethers, web3modal)
- **Web3 on-demand**: `src/web3modal/setup.js` only loads when user clicks "Connect Wallet"
- **Suspense fallback**: `PageLoader` component shows while chunks load
- **No blocking auth**: Auth state reads from localStorage first, validates token in background

### Frontend-Backend Communication
All API calls via `src/services/api.js`. Token stored in localStorage:
```javascript
import { authAPI, walletAPI, tradingAPI } from './services/api';
const profile = await authAPI.getProfile();  // Auto-attaches Bearer token
```

### Web3 Integration
Web3Modal is **lazy-loaded** to keep initial page fast:
```javascript
// In src/web3modal/setup.js - only imported on "Connect Wallet" click
const { createWeb3Modal } = await import('@web3modal/ethers5/react');
```

### Background Jobs (server/index.js)
- Trade settlement: every 10 seconds (`settleExpiredTrades`)
- AI arbitrage: every 30 seconds (`executeArbitrage`)

## Adding Features

### New API Endpoint
1. Create controller in `server/controllers/`
2. Add route in `server/routes/`, use `authenticate` middleware
3. Register in `server/index.js`: `app.use('/api/newroute', newRoutes)`
4. Add client method in `src/services/api.js`

### New Frontend Page
1. Create in `src/pages/NewPage.jsx`
2. Add route in `src/App.jsx` Routes block
3. For authenticated pages, check `localStorage.getItem('token')`

## Styling Conventions
- **Theme**: Dark (`bg-gray-900`), gradients (`from-purple-600 to-indigo-500`)
- **Colors**: `tailwind.config.cjs` - `primary: #6EE7B7`, `accent: #7C3AED`
- **Pattern**: Mobile-first with `md:` breakpoint, glass-morphism (`bg-black/50 backdrop-blur-lg`)

## Role System
- `user`: Standard access
- `admin`: User management, ticket responses
- `master`: Full control (arbitrage settings, balance modifications)

Middleware: `requireAdmin`, `requireMaster` in `server/middleware/auth.js`

## Constraints
- ES modules throughout (`"type": "module"` in both package.json files)
- No ORMs - direct Supabase client queries
- JWT tokens expire in 7 days (configurable in `server/config/jwt.js`)
