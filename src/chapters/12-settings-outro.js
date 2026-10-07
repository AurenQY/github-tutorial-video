// 第 12 章：Settings 简介 + 速查表 + 结尾
import { createBrowser, q } from '../gh/ui.js';
import { settingsPage } from '../gh/ui2.js';
import { repoUrl, repoAfterCh6 } from '../gh/data.js';
import { createBoard, pop } from '../core/board.js';

export default async function chapter(D) {
  const s = repoAfterCh6();
  const br = createBrowser(D, { url: repoUrl('/settings') });
  const gen = br.add(settingsPage(s));
  const col = br.add(settingsPage(s, { section: 'collab' }));

  D.titleCard('第 12 章 · Chapter 12', 'Settings 与总复习', { en: 'Settings and Final Review' });
  D.cut(br.root);
  D.cursorShow();

  D.sayOver('最后一个标签 **Settings**（设置），只有仓库的主人才能看到。', 'The last tab, **Settings**, is visible only to the repository owner.');
  D.focus(q(gen, 'tab-settings'), { label: 'Settings', zoom: 2.4 });
  D.sync();
  D.sayOver('**General** 里可以给仓库改名。', 'Under **General** you can rename the repository.');
  D.focus(q(gen, 'rename'), { label: 'Repository name', zoom: 2 });
  D.sync();
  D.sayOver('拉到最下面是 **Danger Zone**（危险区）：改公开/私有、转让、删除仓库。', 'At the bottom is the **Danger Zone**: change visibility, transfer, or delete the repo.');
  D.unfocus({ dur: 0.4 });
  D.scroll(gen, 150, { dur: 0.7 });
  D.focus(q(gen, 'danger'), { label: 'Danger Zone', zoom: 1.5, cy: 460 });
  D.sync();
  D.say('删除仓库**无法恢复**，GitHub 会让你输入仓库名确认，一定要想清楚。', 'Deleting **cannot be undone**; GitHub makes you type the name to confirm. Be sure.');
  D.unfocus({ dur: 0.4 });
  D.moveClick(q(gen, 'nav-collab'));
  br.swap(col, repoUrl('/settings/access'));
  D.sayOver('**Collaborators**（协作者）：点 **Add people** 邀请同学，他们就能直接往这个仓库提交。', '**Collaborators**: click **Add people** to invite friends who can then push directly.');
  D.focus(q(col, 'manage'), { label: 'Add people', zoom: 1.5 });
  D.sync();
  D.unfocus();

  // ---------- cheat sheet ----------
  const b = createBoard(D, { title: '速查表', kicker: '收藏' });
  const left = [
    ['git clone 地址', '下载仓库'], ['git status', '查看状态'], ['git add 文件', '放进暂存区'], ['git commit -m "说明"', '本地存档'],
    ['git push', '上传'], ['git pull', '拉取最新'], ['git switch -c 分支', '新建分支'], ['git log --oneline', '查看历史'],
  ];
  const right = [
    ['+ → New repository', '新建仓库'], ['铅笔 / Commit changes', '网页上修改'], ['<> Code', '复制地址 / ZIP'], ['Commits / Blame', '查看历史'],
    ['分支按钮', '新建/切换分支'], ['Merge pull request', '合并 PR'], ['Star / Fork', '收藏 / 复制'], ['New issue', '报告问题'],
  ];
  const head = [b.text(520, 215, '⌨️ PowerShell 命令', { size: 34, weight: 700, color: '#7ee787' }), b.text(1420, 215, '🖱️ GitHub 按钮', { size: 34, weight: 700, color: '#79c0ff' })];
  const cell = (k, v, x, y) => b.text(x, y, `<div class="b-row" style="gap:24px"><span class="k" style="width:420px"><code>${k.replace(/</g, '&lt;')}</code></span><span style="font-size:32px;color:#c9d1d9">${v}</span></div>`, { anchor: 'left', size: 32 });
  const rowsL = left.map(([k, v], i) => cell(k, v, 80, 295 + i * 80));
  const rowsR = right.map(([k, v], i) => cell(k, v, 980, 295 + i * 80));
  D.cut(b.root, { fade: 0.6 });
  D.cursorShow(false);
  D.sayOver('这张速查表总结了整个视频，建议截图保存。', 'This cheat sheet sums up the whole video. Take a screenshot!');
  head.forEach((h) => D.show(h, { dur: 0.3 }));
  rowsL.forEach((r, i) => { D.show(r, { y: 14, dur: 0.25 }); D.show(rowsR[i], { y: 14, dur: 0.25 }); });
  D.sync(6);

  // ---------- outro ----------
  const o = createBoard(D, { title: '' });
  const big = o.text(960, 400, '🎉 恭喜你学会了 GitHub！', { size: 76, weight: 700 });
  const sub = o.text(960, 520, 'You now know the essentials of GitHub.', { size: 34, color: '#9198a1' });
  const tip = o.text(960, 680, '下一步：今天就新建一个仓库，<b>把你的学习笔记放上去</b>', { size: 40 });
  const bye = o.text(960, 820, '感谢观看 · Thanks for watching', { size: 30, color: '#7d8590' });
  D.cut(o.root, { fade: 0.8 });
  D.sayOver('恭喜你，GitHub 的核心用法你都学会了！', "Congratulations, you've learned the essentials of GitHub!");
  pop(D, big, { dur: 0.6 });
  D.show(sub, { dur: 0.4 });
  D.sync();
  D.sayOver('最好的练习方法：今天就建一个仓库，把学习笔记放上去，每天 commit 一次。', 'Best practice: create a repo today, put your notes in it, and commit every day.');
  D.show(tip, { y: 20 });
  D.sync();
  D.show(bye, { dur: 0.6 });
  D.wait(3);
}
