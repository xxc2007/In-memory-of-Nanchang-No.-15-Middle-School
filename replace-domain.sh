#!/usr/bin/env bash
# =============================================================================
# 换域名一键替换 · 青山湖畔的纪念册
# -----------------------------------------------------------------------------
# 换域名（MIGRATION.md 场景 B 第 4 步）时，站点里有大量域名标识需要同步改写：
#   十个语言页各 16 处（canonical / hreflang×12 / og:url / og:image / JSON-LD / 页脚签名）
#   sitemap.xml 的 URL 与交替链接、robots.txt 的 Sitemap 声明、404.html 页脚签名、
#   assets/wall.js 的匿名邮箱域、双语 README、迁移手册自身的示例命令。
# 手工改极易漏（漏了会出现「新域名页面里指向旧域名的 canonical」，很伤 SEO）。
#
# 用法：
#   bash replace-domain.sh                             # 预览：只列出会改哪些文件、各多少行
#   bash replace-domain.sh 新域名                        # 预览：旧域名默认 xxc2007.me
#   bash replace-domain.sh 新域名 --apply                # 执行替换
#   bash replace-domain.sh 旧域名 新域名 --apply          # 全新旧域名都自定义
#
# 只改站点源码，不动留言数据。留言存量里的绝对 URL（头像链接）请另行执行
# 私有仓库的 infra/replace-comment-domain.py。
# =============================================================================
set -euo pipefail

OLD_DEFAULT="xxc2007.me"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ---------- 参数解析 ----------
APPLY=0
ARGS=()
for a in "$@"; do
  case "$a" in
    --apply|-y) APPLY=1 ;;
    --help|-h)
      sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *) ARGS+=("$a") ;;
  esac
done

case "${#ARGS[@]}" in
  0) OLD="$OLD_DEFAULT"; NEW="" ;;
  1) OLD="$OLD_DEFAULT"; NEW="${ARGS[0]}" ;;
  *) OLD="${ARGS[0]}"; NEW="${ARGS[1]}" ;;
esac

if [ -z "$NEW" ]; then
  echo "用法：bash replace-domain.sh [旧域名] <新域名> [--apply]"
  echo "例如：bash replace-domain.sh example.com --apply"
  exit 1
fi

# 去掉可能被误输入的前缀，只保留裸域名
NEW="${NEW#http://}"; NEW="${NEW#https://}"; NEW="${NEW%%/*}"
OLD="${OLD#http://}"; OLD="${OLD#https://}"; OLD="${OLD%%/*}"

echo "=============================================="
echo " 换域名替换： $OLD  →  $NEW"
echo " 模式：       $([ "$APPLY" = "1" ] && echo '执行替换' || echo '预览（不改动文件）')"
echo " 范围：       站点源码 *.html *.xml *.md *.js *.txt"
echo "=============================================="

# ---------- 找出会被改动的文件 ----------
mapfile -t FILES < <(grep -rl --include='*.html' --include='*.xml' --include='*.md' \
  --include='*.js' --include='*.txt' -- "$OLD" . 2>/dev/null | sed 's|^\./||' | sort)

if [ "${#FILES[@]}" -eq 0 ]; then
  echo "没有找到包含「$OLD」的文件——可能已经替换过了。"
  exit 0
fi

TOTAL=0
for f in "${FILES[@]}"; do
  n=$(grep -c -- "$OLD" "$f" || true)
  TOTAL=$((TOTAL + n))
  printf "  %-42s %3s 行\n" "$f" "$n"
done
echo "----------------------------------------------"
echo " 合计：${#FILES[@]} 个文件 / $TOTAL 行"
echo

if [ "$APPLY" != "1" ]; then
  echo "以上为预览。确认无误后加 --apply 执行："
  echo "  bash replace-domain.sh $NEW --apply"
  echo
  echo "执行后建议："
  echo "  1) git diff 逐项核对（尤其是 canonical / og:url / sitemap）"
  echo "  2) bash deploy.sh \"chore: 换域名为 $NEW\" 部署"
  echo "  3) 存量留言头像链接另行处理：python3 <私有仓库>/infra/replace-comment-domain.py"
  exit 0
fi

# ---------- 执行替换 ----------
# 用 | 作分隔符，避免域名里可能出现的 / 造成转义问题
for f in "${FILES[@]}"; do
  sed -i.bak "s|$OLD|$NEW|g" "$f"
  rm -f "$f.bak"
done

echo "✅ 已替换 ${#FILES[@]} 个文件 / $TOTAL 行"
echo
echo "下一步："
echo "  1) git diff --stat 核对改动范围"
echo "  2) grep -rn \"$OLD\" --include='*.html' --include='*.xml' .   # 应无输出"
echo "  3) bash deploy.sh \"chore: 换域名为 $NEW\""
echo "  4) 新域名证书：sudo certbot --nginx -d $NEW -d www.$NEW --expand"
echo "  5) nginx server_name 加入新域名，reload"
echo "  6) 存量留言头像链接：python3 <私有仓库>/infra/replace-comment-domain.py \\"
echo "       https://$OLD https://$NEW --apply"
