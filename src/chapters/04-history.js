// 第 4 章：Commits / History / Blame + 原理：diff 是逐行对比
import { createBrowser, overview, blobPage, q } from '../gh/ui.js';
import { commitsPage, commitDetailPage } from '../gh/ui2.js';
import { repoUrl, OWNER, COMMITS, COMMIT_4, README_LINES, README_LINES_2, repoAfterCh3 } from '../gh/data.js';
import { createBoard, pop } from '../core/board.js';
import { recap } from './common.js';

export default async function chapter(D) {
  const s = repoAfterCh3();
  const readme = s.files.find((f) => f.name === 'README.md');
  const list = [{ ...COMMIT_4, time: '5 minutes ago' }, ...COMMITS.slice().reverse()];
  const br = createBrowser(D, { url: repoUrl() });
  const home = br.add(overview(s));
  const pList = br.add(commitsPage(s, list));
  const diffRows = [
    { t: 'hunk', c: '@@ -5,3 +5,6 @@' },
    { t: 'ctx', o: 5, n: 5, c: README_LINES[4] },
    { t: 'ctx', o: 6, n: 6, c: README_LINES[5] },
    { t: 'ctx', o: 7, n: 7, c: README_LINES[6] },
    { t: 'add', n: 8, c: '' },
    { t: 'add', n: 9, c: '## 今天学会了' },
    { t: 'add', n: 10, c: '- 在网页上编辑文件并提交' },
  ];
  const pDetail = br.add(commitDetailPage(s, { ...COMMIT_4, time: '5 minutes ago', parent: COMMITS[2].hash }, [{ name: 'README.md', rows: diffRows, adds: 3, dels: 0 }]));
  const latest = { user: OWNER, msg: COMMIT_4.msg, hash: COMMIT_4.hash, time: '5 minutes ago' };
  const pBlob = br.add(blobPage(s, { ...readme, latest }, { mode: 'code', lines: README_LINES_2 }));
  const pBlame = br.add(blobPage(s, { ...readme, latest }, {
    mode: 'blame', lines: README_LINES_2, blame: [
      { age: '3 days ago', user: OWNER, msg: 'Initial commit', lines: README_LINES, color: '#ffd8b5' },
      { age: '5 min ago', user: OWNER, msg: COMMIT_4.msg, lines: README_LINES_2.slice(7), color: '#fb8f44' },
    ],
  }));

  D.titleCard('第 4 章 · Chapter 4', '查看历史：Commits、History、Blame', { en: 'Commits, History and Blame' });
  D.cut(br.root);
  D.cursorShow();

  D.sayOver('上一章我们提交了一次修改。怎么查看所有的修改记录呢？', 'We made a commit in the last chapter. How do we see all the changes ever made?');
  D.focus(q(home, 'commits'), { label: '4 Commits', zoom: 2.4 });
  D.sync();
  D.sayOver('点文件列表右上角的 **Commits**。', 'Click **Commits** at the top right of the file list.');
  D.moveClick(q(home, 'commits'));
  D.unfocus({ dur: 0.4 });
  br.goto(pList, repoUrl('/commits/main/'));
  D.sync();

  D.sayOver('这就是**提交历史**：最新的在最上面，每条都有说明、作者、时间和编号。', 'This is the **commit history**: newest on top, each with a message, author, time and code.');
  D.focus(q(pList, 'list'), { zoom: 1.3 });
  D.sync();
  D.say('说明写得清楚，这个列表就像一本项目日记。', 'With clear messages, this list reads like a diary of the project.');
  D.sayOver('点开最上面这条，看看它到底改了什么。', "Let's open the top one and see exactly what it changed.");
  D.focus(q(pList, 'c-0'), { zoom: 1.6 });
  D.moveClick(q(pList, 'sha-0'));
  D.sync();
  D.unfocus({ dur: 0.4 });
  br.goto(pDetail, repoUrl(`/commit/${COMMIT_4.hash}`));

  D.sayOver('上面写着改了几个文件、加了几行、删了几行。', 'At the top: how many files changed, and how many lines were added or removed.');
  D.focus(q(pDetail, 'stat'), { zoom: 2.2 });
  D.sync();
  D.sayOver('下面就是 **diff**（差异）：绿色带 **+** 的是新增的行，红色带 **-** 的是删掉的行。', 'Below is the **diff**: green **+** lines were added, red **-** lines were removed.');
  D.focus(q(pDetail, 'diff0'), { label: 'diff', zoom: 1.5 });
  D.sync();
  D.sayOver('最上面 `@@` 开头的一行，说明改动从第几行开始，可以先不管它。', 'The line starting with `@@` says where the change starts; you can ignore it for now.');
  D.focus(q(pDetail, 'diff0-0'), { zoom: 2 });
  D.sync();

  // ---------- 原理：逐行对比 ----------
  const b = createBoard(D, { title: 'Git 怎么知道改了什么？' });
  const oldL = ['## 里面有什么', '- `hello.py`：…', '- `notes/`：…'];
  const newL = [...oldL, '', '## 今天学会了', '- 在网页上编辑…'];
  const colOld = b.box(560, 520, 640, 470, { title: '旧版本 old', color: '#7d8590', html: oldL.map((l) => `<div class="b-file" style="display:block;text-align:left">${l}</div>`).join('') });
  const colNew = b.box(1360, 520, 640, 470, {
    title: '新版本 new', color: '#3fb950',
    html: newL.map((l, i) => `<div class="b-file" style="display:block;text-align:left;${i >= 3 ? 'border-color:#3fb950;background:#12261e;color:#7ee787' : ''}">${i >= 3 ? '+ ' : ''}${l || '&nbsp;'}</div>`).join(''),
  });
  const note = b.text(960, 850, '一样的行跳过，<b>只标出不同的行</b>', { size: 34 });
  D.cut(b.root, { fade: 0.6 });
  D.cursorShow(false);
  D.sayOver('原理：Git 把新旧两个版本**逐行对比**。', 'How it works: Git compares the old and new versions **line by line**.');
  pop(D, colOld);
  pop(D, colNew);
  D.sync();
  D.sayOver('相同的行跳过，只把不同的行标出来，这就是 diff。', 'Matching lines are skipped; only the differences are marked. That is a diff.');
  D.show(note, { y: 20 });
  D.sync();

  // ---------- History & Blame ----------
  D.cut(br.root, { fade: 0.5 });
  br.swap(pBlob, repoUrl('/blob/main/README.md'));
  D.cursorShow();
  D.sayOver('在文件页上，**History** 按钮只显示和**这个文件**有关的提交。', 'On a file page, **History** shows only the commits that touched **this file**.');
  D.focus(q(pBlob, 'history'), { label: 'History', zoom: 2.4 });
  D.sync();
  D.sayOver('旁边的 **Blame** 更厉害：', '**Blame**, next to Code, goes even further:');
  D.focus(q(pBlob, 'seg-blame'), { label: 'Blame', zoom: 2.4 });
  D.moveClick(q(pBlob, 'seg-blame'));
  br.swap(pBlame, repoUrl('/blame/main/README.md'));
  D.sync();
  D.unfocus({ dur: 0.5 });
  D.sayOver('每一行旁边都标出：是谁、在哪次提交里写的。颜色越深，改动越新。', 'Next to every line: who wrote it, and in which commit. Darker means more recent.');
  D.focus(q(pBlame, 'body'), { zoom: 1.35, cy: 480 });
  D.sync();
  D.say('程序出问题时特别有用：马上就能知道这一行该去问谁。', "Very handy when something breaks: you instantly know who to ask about a line.");

  recap(D, [
    ['Commits', '仓库的全部提交历史'],
    ['点开一条提交', '看 diff：绿色 + 新增，红色 - 删除'],
    ['History', '只看某一个文件的历史'],
    ['Blame', '每一行是谁、在哪次提交写的'],
  ], '记住：**Git 记得每一行的来历**。', 'Remember: **Git remembers where every line came from**.');
}
