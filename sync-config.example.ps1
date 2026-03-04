# ==========================================
# Obsidian 同步脚本 - 配置文件模板
# ==========================================
# 
# 使用说明:
# 1. 复制此文件为 sync-config.ps1
# 2. 修改下面的路径为你的实际路径
# 3. 运行 .\sync-obsidian.ps1 即可
#
# ==========================================

# ====== 必需配置：Obsidian 笔记路径 ======

# 技术笔记路径
# 请修改为你的 Obsidian 技术笔记文件夹路径
$OBSIDIAN_TECH_PATH = "D:\Obsidian\个人网站\技术笔记"

# 商业笔记路径
# 请修改为你的 Obsidian 商业笔记文件夹路径
$OBSIDIAN_BUSINESS_PATH = "D:\Obsidian\个人网站\商业笔记"

# 文艺笔记路径
# 请修改为你的 Obsidian 文艺笔记文件夹路径
$OBSIDIAN_ART_PATH = "D:\Obsidian\个人网站\文艺笔记"


# ====== 可选配置：Git 设置 ======

# Git 分支名称
# 如果你的主分支是 master，改为 "master"
$GIT_BRANCH = "main"

# 提交信息前缀
# 可以自定义提交信息的开头
$COMMIT_MESSAGE_PREFIX = "docs: sync from Obsidian"


# ====== 不需要修改：项目目标路径 ======
# 这些路径会自动设置为当前项目目录

$PROJECT_ROOT = $PSScriptRoot
$TECH_DOCS_PATH = Join-Path $PROJECT_ROOT "notes\tech\docs"
$BUSINESS_DOCS_PATH = Join-Path $PROJECT_ROOT "notes\business\docs"
$ART_DOCS_PATH = Join-Path $PROJECT_ROOT "notes\art\docs"
