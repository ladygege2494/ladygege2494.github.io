#!/usr/bin/env bash
set -Eeuo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
"$REPO_ROOT/scripts/build-site.sh" --strict
echo "本地预览：http://127.0.0.1:8000"
exec python3 -m http.server 8000 --directory "$REPO_ROOT/site"
