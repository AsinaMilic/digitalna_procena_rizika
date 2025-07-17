# GitHub Actions Deployment Setup

## Quick Start Guide

### Step 1: Create Azure App Service
1. Go to Azure Portal
2. Create new App Service:
   - **Runtime Stack**: Node.js 20 LTS
   - **Operating System**: Linux (recommended)
   - **Region**: Choose closest to your users
3. Note down your app name (e.g., `digitalni-registar-rizika`)

### Step 2: Get Publish Profile
1. In Azure Portal → Your App Service
2. Click **Get publish profile** button
3. Download the `.publishsettings` file
4. Open it and copy ALL contents

### Step 3: Add GitHub Secret
1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Click **New repository secret**
3. Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
4. Value: Paste the entire publish profile content
5. Save

### Step 4: Update App Name
In `.github/workflows/azure-deploy.yml`, change:
```yaml
env:
  AZURE_WEBAPP_NAME: your-actual-app-name  # Replace this!
```

### Step 5: Configure Azure Environment Variables
In Azure Portal → App Service → Configuration → Application settings, add:

```
DB_NAME=digitalni_registar_procene_rizika
DB_USER=admin123@digitalni-registar-procene-rizika
DB_PASSWORD=your_secure_password
DB_HOST=digitalni-registar-procene-rizika.database.windows.net
DB_PORT=1433
JWT_SECRET=your_jwt_secret_here
NODE_ENV=production
WEBSITE_NODE_DEFAULT_VERSION=20-lts
```

### Step 6: Deploy
1. Push to main/master branch
2. Watch GitHub Actions tab for deployment progress
3. Visit your Azure app URL when complete

## Generate JWT Secret
Run this command to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Troubleshooting
- Check GitHub Actions logs for build errors
- Check Azure App Service logs for runtime errors
- Verify all environment variables are set correctly