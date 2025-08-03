#!/bin/bash

# Build script for frontend with environment validation

echo "🔍 Checking environment variables..."

# Required environment variables
required_vars=(
  "REACT_APP_SUPABASE_URL"
  "REACT_APP_SUPABASE_ANON_KEY"
  "REACT_APP_BACKEND_URL"
  "REACT_APP_DRIPSENDER_API_KEY"
  "REACT_APP_PAKASIR_API_KEY"
  "REACT_APP_PAKASIR_SLUG"
  "REACT_APP_VAPID_PUBLIC_KEY"
)

# Check each required variable
missing_vars=()
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
    echo "❌ $var is not set"
  else
    echo "✅ $var is set"
  fi
done

# If any variables are missing, exit with error
if [ ${#missing_vars[@]} -ne 0 ]; then
  echo "❌ Missing required environment variables: ${missing_vars[*]}"
  echo "Please set all required environment variables in Railway dashboard"
  exit 1
fi

echo "✅ All environment variables are set"
echo "🏗️ Building frontend..."

# Run the actual build
npm run build

echo "✅ Build completed successfully"