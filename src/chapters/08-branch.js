// 第 8 章：Branch 下拉菜单 / git switch -c + 原理：分支 = 平行时间线
import { createBrowser, overview, q } from '../gh/ui.js';
import { branchMenu, menuAt } from '../gh/ui2.js';
import { createTerminal } from '../core/terminal.js';
import { repoUrl, repoAfterCh6, GREETING_NEW } from '../gh/data.js';
import { createBoard, draw, pop } from '../core/board.js';
import { recap, notepad } from './common.js';
import { HELLO_LINES_2 } from '../gh/data.js';

const REPO_DIR = 'C:\\Users\\xiaoming\\Desktop\\my-first-repo';
const BR = 'add-greeting';

export default async function chapter(D) {
  // ---------- principle first: parallel timelines ----------
  const b = createBoard(D, { title: '分支是什么？' });
  const Y = 380, Y2 = 640;
  const mainXs = [260, 520, 780, 1040];
  const mains = mainXs.map((x, i) => b.node(x, Y, { color: '#2f81f7', r: 30, icon: `${i + 1}` }));
  const mainArrows = [1, 2, 3].map((i) => b.arrow(mainXs[i] - 42, Y, mainXs[i - 1] + 42, Y));
  const mainLine = b.arrow(1080, Y, 1700, Y, { color: '#2f81f7', head: false, dashed: true });
  const mainLabel = b.chip(1780, Y, 'main 主线', { color: '#2f81f7' });
  const brXs = [1300, 1560];
  const brs = brXs.map((x) => b.node(x, Y2, { color: '#3fb950', r: 30, icon: '✎' }));
  const fork = b.arrow(brXs[0] - 40, Y2 - 22, 1072, Y + 24, { color: '#3fb950', curve: 0 });
  const brArrow = b.arrow(brXs[1] - 42, Y2, brXs[0] + 42, Y2, { color: '#3fb950' });
  const brLabel = b.chip(1780, Y2, `${BR} 分支`, { color: '#3fb950' });
  const note = b.text(960, 860, '在分支上随便改，<b>主线 main 不受影响</b>', { size: 34 });

  const s = repoAfterCh6();
  const br = createBrowser(D, { url: repoUrl() });
  const home = br.add(overview(s));
  const menu = menuAt(D, br, q(home, 'branch'), branchMenu({ creating: BR }), { align: 'left' });
  const home2 = br.add(overview({ ...s, branch: BR, branches: 2 }));
  const term = createTerminal(D, { banner: false });
  term.cd(REPO_DIR);
  term.idle();
  const np = notepad(D, { file: 'hello.py', lines: HELLO_LINES_2 });
  const greetLine = np.lines[2];

  D.titleCard('第 8 章 · Chapter 8', '分支：平行时间线', { en: 'Branches: Parallel Timelines' });
  D.cut(b.root);
  D.sayOver('想尝试新改动，又怕把能用的版本改坏？用**分支**。', 'Want to try something without breaking the working version? Use a **branch**.');
  mains.forEach((n, i) => { pop(D, n, { dur: 0.3 }); if (i) draw(D, mainArrows[i - 1], { dur: 0.25 }); });
  D.show(mainLine, { dur: 0.3 });
  D.show(mainLabel, { dur: 0.3 });
  D.sync();
  D.sayOver('分支就像**平行时间线**：从某个存档分出去，在上面接着做新的存档……', 'A branch is a **parallel timeline**: it splits off from a save and continues with new saves…');
  draw(D, fork, { dur: 0.5 });
  pop(D, brs[0]);
  draw(D, brArrow, { dur: 0.3 });
  pop(D, brs[1]);
  D.show(brLabel, { dur: 0.3 });
  D.sync();
  D.sayOver('……而主线 **main** 完全不受影响。改好了再合并回去，改砸了直接扔掉。', '…while **main** stays untouched. Merge it back if it works; throw it away if not.');
  D.show(note, { y: 20 });
  D.sync();

  // ---------- web: branch dropdown ----------
  D.cut(br.root, { fade: 0.6 });
  D.cursorShow();
  D.sayOver('在网页上：点左上方的分支按钮 **main**。', 'On the website: click the branch button, **main**.');
  D.focus(q(home, 'branch'), { label: '分支按钮', zoom: 2.4 });
  D.moveClick(q(home, 'branch'));
  D.sync();
  D.unfocus({ dur: 0.4 });
  D.show(menu, { dur: 0.2 });
  D.sayOver('列表里是所有分支，打勾的是当前所在的分支。在输入框里打一个新名字……', 'It lists all branches; the tick marks the current one. Type a new name in the box…');
  D.focus(menu, { zoom: 1.7, pad: 2 });
  D.moveClick(q(menu, 'filter'));
  D.setClass(q(menu, 'filterph'), 'hid');
  D.type(q(menu, 'filtertext'), BR, { cps: 9 });
  D.show(q(menu, 'create'), { dur: 0.2 });
  D.sync();
  D.sayOver('……再点 **Create branch**，分支就建好了。', '…then click **Create branch**, and it\'s done.');
  D.moveClick(q(menu, 'create'));
  D.hide(menu, { dur: 0.15 });
  D.unfocus({ dur: 0.4 });
  br.swap(home2, repoUrl(`/tree/${BR}`));
  D.focus(D.unionRect(q(home2, 'branch'), q(home2, 'branches')), { label: '2 Branches', zoom: 2 });
  D.sync();
  D.say('分支名要简短、能看出在做什么，比如 add-greeting（添加问候语）。', 'Keep branch names short and descriptive, like add-greeting.');
  D.unfocus();

  // ---------- terminal ----------
  D.cut(term.root, { fade: 0.5 });
  D.cursorShow(false);
  D.sayOver('在电脑上：`git switch -c 分支名`，新建一个分支并切换过去。', 'On your computer: `git switch -c name` creates a branch and switches to it.');
  term.cmd(`git switch -c ${BR}`);
  term.out([`Switched to a new branch '${BR}'`]);
  D.sync();
  term.ready();
  D.sayOver('`git branch` 列出所有分支，带星号的是你当前所在的。', '`git branch` lists all branches; the star marks the current one.');
  term.cmd('git branch');
  term.out([`* [green]${BR}[/]`, '  main']);
  D.sync();

  D.cut(np.root, { fade: 0.5 });
  D.sayOver('在这个分支上，把问候语改得更热情一点，保存。', 'On this branch, make the greeting warmer, then save.');
  D.setText(greetLine, '');
  D.type(greetLine, GREETING_NEW, { cps: 14 });
  D.sync();

  D.cut(term.root, { fade: 0.5 });
  term.ready();
  D.sayOver('照常 add 和 commit。', 'Add and commit as usual.');
  term.cmd('git add hello.py');
  term.ready();
  term.cmd('git commit -m "把问候语改得更热情"', { cps: 16 });
  term.out([`[${BR} c41a9e2] 把问候语改得更热情`, ' 1 file changed, 1 insertion(+), 1 deletion(-)']);
  D.sync();
  term.ready();
  D.sayOver('第一次推送新分支，要写成 `git push -u origin 分支名`，告诉 Git 推到 GitHub 的哪个分支。', 'The first push of a new branch: `git push -u origin name` tells Git where it goes.');
  term.cmd(`git push -u origin ${BR}`, { cps: 16 });
  term.out([
    'Enumerating objects: 5, done.',
    'Writing objects: 100% (3/3), 389 bytes | 389.00 KiB/s, done.',
    'Total 3 (delta 1), reused 0 (delta 0), pack-reused 0 (from 0)',
    'remote:',
    `remote: Create a pull request for '${BR}' on GitHub by visiting:`,
    `remote:      https://github.com/xiaoming-dev/my-first-repo/pull/new/${BR}`,
    'remote:',
    'To https://github.com/xiaoming-dev/my-first-repo.git',
    ` * [new branch]      ${BR} -> ${BR}`,
    `branch '${BR}' set up to track 'origin/${BR}'.`,
  ], { stagger: 0.1 });
  D.sync();
  D.say('现在 main 完全没变，新改动只在 add-greeting 上。怎么合并回主线？看下一章。', "main hasn't changed at all; the new work lives on add-greeting. Merging is next.");
  term.ready();
  D.sayOver('补充：`git switch main` 可以切回主线，文件夹里的文件会跟着变回去。', 'Bonus: `git switch main` jumps back, and your files change back with it.');
  D.wait(3);
  D.sync();

  recap(D, [
    ['分支按钮', '网页上切换 / 新建分支'],
    ['git switch -c 名字', '新建并切换到分支'],
    ['git switch 名字', '切换到已有分支'],
    ['git branch', '列出所有分支'],
    ['git push -u origin 名字', '第一次推送新分支'],
  ], '记住：**新功能放在分支上做，main 永远保持能用**。', 'Remember: **build new things on a branch; keep main working**.', { size: 34 });
}
