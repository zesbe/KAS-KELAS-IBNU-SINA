# Railway Environment Variables Fix Guide

## Problem
The error "supabaseUrl is required" occurs because React environment variables are not being properly passed during the build process on Railway.

## Root Cause
React applications embed environment variables at **build time**, not runtime. When Railway builds your frontend, the environment variables need to be available during the `npm run build` command.

## Solutions Applied

### 1. Enhanced Error Logging
Updated `frontend/src/services/supabase.ts` to provide better error messages when environment variables are missing.

### 2. Environment Validation
Created `frontend/src/services/env-check.ts` to validate all required environment variables at startup.

### 3. Custom Build Script
Created `frontend/scripts/build.sh` that:
- Checks for required environment variables before building
- Provides clear error messages if variables are missing
- Shows partial values of set variables for debugging

### 4. Updated Build Configuration
Modified `railway.json` and `railway.toml` to use the custom build script.

## Verification Steps

1. **Check Railway Service Variables**
   - Go to your Railway project
   - Select the "FRONTEND" service
   - Go to the "Variables" tab
   - Verify that `REACT_APP_SUPABASE_URL` shows the actual Supabase URL (not hidden/asterisks)
   - The URL should look like: `https://your-project-id.supabase.co`

2. **Verify All Required Variables**
   Ensure these variables are set in the FRONTEND service:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `REACT_APP_BACKEND_URL`
   - `REACT_APP_DRIPSENDER_API_KEY`
   - `REACT_APP_PAKASIR_API_KEY`
   - `REACT_APP_PAKASIR_SLUG`
   - `REACT_APP_VAPID_PUBLIC_KEY`

3. **Redeploy the Frontend**
   After verifying/updating the environment variables:
   - Trigger a new deployment in Railway
   - Check the build logs for any error messages
   - The build script will show if variables are properly loaded

## Common Issues

### Issue: Variables Show as Asterisks
If your variables show as `*******` in Railway:
1. Click on the variable
2. You should see an "Edit" option
3. Re-enter the actual value (not asterisks)
4. Save the changes

### Issue: Variables Not Available During Build
Railway might not expose variables during build by default. Solutions:
1. Ensure variables are set at the service level, not project level
2. Use the custom build script we created
3. Check Railway's build logs for environment variable debugging output

### Issue: Wrong Variable Names
Double-check that all variables start with `REACT_APP_` prefix. React only exposes variables with this prefix to the client-side code.

## Manual Testing

To test if environment variables are being passed correctly:

1. **Local Test** (optional):
   ```bash
   cd frontend
   export REACT_APP_SUPABASE_URL="your-url-here"
   export REACT_APP_SUPABASE_ANON_KEY="your-key-here"
   # ... export other variables
   npm run build
   ```

2. **Check Build Output**:
   In Railway's deployment logs, you should see:
   ```
   Starting build process...
   Checking environment variables...
   REACT_APP_SUPABASE_URL is set to: https://your-project...
   REACT_APP_SUPABASE_ANON_KEY is set: eyJhbGciOiJIUzI1NiIs...
   ```

## Alternative Solution

If the above doesn't work, you can create a `.env.production` file in the frontend directory with your variables:

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
# ... other variables
```

**Note**: This is less secure as it commits secrets to your repository. Use only as a last resort and ensure your repository is private.

## Next Steps

1. Verify all environment variables in Railway
2. Ensure no variables show as asterisks
3. Trigger a new deployment
4. Check build logs for our custom debug output
5. If issues persist, check browser console for detailed error messages

The enhanced error logging will now show exactly which environment variable is missing and what values are being read.