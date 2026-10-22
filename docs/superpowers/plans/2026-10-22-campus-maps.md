# 校园多源地图实现计划

目标：为现有地图接入道路、当前卫星、历史卫星并保持照片联动。

架构：assets/map-sources.js 管理来源、坐标与样式；assets/map.js 管理照片及地图交互；map-loader.js 按需加载来源与引擎。界面使用共享脚本生成并按十语翻译。

- [x] 新建 map-sources.js，抽取现有 GCJ-02 转换，增加逆转换、来源配置及样式生成。测试中国校园坐标往返、Esri/天地图坐标不偏移、瓦片地址与版权。
- [x] 在 map.js 加入模式/来源选择、回校园、状态与重试。切换重建独立来源 ID、保持相机/照片、同步所有标记。测试来源切换、照片选择和陈旧事件。
- [x] 更新 loader 的按需依赖及 style.css 的移动布局、地图高度、卫星原色与打印规则；保留 WebGL 降级及照片独立加载。
- [x] 更新十语底部说明、维护文档与资源指纹；运行 node --test tests/*.test.mjs、check-static、check-vendor、prepare-release --check。
- [x] 用真实浏览器验证桌面及手机来源切换、错误重试与照片联动，保存预览图；报告已完成内容与未获取的 3D 数据。

验证结果：启用已有 Playwright 安装后，21/21 测试通过，无跳过；十语 770 个本地资源引用、vendor 校验、缓存指纹与 git diff --check 通过。真实在线地图验证道路、当前卫星、历史影像、机位点击、中心保持、断网重试，以及英文/阿拉伯语手机布局。截图见 output/playwright/campus-maps-desktop.png 和 campus-maps-mobile.png（不纳入版本库）。天地图没有真实 Key，未在线验证；3D 无可用模型。
