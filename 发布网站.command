#!/usr/bin/env bash
set -Eeuo pipefail

REPO_ROOT="/Users/ladygege/MyWebsite"

finish() {
  local exit_code=$?
  trap - EXIT
  set +e
  echo
  if [[ $exit_code -eq 0 ]]; then
    echo "发布命令执行完成。GitHub 通常还需要 2～5 分钟更新线上网站。"
    echo "网站地址：https://ladygege2494.github.io/"
  else
    echo "发布未完成（错误码：$exit_code）。请根据上方提示修正后重试。"
  fi
  echo
  if [[ -t 0 ]]; then
    read -r -n 1 -p "按任意键关闭窗口……" _
    echo
  fi
  exit "$exit_code"
}

trap finish EXIT

if [[ ! -d "$REPO_ROOT/.git" ]]; then
  echo "找不到网站仓库：$REPO_ROOT"
  exit 1
fi

cd "$REPO_ROOT"
echo "正在检查、构建并发布 GegeNook……"
echo
./scripts/sync-obsidian.sh --build --push
