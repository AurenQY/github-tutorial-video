// Windows Terminal running Windows PowerShell (Campbell color scheme).
// Lines are pre-created at build time and revealed on the timeline, so everything stays seekable.
import { el } from './director.js';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Markup: [red]text[/]  [green]  [yellow]  [cyan]  [gray]  [b] (bright white)
const fmt = (s) => esc(s).replace(/\[(red|green|yellow|cyan|gray|b|blue)\]/g, '<span class="c-$1">').replace(/\[\/\]/g, '</span>');

const PS_ICON = `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="2" width="14" height="12" rx="2" fill="#2671be"/><path d="M4 5.2l3.2 2.8L4 10.8" stroke="#fff" stroke-width="1.4" fill="none"/><path d="M8 11h4" stroke="#fff" stroke-width="1.4"/></svg>`;

export function createTerminal(D, { cwd = 'C:\\Users\\xiaoming', title = 'Windows PowerShell', banner = true, rows = 22 } = {}) {
  const root = el(`
    <div class="scene term-scene">
      <div class="term-win">
        <div class="term-titlebar">
          <div class="term-tab">${PS_ICON}<span>${title}</span><span class="x">✕</span></div>
          <span class="term-new">＋</span><span class="term-new">⌄</span>
          <div class="term-ctrl"><span>—</span><span>☐</span><span>✕</span></div>
        </div>
        <div class="term-body"><div class="term-content"></div></div>
      </div>
    </div>`);
  D.addScene(root);
  const content = root.querySelector('.term-content');
  const LH = 21; // CSS px per line (inside the 1.5x scaled window)
  const t = { root, content, cwd, row: 0, scrolled: 0 };

  const addLine = (html, { visible = false } = {}) => {
    const line = el(`<div class="term-line">${html || '&nbsp;'}</div>`);
    content.appendChild(line);
    if (!visible) gsap.set(line, { autoAlpha: 0 });
    t.row++;
    return line;
  };
  // Keep the newest line on screen by scrolling the content up.
  const follow = () => {
    const over = t.row - rows;
    if (over > t.scrolled) {
      t.scrolled = over;
      D.tl.to(content, { y: -over * LH, duration: 0.15, ease: 'power1.out' }, D.t);
      content.__scrollWorld = over * LH * 1.5;
    }
  };

  if (banner) {
    ['Windows PowerShell', 'Copyright (C) Microsoft Corporation. All rights reserved.', '',
      'Install the latest PowerShell for new features and improvements! https://aka.ms/PSWindows', '']
      .forEach((l) => addLine(esc(l), { visible: true }));
  }

  const prompt = () => `PS ${esc(t.cwd)}&gt; `;

  // An idle prompt that is visible from the start (before the first command).
  t.idle = () => {
    const line = addLine(`${prompt()}<span class="cmd"></span><span class="term-cursor"></span>`, { visible: true });
    t.pending = line;
    return line;
  };

  // Type a command at a prompt and press Enter.
  t.cmd = (text, { cps = 14, pause = 0.35 } = {}) => {
    let line = t.pending;
    t.pending = null;
    if (!line) {
      line = addLine(`${prompt()}<span class="cmd"></span><span class="term-cursor"></span>`);
      follow();
      D.tl.to(line, { autoAlpha: 1, duration: 0.01 }, D.t);
    }
    const cmdEl = line.querySelector('.cmd');
    const cursor = line.querySelector('.term-cursor');
    D.type(cmdEl, text, { cps });
    D.wait(pause);
    D.tl.to(cursor, { autoAlpha: 0, duration: 0.01 }, D.t);
    D.sfx.push({ t: D.t, type: 'key' });
    D.wait(0.15);
    t.lastCmd = line;
    return line;
  };

  // Print output lines (with optional per-line delay).
  t.out = (lines, { stagger = 0.04, delay = 0.25 } = {}) => {
    D.wait(delay);
    const made = [];
    for (const l of lines) {
      const line = addLine(fmt(l));
      follow();
      D.tl.to(line, { autoAlpha: 1, duration: 0.01 }, D.t);
      D.wait(stagger);
      made.push(line);
    }
    return made;
  };

  // Show a fresh prompt waiting for input (cursor visible).
  t.ready = () => {
    const line = addLine(`${prompt()}<span class="cmd"></span><span class="term-cursor"></span>`);
    follow();
    D.tl.to(line, { autoAlpha: 1, duration: 0.01 }, D.t);
    t.pending = line;
    return line;
  };

  t.cd = (dir) => { t.cwd = dir; };
  return t;
}
