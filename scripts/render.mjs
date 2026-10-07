// Render chapters to silent MP4s, frame by frame.
// Usage: node scripts/render.mjs [chapterIdx ...] [--workers 3] [--fps 30] [--scale 1]
// With no chapter list, renders every chapter in src/chapters/index.js.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { startServer } from './serve.mjs';
import { launch, openChapter, seek } from './browser.mjs';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(`--${name}`); if (i < 0) return def; const v = args[i + 1]; args.splice(i, 2); return v; };
const FPS = Number(opt('fps', 30));
const WORKERS = Number(opt('workers', 3));
const OUT = path.resolve('out/parts');
fs.mkdirSync(OUT, { recursive: true });

const port = 5180;
const server = await startServer(port);
const probeBrowser = await launch();
const probe = await openChapter(probeBrowser, port, 0);
const chapterCount = await probe.evaluate(() => window.__chapters.length);
await probeBrowser.close();
const list = args.length ? args.map(Number) : [...Array(chapterCount).keys()];

const pad = (n) => String(n).padStart(2, '0');

async function renderChapter(browser, idx) {
  const page = await openChapter(browser, port, idx);
  const meta = await page.evaluate(() => ({ duration: window.__duration, subs: window.__subs, sfx: window.__sfx }));
  const frames = Math.ceil(meta.duration * FPS);
  const file = path.join(OUT, `ch${pad(idx)}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', file],
  { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c} for chapter ${idx}`)))));
  const t0 = Date.now();
  for (let f = 0; f < frames; f++) {
    await seek(page, f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95, optimizeForSpeed: true });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % (FPS * 20) === 0) {
      const el = (Date.now() - t0) / 1000;
      console.log(`ch${pad(idx)} ${(f / FPS).toFixed(0)}s / ${meta.duration.toFixed(0)}s  (${(f / Math.max(el, 0.001)).toFixed(1)} fps)`);
    }
  }
  ff.stdin.end();
  await done;
  await page.close();
  meta.frames = frames;
  meta.fps = FPS;
  fs.writeFileSync(path.join(OUT, `ch${pad(idx)}.json`), JSON.stringify(meta, null, 1));
  console.log(`✔ ch${pad(idx)} → ${file} (${meta.duration.toFixed(1)}s, ${((Date.now() - t0) / 1000).toFixed(0)}s to render)`);
}

const queue = [...list];
try {
  // One browser per worker: tabs sharing a browser get throttled in the background.
  await Promise.all(Array.from({ length: Math.min(WORKERS, queue.length) }, async () => {
    const browser = await launch();
    try { while (queue.length) await renderChapter(browser, queue.shift()); } finally { await browser.close(); }
  }));
} finally {
  server.close();
}
