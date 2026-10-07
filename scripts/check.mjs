// Build every chapter headlessly and report: duration, build errors, and subtitles that wrap.
// Usage: node scripts/check.mjs [chapterIdx ...]
import { startServer } from './serve.mjs';
import { launch, openChapter } from './browser.mjs';

const port = 5181;
const server = await startServer(port);
const browser = await launch();
let total = 0, failed = 0;
try {
  const probe = await openChapter(browser, port, 0);
  const count = await probe.evaluate(() => window.__chapters.length);
  await probe.close();
  const list = process.argv.slice(2).length ? process.argv.slice(2).map(Number) : [...Array(count).keys()];
  for (const idx of list) {
    try {
      const page = await openChapter(browser, port, idx);
      const r = await page.evaluate(() => {
        const out = [];
        document.querySelectorAll('.sub').forEach((s) => {
          s.style.visibility = 'visible';
          for (const cls of ['zh', 'en']) {
            const n = s.querySelector(`.${cls}`);
            if (!n) continue;
            const lh = parseFloat(getComputedStyle(n).lineHeight);
            if (n.getBoundingClientRect().height > lh * 1.5) out.push(`${cls}: ${n.textContent}`);
          }
          s.style.visibility = '';
        });
        return { dur: window.__duration, wraps: out, title: window.__chapters[new URLSearchParams(location.search).get('chapter')].title };
      });
      total += r.dur;
      console.log(`ch${String(idx).padStart(2, '0')} ${r.title.padEnd(28)} ${(r.dur / 60).toFixed(2)} min${r.wraps.length ? `  ⚠ ${r.wraps.length} wrapping subtitle(s)` : ''}`);
      r.wraps.forEach((w) => console.log(`     ↳ ${w}`));
      await page.close();
    } catch (e) {
      failed++;
      console.log(`ch${String(idx).padStart(2, '0')} ✖ ${e.message.split('\n').slice(0, 3).join(' | ')}`);
    }
  }
  console.log(`total ${(total / 60).toFixed(1)} min${failed ? `, ${failed} chapter(s) failed` : ''}`);
} finally {
  await browser.close();
  server.close();
}
