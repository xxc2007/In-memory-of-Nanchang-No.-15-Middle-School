# 🧳 Migration Guide

> This guide answers one question: **how do I move this memorial site to a new server and/or a new domain?**
> Written 2026-09-07 against the live setup of that date. Re-verify paths and versions before using it later.

## 0. The three pieces you are moving

| Piece | Lives in | Contents |
|---|---|---|
| ① The site itself | **This repo** (open source) | Complete mirror of pages / images / code. `git clone` is the whole site — zero build steps |
| ② Guestbook data | **Private repo `xxc2007/nanchang15-memorial-data`** | `artalk.db` (SQLite) + `artalk-img/` (avatars) + `artalk.yml` (service config); auto-pushed daily at 04:30 |
| ③ Infra scripts | **`infra/` folder of the private repo** | nginx site template, one-shot server bootstrap, data restore, domain-replace script |

> ⚠️ The private repo contains commenter IPs and server details — **never make it public**.

**Have both keys ready:** access to this open repo (public), and read/write on the private data repo (owner only).

---

## Scenario A: New server only (domain unchanged)

1. **Bootstrap the new server** (Ubuntu 22.04): clone the private repo and run the one-shot script (installs nginx / certbot / Artalk v2.10 / systemd / web root):
   ```bash
   git clone git@github.com:xxc2007/nanchang15-memorial-data.git
   cd nanchang15-memorial-data
   bash infra/setup-new-server.sh xxc2007.me
   ```
2. **Restore guestbook data** (called automatically by the bootstrap; can be re-run standalone):
   ```bash
   bash infra/restore-artalk-data.sh
   ```
3. **DNS cutover**: point the Cloudflare A record to the new server IP (proxy on, cutover is seamless).
4. **Certificate**: `sudo certbot --nginx -d xxc2007.me -d www.xxc2007.me` if the bootstrap didn't already.
5. **Update `deploy.sh`**: set `SERVER="xxc@<new IP>"`, then keep deploying as usual.
6. **Rebuild the daily backup**: re-create the 04:30 cron on the new server (see `infra/README.md` in the private repo).

## Scenario B: New domain only (server unchanged)

1. **DNS**: add the new domain's A record in Cloudflare → same server IP.
2. **Certificate**: `sudo certbot --nginx -d new.domain -d www.new.domain --expand`.
3. **nginx**: append the new domain to `server_name`, then `nginx -t && sudo systemctl reload nginx`.
4. **Update domain identity in code** (SEO/sharing, 4 files): find them all with
   ```bash
   grep -rn "xxc2007.me" --include="*.html" --include="*.xml" --include="*.md" .
   ```
   Covers canonical / og:url / og:image / JSON-LD in `index.html`, `sitemap.xml`, and README badges. Commit the changes.
5. **Rewrite avatar links stored in old comments** (legacy rows hold absolute URLs):
   ```bash
   sudo python3 infra/replace-comment-domain.py https://old.domain https://new.domain --apply
   ```
   (Preview without `--apply` first. Uses Python's built-in sqlite3 — no sqlite3 CLI needed.)
6. **Optional**: keep the old domain as a 301 redirect during a transition window.

## Scenario C: Both server and domain

**Do Scenario A first (migrate the server, verify everything under the old domain), then Scenario B.**
Each step is reversible; never change both sides at once.

---

## Post-migration checklist

- [ ] `https://<domain>/` returns 200 (curl needs a browser UA or Cloudflare blocks it)
- [ ] Scroll the full page: all 41 images (incl. lightbox) load, zero broken
- [ ] Guestbook: loads, post a test comment, moderate it in the admin (then delete it)
- [ ] Location map tiles + 8-photo tour all render
- [ ] `robots.txt` / `sitemap.xml` return 200
- [ ] Artalk admin (`/comment/sidebar/`) login works
- [ ] Daily backup cron ran once on the new server and a fresh commit appeared on GitHub
- [ ] Lightbox Esc / Tab / wheel-zoom regression pass

## Known pitfalls (all real, all bitten once)

| Pitfall | Fix |
|---|---|
| Web root owned by `www-data`; plain `cp` fails | scp to `/home/xxc/` first, then `sudo cp` + `sudo chown -R www-data:www-data` |
| `deploy.sh` syncs only `index.html + assets/ + robots + sitemap` | New directories (`images/`, `maplibre/`, …) need a manual `scp -r` + `sudo cp` |
| Asset URLs carry a `?v=` cache-buster | Forgetting to bump it → CDN serves stale files (or a cached 404) |
| External curl gets Cloudflare 403 | Send a browser UA: `curl -A "Mozilla/5.0 … Chrome/126"` |
| Local curl to the Artalk API 404s on the server | Add `-H "Host: your.domain"` or nginx falls back to the default site |
| Server has no `sqlite3` CLI | Use `sudo python3` (built into Ubuntu 22.04) |

---

*Scripts and data live in the private repo `nanchang15-memorial-data`; this guide documents the process only and holds no server secrets.*
