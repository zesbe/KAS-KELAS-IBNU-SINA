#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to escape special characters for HTML
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Get all REACT_APP_* environment variables
const env = Object.keys(process.env)
  .filter(key => key.startsWith('REACT_APP_'))
  .reduce((acc, key) => {
    acc[key] = escapeHtml(process.env[key] || '');
    return acc;
  }, {});

// Log what we found
console.log('🔍 Found environment variables:', Object.keys(env).length > 0 ? Object.keys(env) : 'None');

// Create the runtime config script
const runtimeConfig = `
window._env_ = ${JSON.stringify(env)};
`;

// Path to index.html in build directory
const indexPath = path.join(__dirname, '..', 'build', 'index.html');

if (!fs.existsSync(indexPath)) {
  console.warn('⚠️  build/index.html not found. This is expected during build phase.');
  // Don't exit with error during build phase
  process.exit(0);
}

// Read the index.html file
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// Check if runtime config already exists
if (indexHtml.includes('window._env_')) {
  console.log('⚠️  Runtime config already injected, updating...');
  // Remove existing config
  indexHtml = indexHtml.replace(/<script>[\s\S]*?window\._env_[\s\S]*?<\/script>/g, '');
}

// Inject the runtime config before the closing </head> tag
indexHtml = indexHtml.replace(
  '</head>',
  `<script>${runtimeConfig}</script>\n</head>`
);

// Write the modified index.html back
fs.writeFileSync(indexPath, indexHtml);

console.log('✅ Runtime environment variables injected successfully!');
console.log('Injected variables:', Object.keys(env));