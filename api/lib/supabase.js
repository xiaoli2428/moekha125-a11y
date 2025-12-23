import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error(`Missing Supabase env vars: URL=${!!supabaseUrl}, KEY=${!!supabaseServiceKey}`);
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

// Lazy initialization
let instance = null;

const supabase = {
    get from() {
        if (!instance) instance = getSupabaseClient();
        return instance.from.bind(instance);
    }
};

export default supabase;
