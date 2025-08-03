// Environment variable validation utility
import { env, getEnvVar } from '../utils/env';

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
    const value = getEnvVar(varName);
    if (!value || value === 'undefined') {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    // Log available runtime env vars if they exist
    if (typeof window !== 'undefined' && window._env_) {
      console.error('Available runtime environment variables:', Object.keys(window._env_).filter(key => key.startsWith('REACT_APP_')));
    }
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return {
    REACT_APP_SUPABASE_URL: env.SUPABASE_URL!,
    REACT_APP_SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY!,
    REACT_APP_BACKEND_URL: env.BACKEND_URL!,
    REACT_APP_DRIPSENDER_API_KEY: env.DRIPSENDER_API_KEY!,
    REACT_APP_PAKASIR_API_KEY: env.PAKASIR_API_KEY!,
    REACT_APP_PAKASIR_SLUG: env.PAKASIR_SLUG!,
    REACT_APP_VAPID_PUBLIC_KEY: env.VAPID_PUBLIC_KEY!
  };
}