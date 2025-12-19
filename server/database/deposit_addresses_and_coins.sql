-- Add deposit addresses table for admin-customizable addresses per user
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

-- Create supported coins table (admin can add any crypto)
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

-- Create live chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_from_admin BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast chat lookup
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id, created_at DESC);

-- Insert some default supported coins
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
