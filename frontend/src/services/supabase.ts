import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL?.trim()
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY?.trim()

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables missing:')
  console.error('REACT_APP_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
  console.error('REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing')
  throw new Error('Supabase configuration is required')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  console.error('❌ Invalid Supabase URL:', supabaseUrl)
  throw new Error('Invalid Supabase URL format')
}

console.log('✅ Supabase configuration loaded successfully')
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
