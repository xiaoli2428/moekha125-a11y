# 🗄️ Supabase Database Setup Guide

**Status**: Ready to Deploy  
**Time**: ~5 minutes  
**Project ID**: qatjqymhvbdlrjmsimci  

---

## ✅ Step 1: Access Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project: **qatjqymhvbdlrjmsimci**
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**

---

## ✅ Step 2: Run Schema Files (In Order!)

**IMPORTANT**: Run these **5 SQL files in this exact order**. Each must complete before the next.

### 🔷 File #1: Core Schema (Users, Trades, Tickets)

Copy and paste this entire block into SQL Editor → Click **Run**:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'master')),
  balance DECIMAL(18, 8) DEFAULT 0 CHECK (balance >= 0),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  credit_score INTEGER DEFAULT 100 CHECK (credit_score >= 0 AND credit_score <= 1000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdraw', 'transfer_in', 'transfer_out', 'trade_win', 'trade_loss', 'arbitrage_profit')),
  amount DECIMAL(18, 8) NOT NULL,
  balance_before DECIMAL(18, 8) NOT NULL,
  balance_after DECIMAL(18, 8) NOT NULL,
  reference_id UUID,
  description TEXT,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Binary trades table
CREATE TABLE binary_trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pair VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('up', 'down')),
  amount DECIMAL(18, 8) NOT NULL CHECK (amount > 0),
  entry_price DECIMAL(18, 8) NOT NULL,
  exit_price DECIMAL(18, 8),
  duration INTEGER NOT NULL CHECK (duration > 0),
  payout_percentage DECIMAL(5, 2) DEFAULT 85.00,
  result VARCHAR(10) CHECK (result IN ('win', 'loss', 'pending')),
  profit_loss DECIMAL(18, 8) DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  settled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Arbitrage settings table
CREATE TABLE ai_arbitrage_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT false,
  min_profit_percentage DECIMAL(5, 2) DEFAULT 0.50,
  max_trade_amount DECIMAL(18, 8) DEFAULT 1000,
  trading_pairs TEXT[] DEFAULT ARRAY['ETH/USDT', 'BTC/USDT'],
  interval_seconds INTEGER DEFAULT 60,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Arbitrage trades table
CREATE TABLE ai_arbitrage_trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_id UUID REFERENCES ai_arbitrage_settings(id) ON DELETE CASCADE,
  pair VARCHAR(20) NOT NULL,
  buy_price DECIMAL(18, 8) NOT NULL,
  sell_price DECIMAL(18, 8) NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  profit DECIMAL(18, 8) NOT NULL,
  profit_percentage DECIMAL(5, 2) NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support tickets table
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'technical', 'trading', 'account', 'withdrawal', 'other')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket responses table
CREATE TABLE ticket_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_staff BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_binary_trades_user_id ON binary_trades(user_id);
CREATE INDEX idx_binary_trades_result ON binary_trades(result);
CREATE INDEX idx_binary_trades_expires_at ON binary_trades(expires_at);
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_ticket_responses_ticket_id ON ticket_responses(ticket_id);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_arbitrage_settings_updated_at BEFORE UPDATE ON ai_arbitrage_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE binary_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_responses ENABLE ROW LEVEL SECURITY;
```

**Expected Result**: ✅ All tables created (no errors)

---

### 🔷 File #2: Deposit Addresses & Coins

Copy and paste this entire block into a **NEW Query** → Click **Run**:

```sql
-- User deposit addresses
CREATE TABLE IF NOT EXISTS user_deposit_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coin_symbol VARCHAR(20) NOT NULL,
  network VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, coin_symbol, network)
);

-- Supported coins
CREATE TABLE IF NOT EXISTS supported_coins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  networks JSONB DEFAULT '[]',
  icon_url TEXT,
  is_active BOOLEAN DEFAULT true,
  min_deposit DECIMAL(20, 8) DEFAULT 0,
  min_withdrawal DECIMAL(20, 8) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_from_admin BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id, created_at DESC);

-- Insert default coins
INSERT INTO supported_coins (symbol, name, networks, is_active) VALUES
  ('BTC', 'Bitcoin', '["Bitcoin", "Lightning"]', true),
  ('ETH', 'Ethereum', '["ERC20", "Arbitrum", "Optimism"]', true),
  ('USDT', 'Tether', '["ERC20", "TRC20", "BEP20"]', true),
  ('USDC', 'USD Coin', '["ERC20", "TRC20", "BEP20"]', true),
  ('BNB', 'Binance Coin', '["BEP20", "BEP2"]', true),
  ('SOL', 'Solana', '["Solana"]', true),
  ('TRX', 'Tron', '["TRC20"]', true),
  ('MATIC', 'Polygon', '["Polygon", "ERC20"]', true)
ON CONFLICT (symbol) DO NOTHING;
```

**Expected Result**: ✅ 8 coins inserted (no errors)

---

### 🔷 File #3: KYC Tables

Copy and paste this entire block into a **NEW Query** → Click **Run**:

```sql
-- KYC submissions
CREATE TABLE IF NOT EXISTS kyc_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('ID', 'Passport', 'Driver License')),
  document_number VARCHAR(100) NOT NULL,
  front_image_url TEXT NOT NULL,
  back_image_url TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user_id ON kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_status ON kyc_submissions(status);

-- Trigger
CREATE TRIGGER IF NOT EXISTS update_kyc_submissions_updated_at BEFORE UPDATE ON kyc_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add KYC status to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(50) DEFAULT 'not_submitted' CHECK (kyc_status IN ('not_submitted', 'pending', 'approved', 'rejected'));
```

**Expected Result**: ✅ KYC tables created (no errors)

---

### 🔷 File #4: Trading Levels

Copy and paste this entire block into a **NEW Query** → Click **Run**:

```sql
-- Trading levels
CREATE TABLE IF NOT EXISTS trading_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  min_amount DECIMAL(18, 8) NOT NULL CHECK (min_amount > 0),
  max_amount DECIMAL(18, 8) NOT NULL CHECK (max_amount >= min_amount),
  payout_percentage DECIMAL(5, 2) NOT NULL CHECK (payout_percentage > 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trading_levels_active ON trading_levels(is_active);

CREATE TRIGGER IF NOT EXISTS update_trading_levels_updated_at BEFORE UPDATE ON trading_levels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default levels
INSERT INTO trading_levels (name, min_amount, max_amount, payout_percentage, is_active) VALUES
('Level 1 - Starter', 10, 50, 85.00, true),
('Level 2 - Basic', 51, 100, 87.00, true),
('Level 3 - Intermediate', 101, 500, 90.00, true),
('Level 4 - Advanced', 501, 1000, 92.00, true),
('Level 5 - Professional', 1001, 10000, 95.00, true);

-- AI Arbitrage levels
CREATE TABLE IF NOT EXISTS ai_arbitrage_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  min_amount DECIMAL(18, 8) NOT NULL CHECK (min_amount > 0),
  max_amount DECIMAL(18, 8) NOT NULL CHECK (max_amount >= min_amount),
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
  profit_percentage DECIMAL(5, 2) NOT NULL,
  loss_percentage DECIMAL(5, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_arbitrage_levels_active ON ai_arbitrage_levels(is_active);

CREATE TRIGGER IF NOT EXISTS update_ai_arbitrage_levels_updated_at BEFORE UPDATE ON ai_arbitrage_levels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default AI arbitrage levels
INSERT INTO ai_arbitrage_levels (name, min_amount, max_amount, duration_seconds, profit_percentage, loss_percentage, is_active) VALUES
('AI Level 1 - Quick', 50, 200, 300, 2.5, 1.5, true),
('AI Level 2 - Standard', 201, 500, 600, 3.5, 2.0, true),
('AI Level 3 - Medium', 501, 1000, 900, 5.0, 2.5, true),
('AI Level 4 - Advanced', 1001, 5000, 1800, 7.5, 3.0, true),
('AI Level 5 - Professional', 5001, 100000, 3600, 10.0, 3.5, true);
```

**Expected Result**: ✅ Trading levels + 5 rows inserted (no errors)

---

### 🔷 File #5: Master Account

Copy and paste this entire block into a **NEW Query** → Click **Run**:

```sql
-- Create master account
DO $$
DECLARE
  master_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM users WHERE role = 'master') INTO master_exists;
  
  IF NOT master_exists THEN
    INSERT INTO users (
      email,
      username,
      password_hash,
      role,
      balance,
      status,
      credit_score
    ) VALUES (
      'master@onchainweb.app',
      'MasterAdmin',
      '$2b$10$Wb4mCZkY4JVFd8.cIs5K9uCq9dvcpF1C.sApwgzmY7i6vnxW8k35C',
      'master',
      0,
      'active',
      100
    );
    
    RAISE NOTICE 'Master account created';
  ELSE
    RAISE NOTICE 'Master account already exists';
  END IF;
END $$;

-- Admin logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
```

**Expected Result**: ✅ Master account created + admin_logs table (no errors)

---

## ✅ Step 3: Verify Database

After all 5 files are run, verify in Supabase SQL Editor:

```sql
-- Count all tables
SELECT COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public';
```

**Expected Result**: 🎯 **16+ tables** should exist

---

## ✅ Step 4: Verify Master Account

```sql
-- Check master account exists
SELECT email, username, role, status 
FROM users 
WHERE role = 'master';
```

**Expected Result**: 🎯 1 row: `master@onchainweb.app | MasterAdmin | master | active`

---

## ✅ Step 5: Verify Default Data

```sql
-- Check coins
SELECT COUNT(*) FROM supported_coins;
-- Should return: 8

-- Check trading levels
SELECT COUNT(*) FROM trading_levels;
-- Should return: 5

-- Check AI arbitrage levels
SELECT COUNT(*) FROM ai_arbitrage_levels;
-- Should return: 5
```

---

## 🎯 You're All Set!

✅ Database schema fully configured  
✅ Master account created  
✅ Default data loaded  

**Next steps:**
1. ✅ Env vars set in Vercel? (You should do this now if not done)
2. ✅ Database schema loaded? (You just completed this!)
3. Test endpoints (curl examples coming next)
4. Go live!

---

## 🔑 Master Account Login Details

```
Email: master@onchainweb.app
Password: OnchainMaster2025!
Role: master (super admin)
```

⚠️ **Change this password after first login!**

---

## ⚠️ Troubleshooting

**Error: "relation 'users' does not exist"**
- Solution: Run File #1 first, wait for completion

**Error: "uuid-ossp extension does not exist"**
- Solution: File #1 creates it automatically

**Error: "function 'update_updated_at_column' does not exist"**
- Solution: Run File #1 which creates the function

**Import failed / Constraint errors**
- Solution: Make sure you run files in exact order (#1→#2→#3→#4→#5)

---

**Total Setup Time**: ~5 minutes  
**Database Tables**: 16+  
**Default Records**: 18  
**Status**: 🟢 READY FOR PRODUCTION
