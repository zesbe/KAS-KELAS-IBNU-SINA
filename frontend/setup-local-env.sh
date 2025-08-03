#!/bin/bash

# Script to help set up local environment variables for testing

echo "🔧 Setting up local environment for testing..."
echo ""
echo "This script will help you create a .env file for local testing."
echo "You'll need to provide the actual values from your Railway environment."
echo ""

# Create .env file from .env.example
cp .env.example .env

echo "📝 Created .env file from .env.example"
echo ""
echo "Now you need to update the .env file with your actual values:"
echo ""
echo "1. Open frontend/.env in your editor"
echo "2. Replace the placeholder values with your actual Railway environment variables:"
echo ""
echo "   REACT_APP_SUPABASE_URL - Your Supabase project URL"
echo "   REACT_APP_SUPABASE_ANON_KEY - Your Supabase anon key"
echo "   REACT_APP_BACKEND_URL - Your backend URL (use Railway backend URL)"
echo "   REACT_APP_DRIPSENDER_API_KEY - Your DripSender API key"
echo "   REACT_APP_PAKASIR_SLUG - Your Pakasir slug"
echo "   REACT_APP_PAKASIR_API_KEY - Your Pakasir API key"
echo "   REACT_APP_VAPID_PUBLIC_KEY - Your VAPID public key"
echo ""
echo "3. Save the file"
echo "4. Run 'npm start' to test locally"
echo ""
echo "⚠️  IMPORTANT: Make sure .env is in your .gitignore file!"

# Check if .env is in .gitignore
if grep -q "^.env$" .gitignore; then
    echo "✅ Good: .env is already in .gitignore"
else
    echo "❌ WARNING: .env is NOT in .gitignore! Adding it now..."
    echo ".env" >> .gitignore
    echo "✅ Added .env to .gitignore"
fi