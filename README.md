<sub>🌐 <b>中文</b> · <a href="README.en.md">English</a></sub>

<div align="center">

# 青山湖畔的纪念册

> *「所谓母校，就是那座你离开之后才开始无限怀念的校园。」*

[![Live Site](https://img.shields.io/badge/🌐_线上访问-xxc2007.me-D97757)](https://xxc2007.me)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/依赖-Vanilla_JS-orange)](#️-技术栈)
[![Self-hosted](https://img.shields.io/badge/留言墙-Artalk_自托管-blueviolet)](#留言墙artalk-自托管)
[![GitHub](https://img.shields.io/badge/GitHub-@xxc2007-1F1E1D)](https://github.com/xxc2007)
[![抖音](https://img.shields.io/badge/抖音-Douyin-1F1E1D)](https://www.douyin.com/user/MS4wLjABAAAA-AYW1RCpFjwJmoMTnZy1vKmOQopmBOUjPLN9phlDpjI)
[![小红书](https://img.shields.io/badge/小红书-Xiaohongshu-D97757)](https://www.xiaohongshu.com/user/profile/63bac6500000000026006c47)
[![哔哩哔哩](https://img.shields.io/badge/哔哩哔哩-Bilibili-1F1E1D)](https://space.bilibili.com/31961476)
[![X](https://img.shields.io/badge/X-@xxc2007-1F1E1D)](https://x.com/xxc2007)
[![YouTube](https://img.shields.io/badge/YouTube-@xxc2007-D97757)](https://www.youtube.com/@xxc2007)

<br>

**把三年光阴放进一个可以随时回去的地址。**

<br>

这是南昌市第十五中学的纪念页：**25 张校园实景摄影**、一段**八个机位的时光漫游**、一张**中文定位图**与一面**无需登录的匿名留言墙**。

纯 HTML / CSS / Vanilla JS，结构·样式·行为三分离（`index.html` + `assets/`），零框架、无构建步骤。克隆下来，起个静态服务器就能打开。

[在线访问](https://xxc2007.me) · [特色](#-特色) · [站点结构](#-站点结构) · [技术栈](#️-技术栈) · [本地运行](#-本地运行) · [设计笔记](#-设计笔记) · [迁移手册](docs/MIGRATION.md)

</div>

---

<p align="center">
  <img src="docs/screenshot-hero.png" alt="首屏：校徽、衬线大标题与关键数字" width="100%">
</p>
<p align="center"><sub>
  ▲ 首屏 · 米白纸感 + 赤陶橙 + 衬线大标题
</sub></p>

---

## 🎬 宣传片展示

这支宣传片把网页里的真实内容重新编排成一条 35 秒的观看路径：从首屏的校徽与标题出发，经过沿革时间轴、25 张校园实景、水塔昼夜、八机位地图和脱敏留言墙，最后回到整本纪念册。画面使用真实网页截图与公开校园摄影，配以克制的节奏和纸页式转场。

点击下方播放器即可在线播放。

https://github.com/user-attachments/assets/368cc8d5-2605-4444-949f-fe6b7a017408

▶️ [打开 1080p 高清播放器](https://xxc2007.me/promo/) · [直接打开 1080p 源视频](https://raw.githubusercontent.com/xxc2007/In-memory-of-Nanchang-No.-15-Middle-School/main/docs/promo/nanchang15-promo.mp4)

README 原生预览保持 1920×1080 分辨率；独立播放器与源视频链接继续直接使用仓库中的 1080p 完整片。

---

## ✨ 特色

### 📖 纪念册本体

- **七个章节**：概况 → 沿革 → 光影（25 张摄影，六个专题组）→ 水塔 → 寻踪 → 寄语 → 留言墙
- **十种语言**：顶栏右侧「地球图标 + 下拉语言菜单」（参照 AMD 官网的切换方式，菜单里是 简体中文 / 繁體中文 / English / 日本語 等十个完整本族名，当前语言赤陶橙高亮并打勾）——整块标记 `translate="no"` 与双语翻译插件隔离，不会像旧版单字药丸那样被插件扩写撑出可视区；`/`（简体）`/zh-Hant/`（繁體）`/en/`（English）`/ja/`（日本語）`/ko/`（한국어）`/ru/`（Русский）`/es/`（Español）`/fr/`（Français）`/pt/`（Português）`/ar/`（العربية）；十页互持 hreflang + sitemap 交替链接；时光漫游、定位图与留言墙的动态文案按页面语言自动切换，十版共用同一面留言墙
- Claude 视觉语言：米白纸感底色 `#F0EEE6` + 赤陶橙 `#D97757` + 衬线标题，全站统一的发丝线与圆角卡片
- 完整响应式（三档断点）、打印成册样式与 `prefers-reduced-motion` 降级

### 🗺 校园寻踪（时光漫游 + 定位图）

- **全幅照片漫游**：8 个机位、8 张全幅照片，箭头 / 圆点 / 键盘方向键切换，Ken Burns 缓推镜头
- **中文定位图**：高德地图（AutoNavi）中文栅格底图，8 个机位标记与漫游联动，点击标记镜头飞至该位置
- 滚动临近才按需加载 MapLibre，首屏零地图开销；机位数据集中在 `assets/map.js` 的 `SPOTS` 数组，一眼可改

<p align="center">
  <img src="docs/screenshot-tour.png" alt="时光漫游：八个机位的全幅照片漫游，Ken Burns 镜头" width="86%">
</p>
<p align="center"><sub>
  ▲ 伍 · MAP 时光漫游 · 老水塔机位 · 底部渐影字幕与 5/8 计数
</sub></p>

### 💬 留言墙（Artalk 自托管）

- **无需登录**：不填昵称邮箱也能留言，前端自动补全匿名身份（同昵称同身份）
- **先审后显**：新留言进入待审队列，站长在后台审核通过后才对外展示
- 零第三方依赖：Artalk 服务端跑在自己的服务器上，数据是自己的

<p align="center">
  <img src="docs/screenshot-guestbook.png" alt="留言墙：B站风格匿名评论区" width="86%">
</p>
<p align="center"><sub>
  ▲ 柒 · WALL 留言墙 · 匿名留言 · 头像 / IP 属地 / 北京时间
</sub></p>

### 🎬 动态交互（原生 JS，零依赖）

| 交互 | 说明 |
|------|------|
| 阅读进度条 | 顶栏赤陶橙细线，`scaleX` 随滚动增长 |
| 语言切换菜单 | 顶栏地球按钮展开十语下拉（AMD 式）：`Esc` 收起、`↑↓`/`Home`/`End` 在选项间移动、点击菜单外任意处关闭；无 JS 时降级为静态药丸行 |
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
├── index.html          # 简体中文页（语义 HTML；仅两处内联脚本：JSON-LD、地图惰性加载器）
├── zh-Hant/index.html  # 繁體中文頁（台湾用语习惯：暱稱/登入/載入/網路/郵遞區號）
├── en/index.html       # English page (assets shared via ../ relative paths, file:// friendly)
├── ja/index.html       # 日本語ページ（「おわりに」「通りすがり」など自然な日本語文体）
├── ko/index.html       # 한국어 페이지（「기념 앨범」「지나가던 학생」등 자연스러운 한국어 표현）
├── ru/index.html       # Русская страница（памятный альбом, паллиативная транслитерация имён）
├── es/index.html       # Página en español（lenguaje natural, no traducción automática）
├── fr/index.html       # Page en français（formulations idiomatiques françaises）
├── pt/index.html       # Página em português（expressões idiomáticas em português）
├── 404.html            # 自包含 404 页（样式内联、零外部依赖，附英/日/繁语言入口）
├── assets/
│   ├── style.css       # 全站样式（设计令牌 + 组件 + 响应式 + 打印 + 降级）
│   ├── main.js         # 主交互：进度条/scrollspy/语言下拉/视差/惯性滚动/灯箱
│   ├── map.js          # 时光漫游 + 定位图（MapLibre，按需加载；机位数据含简/繁/英/日/韩/俄/西/法/葡十语字段）
│   └── wall.js         # 留言墙（对接自托管 Artalk；动态文案按 <html lang> 十语切换）
├── images/
│   ├── full/           # 25 张全幅摄影（另有 4 张备用素材：10/22/23/25，暂未上墙）
│   ├── thumbs/         # 对应缩略图
│   ├── og-card.jpg     # 1200×630 分享卡（无文字，十语通用）
│   └── emblem-*.png    # 校徽（顶栏 / 首屏 / 页脚 / favicon）
├── maplibre/           # MapLibre GL v5 自托管（不依赖 CDN）
├── docs/               # README 展示截图 + [迁移手册](docs/MIGRATION.md)
│   └── promo/          # 公开在线播放页、1080p 展示副本与完整源片（线上入口：/promo/）
├── README.md / README.en.md   # 中英双语仓库说明（本文件与英文版）
├── robots.txt / sitemap.xml / LICENSE / .gitattributes / .gitignore
```

## ⚙️ 技术栈

| 层 | 选型 |
|------|------|
| 前端 | 纯 HTML / CSS / Vanilla JS，结构·样式·行为三分离，零框架无构建 |
| 地图 | [MapLibre GL](https://maplibre.org) v5 自托管 + 高德地图（AutoNavi）中文栅格瓦片 |
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

- **视觉方向**：Claude / Anthropic 视觉语言（米白纸感 + 赤陶橙 + 衬线），由站长在项目之初指定，此后所有迭代都在这个方向上生长。背景保持纯净的米白纸面，不加任何装饰层——动效永远让位于内容。
- **多语架构**：十个静态页（`/` `/zh-Hant/` `/en/` `/ja/` `/ko/` `/ru/` `/es/` `/fr/` `/pt/` `/ar/`）而非 JS 运行时翻译——每页拥有完整的语义内容与 SEO 元数据，用 hreflang 与 sitemap 交替链接互认；`wall.js`/`map.js`/`main.js` 按 `<html lang>` 切换动态文案，十版共用同一面留言墙（同一 page_key），各语言留言汇成一面墙。
- **桌面惯性滚动是刻意设计**：滚轮经惯性插值驱动（Oryzo/Lusion 手感），仅在精确指针设备启用；浏览器缩放（Ctrl+滚轮）、地图画布、输入框与灯箱均不劫持，触屏与 `prefers-reduced-motion` 用户走原生滚动。这不是 bug。
- **浏览器支持矩阵**：面向现代常青浏览器（Chrome / Edge / Firefox / Safari 近两年版本），明确不支持 IE 及 Legacy Edge，全站无 polyfill。
- **留言墙拉取上限**：单次最多取 100 条（纪念册体量足够），计数优先展示服务端真实总数；网络请求统一带 15 秒超时兜底。
- **404 页的语言入口仍是药丸**：那是刻意取舍——404.html 设计成完全自包含（零外部请求、样式内联），引入主站的下拉交互就得带上 JS 与更多样式；两种形态并存不影响可用性。
- **备用素材池**：`images/full|thumbs` 中的 `10-brick-building-court`、`22-running-track`、`23-library-gate`、`25-staff-lane` 共 4 组为刻意保留的备用素材，暂未编入画廊章节；新增/替换照片时优先从这里取用。

## 📄 License

[MIT](LICENSE) © 2026 熊鑫晨（Xiong Xinchen）· 校园实景摄影 © 熊鑫晨

---

<div align="center">
  <sub>献给青山湖畔的红砖楼、香樟与老水塔。<br><a href="https://xxc2007.me">xxc2007.me</a></sub>
</div>
