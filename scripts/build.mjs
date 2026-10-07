// Assemble rendered chapters into the final video: concat + soundtrack + SRT.
// Usage: node scripts/build.mjs [chapterIdx ...] [--name github-tutorial]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { writeSoundtrack } from './music.mjs';

const args = process.argv.slice(2);
const ni = args.indexOf('--name');
const name = ni >= 0 ? args.splice(ni, 2)[1] : 'github-tutorial';
const PARTS = path.resolve('out/parts');
const OUT = path.resolve('out');
const pad = (n) => String(n).padStart(2, '0');

const list = args.length
  ? args.map(Number)
  : fs.readdirSync(PARTS).filter((f) => /^ch\d+\.json$/.test(f)).map((f) => Number(f.slice(2, 4))).sort((a, b) => a - b);
if (!list.length) throw new Error('No rendered chapters in out/parts — run render.mjs first');

let offset = 0;
const subs = [], events = [], concat = [];
for (const idx of list) {
  const meta = JSON.parse(fs.readFileSync(path.join(PARTS, `ch${pad(idx)}.json`), 'utf8'));
  const len = meta.frames / meta.fps;
  meta.subs.forEach((s) => subs.push({ start: s.start + offset, end: s.end + offset, text: s.en ? `${s.text}\n${s.en}` : s.text }));
  meta.sfx.forEach((e) => events.push({ ...e, t: e.t + offset }));
  concat.push(`file '${path.join(PARTS, `ch${pad(idx)}.mp4`).replace(/\\/g, '/')}'`);
  offset += len;
}
console.log(`${list.length} chapter(s), total ${(offset / 60).toFixed(1)} min`);

const tmp = path.join(OUT, 'tmp');
fs.mkdirSync(tmp, { recursive: true });
fs.writeFileSync(path.join(tmp, 'concat.txt'), concat.join('\n'));
const silent = path.join(tmp, 'video.mp4');
const wav = path.join(tmp, 'audio.wav');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'concat.txt'), '-c', 'copy', silent], { stdio: 'inherit' });
console.log('soundtrack…');
writeSoundtrack(wav, offset, events);
const final = path.join(OUT, `${name}.mp4`);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', final], { stdio: 'inherit' });

// SRT subtitles (also burned into the picture; this file is for players/platforms).
const ts = (t) => {
  const ms = Math.round(t * 1000);
  const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)},${String(ms % 1000).padStart(3, '0')}`;
};
const srt = subs.map((s, i) => `${i + 1}\n${ts(s.start)} --> ${ts(s.end)}\n${s.text}\n`).join('\n');
fs.writeFileSync(path.join(OUT, `${name}.srt`), '﻿' + srt);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`✔ ${final}\n✔ ${path.join(OUT, `${name}.srt`)}`);
