// 开场（≤45 秒）：Git 与 GitHub 的区别 + 准备工作
import { createBoard, draw, pop } from '../core/board.js';
import { oc } from '../core/icons.js';

export default async function chapter(D) {
  D.titleCard('GitHub 新手教程 · GitHub for Beginners', '从按钮到原理，一次学会', { en: 'Every button, explained', hold: 3 });

  const b = createBoard(D, { title: '' });
  const git = b.box(560, 430, 620, 330, {
    title: 'Git', color: '#f05133',
    html: '装在<b style="color:#fff">你电脑上</b>的存档工具<br>记录文件的每一次修改<div style="margin-top:18px;font-size:22px;color:#9198a1">Version control on your computer</div>',
  });
  const gh = b.box(1360, 430, 620, 330, {
    title: `${oc('mark-github', 32)}&nbsp; GitHub`, color: '#2f81f7',
    html: '放在<b style="color:#fff">网上</b>的仓库<br>备份 + 展示 + 团队协作<div style="margin-top:18px;font-size:22px;color:#9198a1">A website to host and collaborate</div>',
  });
  const link = b.arrow(880, 400, 1040, 400, { color: '#7d8590' });
  const link2 = b.arrow(1040, 460, 880, 460, { color: '#7d8590' });
  const up = b.text(960, 360, '上传', { size: 24, color: '#9198a1' });
  const down = b.text(960, 500, '下载', { size: 24, color: '#9198a1' });
  const prep = b.text(960, 740, `开始前：① 安装 Git（<code>git-scm.com</code>）&nbsp;&nbsp; ② 登录 GitHub 账号`, { size: 34 });

  D.cut(b.root, { fade: 0.6 });
  D.sayOver('欢迎！这个视频带你从零学会用 GitHub。', 'Welcome! This video teaches you GitHub from scratch.');
  D.wait(0.5);
  D.sync();
  D.sayOver('先分清两个词：**Git** 是装在电脑上的存档工具，记录文件的每一次修改。', 'Two words first: **Git** is a save tool on your computer that records every change.');
  pop(D, git);
  D.sync();
  D.sayOver('**GitHub** 是一个网站：把存档放到云端，还能和别人一起协作。', '**GitHub** is a website that keeps your saves in the cloud and lets you work with others.');
  pop(D, gh);
  draw(D, link, { dur: 0.4 }); D.show(up, { dur: 0.2 });
  draw(D, link2, { dur: 0.4 }); D.show(down, { dur: 0.2 });
  D.sync();
  D.sayOver('开始前只需要两件事：电脑上装好 **Git**，并登录你的 GitHub 账号。', 'Before we start: install **Git**, and sign in to your GitHub account.');
  D.show(prep, { y: 20 });
  D.sync();
  D.say('接下来按界面上的按钮逐个讲，顺便讲清背后的原理。开始吧！', "We'll go button by button and explain how things work. Let's go!");
}
