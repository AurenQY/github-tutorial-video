// More GitHub page builders (dashboard, new repo, commits, diffs, menus, PRs, issues, settings).
import { oc } from '../core/icons.js';
import { el } from '../core/director.js';
import { header, identicon, hl } from './ui.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const CHECK = oc('check', 12);

// Place a dropdown/menu overlay inside the browser view, under an anchor element.
export function menuAt(D, br, anchor, html, { align = 'left', dy = 4, dx = 0 } = {}) {
  const r = D.rectOf(anchor);
  const v = D.rectOf(br.view);
  const S = 1.5;
  const node = el(html);
  br.view.appendChild(node);
  node.style.top = `${(r.y - v.y + r.h) / S + dy}px`;
  if (align === 'left') node.style.left = `${(r.x - v.x) / S + dx}px`;
  else node.style.right = `${(v.x + v.w - r.x - r.w) / S - dx}px`;
  gsap.set(node, { autoAlpha: 0 });
  return node;
}

// ---------- header "+" menu ----------
export function plusMenu() {
  return `<div class="gh-menu gh" style="width:230px">
    <div class="mi" data-k="m-newrepo">${oc('repo', 16)}New repository</div>
    <div class="mi">${oc('repo-push', 16)}Import repository</div>
    <div class="sep"></div>
    <div class="mi">${oc('codespaces', 16)}New codespace</div>
    <div class="mi">${oc('code-square', 16)}New gist</div>
    <div class="sep"></div>
    <div class="mi">${oc('organization', 16)}New organization</div>
  </div>`;
}

// ---------- dashboard ----------
export function dashboard(s) {
  return `
  ${header(s, { crumbs: false })}
  <div class="gh-dash">
    <aside class="side">
      <div class="top"><span>Top repositories</span><span class="btn btn-sm btn-primary" data-k="newbtn">${oc('repo', 16)}New</span></div>
      <div class="in" style="margin-bottom:12px"><span class="ph">Find a repository…</span></div>
      ${(s.repos || []).map((r) => `<div class="repo">${identicon(s.owner, 16)}${s.owner}/${r}</div>`).join('') || '<div class="muted">Create your first project</div>'}
    </aside>
    <div class="feed">
      <h2 class="ph2" style="margin-bottom:16px">Home</h2>
      <div class="card"><div class="b" style="margin-bottom:6px">${oc('light-bulb', 16)} Start a new repository for ${s.owner}</div><div class="muted">A repository contains all of your project's files, revision history, and collaborator discussion.</div></div>
      <div class="card"><div class="b" style="margin-bottom:6px">${oc('book', 16)} Introduce yourself with a profile README</div><div class="muted">Share information about yourself by creating a profile README.</div></div>
    </div>
  </div>`;
}

// ---------- new repository form ----------
export function newRepoPage(s) {
  return `
  ${header(s, { crumbs: false })}
  <div class="narrow" style="padding-top:20px">
    <h1 class="ph" data-k="title">Create a new repository</h1>
    <div class="muted" style="margin-bottom:16px">A repository contains all project files, including the revision history. <span class="a">Import a repository.</span></div>
    <div class="hr"></div>
    <div class="row" style="gap:8px;align-items:flex-end;margin-bottom:6px" data-k="namerow">
      <div class="field" style="margin:0"><label>Owner *</label><span class="btn">${identicon(s.owner, 20)}&nbsp;${s.owner}${oc('triangle-down', 16, 'caret')}</span></div>
      <div style="font-size:24px;padding-bottom:2px">/</div>
      <div class="field" style="margin:0;flex:1"><label>Repository name *</label><div class="in" data-k="name" style="width:280px"><span data-k="nametext"></span></div></div>
    </div>
    <div class="ok hid" data-k="available" style="margin-bottom:12px">${oc('check-circle-fill', 16)} ${s.repo} is available.</div>
    <div class="field" data-k="descfield"><label>Description <span class="muted" style="font-weight:400">(optional)</span></label><div class="in" data-k="desc"><span data-k="desctext"></span></div></div>
    <div class="hr"></div>
    <div data-k="visibility">
      <div class="opt" data-k="vis-public"><span class="gh-radio" style="margin:0"><i class="on" data-k="r-public"></i></span><span class="ico">${oc('repo', 24)}</span><div><div class="t">Public</div><div class="d">Anyone on the internet can see this repository. You choose who can commit.</div></div></div>
      <div class="opt" data-k="vis-private"><span class="gh-radio" style="margin:0"><i data-k="r-private"></i></span><span class="ico">${oc('lock', 24)}</span><div><div class="t">Private</div><div class="d">You choose who can see and commit to this repository.</div></div></div>
    </div>
    <div class="hr"></div>
    <div data-k="init">
      <div class="b" style="margin-bottom:4px">Initialize this repository with:</div>
      <div class="opt" data-k="readme-opt"><span class="check" data-k="readme-check">${CHECK}</span><div><div class="t">Add a README file</div><div class="d">This is where you can write a long description for your project.</div></div></div>
      <div class="field" style="margin-top:14px" data-k="gitignore"><div class="b" style="margin-bottom:4px">Add .gitignore</div><span class="btn btn-sm">.gitignore template: <b data-k="gitignore-val">&nbsp;None</b>${oc('triangle-down', 16, 'caret')}</span><div class="hint">Choose which files not to track from a list of templates.</div></div>
      <div class="field" data-k="license"><div class="b" style="margin-bottom:4px">Choose a license</div><span class="btn btn-sm">License: <b>&nbsp;None</b>${oc('triangle-down', 16, 'caret')}</span><div class="hint">A license tells others what they can and can't do with your code.</div></div>
    </div>
    <div class="hr"></div>
    <div class="row" style="justify-content:flex-end"><span class="btn btn-primary" data-k="create">Create repository</span></div>
  </div>`;
}

// ---------- commits list ----------
export function commitsPage(s, commits, { day = 'Oct 6, 2026' } = {}) {
  return `
  ${header(s)}
  <div class="gh-container" style="padding-top:24px">
    <h2 class="ph2" style="font-size:24px;font-weight:400;margin-bottom:16px">Commits</h2>
    <div class="row" style="gap:8px;margin-bottom:16px"><span class="btn">${oc('git-branch', 16)}main${oc('triangle-down', 16, 'caret')}</span><span class="grow"></span><span class="btn">${oc('person', 16)}All users${oc('triangle-down', 16, 'caret')}</span><span class="btn">${oc('calendar', 16)}All time${oc('triangle-down', 16, 'caret')}</span></div>
    <div class="gh-commit-group">
      <div class="day">${oc('git-commit', 16)}Commits on ${day}</div>
      <div class="gh-box" data-k="list">
        ${commits.map((c, i) => `
        <div class="gh-commit-row" data-k="c-${i}">
          <div class="main"><div class="msg">${esc(c.msg)}</div><div class="by">${identicon(c.user || s.owner, 16)}<b style="color:var(--fgColor-default)">${c.user || s.owner}</b> committed ${c.time}</div></div>
          <span class="btn btn-sm sha" data-k="sha-${i}">${c.hash}</span><span class="ibtn plain">${oc('copy', 16)}</span><span class="ibtn plain">${oc('code', 16)}</span>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

// ---------- diff ----------
// rows: [{t:'hunk'|'ctx'|'add'|'del', o, n, c}]
export function diffFile(name, rows, { adds = 0, dels = 0, lang = 'md', key = 'diff' } = {}) {
  const blocks = Array.from({ length: 5 }, (_, i) => `<i class="${i < Math.round((adds / Math.max(1, adds + dels)) * 5) ? 'a' : (i < 5 - Math.round((dels / Math.max(1, adds + dels)) * 5) ? '' : 'd')}"></i>`).join('');
  return `
  <div class="gh-diff-file" data-k="${key}">
    <div class="fh">${oc('chevron-down', 16)}<span style="font-size:12px;color:var(--fgColor-muted)">${adds + dels}</span><span class="gh-diffstat">${blocks}</span><b style="color:var(--fgColor-default);font-family:inherit">${esc(name)}</b>${oc('copy', 16)}</div>
    <div class="gh-diff">${rows.map((r, i) => {
      if (r.t === 'cmt') return `<div class="dl cmt" data-k="${key}-cmt">${r.c}</div>`;
      const sign = r.t === 'add' ? '+' : r.t === 'del' ? '-' : r.t === 'hunk' ? '' : ' ';
      return `<div class="dl ${r.t}" data-k="${key}-${i}"><span class="n">${r.o ?? ''}</span><span class="n">${r.n ?? ''}</span><span class="s">${sign}</span><span class="c">${r.t === 'hunk' ? esc(r.c) : hl(r.c, lang) || ' '}</span></div>`;
    }).join('')}</div>
  </div>`;
}

export function commitDetailPage(s, c, files) {
  return `
  ${header(s)}
  <div class="gh-container" style="padding-top:24px">
    <div class="row" style="gap:8px;margin-bottom:8px"><span style="font-size:24px">Commit</span><span class="mono" style="font-size:20px;color:var(--fgColor-muted)" data-k="sha">${c.hash}</span><span class="grow"></span><span class="btn">Browse files</span></div>
    <div class="gh-box" style="margin-bottom:16px" data-k="head">
      <div style="padding:16px;font-size:20px;font-weight:600" data-k="msg">${esc(c.msg)}</div>
      <div style="padding:10px 16px;border-top:1px solid var(--borderColor-default);background:var(--bgColor-muted);display:flex;align-items:center;gap:8px" data-k="author">${identicon(c.user || s.owner, 20)}<b>${c.user || s.owner}</b><span class="muted">committed ${c.time}</span><span class="grow"></span><span class="muted">1 parent <span class="mono a">${c.parent}</span></span><span class="muted">commit <span class="mono" style="color:var(--fgColor-default)">${c.hash}</span></span></div>
    </div>
    <div class="row" style="gap:8px;margin-bottom:12px" data-k="stat">${oc('file-diff', 16, '', 'color:var(--fgColor-muted)')}<span>${files.length} file changed</span><span style="color:#1a7f37;font-weight:600">+${files.reduce((a, f) => a + (f.adds || 0), 0)}</span><span style="color:#d1242f;font-weight:600">-${files.reduce((a, f) => a + (f.dels || 0), 0)}</span><span class="muted">lines changed</span></div>
    ${files.map((f, i) => diffFile(f.name, f.rows, { adds: f.adds, dels: f.dels, lang: f.lang, key: `diff${i}` })).join('')}
  </div>`;
}

// ---------- <> Code dropdown ----------
export function codeMenu(url) {
  return `<div class="gh-menu gh" style="width:400px;padding:0">
    <div class="mtabs" style="padding:0 8px"><span class="sel">Local</span><span>Codespaces</span></div>
    <div class="pad">
      <div class="row" style="gap:8px;font-weight:600;margin-bottom:8px">${oc('terminal', 16)}Clone<span class="grow"></span>${oc('question', 16, '', 'color:var(--fgColor-muted)')}</div>
      <div class="row" style="gap:16px;margin-bottom:8px;font-size:14px;border-bottom:1px solid var(--borderColor-default)"><span style="padding-bottom:6px;border-bottom:2px solid #fd8c73;font-weight:600" data-k="https">HTTPS</span><span class="muted" style="padding-bottom:6px">SSH</span><span class="muted" style="padding-bottom:6px">GitHub CLI</span></div>
      <div class="urlrow" data-k="urlrow"><div class="in" data-k="url">${esc(url)}</div><span class="ibtn" data-k="copyurl">${oc('copy', 16)}</span></div>
      <div class="muted" style="font-size:12px;margin-top:6px">Clone using the web URL.</div>
    </div>
    <div class="sep" style="margin:0"></div>
    <div class="mi" style="height:40px">${oc('desktop-download', 16)}Open with GitHub Desktop</div>
    <div class="mi" style="height:40px" data-k="zip">${oc('file-zip', 16)}Download ZIP</div>
  </div>`;
}

// ---------- branch dropdown ----------
export function branchMenu({ branches = ['main'], current = 'main', creating = '' } = {}) {
  return `<div class="gh-menu gh" style="width:320px;padding:0">
    <div class="mh" style="padding:12px 16px">Switch branches/tags${oc('x', 16)}</div>
    <div class="pad" style="padding-top:0"><div class="in focus" data-k="filter"><span data-k="filtertext"></span><span class="ph" data-k="filterph">Find or create a branch…</span></div></div>
    <div class="mtabs"><span class="sel">Branches</span><span>Tags</span></div>
    <div data-k="list" style="padding:6px 0">
      ${branches.map((b) => `<div class="mi" data-k="b-${b}"><span class="chk">${b === current ? oc('check', 16) : ''}</span>${oc('git-branch', 16)}<span>${b}</span>${b === 'main' ? '<span class="Label" style="margin-left:auto">default</span>' : ''}</div>`).join('')}
    </div>
    <div data-k="create" class="hid" style="padding:6px 0;border-top:1px solid var(--borderColor-default)">
      <div class="mi hl">${oc('git-branch', 16)}<span>Create branch <b>${esc(creating)}</b> from <b>main</b></span></div>
    </div>
    <div class="sep" style="margin:0"></div>
    <div class="mi" style="height:40px;justify-content:center;color:var(--fgColor-accent)">View all branches</div>
  </div>`;
}

// ---------- compare banner ----------
export function compareBanner(branch) {
  return `<div class="flash-warn" data-k="banner" style="margin-bottom:16px">${oc('git-branch', 16, '', 'color:var(--fgColor-muted)')}<span><b class="gh-branch-tag" style="background:transparent;color:var(--fgColor-default);font-weight:600">${branch}</b> had recent pushes 1 minute ago</span><span class="grow"></span><span class="btn btn-primary" data-k="compare">Compare &amp; pull request</span></div>`;
}

// ---------- open a pull request ----------
export function prCreatePage(s, { base = 'main', head = 'add-greeting', title = '', files = [] }) {
  return `
  ${header(s, { tab: 'pulls' })}
  <div class="gh-container" style="padding-top:20px">
    <h1 class="ph">Open a pull request</h1>
    <div class="muted" style="margin-bottom:12px">Create a new pull request by comparing changes across two branches.</div>
    <div class="gh-range" data-k="range">${oc('git-compare', 16)}<span class="btn btn-sm">base: <b>&nbsp;${base}</b>${oc('triangle-down', 16, 'caret')}</span>${oc('arrow-left', 16)}<span class="btn btn-sm">compare: <b>&nbsp;${head}</b>${oc('triangle-down', 16, 'caret')}</span>
      <span class="ok" data-k="able" style="margin-left:8px">${oc('check', 16)} Able to merge.</span><span class="muted" style="font-size:12px">These branches can be automatically merged.</span></div>
    <div class="row" style="gap:16px;align-items:flex-start">
      ${identicon(s.owner, 40)}
      <div style="flex:1">
        <div class="field"><label>Add a title</label><div class="in" data-k="title"><span data-k="titletext">${esc(title)}</span></div></div>
        <div class="field"><label>Add a description</label>
          <div class="gh-mdbox" data-k="desc"><div class="tabs"><span class="sel">Write</span><span>Preview</span></div><div class="body"><span data-k="desctext"></span><span class="ph" data-k="descph">Add your description here...</span></div></div></div>
        <div class="row" style="justify-content:flex-end"><span class="gh-split" data-k="createpr"><span class="btn btn-primary">Create pull request</span><span class="btn btn-primary" style="padding:0 8px">${oc('triangle-down', 16)}</span></span></div>
      </div>
    </div>
    <div class="hr"></div>
    <div class="row" style="gap:24px" data-k="summary"><span>${oc('git-commit', 16)} <b>1</b> commit</span><span>${oc('file-diff', 16)} <b>${files.length}</b> file changed</span><span>${oc('person', 16)} <b>1</b> contributor</span></div>
  </div>`;
}

// ---------- pull request page ----------
// state: 'open' | 'conflict' | 'merged'
export function prPage(s, pr, { tab = 'conversation', state = 'open', deleted = false } = {}) {
  const badge = state === 'merged'
    ? `<span class="gh-state merged" data-k="state">${oc('git-merge', 16)}Merged</span>`
    : `<span class="gh-state open" data-k="state">${oc('git-pull-request', 16)}Open</span>`;
  const sub = state === 'merged'
    ? `<b>${s.owner}</b> merged 1 commit into <span class="gh-branch-tag">main</span> from <span class="gh-branch-tag">${pr.head}</span> now`
    : `<b>${s.owner}</b> wants to merge 1 commit into <span class="gh-branch-tag">main</span> from <span class="gh-branch-tag">${pr.head}</span>`;
  const tabs = [['conversation', 'Conversation', 'comment-discussion', 0], ['commits', 'Commits', 'git-commit', 1], ['checks', 'Checks', 'checklist', 0], ['files', 'Files changed', 'file-diff', pr.files.length]];
  let body = '';
  if (tab === 'files') {
    body = `<div class="row" style="margin-bottom:12px"><span class="muted">${pr.files.length} file changed</span><span class="grow"></span><span class="gh-split" data-k="review"><span class="btn btn-sm btn-primary">Review changes</span><span class="btn btn-sm btn-primary" style="padding:0 6px">${oc('triangle-down', 16)}</span></span></div>
      ${pr.files.map((f, i) => diffFile(f.name, f.rows, { adds: f.adds, dels: f.dels, lang: f.lang, key: `diff${i}` })).join('')}`;
  } else {
    const merge = state === 'merged' ? `
      <div class="gh-mergebox" data-k="mergebox"><span class="icon" style="background:#8250df">${oc('git-merge', 24)}</span><div class="bx">
        <div class="row"><div><div class="t">Pull request successfully merged and closed</div><div class="d">You're all set — the <span class="gh-branch-tag">${pr.head}</span> branch can be safely deleted.</div></div><span class="grow"></span><span class="btn" data-k="delbranch">${deleted ? 'Restore branch' : 'Delete branch'}</span></div></div></div>`
      : state === 'conflict' ? `
      <div class="gh-mergebox" data-k="mergebox"><span class="icon" style="background:#59636e">${oc('git-pull-request', 24)}</span><div class="bx">
        <div class="row"><span class="ri" style="background:#cf222e">${oc('alert', 16)}</span><div style="flex:1"><div class="t">This branch has conflicts that must be resolved</div><div class="d">Use the web editor or the command line to resolve conflicts before continuing.</div><div class="mono" style="font-size:12px;margin-top:8px">hello.py</div></div><span class="btn" data-k="resolve">Resolve conflicts</span></div>
        <div class="foot"><span class="btn" style="opacity:.5">Merge pull request ${oc('triangle-down', 16, 'caret')}</span><span class="muted" style="font-size:12px">You can also merge this with the command line.</span></div></div></div>`
      : `
      <div class="gh-mergebox" data-k="mergebox"><span class="icon" style="background:#1f883d">${oc('git-merge', 24)}</span><div class="bx">
        <div class="row"><span class="ri" style="background:#1f883d">${oc('check', 16)}</span><div><div class="t">No conflicts with base branch</div><div class="d">Merging can be performed automatically.</div></div></div>
        <div class="foot"><span class="gh-split" data-k="merge"><span class="btn btn-primary" data-k="mergebtn">Merge pull request</span><span class="btn btn-primary" style="padding:0 8px">${oc('triangle-down', 16)}</span></span><span class="muted" style="font-size:12px">You can also merge this with the command line.</span></div>
        <div class="foot hid" data-k="confirmrow" style="border-top:1px solid var(--borderColor-default);flex-direction:column;align-items:stretch">
          <div class="in" style="margin-bottom:8px"><b>Merge pull request #${pr.num} from ${s.owner}/${pr.head}</b></div>
          <div class="row" style="gap:8px"><span class="btn btn-primary" data-k="confirm">Confirm merge</span><span class="btn">Cancel</span></div>
        </div></div></div>`;
    body = `
      <div class="gh-comment" data-k="desc">${identicon(s.owner, 40)}<div class="bx"><div class="ch"><b>${s.owner}</b> commented now</div><div class="cb">${pr.body}</div></div></div>
      <div class="gh-timeline" data-k="timeline"><div class="ev">${oc('git-commit', 16)}${identicon(s.owner, 16)}<span style="color:var(--fgColor-default)">${esc(pr.commit)}</span><span class="grow"></span><span class="mono" style="font-size:12px">${pr.sha}</span></div></div>
      ${merge}`;
  }
  return `
  ${header({ ...s, pulls: state === 'merged' ? 0 : 1 }, { tab: 'pulls' })}
  <div class="gh-container" style="padding-top:20px">
    <h1 class="gh-pr-title" data-k="title">${esc(pr.title)} <span class="num">#${pr.num}</span></h1>
    <div class="gh-pr-sub" data-k="sub">${badge}<span>${sub}</span></div>
    <div class="gh-prtabs" style="margin-top:16px">${tabs.map(([k, n, ic, c]) => `<span class="${k === tab ? 'sel' : ''}" data-k="tab-${k}">${oc(ic, 16)}${n}<span class="Counter">${c}</span></span>`).join('')}</div>
    <div class="row" style="align-items:flex-start;gap:24px">
      <div style="flex:1;min-width:0">${body}</div>
      ${tab === 'files' ? '' : `<aside style="width:240px;flex:none">
        <div class="gh-sidebar-item"><div class="h">Reviewers ${oc('gear', 16)}</div><div class="v">No reviews</div></div>
        <div class="gh-sidebar-item"><div class="h">Assignees ${oc('gear', 16)}</div><div class="v">No one—assign yourself</div></div>
        <div class="gh-sidebar-item"><div class="h">Labels ${oc('gear', 16)}</div><div class="v">None yet</div></div>
        <div class="gh-sidebar-item" style="border:0"><div class="h">Development ${oc('gear', 16)}</div><div class="v">${pr.closes ? `Successfully merging this pull request may close these issues.<br><span class="a">${oc('issue-opened', 16)} ${pr.closes}</span>` : 'No linked issues'}</div></div>
      </aside>`}
    </div>
  </div>`;
}

// ---------- conflict resolver ----------
export function conflictPage(s, pr, lines) {
  return `
  ${header(s, { tab: 'pulls' })}
  <div class="gh-container" style="padding-top:20px">
    <div class="row" style="gap:12px;margin-bottom:12px"><h1 class="ph" style="margin:0;font-size:20px">Resolving conflicts between <span class="gh-branch-tag">${pr.head}</span> and <span class="gh-branch-tag">main</span> and committing changes → <span class="gh-branch-tag">${pr.head}</span></h1></div>
    <div class="row" style="gap:16px;align-items:flex-start">
      <aside style="width:220px;flex:none" class="gh-box"><div style="padding:10px 12px;background:var(--bgColor-muted);font-weight:600;border-bottom:1px solid var(--borderColor-default)">1 conflicting file</div><div style="padding:10px 12px;display:flex;gap:8px;align-items:center">${oc('file', 16, '', 'color:var(--fgColor-muted)')}hello.py</div></aside>
      <div class="gh-box" style="flex:1">
        <div class="row" style="height:44px;padding:0 12px;background:var(--bgColor-muted);border-bottom:1px solid var(--borderColor-default);gap:8px"><b>hello.py</b><span class="muted" data-k="count">1 conflict</span><span class="grow"></span><span class="btn btn-sm" data-k="markresolved">${oc('check', 16)}Mark as resolved</span><span class="btn btn-sm btn-primary" data-k="commitmerge" style="opacity:.45">Commit merge</span></div>
        <div class="gh-editor gh-conflict" data-k="editor">${lines.map((l, i) => `<div class="ln ${l.k || ''}" data-k="cl-${i}"><span class="no">${i + 1}</span><span class="tx">${hl(l.c, 'py') || ' '}</span></div>`).join('')}</div>
      </div>
    </div>
  </div>`;
}

// ---------- fork ----------
export function forkPage(s, src) {
  return `
  ${header(s, { crumbs: false })}
  <div class="narrow" style="padding-top:20px">
    <h1 class="ph">Create a new fork</h1>
    <div class="muted" style="margin-bottom:12px">A <i>fork</i> is a copy of a repository. Forking a repository allows you to freely experiment with changes without affecting the original project.</div>
    <div class="hr"></div>
    <div class="row" style="gap:8px;align-items:flex-end;margin-bottom:16px" data-k="namerow">
      <div class="field" style="margin:0"><label>Owner *</label><span class="btn">${identicon(s.owner, 20)}&nbsp;${s.owner}${oc('triangle-down', 16, 'caret')}</span></div>
      <div style="font-size:24px;padding-bottom:2px">/</div>
      <div class="field" style="margin:0"><label>Repository name *</label><div class="in" style="width:260px">${src.repo}</div></div>
    </div>
    <div class="ok" style="margin:-8px 0 12px">${oc('check-circle-fill', 16)} ${src.repo} is available.</div>
    <div class="muted" style="font-size:12px;margin-bottom:16px">By default, forks are named the same as their upstream repository.</div>
    <div class="field"><label>Description <span class="muted" style="font-weight:400">(optional)</span></label><div class="in">${esc(src.desc)}</div></div>
    <div class="opt"><span class="check on">${CHECK}</span><div><div class="t">Copy the <span class="gh-branch-tag">main</span> branch only</div><div class="d">Contribute back to ${src.owner}/${src.repo} by adding your own branch.</div></div></div>
    <div class="hr"></div>
    <div class="flash-info" style="margin-bottom:16px">${oc('info', 16)}You are creating a fork in your personal account.</div>
    <div class="row" style="justify-content:flex-end"><span class="btn btn-primary" data-k="createfork">Create fork</span></div>
  </div>`;
}

export function aheadBar(src) {
  return `<div class="gh-ahead" data-k="ahead">This branch is <span class="a">1 commit ahead of</span>&nbsp;<span class="gh-branch-tag">${src}:main</span>.<span class="grow"></span><span class="btn btn-sm" data-k="contribute">${oc('git-pull-request', 16)}Contribute${oc('triangle-down', 16, 'caret')}</span><span class="btn btn-sm">${oc('sync', 16)}Sync fork${oc('triangle-down', 16, 'caret')}</span></div>`;
}

export function watchMenu() {
  return `<div class="gh-menu gh" style="width:330px">
    <div class="mh">Notifications${oc('x', 16)}</div><div class="sep" style="margin-top:0"></div>
    <div class="mi" style="height:auto;align-items:flex-start;padding:8px 16px"><span class="chk">${oc('check', 16)}</span><div><b>Participating and @mentions</b><div class="muted" style="font-size:12px">Only receive notifications when participating or @mentioned.</div></div></div>
    <div class="mi hl" style="height:auto;align-items:flex-start;padding:8px 16px" data-k="w-all"><span class="chk"></span><div><b>All Activity</b><div class="muted" style="font-size:12px">Notified of all notifications on this repository.</div></div></div>
    <div class="mi" style="height:auto;align-items:flex-start;padding:8px 16px"><span class="chk"></span><div><b>Ignore</b><div class="muted" style="font-size:12px">Never be notified.</div></div></div>
    <div class="mi" style="height:auto;align-items:flex-start;padding:8px 16px"><span class="chk"></span><div><b>Custom</b> ${oc('arrow-right', 16)}<div class="muted" style="font-size:12px">Select events you want to be notified of.</div></div></div>
  </div>`;
}

export function contributeMenu(src) {
  return `<div class="gh-menu gh" style="width:330px;padding:16px">
    <div class="row" style="gap:12px;align-items:flex-start;margin-bottom:12px">${oc('git-pull-request', 24, '', 'color:var(--fgColor-muted)')}<div>This branch is 1 commit ahead of <span class="gh-branch-tag">${src}:main</span>.<div class="muted" style="font-size:12px;margin-top:4px">Open a pull request to contribute your changes upstream.</div></div></div>
    <span class="btn btn-primary" data-k="openpr" style="width:100%;justify-content:center">Open pull request</span>
  </div>`;
}

// ---------- issues ----------
export function issuesPage(s, issues = []) {
  return `
  ${header({ ...s, issues: issues.filter((i) => i.open).length }, { tab: 'issues' })}
  <div class="gh-container" style="padding-top:24px">
    <div class="row" style="gap:8px;margin-bottom:16px"><div class="in" style="flex:1">${oc('search', 16, '', 'color:var(--fgColor-muted);margin-right:8px')}<span class="muted">is:issue state:open</span></div><span class="btn">${oc('tag', 16)}Labels</span><span class="btn">${oc('milestone', 16)}Milestones</span><span class="btn btn-primary" data-k="newissue">New issue</span></div>
    <div class="gh-box gh-issue-list" data-k="list">
      <div class="row" style="background:var(--bgColor-muted);border-top:0;align-items:center"><b>${oc('issue-opened', 16)} ${issues.filter((i) => i.open).length} Open</b><span class="muted" style="margin-left:12px">${oc('check', 16)} ${issues.filter((i) => !i.open).length} Closed</span></div>
      ${issues.length ? issues.map((i, n) => `<div class="row" data-k="issue-${n}">${i.open ? oc('issue-opened', 16, '', 'color:#1a7f37;margin-top:4px') : oc('issue-closed', 16, '', 'color:#8250df;margin-top:4px')}<div><div class="t">${esc(i.title)} ${(i.labels || []).map((l) => `<span class="gh-label" style="background:${l.bg};color:${l.fg}">${l.name}</span>`).join(' ')}</div><div class="d">#${i.num} opened now by ${s.owner}</div></div></div>`).join('')
        : `<div style="padding:48px;text-align:center" data-k="empty">${oc('issue-opened', 24, '', 'color:var(--fgColor-muted)')}<div style="font-size:20px;font-weight:600;margin:8px 0">Welcome to issues!</div><div class="muted">Issues are used to track todos, bugs, feature requests, and more.</div></div>`}
    </div>
  </div>`;
}

export function newIssuePage(s) {
  return `
  ${header(s, { tab: 'issues' })}
  <div class="gh-container" style="padding-top:20px">
    <h1 class="ph" style="margin-bottom:16px">Create new issue</h1>
    <div class="row" style="gap:24px;align-items:flex-start">
      <div style="flex:1">
        <div class="field"><label>Add a title *</label><div class="in" data-k="title"><span data-k="titletext"></span></div></div>
        <div class="field"><label>Add a description</label><div class="gh-mdbox"><div class="tabs"><span class="sel">Write</span><span>Preview</span></div><div class="body" style="min-height:150px"><span data-k="bodytext"></span><span class="ph" data-k="bodyph">Type your description here…</span></div></div></div>
        <div class="row" style="justify-content:flex-end;gap:8px"><span class="btn">Cancel</span><span class="btn btn-primary" data-k="create">Create</span></div>
      </div>
      <aside style="width:240px;flex:none" data-k="side">
        <div class="gh-sidebar-item" data-k="assignees"><div class="h">Assignees ${oc('gear', 16)}</div><div class="v" data-k="assignee-v">No one - <span class="a">Assign yourself</span></div></div>
        <div class="gh-sidebar-item" data-k="labels"><div class="h">Labels ${oc('gear', 16)}</div><div class="v" data-k="label-v">No labels</div></div>
        <div class="gh-sidebar-item"><div class="h">Projects ${oc('gear', 16)}</div><div class="v">No projects</div></div>
        <div class="gh-sidebar-item" style="border:0"><div class="h">Milestone ${oc('gear', 16)}</div><div class="v">No milestone</div></div>
      </aside>
    </div>
  </div>`;
}

export function issuePage(s, issue, { closed = false } = {}) {
  return `
  ${header({ ...s, issues: closed ? 0 : 1 }, { tab: 'issues' })}
  <div class="gh-container" style="padding-top:20px">
    <h1 class="gh-pr-title" data-k="title">${esc(issue.title)} <span class="num">#${issue.num}</span></h1>
    <div class="gh-pr-sub" data-k="sub">${closed ? `<span class="gh-state merged">${oc('issue-closed', 16)}Closed</span>` : `<span class="gh-state open">${oc('issue-opened', 16)}Open</span>`}<span><b>${s.owner}</b> opened this issue now · 0 comments</span></div>
    <div class="row" style="align-items:flex-start;gap:24px;margin-top:16px">
      <div style="flex:1">
        <div class="gh-comment">${identicon(s.owner, 40)}<div class="bx"><div class="ch"><b>${s.owner}</b> opened now</div><div class="cb">${issue.body}</div></div></div>
        ${closed ? `<div class="gh-timeline" data-k="closedev"><div class="ev">${oc('issue-closed', 16, '', 'color:#8250df')}${identicon(s.owner, 16)}<b style="color:var(--fgColor-default)">${s.owner}</b> closed this as completed in <span class="a">#${issue.closedBy}</span> now</div></div>` : ''}
      </div>
      <aside style="width:240px;flex:none">
        <div class="gh-sidebar-item"><div class="h">Assignees ${oc('gear', 16)}</div><div class="v" style="display:flex;gap:6px;align-items:center;color:var(--fgColor-default)">${identicon(s.owner, 20)}${s.owner}</div></div>
        <div class="gh-sidebar-item" data-k="labels"><div class="h">Labels ${oc('gear', 16)}</div><div>${(issue.labels || []).map((l) => `<span class="gh-label" style="background:${l.bg};color:${l.fg}">${l.name}</span>`).join(' ')}</div></div>
        <div class="gh-sidebar-item" style="border:0"><div class="h">Development ${oc('gear', 16)}</div><div class="v">No branches or pull requests</div></div>
      </aside>
    </div>
  </div>`;
}

// ---------- settings ----------
export function settingsPage(s, { section = 'general' } = {}) {
  const nav = `
    <nav data-k="nav">
      <div class="ni ${section === 'general' ? 'sel' : ''}" data-k="nav-general">${oc('gear', 16)}General</div>
      <div class="grp">Access</div>
      <div class="ni ${section === 'collab' ? 'sel' : ''}" data-k="nav-collab">${oc('people', 16)}Collaborators</div>
      <div class="ni">${oc('repo', 16)}Moderation options</div>
      <div class="grp">Code and automation</div>
      <div class="ni">${oc('git-branch', 16)}Branches</div>
      <div class="ni">${oc('tag', 16)}Tags</div>
      <div class="ni">${oc('play', 16)}Actions</div>
      <div class="ni">${oc('webhook', 16)}Webhooks</div>
      <div class="ni">${oc('browser', 16)}Pages</div>
      <div class="grp">Security</div>
      <div class="ni">${oc('key', 16)}Deploy keys</div>
    </nav>`;
  const main = section === 'collab' ? `
    <div class="sh">Collaborators</div>
    <div class="gh-box" style="margin-bottom:24px"><div style="padding:16px;display:flex;gap:24px"><div style="flex:1"><div class="b">PUBLIC REPOSITORY</div><div class="muted" style="font-size:12px">This repository is public and visible to anyone.</div></div><div style="flex:1"><div class="b">DIRECT ACCESS</div><div class="muted" style="font-size:12px">0 collaborators have access to this repository. Only you can contribute to this repository.</div></div></div></div>
    <div class="gh-box" data-k="manage"><div style="padding:12px 16px;font-weight:600;background:var(--bgColor-muted);border-bottom:1px solid var(--borderColor-default)">Manage access</div>
      <div style="padding:40px;text-align:center">${oc('people', 24, '', 'color:var(--fgColor-muted)')}<div style="font-size:20px;font-weight:600;margin:8px 0">You haven't invited any collaborators yet</div><span class="btn btn-primary" data-k="addpeople">Add people</span></div></div>`
    : `
    <div class="sh">General</div>
    <div class="field" data-k="rename"><label>Repository name</label><div class="row" style="gap:8px"><div class="in" style="width:280px">${s.repo}</div><span class="btn">Rename</span></div></div>
    <div class="opt"><span class="check">${CHECK}</span><div><div class="t">Template repository</div><div class="d">Template repositories let users generate new repositories with the same directory structure and files.</div></div></div>
    <div class="hr"></div>
    <h2 class="ph2" style="margin-top:24px" data-k="dangerh">Danger Zone</h2>
    <div class="gh-danger" data-k="danger">
      <div class="dr"><div><div class="t">Change repository visibility</div><div class="d">This repository is currently public.</div></div><span class="btn btn-danger-outline">Change visibility</span></div>
      <div class="dr"><div><div class="t">Transfer ownership</div><div class="d">Transfer this repository to another user or to an organization.</div></div><span class="btn btn-danger-outline">Transfer</span></div>
      <div class="dr" data-k="delete"><div><div class="t">Delete this repository</div><div class="d">Once you delete a repository, there is no going back. Please be certain.</div></div><span class="btn btn-danger-outline">Delete this repository</span></div>
    </div>`;
  return `
  ${header(s, { tab: 'settings' })}
  <div class="gh-settings">${nav}<main>${main}</main></div>`;
}
