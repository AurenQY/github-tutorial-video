// Director: builds one GSAP timeline from a sequential "script" of actions.
// Every action is placed at this.t and (unless inside par()) advances it.
// The timeline is fully seekable, so frames can be rendered in any order.

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

// Reading time for a subtitle: ~4 CJK chars per second (slow, beginner-friendly).
export function subDuration(text) {
  const plain = stripMarks(text);
  let n = 0;
  for (const ch of plain) {
    if (/\s/.test(ch)) continue;
    n += /[　-鿿＀-￯]/.test(ch) ? 1 : 0.45;
  }
  return Math.max(2.4, n / 4 + 0.5);
}

const stripMarks = (s) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/`(.+?)`/g, '$1');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmtSub = (s) => esc(s)
  .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
  .replace(/`(.+?)`/g, '<code>$1</code>')
  .replace(/\n/g, '<br>');

export class Director {
  constructor(tl, stage) {
    this.tl = tl;
    this.stage = stage;
    this.world = stage.querySelector('#world');
    this.overlay = stage.querySelector('#overlay');
    this.subsEl = stage.querySelector('#subs');
    this.t = 0;
    this.subEnd = 0;
    this.subs = [];
    this.sfx = [];
    this.scene = null;
    this.cam = { x: 0, y: 0, scale: 1 };
    this.spot = null;
    this._par = null;

    this.cursorEl = el(`<div id="cursor"><svg width="32" height="32" viewBox="0 0 24 24"><path d="M3 2 L3 19.5 L7.6 15.4 L10.6 22 L13.6 20.7 L10.7 14.2 L16.8 14.2 Z" fill="#fff" stroke="#000" stroke-width="1.4" stroke-linejoin="round"/></svg></div>`);
    this.world.appendChild(this.cursorEl);
    this.cursor = { x: 1500, y: 760 };
    gsap.set(this.cursorEl, { x: this.cursor.x, y: this.cursor.y, autoAlpha: 0 });
  }

  // ---------- timing ----------
  _adv(d) {
    if (this._par) this._par.max = Math.max(this._par.max, this.t + d);
    else this.t += d;
  }
  wait(s) { this.t += s; return this; }
  par(fn) {
    const t0 = this.t;
    this._par = { max: t0 };
    fn();
    this.t = this._par.max;
    this._par = null;
    this.t = Math.max(this.t, t0);
    return this;
  }
  sync(extra = 0) { this.t = Math.max(this.t, this.subEnd) + extra; return this; }

  // Generic reversible state switch at the current time.
  toggle(apply, revert) {
    const p = { v: 0 };
    let last = null;
    this.tl.to(p, {
      v: 1, duration: 0.001, ease: 'none',
      onUpdate: () => { const on = p.v > 0.5; if (on !== last) { last = on; on ? apply() : revert(); } },
    }, this.t);
    return this;
  }

  // ---------- subtitles (Chinese + English) ----------
  say(text, en = '', opts = {}) {
    if (typeof en === 'object') { opts = en; en = ''; }
    const start = Math.max(this.t, this.subEnd);
    this.t = start;
    const dur = opts.dur ?? subDuration(text) + (en ? 0.3 : 0);
    const node = el(`<div class="sub"><div class="zh">${fmtSub(text)}</div>${en ? `<div class="en">${fmtSub(en)}</div>` : ''}</div>`);
    this.subsEl.appendChild(node);
    this.tl.to(node, { autoAlpha: 1, duration: 0.2 }, start);
    this.tl.to(node, { autoAlpha: 0, duration: 0.2 }, start + dur - 0.2);
    this.subs.push({ start, end: start + dur, text: stripMarks(text), en: stripMarks(en) });
    this.subEnd = start + dur;
    if (opts.wait !== false) this.t = start + dur;
    return this;
  }
  // Subtitle that runs while the following actions play.
  sayOver(text, en = '', opts = {}) {
    if (typeof en === 'object') { opts = en; en = ''; }
    return this.say(text, en, { ...opts, wait: false });
  }

  // ---------- scenes ----------
  addScene(node) {
    node.classList.add('scene');
    this.world.insertBefore(node, this.cursorEl);
    gsap.set(node, { autoAlpha: 0 });
    return node;
  }
  cut(scene, { fade = 0.5 } = {}) {
    this.sync();
    const t = this.t;
    if (this.spot) { this.tl.to(this.spot, { autoAlpha: 0, duration: fade }, t); this.spot = null; }
    if (this.scene) this.tl.to(this.scene, { autoAlpha: 0, duration: fade }, t);
    this.tl.to(scene, { autoAlpha: 1, duration: fade }, t);
    if (this.cam.scale !== 1 || this.cam.x || this.cam.y) {
      this.tl.to(this.world, { x: 0, y: 0, scale: 1, duration: fade, ease: 'power2.inOut' }, t);
      this.cam = { x: 0, y: 0, scale: 1 };
    }
    this.scene = scene;
    this.t = t + fade;
    return this;
  }

  // ---------- show / hide ----------
  show(node, { dur = 0.35, y = 0, scale = null, at = null } = {}) {
    const vars = { autoAlpha: 1, duration: dur, ease: 'power2.out' };
    const from = { autoAlpha: 0 };
    if (y) { from.y = y; vars.y = 0; }
    if (scale !== null) { from.scale = scale; vars.scale = 1; }
    this.tl.fromTo(node, from, { ...vars, immediateRender: false }, at ?? this.t);
    if (at === null) this._adv(dur);
    return this;
  }
  hide(node, { dur = 0.3 } = {}) {
    this.tl.to(node, { autoAlpha: 0, duration: dur }, this.t);
    this._adv(dur);
    return this;
  }
  tween(node, vars, { advance = true } = {}) {
    const dur = vars.duration ?? 0.5;
    this.tl.to(node, { duration: dur, ease: 'power2.inOut', ...vars }, this.t);
    if (advance) this._adv(dur);
    return this;
  }

  // ---------- geometry ----------
  stageScale() { return this.stage.getBoundingClientRect().width / 1920; }
  rectOf(node) {
    const s = this.stageScale();
    const w = this.world.getBoundingClientRect();
    const r = node.getBoundingClientRect();
    let x = (r.left - w.left) / s, y = (r.top - w.top) / s;
    for (let n = node; n && n !== this.world; n = n.parentElement) {
      if (n.__scrollWorld) y -= n.__scrollWorld;
    }
    return { x, y, w: r.width / s, h: r.height / s };
  }
  unionRect(...nodes) {
    const rs = nodes.map((n) => this.rectOf(n));
    const x = Math.min(...rs.map((r) => r.x)), y = Math.min(...rs.map((r) => r.y));
    const x2 = Math.max(...rs.map((r) => r.x + r.w)), y2 = Math.max(...rs.map((r) => r.y + r.h));
    return { x, y, w: x2 - x, h: y2 - y };
  }
  center(node) { const r = this.rectOf(node); return { x: r.x + r.w / 2, y: r.y + r.h / 2 }; }

  // Virtual page scroll: translate a page and remember the offset for rectOf().
  scroll(page, y, { dur = 0.8, scale = 1.5 } = {}) {
    this.tl.to(page, { y: -y, duration: dur, ease: 'power2.inOut' }, this.t);
    page.__scrollWorld = y * scale;
    this._adv(dur);
    return this;
  }

  // ---------- camera ----------
  camera(target, { zoom, dur = 1, cy = 470, ease = 'power2.inOut', advance = true } = {}) {
    let x = 0, y = 0, scale = 1;
    if (target) {
      const r = target.nodeType ? this.rectOf(target) : target;
      const z = zoom ?? clamp(Math.min(1300 / r.w, 560 / r.h), 1.15, 2.6);
      scale = z;
      // Too wide to fit after zooming: show its left part (where text starts) instead of its empty middle.
      const cx = r.w * z > 1760 ? r.x + (960 - 80) / z : r.x + r.w / 2;
      x = clamp(960 - cx * z, 1920 - 1920 * z, 0);
      y = clamp(cy - (r.y + r.h / 2) * z, 1080 - 1080 * z, 0);
    }
    this.tl.to(this.world, { x, y, scale, duration: dur, ease }, this.t);
    this.cam = { x, y, scale };
    if (advance) this._adv(dur);
    return this;
  }

  // Zoom toward an element, dim everything else and show a name tag.
  focus(target, { label = '', zoom, dur = 1, pad = 6, camera = true, cy } = {}) {
    const t0 = this.t;
    if (this.spot) { this.tl.to(this.spot, { autoAlpha: 0, duration: 0.3 }, t0); this.spot = null; }
    const r = target.nodeType ? this.rectOf(target) : target;
    let z = this.cam.scale;
    if (camera) {
      this.camera(r, { zoom, dur, cy, advance: false });
      z = this.cam.scale;
    }
    const below = r.y < 170;
    const box = el(`<div class="spot"><div class="spot-label ${below ? 'below' : ''}" style="font-size:${30 / z}px;padding:${6 / z}px ${14 / z}px;border-radius:${8 / z}px;${below ? 'top' : 'bottom'}:calc(100% + ${14 / z}px)">${label}</div></div>`);
    if (!label) box.firstElementChild.remove();
    Object.assign(box.style, {
      left: `${r.x - pad}px`, top: `${r.y - pad}px`, width: `${r.w + pad * 2}px`, height: `${r.h + pad * 2}px`,
      borderWidth: `${4 / z}px`, borderRadius: `${8 / z}px`,
    });
    this.world.insertBefore(box, this.cursorEl);
    gsap.set(box, { autoAlpha: 0 });
    this.tl.to(box, { autoAlpha: 1, duration: 0.45 }, t0 + dur * 0.5);
    this.spot = box;
    this._adv(dur);
    return this;
  }
  unfocus({ camera = true, dur = 0.6 } = {}) {
    if (this.spot) this.tl.to(this.spot, { autoAlpha: 0, duration: Math.min(dur, 0.4) }, this.t);
    this.spot = null;
    if (camera) this.camera(null, { dur, advance: false });
    this._adv(dur);
    return this;
  }

  // ---------- cursor ----------
  cursorShow(on = true) {
    this.tl.to(this.cursorEl, { autoAlpha: on ? 1 : 0, duration: 0.25 }, this.t);
    return this;
  }
  move(target, { dur, dx = 0, dy = 0 } = {}) {
    const p = target.nodeType ? this.center(target) : target;
    const x = p.x + dx, y = p.y + dy;
    const dist = Math.hypot(x - this.cursor.x, y - this.cursor.y);
    const d = dur ?? clamp(0.45 + dist / 2600, 0.45, 1.1);
    this.tl.to(this.cursorEl, { x, y, duration: d, ease: 'power2.inOut' }, this.t);
    this.cursor = { x, y };
    this._adv(d);
    return this;
  }
  click({ sound = true } = {}) {
    const rip = el('<div class="ripple"></div>');
    this.world.insertBefore(rip, this.cursorEl);
    gsap.set(rip, { x: this.cursor.x, y: this.cursor.y, autoAlpha: 0, scale: 0 });
    this.tl.fromTo(rip, { autoAlpha: 0.8, scale: 0.2 }, { autoAlpha: 0, scale: 1, duration: 0.5, ease: 'power2.out', immediateRender: false }, this.t);
    this.tl.to(this.cursorEl, { scale: 0.82, duration: 0.08, yoyo: true, repeat: 1, transformOrigin: '0 0' }, this.t);
    if (sound) this.sfx.push({ t: this.t, type: 'click' });
    this._adv(0.35);
    return this;
  }
  moveClick(target, opts) { this.move(target, opts); return this.click(); }

  // ---------- typing ----------
  type(node, text, { cps = 12, sound = true, caret = null } = {}) {
    const base = node.__text ?? node.textContent;
    const full = base + text;
    node.__text = full;
    const chars = [...text];
    const dur = chars.length / cps;
    const p = { n: 0 };
    this.tl.to(p, {
      n: chars.length, duration: dur, ease: 'none',
      onUpdate: () => { node.textContent = base + chars.slice(0, Math.round(p.n)).join(''); },
    }, this.t);
    if (caret) this.tl.set(caret, { autoAlpha: 1 }, this.t);
    if (sound) chars.forEach((c, i) => { if (c.trim()) this.sfx.push({ t: this.t + i / cps, type: 'key' }); });
    this._adv(dur);
    return this;
  }
  // Replace text instantly (reversible).
  setText(node, text) {
    const before = node.__text ?? node.textContent;
    node.__text = text;
    return this.toggle(() => { node.textContent = text; }, () => { node.textContent = before; });
  }
  setClass(node, cls, on = true) {
    return this.toggle(() => node.classList.toggle(cls, on), () => node.classList.toggle(cls, !on));
  }

  // ---------- chapter title card ----------
  titleCard(kicker, title, { hold = 2.6, en = '' } = {}) {
    this.sync();
    const card = el(`<div class="title-card"><div class="tc-kicker">${kicker}</div><div class="tc-title">${title}</div>${en ? `<div class="tc-en">${en}</div>` : ''}<div class="tc-line"></div></div>`);
    this.overlay.insertBefore(card, this.subsEl);
    gsap.set(card, { autoAlpha: 0 });
    const t = this.t;
    this.tl.to(card, { autoAlpha: 1, duration: 0.5 }, t);
    this.tl.fromTo(card.querySelector('.tc-title'), { y: 30 }, { y: 0, duration: 0.8, ease: 'power3.out', immediateRender: false }, t);
    this.tl.fromTo(card.querySelector('.tc-line'), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power3.out', immediateRender: false }, t + 0.2);
    this.tl.to(card, { autoAlpha: 0, duration: 0.5 }, t + hold);
    this.sfx.push({ t, type: 'whoosh' });
    this.t = t + hold + 0.5;
    return this;
  }

  finish() {
    this.sync(1.2);
    this.tl.to({}, { duration: 0.001 }, this.t);
  }
}
