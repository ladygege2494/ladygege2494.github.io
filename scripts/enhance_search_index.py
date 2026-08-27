#!/usr/bin/env python3
"""Add compact Chinese n-grams to a Material search index.

Jieba supplies word-level segmentation. These hidden tag tokens additionally
allow a reader to find a longer Chinese term by entering a meaningful 2-4
character fragment, e.g. “电路” for “电子电路基础”.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


HAN_SEQUENCE = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff]+")


def chinese_ngrams(value: str) -> set[str]:
    value = value.replace("\u200b", "")
    tokens: set[str] = set()
    for sequence in HAN_SEQUENCE.findall(value):
        for size in range(2, min(4, len(sequence)) + 1):
            tokens.update(
                sequence[index : index + size]
                for index in range(len(sequence) - size + 1)
            )
    return tokens


def enhance(path: Path) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    total = 0
    for document in data.get("docs", []):
        source = f"{document.get('title', '')} {document.get('text', '')}"
        tags = sorted(chinese_ngrams(source))
        if tags:
            document["tags"] = tags
            total += len(tags)

    path.write_text(
        json.dumps(data, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(f"增强中文搜索：{path}（{total} 个片段词）")


def main() -> int:
    if len(sys.argv) != 2:
        print("用法：enhance_search_index.py SEARCH_INDEX_JSON", file=sys.stderr)
        return 2
    path = Path(sys.argv[1]).resolve()
    if not path.is_file() or path.name != "search_index.json":
        print(f"无效搜索索引：{path}", file=sys.stderr)
        return 2
    enhance(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
