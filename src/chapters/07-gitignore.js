// 第 7 章：.gitignore —— 哪些文件不该上传 + 原理：Git 先查名单再跳过
import { createTerminal } from '../core/terminal.js';
import { createBoard, pop } from '../core/board.js';
import { recap, notepad } from './common.js';

const REPO_DIR = 'C:\\Users\\xiaoming\\Desktop\\my-first-repo';

export default async function chapter(D) {
  const b = createBoard(D, { title: '哪些文件不该上传？', kicker: '先想一想' });
  const items = [
    ['🔑', '密码、密钥', 'passwords & keys', '#f85149'],
    ['🗂️', '自动生成的缓存', 'auto-generated cache', '#d29922'],
    ['📦', '体积很大的文件', 'huge files', '#a371f7'],
  ].map(([ic, zh, en, c], i) => b.box(420 + i * 540, 470, 440, 280, { title: `${ic} ${zh}`, color: c, html: `<div style="color:#9198a1;font-size:24px">${en}</div>` }));
  const why = b.text(960, 750, '公开仓库里的东西，<b>全世界都能看到</b>', { size: 36 });

  const term = createTerminal(D, { banner: false });
  term.cd(REPO_DIR);
  term.idle();
  const np = notepad(D, { file: '.gitignore', lines: [], extraLines: 4 });
  const ignoreLines = ['# Python 运行时生成的缓存', '__pycache__/', '# 存密码的文件，绝对不能上传', 'secret.txt'];
  np.lines.forEach((l) => { l.textContent = ''; });

  D.titleCard('第 7 章 · Chapter 7', '.gitignore：不该上传的文件', { en: 'Ignoring Files with .gitignore' });
  D.cut(b.root);
  D.sayOver('有些文件**不应该**上传到 GitHub：', 'Some files should **never** go to GitHub:');
  items.forEach((it) => pop(D, it, { dur: 0.4 }));
  D.sync();
  D.sayOver('尤其是公开仓库，里面的内容全世界都能看到，泄露密码就麻烦了。', 'Anything in a public repo is visible to the whole world; leaking a password is serious.');
  D.show(why, { y: 20 });
  D.sync();

  D.cut(term.root, { fade: 0.5 });
  D.sayOver('比如运行程序后，多了一个缓存文件夹 __pycache__，还有一个存密码的 secret.txt。', 'Say running the program created a __pycache__ folder, and you keep passwords in secret.txt.');
  term.cmd('git status');
  term.out([
    'On branch main',
    "Your branch is up to date with 'origin/main'.",
    '',
    'Untracked files:',
    '  (use "git add <file>..." to include in what will be committed)',
    '        [red]__pycache__/[/]',
    '        [red]secret.txt[/]',
    '',
    'nothing added to commit but untracked files present (use "git add" to track)',
  ], { stagger: 0.05 });
  D.sync();
  D.say('Git 发现了它们，一不小心 `git add` 就会被传上去。', 'Git sees them, and one careless `git add` would upload them.');

  D.cut(np.root, { fade: 0.5 });
  D.sayOver('解决办法：在仓库最外层新建一个叫 **.gitignore** 的文件，每行写一个要忽略的名字。', 'The fix: create a file named **.gitignore** in the repo, one name to ignore per line.');
  ignoreLines.forEach((t, i) => {
    D.show(np.lines[i], { dur: 0.05 });
    D.type(np.lines[i], t, { cps: 16 });
    D.wait(0.15);
  });
  D.sync();
  D.say('`#` 开头的是注释，只是写给人看的说明。', 'Lines starting with `#` are comments, notes for humans only.');

  D.cut(term.root, { fade: 0.5 });
  term.ready();
  D.sayOver('保存后再看状态：那两个文件不见了，只剩 .gitignore 本身。', 'Save it and check again: those two are gone. Only .gitignore itself remains.');
  term.cmd('git status');
  term.out([
    'On branch main',
    "Your branch is up to date with 'origin/main'.",
    '',
    'Untracked files:',
    '  (use "git add <file>..." to include in what will be committed)',
    '        [red].gitignore[/]',
    '',
  ], { stagger: 0.05 });
  D.sync();
  term.ready();
  D.sayOver('把 .gitignore 也提交上去，这样每个下载这个仓库的人都遵守同样的规则。', 'Commit .gitignore too, so everyone who clones the repo follows the same rules.');
  term.cmd('git add .gitignore');
  term.ready();
  term.cmd('git commit -m "添加 .gitignore"', { cps: 16 });
  term.out(['[main 9b27e05] 添加 .gitignore', ' 1 file changed, 4 insertions(+)', ' create mode 100644 .gitignore']);
  D.sync();
  D.say('小技巧：在 GitHub 新建仓库时可以直接选 .gitignore 模板，比如 Python，省得自己写。', 'Tip: when creating a repo on GitHub, pick a .gitignore template such as Python.');

  // ---------- 原理 ----------
  const p = createBoard(D, { title: '.gitignore 是怎么起作用的？' });
  const list = p.box(560, 470, 560, 330, { title: '📄 .gitignore 名单', color: '#d29922', html: '<div style="text-align:left;padding-left:60px"><span class="b-file">__pycache__/</span><br><span class="b-file">secret.txt</span></div>' });
  const flow = p.box(1360, 470, 620, 330, { title: 'Git 查看文件时', color: '#2f81f7', html: '先对照名单<br>在名单上 → <b style="color:#ffd33d">直接跳过</b><br>不在名单上 → 正常跟踪' });
  const warn = p.text(960, 780, '⚠️ 已经提交过的文件，写进名单<b>不会</b>自动从仓库删除', { size: 32 });
  D.cut(p.root, { fade: 0.6 });
  D.sayOver('原理：Git 每次检查文件时，都会先对照 .gitignore 这份名单，名单上的直接跳过。', 'How it works: Git checks .gitignore first and skips anything on the list.');
  pop(D, list);
  pop(D, flow);
  D.sync();
  D.sayOver('注意：如果文件**已经提交过**，写进 .gitignore 也不会自动删掉，所以最好一开始就写好。', 'Careful: files **already committed** stay in the repo, so set up .gitignore early.');
  D.show(warn, { y: 20 });
  D.sync();

  recap(D, [
    ['.gitignore', '列出不想上传的文件'],
    ['一行一个', '文件名或文件夹名/'],
    ['# 开头', '注释'],
    ['密码 / 缓存 / 大文件', '都应该写进去'],
  ], '记住：**密码永远不要上传到 GitHub**。', 'Remember: **never upload passwords to GitHub**.');
}
