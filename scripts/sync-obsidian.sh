#!/usr/bin/env bash
set -Eeuo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEFAULT_OBSIDIAN_ROOT="/Users/ladygege/Syncthing/Obsidian/个人网站"
OBSIDIAN_ROOT="${OBSIDIAN_ROOT:-$DEFAULT_OBSIDIAN_ROOT}"
BUILD=false
PUSH=false
COMMIT_MESSAGE=""

usage() {
  cat <<'EOF'
用法：./scripts/sync-obsidian.sh [选项]

  --build            同步后构建完整网站
  --push             提交 docs 变更并推送 main，触发 GitHub Pages
  --message TEXT     自定义提交信息
  --source PATH      覆盖 Obsidian“个人网站”目录
  -h, --help         显示帮助

日常发布：./scripts/sync-obsidian.sh --push
重要更新：./scripts/sync-obsidian.sh --build --push
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --build) BUILD=true; shift ;;
    --push) PUSH=true; shift ;;
    --message) COMMIT_MESSAGE="${2:?--message 需要内容}"; shift 2 ;;
    --source) OBSIDIAN_ROOT="${2:?--source 需要路径}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "未知参数：$1" >&2; usage; exit 2 ;;
  esac
done

for command in git rsync python3; do
  command -v "$command" >/dev/null 2>&1 || { echo "缺少命令：$command" >&2; exit 1; }
done

[[ -d "$OBSIDIAN_ROOT" ]] || { echo "找不到 Obsidian 目录：$OBSIDIAN_ROOT" >&2; exit 1; }
[[ "$(git -C "$REPO_ROOT" rev-parse --show-toplevel)" == "$REPO_ROOT" ]] || {
  echo "Git 仓库边界异常：$REPO_ROOT" >&2
  exit 1
}

if $PUSH; then
  if ! git -C "$REPO_ROOT" diff --quiet || ! git -C "$REPO_ROOT" diff --cached --quiet; then
    echo "网站仓库已有未提交修改；请先提交或暂存后再使用 --push。" >&2
    exit 1
  fi
  git -C "$REPO_ROOT" pull --ff-only origin main
fi

sync_one() {
  local source_name="$1"
  local project_name="$2"
  local source="$OBSIDIAN_ROOT/$source_name/"
  local target="$REPO_ROOT/notes/$project_name/docs/"
  [[ -d "$source" ]] || { echo "缺少源目录：$source" >&2; exit 1; }
  mkdir -p "$target"
  rsync -a --delete \
    --exclude '.DS_Store' \
    --exclude '.obsidian/' \
    --exclude 'site/' \
    --exclude '__pycache__/' \
    --exclude '*.tmp' \
    --exclude '*.bak' \
    "$source" "$target"
  echo "已同步：$source_name → notes/$project_name/docs"
}

sync_one "技术笔记" "tech"
sync_one "商业笔记" "business"
sync_one "文艺笔记" "art"
sync_one "一路走来" "journey"

OBSIDIAN_VAULT_ROOT="$(dirname "$OBSIDIAN_ROOT")" \
  python3 "$REPO_ROOT/scripts/normalize_obsidian.py"
python3 "$REPO_ROOT/scripts/check_content.py"

if $BUILD; then
  "$REPO_ROOT/scripts/build-site.sh" --strict
fi

if $PUSH; then
  git -C "$REPO_ROOT" add notes/tech/docs notes/business/docs notes/art/docs notes/journey/docs
  if git -C "$REPO_ROOT" diff --cached --quiet; then
    echo "没有需要发布的笔记变更。"
    exit 0
  fi
  if [[ -z "$COMMIT_MESSAGE" ]]; then
    COMMIT_MESSAGE="docs: sync from Obsidian $(date '+%Y-%m-%d %H:%M')"
  fi
  git -C "$REPO_ROOT" commit -m "$COMMIT_MESSAGE"
  git -C "$REPO_ROOT" push origin main
  echo "已推送。GitHub Actions 将在数分钟内更新 https://ladygege2494.github.io/"
else
  echo "同步完成但尚未推送。发布请运行：./scripts/sync-obsidian.sh --push"
fi
