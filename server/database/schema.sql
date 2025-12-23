-- Enable RLS for "users" table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Sample RLS policy: Users can view only their row
CREATE POLICY user_is_self_policy ON users
    FOR SELECT
    USING (id = current_setting('jwt.claims.user_id')::uuid);
