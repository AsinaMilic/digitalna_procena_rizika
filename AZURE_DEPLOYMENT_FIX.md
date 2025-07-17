# Azure Deployment Fix Summary

## Problem
The Azure deployment was failing with the error:
```
Error: Cannot find module '../server/require-hook'
Require stack: - /node_modules/.bin/next
```

This indicates that the Next.js installation was incomplete or corrupted in the Azure environment.

## Solution Applied

### 1. Custom Server Entry Point
- Created `server.js` that uses Next.js programmatically instead of relying on the CLI binary
- Updated `package.json` start script to use `node server.js`

### 2. Next.js Configuration Updates
- Added `output: 'standalone'` for better Azure compatibility
- Added `serverComponentsExternalPackages: ['mssql']` for database compatibility
- Optimized for production deployment

### 3. Deployment Process Improvements
- Updated GitHub Actions workflow to handle both standalone and regular builds
- Added verification steps to ensure Next.js is properly installed
- More careful cleanup of node_modules to preserve Next.js integrity
- Added multiple deployment artifacts (server.js, startup.sh, web.config)

### 4. Backup Startup Options
- Created `startup.sh` as a fallback startup script
- Created `web.config` for IIS compatibility
- Added verification and reinstallation logic

### 5. Testing
- Added `test-deployment-setup.js` to verify local configuration
- Added `test-server.js` to test server startup

## Files Modified/Created
- ✅ `server.js` - Custom Next.js server
- ✅ `package.json` - Updated start script
- ✅ `next.config.ts` - Added standalone output and optimizations
- ✅ `startup.sh` - Backup startup script
- ✅ `web.config` - IIS configuration
- ✅ `.github/workflows/master_digitalni-registar-rizika.yml` - Improved deployment process
- ✅ `test-deployment-setup.js` - Local testing
- ✅ `test-server.js` - Server startup testing

## Next Steps
1. Commit and push these changes to trigger a new deployment
2. Monitor the Azure deployment logs to verify the fix
3. Test the deployed application functionality

The deployment should now be more robust and handle the Azure environment properly.