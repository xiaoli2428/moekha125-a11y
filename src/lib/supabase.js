import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eexnhxkbwmaeaottzivh.supabase.co'
// Note: In production, use environment variables for the anon key
// The anon key is safe to use in the browser as it has Row Level Security enabled
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVleG5oeGtid21hZWFvdHR6aXZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NDIyNTAsImV4cCI6MjA3OTAxODI1MH0.pRROW_1CWgZIZFWfTQEvQvUMLiXV6-w6ggPafwlyMAE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
