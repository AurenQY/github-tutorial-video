// Render the video cover (1920x1080 PNG) from out/cover-src.png (a frame of the video).
// Usage: node scripts/cover.mjs          → out/cover.png (16:9, 1920x1080)
//        node scripts/cover.mjs --4x3    → out/cover-4x3.png (4:3, 1440x1080)
import fs from 'node:fs';
import { launch } from './browser.mjs';

const shot = `data:image/png;base64,${fs.readFileSync('out/cover-src.png').toString('base64')}`;
const MARK = 'M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z';

const is43 = process.argv.includes('--4x3');
const W = is43 ? 1440 : 1920;
const OUT = is43 ? 'out/cover-4x3.png' : 'out/cover.png';
// 4:3: title on top, screenshot tucked into the lower right.
const css43 = `body { width: 1440px; }
  .left { left: 80px; top: 70px; width: 1300px; }
  .logo { margin-bottom: 8px; } .logo svg { width: 64px; height: 64px; } .logo span { font-size: 32px; }
  h1 { font-size: 132px; } h1 br { display: none; } h1 .g { margin-right: 34px; }
  .sub { margin-top: 16px; font-size: 50px; }
  .chips { margin-top: 28px; width: auto; }
  .shot-wrap { left: 300px; top: 560px; }
  .shot { transform: rotateY(-10deg) rotateX(8deg) rotateZ(-2deg); }`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; }
  body { width: 1920px; height: 1080px; overflow: hidden; font-family: "Microsoft YaHei", "Segoe UI", sans-serif; color: #fff;
    background: radial-gradient(900px 700px at 15% 20%, #1f3a7a 0%, transparent 60%),
                radial-gradient(900px 800px at 95% 95%, #4a2a8a 0%, transparent 60%),
                #0d1117; }
  .grid { position: absolute; inset: 0; background: radial-gradient(circle at 1px 1px, rgba(255,255,255,.07) 1.5px, transparent 0) 0 0 / 44px 44px; }
  .shot-wrap { position: absolute; left: 880px; top: 210px; width: 1300px; height: 620px; perspective: 1800px; }
  .shot { width: 1300px; height: 620px; border-radius: 22px; overflow: hidden; transform: rotateY(-14deg) rotateX(4deg) rotateZ(-1deg);
    box-shadow: 0 40px 120px rgba(0,0,0,.6), 0 0 0 2px rgba(255,255,255,.12); background: #fff url(${shot}) 0 0 / 1300px auto no-repeat; position: relative; }
  .spot { position: absolute; left: 836px; top: 262px; width: 120px; height: 46px; border: 6px solid #ffb000; border-radius: 10px; box-shadow: 0 0 0 1400px rgba(13,17,23,.5), 0 0 40px rgba(255,176,0,.8); }
  .tag { position: absolute; left: 640px; top: 330px; background: #ffb000; color: #1f2328; font-weight: 800; font-size: 34px; padding: 4px 18px; border-radius: 10px; white-space: nowrap; }
  .left { position: absolute; left: 100px; top: 120px; width: 900px; }
  .logo { display: flex; align-items: center; gap: 22px; margin-bottom: 26px; }
  .logo svg { width: 92px; height: 92px; }
  .logo span { font: 600 40px "Segoe UI", sans-serif; color: #c9d1d9; letter-spacing: 1px; }
  h1 { font-size: 150px; line-height: 1.05; font-weight: 900; letter-spacing: 2px; text-shadow: 0 8px 40px rgba(0,0,0,.5); }
  h1 .g { background: linear-gradient(90deg, #79c0ff, #a371f7 60%, #f778ba); -webkit-background-clip: text; color: transparent; }
  .sub { margin-top: 34px; font-size: 52px; font-weight: 700; color: #ffd33d; }
  .chips { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 46px; width: 780px; }
  .chip { font-size: 34px; font-weight: 700; padding: 10px 26px; border-radius: 999px; background: rgba(255,255,255,.1); border: 2px solid rgba(255,255,255,.25); }
  .chip.green { background: #1f883d; border-color: #2ea043; }
  ${is43 ? css43 : ''}
</style></head><body>
  <div class="grid"></div>
  <div class="shot-wrap"><div class="shot"><div class="spot"></div><div class="tag">这个按钮干嘛？</div></div></div>
  <div class="left">
    <div class="logo"><svg viewBox="0 0 16 16"><path fill="#fff" d="${MARK}"/></svg><span>GitHub for Beginners</span></div>
    <h1><span class="g">GitHub</span><br>新手教程</h1>
    <div class="sub">每个按钮 + 背后原理，一次学会</div>
    <div class="chips"><span class="chip green">零基础</span><span class="chip">27 分钟</span><span class="chip">中英字幕</span><span class="chip">附速查表</span></div>
  </div>
</body></html>`;

const browser = await launch();
try {
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: 1080, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: OUT, type: 'png' });
  console.log(`✔ ${OUT}`);
} finally {
  await browser.close();
}
