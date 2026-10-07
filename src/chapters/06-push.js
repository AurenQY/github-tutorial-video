// 第 6 章：本地修改 → status / add / commit / push / pull + 原理：四个区域
import { createBrowser, overview, q } from '../gh/ui.js';
import { createTerminal } from '../core/terminal.js';
import { repoUrl, HELLO_LINES, HELLO_LINES_2, COMMIT_4, COMMIT_5, repoAfterCh6 } from '../gh/data.js';
import { createBoard, draw, pop } from '../core/board.js';
import { recap, notepad, gcmDialog } from './common.js';
import { el } from '../core/director.js';

const REPO_DIR = 'C:\\Users\\xiaoming\\Desktop\\my-first-repo';

export default async function chapter(D) {
  const term = createTerminal(D, { banner: false });
  term.cd(REPO_DIR);
  term.idle();
  const np = notepad(D, { file: 'hello.py', lines: HELLO_LINES, extraLines: 1 });
  const newLine = np.lines[HELLO_LINES.length];
  newLine.textContent = '';
  const gcm = gcmDialog(D, term.root);
  const br = createBrowser(D, { url: repoUrl() });
  const home = br.add(overview(repoAfterCh6()));

  D.titleCard('第 6 章 · Chapter 6', '在电脑上修改，再推送到 GitHub', { en: 'Edit Locally, Then Push' });
  D.cut(term.root);

  // ---------- one-time setup ----------
  D.say('在电脑上 commit 之前，先告诉 Git 你是谁。每台电脑只需要设置一次。', 'Before committing on your computer, tell Git who you are. Once per computer.');
  term.cmd('git config --global user.name "xiaoming"', { cps: 20 });
  term.ready();
  term.cmd('git config --global user.email "xiaoming@example.com"', { cps: 20 });
  D.sync();
  D.say('邮箱最好填注册 GitHub 用的那个，这样提交记录会显示你的头像。', 'Use the email of your GitHub account so commits show your avatar.');

  // ---------- edit in Notepad ----------
  D.cut(np.root, { fade: 0.5 });
  D.sayOver('现在随便改点东西：用记事本打开 hello.py，加一行，然后按 **Ctrl+S** 保存。', 'Now change something: open hello.py in Notepad, add a line, press **Ctrl+S** to save.');
  D.wait(0.8);
  D.show(newLine, { dur: 0.1 });
  D.type(newLine, HELLO_LINES_2[HELLO_LINES_2.length - 1], { cps: 9 });
  D.sync();

  // ---------- status / add / commit ----------
  D.cut(term.root, { fade: 0.5 });
  term.ready();
  D.sayOver('回到 PowerShell。`git status` 查看现在的状态。', 'Back in PowerShell. `git status` shows the current state.');
  term.cmd('git status');
  term.out([
    'On branch main',
    "Your branch is up to date with 'origin/main'.",
    '',
    'Changes not staged for commit:',
    '  (use "git add <file>..." to update what will be committed)',
    '  (use "git restore <file>..." to discard changes in working directory)',
    '        [red]modified:   hello.py[/]',
    '',
    'no changes added to commit (use "git add" and/or "git commit -a")',
  ], { stagger: 0.05 });
  D.sync();
  D.say('hello.py 被修改了。**红色**表示：这个修改还没准备好提交。', 'hello.py was modified. **Red** means the change is not yet ready to commit.');
  term.ready();
  D.sayOver('`git add hello.py` 把这个修改放进"暂存区"。再看一次状态：', '`git add hello.py` puts the change in the "staging area". Check the status again:');
  term.cmd('git add hello.py');
  term.ready();
  term.cmd('git status');
  term.out([
    'On branch main',
    "Your branch is up to date with 'origin/main'.",
    '',
    'Changes to be committed:',
    '  (use "git restore --staged <file>..." to unstage)',
    '        [green]modified:   hello.py[/]',
    '',
  ], { stagger: 0.05 });
  D.sync();
  D.say('变成**绿色**了：这个修改已经准备好，等待提交。', "Now it's **green**: the change is staged and ready to commit.");
  term.ready();
  D.sayOver('`git commit -m "说明"` 提交，就在本地存了一个档。', '`git commit -m "message"` makes a save on your computer.');
  term.cmd(`git commit -m "${COMMIT_5.msg}"`, { cps: 16 });
  term.out([`[main ${COMMIT_5.hash}] ${COMMIT_5.msg}`, ' 1 file changed, 1 insertion(+)']);
  D.sync();
  term.ready();
  term.cmd('git status');
  term.out(['On branch main', "Your branch is ahead of 'origin/main' by 1 commit.", '  (use "git push" to publish your local commits)', '', 'nothing to commit, working tree clean']);
  D.sync();
  D.say('注意 "ahead by 1 commit"：这个存档只在你的电脑上，GitHub 还没有。', 'Note "ahead by 1 commit": this save exists only on your computer, not on GitHub yet.');

  // ---------- push (with first-time sign-in) ----------
  term.ready();
  D.sayOver('`git push` 把本地的新存档上传到 GitHub。', '`git push` uploads your new saves to GitHub.');
  term.cmd('git push');
  D.sync();
  D.show(gcm, { dur: 0.3, scale: 0.95 });
  D.cursorShow();
  D.sayOver('第一次 push 会弹出登录窗口：点 **Sign in with your browser**，在浏览器里授权就行。', 'The first push asks you to sign in: click **Sign in with your browser** and approve.');
  D.focus(q(gcm, 'gcm-browser'), { zoom: 1.6 });
  D.moveClick(q(gcm, 'gcm-browser'));
  D.sync();
  D.unfocus({ dur: 0.4 });
  D.hide(gcm, { dur: 0.3 });
  D.cursorShow(false);
  D.say('只要登录这一次，以后 Git 会记住你。', 'You only sign in once; Git remembers you afterwards.');
  term.out([
    'Enumerating objects: 5, done.',
    'Counting objects: 100% (5/5), done.',
    'Delta compression using up to 8 threads',
    'Compressing objects: 100% (3/3), done.',
    'Writing objects: 100% (3/3), 412 bytes | 412.00 KiB/s, done.',
    'Total 3 (delta 1), reused 0 (delta 0), pack-reused 0 (from 0)',
    'remote: Resolving deltas: 100% (1/1), completed with 1 local object.',
    'To https://github.com/xiaoming-dev/my-first-repo.git',
    `   ${COMMIT_4.hash}..${COMMIT_5.hash}  main -> main`,
  ], { stagger: 0.12 });
  D.sync(0.8);

  // ---------- refresh GitHub ----------
  D.cut(br.root, { fade: 0.5 });
  D.sayOver('回到网页刷新：新的提交已经出现了！现在一共 5 次。', 'Refresh the web page: the new commit is there! 5 commits now.');
  D.focus(q(home, 'commitbar'), { label: '刚刚 push 的提交', zoom: 1.4 });
  D.sync();
  D.unfocus();

  // ---------- pull ----------
  D.cut(term.root, { fade: 0.5 });
  term.ready();
  D.sayOver('反过来：如果网页上有了新改动，用 `git pull` 把它们拉到电脑上。', 'The other way round: if GitHub has new changes, `git pull` brings them to your computer.');
  term.cmd('git pull');
  term.out(['Already up to date.']);
  D.sync();
  D.say('现在两边一样，所以显示 "Already up to date"（已经是最新）。', 'Both sides match right now, so it says "Already up to date".');
  term.ready();

  // ---------- 原理：四个区域 ----------
  const b = createBoard(D, { title: '一个修改要经过哪几站？' });
  const xs = [270, 730, 1190, 1650];
  const names = [['工作区', 'Working directory', '你正在编辑的文件'], ['暂存区', 'Staging area', '挑出这次要存的修改'], ['本地仓库', 'Local repository', '电脑上的存档'], ['远程仓库', 'GitHub', '云端的存档']];
  const colors = ['#f0883e', '#d29922', '#3fb950', '#2f81f7'];
  const boxes = names.map(([zh, en, d], i) => b.box(xs[i], 450, 360, 230, { title: zh, color: colors[i], html: `${d}<div style="font-size:20px;color:#9198a1;margin-top:8px">${en}</div>` }));
  const cmds = ['git add', 'git commit', 'git push'];
  const arrows = [0, 1, 2].map((i) => b.arrow(xs[i] + 185, 450, xs[i + 1] - 185, 450, { color: colors[i + 1] }));
  const labels = cmds.map((c, i) => b.text((xs[i] + xs[i + 1]) / 2, 395, `<code>${c}</code>`, { size: 26 }));
  const pull = b.arrow(1650, 600, 270, 600, { color: '#a371f7', curve: -160 });
  const pullL = b.text(960, 800, '<code>git pull</code>&nbsp; 把 GitHub 上的新存档取回来', { size: 30 });
  const file = el('<div class="bw" style="font-size:54px;left:0;top:0">📄</div>');
  b.root.appendChild(file);
  gsap.set(file, { x: xs[0] - 27, y: 270, autoAlpha: 0 });

  D.cut(b.root, { fade: 0.6 });
  D.say('把刚才的流程画出来，一共四站。', "Let's draw what just happened. There are four stops.");
  D.sayOver('**工作区**：你正在编辑的文件，也就是文件夹里看到的样子。', '**Working directory**: the files you are editing, as you see them in the folder.');
  pop(D, boxes[0]);
  D.show(file, { dur: 0.3 });
  D.sync();
  const step = (i, zh, en) => {
    D.sayOver(zh, en);
    draw(D, arrows[i], { dur: 0.5 });
    D.show(labels[i], { dur: 0.2 });
    pop(D, boxes[i + 1]);
    D.tween(file, { x: xs[i + 1] - 27, duration: 0.8, ease: 'power2.inOut' });
    D.sync();
  };
  step(0, '**暂存区**：`git add` 挑出这次要存的修改，就像寄快递前先把东西放进箱子。', '**Staging area**: `git add` picks the changes to save, like packing items into a box.');
  step(1, '**本地仓库**：`git commit` 把箱子封好，存成一个存档。', '**Local repository**: `git commit` seals the box and stores it as a save.');
  step(2, '**远程仓库**：`git push` 把存档寄到 GitHub。', '**Remote repository**: `git push` ships the saves to GitHub.');
  D.sayOver('`git pull` 方向相反：把 GitHub 上的新存档取回来。', '`git pull` goes the other way: it fetches new saves from GitHub.');
  draw(D, pull, { dur: 0.8 });
  D.show(pullL, { y: 20 });
  D.sync();
  D.say('为什么要有暂存区？因为你可以只挑一部分修改提交，让每个存档都干净、有条理。', 'Why a staging area? You can commit only some changes, keeping each save clean and focused.');

  recap(D, [
    ['git status', '查看现状（红色未暂存，绿色已暂存）'],
    ['git add 文件', '放进暂存区'],
    ['git commit -m "说明"', '在本地存档'],
    ['git push', '上传到 GitHub'],
    ['git pull', '从 GitHub 拉取最新'],
  ], '记住口诀：**改 → add → commit → push**。', 'Remember the rhythm: **edit → add → commit → push**.', { size: 34 });
}
