const fs = require('fs');
const path = require('path');

// Script to create /app directory structure for deployment compatibility

console.log('Checking /app directory setup...');

const currentDir = process.cwd();
const appDir = '/app';

try {
    // Check if /app exists
    if (!fs.existsSync(appDir)) {
        console.log('/app directory not found, attempting to create symlink...');
        
        // Try to create symlink (might fail due to permissions)
        try {
            fs.symlinkSync(currentDir, appDir);
            console.log(`Created symlink: ${appDir} -> ${currentDir}`);
        } catch (symlinkError) {
            console.log('Could not create symlink (permission denied)');
            console.log('Falling back to environment-based solution');
        }
    } else {
        console.log('/app directory already exists');
    }
    
    // Alternative: Set up environment variables for compatibility
    process.env.APP_ROOT = currentDir;
    console.log(`Set APP_ROOT=${currentDir}`);
    
} catch (error) {
    console.error('Error during setup:', error.message);
}

console.log('Setup check complete');