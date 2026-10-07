// 第 2 章：New 按钮 / 新建仓库 + 原理：仓库 = 文件夹 + 隐藏的 .git
import { createBrowser, overview, q } from '../gh/ui.js';
import { dashboard, plusMenu, newRepoPage, menuAt } from '../gh/ui2.js';
import { baseRepo, OWNER, REPO } from '../gh/data.js';
import { createBoard, draw, pop } from '../core/board.js';
import { recap } from './common.js';

export default async function chapter(D) {
  const desc = '我的第一个 GitHub 仓库';
  const s0 = baseRepo({ repos: [] });
  const br = createBrowser(D, { url: 'github.com' });
  const dash = br.add(dashboard(s0));
  const pmenu = menuAt(D, br, q(dash, 'plus'), plusMenu(), { align: 'right' });
  const form = br.add(newRepoPage(s0));
  const created = br.add(overview(baseRepo({
    commits: 1, desc, latest: { user: OWNER, msg: 'Initial commit', hash: 'a1b9e07', time: 'now' },
    files: [{ name: 'README.md', type: 'file', msg: 'Initial commit', time: 'now' }],
    readmeHtml: `<h1>${REPO}</h1><p>${desc}</p>`, langs: [],
  })));

  D.titleCard('第 2 章 · Chapter 2', 'New：新建一个仓库', { en: 'Creating a New Repository' });
  D.cut(br.root);
  D.cursorShow();

  D.say('刚才那个仓库是怎么来的？我们从头新建一个。', 'Where did that repository come from? Let\'s create one from scratch.');
  D.sayOver('在任何页面，点右上角的 **+**，选 **New repository**。', 'On any page, click **+** at the top right and choose **New repository**.');
  D.focus(q(dash, 'plus'), { label: '+', zoom: 2.4 });
  D.moveClick(q(dash, 'plus'));
  D.unfocus({ dur: 0.4 });
  D.show(pmenu, { dur: 0.2 });
  D.focus(q(pmenu, 'm-newrepo'), { label: 'New repository', zoom: 2 });
  D.sync();
  D.hide(pmenu, { dur: 0.15 });
  D.sayOver('首页左边的绿色 **New** 按钮，作用完全一样。', 'The green **New** button on the left of your home page does the same thing.');
  D.focus(q(dash, 'newbtn'), { label: 'New', zoom: 2.4 });
  D.moveClick(q(dash, 'newbtn'));
  D.sync();
  D.unfocus({ dur: 0.4 });
  br.goto(form, 'github.com/new');

  // Name
  D.sayOver('先起名字：只用英文字母、数字和短横线，不要用空格和中文。', 'First, a name: letters, numbers and dashes only, no spaces or Chinese.');
  D.focus(q(form, 'namerow'), { label: 'Repository name 仓库名', zoom: 1.8 });
  D.moveClick(q(form, 'name'));
  D.setClass(q(form, 'name'), 'focus');
  D.type(q(form, 'nametext'), REPO, { cps: 9 });
  D.show(q(form, 'available'), { dur: 0.2 });
  D.sync();
  D.sayOver('绿色提示说明这个名字可以用。**Description** 是一句话简介，可以不填。', 'Green means the name is free. **Description** is a one-line summary; optional.');
  D.focus(q(form, 'descfield'), { label: 'Description', zoom: 1.8 });
  D.setClass(q(form, 'name'), 'focus', false);
  D.moveClick(q(form, 'desc'));
  D.type(q(form, 'desctext'), desc, { cps: 7 });
  D.sync();

  // Visibility
  D.sayOver('**Public** 所有人可见，适合放作品；**Private** 只有自己能看，适合私人作业。', '**Public**: everyone can see it, good for showing work. **Private**: only you, good for personal work.');
  D.focus(q(form, 'visibility'), { label: 'Public / Private', zoom: 1.7 });
  D.sync();
  D.say('两种都免费，以后也能在设置里随时改。', 'Both are free, and you can switch later in Settings.');

  // Initialize
  D.sayOver('勾选 **Add a README file**：仓库一建好就有说明书，可以直接使用。', 'Check **Add a README file** so the repo starts with a manual and is ready to use.');
  D.focus(q(form, 'readme-opt'), { label: 'Add a README file', zoom: 1.9 });
  D.moveClick(q(form, 'readme-check'));
  D.setClass(q(form, 'readme-check'), 'on');
  D.sync();
  D.sayOver('**.gitignore** 模板：告诉 Git 哪些文件不要上传，第 7 章细讲。', '**.gitignore** template: tells Git which files not to upload (Chapter 7).');
  D.focus(q(form, 'gitignore'), { label: '.gitignore', zoom: 1.9 });
  D.sync();
  D.sayOver('**License** 许可证：说明别人能不能使用你的代码。练习用的仓库可以先不选。', '**License**: says whether others may use your code. Skip it for practice repos.');
  D.focus(q(form, 'license'), { label: 'License', zoom: 1.9 });
  D.sync();
  D.sayOver('最后点 **Create repository**。', 'Finally, click **Create repository**.');
  D.scroll(form, 120, { dur: 0.6 });
  D.focus(q(form, 'create'), { label: 'Create repository', zoom: 2.2 });
  D.moveClick(q(form, 'create'));
  D.sync();
  D.unfocus({ dur: 0.4 });
  br.goto(created, `github.com/${OWNER}/${REPO}`);
  D.sayOver('建好了！里面已经有一个 README.md，还有第一次提交 **Initial commit**。', "Done! It already has README.md and its first commit, **Initial commit**.");
  D.focus(q(created, 'files'), { zoom: 1.3 });
  D.sync();

  // ---------- 原理 ----------
  const b = createBoard(D, { title: '仓库到底是什么？' });
  const folder = b.box(960, 530, 980, 440, {
    title: '📁 my-first-repo', color: '#2f81f7',
    html: '<div style="text-align:left;padding-left:30px"><span class="b-file">📄 README.md</span><br><span class="b-file">📄 hello.py</span><br><span class="b-file">📁 notes</span></div>',
  });
  const dotgit = b.box(1210, 570, 400, 260, {
    title: '📁 .git（隐藏）', color: '#f0883e',
    html: '所有存档和历史<br>都存在这里<div style="margin-top:10px;font-size:22px;color:#9198a1">every save lives here</div>',
  });
  const cloud = b.text(960, 900, '☁️ GitHub 上的仓库 = 这个文件夹放在了云端', { size: 34 });

  D.cut(b.root, { fade: 0.6 });
  D.cursorShow(false);
  D.sayOver('仓库到底是什么？其实就是一个普通的项目文件夹……', 'What is a repository? Really, just an ordinary project folder…');
  pop(D, folder);
  D.sync();
  D.sayOver('……里面多了一个隐藏的 **.git** 文件夹，所有存档和历史都存在那里。', '…plus a hidden **.git** folder where all the saves and history are stored.');
  pop(D, dotgit);
  D.sync();
  D.sayOver('GitHub 上的仓库，就是把这个文件夹放到了云端。', 'A repository on GitHub is simply this folder, kept in the cloud.');
  D.show(cloud, { y: 20 });
  D.sync();

  recap(D, [
    ['+ → New repository', '新建仓库（首页的 New 按钮也行）'],
    ['Repository name', '英文、数字、短横线'],
    ['Public / Private', '公开 / 私有，以后可改'],
    ['Add a README file', '建议勾选，仓库马上能用'],
    ['Create repository', '完成创建'],
  ], '记住：**仓库就是一个带着 .git 历史的文件夹**。', 'Remember: **a repository is a folder with a .git history inside**.');
}
