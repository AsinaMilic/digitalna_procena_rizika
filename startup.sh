#!/bin/bash

# Azure Web App startup script for Next.js
echo "Starting Next.js application..."

# Set NODE_ENV to production
export NODE_ENV=production

# Set the port (Azure sets this automatically, but fallback to 8080)
export PORT=${PORT:-8080}

# Navigate to the app directory
cd /home/site/wwwroot

# Check if Next.js is properly installed
if [ ! -f "node_modules/.bin/next" ]; then
    echo "Next.js binary not found, reinstalling dependencies..."
    npm install --production
fi

# Verify Next.js installation
echo "Verifying Next.js installation..."
node_modules/.bin/next --version

# Start the application
echo "Starting Next.js server on port $PORT..."
exec node_modules/.bin/next start -p $PORT