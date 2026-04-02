import { spawn } from 'child_process';

const server = spawn('node', ['--import', 'tsx/esm', 'server/index.ts'], {
  env: { ...process.env, PORT: '3001' },
  stdio: 'inherit',
});

const client = spawn('npx', ['vite'], {
  stdio: 'inherit',
});

process.on('exit', () => {
  server.kill();
  client.kill();
});
