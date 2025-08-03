# Runtime Environment Variables Fix

## Problem
The error "Supabase environment variables missing" occurs because Railway environment variables are not available during the build phase when using Create React App. The variables are only available at runtime when the container starts.

## Solution
We've implemented a runtime environment variable injection system that works as follows:

### 1. Build Time
- The app is built without environment variables
- A placeholder build is created

### 2. Runtime (When Container Starts)
- `inject-runtime-env.js` runs and injects all `REACT_APP_*` environment variables into the built `index.html`
- Variables are added as a global `window._env_` object

### 3. Application Runtime
- The `utils/env.ts` utility reads variables from either:
  - `window._env_` (runtime - preferred)
  - `process.env` (build time - fallback)

## Files Changed

1. **`frontend/scripts/inject-runtime-env.js`** - New script that injects env vars into index.html
2. **`frontend/src/utils/env.ts`** - New utility for reading env vars at runtime
3. **`frontend/src/services/supabase.ts`** - Updated to use the env utility
4. **`frontend/src/config/env.ts`** - Updated to use the env utility
5. **`frontend/src/services/env-check.ts`** - Updated to use the env utility
6. **`frontend/package.json`** - Added `postbuild` and `preserve` scripts

## How It Works

1. During build: `npm run build` creates the production build
2. After build: `postbuild` script runs `inject-runtime-env.js`
3. Before serve: `preserve` script runs `inject-runtime-env.js` again (ensures vars are current)
4. The app reads environment variables from `window._env_` at runtime

## Deployment Steps

1. Set all environment variables in Railway dashboard
2. Deploy the application
3. The environment variables will be injected at runtime

## Testing Locally

To test with Railway environment variables locally:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link project
railway login
railway link

# Build with Railway env vars
railway run npm run build

# Serve with Railway env vars
railway run npm run serve
```

## Troubleshooting

If variables are still missing:

1. Check Railway dashboard - ensure all variables are set
2. Check build logs for the "Runtime environment variables injected" message
3. Check browser console for `window._env_` object
4. Redeploy after setting/changing variables