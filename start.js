const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Check if standalone server exists
const standalonePath = path.join(__dirname, '.next/standalone/server.js');

console.log('Checking for standalone server at:', standalonePath);
console.log('Current working directory:', process.cwd());
console.log('Files in current directory:', fs.readdirSync('.').filter(f => f.startsWith('.next') || f === 'node_modules'));

if (fs.existsSync(standalonePath)) {
  console.log('✅ Using Next.js standalone server...');
  
  // Set the correct working directory for standalone server
  process.chdir(__dirname);
  
  // Set environment variables that standalone server might need
  process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';
  process.env.PORT = process.env.PORT || '3000';
  
  require(standalonePath);
} else {
  console.log('⚠️ Standalone server not found, using next start...');
  console.log('Available files in .next directory:');
  
  const nextDir = path.join(__dirname, '.next');
  if (fs.existsSync(nextDir)) {
    console.log(fs.readdirSync(nextDir));
  } else {
    console.log('.next directory does not exist');
  }
  
  const nextProcess = spawn('npx', ['next', 'start'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: process.env.PORT || '3000' }
  });
  
  nextProcess.on('error', (err) => {
    console.error('Failed to start Next.js:', err);
    process.exit(1);
  });
  
  nextProcess.on('close', (code) => {
    process.exit(code);
  });
}