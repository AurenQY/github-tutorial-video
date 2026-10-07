import { Director } from './core/director.js';
import { loadIcons } from './core/icons.js';
import { CHAPTERS } from './chapters/index.js';

const params = new URLSearchParams(location.search);
const chapterIdx = Number(params.get('chapter') ?? 0);
const dev = params.has('dev');

const stage = document.getElementById('stage');

function fitStage() {
  if (!dev) return;
  const s = Math.min(window.innerWidth / 1920, (window.innerHeight - 48) / 1080);
  stage.style.transform = `scale(${s})`;
}

async function boot() {
  // Layout must be final before chapters measure element positions.
  if (document.readyState !== 'complete') await new Promise((r) => window.addEventListener('load', r, { once: true }));
  await loadIcons();
  await document.fonts.ready;
  fitStage();

  const tl = gsap.timeline({ paused: true });
  const D = new Director(tl, stage);
  const entry = CHAPTERS[chapterIdx];
  const mod = await import(`./chapters/${entry.file}`);
  await mod.default(D);
  D.finish();

  // Render to frame 0 so every tween captures its starting values.
  tl.seek(0.0001, false);
  tl.seek(0, false);

  window.__duration = tl.duration();
  window.__seek = (t) => { tl.seek(t, false); };
  window.__subs = D.subs;
  window.__sfx = D.sfx;
  window.__chapters = CHAPTERS;
  window.__ready = true;

  if (dev) setupDev(tl);
}

function setupDev(tl) {
  const bar = document.getElementById('dev');
  bar.hidden = false;
  document.body.classList.add('dev');
  const range = document.getElementById('dev-range');
  const time = document.getElementById('dev-time');
  const play = document.getElementById('dev-play');
  const sel = document.getElementById('dev-chapter');
  CHAPTERS.forEach((c, i) => sel.add(new Option(`${i}. ${c.title}`, i, false, i === chapterIdx)));
  sel.onchange = () => { params.set('chapter', sel.value); params.set('t', 0); location.search = params; };
  const dur = tl.duration();
  const update = () => {
    range.value = (tl.time() / dur) * 1000;
    time.textContent = `${tl.time().toFixed(1)} / ${dur.toFixed(1)}`;
    play.textContent = tl.paused() ? '▶' : '❚❚';
  };
  tl.eventCallback('onUpdate', update);
  range.oninput = () => { tl.pause(); tl.seek((range.value / 1000) * dur, false); update(); };
  play.onclick = () => { tl.paused(!tl.paused()); update(); };
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); play.onclick(); }
    if (e.code === 'ArrowRight') { tl.seek(Math.min(dur, tl.time() + 5), false); update(); }
    if (e.code === 'ArrowLeft') { tl.seek(Math.max(0, tl.time() - 5), false); update(); }
  });
  window.addEventListener('resize', fitStage);
  const t0 = Number(params.get('t') || 0);
  if (t0) tl.seek(t0, false);
  update();
}

boot().catch((e) => { console.error(e); window.__error = e.stack || String(e); document.body.insertAdjacentHTML('beforeend', `<pre style="color:red;position:fixed;top:0;left:0;z-index:99">${e.stack}</pre>`); });
