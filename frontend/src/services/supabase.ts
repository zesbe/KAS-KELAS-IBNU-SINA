import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL?.trim()
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY?.trim()

// Log environment status for debugging
console.log('🔍 Supabase Configuration Check:')
console.log('================================')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('REACT_APP_SUPABASE_URL:', supabaseUrl ? `✓ Set (${supabaseUrl.substring(0, 30)}...)` : '✗ Missing')
console.log('REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing')
console.log('================================')

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = 'Supabase environment variables missing. Please check Railway service variables.'
  console.error('❌', errorMsg)
  
  // In production, throw error
  if (process.env.NODE_ENV === 'production') {
    throw new Error(errorMsg)
  }
  
  // In development, create a dummy client to prevent app crash
  console.warn('⚠️ Running in development mode without Supabase configuration')
  // Use dummy values to prevent crash during development
  const dummyUrl = 'https://dummy.supabase.co'
  const dummyKey = 'dummy-key'
  export const supabase = createClient(dummyUrl, dummyKey)
} else {
  // Validate URL format
  try {
    new URL(supabaseUrl)
    console.log('✅ Supabase configuration loaded successfully')
    export const supabase = createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error('❌ Invalid Supabase URL format:', supabaseUrl)
    throw new Error('Invalid Supabase URL format')
  }
}
