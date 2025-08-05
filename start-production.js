#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

// Production startup script for Render
process.env.NODE_ENV = 'production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Meta Build in production...');
console.log('📍 Current directory:', process.cwd());
console.log('📂 Files in directory:', fs.readdirSync('.'));

try {
  const builtFile = path.join(process.cwd(), 'dist', 'index.js');
  console.log('🔍 Looking for built file at:', builtFile);
  
  if (fs.existsSync(builtFile)) {
    console.log('✅ Built file found, starting server...');
    await import('./dist/index.js');
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