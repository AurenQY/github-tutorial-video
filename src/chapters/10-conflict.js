// 第 10 章：合并冲突 —— 为什么会冲突、冲突标记怎么读、网页上怎么解决
import { createBrowser, q } from '../gh/ui.js';
import { prPage, conflictPage } from '../gh/ui2.js';
import { repoUrl, repoAfterCh6, GREETING_NEW } from '../gh/data.js';
import { createBoard, draw, pop } from '../core/board.js';
import { recap } from './common.js';

const BR = 'english-greeting';
const EN_LINE = 'print("Hi, " + name + "! Welcome to GitHub")';
const MERGED_LINE = 'print("你好呀，" + name + "！Welcome to GitHub 🎉")';

export default async function chapter(D) {
  // ---------- why conflicts happen ----------
  const b = createBoard(D, { title: '什么时候会冲突？' });
  const base = b.box(960, 290, 860, 150, { title: '原来的第 3 行', color: '#7d8590', html: '<span class="b-file">print("你好，" + name + "！欢迎来到 GitHub")</span>' });
  const a = b.box(500, 610, 760, 200, { title: '👦 小明的 main', color: '#2f81f7', html: '<span class="b-file" style="font-size:20px">print("你好呀，" + name + "！超级欢迎…🎉")</span>' });
  const c = b.box(1420, 610, 760, 200, { title: '👧 同学的分支', color: '#3fb950', html: '<span class="b-file" style="font-size:20px">print("Hi, " + name + "! Welcome…")</span>' });
  const la = b.arrow(800, 370, 600, 500, { color: '#2f81f7' });
  const lc = b.arrow(1120, 370, 1320, 500, { color: '#3fb950' });
  const q1 = b.text(960, 850, '🤔 Git：同一行，<b>该听谁的？</b>', { size: 40 });

  const s = repoAfterCh6({ branches: 2 });
  const pr = { num: 2, title: '问候语加上英文', head: BR, sha: '5a7c0f3', commit: '问候语改成英文', body: '让不懂中文的朋友也能看懂。', files: [] };
  const lines = [
    { c: '# 一个打招呼的小程序' },
    { c: 'name = input("你叫什么名字？")' },
    { c: `<<<<<<< ${BR}`, k: 'mk' },
    { c: EN_LINE, k: 'mine' },
    { c: '=======', k: 'mk' },
    { c: GREETING_NEW, k: 'theirs' },
    { c: '>>>>>>> main', k: 'mk' },
    { c: 'print("今天也要加油！")' },
  ];
  const br = createBrowser(D, { url: repoUrl('/pull/2') });
  const prC = br.add(prPage(s, pr, { state: 'conflict' }));
  const editor = br.add(conflictPage(s, pr, lines));
  const fixed = br.add(conflictPage(s, pr, [lines[0], lines[1], { c: MERGED_LINE }, lines[7]]));
  q(fixed, 'count').textContent = 'Resolved';
  q(fixed, 'commitmerge').style.opacity = '1';
  const prOk = br.add(prPage(s, pr));

  D.titleCard('第 10 章 · Chapter 10', '合并冲突：两个人改了同一行', { en: 'Merge Conflicts' });
  D.cut(b.root);
  D.sayOver('Git 很聪明：两个人改**不同的地方**，它能自动合并。', 'Git is smart: when two people change **different places**, it merges automatically.');
  pop(D, base);
  D.sync();
  D.sayOver('但如果两个人把**同一行**改成了不同的样子……', 'But if two people change **the same line** in different ways…');
  draw(D, la, { dur: 0.4 }); pop(D, a);
  draw(D, lc, { dur: 0.4 }); pop(D, c);
  D.sync();
  D.sayOver('……Git 不知道该听谁的，只能停下来让人决定。这就是**合并冲突**。', "…Git can't know who is right, so it stops and asks a human. That's a **merge conflict**.");
  D.show(q1, { y: 20 });
  D.sync();
  D.say('冲突不是错误，只是需要你做个选择，别慌。', "A conflict isn't an error. It just needs you to choose. Don't panic.");

  // ---------- PR with conflict ----------
  D.cut(br.root, { fade: 0.6 });
  D.cursorShow();
  D.sayOver('这时 PR 页面会提示有冲突，合并按钮也变灰了。点 **Resolve conflicts**。', 'The PR now reports a conflict and the merge button is greyed out. Click **Resolve conflicts**.');
  D.scroll(prC, 60, { dur: 0.5 });
  D.focus(q(prC, 'mergebox'), { zoom: 1.5, cy: 440 });
  D.moveClick(q(prC, 'resolve'));
  D.sync();
  D.unfocus({ dur: 0.4 });
  br.goto(editor, repoUrl(`/pull/2/conflicts`));

  D.sayOver('冲突的地方被这样标了出来，我们来读一读。', "Here's how the conflict is marked. Let's read it.");
  D.focus(q(editor, 'editor'), { zoom: 1.4, cy: 500 });
  D.sync();
  D.sayOver('`<<<<<<<` 到 `=======` 之间，是**你这个分支**的版本。', 'Between `<<<<<<<` and `=======` is **your branch**\'s version.');
  D.focus(D.unionRect(q(editor, 'cl-2'), q(editor, 'cl-3')), { zoom: 1.9 });
  D.sync();
  D.sayOver('`=======` 到 `>>>>>>>` 之间，是 **main** 上的版本。', 'Between `=======` and `>>>>>>>` is the version on **main**.');
  D.focus(D.unionRect(q(editor, 'cl-4'), q(editor, 'cl-6')), { zoom: 1.9 });
  D.sync();
  D.sayOver('解决方法：删掉这三行标记，留下想要的内容。可以选一边，也可以两边结合。', 'To resolve: delete the three marker lines and keep what you want, either side or a mix.');
  D.focus(q(editor, 'editor'), { zoom: 1.4, cy: 500 });
  D.wait(1);
  br.swap(fixed);
  D.sync();
  D.say('这里我们结合两边：保留中文的热情，也加上英文。', "Here we combine both: keep the warm Chinese greeting and add English.");
  D.sayOver('改好后点 **Mark as resolved**（标记为已解决），再点 **Commit merge**。', 'Then click **Mark as resolved**, and **Commit merge**.');
  D.focus(D.unionRect(q(fixed, 'markresolved'), q(fixed, 'commitmerge')), { zoom: 2.2 });
  D.moveClick(q(fixed, 'markresolved'));
  D.moveClick(q(fixed, 'commitmerge'));
  D.sync();
  D.unfocus({ dur: 0.4 });
  br.goto(prOk, repoUrl('/pull/2'));
  D.sayOver('冲突解决了，又可以正常合并了。', 'Conflict resolved. The PR can be merged normally again.');
  D.scroll(prOk, 60, { dur: 0.5 });
  D.focus(q(prOk, 'mergebox'), { zoom: 1.5, cy: 440 });
  D.sync();
  D.unfocus();
  D.say('电脑上 `git pull` 遇到冲突也一样：删掉标记、留下正确内容，再 add 和 commit。', 'Conflicts during `git pull` work the same: edit the file, remove the markers, then add and commit.');

  recap(D, [
    ['冲突', '同一行被改成了不同内容'],
    ['<<<<<<< … =======', '你分支的版本'],
    ['======= … >>>>>>>', '对方（main）的版本'],
    ['Resolve conflicts', '在网页上编辑解决'],
    ['Mark as resolved', '标记已解决，再 Commit merge'],
  ], '记住：**冲突不可怕，删掉标记、留下对的内容就好**。', 'Remember: **conflicts are fine: remove the markers, keep the right content**.', { size: 34 });
}
