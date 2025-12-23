# OnchainWeb

Full-stack DeFi trading platform featuring binary options trading, wallet management, and AI arbitrage. Built with React (Vite), Express, and Supabase.

## Features

- **Binary Options Trading**: Real-time trading interface with chart integration.
- **AI Arbitrage**: Automated arbitrage trading bot.
- **Wallet Management**: Crypto deposit/withdrawal, transaction history.
- **Web3 Integration**: Wallet connection via Web3Modal & Ethers.js.
- **Admin Dashboard**: User management, trading controls.
- **Secure Auth**: JWT-based authentication with role-based access control (User, Admin, Master).

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Web3**: Ethers.js, Web3Modal
- **Deployment**: Vercel (Frontend + Serverless Functions) or Railway/Render (Full Backend)

## Getting Started

### Prerequisites

- Node.js (v18+)
- Supabase Account (for database)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/xiaoli2428/moekha125-a11y.git
   cd moekha125-a11y
   ```

2. Install dependencies:
   ```bash
   npm install
   cd server && npm install
   ```

### Environment Setup

1. Create a `.env` file in the root directory (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Configure your environment variables:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-key
   JWT_SECRET=your-secure-secret
   VITE_API_URL=http://localhost:3001/api
   ```

### Running Locally

1. **Start the Backend** (in a separate terminal):
   ```bash
   cd server
   npm run dev
   ```
   Server runs on `http://localhost:3001`.

2. **Start the Frontend**:
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`.

## Deployment

### Vercel (Frontend + Serverless API)

This project is configured for Vercel deployment.

1. Import the project to Vercel.
2. Set the Framework Preset to **Vite**.
3. Add Environment Variables in Vercel settings.
4. Deploy!

The `api/` directory contains serverless functions that Vercel will automatically deploy.

### Database Setup

Run the SQL scripts located in `server/database/` in your Supabase SQL Editor to set up the tables:
1. `schema.sql`
2. `deposit_addresses_and_coins.sql`
3. `kyc_tables.sql`
4. `trading_levels.sql`
5. `master_account.sql`

## Project Structure

- `src/`: React Frontend
- `server/`: Express Backend
- `api/`: Vercel Serverless Functions
- `server/database/`: SQL Schema files

## License

[MIT](LICENSE)


