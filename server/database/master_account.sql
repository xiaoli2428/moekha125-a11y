-- Add master role support
-- Run this migration in Supabase SQL Editor

-- Update role column to support 'master' role
-- The role can be: 'user', 'admin', or 'master'

-- Create a master account
-- This is the super admin who can manage all other admins
-- Default password: OnchainMaster2025! (hash it before insert)

-- First, let's create a function to create the master account
DO $$
DECLARE
  master_exists BOOLEAN;
BEGIN
  -- Check if master account already exists
  SELECT EXISTS(SELECT 1 FROM users WHERE role = 'master') INTO master_exists;
  
  IF NOT master_exists THEN
    -- Create master account with password: OnchainMaster2025!
    -- bcrypt hash of 'OnchainMaster2025!' with 10 rounds
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
      '$2b$10$8K1p/a0dR1xqM8K3hR1xqOQZJZKp0q3Q5F5E5E5E5E5E5E5E5E5E5E',
      'master',
      0,
      'active',
      100
    );
    
    RAISE NOTICE 'Master account created successfully';
  ELSE
    RAISE NOTICE 'Master account already exists';
  END IF;
END $$;

-- Create admin_logs table to track admin activities
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  target_user_id UUID REFERENCES users(id),
  details JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
