import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ixzdhypgrxnoprvuulys.supabase.co'
// Note: In production, use environment variables for the anon key
// The anon key is safe to use in the browser as it has Row Level Security enabled
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
