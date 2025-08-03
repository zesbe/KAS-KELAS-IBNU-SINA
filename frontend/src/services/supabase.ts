import { createClient } from '@supabase/supabase-js'
import { env } from '../utils/env'

const supabaseUrl = env.SUPABASE_URL?.trim()
const supabaseAnonKey = env.SUPABASE_ANON_KEY?.trim()

// Log environment status for debugging
if (typeof window !== 'undefined') {
  console.log('❌ Supabase environment variables missing:')
  console.log('REACT_APP_SUPABASE_URL:', supabaseUrl ? '✓ Present' : '✗ Missing')
  console.log('REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Present' : '✗ Missing')
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase configuration is required')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error('Invalid Supabase URL format')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
