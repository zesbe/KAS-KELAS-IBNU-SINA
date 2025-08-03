# Runtime Environment Variables Fix

## Problem
The error "Supabase environment variables missing" occurs because Railway environment variables are not available during the build phase when using Create React App. The variables are only available at runtime when the container starts.

## Solution
We've implemented a runtime environment variable injection system that works as follows:

### 1. Build Time
- The app is built without environment variables
- A placeholder build is created
- The prebuild script warns about missing variables but doesn't fail

### 2. Runtime (When Container Starts)
- `preserve` script runs `inject-runtime-env.js` before serving
- This injects all `REACT_APP_*` environment variables into the built `index.html`
- Variables are added as a global `window._env_` object

### 3. Application Runtime
- The `utils/env.ts` utility reads variables from either:
  - `window._env_` (runtime - preferred)
  - `process.env` (build time - fallback)

## Files Changed

1. **`frontend/scripts/inject-runtime-env.js`** - New script that injects env vars into index.html
2. **`frontend/src/utils/env.ts`** - New utility for reading env vars at runtime
3. **`frontend/src/services/supabase.ts`** - Updated to use the env utility
4. **`frontend/src/config/env.ts`** - Updated to use the env utility and export both `ENV` and `env`
5. **`frontend/src/services/env-check.ts`** - Updated to use the env utility
6. **`frontend/package.json`** - Added `preserve` script
7. **`frontend/railway.json`** - Updated startCommand to run preserve before serve
8. **`frontend/scripts/debug-env.js`** - Updated to not fail during build

## How It Works

1. During build: `npm run build` creates the production build (without env vars)
2. At runtime: Railway runs `npm run preserve && npm run serve`
3. The `preserve` script injects current environment variables into index.html
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

## Common Issues and Solutions

### Issue: Variables still missing after deployment
**Solution**: 
1. Check Railway logs for "Runtime environment variables injected successfully!"
2. Verify variables are set in Railway dashboard
3. Trigger a new deployment after setting variables

### Issue: Build fails with TypeScript errors
**Solution**: The env utility handles undefined values gracefully. TypeScript errors should not occur.

### Issue: Old cached build showing
**Solution**: 
1. Clear browser cache
2. Check browser DevTools > Console for `window._env_` object
3. In Railway: Settings → Clear build cache → Redeploy

### Issue: Variables not updating
**Solution**: The inject script now updates existing configs. Just redeploy after changing variables.

## Verification

To verify the fix is working:

1. Open browser DevTools Console
2. Type `window._env_` and press Enter
3. You should see all your REACT_APP_* variables
4. Check Network tab - no 404 errors for environment-related files