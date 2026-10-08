import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/cloudflare',
  use: { baseURL: 'http://127.0.0.1:8788', browserName: 'chromium', channel: process.env.PW_CHANNEL, trace: 'retain-on-failure' },
  webServer: { command: `${process.platform === 'win32' ? 'npm.cmd' : 'npm'} run dev:cloudflare`, url: 'http://127.0.0.1:8788', reuseExistingServer: !process.env.CI, timeout: 120000 },
  workers: 1,
});
