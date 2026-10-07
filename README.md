<p align="center"><img src="out/cover.png" alt="GitHub 新手教程封面" width="720"></p>

# GitHub 新手教程 · GitHub for Beginners

一个 **27 分钟、中英双语字幕** 的 GitHub 零基础教学视频，面向高中毕业生。
对着 GitHub 界面，一个按钮一个按钮地讲：它在哪、点了会发生什么、背后的原理是什么。

**整个视频完全由代码生成**：每一帧都是 HTML + GSAP 动画，用 Puppeteer 逐帧截图，再用 FFmpeg 合成，背景音乐和音效也是代码合成的。

> 📺 **成片下载**：见 [Releases](https://github.com/AurenQY/github-tutorial-video/releases/latest)，里面有 MP4、SRT 字幕和封面。

## 章节

| 时间 | 内容 |
|---|---|
| 00:00 | 开场：Git 和 GitHub 有什么区别 |
| 00:42 | 仓库首页总览 |
| 02:56 | New：新建一个仓库 |
| 05:01 | 文件页上的按钮（Raw / 复制 / 下载 / 编辑 / Commit） |
| 07:54 | 查看历史：Commits、History、Blame |
| 09:43 | Code 按钮：`git clone` |
| 11:48 | 本地修改 → add → commit → push / pull |
| 14:52 | `.gitignore` |
| 16:41 | 分支 |
| 18:44 | Pull Request |
| 21:12 | 合并冲突 |
| 23:02 | Star / Watch / Fork / Issues |
| 26:01 | Settings 与速查表 |

## 工作原理

```
src/chapters/*.js   每章的"剧本"：页面、镜头、光标、字幕（中英）
      │  Director 把剧本编排成一条可随意跳转的 GSAP 时间线
      ▼
src/index.html      1920×1080 舞台（GitHub 界面用官方 Primer CSS + Octicons 还原）
      │  scripts/render.mjs：Puppeteer 逐帧 seek(t) → 截图 → 管道交给 FFmpeg
      ▼
out/parts/chNN.mp4  每章一个视频
      │  scripts/build.mjs：拼接 + 代码合成的背景音乐/音效 + 导出 SRT
      ▼
out/github-tutorial.mp4 / .srt
```

| 目录 | 说明 |
|---|---|
| `src/core/` | `director.js`（时间线、镜头、高亮框、光标、字幕）、`terminal.js`（PowerShell 终端）、`board.js`（原理动画白板） |
| `src/gh/` | GitHub 页面组件（仓库首页、文件页、提交历史、diff、PR、Issues、Settings…）和示例数据 |
| `src/chapters/` | 13 个章节剧本 |
| `scripts/` | 预览服务器、检查、截帧、渲染、合成、封面 |

## 自己渲染

需要 **Node.js 18+**、**FFmpeg**（在 PATH 里）和 **Google Chrome**（或用环境变量 `CHROME_PATH` 指定 Chromium 内核浏览器）。

```bash
npm install
npm run check      # 构建每一章，报告时长和换行的字幕
npm run render     # 逐帧渲染所有章节（4 个并行，约 15 分钟）
npm run build      # 拼接、混音、导出字幕 → out/github-tutorial.mp4
```

- **预览/调试**：`npm run preview`，然后打开 `http://127.0.0.1:5178/src/index.html?chapter=3&dev=1`（带拖动进度条，空格播放/暂停）。
- **只渲染某几章**：`node scripts/render.mjs 3 5`
- **截几帧检查**：`node scripts/snap.mjs 3 10 20 30`
- **改台词**：编辑 `src/chapters/` 里的 `D.say('中文', 'English')`。
- **封面**：先从成片截一帧 `ffmpeg -ss 50 -i out/github-tutorial.mp4 -frames:v 1 out/cover-src.png`，再 `npm run cover`。

## 说明

- 视频中的账号（`xiaoming-dev`、`lin-teacher`）和仓库均为虚构示例。
- 界面按 2026 年的 GitHub 样式还原，用于教学目的；本项目与 GitHub, Inc. 无关联，GitHub 名称和标志归其所有者所有。
- 依赖的 [Primer CSS](https://github.com/primer/css)、[Octicons](https://github.com/primer/octicons)（MIT）和 [GSAP](https://gsap.com/)（GreenSock 标准许可）遵循各自的许可证。

## 许可证

[MIT](LICENSE)
