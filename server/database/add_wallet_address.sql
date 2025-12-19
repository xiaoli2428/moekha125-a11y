-- Add wallet_address column to users table for wallet login support
-- Run this in your Supabase SQL Editor

ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(255) UNIQUE;

-- Create index for faster wallet lookups
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);

-- Update the column comment
COMMENT ON COLUMN users.wallet_address IS 'Ethereum wallet address for wallet-based authentication';
