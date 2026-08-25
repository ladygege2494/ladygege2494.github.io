#!/usr/bin/env python3
"""Convert Obsidian wiki links in the publish copy to portable Markdown."""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PROJECTS = ("tech", "business", "art", "journey")
EMBED = re.compile(r"!\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]")
LINK = re.compile(r"(?<!!)\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]")
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".avif"}


def find_target(docs_root: Path, source_file: Path, raw_target: str) -> Path | None:
    target_text = raw_target.strip().replace("\\", "/")
    candidates = [source_file.parent / target_text, docs_root / target_text]

    if not Path(target_text).suffix:
        candidates.extend([source_file.parent / f"{target_text}.md", docs_root / f"{target_text}.md"])

    for candidate in candidates:
        if candidate.is_file():
            return candidate.resolve()

    basename = Path(target_text).name
    matches = [path.resolve() for path in docs_root.rglob(basename) if path.is_file()]
    if not Path(target_text).suffix:
        matches.extend(path.resolve() for path in docs_root.rglob(f"{basename}.md") if path.is_file())
    unique_matches = sorted(set(matches))
    return unique_matches[0] if len(unique_matches) == 1 else None


def relative_url(source_file: Path, target: Path) -> str:
    return os.path.relpath(target, source_file.parent).replace(os.sep, "/")


def main() -> int:
    unresolved: list[str] = []
    changed_files = 0

    for project in PROJECTS:
        docs_root = ROOT / "notes" / project / "docs"
        for source_file in sorted(docs_root.rglob("*.md")):
            original = source_file.read_text(encoding="utf-8")

            def replace_embed(match: re.Match[str]) -> str:
                target = find_target(docs_root, source_file, match.group(1))
                if target is None:
                    unresolved.append(f"{source_file.relative_to(ROOT)}: {match.group(0)}")
                    return match.group(0)
                label = (match.group(2) or target.stem).strip()
                url = relative_url(source_file, target)
                if target.suffix.lower() in IMAGE_EXTENSIONS:
                    return f"![{label}]({url})"
                if target.suffix.lower() == ".pdf":
                    return f'<embed src="{url}" type="application/pdf" width="100%" height="600px" />'
                return f"[{label}]({url})"

            def replace_link(match: re.Match[str]) -> str:
                target = find_target(docs_root, source_file, match.group(1))
                if target is None:
                    unresolved.append(f"{source_file.relative_to(ROOT)}: {match.group(0)}")
                    return match.group(0)
                label = (match.group(2) or target.stem).strip()
                return f"[{label}]({relative_url(source_file, target)})"

            updated = EMBED.sub(replace_embed, original)
            updated = LINK.sub(replace_link, updated)
            if updated != original:
                source_file.write_text(updated, encoding="utf-8")
                changed_files += 1

    for item in unresolved:
        print(f"ERROR: 无法解析 {item}", file=sys.stderr)
    print(f"Obsidian 语法规范化完成：修改 {changed_files} 个发布副本")
    return 1 if unresolved else 0


if __name__ == "__main__":
    raise SystemExit(main())
