import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
export async function getBrowser() {
  const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright-core');
  return chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' }) });
}
