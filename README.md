# GegeNook

GegeNook 由一套原生 HTML 主页和四套独立 MkDocs 知识库组成。公开 URL 层级固定为：

- `/tech/` → `/notes/tech/`
- `/art/` → `/notes/art/`
- `/business/` → `/notes/business/`
- `/journey/` → `/notes/journey/`

## 内容源

Obsidian 是笔记的唯一内容源，不要直接编辑 `notes/*/docs`：

| Obsidian | MkDocs |
| --- | --- |
| `技术笔记` | `notes/tech/docs` |
| `商业笔记` | `notes/business/docs` |
| `文艺笔记` | `notes/art/docs` |
| `一路走来` | `notes/journey/docs` |

同步时会镜像新增、修改和删除，并在发布副本中自动转换可解析的 Obsidian Wiki 链接。无法解析的附件会阻止发布，避免静默产生断图。

## 首次设置

```bash
cd /Users/ladygege/MyWebsite
./scripts/setup.sh
```

## 日常使用

仅同步到本地仓库：

```bash
./scripts/sync-obsidian.sh
```

同步并发布：

```bash
./scripts/sync-obsidian.sh --push
```

重要更新先严格构建再发布：

```bash
./scripts/sync-obsidian.sh --build --push
```

本地预览完整网站：

```bash
./scripts/serve-site.sh
```

浏览器访问 <http://127.0.0.1:8000>。

## 自动监听

保持终端窗口运行即可在 Obsidian 保存后自动提交并发布。默认每 15 秒检查一次，并等待 90 秒防抖，避免连续保存触发大量部署：

```bash
./scripts/watch-obsidian.sh
```

## 部署

`main` 每次推送都会触发 GitHub Actions。工作流严格检查四套笔记、构建到临时 `site/`，然后发布到 `gh-pages`。`site/` 是生成物，不进入 `main`。

## 搜索、评论与友链申请

- 原生 HTML 页面使用 `script.js` 同时检索四套 MkDocs 索引和网站固定页面；输入关键词后即时显示按相关度排序的结果。
- 每套 MkDocs 使用独立中文搜索索引，并共享 `assets/mkdocs-extra.css`、`assets/mkdocs.js` 和 `notes/overrides/main.html`。
- MkDocs 文章页和友链页通过 Utterances 将评论保存到 GitHub Issues，访客需要登录 GitHub。
- 友链申请使用 `.github/ISSUE_TEMPLATE/friend-link.yml`，申请入口位于 `/friends/`。
- 主页建站天数以仓库创建日 `2026-01-21` 为起点；访问次数由不蒜子提供公开 PV 统计。
