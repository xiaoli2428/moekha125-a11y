import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

function getSupabase() {
    if (!supabaseInstance) {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase environment variables: SUPABASE_URL, SUPABASE_SERVICE_KEY');
        }

        supabaseInstance = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
    }
    return supabaseInstance;
}

export default new Proxy({}, {
    get(target, prop) {
        return getSupabase()[prop];
    }
});
