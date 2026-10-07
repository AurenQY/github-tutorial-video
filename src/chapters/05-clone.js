// 第 5 章：绿色 Code 按钮 → git clone + 原理：本地仓库与远程仓库（origin）
import { createBrowser, overview, tooltip, q } from '../gh/ui.js';
import { codeMenu, menuAt } from '../gh/ui2.js';
import { createTerminal } from '../core/terminal.js';
import { repoUrl, repoAfterCh3, COMMITS, COMMIT_4 } from '../gh/data.js';
import { createBoard, draw, pop } from '../core/board.js';
import { recap } from './common.js';

export const CLONE_URL = 'https://github.com/xiaoming-dev/my-first-repo.git';

export default async function chapter(D) {
  const s = repoAfterCh3();
  const br = createBrowser(D, { url: repoUrl() });
  const home = br.add(overview(s));
  const menu = menuAt(D, br, q(home, 'codebtn'), codeMenu(CLONE_URL), { align: 'right' });
  const term = createTerminal(D);
  term.idle();

  D.titleCard('第 5 章 · Chapter 5', 'Code 按钮：把仓库拿到电脑上', { en: 'The Code Button and git clone' });
  D.cut(br.root);
  D.cursorShow();

  D.sayOver('到目前为止，我们都在网页上操作。怎么把仓库拿到自己电脑上呢？', "So far we've worked on the website. How do we get the repo onto our own computer?");
  D.focus(q(home, 'codebtn'), { label: 'Code', zoom: 2.4 });
  D.moveClick(q(home, 'codebtn'));
  D.sync();
  D.unfocus({ dur: 0.4 });
  D.show(menu, { dur: 0.2 });
  D.say('点绿色的 **Code** 按钮，里面有两种方法。', 'Click the green **Code** button. There are two ways.');

  D.sayOver('**Download ZIP**：只下载文件的"复印件"，没有历史，也没法同步回去。', '**Download ZIP**: a plain copy of the files. Easy, but no history and no syncing back.');
  D.focus(q(menu, 'zip'), { label: 'Download ZIP', zoom: 1.5 });
  D.sync();
  D.sayOver('**HTTPS 地址**：配合 `git clone`，得到能来回同步的完整仓库。', 'The **HTTPS URL** is used with `git clone` to get a full repository that stays in sync.');
  D.focus(q(menu, 'urlrow'), { label: 'HTTPS 地址', zoom: 1.5 });
  D.sync();
  D.sayOver('点右边的按钮，复制这个地址。', 'Click the button on the right to copy the address.');
  D.moveClick(q(menu, 'copyurl'));
  const tip = tooltip(D, q(menu, 'copyurl'), 'Copied!');
  D.show(tip, { dur: 0.2 });
  D.sync();
  D.hide(tip, { dur: 0.2 });

  // ---------- terminal ----------
  D.cut(term.root, { fade: 0.6 });
  D.cursorShow(false);
  D.say('打开 **PowerShell**：在开始菜单里搜索 PowerShell 就能找到。', 'Open **PowerShell**: search for it in the Start menu.');
  D.sayOver('先确认 Git 装好了：输入 `git --version`，能看到版本号就行。', 'First check that Git is installed: type `git --version` and look for a version number.');
  term.cmd('git --version');
  term.out(['git version 2.51.0.windows.1']);
  D.sync();
  term.ready();
  D.sayOver('用 `cd` 进入桌面（cd 就是 change directory，切换文件夹）。', 'Use `cd` to go to the Desktop (cd = change directory).');
  term.cmd('cd Desktop');
  term.cd('C:\\Users\\xiaoming\\Desktop');
  D.sync();
  term.ready();
  D.sayOver('输入 `git clone`，后面粘贴刚才复制的地址（在 PowerShell 里点右键就能粘贴）。', 'Type `git clone`, then paste the address (right-click pastes in PowerShell).');
  term.cmd(`git clone ${CLONE_URL}`, { cps: 22 });
  term.out([
    "Cloning into 'my-first-repo'...",
    'remote: Enumerating objects: 15, done.',
    'remote: Counting objects: 100% (15/15), done.',
    'remote: Compressing objects: 100% (9/9), done.',
    'remote: Total 15 (delta 2), reused 12 (delta 1), pack-reused 0 (from 0)',
    'Receiving objects: 100% (15/15), done.',
    'Resolving deltas: 100% (2/2), done.',
  ], { stagger: 0.18 });
  D.sync();
  D.say('完成！Git 把整个仓库连同全部历史，都下载下来了。', 'Done! Git downloaded the whole repository, history included.');
  term.ready();
  D.sayOver('进入这个文件夹，再用 `ls` 列出文件：和网页上的一模一样。', 'Go into the folder and list files with `ls`: exactly the same as on the website.');
  term.cmd('cd my-first-repo');
  term.cd('C:\\Users\\xiaoming\\Desktop\\my-first-repo');
  term.ready();
  term.cmd('ls');
  term.out([
    '',
    '    Directory: C:\\Users\\xiaoming\\Desktop\\my-first-repo',
    '',
    '',
    'Mode                 LastWriteTime         Length Name',
    '----                 -------------         ------ ----',
    'd-----         2026/10/6     14:32                notes',
    '-a----         2026/10/6     14:32            118 hello.py',
    '-a----         2026/10/6     14:32            298 README.md',
    '',
  ], { stagger: 0.05 });
  D.sync();
  term.ready();
  D.sayOver('`git log --oneline` 查看历史：4 次提交全都在。', '`git log --oneline` shows the history: all 4 commits are here.');
  term.cmd('git log --oneline');
  term.out([
    `[yellow]${COMMIT_4.hash} ([/][cyan]HEAD -> [/][green]main[/][yellow], [/][red]origin/main[/][yellow], [/][red]origin/HEAD[/][yellow])[/] ${COMMIT_4.msg}`,
    ...COMMITS.slice().reverse().map((c) => `[yellow]${c.hash}[/] ${c.msg}`),
  ], { stagger: 0.1 });
  D.sync();
  term.ready();
  D.wait(0.5);

  // ---------- 原理 ----------
  const b = createBoard(D, { title: 'clone 之后发生了什么？' });
  const remote = b.box(960, 330, 700, 220, { title: '☁️ GitHub 上的仓库（远程）', color: '#2f81f7', html: '4 个提交 · 完整历史<div style="font-size:22px;color:#9198a1;margin-top:6px">remote repository</div>' });
  const local = b.box(960, 760, 700, 220, { title: '💻 你电脑上的仓库（本地）', color: '#3fb950', html: '4 个提交 · 完整历史<div style="font-size:22px;color:#9198a1;margin-top:6px">local repository</div>' });
  const ar = b.arrow(960, 445, 960, 645, { color: '#7d8590' });
  const cl = b.chip(1150, 545, 'git clone', { color: '#7d8590' });
  const origin = b.chip(1500, 330, 'origin = 远程仓库的昵称', { color: '#2f81f7' });
  D.cut(b.root, { fade: 0.6 });
  D.sayOver('clone 之后，GitHub 上和你电脑上各有一份**完整的**仓库，包括全部历史。', 'After cloning, GitHub and your computer each hold a **complete** copy, with full history.');
  pop(D, remote);
  draw(D, ar, { dur: 0.5 });
  D.show(cl, { dur: 0.3 });
  pop(D, local);
  D.sync();
  D.sayOver('Git 会把 GitHub 上那份记作 **origin**，意思是"来源"。', 'Git calls the GitHub copy **origin**, meaning "where it came from".');
  pop(D, origin);
  D.sync();
  D.say('之后的任务，就是让这两份保持同步。下一章就来做。', "From now on, the job is keeping the two in sync. That's next.");

  recap(D, [
    ['Code → HTTPS', '复制仓库地址'],
    ['Download ZIP', '只有文件，没有历史'],
    ['git clone 地址', '下载完整仓库'],
    ['cd / ls', '切换文件夹 / 列出文件'],
    ['git log --oneline', '查看提交历史'],
  ], '记住：**clone 得到的是带完整历史的仓库**。', 'Remember: **clone gives you the full repository, history and all**.');
}
