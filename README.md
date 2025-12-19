# Onchainweb - Full Stack Trading Platform

A complete DeFi-style trading platform with wallet management, binary options trading, AI arbitrage, and customer support.

## 🚀 Features

### User Features
- 🔐 **Authentication**: Secure JWT-based auth with registration/login
- 💰 **Wallet Management**: Deposit, withdraw, transfer funds
- 📈 **Binary Trading**: Time-based options trading with 85% payout
- 🎫 **Customer Support**: Create and track support tickets
- 📊 **Transaction History**: Complete audit trail of all operations
- 👤 **User Profile**: Balance, credit score, account management

### Admin Features
- 📊 **Dashboard**: Real-time platform statistics
- 👥 **User Management**: View, suspend, modify user balances
- 🤖 **AI Arbitrage Control**: Configure and monitor automated trading bots
- 💬 **Support Management**: Respond to user tickets
- 📈 **Analytics**: Trade statistics and platform metrics

## 🛠 Tech Stack

### Frontend
- React 18.2.0 + Vite 5.0.0 + Tailwind CSS 3.4.8

### Backend
- Node.js + Express.js
- Supabase (PostgreSQL)
- JWT Authentication + bcrypt

## 📦 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier)

### 1. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd server && npm install && cd ..
```

### 2. Setup Database

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to SQL Editor and run `server/database/schema.sql`
4. Get API credentials from Settings → API

### 3. Configure Environment

Create `server/.env`:
```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=generate_random_64_character_string
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### 4. Run Development

Terminal 1 - Backend:
```bash
cd server && npm run dev
```

Terminal 2 - Frontend:
```bash
npm run dev
```

Open http://localhost:5173

## 🚀 Deployment

See `DEPLOYMENT.md` for complete guide.

**Quick Deploy:**
- Frontend: Vercel
- Backend: Railway or Render  
- Database: Supabase

## 📚 Documentation

- `README.md` - This file
- `server/README.md` - Complete API documentation
- `DEPLOYMENT.md` - Deployment guide
- `.github/copilot-instructions.md` - Development patterns

## 🔒 Security

- Bcrypt password hashing (10 rounds)
- JWT token authentication
- Role-based access control
- Account suspension/banning
- CORS protection
- SQL injection protection
- Transaction audit trail

## 🤖 Background Jobs

- **Trade Settlement**: Every 10 seconds
- **AI Arbitrage**: Every 30 seconds

## 📁 Structure

```
onchainweb/
├── src/                # Frontend
│   ├── components/     # UI components
│   └── services/       # API client
├── server/            # Backend
│   ├── controllers/   # Business logic
│   ├── routes/        # API endpoints
│   ├── middleware/    # Auth
│   ├── config/        # DB & JWT
│   └── database/      # Schema
└── DEPLOYMENT.md      # Deploy guide
```

## 🔧 Environment Variables

**Frontend**: `VITE_API_URL`  
**Backend**: See `server/.env.example`

## 📝 Scripts

Frontend:
- `npm run dev` - Dev server
- `npm run build` - Production build

Backend:
- `npm run dev` - Dev with auto-reload
- `npm start` - Production

## 🐛 Troubleshooting

See `DEPLOYMENT.md` troubleshooting section.

## 📄 License

MIT License

---

Built with ❤️ using React, Node.js, and Supabase
