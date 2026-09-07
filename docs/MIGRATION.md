# 🧳 迁移手册（MIGRATION）

> 这份手册回答一个问题：**换服务器 / 换域名时，怎么把这个纪念册完整搬走？**
> 编写于 2026-09-07，与当时的线上实况一一对应。半年后使用前，先核对一遍命令里的路径与版本。

## 〇、迁移的三件套——先搞清楚有什么要搬

| 组成 | 存放位置 | 内容 |
|---|---|---|
| ① 网站本体 | **本仓库**（开源，你现在看的这个） | 页面 / 图片 / 代码的完整镜像，`git clone` 下来就是整站，无任何构建步骤 |
| ② 留言数据 | **私有仓库 `xxc2007/nanchang15-memorial-data`** | `artalk.db`（留言数据库）+ `artalk-img/`（留言头像）+ `artalk.yml`（服务配置），服务器每日 04:30 自动备份推送 |
| ③ 基础设施脚本 | **私有仓库的 `infra/` 目录** | nginx 站点配置模板、新服务器一键初始化、留言数据恢复、换域名批量替换脚本 |

> ⚠️ 私有仓库含留言人 IP 与服务器信息，**永远不要改为公开**。

**开始之前确认两把钥匙都在手：**
- 能访问本开源仓库（公网，任何人都可以）；
- 有私有数据仓库的读写权限（只有站长）。

---

## 场景 A：只换服务器（域名不变）

1. **新服务器装环境**（Ubuntu 22.04 为例）：
   把私有仓库克隆到新服务器，跑一键脚本（装 nginx / certbot / Artalk v2.10 / systemd / web root）：
   ```bash
   git clone git@github.com:xxc2007/nanchang15-memorial-data.git
   cd nanchang15-memorial-data
   bash infra/setup-new-server.sh xxc2007.me
   ```
2. **恢复留言数据**（脚本会在初始化时自动调用，也可单独重跑）：
   ```bash
   bash infra/restore-artalk-data.sh
   ```
3. **DNS 切换**：Cloudflare 把 A 记录指向新服务器 IP（橙色云代理开启，切换几乎无感）。
4. **签发证书**：`sudo certbot --nginx -d xxc2007.me -d www.xxc2007.me`（脚本若未自动完成）。
5. **更新本地 deploy.sh** 第 8 行附近的 `SERVER="xxc@<新IP>"`，此后照常 `bash deploy.sh "..."`。
6. **重建每日备份**：新服务器上重复私有仓库 `infra/README.md` 里的 cron 配置（每日 04:30）。

## 场景 B：只换域名（服务器不变）

1. **DNS**：Cloudflare 添加新域名的 A 记录 → 同一台服务器 IP。
2. **证书**：`sudo certbot --nginx -d 新域名 -d www.新域名 --expand`。
3. **nginx**：`server_name` 加上新域名，`nginx -t && sudo systemctl reload nginx`。
4. **改代码里的域名标识**（SEO/分享用，共 4 个文件 7 处，一条命令找全）：
   ```bash
   grep -rn "xxc2007.me" --include="*.html" --include="*.xml" --include="*.md" .
   ```
   涉及：`index.html` 的 canonical / og:url / og:image / JSON-LD、`sitemap.xml`、双语 README 的徽章与链接。改完提交。
5. **替换旧留言里的头像链接**（存量数据存的是绝对 URL）：
   ```bash
   sudo python3 infra/replace-comment-domain.py https://旧域名 https://新域名 --apply
   ```
   （先不带 `--apply` 预览，确认后再执行；脚本同时兼容 sqlite3 CLI 缺失的情况——用 python3 内置模块。）
6. **可选**：旧域名做 301 跳转到新域名，过渡期给搜索引擎和旧链接留一条路。

## 场景 C：服务器和域名都换

**先做场景 A（搬服务器，用旧域名验证一切正常），再做场景 B（换域名）。**
两步之间随时可以回退，永远不要同时动两边。

---

## 迁移后验收清单

- [ ] `https://新域名/` 返回 200（curl 记得带浏览器 UA，否则 Cloudflare 会拦）
- [ ] 页面滚到底再滚回来：41 张图（含灯箱）零破图
- [ ] 留言墙：加载正常、发一条测试留言、后台能审核（发完删掉）
- [ ] 定位图瓦片正常、时光漫游 8 张大图正常
- [ ] `robots.txt` / `sitemap.xml` 200
- [ ] Artalk 管理后台可登录（`/comment/sidebar/`）
- [ ] 每日备份 cron 在新服务器上跑通一次并确认 GitHub 有新提交
- [ ] 灯箱 Esc/Tab/滚轮缩放正常（键盘可访问性回归）

## 已知坑速查（都是真实踩过的）

| 坑 | 解法 |
|---|---|
| web root 属 `www-data`，直接 `cp` 报 Permission denied | 先 scp 到 `/home/xxc/`，再 `sudo cp` + `sudo chown -R www-data:www-data` |
| deploy.sh 只同步 `index.html + assets/ + robots + sitemap` | 新增目录（如 `images/`、`maplibre/`）必须手动 `scp -r` + `sudo cp` |
| 静态资源引用带 `?v=` 版本参数 | 改了 CSS/JS 忘了 bump 版本号 → CDN 缓存旧文件甚至 404 负响应 |
| 外部 curl 测试被 Cloudflare 拦（403） | 带浏览器 UA：`curl -A "Mozilla/5.0 ... Chrome/126"` |
| 服务器本机 curl Artalk API 404 | 必须带 `-H "Host: 你的域名"`，否则 nginx 按 Host 落到默认站点 |
| 服务器没装 sqlite3 CLI | 用 `sudo python3`（Ubuntu 22.04 内置）直连数据库 |

---

*迁移脚本与数据都在私有仓库 `nanchang15-memorial-data`；本手册只描述流程，不存放任何服务器敏感信息。*
