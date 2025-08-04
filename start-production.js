#!/usr/bin/env node

// Production startup script for Render
process.env.NODE_ENV = 'production';

console.log('🚀 Starting Meta Build in production...');
console.log('📍 Current directory:', process.cwd());
console.log('📂 Files in directory:', require('fs').readdirSync('.'));

try {
  // Check if the built file exists
  const fs = require('fs');
  const path = require('path');
  
  const builtFile = path.join(process.cwd(), 'dist', 'index.js');
  console.log('🔍 Looking for built file at:', builtFile);
  
  if (fs.existsSync(builtFile)) {
    console.log('✅ Built file found, starting server...');
    require('./dist/index.js');
  } else {
    console.log('❌ Built file not found, trying direct server start...');
    console.log('📁 Contents of dist directory:');
    if (fs.existsSync('dist')) {
      console.log(fs.readdirSync('dist'));
    } else {
      console.log('No dist directory found');
    }
    
    // Fall back to running from source
    console.log('🔄 Falling back to tsx server...');
    const { spawn } = require('child_process');
    const server = spawn('npx', ['tsx', 'server/index.ts'], {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    server.on('error', (err) => {
      console.error('❌ Server error:', err);
      process.exit(1);
    });
  }
} catch (error) {
  console.error('💥 Startup error:', error);
  process.exit(1);
}