// Shared headless-Chrome setup for snapshots and rendering.
import puppeteer from 'puppeteer';
import fs from 'node:fs';

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].filter(Boolean);

export async function launch() {
  const executablePath = CANDIDATES.find((p) => fs.existsSync(p));
  if (!executablePath) throw new Error('Chrome not found; set CHROME_PATH');
  return puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--hide-scrollbars', '--force-color-profile=srgb', '--font-render-hinting=none', '--disable-gpu-vsync',
      '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'],
    defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
  });
}

export async function openChapter(browser, port, chapter) {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error(`[chapter ${chapter}] page error:`, e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.error(`[chapter ${chapter}]`, m.text()); });
  await page.goto(`http://127.0.0.1:${port}/src/index.html?chapter=${chapter}`, { waitUntil: 'load' });
  await page.waitForFunction('window.__ready === true || !!window.__error', { timeout: 60000 });
  const err = await page.evaluate(() => window.__error);
  if (err) throw new Error(`chapter ${chapter} failed to build:\n${err}`);
  return page;
}

export async function seek(page, t) {
  await page.evaluate((tt) => window.__seek(tt), t);
}
