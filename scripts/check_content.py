#!/usr/bin/env python3
"""Validate publishable Markdown and local asset references."""

from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.parse import unquote


ROOT = Path(__file__).resolve().parents[1]
DOCS_ROOTS = tuple((ROOT / "notes" / name / "docs") for name in ("tech", "business", "art", "journey"))
WIKI_LINK = re.compile(r"!?\[\[[^\]]+\]\]")
MARKDOWN_IMAGE = re.compile(r"!\[[^\]]*\]\(([^)]+)\)")
HTML_EMBED = re.compile(r"<embed\s+[^>]*src=[\"']([^\"']+)[\"']", re.IGNORECASE)
REMOTE_PREFIXES = ("http://", "https://", "data:", "mailto:", "#")


def local_target(base_directory: Path, raw_target: str) -> Path | None:
    target = unquote(raw_target.strip().strip("<>"))
    if not target or target.startswith(REMOTE_PREFIXES):
        return None
    target = target.split("#", 1)[0].split("?", 1)[0]
    return (base_directory / target).resolve()


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []
    markdown_count = 0
    reference_count = 0

    for docs_root in DOCS_ROOTS:
        if not docs_root.is_dir():
            errors.append(f"缺少文档目录：{docs_root.relative_to(ROOT)}")
            continue

        for markdown_file in sorted(docs_root.rglob("*.md")):
            markdown_count += 1
            content = markdown_file.read_text(encoding="utf-8")
            relative_file = markdown_file.relative_to(ROOT)

            for match in WIKI_LINK.finditer(content):
                line = content.count("\n", 0, match.start()) + 1
                errors.append(f"{relative_file}:{line} 仍含 Obsidian Wiki 链接：{match.group(0)}")

            for match in MARKDOWN_IMAGE.finditer(content):
                reference_count += 1
                target = local_target(markdown_file.parent, match.group(1))
                if target is not None and not target.is_file():
                    line = content.count("\n", 0, match.start()) + 1
                    errors.append(f"{relative_file}:{line} 找不到附件：{match.group(1)}")

            output_directory = markdown_file.parent if markdown_file.name == "index.md" else markdown_file.parent / markdown_file.stem
            for match in HTML_EMBED.finditer(content):
                reference_count += 1
                target = local_target(output_directory, match.group(1))
                if target is not None and not target.is_file():
                    line = content.count("\n", 0, match.start()) + 1
                    errors.append(f"{relative_file}:{line} 找不到嵌入附件：{match.group(1)}")

        for asset in docs_root.rglob("*"):
            if asset.is_file() and asset.stat().st_size >= 90 * 1024 * 1024:
                warnings.append(
                    f"大文件 {asset.relative_to(ROOT)}：{asset.stat().st_size / 1024 / 1024:.1f} MiB"
                )

    generated = sorted((ROOT / "notes").glob("*/site"))
    if generated:
        errors.extend(f"不应提交构建产物目录：{path.relative_to(ROOT)}" for path in generated)

    for warning in warnings:
        print(f"WARNING: {warning}")
    for error in errors:
        print(f"ERROR: {error}", file=sys.stderr)

    print(f"检查完成：{markdown_count} 个 Markdown 文件，{reference_count} 个本地附件引用")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
