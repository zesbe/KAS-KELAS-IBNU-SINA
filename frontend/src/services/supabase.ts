import { createClient } from '@supabase/supabase-js';
import { env, validateEnv } from '../config/env';

// Validate environment variables
validateEnv();

const supabaseUrl = env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = env.REACT_APP_SUPABASE_ANON_KEY;

// Add validation to check if environment variables are loaded
if (!supabaseUrl || supabaseUrl === 'undefined') {
  console.error('REACT_APP_SUPABASE_URL is not defined. Please check your environment variables.');
  console.error('Current value:', process.env.REACT_APP_SUPABASE_URL);
  throw new Error('supabaseUrl is required.');
}

if (!supabaseAnonKey || supabaseAnonKey === 'undefined') {
  console.error('REACT_APP_SUPABASE_ANON_KEY is not defined. Please check your environment variables.');
  throw new Error('supabaseAnonKey is required.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);