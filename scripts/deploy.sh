#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
[ -z "$(git status --porcelain)" ] || { echo "Commit the reviewed release before publishing"; exit 1; }
node scripts/prepare-release.mjs --check
node --test "tests/*.test.mjs"
node scripts/check-vendor.mjs
node scripts/check-static.mjs
git push origin HEAD:main
node tools/deploy-release.mjs nc15
