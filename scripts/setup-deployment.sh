#!/bin/bash

# Setup script for deployment environments that expect /app directory

echo "Setting up deployment environment..."

# Detect if we're in frontend or backend based on package.json
if grep -q "kas-kelas-1b" package.json 2>/dev/null; then
    echo "Detected frontend application"
    # Create symlink if /app doesn't exist
    if [ ! -e /app ]; then
        ln -s $(pwd) /app
        echo "Created symlink: /app -> $(pwd)"
    fi
elif grep -q "express" package.json 2>/dev/null; then
    echo "Detected backend application"
    # Create symlink if /app doesn't exist
    if [ ! -e /app ]; then
        ln -s $(pwd) /app
        echo "Created symlink: /app -> $(pwd)"
    fi
else
    echo "Could not detect application type"
fi

echo "Setup complete!"