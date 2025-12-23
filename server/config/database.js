import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

// Create client even if env vars are missing - will fail gracefully when used
let supabaseClient = null

if (supabaseUrl && supabaseServiceKey) {
  supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
} else {
  console.warn('⚠️  Supabase environment variables not set - database operations will fail')
}

export const supabase = supabaseClient || {
  from: () => { throw new Error('Supabase not configured') }
}

export default supabase
