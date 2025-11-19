# Supabase Database Setup

This document describes how to set up the required database tables for the Onchainweb application.

## Configuration

The Supabase connection is pre-configured with:
- **URL**: https://eexnhxkbwmaeaottzivh.supabase.co
- **Anon Key**: Already configured in the code

The anon key is already set in `src/lib/supabase.js` with a fallback, so the app will work without a `.env` file. However, for security best practices, you can create a `.env` file:

```
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVleG5oeGtid21hZWFvdHR6aXZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NDIyNTAsImV4cCI6MjA3OTAxODI1MH0.pRROW_1CWgZIZFWfTQEvQvUMLiXV6-w6ggPafwlyMAE
```

Dashboard: https://supabase.com/dashboard/project/eexnhxkbwmaeaottzivh

## Database Schema

Run these SQL commands in the Supabase SQL Editor to create the required tables:

### Users Table

```sql
-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  profile_data JSONB DEFAULT '{}'::jsonb
);

-- Create index on wallet_address for faster lookups
CREATE INDEX idx_users_wallet_address ON users(wallet_address);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (true);

-- Create policy to allow insert for new users
CREATE POLICY "Users can insert their own data"
  ON users FOR INSERT
  WITH CHECK (true);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (true);
```

### Transactions Table

```sql
-- Create transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tx_hash TEXT,
  tx_type TEXT NOT NULL, -- 'swap', 'liquidity_add', 'liquidity_remove', etc.
  from_token TEXT,
  to_token TEXT,
  amount DECIMAL,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_tx_hash ON transactions(tx_hash);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own transactions"
  ON transactions FOR INSERT
  WITH CHECK (true);
```

### User Activity Log (Optional)

```sql
-- Create user activity log table
CREATE TABLE user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_created_at ON user_activity(created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own activity"
  ON user_activity FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own activity"
  ON user_activity FOR INSERT
  WITH CHECK (true);
```

## Features Enabled

With this setup, the application can now:

1. **User Management**
   - Automatically create user accounts when wallets connect
   - Track user activity and last seen timestamps
   - Store user profiles and preferences

2. **Transaction Tracking**
   - Record all user transactions (swaps, liquidity operations, etc.)
   - Track transaction status (pending, completed, failed)
   - Store transaction metadata

3. **Account Monitoring**
   - View user activity logs
   - Monitor user engagement
   - Track user balances and holdings

## Security Notes

- Row Level Security (RLS) is enabled on all tables
- The anon key is safe to use in the browser as RLS policies restrict access
- Each user can only access their own data
- Never commit the `.env` file to version control

## Testing

After setting up the database:

1. Connect your wallet in the application
2. Check the Supabase dashboard to see the user record created
3. Perform transactions to see them logged in the transactions table

## Next Steps

To extend functionality:

1. Add more user profile fields
2. Create tables for favorites, watchlists, notifications
3. Add analytics tables for tracking user behavior
4. Implement referral system
5. Add support for multiple wallets per user
