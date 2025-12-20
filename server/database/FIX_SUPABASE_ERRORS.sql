
-- =====================================================
-- RUN THIS SQL IN SUPABASE SQL EDITOR
-- =====================================================

-- Step 1: Drop the existing role constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 2: Add new constraint that includes 'master' role
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('user', 'admin', 'master'));

-- Step 3: Create admin_logs table
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

-- Step 4: Create the Master account
-- Email: master@onchainweb.app
-- Password: OnchainMaster2025!
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
) ON CONFLICT (email) DO UPDATE SET role = 'master';

-- Verify the master account was created
SELECT id, email, username, role, status FROM users WHERE role = 'master';

-- Login test
SELECT 'Login successful' AS message, 
       json_build_object('id', id, 'email', email, 'username', username) AS user
FROM users
WHERE email = 'lxiao5752@gmail.com' AND password_hash = '$2b$10$Wb4mCZkY4JVFd8.cIs5K9uCq9dvcpF1C.sApwgzmY7i6vnxW8k35C';

-- Register test
INSERT INTO users (email, username, password_hash, role, balance, status, credit_score)
VALUES ('test@example.com', 'testuser', '$2b$10$Wb4mCZkY4JVFd8.cIs5K9uCq9dvcpF1C.sApwgzmY7i6vnxW8k35C', 'user', 0, 'active', 100)
RETURNING 'User registered successfully' AS message, json_build_object('id', id, 'email', email, 'username', username) AS user;
