// Pieces shared by several chapters.
import { el } from '../core/director.js';
import { createBoard } from '../core/board.js';

// End-of-chapter recap: rows of [key, explanation].
export function recap(D, rows, zh, en, { title = '本章小结', size = 38 } = {}) {
  const b = createBoard(D, { title, kicker: '回顾' });
  const gap = Math.min(125, 640 / rows.length);
  const items = rows.map(([k, v], i) => b.text(200, 250 + i * gap, `<div class="b-row"><span class="k"><code>${k}</code></span><span>${v}</span></div>`, { anchor: 'left', size }));
  D.cut(b.root, { fade: 0.6 });
  D.cursorShow(false);
  D.sayOver('本章小结。', 'Chapter recap.');
  items.forEach((r) => D.show(r, { y: 20, dur: 0.35 }));
  D.sync(Math.max(2, rows.length * 0.8));
  D.say(zh, en);
  return b;
}

// Windows 11 Notepad window on a desktop background. Returns { root, lines: [el...], title }.
export function notepad(D, { file, lines, extraLines = 0 }) {
  const all = [...lines, ...Array(extraLines).fill('')];
  const root = el(`
    <div class="scene term-scene">
      <div class="np-win">
        <div class="np-title"><span class="np-ico"></span><span data-k="nptitle">${file} - Notepad</span><div class="np-ctrl"><span>—</span><span>☐</span><span>✕</span></div></div>
        <div class="np-menu"><span>File</span><span>Edit</span><span>View</span></div>
        <div class="np-body">${all.map((l, i) => `<div class="np-line ${i >= lines.length ? 'hid' : ''}" data-i="${i}">${l.replace(/&/g, '&amp;').replace(/</g, '&lt;') || ' '}</div>`).join('')}</div>
        <div class="np-status"><span>Ln ${all.length}, Col 1</span><span>100%</span><span>Windows (CRLF)</span><span>UTF-8</span></div>
      </div>
    </div>`);
  D.addScene(root);
  return { root, lines: [...root.querySelectorAll('.np-line')], title: root.querySelector('[data-k="nptitle"]') };
}

// Git Credential Manager sign-in window (appears on the first push).
export function gcmDialog(D, parent) {
  const n = el(`
    <div class="gcm">
      <div class="gcm-title">Git Credential Manager<span>✕</span></div>
      <div class="gcm-body">
        <svg width="56" height="56" viewBox="0 0 16 16"><path fill="#1f2328" d="${GITHUB_MARK}"/></svg>
        <div class="gcm-h">Connect to GitHub</div>
        <div class="gcm-btn" data-k="gcm-browser">Sign in with your browser</div>
        <div class="gcm-or">or</div>
        <div class="gcm-link">Sign in with a code</div>
        <div class="gcm-foot">Don't have an account? <u>Sign up</u></div>
      </div>
    </div>`);
  parent.appendChild(n);
  gsap.set(n, { autoAlpha: 0 });
  return n;
}
const GITHUB_MARK = 'M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z';
