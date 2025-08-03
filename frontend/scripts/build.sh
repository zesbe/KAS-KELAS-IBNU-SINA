#!/bin/bash

# Build script for Railway deployment
# This ensures environment variables are available during build time

echo "Starting build process..."
echo "Checking environment variables..."

# Check if required environment variables are set
if [ -z "$REACT_APP_SUPABASE_URL" ]; then
    echo "ERROR: REACT_APP_SUPABASE_URL is not set!"
    exit 1
fi

if [ -z "$REACT_APP_SUPABASE_ANON_KEY" ]; then
    echo "ERROR: REACT_APP_SUPABASE_ANON_KEY is not set!"
    exit 1
fi

echo "REACT_APP_SUPABASE_URL is set to: ${REACT_APP_SUPABASE_URL:0:20}..."
echo "REACT_APP_SUPABASE_ANON_KEY is set: ${REACT_APP_SUPABASE_ANON_KEY:0:20}..."

# Run the actual build
npm run build

echo "Build completed!"