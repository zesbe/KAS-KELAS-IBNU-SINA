#!/usr/bin/env node

// Debug script to check environment variables in Railway

console.log('🔍 Environment Debug Information\n');
console.log('=================================');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PWD:', process.env.PWD);
console.log('=================================\n');

const requiredVars = [
  'REACT_APP_SUPABASE_URL',
  'REACT_APP_SUPABASE_ANON_KEY',
  'REACT_APP_BACKEND_URL',
  'REACT_APP_DRIPSENDER_API_KEY',
  'REACT_APP_PAKASIR_API_KEY',
  'REACT_APP_PAKASIR_SLUG',
  'REACT_APP_VAPID_PUBLIC_KEY'
];

console.log('Required Environment Variables:');
console.log('==============================');

let allSet = true;
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Show first 20 chars for security
    const displayValue = value.length > 20 ? value.substring(0, 20) + '...' : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    allSet = false;
  }
});

console.log('\n=================================');
console.log('All REACT_APP_* variables:');
console.log('=================================');

const reactAppVars = Object.keys(process.env)
  .filter(key => key.startsWith('REACT_APP_'))
  .sort();

if (reactAppVars.length === 0) {
  console.log('❌ No REACT_APP_* variables found!');
} else {
  reactAppVars.forEach(key => {
    const value = process.env[key];
    const displayValue = value && value.length > 20 ? value.substring(0, 20) + '...' : value;
    console.log(`${key}: ${displayValue}`);
  });
}

console.log('\n=================================');
if (!allSet) {
  console.log('❌ Some required environment variables are missing!');
  console.log('Please check your Railway service variables.');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set!');
}