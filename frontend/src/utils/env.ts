// Utility to get environment variables that works both at build time and runtime

declare global {
  interface Window {
    _env_?: Record<string, string>;
  }
}

export function getEnvVar(name: string): string | undefined {
  // First try to get from runtime config (injected by inject-runtime-env.js)
  if (typeof window !== 'undefined' && window._env_ && window._env_[name]) {
    return window._env_[name];
  }
  
  // Fallback to process.env (build time)
  return process.env[name];
}

export function getRequiredEnvVar(name: string): string {
  const value = getEnvVar(name);
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value;
}

// Export specific environment variables
export const env = {
  SUPABASE_URL: getEnvVar('REACT_APP_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('REACT_APP_SUPABASE_ANON_KEY'),
  BACKEND_URL: getEnvVar('REACT_APP_BACKEND_URL'),
  DRIPSENDER_API_KEY: getEnvVar('REACT_APP_DRIPSENDER_API_KEY'),
  PAKASIR_API_KEY: getEnvVar('REACT_APP_PAKASIR_API_KEY'),
  PAKASIR_SLUG: getEnvVar('REACT_APP_PAKASIR_SLUG'),
  VAPID_PUBLIC_KEY: getEnvVar('REACT_APP_VAPID_PUBLIC_KEY'),
} as const;