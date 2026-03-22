const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
    viewport: { width: 1440, height: 900 }
  },
  webServer: {
    command: 'node tests/e2e/server.js',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 10000
  }
});
