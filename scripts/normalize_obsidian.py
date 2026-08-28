#!/usr/bin/env python3
"""Convert Obsidian wiki links in the publish copy to portable Markdown."""

from __future__ import annotations

import os
import re
import shutil
import sys
from functools import lru_cache
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PROJECTS = ("tech", "business", "art", "journey")
EMBED = re.compile(r"!\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]")
LINK = re.compile(r"(?<!!)\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]")
NESTED_MARKDOWN_LINK = re.compile(
    r"\[([^\]]+)\]\(\[(https?://[^\]]+)\]\((https?://[^)]+)\)\)"
)
HTML_EMBED_SRC = re.compile(
    r"(<embed\s+[^>]*src=[\"'])([^\"']+)([\"'])", re.IGNORECASE
)
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".avif"}
ALLOWLIST_FILE = ROOT / "scripts" / "obsidian-external-assets.txt"
VAULT_ROOT = Path(os.environ["OBSIDIAN_VAULT_ROOT"]).resolve() if os.environ.get("OBSIDIAN_VAULT_ROOT") else None
COPIED_ATTACHMENTS: set[Path] = set()
PROMOTED_SECTION_INDEXES: set[Path] = set()


def load_external_allowlist() -> frozenset[str]:
    if not ALLOWLIST_FILE.is_file():
        return frozenset()
    return frozenset(
        line.strip()
        for line in ALLOWLIST_FILE.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    )


ALLOWED_EXTERNAL_ASSETS = load_external_allowlist()
LEGACY_PATH_ALIASES = {"电设实验i": "电子电路设计实验i"}


def promote_section_indexes(docs_root: Path) -> None:
    """Map `Topic.md` + `Topic/*.md` to a MkDocs section index in the publish copy."""
    candidates = []
    for markdown_file in docs_root.rglob("*.md"):
        section_directory = markdown_file.with_suffix("")
        if section_directory.is_dir() and any(section_directory.rglob("*.md")):
            candidates.append((markdown_file, section_directory / "index.md"))
    for source, destination in candidates:
        if destination.exists():
            raise RuntimeError(f"章节首页冲突：{source} 与 {destination} 同时存在")
        content = source.read_text(encoding="utf-8")
        escaped_title = source.stem.replace("\\", "\\\\").replace('"', '\\"')
        title_line = f'title: "{escaped_title}"'
        if content.startswith("---\n"):
            closing = content.find("\n---\n", 4)
            front_matter = content[4:closing] if closing != -1 else ""
            if closing != -1 and not re.search(r"(?m)^title\s*:", front_matter):
                content = f"---\n{title_line}\n{content[4:]}"
        else:
            content = f"---\n{title_line}\n---\n\n{content}"
        source.write_text(content, encoding="utf-8")
        source.replace(destination)
        PROMOTED_SECTION_INDEXES.add(destination.resolve())


@lru_cache(maxsize=None)
def indexed_files(docs_root: Path) -> tuple[Path, ...]:
    return tuple(path.resolve() for path in docs_root.rglob("*") if path.is_file())


def find_unique_suffix(docs_root: Path, target_text: str) -> Path | None:
    """Resolve old vault-qualified links by their longest unique trailing path."""
    resolved_root = docs_root.resolve()
    target_parts = Path(target_text).parts
    files = indexed_files(resolved_root)
    for suffix_length in range(len(target_parts), 1, -1):
        suffix = target_parts[-suffix_length:]
        matches = []
        for path in files:
            relative_parts = path.relative_to(resolved_root).parts
            if len(relative_parts) >= suffix_length and relative_parts[-suffix_length:] == suffix:
                matches.append(path)
        if len(matches) == 1:
            return matches[0]
    return None


def copy_allowed_external_attachment(docs_root: Path, target_text: str) -> Path | None:
    """Copy only explicitly approved files from the surrounding Obsidian vault."""
    if VAULT_ROOT is None or target_text not in ALLOWED_EXTERNAL_ASSETS:
        return None
    relative = Path(target_text)
    if relative.is_absolute() or ".." in relative.parts:
        return None
    source = (VAULT_ROOT / relative).resolve()
    try:
        source.relative_to(VAULT_ROOT)
    except ValueError:
        return None
    if not source.is_file():
        return None
    destination = docs_root / "_assets" / "external" / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)
    resolved = destination.resolve()
    COPIED_ATTACHMENTS.add(resolved)
    return resolved


def find_target(docs_root: Path, source_file: Path, raw_target: str) -> Path | None:
    target_text = raw_target.strip().replace("\\", "/")
    candidates = [source_file.parent / target_text, docs_root / target_text]

    if not Path(target_text).suffix:
        candidates.extend(
            [
                source_file.parent / f"{target_text}.md",
                docs_root / f"{target_text}.md",
                source_file.parent / target_text / "index.md",
                docs_root / target_text / "index.md",
            ]
        )

    for candidate in candidates:
        if candidate.is_file():
            return candidate.resolve()

    suffix_match = find_unique_suffix(docs_root, target_text)
    if suffix_match is not None:
        return suffix_match

    basename = Path(target_text).name
    matches = [path.resolve() for path in docs_root.rglob(basename) if path.is_file()]
    if not Path(target_text).suffix:
        matches.extend(path.resolve() for path in docs_root.rglob(f"{basename}.md") if path.is_file())
    unique_matches = sorted(set(matches))
    if len(unique_matches) == 1:
        return unique_matches[0]
    return copy_allowed_external_attachment(docs_root, target_text)


def relative_url(source_file: Path, target: Path) -> str:
    return os.path.relpath(target, source_file.parent).replace(os.sep, "/")


def rendered_page_relative_url(source_file: Path, target: Path) -> str:
    """Return a URL relative to MkDocs' final clean-URL output directory."""
    output_directory = source_file.parent if source_file.name == "index.md" else source_file.parent / source_file.stem
    return os.path.relpath(target, output_directory).replace(os.sep, "/")


def main() -> int:
    unresolved: list[str] = []
    changed_files = 0

    for project in PROJECTS:
        docs_root = ROOT / "notes" / project / "docs"
        promote_section_indexes(docs_root)
        for source_file in sorted(docs_root.rglob("*.md")):
            original = source_file.read_text(encoding="utf-8")

            def replace_embed(match: re.Match[str]) -> str:
                target = find_target(docs_root, source_file, match.group(1))
                if target is None:
                    unresolved.append(f"{source_file.relative_to(ROOT)}: {match.group(0)}")
                    return match.group(0)
                default_label = Path(match.group(1).strip()).name if target.name == "index.md" else target.stem
                label = (match.group(2) or default_label).strip()
                url = relative_url(source_file, target)
                if target.suffix.lower() in IMAGE_EXTENSIONS:
                    return f"![{label}]({url})"
                if target.suffix.lower() == ".pdf":
                    rendered_url = rendered_page_relative_url(source_file, target)
                    return f'<embed src="{rendered_url}" type="application/pdf" width="100%" height="600px" />'
                return f"[{label}]({url})"

            def replace_link(match: re.Match[str]) -> str:
                target = find_target(docs_root, source_file, match.group(1))
                if target is None:
                    unresolved.append(f"{source_file.relative_to(ROOT)}: {match.group(0)}")
                    return match.group(0)
                default_label = Path(match.group(1).strip()).name if target.name == "index.md" else target.stem
                label = (match.group(2) or default_label).strip()
                return f"[{label}]({relative_url(source_file, target)})"

            def replace_html_embed(match: re.Match[str]) -> str:
                raw_target = match.group(2).strip()
                if raw_target.startswith(("http://", "https://", "data:")):
                    return match.group(0)
                output_directory = (
                    source_file.parent
                    if source_file.name == "index.md"
                    else source_file.parent / source_file.stem
                )
                if (output_directory / raw_target).resolve().is_file():
                    return match.group(0)
                aliased_target = raw_target
                for old_name, new_name in LEGACY_PATH_ALIASES.items():
                    aliased_target = aliased_target.replace(old_name, new_name)
                aliased_path = (output_directory / aliased_target).resolve()
                if aliased_path.is_file():
                    url = rendered_page_relative_url(source_file, aliased_path)
                    return f"{match.group(1)}{url}{match.group(3)}"
                target = find_target(docs_root, source_file, raw_target)
                if target is None:
                    return match.group(0)
                url = rendered_page_relative_url(source_file, target)
                return f"{match.group(1)}{url}{match.group(3)}"

            updated = NESTED_MARKDOWN_LINK.sub(r"[\1](\3)", original)
            updated = EMBED.sub(replace_embed, updated)
            updated = LINK.sub(replace_link, updated)
            updated = HTML_EMBED_SRC.sub(replace_html_embed, updated)
            if updated != original:
                source_file.write_text(updated, encoding="utf-8")
                changed_files += 1

    for item in unresolved:
        print(f"ERROR: 无法解析 {item}", file=sys.stderr)
    print(
        f"Obsidian 语法规范化完成：修改 {changed_files} 个发布副本，"
        f"生成 {len(PROMOTED_SECTION_INDEXES)} 个章节首页，"
        f"复制 {len(COPIED_ATTACHMENTS)} 个已授权库外附件"
    )
    return 1 if unresolved else 0


if __name__ == "__main__":
    raise SystemExit(main())
