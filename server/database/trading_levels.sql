-- Trading levels table for binary options
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

CREATE INDEX idx_trading_levels_active ON trading_levels(is_active);

CREATE TRIGGER update_trading_levels_updated_at BEFORE UPDATE ON trading_levels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert 5 default levels
INSERT INTO trading_levels (name, min_amount, max_amount, payout_percentage, is_active) VALUES
('Level 1 - Starter', 10, 50, 85.00, true),
('Level 2 - Basic', 51, 100, 87.00, true),
('Level 3 - Intermediate', 101, 500, 90.00, true),
('Level 4 - Advanced', 501, 1000, 92.00, true),
('Level 5 - Professional', 1001, 10000, 95.00, true);

-- AI Arbitrage levels table
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

CREATE INDEX idx_ai_arbitrage_levels_active ON ai_arbitrage_levels(is_active);

CREATE TRIGGER update_ai_arbitrage_levels_updated_at BEFORE UPDATE ON ai_arbitrage_levels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert 5 default AI arbitrage levels
INSERT INTO ai_arbitrage_levels (name, min_amount, max_amount, duration_seconds, profit_percentage, loss_percentage, is_active) VALUES
('AI Level 1 - Quick', 50, 200, 300, 2.5, 1.5, true),
('AI Level 2 - Standard', 201, 500, 600, 3.5, 2.0, true),
('AI Level 3 - Medium', 501, 1000, 900, 5.0, 2.5, true),
('AI Level 4 - Advanced', 1001, 5000, 1800, 7.5, 3.0, true),
('AI Level 5 - Professional', 5001, 20000, 3600, 10.0, 4.0, true);

-- Add level_id to ai_arbitrage_trades
ALTER TABLE ai_arbitrage_trades ADD COLUMN IF NOT EXISTS level_id UUID REFERENCES ai_arbitrage_levels(id);
ALTER TABLE ai_arbitrage_trades ADD COLUMN IF NOT EXISTS result VARCHAR(10) CHECK (result IN ('profit', 'loss', 'pending'));
ALTER TABLE ai_arbitrage_trades ADD COLUMN IF NOT EXISTS admin_controlled BOOLEAN DEFAULT false;

-- Add credit_score column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS credit_score INTEGER DEFAULT 10 CHECK (credit_score >= 10 AND credit_score <= 100);

UPDATE users 
SET role = 'admin', balance = 10000, credit_score = 50
WHERE email = 'newuser@example.com';
