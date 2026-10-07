// 第 11 章：Star / Watch / Fork + Issues + 原理：开源协作流程
import { createBrowser, overview, q } from '../gh/ui.js';
import { watchMenu, forkPage, aheadBar, contributeMenu, issuesPage, newIssuePage, issuePage, menuAt } from '../gh/ui2.js';
import { repoAfterCh6, OWNER, REPO } from '../gh/data.js';
import { createBoard, draw, pop } from '../core/board.js';
import { recap } from './common.js';

const T = 'lin-teacher', TR = 'study-notes';
const BUG = { name: 'bug', bg: '#d73a4a', fg: '#fff' };

export default async function chapter(D) {
  const other = {
    owner: T, repo: TR, mine: false, desc: '高中毕业生的编程入门笔记合集，欢迎一起完善！',
    branch: 'main', branches: 1, tags: 0, commits: 86, stars: 128, watching: 12, forks: 30, issues: 4, pulls: 1,
    latest: { user: T, msg: '更新 Python 基础第 5 课', hash: 'e2c91aa', time: 'yesterday' },
    files: [
      { name: 'lessons', type: 'dir', msg: '更新 Python 基础第 5 课', time: 'yesterday' },
      { name: 'python-basics.md', type: 'file', msg: '修正错别字', time: 'last week' },
      { name: 'README.md', type: 'file', msg: '完善目录', time: 'last week' },
    ],
    readmeHtml: `<h1>${TR}</h1><p>从零开始学编程的笔记，适合刚毕业的你。</p>`,
    langs: [{ name: 'Python', color: '#3572A5', pct: 100 }],
  };
  const url = (o, r, p = '') => `github.com/${o}/${r}${p}`;
  const br = createBrowser(D, { url: url(T, TR) });
  const pOther = br.add(overview(other));
  const pStarred = br.add(overview({ ...other, starred: true, stars: 129 }));
  const wmenu = menuAt(D, br, q(pStarred, 'watch'), watchMenu(), { align: 'right' });
  const pFork = br.add(forkPage({ ...other, owner: OWNER }, other));
  const mine = { ...other, owner: OWNER, mine: true, stars: 0, watching: 1, forks: 0, issues: 0, pulls: 0, forkedFrom: `${T}/${TR}` };
  const pForked = br.add(overview(mine));
  const pAhead = br.add(overview({ ...mine, banner: aheadBar(`${T}/${TR}`), latest: { user: OWNER, msg: '补充 for 循环的例子', hash: '7d4f2b0', time: 'now' } }));
  const cmenu = menuAt(D, br, q(pAhead, 'contribute'), contributeMenu(`${T}/${TR}`), { align: 'left' });

  const s = repoAfterCh6({ branches: 1 });
  const issue = { num: 3, title: '输入名字时没有检查是否为空', body: '直接按回车也会打招呼："你好呀，！"，看起来很奇怪。<br>建议：名字为空时提示重新输入。', labels: [BUG] };
  const pIssues = br.add(issuesPage(s));
  const pNew = br.add(newIssuePage(s));
  const pIssue = br.add(issuePage(s, issue));
  const pClosed = br.add(issuePage(s, { ...issue, closedBy: 4 }, { closed: true }));

  D.titleCard('第 11 章 · Chapter 11', '参与别人的项目：Star、Fork、Issues', { en: 'Star, Watch, Fork and Issues' });
  D.cut(br.root);
  D.cursorShow();

  D.sayOver('这是别人的公开仓库。右上角有三个按钮：**Watch**、**Fork**、**Star**。', "This is someone else's public repo. Top right: **Watch**, **Fork**, **Star**.");
  D.focus(D.unionRect(q(pOther, 'watch'), q(pOther, 'star')), { zoom: 1.9 });
  D.sync();

  // Star
  D.sayOver('**Star**（星标）= 收藏 + 点赞：方便以后找到，也是对作者的鼓励。', '**Star** = bookmark + like: easy to find later, and encouraging for the author.');
  D.focus(q(pOther, 'star'), { label: 'Star', zoom: 2.4 });
  D.moveClick(q(pOther, 'starbtn'));
  br.swap(pStarred);
  D.sync();
  D.say('点完变成黄色的 **Starred**，数字也加了 1。星越多，通常说明项目越受欢迎。', 'It turns into a yellow **Starred**, and the count goes up. More stars usually means more popular.');

  // Watch
  D.sayOver('**Watch**（关注）是订阅通知：选 **All Activity**，仓库有任何动静都会通知你。', '**Watch** subscribes to notifications: pick **All Activity** to hear about everything.');
  D.focus(q(pStarred, 'watch'), { label: 'Watch', zoom: 2.4 });
  D.moveClick(q(pStarred, 'watch'));
  D.unfocus({ dur: 0.4 });
  D.show(wmenu, { dur: 0.2 });
  D.focus(wmenu, { zoom: 1.6, pad: 2 });
  D.sync();
  D.hide(wmenu, { dur: 0.15 });
  D.unfocus({ dur: 0.4 });

  // Fork
  D.sayOver('**Fork**（复刻）：把整个仓库复制一份到你自己的账号下。', '**Fork** copies the whole repository into your own account.');
  D.focus(q(pStarred, 'fork'), { label: 'Fork', zoom: 2.4 });
  D.moveClick(q(pStarred, 'forkbtn'));
  D.sync();
  D.unfocus({ dur: 0.4 });
  br.goto(pFork, url(T, TR, '/fork'));
  D.say('为什么要 Fork？因为你没有权限直接改别人的仓库，但可以随便改自己的副本。', "Why fork? You can't change someone else's repo, but you can change your own copy.");
  D.sayOver('确认名字，点 **Create fork**。', 'Check the name and click **Create fork**.');
  D.focus(q(pFork, 'createfork'), { label: 'Create fork', zoom: 2.2 });
  D.moveClick(q(pFork, 'createfork'));
  D.sync();
  D.unfocus({ dur: 0.4 });
  br.goto(pForked, url(OWNER, TR));
  D.sayOver('现在它在你名下了，下面还标着 "forked from"，说明是从哪里复制来的。', 'Now it\'s under your name, with "forked from" showing where it came from.');
  D.focus(q(pForked, 'forknote').parentElement, { zoom: 1.6 });
  D.sync();
  D.unfocus({ dur: 0.4 });
  br.swap(pAhead);
  D.sayOver('在副本里改好并提交后，这里会显示"领先原仓库 1 个提交"。', 'After you commit in your copy, it says you are "1 commit ahead" of the original.');
  D.focus(q(pAhead, 'ahead'), { zoom: 1.6 });
  D.sync();
  D.sayOver('点 **Contribute → Open pull request**，就能把改动提交给原作者，由他决定是否合并。', 'Click **Contribute → Open pull request** to offer your changes; the owner decides.');
  D.moveClick(q(pAhead, 'contribute'));
  D.unfocus({ dur: 0.4 });
  D.show(cmenu, { dur: 0.2 });
  D.focus(cmenu, { zoom: 1.8, pad: 2 });
  D.sync();
  D.hide(cmenu, { dur: 0.15 });
  D.unfocus({ dur: 0.4 });

  // ---------- 原理：开源协作 ----------
  const b = createBoard(D, { title: '开源项目是怎么协作的？' });
  const orig = b.box(480, 400, 520, 200, { title: `📦 ${T}/${TR}`, color: '#2f81f7', html: '原仓库（你没有修改权限）' });
  const copy = b.box(1440, 400, 520, 200, { title: `📦 ${OWNER}/${TR}`, color: '#3fb950', html: '你的副本（随便改）' });
  const local = b.box(1440, 780, 520, 170, { title: '💻 你的电脑', color: '#d29922', html: 'clone → 修改 → commit → push' });
  const a1 = b.arrow(745, 370, 1175, 370, { color: '#3fb950' });
  const l1 = b.text(960, 330, '① Fork', { size: 28 });
  const a2 = b.arrow(1440, 505, 1440, 690, { color: '#d29922' });
  const a3 = b.arrow(1175, 450, 745, 450, { color: '#a371f7' });
  const l3 = b.text(960, 500, '③ Pull Request', { size: 28 });
  const l2 = b.text(1560, 600, '② 修改', { size: 28 });
  const world = b.text(560, 800, '🌍 全世界的开源项目<br>都是这样一起完成的', { size: 34 });
  D.cut(b.root, { fade: 0.6 });
  D.cursorShow(false);
  D.sayOver('整个流程：先 **Fork** 一份到自己名下……', 'The full flow: first **Fork** a copy into your account…');
  pop(D, orig); draw(D, a1, { dur: 0.5 }); D.show(l1, { dur: 0.2 }); pop(D, copy);
  D.sync();
  D.sayOver('……在副本上修改、提交……', '…edit and commit in your copy…');
  draw(D, a2, { dur: 0.4 }); D.show(l2, { dur: 0.2 }); pop(D, local);
  D.sync();
  D.sayOver('……再发 **Pull Request** 请原作者合并。', '…then send a **Pull Request** asking the owner to merge.');
  draw(D, a3, { dur: 0.5 }); D.show(l3, { dur: 0.2 });
  D.sync();
  D.sayOver('全世界成千上万的开源项目，都是这样一起完成的。', 'Countless open-source projects around the world are built exactly this way.');
  D.show(world, { y: 20 });
  D.sync();

  // ---------- Issues ----------
  D.cut(br.root, { fade: 0.6 });
  br.swap(pIssues, url(OWNER, REPO, '/issues'));
  D.cursorShow();
  D.sayOver('最后看 **Issues** 标签：它是项目的"问题清单"，报 bug、提建议、记待办都用它。', 'Finally, the **Issues** tab: the project\'s to-do list for bugs, ideas and tasks.');
  D.focus(q(pIssues, 'tab-issues'), { label: 'Issues', zoom: 2.4 });
  D.sync();
  D.sayOver('点 **New issue** 新建一个。', 'Click **New issue** to create one.');
  D.focus(q(pIssues, 'newissue'), { label: 'New issue', zoom: 2.4 });
  D.moveClick(q(pIssues, 'newissue'));
  D.sync();
  D.unfocus({ dur: 0.4 });
  br.goto(pNew, url(OWNER, REPO, '/issues/new'));
  D.sayOver('标题一句话说清问题，描述里写清楚怎么发现的、希望怎么改。', 'A one-line title, then describe how you found it and what should change.');
  D.focus(q(pNew, 'title').parentElement.parentElement, { zoom: 1.4, cy: 500 });
  D.moveClick(q(pNew, 'title'));
  D.type(q(pNew, 'titletext'), issue.title, { cps: 9 });
  D.setClass(q(pNew, 'bodyph'), 'hid');
  D.type(q(pNew, 'bodytext'), '直接按回车也会打招呼，看起来很奇怪。建议名字为空时提示重新输入。', { cps: 14 });
  D.sync();
  D.sayOver('右边的 **Assignees** 指定谁来负责，**Labels** 给问题分类，比如 bug。', '**Assignees** says who handles it; **Labels** categorise it, e.g. bug.');
  D.focus(q(pNew, 'side'), { zoom: 1.6 });
  D.setText(q(pNew, 'assignee-v'), OWNER);
  D.wait(0.8);
  const lv = q(pNew, 'label-v');
  D.toggle(() => { lv.innerHTML = `<span class="gh-label" style="background:${BUG.bg};color:${BUG.fg}">bug</span>`; }, () => { lv.textContent = 'No labels'; });
  D.sync();
  D.unfocus({ dur: 0.4 });
  D.moveClick(q(pNew, 'create'));
  br.goto(pIssue, url(OWNER, REPO, '/issues/3'));
  D.sayOver('建好了！每个 Issue 都有一个编号，这个是 **#3**。', 'Created! Every issue gets a number; this one is **#3**.');
  D.focus(q(pIssue, 'title'), { zoom: 1.8 });
  D.sync();
  D.say('编号和 PR 共用一套，所以前面的两个 PR 占了 #1 和 #2。', 'Issues and PRs share numbers, so our two PRs took #1 and #2.');
  D.say('修好之后，在 PR 说明里写上 **Closes #3**。', 'Once fixed, write **Closes #3** in the PR description.');
  D.unfocus({ dur: 0.4 });
  br.swap(pClosed);
  D.sayOver('PR 一合并，这个 Issue 就会**自动关闭**，并记录是哪个 PR 修好的。', 'When that PR merges, the issue **closes automatically** and links to the fix.');
  D.focus(q(pClosed, 'closedev'), { zoom: 1.7 });
  D.sync();

  recap(D, [
    ['Star', '收藏 + 点赞'],
    ['Watch', '订阅仓库通知'],
    ['Fork', '复制一份到自己名下'],
    ['Contribute → PR', '把改动提交给原作者'],
    ['Issues / New issue', '报告问题、提建议'],
    ['Closes #编号', 'PR 合并时自动关闭 Issue'],
  ], '记住：**Fork + PR 参与别人的项目，Issue 记录问题**。', 'Remember: **Fork + PR to contribute; Issues to track problems**.', { size: 32 });
}
