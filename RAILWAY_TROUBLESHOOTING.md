# Railway Deployment Troubleshooting Guide

## Environment Variables Not Working

### Problem: "Application failed to respond" or Missing Environment Variables

This is the most common issue when deploying React apps to Railway. Here's how to fix it:

### Solution Steps:

1. **Verify Environment Variables in Railway Dashboard**
   - Go to your Railway project
   - Click on the frontend service
   - Go to "Variables" tab
   - Make sure ALL these variables are set:
     ```
     REACT_APP_SUPABASE_URL
     REACT_APP_SUPABASE_ANON_KEY
     REACT_APP_BACKEND_URL
     REACT_APP_DRIPSENDER_API_KEY
     REACT_APP_PAKASIR_API_KEY
     REACT_APP_PAKASIR_SLUG
     REACT_APP_VAPID_PUBLIC_KEY
     ```

2. **Check Variable Format**
   - Remove any quotes around values
   - Remove any trailing spaces
   - Make sure URLs don't have trailing slashes

3. **Trigger a New Deployment**
   - After adding/updating variables, you MUST trigger a new deployment
   - Go to "Deployments" tab
   - Click "Redeploy" on the latest deployment
   - Or push a small change to trigger automatic deployment

4. **Debug Environment Variables**
   - Check the build logs in Railway
   - Look for the "Environment Debug Information" section
   - It will show which variables are set or missing

5. **Common Issues and Fixes**

   **Issue**: Variables not available during build
   - **Fix**: Railway needs to inject variables during build phase
   - Make sure variables are set BEFORE deploying

   **Issue**: Wrong variable names
   - **Fix**: Variables MUST start with `REACT_APP_`
   - Double-check spelling and case sensitivity

   **Issue**: Backend URL incorrect
   - **Fix**: Use the full Railway URL including `https://`
   - Example: `https://kas-kelas-1-ibnu-sina-production.up.railway.app`

## Build Failures

### Problem: Build fails with npm errors

1. **Clear Build Cache**
   - Go to Settings → Build → Clear build cache
   - Redeploy

2. **Check Node Version**
   - Railway uses Node 18 by default
   - Make sure your packages are compatible

3. **Check Build Logs**
   - Look for specific error messages
   - Common issues:
     - Missing dependencies
     - TypeScript errors
     - Import errors

## Runtime Errors

### Problem: App builds but shows errors when running

1. **Check Browser Console**
   - Open DevTools (F12)
   - Look for errors in Console
   - Common issues:
     - CORS errors
     - API connection failures
     - Missing environment variables

2. **Verify API Connections**
   - Check that backend URL is correct
   - Ensure backend service is running
   - Check CORS configuration in backend

## Quick Checklist

Before deploying, verify:

- [ ] All environment variables are set in Railway
- [ ] Variables have correct names (REACT_APP_ prefix)
- [ ] No quotes or extra spaces in variable values
- [ ] Backend URL includes https://
- [ ] Supabase URL and keys are correct
- [ ] Build command is `npm ci && npm run build`
- [ ] Start command is `npm run serve`
- [ ] Root directory is set to `frontend`

## Testing Locally with Railway Variables

To test with the same variables locally:

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link your project:
   ```bash
   railway link
   ```

4. Run with Railway variables:
   ```bash
   railway run npm start
   ```

## Getting Help

If you're still having issues:

1. Check Railway build logs for errors
2. Run `npm run debug:env` to check variables
3. Check browser console for runtime errors
4. Verify all services are running (frontend & backend)

## Example Working Configuration

Here's what a working setup looks like in Railway:

### Frontend Service Variables:
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_BACKEND_URL=https://your-backend.railway.app
REACT_APP_DRIPSENDER_API_KEY=your-dripsender-key
REACT_APP_PAKASIR_API_KEY=your-pakasir-key
REACT_APP_PAKASIR_SLUG=your-pakasir-slug
REACT_APP_VAPID_PUBLIC_KEY=your-vapid-public-key
```

### Build Settings:
- Builder: Nixpacks
- Root Directory: `/frontend`
- Build Command: `npm ci && npm run build`
- Start Command: `npm run serve`