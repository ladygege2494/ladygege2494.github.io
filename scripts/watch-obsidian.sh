#!/usr/bin/env bash
set -Eeuo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OBSIDIAN_ROOT="${OBSIDIAN_ROOT:-/Users/ladygege/Syncthing/Obsidian/个人网站}"
POLL_INTERVAL="${POLL_INTERVAL:-15}"
DEBOUNCE_SECONDS="${DEBOUNCE_SECONDS:-90}"

fingerprint() {
  find \
    "$OBSIDIAN_ROOT/技术笔记" \
    "$OBSIDIAN_ROOT/商业笔记" \
    "$OBSIDIAN_ROOT/文艺笔记" \
    "$OBSIDIAN_ROOT/一路走来" \
    -type f ! -name '.DS_Store' -exec stat -f '%m %z %N' {} + 2>/dev/null \
    | LC_ALL=C sort | shasum -a 256 | awk '{print $1}'
}

echo "正在监听 Obsidian；检测到修改后等待 ${DEBOUNCE_SECONDS} 秒再自动发布。按 Ctrl+C 停止。"
previous="$(fingerprint)"
while true; do
  sleep "$POLL_INTERVAL"
  current="$(fingerprint)"
  if [[ "$current" != "$previous" ]]; then
    echo "检测到修改，等待写入稳定……"
    sleep "$DEBOUNCE_SECONDS"
    current="$(fingerprint)"
    if "$REPO_ROOT/scripts/sync-obsidian.sh" --push; then
      previous="$current"
    else
      echo "自动发布失败；修复后再次保存任一笔记即可重试。" >&2
    fi
  fi
done
