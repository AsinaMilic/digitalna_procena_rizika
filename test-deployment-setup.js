// Test script to verify deployment setup
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing deployment setup...\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'next.config.ts',
  'server.js',
  'startup.sh',
  'web.config'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
});

// Check package.json scripts
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('\n📦 Package.json scripts:');
  console.log(`  start: ${packageJson.scripts.start}`);
  console.log(`  build: ${packageJson.scripts.build}`);
  
  if (packageJson.scripts.start === 'node server.js') {
    console.log('✅ Start script correctly configured');
  } else {
    console.log('⚠️  Start script may need adjustment');
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
  allFilesExist = false;
}

// Check Next.js config
try {
  const nextConfigContent = fs.readFileSync('next.config.ts', 'utf8');
  if (nextConfigContent.includes('output: \'standalone\'')) {
    console.log('✅ Next.js configured for standalone output');
  } else {
    console.log('⚠️  Next.js standalone output not configured');
  }
} catch (error) {
  console.log('❌ Error reading next.config.ts:', error.message);
}

console.log('\n🚀 Deployment setup check complete!');
if (allFilesExist) {
  console.log('✅ All required files are present. Ready for deployment!');
} else {
  console.log('❌ Some files are missing. Please check the setup.');
}