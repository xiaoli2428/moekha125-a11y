-- Migration: Add wallet authentication columns to users table
-- Run this in Supabase SQL Editor if schema already exists

-- Add wallet_address column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'wallet_address') THEN
    ALTER TABLE users ADD COLUMN wallet_address VARCHAR(42) UNIQUE;
  END IF;
END $$;

-- Add short_uid column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'short_uid') THEN
    ALTER TABLE users ADD COLUMN short_uid VARCHAR(10) UNIQUE;
  END IF;
END $$;

-- Add profile_data column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'profile_data') THEN
    ALTER TABLE users ADD COLUMN profile_data JSONB DEFAULT '{}';
  END IF;
END $$;

-- Add last_seen column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'last_seen') THEN
    ALTER TABLE users ADD COLUMN last_seen TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Make email and password_hash nullable for wallet users
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Update role constraint to include 'master'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('user', 'admin', 'master'));

-- Add index for wallet_address lookups
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);

-- Add index for short_uid lookups
CREATE INDEX IF NOT EXISTS idx_users_short_uid ON users(short_uid);

-- Generate short_uid for existing users that don't have one
UPDATE users 
SET short_uid = LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0')
WHERE short_uid IS NULL;
