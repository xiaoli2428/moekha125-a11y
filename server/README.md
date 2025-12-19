# Onchainweb Backend Server

Complete backend API for the Onchainweb trading platform.

## Features

- 🔐 **Authentication**: JWT-based auth with bcrypt password hashing
- 💰 **Wallet Management**: Deposit, withdraw, transfer with transaction history
- 📈 **Binary Trading**: Time-based options with win/loss calculation
- 🤖 **AI Arbitrage**: Automated trading bot with configurable settings
- 💬 **Customer Support**: Ticket system with admin responses
- 👑 **Admin Dashboard**: User management, balance control, platform statistics

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + bcrypt
- **Validation**: Zod schemas

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API to get your credentials
4. Go to SQL Editor and run the schema from `database/schema.sql`

### 3. Environment Variables

Create `.env` file in the `server/` directory:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=3001
NODE_ENV=development

# Supabase (get from supabase.com dashboard)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# JWT Secret (generate random string)
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d

# Admin Account
ADMIN_EMAIL=admin@onchainweb.com
ADMIN_PASSWORD=secure_admin_password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 4. Run the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)

### Wallet
- `POST /api/wallet/deposit` - Deposit funds
- `POST /api/wallet/withdraw` - Withdraw funds
- `POST /api/wallet/transfer` - Transfer to another user
- `GET /api/wallet/transactions` - Get transaction history

### Binary Trading
- `POST /api/trading/place` - Place binary trade
- `GET /api/trading` - Get user's trades
- `GET /api/trading/:id` - Get specific trade

### Support
- `POST /api/support` - Create support ticket
- `GET /api/support` - Get user's tickets
- `GET /api/support/:id` - Get ticket details with responses
- `POST /api/support/:id/responses` - Add response to ticket
- `PATCH /api/support/:id/status` - Update ticket status (admin)

### AI Arbitrage (Admin Only)
- `POST /api/arbitrage/settings` - Create arbitrage setting
- `GET /api/arbitrage/settings` - Get all settings
- `PATCH /api/arbitrage/settings/:id/toggle` - Activate/deactivate
- `GET /api/arbitrage/trades` - Get arbitrage trade history

### Admin
- `GET /api/admin/dashboard` - Platform statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user details
- `PATCH /api/admin/users/:id/balance` - Modify user balance
- `PATCH /api/admin/users/:id/status` - Update user status
- `GET /api/admin/tickets` - Get all support tickets

## Example Requests

### Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "username": "johndoe"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Place Binary Trade
```bash
curl -X POST http://localhost:3001/api/trading/place \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "pair": "BTC/USDT",
    "direction": "up",
    "amount": 100,
    "duration": 300
  }'
```

## Background Jobs

The server runs automated tasks:

- **Trade Settlement**: Checks for expired binary trades every 10 seconds and settles them
- **AI Arbitrage**: Executes arbitrage opportunities every 30 seconds for active bots

## Database Schema

See `database/schema.sql` for complete schema. Main tables:

- `users` - User accounts with balances
- `transactions` - All financial transactions
- `binary_trades` - Binary options trades
- `ai_arbitrage_settings` - Bot configurations
- `ai_arbitrage_trades` - Arbitrage trade history
- `support_tickets` - Customer support tickets
- `ticket_responses` - Ticket conversation threads

## Security Notes

- All passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire after 7 days (configurable)
- Admin routes protected by role-based middleware
- User accounts can be suspended/banned by admin
- CORS configured for frontend origin only

## Testing

Health check endpoint:
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-12-18T..."}
```

## Troubleshooting

**Database connection errors:**
- Verify Supabase credentials in `.env`
- Check if your IP is allowed in Supabase dashboard
- Ensure database schema is loaded

**Authentication errors:**
- Check JWT_SECRET is set
- Verify token format: `Bearer <token>`
- Check user status is 'active'

**Port already in use:**
```bash
# Change PORT in .env or kill process
lsof -ti:3001 | xargs kill -9
```

## Deployment

For production deployment (Railway, Render, etc.):

1. Set environment variables in hosting platform
2. Use `npm start` as start command
3. Configure CORS for production frontend URL
4. Enable HTTPS
5. Set `NODE_ENV=production`

## License

MIT
