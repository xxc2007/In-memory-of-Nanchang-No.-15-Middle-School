<sub>🌐 <b>中文</b> · <a href="README.en.md">English</a></sub>

<div align="center">

# 青山湖畔的纪念册

> *「所谓母校，就是那座你离开之后才开始无限怀念的校园。」*

[![Live Site](https://img.shields.io/badge/🌐_线上访问-xxc2007.me-D97757)](https://xxc2007.me)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/依赖-Vanilla_JS-orange)](#️-技术栈)
[![Self-hosted](https://img.shields.io/badge/留言墙-Artalk_自托管-blueviolet)](#留言墙artalk-自托管)

<br>

**把三年光阴放进一个可以随时回去的地址。**

<br>

这是南昌市第十五中学的纪念页：**25 张校园实景摄影**、一段**八个机位的时光漫游**、一张**中文定位图**、一面**无需登录的匿名留言墙**，以及一层铺满全站的**点阵纸纹**——光标抚过处，稿纸底纹轻轻隆起，像手指抚过一页旧纸。

纯 HTML / CSS / Vanilla JS，结构·样式·行为三分离（`index.html` + `assets/`），零框架、无构建步骤。克隆下来，起个静态服务器就能打开。

[在线访问](https://xxc2007.me) · [特色](#-特色) · [站点结构](#-站点结构) · [技术栈](#️-技术栈) · [本地运行](#-本地运行) · [设计笔记](#-设计笔记)

</div>

---

<p align="center">
  <img src="docs/screenshot-hero.png" alt="首屏：校徽、衬线大标题、点阵纸纹与关键数字" width="100%">
</p>
<p align="center"><sub>
  ▲ 首屏 · 米白纸感 + 赤陶橙 + 衬线大标题 · 背景是全站点阵纸纹（光标掠过会隆起）
</sub></p>

---

## ✨ 特色

### 📖 纪念册本体

- **七个章节**：概况 → 沿革 → 光影（25 张摄影，六个专题组）→ 水塔 → 寻踪 → 寄语 → 留言墙
- Claude 视觉语言：米白纸感底色 `#F0EEE6` + 赤陶橙 `#D97757` + 衬线标题，全站统一的发丝线与圆角卡片
- 完整响应式（三档断点）与 `prefers-reduced-motion` 降级

### ✨ 点阵纸纹（全站粒子背景）

- 26px 方格点阵铺满全站：墨色微点为底，约 8% 混入赤陶 / 橄榄「注记点」，像一页方格稿纸
- 光标 280px 范围内点阵柔和隆起，快抚幅度更大——「指尖抚过纸面」的手感
- 每颗点独立呼吸相位，永不同步明灭；`prefers-reduced-motion` 时整层安静
- Canvas 2D 单画布实现，零依赖，DPR 封顶 2，页面隐藏即停帧

### 🗺 校园寻踪（时光漫游 + 定位图）

- **全幅照片漫游**：8 个机位、8 张全幅照片，箭头 / 圆点 / 键盘方向键切换，Ken Burns 缓推镜头
- **中文定位图**：OSM 栅格底图（含中文地名），8 个机位标记与漫游联动，点击标记镜头飞至该位置
- 滚动临近才按需加载 MapLibre，首屏零地图开销；机位数据集中在 `assets/map.js` 的 `SPOTS` 数组，一眼可改

<p align="center">
  <img src="docs/screenshot-tour.png" alt="时光漫游：八个机位的全幅照片漫游，Ken Burns 镜头" width="86%">
</p>
<p align="center"><sub>
  ▲ 伍 · MAP 时光漫游 · 老水塔机位 · 底部渐影字幕与 5/8 计数
</sub></p>

<p align="center">
  <img src="docs/screenshot-map.png" alt="中文定位图：OSM 底图与八个机位标记" width="86%">
</p>
<p align="center"><sub>
  ▲ 中文定位图 · 点击标记，漫游镜头飞至该位置 · 学校定位至 OSM way 260420791
</sub></p>

### 💬 留言墙（Artalk 自托管）

- **无需登录**：不填昵称邮箱也能留言，前端自动补全匿名身份（同昵称同身份）
- **先审后显**：新留言进入待审队列，站长在后台审核通过后才对外展示
- 零第三方依赖：Artalk 服务端跑在自己的服务器上，数据是自己的

<p align="center">
  <img src="docs/screenshot-guestbook.png" alt="留言墙：B站风格匿名评论区与点阵纸纹背景" width="86%">
</p>
<p align="center"><sub>
  ▲ 柒 · WALL 留言墙 · 匿名留言 · 头像 / IP 属地 / 北京时间 · 背景点阵纸纹清晰可见
</sub></p>

### 🎬 动态交互（原生 JS，零依赖）

| 交互 | 说明 |
|------|------|
| 点阵纸纹 | 全站 canvas 粒子层：方格稿纸底纹，光标隆起 + 呼吸相位交错（研究 50 个动效站后定稿） |
| 阅读进度条 | 顶栏赤陶橙细线，`scaleX` 随滚动增长 |
| 导航高亮 | scrollspy 自动点亮当前章节 |
| 数字滚动 | 首屏关键数字 0 → 1958 / 51 / 2600+ / 25，easeOutQuart |
| 大图视差 | 首图以 0.5× 速率反向移动 + 光标惯性视差，`scale(1.09)` 防露边 |
| 惯性平滑滚动 | 桌面滚轮接管为惯性插值（Oryzo 手感），触屏 / 地图 / 灯箱不劫持 |
| 时间线生长 | 沿革竖线随滚动画下，经过的年份节点依次点亮 |
| 灯箱 | 滚轮以光标为中心缩放 1–4×、双击放大、拖拽平移、双指捏合、边界钳制 |
| 画廊渐显与微倾 | 图片加载后柔和渐显；桌面端卡片随光标 3D 微倾 |

所有动画共用一个 rAF 驱动的滚动循环，并在系统开启「减弱动态效果」时整体降级。

## 🗂 站点结构

```text
site/
├── index.html          # 页面结构（语义 HTML，无内联样式/脚本）
├── assets/
│   ├── style.css       # 全站样式（设计令牌 + 组件 + 响应式 + 降级）
│   ├── main.js         # 主交互：点阵纸纹/进度条/scrollspy/视差/惯性滚动/灯箱
│   ├── map.js          # 时光漫游 + 定位图（MapLibre，按需加载）
│   └── wall.js         # 留言墙（对接自托管 Artalk）
├── images/
│   ├── full/           # 25 张全幅摄影
│   ├── thumbs/         # 对应缩略图
│   └── emblem-*.png    # 校徽（顶栏 / 首屏 / 页脚 / favicon）
├── maplibre/           # MapLibre GL v5 自托管（不依赖 CDN）
└── docs/               # README 展示截图
```

## ⚙️ 技术栈

| 层 | 选型 |
|------|------|
| 前端 | 纯 HTML / CSS / Vanilla JS，结构·样式·行为三分离，零框架无构建 |
| 粒子背景 | Canvas 2D 单画布点阵系统（React Bits DotField 路线，自研实现） |
| 地图 | [MapLibre GL](https://maplibre.org) v5 + OSM 栅格底图（自托管，不依赖 CDN） |
| 留言 | [Artalk](https://artalk.js.org) v2.10 自托管 + SQLite |
| 服务 | nginx 反向代理 `/comment/` → systemd 常驻 |
| 部署 | Azure VM · Cloudflare DNS · Let's Encrypt |

## 🚀 本地运行

无需安装任何东西：

```bash
git clone https://github.com/xxc2007/In-memory-of-Nanchang-No.-15-Middle-School.git
cd In-memory-of-Nanchang-No.-15-Middle-School
python -m http.server 8000   # 或任意静态服务器；浏览器打开 http://localhost:8000
```

> 留言墙依赖自托管的 Artalk 服务（`/comment/`），本地打开时该区域会提示加载失败，其余功能完整可用。直接双击 `index.html`（file://）也可浏览，仅定位图瓦片与留言墙需要网络。

## 📝 设计笔记

- **视觉方向**：Claude / Anthropic 视觉语言（米白纸感 + 赤陶橙 + 衬线），由站长在项目之初指定，此后所有迭代都在这个方向上生长。
- **点阵纸纹的由来**：动效重设计前，先深度研究了 50 个动效网站的实现（React Bits 56 个背景组件逐一源码分类、Aceternity UI 全部背景特效、Uiverse、Anime.js v4、Awwwards Motion 画廊），沉淀出「亮背景上粒子要么暗而疏、要么暖而虚」等十条设计律令，再出三方案对比（香樟光斑 / 点阵纸纹 / 时光流星），最终选定最贴纸感的「点阵纸纹」。
- **一处细节**：点阵在照片卡片之下（`main` 提到 z-2），只在页边距与卡片间隙透出——背景动效永远让位于内容。

## 📄 License

[MIT](LICENSE) © 2026 熊鑫晨（Xiong Xinchen）· 校园实景摄影 © 熊鑫晨

---

<div align="center">
  <sub>献给青山湖畔的红砖楼、香樟与老水塔。<br><a href="https://xxc2007.me">xxc2007.me</a></sub>
</div>
