#!/usr/bin/env python3
"""Generate the public portfolio data from the Obsidian portfolio folder."""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
from pathlib import Path
from urllib.parse import quote


PROJECT_EMBED_RE = re.compile(r"!\[\[([^\]|#]+)(?:\|[^\]]+)?\]\]")
MARKDOWN_LINK_RE = re.compile(r"\[([^\]]+)\]\((https?://[^)]+)\)")
BARE_URL_RE = re.compile(r"(?<!\()https?://[^\s<>]+")
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}
VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov", ".m4v"}
DOCUMENT_EXTENSIONS = {".pdf"}
VIDEO_TRANSCODE_THRESHOLD = 25_000_000
VIDEO_PUBLISH_LIMIT = 95_000_000
GALLERY_DIRECTORIES = {
    "design": ("美工设计", "视觉设计"),
    "photography": ("摄影", "摄影作品"),
    "video": ("视频", "视频摄影"),
}


def clean_inline_markdown(value: str) -> str:
    value = value.strip()
    value = re.sub(r"\*\*(.*?)\*\*", r"\1", value)
    value = re.sub(r"__(.*?)__", r"\1", value)
    value = re.sub(r"`([^`]+)`", r"\1", value)
    return value.strip()


def asset_url(path: Path, root: Path) -> str:
    return "/".join(quote(part) for part in path.relative_to(root).parts)


def write_json_if_changed(path: Path, data: object) -> None:
    content = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    if path.exists() and path.read_text(encoding="utf-8") == content:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def locate_asset(source_root: Path, filename: str) -> Path:
    direct_candidates = (
        source_root / filename,
        source_root / "assets" / filename,
        source_root / "assets" / "我的项目" / filename,
    )
    for candidate in direct_candidates:
        if candidate.is_file():
            return candidate

    matches = [path for path in source_root.rglob(Path(filename).name) if path.is_file()]
    if len(matches) == 1:
        return matches[0]
    if not matches:
        raise FileNotFoundError(f"作品集引用的附件不存在：{filename}")
    raise RuntimeError(f"作品集附件名称不唯一，请使用不同文件名：{filename}")


def unique_destination(directory: Path, filename: str) -> Path:
    candidate = directory / filename
    index = 2
    while candidate.exists():
        candidate = directory / f"{Path(filename).stem}-{index}{Path(filename).suffix.lower()}"
        index += 1
    return candidate


def extract_links(lines: list[str]) -> list[dict[str, str]]:
    links: list[dict[str, str]] = []
    seen: set[str] = set()
    for line in lines:
        for label, url in MARKDOWN_LINK_RE.findall(line):
            if url not in seen:
                links.append({"label": clean_inline_markdown(label), "url": url})
                seen.add(url)
        without_markdown_links = MARKDOWN_LINK_RE.sub("", line)
        for url in BARE_URL_RE.findall(without_markdown_links):
            url = url.rstrip(".,，。；;)")
            if url not in seen:
                links.append({"label": "查看链接", "url": url})
                seen.add(url)
    return links


def extract_description(lines: list[str]) -> str:
    paragraphs: list[str] = []
    current: list[str] = []
    for raw_line in lines:
        line = PROJECT_EMBED_RE.sub("", raw_line).strip()
        line = MARKDOWN_LINK_RE.sub(lambda match: match.group(1), line)
        line = BARE_URL_RE.sub("", line).strip()
        line = clean_inline_markdown(line)
        if re.fullmatch(
            r"(?:论文链接|项目仓库|项目地址|仓库|链接|演示视频|视频|海报|论文PDF|PDF|我们的工作|作品实物图)[：:]?",
            line,
        ):
            continue
        if not line:
            if current:
                paragraphs.append(" ".join(current))
                current = []
            continue
        if re.match(r"^\d+[.、]\s*", line):
            if current:
                paragraphs.append(" ".join(current))
                current = []
            paragraphs.append(line)
            continue
        current.append(line)
    if current:
        paragraphs.append(" ".join(current))
    return "\n\n".join(paragraphs)


def parse_projects(source_file: Path, source_root: Path, public_root: Path) -> list[dict[str, object]]:
    projects: list[dict[str, object]] = []
    category = "其他项目"
    current: dict[str, object] | None = None
    source_lines: list[str] = []

    def finish_project() -> None:
        nonlocal current, source_lines
        if current is None:
            return
        current["description"] = extract_description(source_lines)
        current["links"] = extract_links(source_lines)
        asset_names: list[str] = []
        for line in source_lines:
            asset_names.extend(PROJECT_EMBED_RE.findall(line))
        current["source_assets"] = asset_names
        projects.append(current)
        current = None
        source_lines = []

    for raw_line in source_file.read_text(encoding="utf-8").splitlines():
        h1 = re.match(r"^#\s+(.+?)\s*$", raw_line)
        h2 = re.match(r"^##\s+(.+?)\s*$", raw_line)
        if h1:
            finish_project()
            category = clean_inline_markdown(h1.group(1))
        elif h2:
            finish_project()
            current = {"title": clean_inline_markdown(h2.group(1)), "category": category}
        elif current is not None:
            source_lines.append(raw_line)
    finish_project()

    target_images = public_root / "assets" / "projects"
    target_images.mkdir(parents=True, exist_ok=True)

    published_files: set[Path] = set()
    copied_assets: dict[Path, tuple[str, Path]] = {}

    def publish_asset(source_asset: Path) -> tuple[str, Path]:
        if source_asset in copied_assets:
            return copied_assets[source_asset]

        extension = source_asset.suffix.lower()
        if extension in IMAGE_EXTENSIONS:
            asset_type = "image"
        elif extension in VIDEO_EXTENSIONS:
            asset_type = "video"
        elif extension in DOCUMENT_EXTENSIONS:
            asset_type = "document"
        else:
            raise RuntimeError(f"作品集暂不支持此附件格式：{source_asset.name}")

        optimize_video = asset_type == "video" and source_asset.stat().st_size > VIDEO_TRANSCODE_THRESHOLD
        avconvert = shutil.which("avconvert") if optimize_video else None
        destination_name = (
            f"{source_asset.stem}.m4v" if optimize_video and avconvert is not None else source_asset.name
        )
        destination = target_images / destination_name
        if destination in published_files:
            destination = unique_destination(target_images, destination_name)

        if optimize_video:
            needs_transcode = (
                not destination.exists()
                or destination.stat().st_mtime < source_asset.stat().st_mtime
                or destination.stat().st_size >= VIDEO_PUBLISH_LIMIT
            )
            if needs_transcode:
                if avconvert is None:
                    if source_asset.stat().st_size >= VIDEO_PUBLISH_LIMIT:
                        raise RuntimeError(
                            f"视频超过 GitHub 限制且未找到 avconvert：{source_asset.name}"
                        )
                    shutil.copy2(source_asset, destination)
                else:
                    presets = ("PresetAppleM4V480pSD",)
                    for preset in presets:
                        result = subprocess.run(
                            [
                                avconvert,
                                "--source", str(source_asset),
                                "--preset", preset,
                                "--output", str(destination),
                                "--replace",
                                "--disableMetadataFilter",
                            ],
                            capture_output=True,
                            text=True,
                            check=False,
                        )
                        if result.returncode != 0:
                            raise RuntimeError(
                                f"视频转换失败（{source_asset.name}）：{result.stderr.strip()}"
                            )
                        if destination.stat().st_size < VIDEO_PUBLISH_LIMIT:
                            break
                    if destination.stat().st_size >= VIDEO_PUBLISH_LIMIT:
                        raise RuntimeError(f"网页优化后的视频仍超过 95 MB：{source_asset.name}")
        else:
            shutil.copy2(source_asset, destination)

        published_files.add(destination)
        copied_assets[source_asset] = (asset_type, destination)
        return asset_type, destination

    for project in projects:
        published_images: list[dict[str, str]] = []
        published_videos: list[dict[str, str]] = []
        published_documents: list[dict[str, str]] = []
        for filename in project.pop("source_assets", []):
            source_asset = locate_asset(source_root, str(filename))
            asset_type, destination = publish_asset(source_asset)
            public_asset = {
                "src": asset_url(destination, public_root),
                "title": source_asset.stem,
            }
            if asset_type == "image":
                published_images.append({
                    "src": public_asset["src"],
                    "alt": str(project["title"]),
                })
            elif asset_type == "video":
                published_videos.append(public_asset)
            else:
                published_documents.append({**public_asset, "type": "pdf"})
        project["images"] = published_images
        project["videos"] = published_videos
        project["documents"] = published_documents
        project["incomplete"] = not bool(
            project["description"]
            or project["links"]
            or project["images"]
            or project["videos"]
            or project["documents"]
        )

    for existing in target_images.iterdir():
        if existing.is_file() and existing not in published_files:
            existing.unlink()
    return projects


def gallery_source(source_root: Path, names: tuple[str, ...]) -> Path | None:
    for name in names:
        for candidate in (source_root / name, source_root / "assets" / name):
            if candidate.is_dir():
                return candidate
    return None


def build_gallery(source_root: Path, public_root: Path) -> dict[str, list[dict[str, str]]]:
    target_root = public_root / "assets" / "gallery"
    if target_root.exists():
        shutil.rmtree(target_root)
    target_root.mkdir(parents=True, exist_ok=True)
    gallery: dict[str, list[dict[str, str]]] = {key: [] for key in GALLERY_DIRECTORIES}

    for section, names in GALLERY_DIRECTORIES.items():
        source = gallery_source(source_root, names)
        if source is None:
            continue
        target = target_root / section
        target.mkdir(parents=True, exist_ok=True)
        allowed = VIDEO_EXTENSIONS if section == "video" else IMAGE_EXTENSIONS
        for media in sorted(source.rglob("*"), key=lambda path: str(path).casefold()):
            if not media.is_file() or media.suffix.lower() not in allowed:
                continue
            destination = unique_destination(target, media.name)
            shutil.copy2(media, destination)
            gallery[section].append({
                "src": asset_url(destination, public_root),
                "title": clean_inline_markdown(media.stem.replace("_", " ").replace("-", " ")),
                "type": "video" if media.suffix.lower() in VIDEO_EXTENSIONS else "image",
            })
    return gallery


def main() -> None:
    parser = argparse.ArgumentParser(description="从 Obsidian 生成作品集数据和素材")
    parser.add_argument(
        "--source",
        default=os.environ.get("OBSIDIAN_PORTFOLIO", "/Users/ladygege/Syncthing/Obsidian/个人网站/作品集"),
        help="Obsidian 作品集目录",
    )
    parser.add_argument(
        "--target",
        default=str(Path(__file__).resolve().parents[1] / "portfolio"),
        help="网站作品集目录",
    )
    args = parser.parse_args()

    source_root = Path(args.source).expanduser().resolve()
    public_root = Path(args.target).expanduser().resolve()
    source_file = source_root / "我的项目.md"
    if not source_file.is_file():
        raise SystemExit(f"找不到项目源文件：{source_file}")
    public_root.mkdir(parents=True, exist_ok=True)

    projects = parse_projects(source_file, source_root, public_root)
    gallery = build_gallery(source_root, public_root)
    write_json_if_changed(public_root / "projects.json", {"projects": projects})
    write_json_if_changed(public_root / "gallery.json", gallery)
    print(
        f"作品集已生成：{len(projects)} 个项目；"
        f"视觉设计 {len(gallery['design'])}、摄影 {len(gallery['photography'])}、视频 {len(gallery['video'])} 件"
    )


if __name__ == "__main__":
    main()
