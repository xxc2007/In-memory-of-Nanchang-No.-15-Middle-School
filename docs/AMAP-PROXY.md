# 高德官方 JS API：本地验证与上线接入

2026-10-22 已在用户完成个人开发者认证后创建「南昌十五中校园纪念册」（教育）和「十五中网页地图」Web端 JS API Key。域名白名单为 xxc2007.me、www.xxc2007.me、127.0.0.1。

## 当前可用的本地预览

```powershell
node tools/map-preview.mjs
```

打开 http://127.0.0.1:4176/#map 。三个模式的来源菜单都可选择「高德地图 · JS API」。高德 SDK 只在选择该来源时加载；选择卫星时使用官方 Satellite + RoadNet，选择 3D 时使用官方 3D 视图和默认楼块，不人为放大楼高。

同一预览现也支持「腾讯地图 · JS API」。本地 `.map-dev.env` 中的 `TENCENT_BROWSER_KEY` 作为公开浏览器 Key 返回在 `map-runtime.json` 的 `tencent.key` 中；腾讯 SDK 仅在选中后加载，不使用高德的安全代理。生产运行时 JSON 可按相同结构追加 `"tencent":{"key":"YOUR_TENCENT_BROWSER_KEY"}`。腾讯卫星使用官方 satellite 底图及 road 标注，3D 使用官方矢量建筑；可用清晰度、楼块覆盖和使用许可取决于平台数据与账号权益。官方说明：https://lbs.qq.com/webApi/javascriptGL/glGuide/glBasic 。

本地 .map-dev.env 已配置浏览器 Key 与安全密钥，该文件被 .gitignore 排除。程序仅监听 127.0.0.1。map-runtime.json 只返回浏览器 Key 与同源代理路径；安全密钥只在本地服务向高德请求时追加，不发送给浏览器。静态文件路由禁止读取隐藏文件与工作区外路径，代理固定上游地址、拒绝跨域调用并拒绝安全密钥回显。

原来的纯静态预览（例如端口 4175）没有此运行时配置，继续提供已有的高德栅格、天地图、Esri 和开放建筑来源，不显示无法使用的官方 SDK 来源。

## 生产部署条件

本项目没有自动购买高德许可。创建 Key 页面提示未购买技术服务许可的 Key/配额仅供短期少量测试，并列出公开应用等授权使用条件；账号持有人应按实际场景维护相应权益。技术接通不代表购买了许可。

2026-10-22 按用户发布指令新增 `scripts/configure-map-service.mjs`：通过 SSH 标准输入安装独立 `nc15-map-proxy.service`，只监听 127.0.0.1:4186；安全密钥保存在 root 所有、权限 0600 的 `/etc/nc15-map.env`。Nginx 两个裸域服务块只增加 NC15 代理片段；保存旧配置并在 `nginx -t` 成功后平滑重载。运行时路径为 `/nc15/map-runtime.json`，同源代理为 `/nc15/_AMapService`。地图、卫星、3D 的初次默认来源均为高德官方 JS API，其他来源仍可选择。发布成功与否以部署回执及公网实测为准。

上线时还需配置同源安全代理；不能把 .map-dev.env 复制到公开静态目录，也不能把安全密钥写进前端脚本。官方说明：https://lbs.amap.com/api/javascript-api-v2/guide/abc/jscode 。

一个可审查的 Nginx 结构示例（浏览器 Key 可公开；安全密钥值应在服务器受保护的配置中设置）：

```nginx
location = /nc15/map-runtime.json {
    default_type application/json;
    add_header Cache-Control "no-store";
    return 200 '{"amap":{"key":"YOUR_BROWSER_KEY","serviceHost":"/nc15/_AMapService"}}';
}
location /nc15/_AMapService/v4/map/styles {
    set $args "$args&jscode=YOUR_SECURITY_CODE";
    proxy_pass https://webapi.amap.com/v4/map/styles;
}
location /nc15/_AMapService/v3/vectormap {
    set $args "$args&jscode=YOUR_SECURITY_CODE";
    proxy_pass https://fmap01.amap.com/v3/vectormap;
}
location /nc15/_AMapService/ {
    set $args "$args&jscode=YOUR_SECURITY_CODE";
    proxy_pass https://restapi.amap.com/;
}
```

不要将示例原样发布：需要替换当前应用的公开 Key 和服务器密钥、核对现有服务器 location 与安全策略，且先确认公开使用授权。当前本地代理已经提供同一接口用于验证。

## 交互与坐标

所有照片机位继续以 WGS84 保存，官方高德按 GCJ-02 转换。进入官方 SDK 时保留地理中心和缩放；SDK 内的机位点击继续驱动照片漫游，照片箭头也能移动原生地图。切回 MapLibre 来源时，先读取原生相机并逆转换，随后销毁原生地图；过时的异步加载回调不能改变当前来源状态。

高德的三维楼块覆盖和高度来自提供方，不宣称为校园倾斜摄影或厘米级测绘模型。
