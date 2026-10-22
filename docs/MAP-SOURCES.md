# 校园地图来源与维护

地图使用自托管 MapLibre 6.14.0；照片、控件和机位数据仍在现有静态站点内。首屏不请求地图引擎或瓦片，接近「寻踪」后才加载。

## 已接入的来源

| 模式 | 来源 | 坐标与数据级别 | 说明 |
| --- | --- | --- | --- |
| 校园地图（默认） | 高德道路图 | GCJ-02，数据到 18 级 | 沿用现有道路来源；本次没有新增未公开的高德卫星接口 |
| 卫星影像 | Esri World Imagery | WGS84 地理坐标，Web Mercator 瓦片，到 19 级 | 官方在线影像服务，内容会更新 |
| 卫星影像 | Esri Wayback 2023 | WGS84 地理坐标，Web Mercator 瓦片，到 19 级 | 固定发布版本 2023-06-29，release 47963；发布日期不等于拍摄日期 |
| 两种模式（配置后出现） | 天地图道路/影像及注记 | CGCS2000 地理参考，Web Mercator WMTS，到 18 级 | 本站校园展示按经纬度直接叠加，不施加 GCJ-02 偏移；不作测量精度承诺 |

官方资料：

- [Esri World Imagery](https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9)
- [Wayback 2023-06-29](https://www.arcgis.com/home/item.html?id=992178c4e2cb416384dfb6339de5ac7a)
- [Wayback 应用](https://livingatlas.arcgis.com/wayback/)
- [Wayback 官方客户端源码](https://github.com/Esri/wayback-core)
- [天地图](https://www.tianditu.gov.cn/)

在线来源有各自的许可、配额和版权标注要求；服务可访问不代表可将影像批量下载、转售或离线再分发。本实现显示来源版权、提供详情链接，直接请求在线瓦片。

## 启用天地图

申请适用于网站的天地图公开前端 Key，并配置域名限制。在各语言页面的 `campusMap` 元素加入：

```html
<div id="campusMap" data-tianditu-key="你的32位天地图Key" ...></div>
```

用实际 Key 替换示例文字，保留原有 role/aria-label。有效 Key 存在时，道路、卫星和 3D 视图的来源菜单加入天地图；未配置时不向访客展示不能使用的选项。此 Key 会在浏览器中公开，不能填入服务端密钥。2026-10-22 已在用户的官方账号创建专用浏览器应用「南昌十五中校园纪念册」，十语页面均已配置 Key，白名单为 xxc2007.me,www.xxc2007.me,127.0.0.1；道路、卫星、注记已在线验证。管理入口为 https://cloudcenter.tianditu.gov.cn/center/development/myApp 。localhost 未通过官方白名单校验，本地测试应使用 127.0.0.1。

## 坐标与机位

`assets/map.js` 中 `SPOTS` 保持 WGS84 经纬度。`assets/map-sources.js` 对高德做正转换；切换离开高德时，用迭代逆转换恢复相机的地理坐标，再进入新来源，避免相机和标记分别偏移。切换保留当前照片、缩放及地理中心；不重复创建八个标记。

部分机位仍是 `estimated` 或 `approx`。本次没有 GPS/测量证据，不改写这些坐标，也不把来源像素分辨率当作机位定位精度。不同来源的影像配准本身也可能存在偏差。

2026-10-22 对当前网站中心点（115.93216, 28.72078）的 Esri identify 查询返回分辨率 0.34 米、采集日期 2025-04-03、位置准确度字段 8.47 米。这是当次查询结果，不能当作此服务今后不变的属性，因此 UI 不硬编码这些数值。Wayback 2023 的校园拍摄日期、像素分辨率没有在本次升级中逐项核实。

## 加载、故障与缓存

`map-loader.js` 并行加载来源模块、控件模块及引擎，不提前请求其他底图。来源切换后使用新的 source ID，忽略旧来源的成功/失败事件。出现当前来源错误，或 15 秒未得到成功瓦片时，状态栏提供重试；可以随时切回校园道路图。部分瓦片失败也显示失败状态，不把局部加载当成完整成功。照片漫游独立于 WebGL。

MapLibre 6 栅格 `sourcedata` 事件不一定带 `sourceDataType`，成功判断使用 `tile.state === 'loaded'`，再结合来源加载状态。

修改资源后运行：

```powershell
node scripts/prepare-release.mjs
node --test "tests/*.test.mjs"
node scripts/check-static.mjs
node scripts/check-vendor.mjs
node scripts/prepare-release.mjs --check
```

准备脚本先为两个惰性模块计算内容版本，再生成十语 HTML 的整体资源指纹；新建且未提交的资源也参与计算。

## 3D 后续接入

本次新增「3D 视图」：Esri 或天地图影像叠加 OpenFreeMap 的 OpenMapTiles 建筑矢量图层 https://tiles.openfreemap.org/planet ，通过 render_height / render_min_height 生成实际挤出几何。它是开放轮廓与估计高度示意，并非倾斜摄影实景校园模型。

2026-10-22 对校园范围（115.931–115.9333 E, 28.7198–28.7219 N）检查可见约 9 个建筑多边形，楼高属性均为默认的 5 米。服务将多个多边形合并为一个 MultiPolygon，要素条数不能当成建筑数量。界面明确说明默认估计高度；不虚构实际楼高，也不把它当作厘米级成果。

切换来源时，必须同时等待影像、注记和建筑所需的各来源加载成功；旧请求不能改变新来源状态。

南昌官方记载的城区倾斜摄影采集成果是后续联系本地数据平台的线索；仍需确认校园覆盖、采集时间、可公开展示的模型/服务及授权。获得模型后可单独按需加载 3D 渲染器，共用 WGS84 机位和照片选择。


其他平台的账号/认证状态见 [地图申请记录](MAP-APPLICATION.md)。高德官方 JS API 已取得专用凭据，腾讯官方 JS API GL 也已取得专用浏览器 Key；两个来源均提供道路、卫星与 3D。百度认证通过后新增百度 JSAPI GL 的道路、卫星与 3D 来源，通过原生 BD09 坐标与 WGS84 照片坐标之间的转换保持机位位置。百度 SDK 在独立 iframe 内按需初始化，切走时销毁，防止实例共享状态干扰其他地图。所有模式仍默认高德，其他来源供用户选择。运行和上线条件见 [原生 SDK 与高德代理说明](AMAP-PROXY.md)。Google Cloud 仍未取得可用凭据。
