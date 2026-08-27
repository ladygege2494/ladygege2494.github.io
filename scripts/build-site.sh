#!/usr/bin/env bash
set -Eeuo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE_DIR="$REPO_ROOT/site"
STRICT_ARGS=()

if [[ "${1:-}" == "--strict" ]]; then
  STRICT_ARGS=(--strict)
elif [[ -n "${1:-}" ]]; then
  echo "用法：./scripts/build-site.sh [--strict]" >&2
  exit 2
fi

if [[ -x "$REPO_ROOT/.venv/bin/mkdocs" ]]; then
  MKDOCS="$REPO_ROOT/.venv/bin/mkdocs"
elif command -v mkdocs >/dev/null 2>&1; then
  MKDOCS="$(command -v mkdocs)"
else
  echo "未找到 MkDocs。请先运行 ./scripts/setup.sh" >&2
  exit 1
fi

python3 "$REPO_ROOT/scripts/check_content.py"

if [[ "$SITE_DIR" != "$REPO_ROOT/site" ]]; then
  echo "拒绝清理非预期目录：$SITE_DIR" >&2
  exit 1
fi
rm -rf "$SITE_DIR"
mkdir -p "$SITE_DIR/notes"

for file in index.html script.js styles.css favicon.jpg image1.jpg image2.jpg image3.jpg; do
  [[ -f "$REPO_ROOT/$file" ]] && cp "$REPO_ROOT/$file" "$SITE_DIR/"
done

[[ -d "$REPO_ROOT/assets" ]] && cp -R "$REPO_ROOT/assets" "$SITE_DIR/assets"

for directory in tech art business media journey portfolio about friends; do
  [[ -d "$REPO_ROOT/$directory" ]] && cp -R "$REPO_ROOT/$directory" "$SITE_DIR/$directory"
done

for project in tech business art journey; do
  "$MKDOCS" build \
    --config-file "$REPO_ROOT/notes/$project/mkdocs.yml" \
    --site-dir "$SITE_DIR/notes/$project" \
    "${STRICT_ARGS[@]}"
done

touch "$SITE_DIR/.nojekyll"
echo "完整网站已生成：$SITE_DIR"
