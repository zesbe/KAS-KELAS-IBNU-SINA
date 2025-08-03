// Environment configuration with fallback values for development
export const env = {
  REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || '',
  REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY || '',
  REACT_APP_BACKEND_URL: process.env.REACT_APP_BACKEND_URL || '',
  REACT_APP_DRIPSENDER_API_KEY: process.env.REACT_APP_DRIPSENDER_API_KEY || '',
  REACT_APP_PAKASIR_API_KEY: process.env.REACT_APP_PAKASIR_API_KEY || '',
  REACT_APP_PAKASIR_SLUG: process.env.REACT_APP_PAKASIR_SLUG || '',
  REACT_APP_VAPID_PUBLIC_KEY: process.env.REACT_APP_VAPID_PUBLIC_KEY || ''
};

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
    if (!env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    console.error('Current environment:', {
      REACT_APP_SUPABASE_URL: env.REACT_APP_SUPABASE_URL ? 'SET' : 'NOT SET',
      REACT_APP_SUPABASE_ANON_KEY: env.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      REACT_APP_BACKEND_URL: env.REACT_APP_BACKEND_URL ? 'SET' : 'NOT SET',
      REACT_APP_DRIPSENDER_API_KEY: env.REACT_APP_DRIPSENDER_API_KEY ? 'SET' : 'NOT SET',
      REACT_APP_PAKASIR_API_KEY: env.REACT_APP_PAKASIR_API_KEY ? 'SET' : 'NOT SET',
      REACT_APP_PAKASIR_SLUG: env.REACT_APP_PAKASIR_SLUG ? 'SET' : 'NOT SET',
      REACT_APP_VAPID_PUBLIC_KEY: env.REACT_APP_VAPID_PUBLIC_KEY ? 'SET' : 'NOT SET'
    });
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return env;
}