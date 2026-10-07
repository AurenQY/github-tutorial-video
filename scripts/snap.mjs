// Grab still frames for review: node scripts/snap.mjs <chapter> <t1> <t2> ... [--out dir]
import path from 'node:path';
import fs from 'node:fs';
import { startServer } from './serve.mjs';
import { launch, openChapter, seek } from './browser.mjs';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args.splice(outIdx, 2)[1] : 'out/snaps';
const [chapter, ...times] = args;
fs.mkdirSync(outDir, { recursive: true });

const port = 5179;
const server = await startServer(port);
const browser = await launch();
try {
  const page = await openChapter(browser, port, chapter);
  const dur = await page.evaluate(() => window.__duration);
  console.log(`chapter ${chapter}: duration ${dur.toFixed(1)}s`);
  for (const t of times.map(Number)) {
    await seek(page, t);
    const file = path.join(outDir, `ch${chapter}-${String(t).padStart(6, '0')}.jpg`);
    await page.screenshot({ path: file, type: 'jpeg', quality: 85 });
    console.log(file);
  }
} finally {
  await browser.close();
  server.close();
}
