# Railway Monorepo Deployment Fix

## Problem
Railway is looking for `package.json` in the root directory (`/app/package.json`), but your project has a monorepo structure with separate `package.json` files in `frontend/` and `backend/` directories.

## Solution 1: Root package.json (Already Implemented)

I've created a root `package.json` that treats your project as a monorepo with npm workspaces. This allows Railway to:
1. Find the package.json in the root directory
2. Install dependencies for both frontend and backend
3. Build and run your application properly

The root `package.json` includes:
- Workspace configuration pointing to frontend and backend
- Scripts to build and start both services
- Node/npm version requirements

## Solution 2: Separate Services (Recommended for Production)

For better scalability and separation of concerns, deploy frontend and backend as separate services on Railway:

### Frontend Service Setup:
1. In Railway dashboard, create a new service
2. Connect your GitHub repo
3. Go to Settings → General
4. Set **Root Directory** to `/frontend`
5. Deploy

### Backend Service Setup:
1. Create another new service
2. Connect the same GitHub repo
3. Go to Settings → General
4. Set **Root Directory** to `/backend`
5. Deploy

## Solution 3: Using nixpacks.toml

Create a `nixpacks.toml` in your root directory:

```toml
[phases.setup]
cmds = ["cd frontend && npm install"]

[phases.build]
cmds = ["cd frontend && npm run build"]

[start]
cmd = "cd frontend && npm run serve"
```

## Environment Variables

Make sure to set these in Railway:
- `PORT` - Railway provides this automatically
- Any API URLs or environment-specific variables

## Verification Steps

1. Check Railway build logs for successful npm install
2. Verify the build command completes without errors
3. Ensure the start command finds the built files
4. Check that the service is accessible via the Railway-provided URL

## Common Issues

1. **Port Binding**: Make sure your app uses `process.env.PORT || 3000`
2. **Build Path**: Ensure serve command points to correct build directory
3. **Dependencies**: All production dependencies should be in `dependencies`, not `devDependencies`