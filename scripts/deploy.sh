#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node --test "tests/*.test.mjs"
node scripts/check-vendor.mjs
node scripts/check-static.mjs
git push origin HEAD:main
node tools/deploy-release.mjs nc15
