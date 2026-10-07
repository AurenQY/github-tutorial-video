// 第 1 章：仓库首页总览（各区域地图）+ 原理：README 为什么会自动显示
import { createBrowser, overview, q } from '../gh/ui.js';
import { menuAt } from '../gh/ui2.js';
import { oc } from '../core/icons.js';
import { baseRepo, repoUrl } from '../gh/data.js';
import { recap } from './common.js';

export default async function chapter(D) {
  const s = baseRepo();
  const br = createBrowser(D, { url: repoUrl() });
  const home = br.add(overview(s));
  const urlEl = br.root.querySelector('.br-url');
  const addMenu = menuAt(D, br, q(home, 'addfile'), `<div class="gh-menu gh" style="width:200px">
      <div class="mi">${oc('plus', 16)}Create new file</div><div class="mi">${oc('upload', 16)}Upload files</div></div>`, { align: 'right' });

  D.titleCard('第 1 章 · Chapter 1', '仓库首页总览', { en: 'Tour of the Repository Page' });
  D.cut(br.root);
  D.cursorShow();

  D.say('这是一个 GitHub **仓库**的首页。我们从上到下认识每个区域。', "This is a GitHub **repository** page. Let's go through it top to bottom.");
  D.sayOver('**仓库**（repository）就是一个项目文件夹，外加它的全部修改历史。', 'A **repository** is a project folder plus its complete history of changes.');
  D.focus(q(home, 'files'), { label: '项目里的文件', zoom: 1.25 });
  D.sync();

  D.sayOver('左上角是**用户名 / 仓库名**。', 'Top left: **username / repository name**.');
  D.focus(D.unionRect(q(home, 'crumb-owner'), q(home, 'crumb-repo')), { label: '用户名 / 仓库名', zoom: 2.2 });
  D.sync();
  D.sayOver('它也是仓库的网址：github.com/用户名/仓库名。', "It's also the address: github.com/username/repo-name.");
  D.focus(urlEl, { label: '网址', zoom: 1.6 });
  D.sync();

  D.sayOver('这一排是**标签栏**：代码、问题、合并请求、自动化、设置……后面逐个讲。', 'This row of **tabs**: Code, Issues, Pull requests, Actions, Settings… covered one by one later.');
  D.focus(D.unionRect(q(home, 'tab-code'), q(home, 'tab-settings')), { zoom: 1.6 });
  D.sync();

  D.sayOver('**Public** 表示公开，任何人都能看；**Private** 只有你和你邀请的人能看。', '**Public**: anyone can see it. **Private**: only you and people you invite.');
  D.focus(q(home, 'visibility'), { label: 'Public / Private', zoom: 2.4 });
  D.sync();

  D.sayOver('这里是当前所在的**分支** main，后面是分支和标签的数量。', 'This is the current **branch**, main, followed by the number of branches and tags.');
  D.focus(D.unionRect(q(home, 'branch'), q(home, 'tags')), { label: '分支', zoom: 2 });
  D.sync();

  D.sayOver('**Go to file** 按名字快速找文件。', '**Go to file** finds a file by name.');
  D.focus(q(home, 'gotofile'), { label: 'Go to file', zoom: 2.2 });
  D.sync();
  D.sayOver('**Add file** 可以新建文件，或者从电脑上传文件。', '**Add file** creates a new file, or uploads files from your computer.');
  D.focus(D.unionRect(q(home, 'addfile'), q(home, 'codebtn')), { label: 'Add file', zoom: 2, cy: 400 });
  D.moveClick(q(home, 'addfile'));
  D.show(addMenu, { dur: 0.2 });
  D.focus(addMenu, { label: 'Add file', zoom: 2, camera: false, pad: 2 });
  D.sync();
  D.hide(addMenu, { dur: 0.2 });
  D.sayOver('绿色的 **Code** 按钮用来把仓库下载到电脑，第 5 章细讲。', 'The green **Code** button gets the repo onto your computer (Chapter 5).');
  D.focus(q(home, 'codebtn'), { label: 'Code', zoom: 2.4 });
  D.sync();

  D.sayOver('文件列表上方：最近一次提交是谁做的、什么时候，以及一共有几次提交。', 'Above the files: who made the latest commit, when, and the total number of commits.');
  D.focus(q(home, 'commitbar'), { label: '最近一次提交', zoom: 1.4 });
  D.sync();
  D.sayOver('每一行是一个文件或文件夹，后面是最后修改它的提交说明和时间。', 'Each row is a file or folder, with its last commit message and time.');
  D.focus(q(home, 'file-hello.py'), { zoom: 1.4 });
  D.sync();

  D.sayOver('右边 **About** 是简介，还有星标、关注、复刻的数量，第 11 章会讲。', '**About** on the right: a description, plus stars, watchers and forks (Chapter 11).');
  D.focus(q(home, 'about').querySelector('section'), { label: 'About', zoom: 1.5 });
  D.sync();

  D.unfocus();
  D.sayOver('往下滚动，会看到 **README.md** 的内容，它是项目的"说明书"。', 'Scroll down to see **README.md**, the "manual" of the project.');
  D.scroll(home, 330);
  D.focus(q(home, 'readme'), { label: 'README', zoom: 1.3, cy: 430 });
  D.sync();
  D.say('原理：GitHub 会自动寻找名叫 **README** 的文件，排好版放在首页。所以每个项目都应该写一个。', 'How it works: GitHub looks for a file named **README** and shows it here, so every project should have one.');
  D.sayOver('**Languages** 显示项目用了哪些编程语言，是 GitHub 按文件自动统计的。', '**Languages** shows which programming languages are used, counted automatically from the files.');
  D.focus(q(home, 'languages'), { label: 'Languages', zoom: 1.8, cy: 430 });
  D.sync();

  recap(D, [
    ['用户名 / 仓库名', '仓库的名字，也是它的网址'],
    ['标签栏', 'Code、Issues、Pull requests、Settings…'],
    ['main', '当前所在的分支'],
    ['Add file / Code', '新建或上传文件 / 下载仓库'],
    ['README', '项目说明书，自动显示在首页'],
  ], '记住：**仓库 = 项目文件 + 完整历史**。', 'Remember: **repository = project files + full history**.');
}
