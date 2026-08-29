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

作品集也以 Obsidian 为唯一内容源：

- `作品集/我的项目.md`：一级标题作为项目分类，二级标题作为项目卡片，正文、链接和 `![[图片]]` 会自动生成到 `/portfolio/`。
- `作品集/美工设计/`：图片以瀑布流画廊展示（也可使用 `作品集/assets/美工设计/`）。
- `作品集/摄影/`：图片以瀑布流画廊展示（也可使用 `作品集/assets/摄影/`）。
- `作品集/视频/`：视频以可手动播放的卡片展示（也可使用 `作品集/assets/视频/`）。

同步器只会发布上述“个人网站/作品集”目录里的素材，不会自动公开 Obsidian 库中其他项目目录的图片或视频。

根目录的 `友链.md` 是 `/friends/` 的唯一友链数据源。每行使用“名称 + 网址”，网址既可直接书写，也可使用 Markdown 链接；同步器会生成友链卡片，不显示链接标题中的网站介绍。

同步时会镜像新增、修改和删除，并在发布副本中自动转换可解析的 Obsidian Wiki 链接。无法解析的附件会阻止发布，避免静默产生断图。

当 Obsidian 中同时存在 `主题.md` 与 `主题/`，且文件夹内包含子笔记时，同步器会在发布副本中自动生成 `主题/index.md`。MkDocs 因而把它显示为可点击的章节首页，展开后列出文件夹内的子页面；Obsidian 原始结构不会被改写。

“个人网站”目录之外的库内附件默认不会发布。确需公开的文件必须逐条加入 `scripts/obsidian-external-assets.txt` 允许清单，同步器只复制清单内且确实被笔记引用的附件。

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
- 每套 MkDocs 使用独立中文搜索索引，通过 Jieba 分词支持中文短词检索，并共享 `assets/mkdocs-extra.css`、`assets/mkdocs.js` 和 `notes/overrides/main.html`。
- MkDocs 文章页和友链页通过 Utterances 将评论保存到 GitHub Issues，访客需要登录 GitHub。
- 友链申请使用 `.github/ISSUE_TEMPLATE/friend-link.yml`，申请入口位于 `/friends/`。
- 主页建站天数以仓库创建日 `2026-01-21` 为起点；访问次数由不蒜子提供公开 PV 统计。
