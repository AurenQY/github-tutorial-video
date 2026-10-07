// The fictional sample repository used throughout the video.
export const OWNER = 'xiaoming-dev';
export const REPO = 'my-first-repo';
export const HOST = 'github.com';
export const repoUrl = (path = '') => `${HOST}/${OWNER}/${REPO}${path}`;

export const README_LINES = [
  '# my-first-repo',
  '',
  '这是我的第一个 GitHub 仓库 👋',
  '',
  '## 里面有什么',
  '- `hello.py`：一个打招呼的小程序',
  '- `notes/`：我的学习笔记',
];

export const README_HTML = `
  <h1>my-first-repo</h1>
  <p>这是我的第一个 GitHub 仓库 👋</p>
  <h2>里面有什么</h2>
  <ul><li><code>hello.py</code>：一个打招呼的小程序</li><li><code>notes/</code>：我的学习笔记</li></ul>`;

export const HELLO_LINES = [
  '# 一个打招呼的小程序',
  'name = input("你叫什么名字？")',
  'print("你好，" + name + "！欢迎来到 GitHub")',
];

export const COMMITS = [
  { hash: 'a1b9e07', msg: 'Initial commit', time: '3 days ago' },
  { hash: '5c03d2e', msg: '新建学习笔记文件夹', time: '3 days ago' },
  { hash: '8d2f41c', msg: '添加 hello.py', time: '2 days ago' },
];

export function baseRepo(overrides = {}) {
  const last = COMMITS[COMMITS.length - 1];
  return {
    owner: OWNER, repo: REPO, desc: '我的第一个 GitHub 仓库，用来学习 Git 和 GitHub',
    branch: 'main', branches: 1, tags: 0, commits: COMMITS.length,
    latest: { user: OWNER, msg: last.msg, hash: last.hash, time: last.time },
    files: [
      { name: 'notes', type: 'dir', msg: '新建学习笔记文件夹', time: '3 days ago' },
      { name: 'hello.py', type: 'file', msg: '添加 hello.py', time: '2 days ago' },
      { name: 'README.md', type: 'file', msg: 'Initial commit', time: '3 days ago' },
    ],
    readmeHtml: README_HTML,
    stars: 0, watching: 1, forks: 0, issues: 0, pulls: 0,
    langs: [{ name: 'Python', color: '#3572A5', pct: 100 }],
    ...overrides,
  };
}

// ---------- later states of the sample repo ----------
export const COMMIT_4 = { hash: '3f9c2a1', msg: '添加学习笔记标题', time: 'now' };          // chapter 3 (web edit)
export const README_LINES_2 = [...README_LINES, '', '## 今天学会了', '- 在网页上编辑文件并提交'];
export const README_HTML_2 = README_HTML + '<h2>今天学会了</h2><ul><li>在网页上编辑文件并提交</li></ul>';
export const COMMIT_5 = { hash: '6e1d7b4', msg: '给打招呼程序加一句鼓励', time: 'now' };   // chapter 6 (local push)
export const HELLO_LINES_2 = [...HELLO_LINES, 'print("今天也要加油！")'];
export const GREETING_NEW = 'print("你好呀，" + name + "！超级欢迎你来到 GitHub 🎉")';  // chapter 8-9 branch change

// Repo as it looks after chapter 3 (4 commits, README updated).
export function repoAfterCh3(overrides = {}) {
  return baseRepo({
    commits: 4,
    latest: { user: OWNER, msg: COMMIT_4.msg, hash: COMMIT_4.hash, time: '5 minutes ago' },
    files: [
      { name: 'notes', type: 'dir', msg: '新建学习笔记文件夹', time: '3 days ago' },
      { name: 'hello.py', type: 'file', msg: '添加 hello.py', time: '2 days ago' },
      { name: 'README.md', type: 'file', msg: '添加学习笔记标题', time: '5 minutes ago' },
    ],
    readmeHtml: README_HTML_2,
    ...overrides,
  });
}

// Repo after chapter 6 (5 commits, hello.py changed locally and pushed).
export function repoAfterCh6(overrides = {}) {
  return repoAfterCh3({
    commits: 5,
    latest: { user: OWNER, msg: COMMIT_5.msg, hash: COMMIT_5.hash, time: 'now' },
    files: [
      { name: 'notes', type: 'dir', msg: '新建学习笔记文件夹', time: '3 days ago' },
      { name: 'hello.py', type: 'file', msg: COMMIT_5.msg, time: 'now' },
      { name: 'README.md', type: 'file', msg: '添加学习笔记标题', time: '10 minutes ago' },
    ],
    ...overrides,
  });
}
