#!/usr/bin/env python3
"""Generate the public friend-link list from Obsidian/个人网站/友链.md."""

from __future__ import annotations

import argparse
import json
import os
import re
from pathlib import Path
from urllib.parse import urlparse


MARKDOWN_LINK_RE = re.compile(r"\[([^\]]+)\]\((https?://[^)]+)\)")
PLAIN_URL_RE = re.compile(r"https?://\S+")
SECOND_LEVEL_HEADING_RE = re.compile(r"^##\s+(.+?)\s*$")
SCHEMELESS_DOMAIN_RE = re.compile(
    r"(?i)(?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?(?:/[^\s]*)?(?:\?[^\s]*)?"
)


def normalize_url(raw: str) -> str:
    value = raw.strip().rstrip("，。；;,)")
    if not value.startswith(("http://", "https://")):
        value = "https://" + value
    parsed = urlparse(value)
    if not parsed.hostname or "." not in parsed.hostname:
        raise ValueError(f"无法识别友链网址：{raw}")
    return value


def parse_line(line: str, line_number: int) -> dict[str, str] | None:
    value = line.strip()
    if not value or value.startswith("#"):
        return None

    markdown_match = MARKDOWN_LINK_RE.search(value)
    if markdown_match:
        prefix = value[: markdown_match.start()].strip()
        name = prefix or markdown_match.group(1).strip()
        return {"name": name, "url": normalize_url(markdown_match.group(2))}

    plain_match = PLAIN_URL_RE.search(value)
    if plain_match:
        name = value[: plain_match.start()].strip()
        if not name:
            raise ValueError(f"友链第 {line_number} 行缺少名称：{line}")
        return {"name": name, "url": normalize_url(plain_match.group(0))}

    parts = value.split()
    for index in range(1, len(parts)):
        # 兼容为了排版加入空格的域名，例如 "name. github. io"；同时保留名称中的空格和年级。
        domain = "".join(parts[index:]).rstrip("，。；;,")
        if SCHEMELESS_DOMAIN_RE.fullmatch(domain):
            name = " ".join(parts[:index]).strip()
            return {"name": name, "url": normalize_url(domain)}
    raise ValueError(f"无法解析友链第 {line_number} 行：{line}")


def clean_heading(value: str) -> str:
    value = value.strip()
    value = re.sub(r"\*\*(.*?)\*\*", r"\1", value)
    value = re.sub(r"__(.*?)__", r"\1", value)
    value = re.sub(r"`([^`]+)`", r"\1", value)
    return value.strip()


def write_if_changed(path: Path, data: object) -> None:
    content = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    if path.exists() and path.read_text(encoding="utf-8") == content:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="从 Obsidian 友链.md 生成网页友链数据")
    parser.add_argument(
        "--source",
        default=os.environ.get("OBSIDIAN_FRIENDS", "/Users/ladygege/Syncthing/Obsidian/个人网站/友链.md"),
        help="Obsidian 友链 Markdown 文件",
    )
    parser.add_argument(
        "--target",
        default=str(Path(__file__).resolve().parents[1] / "friends" / "friends.json"),
        help="生成的 friends.json",
    )
    args = parser.parse_args()

    source = Path(args.source).expanduser().resolve()
    target = Path(args.target).expanduser().resolve()
    if not source.is_file():
        raise SystemExit(f"找不到友链源文件：{source}")

    groups: list[dict[str, object]] = []
    current_group: dict[str, object] | None = None
    friends: list[dict[str, str]] = []
    seen_names: set[str] = set()
    seen_urls: set[str] = set()
    seen_group_titles: set[str] = set()
    for line_number, line in enumerate(source.read_text(encoding="utf-8").splitlines(), start=1):
        heading_match = SECOND_LEVEL_HEADING_RE.match(line.strip())
        if heading_match:
            title = clean_heading(heading_match.group(1))
            if not title:
                raise SystemExit(f"友链第 {line_number} 行的二级标题为空")
            if title in seen_group_titles:
                raise SystemExit(f"友链分组名称重复：{title}")
            current_group = {"title": title, "friends": []}
            groups.append(current_group)
            seen_group_titles.add(title)
            continue
        friend = parse_line(line, line_number)
        if friend is None:
            continue
        if friend["name"] in seen_names:
            raise SystemExit(f"友链名称重复：{friend['name']}")
        if friend["url"] in seen_urls:
            raise SystemExit(f"友链网址重复：{friend['url']}")
        seen_names.add(friend["name"])
        seen_urls.add(friend["url"])
        friends.append(friend)
        if current_group is None:
            current_group = {"title": "其他友链", "friends": []}
            groups.append(current_group)
            seen_group_titles.add("其他友链")
        current_friends = current_group["friends"]
        assert isinstance(current_friends, list)
        current_friends.append(friend)

    groups = [group for group in groups if group["friends"]]
    write_if_changed(target, {"groups": groups, "friends": friends})
    print(f"友链已生成：{len(groups)} 个分组，{len(friends)} 个网站")


if __name__ == "__main__":
    main()
