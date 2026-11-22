<sub>🌐 <b>中文</b> · <a href="README.en.md">English</a></sub>

<div align="center">

# 青山湖畔的纪念册

> *「所谓母校，就是那座你离开之后才开始无限怀念的校园。」*

[![Live Site](https://img.shields.io/badge/🌐_线上访问-xxc2007.me/nc15-D97757)](https://xxc2007.me/nc15/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/依赖-Vanilla_JS-orange)](#️-技术栈)
[![Self-hosted](https://img.shields.io/badge/留言墙-Artalk_自托管-blueviolet)](#-特色)
[![GitHub](https://img.shields.io/badge/GitHub-@xxc2007-1F1E1D)](https://github.com/xxc2007)
[![抖音](https://img.shields.io/badge/抖音-Douyin-1F1E1D)](https://www.douyin.com/user/MS4wLjABAAAA-AYW1RCpFjwJmoMTnZy1vKmOQopmBOUjPLN9phlDpjI)
[![小红书](https://img.shields.io/badge/小红书-Xiaohongshu-D97757)](https://www.xiaohongshu.com/user/profile/63bac6500000000026006c47)
[![哔哩哔哩](https://img.shields.io/badge/哔哩哔哩-Bilibili-1F1E1D)](https://space.bilibili.com/31961476)
[![X](https://img.shields.io/badge/X-@xxc2007-1F1E1D)](https://x.com/xxc2007)
[![YouTube](https://img.shields.io/badge/YouTube-@xxc2007-D97757)](https://www.youtube.com/@xxc2007)

<br>

**把三年光阴，放进一个可以随时回去的地址。**

<br>

这是一本献给**南昌市第十五中学**的私人数字纪念册——<br>
收录 **25 张亲手拍摄的校园实景**、一段 **8 个机位的时光漫游**、一张 **多源中文定位图**，<br>
以及一面 **无需登录、人人皆可落笔的匿名留言墙**。

全站采用纯 HTML / CSS / Vanilla JS 编写，结构、样式、行为三分离（`index.html` + `assets/`），零框架、无构建步骤。<br>
克隆下来，起任意一个静态服务器，便能翻开这本纸感校史画册。

[在线访问](https://xxc2007.me/nc15/) · [宣传片](#-宣传片展示) · [特色](#-特色) · [站点结构](#-站点结构) · [技术栈](#️-技术栈) · [本地运行](#-本地运行) · [设计笔记](#-设计笔记) · [Star History](#-star-history) · [迁移手册](docs/MIGRATION.md)

</div>

---

<p align="center">
  <img src="docs/screenshot-hero.png" alt="首屏：校徽、衬线大标题与关键数字" width="100%">
</p>
<p align="center"><sub>
  ▲ 首屏 · 米白纸感（#F0EEE6）+ 赤陶橙（#D97757）+ 衬线大标题
</sub></p>

---

## 🎬 宣传片展示

70 秒重走一遍校园记忆：从首屏的校徽与红砖题词出发，沿校史时间轴缓缓前行，掠过 25 张四季光影、昼夜对照的老水塔、八机位校园地图与温暖的留言墙，最后回到整本纪念册。全部画面取自真实网页与校园实景摄影，配以克制节奏与翻页式转场。

点击下方播放器即可在线观看：

https://github.com/user-attachments/assets/https://github.com/user-attachments/assets/8e3cfb0e-67dd-4080-acd0-4fd5e7066753

▶️ [打开 1080p 高清播放器](https://xxc2007.me/nc15/promo/) · [直接打开 1080p 源视频](https://raw.githubusercontent.com/xxc2007/In-memory-of-Nanchang-No.-15-Middle-School/main/docs/promo/nanchang15-promo.mp4)

<sub>README 原生预览保持 1920 × 1080 清晰度；独立播放器与源视频链接直连仓库内 1080p 完整母片。</sub>

---

## ✨ 特色

### 📖 纸感画册本体

- **七幕清晰叙事**：`概况` → `沿革` → `光影`（25 张实景，六大专题组）→ `水塔`（独立暗色情绪转折）→ `寻踪` → `寄语` → `留言墙`，像翻阅一本精心装帧的校史册。
- **十种语言独立静态页**：覆盖简体中文（`/`）、繁體中文（`/zh-Hant/`）、English（`/en/`）、日本語（`/ja/`）、한국어（`/ko/`）、Русский（`/ru/`）、Español（`/es/`）、Français（`/fr/`）、Português（`/pt/`）与 العربية（`/ar/`）。
  - 顶栏右侧采用「地球图标 + 下拉语言菜单」交互，以各语种本族名清晰陈列，当前语言以赤陶橙高亮打勾，并标记 `translate="no"` 隔绝浏览器翻译插件错位；
  - 十个版本互持 `hreflang` 与 `sitemap` 交替链接，时光漫游、地图标注与留言墙动态文案随 `<html lang>` 自动切换，十语读者共写同一面留言墙。
- **温润克制的视觉语言**：以米白纸面（`#F0EEE6`）、赤陶砖红（`#D97757`）与衬线标题铺陈校园记忆，全站统一发丝线与圆角卡片，并内置三档响应式断点、纸质打印成册样式与 `prefers-reduced-motion` 减弱动效支持。

### 🗺 校园寻踪（时光漫游 + 多源定位图）

- **八机位全幅时光漫游**：8 个真实校园机位配 Ken Burns 缓推镜头，支持左右箭头、圆点导航与键盘方向键自由切换。
- **多源校园地图联动**：集成高德中文道路图、天地图道路与卫星、Esri 实时卫星及 **2023 年历史影像**，并与 8 个机位精准联动；3D 视图可在卫星影像上叠加 OpenFreeMap 建筑轮廓与估计高度（非测绘成果），提供一键回到校园、加载提示与失败重试。来源与维护细则见[地图维护说明](docs/MAP-SOURCES.md)。
- **首屏零地图负担**：仅在滚动临近时按需加载自托管的 MapLibre GL v5；全部机位坐标与多语图注集中在 `assets/map.js` 的 `SPOTS` 数组中，增改一目了然。

<p align="center">
  <img src="docs/screenshot-tour.png" alt="时光漫游：八个机位的全幅照片漫游，Ken Burns 镜头" width="86%">
</p>
<p align="center"><sub>
  ▲ 伍 · MAP 时光漫游 · 老水塔机位 · 底部渐影图注与 5/8 进度计数
</sub></p>

### 💬 留言墙（Artalk 自托管）

- **免登录即刻落笔**：不填昵称或邮箱也可直接留言，前端自动补全温和的匿名身份（同昵称保持同身份）。
- **先审后显，守住清净**：新留言进入后台待审队列，经站长审核后对外呈现。
- **数据完全自主**：Artalk 服务端自托管于个人服务器，无任何第三方评论追踪。

<p align="center">
  <img src="docs/screenshot-guestbook.png" alt="留言墙：简洁克制的匿名评论区" width="86%">
</p>
<p align="center"><sub>
  ▲ 柒 · WALL 留言墙 · 免登录匿名留言 · 头像 / IP 属地 / 北京时间
</sub></p>

### 🎬 原生交互细节（零外部框架）

| 交互细节 | 实现方式与手感 |
|---|---|
| **阅读进度条** | 顶栏赤陶橙细线随页面滚动平滑延展（`scaleX`） |
| **十语切换菜单** | 键盘友好（`Esc` 收起、`↑↓` / `Home` / `End` 移动），无 JS 环境自动降级为静态药丸行 |
| **章节高亮** | Scrollspy 实时点亮当前所在章节 |
| **历史数字滚动** | 首屏核心数字 `0 → 1958 / 51 / 2600+ / 25`，以 `easeOutQuart` 柔和定格 |
| **首图反向视差** | 首屏校园全景以 `0.5×` 速率反向微移并叠加工光标惯性，`scale(1.09)` 杜绝边缘露白 |
| **惯性平滑滚动** | 桌面滚轮采用惯性插值手感，同时不劫持触屏、地图画布、输入框与灯箱缩放 |
| **沿革时间线生长** | 校史竖线随滚动徐徐画下，途经的年份节点逐一点亮 |
| **无损图片灯箱** | 支持以光标为中心 `1–4×` 滚轮缩放、双击放大、拖拽平移、双指捏合与边界钳制 |
| **画廊渐显与微倾** | 图片加载后柔光渐入；桌面端卡片随光标呈现细腻的 3D 微倾反馈 |

全部动画收敛于单一 `requestAnimationFrame` 滚动循环，在系统开启「减弱动态效果」时整体安静降级。

## 🗂 站点结构

```text
site/
├── index.html          # 简体中文主站（语义化 HTML；仅含 JSON-LD 与地图惰性加载器两处内联脚本）
├── zh-Hant/index.html  # 繁體中文頁（贴合台湾用语习惯：暱稱 / 登入 / 載入 / 網路 / 郵遞區號）
├── en/index.html       # English page（通过 ../ 共享静态资产，兼容 file:// 本地预览）
├── ja/index.html       # 日本語ページ（「おわりに」「通りすがり」等自然日语表达）
├── ko/index.html       # 한국어 페이지（「기념 앨범」「지나가던 학생」等自然韩语表达）
├── ru/index.html       # Русская страница（地道俄语校史与姓名转写）
├── es/index.html       # Página en español（自然西语表达，非机翻腔）
├── fr/index.html       # Page en français（地道法语表达）
├── pt/index.html       # Página em português（地道葡语表达）
├── ar/index.html       # الصفحة العربية（阿拉伯语完整页面）
├── 404.html            # 完全自包含 404 页（内联样式、零外部请求，附多语入口）
├── assets/
│   ├── style.css       # 全站样式体系（设计令牌 + 组件 + 响应式 + 打印成册 + 降级规则）
│   ├── main.js         # 核心交互（进度条 / scrollspy / 语言下拉 / 视差 / 惯性滚动 / 灯箱）
│   ├── map.js          # 时光漫游与 MapLibre 定位图（按需加载，内置十语机位字段）
│   └── wall.js         # 留言墙前端（对接自托管 Artalk，按 <html lang> 自动切换十语文案）
├── images/
│   ├── full/           # 25 张全幅校园实景摄影（另保留 4 张备用素材：10 / 22 / 23 / 25）
│   ├── thumbs/         # 对应轻量化缩略图
│   ├── og-card.jpg     # 1200 × 630 无文字通用分享图（十语共用）
│   └── emblem-*.png    # 南昌十五中校徽（顶栏 / 首屏 / 页脚 / favicon）
├── maplibre/           # MapLibre GL v5 本地自托管（零外部 CDN 依赖）
├── docs/               # README 实拍截图 + 迁移手册（docs/MIGRATION.md）
│   └── promo/          # 在线播放页、1080p 展示副本与完整源片（线上入口：/nc15/promo/）
├── README.md / README.en.md   # 中英双语仓库说明
└── robots.txt / sitemap.xml / LICENSE / .gitattributes / .gitignore
```

## ⚙️ 技术栈

| 层面 | 技术选型 |
|---|---|
| **前端** | 纯 HTML / CSS / Vanilla JS，结构、样式、行为三分离，零框架无构建 |
| **地图** | [MapLibre GL](https://maplibre.org) v5 自托管 + 高德地图（AutoNavi）中文栅格瓦片 |
| **留言** | [Artalk](https://artalk.js.org) v2.10 自托管 + SQLite |
| **服务** | Nginx 反向代理 `/comment/` → systemd 常驻守护 |
| **部署** | Azure VM · Cloudflare DNS · Let's Encrypt HTTPS |

### 底层原理与运行流程

下图将纪念册拆解为静态阅读、地图漫游与自托管留言三条清晰链路：正文与摄影由静态资源直出；地图仅在接近视口时按需载入并与八大机位联动；留言则经独立服务端落盘与审核。绿色代表读者可见结果，橙色代表审核、降级或异常保护。

[![校园纪念册 · 内容、地图与留言如何协作](docs/architecture/flow.zh.897ac732d190.png)](https://raw.githubusercontent.com/xxc2007/In-memory-of-Nanchang-No.-15-Middle-School/main/docs/architecture/flow.zh.897ac732d190.png)

点击打开 3600px 高清原图，再次点击可原尺寸查看 · [可编辑 SVG 源文件](docs/architecture/flow.zh.svg)。实现依据：[index.html](index.html) · [assets/main.js](assets/main.js) · [assets/map.js](assets/map.js) · [assets/map-sources.js](assets/map-sources.js) · [assets/wall.js](assets/wall.js) · [docs/MAP-SOURCES.md](docs/MAP-SOURCES.md) · [docs/MIGRATION.md](docs/MIGRATION.md)。

如需修改图表文字与节点，编辑 [`render.mjs`](docs/architecture/render.mjs) 后执行 `npm ci --prefix docs/architecture` 与 `node docs/architecture/render.mjs` 即可同步导出中英文 SVG 与高清 PNG（详见[导出说明](docs/architecture/README.md)）。

## 🚀 本地运行

零依赖、零安装，克隆即看：

```bash
git clone https://github.com/xxc2007/In-memory-of-Nanchang-No.-15-Middle-School.git
cd In-memory-of-Nanchang-No.-15-Middle-School
python -m http.server 8000   # 或任意静态服务器；浏览器打开 http://localhost:8000
```

> 留言墙依赖自托管 Artalk 服务（`/comment/`），本地预览时该板块会提示加载失败，其余章节、画廊与交互均完整可用。直接双击 `index.html`（`file://`）亦可浏览，仅在线地图瓦片与留言墙需要网络。

## 📝 设计笔记

- **视觉定调**：以米白纸感、赤陶橙与衬线字形建立温暖克制的阅读秩序（源自项目启动之初对 Claude / Anthropic 编辑美学的偏爱）。纸面保持洁净无杂饰——动效永远为记忆与照片让路。
- **静态多语哲学**：刻意编写十份独立静态 HTML 而非运行时 JS 翻译，确保每种语言都拥有完整语义与 SEO 元数据；`main.js`、`map.js` 与 `wall.js` 依据 `<html lang>` 自动切换动态文案，十版共用同一面留言墙（同一 `page_key`），让散落各地的校友在同一个角落重逢。
- **桌面惯性滚动是有意为之**：滚轮经惯性插值带来柔和阻尼，且仅作用于精确指针设备；浏览器缩放（`Ctrl + 滚轮`）、地图画布、输入框与灯箱绝不劫持，触屏与减弱动效用户自动回退原生滚动。
- **浏览器支持边界**：面向近两年主流现代常青浏览器（Chrome / Edge / Firefox / Safari），不兼容 IE 与 Legacy Edge，全站保持零 polyfill 的轻盈。
- **留言拉取与超时保护**：单次最多拉取 100 条（契合纪念册体量），计数优先呈现服务端真实总数；全部请求统一配置 15 秒超时兜底。
- **404 页的克制取舍**：`404.html` 刻意保留静态药丸语言入口以维持「零外部请求、完全自包含」特性，不额外引入主站脚本。
- **备用素材池**：`images/full` 与 `images/thumbs` 中的 `10-brick-building-court`、`22-running-track`、`23-library-gate`、`25-staff-lane` 四组照片为刻意留存的备用底片，后续增补画廊时优先从中遴选。

## 📄 License

[MIT](LICENSE) © 2026 熊鑫晨（Xiong Xinchen）· 校园实景摄影版权归熊鑫晨所有。

## 📈 Star History

<p align="center">
  <img src="https://api.star-history.com/svg?repos=xxc2007/In-memory-of-Nanchang-No.-15-Middle-School&type=Date" alt="Star History：本仓库 GitHub Stars 随时间增长曲线" width="100%">
</p>
<p align="center"><sub>
  ▲ 曲线由 <a href="https://star-history.com">star-history.com</a> 动态生成（GitHub 代理缓存通常有数小时延迟）。
</sub></p>

---

<div align="center">
  <sub>献给青山湖畔的红砖楼、香樟与老水塔。<br><a href="https://xxc2007.me/nc15/">xxc2007.me/nc15/</a></sub>
</div>
