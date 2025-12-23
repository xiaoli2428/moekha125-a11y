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

-- Check total tables
SELECT COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public';
-- Should return: 16+

-- Check master account
SELECT email, username, role FROM users WHERE role = 'master';
-- Should return: master@onchainweb.app | MasterAdmin | master

-- Check coins inserted
SELECT COUNT(*) FROM supported_coins;
-- Should return: 8

-- Check trading levels
SELECT COUNT(*) FROM trading_levels;
-- Should return: 5
