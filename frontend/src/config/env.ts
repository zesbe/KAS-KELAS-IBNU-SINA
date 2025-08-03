import { env } from '../utils/env'

export const ENV = {
  REACT_APP_SUPABASE_URL: env.SUPABASE_URL || '',
  REACT_APP_SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY || '',
  REACT_APP_BACKEND_URL: env.BACKEND_URL || '',
  REACT_APP_DRIPSENDER_API_KEY: env.DRIPSENDER_API_KEY || '',
  REACT_APP_PAKASIR_API_KEY: env.PAKASIR_API_KEY || '',
  REACT_APP_PAKASIR_SLUG: env.PAKASIR_SLUG || '',
  REACT_APP_VAPID_PUBLIC_KEY: env.VAPID_PUBLIC_KEY || ''
}

// Export as 'env' for backward compatibility
export { ENV as env }

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Validate environment variables
export function validateEnv() {
  const requiredVars = [
    'REACT_APP_SUPABASE_URL',
    'REACT_APP_SUPABASE_ANON_KEY',
    'REACT_APP_BACKEND_URL',
    'REACT_APP_DRIPSENDER_API_KEY',
    'REACT_APP_PAKASIR_API_KEY',
    'REACT_APP_PAKASIR_SLUG',
    'REACT_APP_VAPID_PUBLIC_KEY'
  ] as const;

  const missingVars: string[] = [];
  
  requiredVars.forEach(varName => {
    if (!ENV[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    console.error('Current environment:', {
      REACT_APP_SUPABASE_URL: ENV.REACT_APP_SUPABASE_URL ? 'SET' : 'NOT SET',
      REACT_APP_SUPABASE_ANON_KEY: ENV.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      REACT_APP_BACKEND_URL: ENV.REACT_APP_BACKEND_URL ? 'SET' : 'NOT SET',
      REACT_APP_DRIPSENDER_API_KEY: ENV.REACT_APP_DRIPSENDER_API_KEY ? 'SET' : 'NOT SET',
      REACT_APP_PAKASIR_API_KEY: ENV.REACT_APP_PAKASIR_API_KEY ? 'SET' : 'NOT SET',
      REACT_APP_PAKASIR_SLUG: ENV.REACT_APP_PAKASIR_SLUG ? 'SET' : 'NOT SET',
      REACT_APP_VAPID_PUBLIC_KEY: ENV.REACT_APP_VAPID_PUBLIC_KEY ? 'SET' : 'NOT SET'
    });
    
    // Only throw error in production
    if (isProduction) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    } else {
      console.warn('Running in development mode with missing environment variables');
    }
  }

  return ENV;
}