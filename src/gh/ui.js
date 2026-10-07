// GitHub page builders. Each returns an HTML string; key elements carry data-k="..." so chapters can target them.
import { oc } from '../core/icons.js';
import { el } from '../core/director.js';

export const q = (root, k) => {
  const n = root.querySelector(`[data-k="${k}"]`);
  if (!n) throw new Error(`data-k="${k}" not found`);
  return n;
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------- identicon (GitHub's default avatar style) ----------
function hash(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
export function identicon(seed, size = 20) {
  const h = hash(seed);
  const hue = h % 360;
  const color = `hsl(${hue} 55% 58%)`;
  let cells = '';
  for (let y = 0; y < 5; y++) for (let x = 0; x < 3; x++) {
    if ((h >> ((y * 3 + x) % 31)) & 1) {
      cells += `<rect x="${x + 0.5}" y="${y + 0.5}" width="1" height="1"/>`;
      if (x < 2) cells += `<rect x="${4 - x + 0.5}" y="${y + 0.5}" width="1" height="1"/>`;
    }
  }
  return `<svg class="avatar" width="${size}" height="${size}" viewBox="0 0 6 6" shape-rendering="crispEdges"><rect width="6" height="6" fill="#f0f0f0"/><g fill="${color}">${cells}</g></svg>`;
}

// ---------- browser window ----------
export function createBrowser(D, { url, title = 'GitHub' }) {
  const root = el(`
    <div class="scene" style="background:#fff">
      <div class="browser">
        <div class="br-tabs">
          <div class="br-tab">${oc('mark-github', 16)}<span data-k="tabtitle">${esc(title)}</span><span class="x">✕</span></div>
          <div class="br-win"><span>—</span><span>☐</span><span>✕</span></div>
        </div>
        <div class="br-bar">
          <span class="nav">←</span><span class="nav">→</span><span class="nav">↻</span>
          <div class="br-url">${oc('lock', 12)}<span data-k="url">${esc(url)}</span></div>
          <span class="nav">☆</span><span class="nav">${identicon('xiaoming-dev', 22)}</span><span class="nav">⋮</span>
        </div>
        <div class="br-view"><div class="br-progress"></div></div>
      </div>
    </div>`);
  D.addScene(root);
  const view = root.querySelector('.br-view');
  const progress = root.querySelector('.br-progress');
  const urlEl = q(root, 'url');
  const b = { root, view, current: null };
  b.add = (html) => {
    const page = el(`<div class="page gh">${html}</div>`);
    view.appendChild(page);
    if (!b.current) { b.current = page; } else gsap.set(page, { autoAlpha: 0 });
    return page;
  };
  // Navigate: progress bar + swap page + URL change.
  b.goto = (page, newUrl) => {
    const t = D.t;
    D.tl.fromTo(progress, { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 0.45, ease: 'power1.out', immediateRender: false }, t);
    D.tl.to(progress, { autoAlpha: 0, duration: 0.15 }, t + 0.45);
    if (b.current) D.tl.to(b.current, { autoAlpha: 0, duration: 0.2 }, t + 0.3);
    D.tl.to(page, { autoAlpha: 1, duration: 0.2 }, t + 0.3);
    if (newUrl) { D.t = t + 0.35; D.setText(urlEl, newUrl); }
    b.current = page;
    D.t = t + 0.6;
  };
  // Client-side switch (no page load): quick crossfade.
  b.swap = (page, newUrl) => {
    const t = D.t;
    if (b.current) D.tl.to(b.current, { autoAlpha: 0, duration: 0.15 }, t);
    D.tl.to(page, { autoAlpha: 1, duration: 0.15 }, t);
    if (newUrl) D.setText(urlEl, newUrl);
    b.current = page;
    D.t = t + 0.2;
  };
  // Overlay inside the page area (dialogs, menus) — hidden until shown.
  b.overlay = (html) => {
    const n = el(html);
    view.appendChild(n);
    gsap.set(n, { autoAlpha: 0 });
    return n;
  };
  return b;
}

// ---------- floating UI placed in world coordinates (above the spotlight dim) ----------
// GitHub-style tooltip above (or below) a target element.
export function tooltip(D, target, text, { below = false } = {}) {
  const r = D.rectOf(target);
  const tip = el(`<div class="gh-tip ${below ? 'below' : ''}">${esc(text)}</div>`);
  tip.style.left = `${r.x + r.w / 2}px`;
  tip.style.top = `${below ? r.y + r.h + 12 : r.y - 12}px`;
  D.world.insertBefore(tip, D.cursorEl);
  gsap.set(tip, { autoAlpha: 0, xPercent: -50, yPercent: below ? 0 : -100 });
  return tip;
}

// Chrome's download bubble under the toolbar.
export function downloadBubble(D, name, size) {
  const n = el(`
    <div class="chrome-dl">
      <div class="h">Recent download history<span>✕</span></div>
      <div class="r"><div class="ic">${oc('file', 16)}</div><div><div class="fn">${esc(name)}</div><div class="sz">${size} • Done</div></div></div>
    </div>`);
  D.world.insertBefore(n, D.cursorEl);
  gsap.set(n, { autoAlpha: 0 });
  return n;
}

// Raw file view: plain text exactly as Chrome shows a text/plain response.
export function rawPage(lines) {
  return `<pre class="raw-pre">${lines.map(esc).join('\n')}</pre>`;
}

// ---------- header ----------
const TABS = [
  ['code', 'Code', 'code'], ['issues', 'Issues', 'issue-opened'], ['pulls', 'Pull requests', 'git-pull-request'],
  ['actions', 'Actions', 'play'], ['projects', 'Projects', 'table'], ['wiki', 'Wiki', 'book'],
  ['security', 'Security', 'shield'], ['insights', 'Insights', 'graph'], ['settings', 'Settings', 'gear'],
];
export function header(s, { tab = 'code', crumbs = true } = {}) {
  const counts = { issues: s.issues || 0, pulls: s.pulls || 0 };
  return `
  <header class="gh-header">
    <div class="top">
      <span class="ibtn" data-k="menu">${oc('three-bars', 16)}</span>
      <span class="logo" data-k="logo">${oc('mark-github', 32)}</span>
      ${crumbs ? `<nav class="gh-crumbs"><a data-k="crumb-owner">${s.owner}</a><span class="sep">/</span><a class="b" data-k="crumb-repo">${s.repo}</a></nav>` : `<nav class="gh-crumbs"><a class="b">Dashboard</a></nav>`}
      <div class="right">
        <div class="gh-search">${oc('search', 16)}<span>Type <kbd>/</kbd> to search</span></div>
        <span class="divider-v"></span>
        <span class="ibtn wide">${oc('copilot', 16)}${oc('triangle-down', 16)}</span>
        <span class="divider-v"></span>
        <span class="ibtn wide" data-k="plus">${oc('plus', 16)}${oc('triangle-down', 16)}</span>
        <span class="ibtn">${oc('issue-opened', 16)}</span>
        <span class="ibtn">${oc('git-pull-request', 16)}</span>
        <span class="ibtn">${oc('inbox', 16)}</span>
        ${identicon(s.owner, 32)}
      </div>
    </div>
    ${crumbs ? `<nav class="gh-tabs">${TABS.map(([k, name, icon]) => `
      <span class="gh-tab ${k === tab ? 'sel' : ''}" data-k="tab-${k}">${oc(icon, 16)}${name}${counts[k] ? `<span class="Counter">${counts[k]}</span>` : ''}</span>`).join('')}
    </nav>` : '<div style="height:8px"></div>'}
  </header>`;
}

export function titleRow(s) {
  const mine = s.mine !== false;
  const starIcon = s.starred ? oc('star-fill', 16, '', 'color:#eac54f') : oc('star', 16);
  return `
  <div class="gh-titlerow" ${s.forkedFrom ? 'style="padding-bottom:28px;position:relative"' : ''}>
    ${identicon(s.owner, 24)}
    <span class="name" data-k="reponame">${s.repo}</span>
    <span class="Label" data-k="visibility">${s.private ? 'Private' : 'Public'}</span>
    ${s.forkedFrom ? `<div class="gh-fork-note" data-k="forknote" style="position:absolute;left:32px;top:52px;margin:0">forked from <a>${s.forkedFrom}</a></div>` : ''}
    <div class="actions">
      ${mine ? `<span class="btn btn-sm" data-k="pin">${oc('pin', 16)}Pin</span>` : ''}
      <span class="btn btn-sm" data-k="watch">${oc('eye', 16)}${mine ? 'Unwatch' : 'Watch'}<span class="Counter">${s.watching ?? 1}</span>${oc('triangle-down', 16, 'caret')}</span>
      <span class="gh-split" data-k="fork"><span class="btn btn-sm" data-k="forkbtn">${oc('repo-forked', 16)}Fork<span class="Counter">${s.forks ?? 0}</span></span><span class="btn btn-sm">${oc('triangle-down', 16)}</span></span>
      <span class="gh-split" data-k="star"><span class="btn btn-sm" data-k="starbtn">${starIcon}${s.starred ? 'Starred' : 'Star'}<span class="Counter">${s.stars ?? 0}</span></span><span class="btn btn-sm">${oc('triangle-down', 16)}</span></span>
    </div>
  </div>`;
}

const fileIcon = (f) => f.type === 'dir' ? oc('file-directory-fill', 16, 'dir') : oc('file', 16, 'fil');

// ---------- repo overview page ----------
export function overview(s) {
  const L = s.latest;
  return `
  ${header(s)}
  <div class="gh-container">
    ${titleRow(s)}
    <div class="gh-layout">
      <div class="gh-main">
        ${s.banner || ''}
        <div class="gh-toolbar">
          <span class="btn" data-k="branch">${oc('git-branch', 16)}<b>${s.branch || 'main'}</b>${oc('triangle-down', 16, 'caret')}</span>
          <span class="linkish" data-k="branches">${oc('git-branch', 16)}<b>${s.branches || 1}</b> Branch${(s.branches || 1) > 1 ? 'es' : ''}</span>
          <span class="linkish" data-k="tags">${oc('tag', 16)}<b>${s.tags || 0}</b> Tags</span>
          <div class="gh-gotofile" data-k="gotofile">${oc('search', 16)}<span>Go to file</span><kbd>t</kbd></div>
          <span class="btn" data-k="addfile">Add file${oc('triangle-down', 16, 'caret')}</span>
          <span class="btn btn-primary" data-k="codebtn">${oc('code', 16)}Code${oc('triangle-down', 16, 'caret')}</span>
        </div>
        <div class="gh-box" data-k="files">
          <div class="gh-commitbar" data-k="commitbar">
            ${identicon(L.user, 20)}<span class="b">${L.user}</span><span class="msg" data-k="latestmsg">${esc(L.msg)}</span>
            <div class="meta"><span class="mono" data-k="latesthash">${L.hash}</span><span>·</span><span>${L.time}</span>
              <span class="hist" data-k="commits">${oc('history', 16)}${s.commits} Commits</span></div>
          </div>
          ${s.files.map((f) => `
          <div class="gh-file" data-k="file-${f.name}">
            <span class="n">${fileIcon(f)}<span>${esc(f.name)}</span></span>
            <span class="m">${esc(f.msg)}</span><span class="d">${f.time}</span>
          </div>`).join('')}
        </div>
        <div class="gh-box" data-k="readme">
          <div class="gh-readme-head"><span class="tab">${oc('book', 16)}README</span><span class="grow"></span><span class="ibtn plain">${oc('pencil', 16)}</span><span class="ibtn plain">${oc('list-unordered', 16)}</span></div>
          <div class="markdown-body">${s.readmeHtml}</div>
        </div>
      </div>
      <aside class="gh-side" data-k="about">
        <section>
          <h2>About ${oc('gear', 16)}</h2>
          <p class="desc">${esc(s.desc)}</p>
          <div class="item">${oc('book', 16)}Readme</div>
          <div class="item">${oc('pulse', 16)}Activity</div>
          <div class="item">${oc('star', 16)}<b>${s.stars ?? 0}</b> stars</div>
          <div class="item">${oc('eye', 16)}<b>${s.watching ?? 1}</b> watching</div>
          <div class="item">${oc('repo-forked', 16)}<b>${s.forks ?? 0}</b> forks</div>
        </section>
        <section data-k="releases"><h2>Releases</h2><div class="muted">No releases published<br><a>Create a new release</a></div></section>
        <section><h2>Packages</h2><div class="muted">No packages published<br><a>Publish your first package</a></div></section>
        ${s.langs.length ? '' : '<!--'}<section data-k="languages"><h2>Languages</h2>
          <div class="gh-lang-bar">${s.langs.map((l) => `<span style="width:${l.pct}%;background:${l.color}"></span>`).join('')}</div>
          ${s.langs.map((l) => `<span class="gh-lang"><i style="background:${l.color}"></i><b style="color:var(--fgColor-default)">${l.name}</b> ${l.pct}%</span>`).join(' ')}
        </section>${s.langs.length ? '' : '-->'}
      </aside>
    </div>
  </div>`;
}

// ---------- syntax highlight (tiny) ----------
export function hl(line, lang) {
  const t = esc(line);
  if (lang === 'md') {
    if (/^#{1,6} /.test(line)) return `<span class="tok-h">${t}</span>`;
    return t.replace(/^(- )/, '<span class="tok-k">$1</span>').replace(/(`[^`]+`)/g, '<span class="tok-s">$1</span>');
  }
  if (lang === 'py') {
    return t
      .replace(/(&quot;|")(.*?)(\1)/g, '<span class="tok-s">"$2"</span>')
      .replace(/\b(def|return|import|from|if|else|for|in)\b/g, '<span class="tok-k">$1</span>')
      .replace(/\b(print|input)\b/g, '<span class="tok-f">$1</span>')
      .replace(/(#.*)$/, '<span class="tok-c">$1</span>');
  }
  return t;
}

export function codeLines(lines, lang, { dataPrefix = 'line' } = {}) {
  return lines.map((ln, i) => `<div class="ln" data-k="${dataPrefix}-${i + 1}"><span class="no">${i + 1}</span><span class="tx">${hl(ln, lang) || ' '}</span></div>`).join('');
}

// ---------- file tree (left panel on blob/edit pages) ----------
function tree(s, selected) {
  return `
  <aside class="gh-tree" data-k="tree">
    <div class="head">${oc('sidebar-expand', 16, '', 'color:var(--fgColor-muted)')}Files</div>
    <div class="tools"><span class="btn" style="flex:1">${oc('git-branch', 16)}main${oc('triangle-down', 16, 'caret')}</span><span class="ibtn">${oc('plus', 16)}</span><span class="ibtn">${oc('search', 16)}</span></div>
    <div class="gh-gotofile" style="width:auto;margin:0 0 12px">${oc('search', 16)}<span>Go to file</span><kbd>t</kbd></div>
    ${s.files.map((f) => `<div class="item ${f.name === selected ? 'sel' : ''}">${f.type === 'dir' ? oc('chevron-right', 12, '', 'color:var(--fgColor-muted)') : '<span style="width:12px"></span>'}${fileIcon(f)}<span>${esc(f.name)}</span></div>`).join('')}
  </aside>`;
}

// ---------- blob (single file) page ----------
function blameBody(groups, lang) {
  let no = 0;
  return `<div class="gh-blame" data-k="body">${groups.map((g, gi) => `
    <div class="br" data-k="blame-${gi}">
      <div class="meta"><span class="age-bar" style="background:${g.color || '#fb8f44'}"></span><span class="age">${g.age}</span>${identicon(g.user, 16)}<span class="m">${esc(g.msg)}</span></div>
      <div class="lines">${g.lines.map((ln) => { no++; return `<div class="ln" style="display:flex"><span class="no" style="width:44px;padding-right:12px;text-align:right;color:var(--fgColor-muted)">${no}</span><span class="tx" style="white-space:pre">${hl(ln, lang) || ' '}</span></div>`; }).join('')}</div>
    </div>`).join('')}</div>`;
}

export function blobPage(s, file, { mode = 'code', lang = 'md', lines, previewHtml = '', blame = null } = {}) {
  const L = file.latest || s.latest;
  const isMd = lang === 'md';
  const bytes = lines.join('\n').length * 2;
  return `
  ${header(s)}
  <div class="gh-blob">
    ${tree(s, file.name)}
    <div class="gh-blob-main">
      <div class="gh-blob-crumb"><span class="repo">${s.repo}</span><span class="sep">/</span><span class="file" data-k="filename">${file.name}</span><span class="ibtn plain" style="width:28px;height:28px">${oc('copy', 16)}</span></div>
      <div class="gh-latest" data-k="latest">${identicon(L.user, 20)}<span class="b">${L.user}</span><span class="msg" data-k="latestmsg">${esc(L.msg)}</span>
        <div class="meta"><span class="mono" data-k="latesthash">${L.hash}</span><span>·</span><span>${L.time}</span>
        <span class="btn btn-sm" data-k="history" style="font-size:14px">${oc('history', 16)}History</span></div></div>
      <div class="gh-box" data-k="codebox">
        <div class="gh-codehead">
          <span class="gh-seg" data-k="seg">
            ${isMd ? `<span class="${mode === 'preview' ? 'sel' : ''}" data-k="seg-preview">Preview</span>` : ''}
            <span class="${mode === 'code' ? 'sel' : ''}" data-k="seg-code">Code</span>
            <span class="${mode === 'blame' ? 'sel' : ''}" data-k="seg-blame">Blame</span>
          </span>
          <span class="info" data-k="info">${lines.length} lines (${lines.filter((l) => l.trim()).length} loc) · ${bytes} Bytes</span>
          <div class="tools">
            <span class="grp"><span class="btn btn-sm" data-k="raw">Raw</span><span class="ibtn" data-k="copy">${oc('copy', 16)}</span><span class="ibtn" data-k="download">${oc('download', 16)}</span></span>
            <span class="grp"><span class="ibtn" data-k="edit">${oc('pencil', 16)}</span><span class="ibtn" style="width:24px">${oc('triangle-down', 16)}</span></span>
            <span class="ibtn">${oc('list-unordered', 16)}</span>
          </div>
        </div>
        ${mode === 'preview' ? `<div class="markdown-body" data-k="body">${previewHtml}</div>` : mode === 'blame' ? blameBody(blame, lang) : `<div class="gh-code" data-k="body">${codeLines(lines, lang)}</div>`}
      </div>
    </div>
  </div>`;
}

// ---------- edit page ----------
export function editPage(s, file, { lang = 'md', lines }) {
  return `
  ${header(s)}
  <div class="gh-blob">
    ${tree(s, file.name)}
    <div class="gh-blob-main">
      <div class="gh-edithead">
        <span class="crumbs"><span class="a b">${s.repo}</span><span class="muted">/</span></span>
        <span class="fname">${file.name}</span>
        <span class="muted">in</span><span class="Label" style="font-family:ui-monospace,Consolas,monospace;background:#ddf4ff;color:#0969da;border-color:transparent">main</span>
        <div class="right"><span class="btn" data-k="cancel">Cancel changes</span><span class="btn btn-primary" data-k="commitbtn">Commit changes...</span></div>
      </div>
      <div class="gh-box">
        <div class="gh-editor-tabs"><span class="t sel" data-k="tab-edit">Edit</span><span class="t" data-k="tab-preview">Preview</span>
          <span class="opts"><span class="btn btn-sm">Spaces${oc('triangle-down', 16, 'caret')}</span><span class="btn btn-sm">2${oc('triangle-down', 16, 'caret')}</span><span class="btn btn-sm">Soft wrap${oc('triangle-down', 16, 'caret')}</span></span></div>
        <div class="gh-editor" data-k="editor">${codeLines(lines, lang, { dataPrefix: 'eline' })}</div>
      </div>
    </div>
  </div>`;
}

// ---------- commit dialog ----------
export function commitDialog({ message, branch = 'main' }) {
  return `
  <div class="gh-backdrop gh">
    <div class="gh-dialog" data-k="dialog">
      <div class="dh">Commit changes${oc('x', 16)}</div>
      <div class="db">
        <label class="lbl">Commit message</label>
        <div class="gh-input" data-k="msginput"><span data-k="msgtext">${esc(message)}</span><span class="tcaret hid" data-k="msgcaret"></span></div>
        <label class="lbl">Extended description</label>
        <div class="gh-textarea">Add an optional extended description..</div>
        <div class="gh-radio" data-k="opt-direct"><i class="on"></i><span>Commit directly to the <code style="font-size:12px;background:#ddf4ff;color:#0969da;padding:1px 4px;border-radius:6px">${branch}</code> branch</span></div>
        <div class="gh-radio" data-k="opt-branch"><i></i><span>Create a <b>new branch</b> for this commit and start a pull request <a>Learn more about pull requests</a></span></div>
      </div>
      <div class="df"><span class="btn">Cancel</span><span class="btn btn-primary" data-k="confirm">Commit changes</span></div>
    </div>
  </div>`;
}
