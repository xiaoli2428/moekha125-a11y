-- Drop all tables and functions to start fresh

-- Drop tables (in reverse order of dependencies)
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS ticket_responses CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS user_deposit_addresses CASCADE;
DROP TABLE IF EXISTS kyc_submissions CASCADE;
DROP TABLE IF EXISTS ai_arbitrage_trades CASCADE;
DROP TABLE IF EXISTS ai_arbitrage_levels CASCADE;
DROP TABLE IF EXISTS ai_arbitrage_settings CASCADE;
DROP TABLE IF EXISTS trading_levels CASCADE;
DROP TABLE IF EXISTS supported_coins CASCADE;
DROP TABLE IF EXISTS binary_trades CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Verify all tables are gone
SELECT COUNT(*) as remaining_tables
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
-- Should return: 0
