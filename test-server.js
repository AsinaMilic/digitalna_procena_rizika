// Simple test to verify server.js works
const { spawn } = require('child_process');

console.log('Testing server.js startup...');

const server = spawn('node', ['server.js'], {
  env: { ...process.env, NODE_ENV: 'production', PORT: '3001' }
});

server.stdout.on('data', (data) => {
  console.log(`Server output: ${data}`);
  if (data.toString().includes('Ready on')) {
    console.log('✅ Server started successfully!');
    server.kill();
    process.exit(0);
  }
});

server.stderr.on('data', (data) => {
  console.error(`Server error: ${data}`);
});

server.on('close', (code) => {
  if (code !== 0) {
    console.log(`❌ Server process exited with code ${code}`);
    process.exit(1);
  }
});

// Timeout after 30 seconds
setTimeout(() => {
  console.log('❌ Server startup timeout');
  server.kill();
  process.exit(1);
}, 30000);