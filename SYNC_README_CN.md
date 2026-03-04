# Obsidian 同步脚本 - 快速使用指南

## 🚀 三步开始

### 1. 修改配置

打开 `sync-obsidian.ps1` 文件，找到第 13-15 行，修改为你的实际路径：

```powershell
# 修改这些路径为你实际的 Obsidian 笔记路径
$OBSIDIAN_TECH_PATH = "D:\Obsidian\个人网站\技术笔记"
$OBSIDIAN_BUSINESS_PATH = "D:\Obsidian\个人网站\商业笔记"
$OBSIDIAN_ART_PATH = "D:\Obsidian\个人网站\文艺笔记"
```

**重要提示：** 如果你的路径包含中文字符（如"个人网站"），请确保使用英文引号包裹路径。

### 2. 运行脚本

在项目根目录打开 PowerShell，执行：

```powershell
.\sync-obsidian.ps1
```

### 3. 回答问题

脚本会问三个问题（推荐选择）：

```
[?] Build MkDocs locally? [N]      ← 直接回车（选 N，让 GitHub 构建）
[?] Push to GitHub? [Y]            ← 直接回车（选 Y，自动推送）
[?] Force overwrite remote branch? [N]  ← 直接回车（选 N，安全推送）
```

## 📋 完整示例

### 示例 1: 日常同步（最常用）

```powershell
# 在 Obsidian 编辑完笔记后

# 1. 打开项目文件夹的 PowerShell
cd D:\MyBlog\homepage

# 2. 运行脚本
.\sync-obsidian.ps1

# 3. 按提示输入：
# [?] Build MkDocs locally? [N]     → 按 Enter（选 N）
# [?] Push to GitHub? [Y]           → 按 Enter（选 Y）
# [?] Force overwrite remote? [N]   → 按 Enter（选 N）

# 4. 等待完成，然后访问网站
```

### 示例 2: 首次使用配置

```powershell
# 1. 用记事本或 VS Code 打开 sync-obsidian.ps1

# 2. 找到配置区域（大约第 13 行）
$OBSIDIAN_TECH_PATH = "D:\Obsidian\PersonalWebsite\TechNotes"
$OBSIDIAN_BUSINESS_PATH = "D:\Obsidian\PersonalWebsite\BusinessNotes"
$OBSIDIAN_ART_PATH = "D:\Obsidian\PersonalWebsite\ArtNotes"

# 3. 修改为你的实际路径，例如：
$OBSIDIAN_TECH_PATH = "D:\Obsidian\个人网站\技术笔记"
$OBSIDIAN_BUSINESS_PATH = "D:\Obsidian\个人网站\商业笔记"
$OBSIDIAN_ART_PATH = "D:\Obsidian\个人网站\文艺笔记"

# 4. 保存文件

# 5. 运行脚本
.\sync-obsidian.ps1
```

## ⚙️ 配置选项详解

### 必须配置的选项

在 `sync-obsidian.ps1` 文件中修改：

```powershell
# ====== 必需配置 ======

# Obsidian 源路径（你的笔记所在文件夹）
$OBSIDIAN_TECH_PATH = "D:\Obsidian\个人网站\技术笔记"
$OBSIDIAN_BUSINESS_PATH = "D:\Obsidian\个人网站\商业笔记"
$OBSIDIAN_ART_PATH = "D:\Obsidian\个人网站\文艺笔记"

# Git 分支名称（通常是 main 或 master）
$GIT_BRANCH = "main"
```

### 可选配置

```powershell
# ====== 可选配置 ======

# 提交信息前缀
$COMMIT_MESSAGE_PREFIX = "docs: sync from Obsidian"

# 如果你使用其他分支，修改这里
$GIT_BRANCH = "master"  # 或者你的分支名
```

## ❓ 常见问题解答

### Q1: 路径中有中文可以吗？

**答：** 可以！PowerShell 完全支持中文路径。例如：
```powershell
$OBSIDIAN_TECH_PATH = "D:\Obsidian\个人网站\技术笔记"
```

### Q2: 没有安装 MkDocs 怎么办？

**答：** 在脚本询问 "Build MkDocs locally?" 时选择 **N**，GitHub Actions 会自动构建。

### Q3: 如何查看帮助？

```powershell
.\sync-obsidian.ps1 -Help
```

### Q4: 同步失败怎么办？

检查以下几点：
1. Obsidian 路径是否正确
2. 路径是否存在（用文件管理器确认）
3. 是否有读写权限

### Q5: 如何查看详细同步日志？

编辑脚本中的 `Sync-Folder` 函数，移除 Robocopy 参数中的 `/NFL /NDL /NJH /NJS`，可以看到详细文件列表。

### Q6: Git 提示未配置怎么办？

```powershell
# 配置 Git 用户信息
git config user.name "你的名字"
git config user.email "your-email@example.com"

# 配置远程仓库（如果还没有）
git remote add origin https://github.com/ladygege2494/ladygege2494.github.io.git
```

## 🔍 故障排查

### 检查清单

- [ ] Obsidian 路径是否正确？
- [ ] 目标文件夹是否存在？（`notes/tech/docs`, `notes/business/docs`, `notes/art/docs`）
- [ ] Git 是否已初始化？（检查 `.git` 文件夹）
- [ ] Git 用户信息是否配置？
- [ ] 远程仓库是否已添加？
- [ ] 网络连接是否正常？

### 测试步骤

```powershell
# 1. 检查 Git 状态
git status

# 2. 检查远程仓库
git remote -v

# 3. 检查 Git 配置
git config user.name
git config user.email

# 4. 测试 Robocopy（同步工具）
robocopy.exe "D:\Obsidian\个人网站\技术笔记" "notes\tech\docs" /L
```

## 💡 最佳实践

1. **频繁同步** - 每次编辑后及时同步
2. **选择 N 构建** - 让 GitHub Actions 构建，更快更可靠
3. **不要强推** - 除非必要，永远选 N
4. **先预览** - 重大修改可以先本地构建预览

## 📞 需要更多帮助？

查看详细文档：[SYNC_GUIDE.md](./SYNC_GUIDE.md)

---

祝你使用愉快！🎉
