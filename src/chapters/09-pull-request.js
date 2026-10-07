// 第 9 章：Pull Request —— 创建、审查、合并、删除分支 + 原理：合并时间线
import { createBrowser, overview, q } from '../gh/ui.js';
import { compareBanner, prCreatePage, prPage } from '../gh/ui2.js';
import { createTerminal } from '../core/terminal.js';
import { repoUrl, repoAfterCh6, HELLO_LINES_2, GREETING_NEW, OWNER } from '../gh/data.js';
import { createBoard, draw, pop } from '../core/board.js';
import { recap } from './common.js';

const BR = 'add-greeting';
const REPO_DIR = 'C:\\Users\\xiaoming\\Desktop\\my-first-repo';
export const PR_FILES = [{
  name: 'hello.py', lang: 'py', adds: 1, dels: 1, rows: [
    { t: 'hunk', c: '@@ -1,4 +1,4 @@' },
    { t: 'ctx', o: 1, n: 1, c: HELLO_LINES_2[0] },
    { t: 'ctx', o: 2, n: 2, c: HELLO_LINES_2[1] },
    { t: 'del', o: 3, c: HELLO_LINES_2[2] },
    { t: 'add', n: 3, c: GREETING_NEW },
    { t: 'ctx', o: 4, n: 4, c: HELLO_LINES_2[3] },
  ],
}];
export const PR = {
  num: 1, title: '把问候语改得更热情', head: BR, sha: 'c41a9e2', commit: '把问候语改得更热情',
  body: '把 hello.py 里的问候语改得更热情一点，加了一个 🎉。', files: PR_FILES,
};

export default async function chapter(D) {
  const s = repoAfterCh6({ branches: 2 });
  const br = createBrowser(D, { url: repoUrl() });
  const home = br.add(overview({ ...s, banner: compareBanner(BR) }));
  const create = br.add(prCreatePage(s, { head: BR, files: PR_FILES }));
  const conv = br.add(prPage(s, PR));
  const filesTab = br.add(prPage(s, {
    ...PR, files: [{ ...PR_FILES[0], rows: [...PR_FILES[0].rows.slice(0, 5), { t: 'cmt', c: `<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px"><b>lin-teacher</b><span class="muted">now</span></div>🎉 这个表情不错！要不要把"超级"去掉，读起来更自然？` }, PR_FILES[0].rows[5]] }],
  }, { tab: 'files' }));
  const merged = br.add(prPage(s, PR, { state: 'merged' }));
  const merged2 = br.add(prPage(s, PR, { state: 'merged', deleted: true }));
  const term = createTerminal(D, { banner: false });
  term.cd(REPO_DIR);
  term.idle();

  D.titleCard('第 9 章 · Chapter 9', 'Pull Request：申请合并', { en: 'Pull Requests' });
  D.cut(br.root);
  D.cursorShow();

  D.sayOver('推送分支后，仓库首页会出现一条黄色提示。点 **Compare & pull request**。', 'After pushing a branch, a yellow banner appears. Click **Compare & pull request**.');
  D.focus(q(home, 'banner'), { label: '新分支有推送', zoom: 1.6 });
  D.moveClick(q(home, 'compare'));
  D.sync();
  D.unfocus({ dur: 0.4 });
  br.goto(create, repoUrl(`/compare/main...${BR}`));

  D.say('**Pull Request**（简称 PR）就是"合并请求"：请大家看看我的改动，同意的话就合并进主线。', 'A **Pull Request** (PR) asks: please review my changes, and merge them if they look good.');
  D.sayOver('**base** 是要合并**进去**的分支 main，**compare** 是你的新分支。', '**base** is the branch to merge **into** (main); **compare** is your new branch.');
  D.focus(q(create, 'range'), { zoom: 1.5 });
  D.sync();
  D.sayOver('**Able to merge** 表示两边没有冲突，可以自动合并。', '**Able to merge** means there are no conflicts; it can merge automatically.');
  D.focus(q(create, 'able'), { label: 'Able to merge', zoom: 2.4 });
  D.sync();
  D.sayOver('写清楚标题和说明：改了什么、为什么改。', 'Write a clear title and description: what changed, and why.');
  D.focus(q(create, 'title').parentElement.parentElement, { zoom: 1.4, cy: 520 });
  D.moveClick(q(create, 'title'));
  D.type(q(create, 'titletext'), PR.title, { cps: 8 });
  D.moveClick(q(create, 'desc'));
  D.setClass(q(create, 'descph'), 'hid');
  D.type(q(create, 'desctext'), PR.body.replace(/<[^>]+>/g, ''), { cps: 12 });
  D.sync();
  D.sayOver('最后点 **Create pull request**。', 'Then click **Create pull request**.');
  D.focus(q(create, 'createpr'), { label: 'Create pull request', zoom: 2.2 });
  D.moveClick(q(create, 'createpr'));
  D.sync();
  D.unfocus({ dur: 0.4 });
  br.goto(conv, repoUrl('/pull/1'));

  D.sayOver('PR 建好了，绿色的 **Open** 表示正在等待处理。', 'The PR is created. The green **Open** badge means it is waiting for review.');
  D.focus(q(conv, 'sub'), { zoom: 1.6 });
  D.sync();
  D.sayOver('**Conversation** 是讨论区，**Commits** 是包含的提交，**Files changed** 是具体改了哪些行。', '**Conversation** is for discussion, **Commits** lists commits, **Files changed** shows the edits.');
  D.focus(D.unionRect(q(conv, 'tab-conversation'), q(conv, 'tab-files')), { zoom: 1.8 });
  D.moveClick(q(conv, 'tab-files'));
  D.sync();
  D.unfocus({ dur: 0.4 });
  br.swap(filesTab, repoUrl('/pull/1/files'));

  D.sayOver('这里是改动的 diff。队友可以在任意一行留言提意见，这叫 **Code Review**（代码审查）。', "Here's the diff. Teammates can comment on any line. This is **code review**.");
  D.focus(q(filesTab, 'diff0'), { zoom: 1.35, cy: 500 });
  D.sync();
  D.say('有意见就继续改、继续 push，PR 会自动更新，直到大家都满意。', 'Need changes? Just commit and push again; the PR updates automatically.');
  D.unfocus({ dur: 0.4 });
  br.swap(conv, repoUrl('/pull/1'));

  D.sayOver('没问题了，就点 **Merge pull request**……', 'When everyone is happy, click **Merge pull request**…');
  D.scroll(conv, 120, { dur: 0.6 });
  D.focus(q(conv, 'mergebox'), { zoom: 1.5, cy: 440 });
  D.moveClick(q(conv, 'mergebtn'));
  D.show(q(conv, 'confirmrow'), { dur: 0.25 });
  D.sync();
  D.sayOver('……再点 **Confirm merge** 确认。', '…and **Confirm merge**.');
  D.focus(q(conv, 'confirm'), { label: 'Confirm merge', zoom: 2.2 });
  D.moveClick(q(conv, 'confirm'));
  D.sync();
  D.unfocus({ dur: 0.4 });
  br.swap(merged);
  D.sayOver('变成紫色的 **Merged**：改动已经进入 main 了！', 'Purple **Merged**: the changes are now in main!');
  D.focus(q(merged, 'sub'), { zoom: 1.6 });
  D.sync();
  D.sayOver('分支已经完成任务，点 **Delete branch** 删掉它，让仓库保持整洁。', 'The branch has done its job. Click **Delete branch** to keep things tidy.');
  D.scroll(merged, 120, { dur: 0.6 });
  D.focus(q(merged, 'delbranch'), { label: 'Delete branch', zoom: 2.2 });
  D.moveClick(q(merged, 'delbranch'));
  D.scroll(merged2, 120, { dur: 0.01 });
  br.swap(merged2);
  D.sync();
  D.unfocus();

  // ---------- back to local ----------
  D.cut(term.root, { fade: 0.5 });
  D.cursorShow(false);
  D.sayOver('最后回到电脑：切回 main，`git pull` 拿到合并后的最新代码。', 'Back on your computer: switch to main and `git pull` the merged code.');
  term.cmd('git switch main');
  term.out(["Switched to branch 'main'", "Your branch is up to date with 'origin/main'."]);
  term.ready();
  term.cmd('git pull');
  term.out([
    'Updating 6e1d7b4..8f3e2d1',
    'Fast-forward',
    ' hello.py | 2 [green]+[/][red]-[/]',
    ' 1 file changed, 1 insertion(+), 1 deletion(-)',
  ], { stagger: 0.12 });
  D.sync();
  term.ready();

  // ---------- 原理 ----------
  const b = createBoard(D, { title: '合并做了什么？' });
  const Y = 400, Y2 = 640;
  const xs = [300, 600, 900];
  const mains = xs.map((x) => b.node(x, Y, { color: '#2f81f7', r: 30 }));
  const ma = [1, 2].map((i) => b.arrow(xs[i] - 42, Y, xs[i - 1] + 42, Y));
  const bn = b.node(1150, Y2, { color: '#3fb950', r: 30, icon: '✎' });
  const ba = b.arrow(1110, Y2 - 20, 938, Y + 22, { color: '#3fb950' });
  const mg = b.node(1450, Y, { color: '#a371f7', r: 40, icon: 'M' });
  const m1 = b.arrow(1405, Y, 940, Y, { color: '#a371f7' });
  const m2 = b.arrow(1410, Y + 26, 1190, Y2 - 14, { color: '#a371f7' });
  const mgL = b.chip(1450, Y - 100, '合并存档 merge', { color: '#a371f7' });
  const val = b.text(960, 850, 'PR 的意义：改动进入主线之前，<b>先被别人看过、讨论过</b>', { size: 34 });
  D.cut(b.root, { fade: 0.6 });
  D.sayOver('原理：合并就是把两条时间线汇到一起……', 'How it works: merging joins the two timelines…');
  mains.forEach((n, i) => { pop(D, n, { dur: 0.3 }); if (i) draw(D, ma[i - 1], { dur: 0.25 }); });
  draw(D, ba, { dur: 0.4 });
  pop(D, bn);
  D.sync();
  D.sayOver('……生成一个新的存档，它同时记着两条线的"上一个"。', '…into a new save that remembers the previous save of both lines.');
  pop(D, mg);
  draw(D, m1, { dur: 0.4 });
  draw(D, m2, { dur: 0.4 });
  D.show(mgL, { dur: 0.3 });
  D.sync();
  D.sayOver('PR 的价值在于：改动进入主线之前，先被别人看过、讨论过。', 'The value of a PR: changes are reviewed and discussed before they reach main.');
  D.show(val, { y: 20 });
  D.sync();

  recap(D, [
    ['Compare & pull request', '为新分支发起 PR'],
    ['base ← compare', '合并进哪里 ← 从哪里来'],
    ['Files changed', '审查改动、逐行留言'],
    ['Merge pull request', '合并进 main'],
    ['Delete branch', '合并后删除分支'],
    ['git pull', '把合并结果拉到电脑'],
  ], '记住：**分支 → PR → 审查 → 合并**，这就是团队协作的节奏。', 'Remember: **branch → PR → review → merge**, the rhythm of teamwork.', { size: 32 });
}
