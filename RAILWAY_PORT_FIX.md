# Railway Port Binding Fix

## Problem
Your Railway deployment was showing "Application failed to respond" because the application was listening on `localhost:5000` instead of `0.0.0.0:${PORT}`. Railway requires applications to:
1. Listen on all interfaces (0.0.0.0) not just localhost
2. Use the PORT environment variable provided by Railway

## Solution Applied

### 1. Created Production Serve Script
Created `frontend/scripts/serve-production.js` that:
- Listens on `0.0.0.0` (all interfaces) instead of localhost
- Uses the PORT environment variable from Railway
- Properly serves the React build with clean URLs and SPA routing

### 2. Updated Package.json
Added new script:
```json
"serve:production": "node scripts/serve-production.js"
```

### 3. Updated Railway Configuration
Updated `railway.toml` to use the new production serve script:
```toml
[deploy]
startCommand = "cd frontend && npm run serve:production"
```

### 4. Updated Nixpacks Configuration
Updated `nixpacks.toml` to use the production serve script:
```toml
[start]
cmd = "npm run serve:production"
```

## How to Deploy

1. Commit and push these changes:
```bash
git add .
git commit -m "Fix Railway port binding issue"
git push
```

2. Railway will automatically deploy the new version

3. The application should now properly respond to requests

## Verification
After deployment, check the Railway logs. You should see:
```
Server running at http://0.0.0.0:5000
```

Instead of the previous:
```
INFO  Accepting connections at http://localhost:5000
```

## Additional Notes
- The PORT environment variable is automatically provided by Railway
- The application now listens on all network interfaces (0.0.0.0)
- The serve-handler package is used for proper SPA routing support