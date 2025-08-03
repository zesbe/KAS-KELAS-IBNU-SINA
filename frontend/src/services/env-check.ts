// Environment variable validation utility

export interface EnvConfig {
  REACT_APP_SUPABASE_URL: string;
  REACT_APP_SUPABASE_ANON_KEY: string;
  REACT_APP_BACKEND_URL: string;
  REACT_APP_DRIPSENDER_API_KEY: string;
  REACT_APP_PAKASIR_API_KEY: string;
  REACT_APP_PAKASIR_SLUG: string;
  REACT_APP_VAPID_PUBLIC_KEY: string;
}

export function validateEnv(): EnvConfig {
  const requiredEnvVars = [
    'REACT_APP_SUPABASE_URL',
    'REACT_APP_SUPABASE_ANON_KEY',
    'REACT_APP_BACKEND_URL',
    'REACT_APP_DRIPSENDER_API_KEY',
    'REACT_APP_PAKASIR_API_KEY',
    'REACT_APP_PAKASIR_SLUG',
    'REACT_APP_VAPID_PUBLIC_KEY'
  ];

  const missingVars: string[] = [];
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName] || process.env[varName] === 'undefined') {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    console.error('Available environment variables:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')));
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return {
    REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL!,
    REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY!,
    REACT_APP_BACKEND_URL: process.env.REACT_APP_BACKEND_URL!,
    REACT_APP_DRIPSENDER_API_KEY: process.env.REACT_APP_DRIPSENDER_API_KEY!,
    REACT_APP_PAKASIR_API_KEY: process.env.REACT_APP_PAKASIR_API_KEY!,
    REACT_APP_PAKASIR_SLUG: process.env.REACT_APP_PAKASIR_SLUG!,
    REACT_APP_VAPID_PUBLIC_KEY: process.env.REACT_APP_VAPID_PUBLIC_KEY!
  };
}