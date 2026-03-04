# Obsidian 笔记同步与部署指南

## 📋 目录

- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [使用示例](#使用示例)
- [常见问题](#常见问题)

---

## 🚀 快速开始

### 1. 在 Obsidian 中编写/编辑笔记

在你的 Obsidian 仓库中编辑笔记：
- **技术笔记**：`D:\Obsidian\个人网站\技术笔记`
- **商业笔记**：`D:\Obsidian\个人网站\商业笔记`
- **文艺笔记**：`D:\Obsidian\个人网站\文艺笔记`

### 2. 运行同步脚本

在项目根目录打开 PowerShell，运行：

```powershell
.\sync-obsidian.ps1
```

### 3. 回答脚本问题

脚本会问你 3 个问题：

**❓ 是否本地构建 MkDocs？**
- → 选 **N**（推荐，跳过本地构建，推送后由 GitHub Actions 自动构建）
- → 选 **Y**（如果你想在本地预览效果）

**❓ 是否推送到 GitHub？**
- → 选 **Y**（自动提交并推送）

**❓ 是否强制覆盖远程分支？**
- → 选 **N**（默认，除非你需要修复远程历史）

### 4. 等待部署完成

- ⏱️ 等待 1-2 分钟
- 🌐 访问 https://ladygege2494.github.io

---

## ⚙️ 配置说明

### 修改 Obsidian 路径

如果路径不同，请编辑 `sync-obsidian.ps1` 文件中的以下配置：

```powershell
# Obsidian 笔记路径（源路径）
$OBSIDIAN_TECH_PATH = "D:\Obsidian\个人网站\技术笔记"
$OBSIDIAN_BUSINESS_PATH = "D:\Obsidian\个人网站\商业笔记"
$OBSIDIAN_ART_PATH = "D:\Obsidian\个人网站\文艺笔记"
```

### 修改 Git 分支

如果你的主分支不是 `main`，请修改：

```powershell
$GIT_BRANCH = "main"  # 改为你的分支名，如 "master"
```

### 修改提交信息前缀

```powershell
$COMMIT_MESSAGE_PREFIX = "docs: sync from Obsidian"  # 自定义前缀
```

---

## 📖 使用示例

### 示例 1：日常同步（推荐方式）

```powershell
# 1. 在 Obsidian 中编辑完笔记后

# 2. 运行脚本
.\sync-obsidian.ps1

# 3. 按提示选择：
# ❓ 是否本地构建 MkDocs？ [N]  ← 直接回车选 N
# ❓ 是否推送到 GitHub？ [Y]    ← 直接回车选 Y
# ❓ 是否强制覆盖远程分支？ [N] ← 直接回车选 N

# 4. 等待完成，然后去喝杯咖啡 ☕
```

### 示例 2：本地预览后再推送

```powershell
# 1. 运行脚本并选择本地构建
.\sync-obsidian.ps1

# 2. 选择：
# ❓ 是否本地构建 MkDocs？ [Y]  ← 输入 Y
# ❓ 是否推送到 GitHub？ [Y]    ← 输入 Y

# 3. 构建完成后，在浏览器打开：
# - 技术笔记：http://localhost:8000/notes/tech/
# - 商业笔记：http://localhost:8000/notes/business/
# - 文艺笔记：http://localhost:8000/notes/art/

# 4. 确认无误后，再次运行脚本选择推送
```

### 示例 3：仅同步不推送

```powershell
# 1. 运行脚本
.\sync-obsidian.ps1

# 2. 选择：
# ❓ 是否本地构建 MkDocs？ [N]  ← 输入 N
# ❓ 是否推送到 GitHub？ [N]    ← 输入 N

# 3. 稍后手动推送：
git add .
git commit -m "docs: 手动提交笔记更新"
git push origin main
```

---

## 🔧 常见问题

### Q1: 提示 "mkdocs 命令未找到"

**解决方案：**
- 方案 A（推荐）：在脚本中选择 **N** 跳过本地构建，让 GitHub Actions 帮你构建
- 方案 B：安装 MkDocs
  ```powershell
  pip install mkdocs mkdocs-material
  ```

### Q2: 提示 "Git 用户信息未配置"

**解决方案：**
```powershell
git config user.name "你的名字"
git config user.email "your-email@example.com"
```

### Q3: 提示 "未配置远程仓库"

**解决方案：**
```powershell
# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/ladygege2494/ladygege2494.github.io.git
```

### Q4: 同步失败，提示路径不存在

**解决方案：**
1. 检查 Obsidian 路径是否正确
2. 确保路径格式为 Windows 格式（使用反斜杠 `\`）
3. 如果路径包含空格或特殊字符，用引号包裹

### Q5: 推送失败，提示权限不足

**解决方案：**
1. 确认你有仓库的写入权限
2. 如果使用 HTTPS，可能需要配置 Git 凭据管理器
3. 或者使用 SSH 方式克隆仓库

### Q6: 如何查看同步日志？

脚本运行时会自动显示详细的同步信息。如果需要查看 Robocopy 的详细日志，可以编辑脚本中的 `Sync-Directory` 函数，移除 `/NFL`、`/NDL`、`/NJH`、`/NJS` 参数。

### Q7: 如何取消同步？

按 `Ctrl+C` 可随时中断脚本运行。已同步的文件不会受到影响。

---

## 📝 同步规则说明

### 同步策略

脚本使用 **镜像同步** 策略：
- ✅ 新增的文件会自动复制到项目
- ✅ 修改的文件会自动更新
- ⚠️ **注意**：在目标目录删除的文件，如果在 Obsidian 源目录不存在，也会被删除

### 排除的文件和目录

以下文件和目录不会被同步：
- `.git/` - Git 目录
- `site/` - MkDocs 构建输出
- `__pycache__/` - Python 缓存
- `.obsidian/` - Obsidian 配置
- `*.tmp`, `*.bak` - 临时和备份文件

---

## 🎯 最佳实践

### 1. 定期同步

建议每次在 Obsidian 中完成笔记编辑后及时同步，避免积累大量更改。

### 2. 本地预览重要更改

对于重大修改，建议选择本地构建（选 Y），预览无误后再推送。

### 3. 谨慎使用强制推送

除非你需要修复远程历史，否则永远选择 **N**。

### 4. 使用有意义的提交信息

虽然脚本使用自动提交信息，但你可以在推送后手动修改提交信息：
```powershell
git commit --amend -m "更好的提交信息"
git push origin main --force-with-lease
```

---

## 🆘 需要帮助？

运行以下命令查看帮助信息：

```powershell
.\sync-obsidian.ps1 -Help
```

---

## 📞 技术支持

如有问题，请检查：
1. PowerShell 版本（建议 5.1+）
2. Git 是否已安装并配置
3. Python 和 MkDocs（如果选择本地构建）
4. 网络连接是否正常

祝你使用愉快！🎉
