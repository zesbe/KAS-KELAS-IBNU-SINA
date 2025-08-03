# Railway Deployment Troubleshooting Guide

## 🚨 Common Railway Deployment Issues

### 1. Build Failures

#### Frontend Build Error
```
Error: Cannot find module 'react-scripts'
```
**Solution:**
- Check if `package.json` is in `/frontend` directory
- Ensure "Root Directory" is set to `/frontend` in Railway settings
- Clear build cache: Settings → Clear Build Cache

#### Backend Build Error
```
npm ERR! code ENOENT
npm ERR! syscall open
npm ERR! path /app/package.json
```
**Solution:**
- Verify "Root Directory" is set to `/backend` in Railway settings
- Make sure `package-lock.json` exists in backend folder

### 2. Runtime Errors

#### Frontend: "Failed to fetch" or CORS Error
**Check:**
1. Backend service is running (check Railway logs)
2. `REACT_APP_BACKEND_URL` is correct (no trailing slash)
3. Backend `FRONTEND_URL` matches your frontend domain
4. Example correct format:
   ```
   REACT_APP_BACKEND_URL=https://kas-backend.up.railway.app
   FRONTEND_URL=https://kas-frontend.up.railway.app
   ```

#### Backend: "supabaseUrl is required"
**Solution:**
- All Supabase environment variables must be set:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_SERVICE_KEY`

#### Backend: Port Already in Use
**Solution:**
- Don't hardcode port, use: `process.env.PORT || 3001`
- Railway assigns dynamic ports

### 3. Database Connection Issues

#### "Invalid API key" from Supabase
**Check:**
1. Correct keys from Supabase dashboard:
   - Settings → API → Project URL
   - Settings → API → service_role (for backend)
   - Settings → API → anon public (for frontend)
2. No extra spaces or quotes in env values

#### "Connection timeout" to Supabase
**Solution:**
- Supabase project might be paused (free tier)
- Go to Supabase dashboard and unpause

### 4. WhatsApp/Dripsender Issues

#### Messages Not Sending
**Check:**
1. `DRIPSENDER_API_KEY` is set correctly
2. Dripsender account has credit
3. Phone numbers are in correct format (+62xxx)
4. Check Railway backend logs for specific errors

### 5. Redis Connection Issues

#### "Redis connection refused"
**If NOT using Redis:**
- This is normal, app will work without queue
- Messages sent directly instead of queued

**If using Redis:**
1. Add Redis service in Railway
2. Copy connection details to backend env:
   ```
   REDIS_HOST=your-redis.railway.internal
   REDIS_PORT=6379
   REDIS_PASSWORD=your-redis-password
   ```

### 6. Deployment Not Updating

#### Changes Not Reflected After Push
**Solution:**
1. Check if GitHub integration is active
2. Verify correct branch is deployed (usually `main`)
3. Manual redeploy: Railway dashboard → Deployments → Redeploy

### 7. Memory/Performance Issues

#### "JavaScript heap out of memory"
**Solution:**
- Add to backend railway.json:
  ```json
  {
    "build": {
      "builder": "NIXPACKS",
      "buildCommand": "npm ci",
      "nixpacksPlan": {
        "phases": {
          "setup": {
            "nixPkgs": ["nodejs-18_x"]
          }
        }
      }
    }
  }
  ```

#### Slow Performance
**Check:**
1. Railway metrics (CPU/Memory usage)
2. Consider upgrading to Pro plan
3. Enable caching headers for static assets

## 🔍 How to Debug

### 1. Check Logs
```
Railway Dashboard → Service → Logs tab
```
Look for:
- Error messages
- Stack traces
- Connection failures

### 2. Test Endpoints
```bash
# Test backend health
curl https://your-backend.up.railway.app/api/health

# Should return:
{
  "status": "OK",
  "services": {
    "database": "UP",
    "redis": "N/A"
  }
}
```

### 3. Environment Variables Check
Create a temporary endpoint to verify env vars (remove in production):
```javascript
// In backend/routes/health.js (temporary)
router.get('/env-check', (req, res) => {
  res.json({
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasDripsender: !!process.env.DRIPSENDER_API_KEY,
    hasFrontendUrl: !!process.env.FRONTEND_URL,
    nodeEnv: process.env.NODE_ENV
  });
});
```

### 4. Browser Console
For frontend issues:
1. Open browser DevTools
2. Check Console for errors
3. Check Network tab for failed requests
4. Verify localStorage has auth token

## 📝 Pre-deployment Checklist

Before deploying, ensure:

- [ ] All `.env.example` values are documented
- [ ] No hardcoded API keys in code
- [ ] No `console.log` of sensitive data
- [ ] CORS properly configured
- [ ] Error handling for all API calls
- [ ] Loading states for async operations

## 🆘 Emergency Fixes

### Service Won't Start
1. Rollback to previous deployment:
   ```
   Railway → Deployments → Select working deployment → Redeploy
   ```

2. Emergency environment variable fix:
   - Can edit env vars without redeploy
   - Changes take effect on next restart

### Database Corrupted
1. Access Supabase SQL Editor
2. Run backup restore or fix queries
3. Always backup before major changes

### Complete Reset
If all else fails:
1. Delete service in Railway
2. Create new service
3. Re-add all env variables
4. Deploy again

## 📞 Getting Help

1. **Railway Discord**: Active community support
2. **Railway Status Page**: check.railway.app
3. **Logs**: Always include relevant log snippets
4. **Environment**: Mention if using free/hobby/pro tier

## 🎯 Best Practices

1. **Test Locally First**
   ```bash
   # Backend
   cd backend && npm start
   
   # Frontend  
   cd frontend && npm start
   ```

2. **Use Railway CLI** (optional but helpful)
   ```bash
   npm install -g @railway/cli
   railway login
   railway logs
   ```

3. **Monitor Resources**
   - Set up alerts for high CPU/memory
   - Check Railway metrics regularly

4. **Gradual Rollout**
   - Deploy backend first
   - Test backend endpoints
   - Then deploy frontend

Remember: Most deployment issues are related to:
- Missing environment variables
- Incorrect paths/URLs
- CORS configuration
- Build cache issues

Always check these first!