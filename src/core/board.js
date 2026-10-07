// Board: a dark "whiteboard" scene for explaining how things work (native 1920x1080 coordinates).
import { el } from './director.js';

const NS = 'http://www.w3.org/2000/svg';

export function createBoard(D, { title = '', kicker = '原理' } = {}) {
  const root = el(`<div class="board"><svg class="board-svg" width="1920" height="1080"><defs>
      <marker id="ah-${D.t | 0}-${Math.random().toString(36).slice(2, 6)}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker>
    </defs></svg>
    ${title ? `<div class="board-title"><span class="kicker">${kicker}</span>${title}</div>` : ''}</div>`);
  D.addScene(root);
  const svg = root.querySelector('svg');
  const markerId = svg.querySelector('marker').id;
  const b = { root, svg };

  const place = (node, x, y, anchor = 'center') => {
    node.style.left = `${x}px`; node.style.top = `${y}px`;
    root.appendChild(node);
    gsap.set(node, { autoAlpha: 0, xPercent: anchor === 'center' ? -50 : anchor === 'left' ? 0 : -100, yPercent: -50 });
    return node;
  };
  // Wrapper so GSAP scale tweens don't clobber the centering translate.
  const wrap = (inner, x, y, anchor) => {
    const w = el('<div class="bw"></div>');
    w.appendChild(inner);
    return place(w, x, y, anchor);
  };

  b.text = (x, y, html, { size = 34, color = '#e6edf3', weight = 500, anchor = 'center', mono = false, width } = {}) =>
    wrap(el(`<div class="b-text" style="font-size:${size}px;color:${color};font-weight:${weight};${mono ? 'font-family:Cascadia Mono,Consolas,Microsoft YaHei,monospace;' : ''}${width ? `width:${width}px;white-space:normal;` : ''}text-align:${anchor === 'left' ? 'left' : anchor === 'right' ? 'right' : 'center'}">${html}</div>`), x, y, anchor);

  // (x, y) is the circle's center; labels hang below it.
  b.node = (x, y, { label = '', sub = '', color = '#2f81f7', r = 46, icon = '' } = {}) => {
    const w = wrap(el(`<div class="b-node"><div class="dot" style="width:${r * 2}px;height:${r * 2}px;background:${color};box-shadow:0 0 0 6px ${color}33, 0 0 30px ${color}66">${icon}</div>${label ? `<div class="lab">${label}</div>` : ''}${sub ? `<div class="sub2">${sub}</div>` : ''}</div>`), x, y - r);
    gsap.set(w, { yPercent: 0, transformOrigin: `50% ${r}px` });
    return w;
  };

  b.box = (x, y, w, h, { title = '', html = '', color = '#2f81f7', fill = '#161b22' } = {}) =>
    wrap(el(`<div class="b-box" style="width:${w}px;height:${h}px;border-color:${color};background:${fill}">${title ? `<div class="bt" style="color:${color}">${title}</div>` : ''}<div class="bb">${html}</div></div>`), x, y);

  b.chip = (x, y, html, { color = '#2f81f7', size = 28 } = {}) =>
    wrap(el(`<div class="b-chip" style="border-color:${color};font-size:${size}px">${html}</div>`), x, y);

  b.arrow = (x1, y1, x2, y2, { color = '#7d8590', width = 5, dashed = false, curve = 0, head = true } = {}) => {
    const p = document.createElementNS(NS, 'path');
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - curve;
    p.setAttribute('d', curve ? `M${x1},${y1} Q${mx},${my} ${x2},${y2}` : `M${x1},${y1} L${x2},${y2}`);
    p.setAttribute('stroke', color); p.setAttribute('stroke-width', width); p.setAttribute('fill', 'none'); p.setAttribute('stroke-linecap', 'round');
    if (head) p.setAttribute('marker-end', `url(#${markerId})`);
    svg.appendChild(p);
    const len = p.getTotalLength();
    p.__len = len;
    p.__dashed = dashed;
    if (dashed) p.style.strokeDasharray = '14 12';
    else { p.style.strokeDasharray = `${len} ${len}`; p.style.strokeDashoffset = `${len}`; }
    gsap.set(p, { autoAlpha: 0 });
    return p;
  };
  return b;
}

// Animate an arrow being drawn.
export function draw(D, path, { dur = 0.6, at = null } = {}) {
  const t = at ?? D.t;
  if (path.__dashed) {
    D.tl.to(path, { autoAlpha: 1, duration: dur }, t);
  } else {
    D.tl.to(path, { autoAlpha: 1, duration: 0.01 }, t);
    D.tl.fromTo(path, { strokeDashoffset: path.__len }, { strokeDashoffset: 0, duration: dur, ease: 'power2.inOut', immediateRender: false }, t);
  }
  if (at === null) D._adv(dur);
  return D;
}

// Pop an element in (scale + fade).
export function pop(D, node, { dur = 0.45, at = null } = {}) {
  const t = at ?? D.t;
  D.tl.fromTo(node, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: dur, ease: 'back.out(1.8)', immediateRender: false }, t);
  if (at === null) D._adv(dur);
  return D;
}
