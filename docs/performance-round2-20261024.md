# NC15 第二轮加载优化证据（2026-10-24）

基线：main `8b15ced`。仅修改站点源码和派生媒体，未部署，未修改代理、服务器或 CDN。

## 资源量（未压缩磁盘字节）

| 对象 | 基线 | 本轮 | 减少 |
| --- | ---: | ---: | ---: |
| 手机首图（800×600） | WebP 101,666 | AVIF 43,433 | 58,233（57.3%） |
| 桌面首图（1600×1200） | JPEG 293,661 | AVIF 156,442 | 137,219（46.7%） |
| 页面实际引用的25张不同缩略图（27个位置） | JPEG 1,515,711 | AVIF 1,049,286 | 466,425（30.8%） |
| 首屏地图与留言脚本 | map.js + wall.js 65,277 | section-loader.js 1,228 | 首屏延后64,049 |

最后一行表示代码从首屏移动到区域接近时下载，并非访问全部区域的总流量消失。HTTP压缩、缓存、字体和其他媒体仍会影响真实加载时间。

## 实现

十语言页面增加 AVIF picture source，保留手机 WebP、桌面 JPEG 和图库原始 JPEG 回退。AVIF 图片维度与输入图片一致；图库链接、灯箱和漫游仍使用现有 full 原图。已有JPEG/WebP均未改动。AVIF 为有损压缩（Pillow 12.3，quality 55），不宣称像素无损。

`assets/section-loader.js` 在地图、留言区距视口900px时加载原交互脚本；直接锚点与无IntersectionObserver浏览器会立即初始化。原地图库加载器和照片独立回退逻辑保留。`scripts/prepare-release.mjs` 同时更新延迟模块内容指纹，再更新十语言公共资源指纹。最终资源指纹：`20cd90d5`。

`python scripts/prepare-images.py` 可重新派生媒体（需要 Pillow 支持 AVIF），随后执行 `node scripts/prepare-release.mjs`。只生成实际引用的25个不同缩略图与两张首图。

## 本轮验证

- 一次本机Chrome定向交互回归，1280×800与390×800，所有请求拦截到本地文件或模拟接口：首屏不请求map.js/wall.js、不请求漫游图和留言API；首图currentSrc命中对应AVIF且可解码；首张图库AVIF可解码且有正常布局尺寸。
- 接近地图后只载当前及相邻两张漫游图；8点鼠标/触摸、左右按钮/键盘通过。MapLibre网络被中止时照片漫游保持可用。留言请求竞争与写后刷新仅使用模拟接口；无JS时原图与导航入口保留。两尺寸均无pageerror。
- `node --test tests/lazy-sections.browser.test.mjs tests/map-loader.test.mjs`：4/4通过，浏览器测试显式指定现有Playwright模块，未安装依赖。
- `node --test tests/section-loader.test.mjs`：3/3通过，覆盖加载去重、锚点、无Observer回退、模块内容指纹和十语言AVIF资源/原图入口。
- `node scripts/check-static.mjs`：十语言770个本地引用可解析；补充测试检查picture的srcset文件存在。
- `node scripts/prepare-release.mjs --check`：最终指纹current。
- Pillow解码确认25张不同缩略图的AVIF与JPEG尺寸完全一致。

未运行完整套件；未访问真实留言写接口；未重新测全部地图供应商、宣传片播放或线上环境。本地Chrome测试不能证明国内/国际线路的实际LCP或下载耗时。现有字体、地图、视频、旋转和动效未删减。

## CI 跨平台指纹修复

2026-10-24，PR15首轮质量检查在Linux报告十语言指纹过期。`.gitattributes`已经规定LF；新增section-loader的Windows工作区却是mixed换行，原生成器直接hash工作区字节，Git入库转换后字节发生变化。新增resource-bytes.mjs仅对JS/MJS/CSS/SVG/JSON/TXT文本归一CRLF→LF，二进制媒体不解码。

新增release-fingerprint.test.mjs从真实Git暂存区导出全部文件（非工作区复制），运行发布--check；再将资源文本改为CRLF重跑，同为`Resource fingerprint 20cd90d5 current`，专项1/1通过。此次修复没有重跑浏览器或全套。
