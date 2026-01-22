# ========================================
# Obsidian 笔记自动同步到网站脚本
# ========================================

# 配置区域 - 请根据你的实际情况修改
$OBSIDIAN_VAULT = "D:\Obsidian\个人网站"  # 你的 Obsidian 仓库路径
$PROJECT_ROOT = "d:\MyBlog\homepage"  # 项目根目录

# 笔记分类映射（Obsidian文件夹 -> 网站笔记目录）
$SYNC_MAPPINGS = @{
    "技术笔记" = "notes/tech/docs"
    "商业笔记" = "notes/business/docs"
    "文艺笔记" = "notes/art/docs"
    "一路走来" = "notes/journey/docs"
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Obsidian 笔记同步工具" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 检查 Obsidian 目录是否存在
if (-not (Test-Path $OBSIDIAN_VAULT)) {
    Write-Host "[错误] Obsidian 仓库路径不存在: $OBSIDIAN_VAULT" -ForegroundColor Red
    Write-Host "请编辑脚本第7行，设置正确的 Obsidian 路径" -ForegroundColor Yellow
    exit 1
}

Write-Host "[信息] Obsidian 仓库: $OBSIDIAN_VAULT" -ForegroundColor Green
Write-Host "[信息] 项目目录: $PROJECT_ROOT`n" -ForegroundColor Green

# 同步文件
$totalCopied = 0
foreach ($mapping in $SYNC_MAPPINGS.GetEnumerator()) {
    $sourcePath = Join-Path $OBSIDIAN_VAULT $mapping.Key
    $destPath = Join-Path $PROJECT_ROOT $mapping.Value
    
    if (Test-Path $sourcePath) {
        Write-Host "[同步] $($mapping.Key) -> $($mapping.Value)" -ForegroundColor Yellow
        
        # 创建目标目录（如果不存在）
        if (-not (Test-Path $destPath)) {
            New-Item -Path $destPath -ItemType Directory -Force | Out-Null
        }
        
        # 复制所有 Markdown 文件和图片
        $files = Get-ChildItem -Path $sourcePath -Recurse -Include *.md,*.png,*.jpg,*.jpeg,*.gif
        
        foreach ($file in $files) {
            $relativePath = $file.FullName.Substring($sourcePath.Length + 1)
            $destFile = Join-Path $destPath $relativePath
            $destDir = Split-Path $destFile -Parent
            
            if (-not (Test-Path $destDir)) {
                New-Item -Path $destDir -ItemType Directory -Force | Out-Null
            }
            
            Copy-Item -Path $file.FullName -Destination $destFile -Force
            $totalCopied++
        }
        
        Write-Host "  ✓ 已同步 $($files.Count) 个文件" -ForegroundColor Green
    } else {
        Write-Host "[跳过] 未找到文件夹: $($mapping.Key)" -ForegroundColor Gray
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
 Write-Host "同步完成！共复制 $totalCopied 个文件" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# 询问是否构建 MkDocs
Write-Host "是否要本地构建 MkDocs 预览（用于测试）？[Y/N]" -ForegroundColor Yellow -NoNewline
$buildResponse = Read-Host " "

if ($buildResponse -eq "Y" -or $buildResponse -eq "y") {
    Write-Host "`n[MkDocs] 开始构建..." -ForegroundColor Cyan
    Set-Location $PROJECT_ROOT
    
    # 构建各个笔记站点
    $notesMap = @{
        "技术笔记" = "notes/tech"
        "商业笔记" = "notes/business"
        "文艺笔记" = "notes/art"
        "一路走来" = "notes/journey"
    }
    
    foreach ($note in $notesMap.GetEnumerator()) {
        $notePath = Join-Path $PROJECT_ROOT $note.Value
        if (Test-Path $notePath) {
            Write-Host "[构建] $($note.Key)..." -ForegroundColor Yellow
            Set-Location $notePath
            mkdocs build 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✓ 构建成功" -ForegroundColor Green
            } else {
                Write-Host "  ✗ 构建失败" -ForegroundColor Red
            }
        }
    }
    
    Set-Location $PROJECT_ROOT
    Write-Host "`n[提示] 本地预览构建完成，可以在浏览器中打开 index.html 测试" -ForegroundColor Green
    Write-Host "[提示] 注意：本地构建仅用于测试，推送到 GitHub 后会自动重新构建`n" -ForegroundColor Yellow
}

# 询问是否提交并推送到 GitHub
Write-Host "是否要提交并推送到 GitHub？[Y/N]" -ForegroundColor Yellow -NoNewline
$response = Read-Host " "

if ($response -eq "Y" -or $response -eq "y") {
    Write-Host "`n[Git] 开始提交..." -ForegroundColor Cyan
    
    Set-Location $PROJECT_ROOT
    
    # 查看更改
    Write-Host "`n[Git] 检查更改..." -ForegroundColor Yellow
    git status
    
    # 添加所有更改
    Write-Host "`n[Git] 添加文件..." -ForegroundColor Yellow
    git add .
    
    # 提交
    $commitMsg = "docs: 同步 Obsidian 笔记 $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    Write-Host "[Git] 提交更改: $commitMsg" -ForegroundColor Yellow
    git commit -m $commitMsg
    
    # 推送
    Write-Host "[Git] 推送到 GitHub..." -ForegroundColor Yellow
    git push origin main
    
    Write-Host "`n✓ 推送完成！网站将在1-2分钟内自动更新" -ForegroundColor Green
} else {
    Write-Host "`n提示：稍后可以手动执行以下命令推送：" -ForegroundColor Yellow
    Write-Host "  cd $PROJECT_ROOT" -ForegroundColor Gray
    Write-Host "  git add ." -ForegroundColor Gray
    Write-Host "  git commit -m 'docs: 更新笔记'" -ForegroundColor Gray
    Write-Host "  git push origin main" -ForegroundColor Gray
}

Write-Host "`n按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
