// 第 3 章：文件页上的按钮（Preview / Code / Raw / 复制 / 下载 / 编辑 / Commit changes）+ 原理：commit 是快照链
import { createBrowser, overview, blobPage, editPage, commitDialog, rawPage, tooltip, downloadBubble, q } from '../gh/ui.js';
import { baseRepo, README_LINES, repoUrl, OWNER, COMMITS } from '../gh/data.js';
import { createBoard, draw, pop } from '../core/board.js';

export default async function chapter(D) {
  // ---------- build all pages up front ----------
  const s = baseRepo();
  const readme = s.files.find((f) => f.name === 'README.md');
  const br = createBrowser(D, { url: repoUrl() });
  const home = br.add(overview(s));
  const pPreview = br.add(blobPage(s, readme, { mode: 'preview', lines: README_LINES, previewHtml: s.readmeHtml }));
  const pCode = br.add(blobPage(s, readme, { mode: 'code', lines: README_LINES }));
  const pRaw = br.add(rawPage(README_LINES));

  const added = ['', '## 今天学会了', '- 在网页上编辑文件并提交'];
  const newLines = [...README_LINES, ...added];
  const pEdit = br.add(editPage(s, readme, { lines: newLines }));
  const extra = added.map((_, i) => q(pEdit, `eline-${README_LINES.length + 1 + i}`));
  extra.forEach((ln) => { ln.classList.add('hid'); ln.querySelector('.tx').textContent = ''; });
  const dlg = br.overlay(commitDialog({ message: 'Update README.md' }));

  const newCommit = { user: OWNER, msg: '添加学习笔记标题', hash: '3f9c2a1', time: 'now' };
  const s2 = baseRepo({ commits: 4, latest: newCommit });
  const html2 = s.readmeHtml + '<h2>今天学会了</h2><ul><li>在网页上编辑文件并提交</li></ul>';
  const pAfter = br.add(blobPage(s2, { ...readme, latest: newCommit }, { mode: 'preview', lines: newLines, previewHtml: html2 }));

  const blobUrl = repoUrl('/blob/main/README.md');

  // ---------- script ----------
  D.titleCard('第 3 章 · Chapter 3', '文件页上的按钮', { en: 'Buttons on the File Page' });
  D.cut(br.root);
  D.cursorShow();

  D.sayOver('这是仓库首页。点开 **README.md**，看看单个文件的页面。', "This is the repo home page. Open **README.md** to see what a single file looks like.");
  D.wait(1).moveClick(q(home, 'file-README.md'), { dx: -150 });
  br.goto(pPreview, blobUrl);
  D.sync();

  D.sayOver('这就是**文件页**。左边是**文件树**，用来在文件之间跳转。', "This is the **file page**. The **file tree** on the left lets you jump between files.");
  D.focus(q(pPreview, 'tree'), { label: '文件树', zoom: 1.3 });
  D.sync();
  D.sayOver('这一栏显示：最后一次是**谁**、**什么时候**、改了**什么**。', "This bar shows **who** changed it last, **when**, and **what** they changed.");
  D.focus(q(pPreview, 'latest'), { label: '最近一次修改' });
  D.sync();

  // Preview / Code
  D.sayOver('**Preview** 显示排好版的效果，看起来像网页。', "**Preview** shows the formatted result, like a web page.");
  D.focus(q(pPreview, 'seg'), { label: 'Preview / Code / Blame', zoom: 2.2 });
  D.sync();
  D.sayOver('点 **Code**，看到的是文件的原始内容。', "Click **Code** to see the raw content of the file.");
  D.moveClick(q(pPreview, 'seg-code'));
  br.swap(pCode, blobUrl + '?plain=1');
  D.sync();
  D.unfocus();
  D.say('原来 `#` 和 `-` 都是排版符号，这种写法叫 **Markdown**。', "The `#` and `-` are formatting marks. This style is called **Markdown**.");
  const nums = [1, 7].map((i) => q(pCode, `line-${i}`).querySelector('.no'));
  D.sayOver('左边的数字是**行号**，方便说"第 5 行有问题"。', "The numbers on the left are **line numbers**, handy for saying \"line 5 has a problem\".");
  D.focus(D.unionRect(...nums), { label: '行号', zoom: 2 });
  D.sync();

  // Raw
  D.sayOver('右边这排按钮，先看 **Raw**，意思是"原始的"。', "Now the buttons on the right. First, **Raw**, meaning \"unprocessed\".");
  D.focus(q(pCode, 'raw'), { label: 'Raw 按钮', zoom: 2.4 });
  D.moveClick(q(pCode, 'raw'));
  D.sync();
  D.unfocus({ dur: 0.4 });
  br.goto(pRaw, 'raw.githubusercontent.com/xiaoming-dev/my-first-repo/main/README.md');
  D.say('它打开一个纯文字页面，方便复制，或者给程序直接读取。', "It opens a plain-text page: easy to copy, or for programs to read directly.");
  br.goto(pCode, blobUrl + '?plain=1');

  // Copy
  const copyBtn = q(pCode, 'copy');
  D.sayOver('这个是**复制**：一键复制整个文件的内容。', "This is **Copy**: copy the whole file in one click.");
  D.focus(copyBtn, { label: '复制', zoom: 2.4 });
  D.moveClick(copyBtn);
  const tip = tooltip(D, copyBtn, 'Copied!');
  D.show(tip, { dur: 0.2 });
  D.sync();
  D.hide(tip, { dur: 0.2 });

  // Download
  const dlBtn = q(pCode, 'download');
  D.sayOver('这个是**下载**：只把这一个文件存到电脑上。', "This is **Download**: save just this one file to your computer.");
  D.focus(dlBtn, { label: '下载', zoom: 2.4 });
  D.moveClick(dlBtn);
  D.unfocus({ dur: 0.5 });
  const bubble = downloadBubble(D, 'README.md', '245 B');
  D.show(bubble, { y: -10 });
  D.sync();
  D.hide(bubble, { dur: 0.2 });

  // Edit
  const pencil = q(pCode, 'edit');
  D.sayOver('这支**铅笔**是编辑按钮：直接在网页上改文件。', "The **pencil** is the Edit button: change the file right in your browser.");
  D.focus(pencil, { label: '编辑（铅笔）', zoom: 2.4 });
  D.moveClick(pencil);
  D.sync();
  D.unfocus({ dur: 0.4 });
  br.goto(pEdit, repoUrl('/edit/main/README.md'));

  D.sayOver('进入编辑器了。我们在最后加两行字。', "We're in the editor. Let's add two lines at the end.");
  D.focus(q(pEdit, 'editor'), { zoom: 1.5, cy: 520 });
  D.moveClick(q(pEdit, `eline-${README_LINES.length}`), { dx: 120 });
  D.show(extra[0], { dur: 0.15 });
  D.show(extra[1], { dur: 0.15 });
  D.type(extra[1].querySelector('.tx'), added[1], { cps: 10 });
  D.setClass(extra[1].querySelector('.tx'), 'tok-h');
  D.show(extra[2], { dur: 0.15 });
  D.type(extra[2].querySelector('.tx'), added[2], { cps: 10 });
  D.sync();

  D.sayOver('改完还**没保存**！要点右上角的 **Commit changes...**', "It's **not saved** yet! Click **Commit changes...** at the top right.");
  D.focus(q(pEdit, 'commitbtn'), { label: 'Commit changes...', zoom: 2.2 });
  D.sync();
  D.sayOver('在 GitHub 上，修改必须**提交**（**commit**）才算保存。', "On GitHub, a change is only saved once you **commit** it.");
  D.moveClick(q(pEdit, 'commitbtn'));
  D.unfocus({ dur: 0.4 });
  D.show(dlg, { dur: 0.25 });
  D.sync();

  D.sayOver('先写一句**提交说明**：这次改了什么。要具体，别写"改了点东西"。', "Write a **commit message** saying what you changed. Be specific, not \"changed stuff\".");
  D.focus(q(dlg, 'msginput'), { label: 'Commit message 提交说明', zoom: 2 });
  D.moveClick(q(dlg, 'msginput'));
  D.setClass(q(dlg, 'msginput'), 'focus');
  D.setText(q(dlg, 'msgtext'), '');
  D.type(q(dlg, 'msgtext'), '添加学习笔记标题', { cps: 6 });
  D.sync();

  D.sayOver('下面选"直接提交到 **main**"。另一个选项和分支有关，第 8 章再讲。', "Choose \"Commit directly to **main**\". The other option is about branches (Chapter 8).");
  D.focus(D.unionRect(q(dlg, 'opt-direct'), q(dlg, 'opt-branch')), { zoom: 2 });
  D.sync();
  D.sayOver('最后点 **Commit changes**。', "Finally, click **Commit changes**.");
  D.focus(q(dlg, 'confirm'), { zoom: 2.2 });
  D.moveClick(q(dlg, 'confirm'));
  D.unfocus({ dur: 0.4 });
  D.hide(dlg, { dur: 0.2 });
  br.goto(pAfter, blobUrl);
  D.sync();

  D.sayOver('成功！顶部出现了刚写的说明，还有一串编号 `3f9c2a1`。它是什么？', "Done! Your message is at the top, next to a code: `3f9c2a1`. What is that?");
  D.focus(q(pAfter, 'latest'), { label: '新的提交', zoom: 1.8 });
  D.sync();

  // ---------- 原理：commit = 快照链 ----------
  const bd = createBoard(D, { title: 'commit 到底是什么？' });
  const xs = [330, 750, 1170, 1590];
  const all = [...COMMITS, newCommit];
  const nodes = all.map((c, i) => bd.node(xs[i], 450, {
    label: c.msg, sub: c.hash, color: i === 3 ? '#3fb950' : '#2f81f7', r: 44, icon: `${i + 1}`,
  }));
  const arrows = [0, 1, 2].map((i) => bd.arrow(xs[i + 1] - 62, 450, xs[i] + 62, 450, { color: '#7d8590' }));
  const snapshot = bd.box(330, 800, 520, 190, {
    title: '快照 = 那一刻所有文件的样子', color: '#2f81f7',
    html: '<span class="b-file">📄 README.md</span><span class="b-file">📁 notes</span>',
  });
  const parentTip = bd.text(960, 655, '每个存档都记着它的<b>上一个</b>', { size: 30, color: '#9198a1' });
  const idTip = bd.chip(1590, 700, '哈希值 = 存档的身份证号', { color: '#3fb950' });
  const tamper = bd.box(1300, 850, 760, 150, {
    title: '内容改一个字 → 号码全变', color: '#f0883e',
    html: '<span style="font-family:Cascadia Mono,Consolas,monospace">3f9c2a1 → <span style="color:#ff7b72">b70e5d9</span></span>',
  });

  D.cut(bd.root, { fade: 0.6 });
  D.cursorShow(false);
  D.sayOver('commit 就像游戏**存档**：把整个项目此刻的样子拍一张**快照**。', "A commit is like a **game save**: a **snapshot** of the whole project at this moment.");
  pop(D, nodes[0]);
  pop(D, snapshot);
  D.sync();
  D.sayOver('每提交一次，就多一个存档。这个仓库现在有 4 个。', "Every commit adds one more save. This repo now has 4.");
  for (let i = 1; i < 4; i++) { pop(D, nodes[i]); draw(D, arrows[i - 1], { dur: 0.4 }); }
  D.sync();
  D.sayOver('箭头表示：每个存档都记着**上一个**，连成一条**历史链**，随时可以回去看。', "Each save remembers the **previous** one, forming a **history chain** you can revisit anytime.");
  D.show(parentTip);
  D.sync();
  D.sayOver('那串编号叫**哈希值**，由内容计算得出，是存档的**身份证号**。', "That code is a **hash**, calculated from the content: the save's **ID number**.");
  pop(D, idTip);
  D.sync();
  D.sayOver('内容改一个字，号码就全变。所以历史没法被偷偷篡改。', "Change one character and the hash changes completely, so history can't be secretly altered.");
  pop(D, tamper);
  D.sync();

  // ---------- 小结 ----------
  const sum = createBoard(D, { title: '本章小结', kicker: '回顾' });
  const rows = [
    ['Preview / Code', '切换"排版效果"和"原始内容"'],
    ['Raw', '只看纯文字，方便复制或给程序读取'],
    ['复制 / 下载', '一键复制全文 / 只下载这一个文件'],
    ['铅笔（编辑）', '直接在网页上修改文件'],
    ['Commit changes', '写好提交说明，修改才算真正保存'],
  ].map(([k, v], i) => sum.text(260, 260 + i * 130, `<div class="b-row"><span class="k"><code>${k}</code></span><span>${v}</span></div>`, { anchor: 'left', size: 40 }));
  D.cut(sum.root, { fade: 0.6 });
  D.sayOver('本章小结。', "Chapter recap.");
  rows.forEach((r) => D.show(r, { y: 20, dur: 0.4 }));
  D.sync(3);
  D.say('记住：**改完必须 commit，才算保存**。', "Remember: **a change only counts once you commit it**.");
}
