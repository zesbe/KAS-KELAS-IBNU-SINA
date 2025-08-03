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

// Create the runtime config script
const runtimeConfig = `
window._env_ = ${JSON.stringify(env)};
`;

// Path to index.html in build directory
const indexPath = path.join(__dirname, '..', 'build', 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('❌ build/index.html not found. Make sure to run this after building.');
  process.exit(1);
}

// Read the index.html file
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// Check if runtime config already exists
if (indexHtml.includes('window._env_')) {
  console.log('⚠️  Runtime config already injected, skipping...');
  process.exit(0);
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