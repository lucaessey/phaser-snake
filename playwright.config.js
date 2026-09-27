import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';
export default defineConfig({
    testDir: './tests', testMatch: '*.browser.js', fullyParallel: false, workers: 1,
    timeout: 30000,
    use: {
        baseURL: 'http://127.0.0.1:4175', headless: true, screenshot: 'only-on-failure',
        launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined }
    },
    webServer: {
        command: `"${process.execPath}" "${fileURLToPath(new URL('./tests/serve.mjs', import.meta.url))}"`,
        url: 'http://127.0.0.1:4175', reuseExistingServer: false
    }
});
