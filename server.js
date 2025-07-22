#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Possible Next.js binary locations
const nextPaths = [
  './node_modules/next/dist/bin/next',
  './node_modules/.bin/next',
  'next'
];

function startNextServer() {
  for (const nextPath of nextPaths) {
    try {
      const fullPath = path.resolve(nextPath);
      
      // Check if the path exists (for local paths)
      if (nextPath.startsWith('./') && !fs.existsSync(fullPath)) {
        continue;
      }
      
      console.log(`Attempting to start Next.js with: ${nextPath}`);
      
      const nextProcess = spawn('node', [nextPath, 'start'], {
        stdio: 'inherit',
        env: {
          ...process.env,
          PORT: process.env.PORT || '3000',
          HOSTNAME: process.env.HOSTNAME || '0.0.0.0'
        }
      });
      
      nextProcess.on('error', (err) => {
        console.error(`Failed to start with ${nextPath}:`, err.message);
        // Try next path
      });
      
      nextProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Next.js process exited with code ${code}`);
        }
        process.exit(code);
      });
      
      // If we get here, the process started successfully
      return;
      
    } catch (error) {
      console.error(`Error with ${nextPath}:`, error.message);
      continue;
    }
  }
  
  console.error('❌ Could not start Next.js server with any method');
  process.exit(1);
}

console.log('🚀 Starting Next.js server...');
console.log('Node version:', process.version);
console.log('Working directory:', process.cwd());
console.log('PORT:', process.env.PORT || '3000');

// Debug: Check if key files exist
console.log('📁 File system check:');
console.log('- package.json exists:', fs.existsSync('./package.json'));
console.log('- .next directory exists:', fs.existsSync('./.next'));
console.log('- node_modules exists:', fs.existsSync('./node_modules'));
console.log('- next binary exists:', fs.existsSync('./node_modules/next/dist/bin/next'));

if (fs.existsSync('./node_modules')) {
  try {
    const nodeModulesContents = fs.readdirSync('./node_modules').slice(0, 10);
    console.log('- node_modules contents (first 10):', nodeModulesContents);
  } catch (e) {
    console.log('- Could not read node_modules:', e.message);
  }
}

startNextServer();