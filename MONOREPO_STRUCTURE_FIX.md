# Monorepo Structure Fix Documentation

## Problem
Error npm: `ENOENT: no such file or directory, open '/app/package.json'`

## Root Cause
- Railway/deployment environment mencari package.json di `/app/` directory
- Struktur project adalah monorepo dengan frontend dan backend terpisah
- Docker dan deployment configuration tidak sesuai dengan struktur monorepo

## Solutions Implemented

### 1. Nixpacks Configuration
Created `nixpacks.toml` files:
- **Root**: Handles workspace installation
- **Frontend**: Specific build configuration
- **Backend**: Specific runtime configuration

### 2. Railway Configuration Updates
Updated `railway.json` in both frontend and backend:
- Added `rootDirectory` specification
- Added `nixpacksConfigPath` reference
- Proper build commands for each service

### 3. NPM Workspace Configuration
- Created `.npmrc` for workspace configuration
- Updated root `package.json` with proper workspace scripts
- Using `--workspace` flag instead of `cd` commands

### 4. Docker Updates
- Changed WORKDIR from `/app` to `/frontend` and `/backend`
- Updated file paths in Dockerfile

### 5. Alternative Configuration
Created `railway.toml` for explicit service configuration

## How to Deploy

### Frontend
```bash
# From root directory
npm run build:frontend
npm run start:frontend
```

### Backend
```bash
# From root directory
npm run install:backend
npm run start:backend
```

### Full Monorepo
```bash
# Install all dependencies
npm install --workspaces

# Build all
npm run build
```

## File Structure
```
/
├── package.json (monorepo root)
├── .npmrc (npm configuration)
├── nixpacks.toml (root build config)
├── railway.toml (alternative config)
├── frontend/
│   ├── package.json
│   ├── nixpacks.toml
│   ├── railway.json
│   └── Dockerfile
└── backend/
    ├── package.json
    ├── nixpacks.toml
    ├── railway.json
    └── Dockerfile
```

## Key Changes
1. Use npm workspaces instead of manual directory changes
2. Explicit root directory specification in deployment configs
3. Proper WORKDIR in Docker containers
4. Nixpacks configuration for Railway deployment