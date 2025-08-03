# /app Directory Solutions

## Why /app Directory?

Many deployment platforms (Railway, Heroku, etc.) expect applications to be in `/app` directory. This document provides multiple solutions.

## Solution 1: Symlink Approach (Current Implementation)

### Dockerfile with Symlink
We've updated the Dockerfiles to create symlinks:

```dockerfile
WORKDIR /frontend
RUN ln -s /frontend /app
```

**Pros:**
- Maintains our preferred directory structure
- Compatible with deployment expectations
- No code changes needed

**Cons:**
- Requires symlink permissions
- Adds complexity to Dockerfile

## Solution 2: Direct /app Usage

### Simple Dockerfile (Alternative)
Created `Dockerfile.simple` files that use `/app` directly:

```dockerfile
WORKDIR /app
```

**Pros:**
- Simpler, more standard approach
- No symlink permissions needed
- Works everywhere

**Cons:**
- Less explicit about frontend/backend separation

## Solution 3: Setup Scripts

### Automatic Setup
Created scripts to handle directory setup:
- `scripts/setup-deployment.sh` - Bash script
- `scripts/create-app-dir.js` - Node.js script

These scripts:
1. Detect application type
2. Create symlinks if possible
3. Set environment variables as fallback

## Recommendation

For Railway deployment, I recommend:

1. **Use Dockerfile.simple** - Rename to `Dockerfile` for direct `/app` usage
2. **Keep current approach** - If you prefer explicit directory names

Both work, it's a matter of preference:
- `/app` = Standard, simple, works everywhere
- `/frontend` or `/backend` = Clear separation, but needs symlinks

## How to Switch

To use the simple /app approach:

```bash
# Frontend
cd frontend
mv Dockerfile Dockerfile.complex
mv Dockerfile.simple Dockerfile

# Backend
cd backend
mv Dockerfile Dockerfile.complex
mv Dockerfile.simple Dockerfile
```

Then commit and push changes.