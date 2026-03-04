# ==========================================
# Obsidian Sync Script for GitHub Pages
# ==========================================

param(
    [switch]$Help
)

$VERSION = "1.0.0"

# Try to load external config file first (if exists)
$configFile = Join-Path $PSScriptRoot "sync-config.ps1"
if (Test-Path $configFile) {
    Write-Host "[INFO] Loading configuration from sync-config.ps1..." -ForegroundColor Cyan
    . $configFile
} else {
    # Default configuration - CHANGE THESE PATHS TO YOUR ACTUAL PATHS
    # IMPORTANT: Use forward slashes (/) or double backslashes (\\) in paths
    $OBSIDIAN_TECH_PATH = "D:/Obsidian/PersonalWebsite/TechNotes"
    $OBSIDIAN_BUSINESS_PATH = "D:/Obsidian/PersonalWebsite/BusinessNotes"
    $OBSIDIAN_ART_PATH = "D:/Obsidian/PersonalWebsite/ArtNotes"
    
    $GIT_BRANCH = "main"
    $COMMIT_MESSAGE_PREFIX = "docs: sync from Obsidian"
}

# Project target paths (auto-detected)
$PROJECT_ROOT = $PSScriptRoot
$TECH_DOCS_PATH = Join-Path $PROJECT_ROOT "notes\tech\docs"
$BUSINESS_DOCS_PATH = Join-Path $PROJECT_ROOT "notes\business\docs"
$ART_DOCS_PATH = Join-Path $PROJECT_ROOT "notes\art\docs"

# Helper Functions
function Write-Success { param($m) Write-Host "[OK] $m" -ForegroundColor Green }
function Write-Error2 { param($m) Write-Host "[ERROR] $m" -ForegroundColor Red }
function Write-Info2 { param($m) Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Write-Question { param($m) Write-Host "[?] $m" -ForegroundColor Yellow }

function Sync-Folder {
    param($src, $dst, $name)
    
    Write-Info2 "Syncing $name..."
    Write-Info2 "  Source: $src"
    Write-Info2 "  Target: $dst"
    
    if (-not (Test-Path $src)) {
        Write-Error2 "$name source folder not found: $src"
        return $false
    }
    
    if (-not (Test-Path $dst)) {
        New-Item -ItemType Directory -Path $dst -Force | Out-Null
        Write-Success "Created target folder: $dst"
    }
    
    $result = robocopy.exe $src $dst /MIR /PURGE /XD .git site __pycache__ .obsidian /XF *.tmp *.bak /NFL /NDL /NJH /NJS
    
    if ($result -ge 8) {
        Write-Error2 "$name sync failed, error code: $result"
        return $false
    } else {
        Write-Success "$name sync completed"
        return $true
    }
}

function Ask-YesNo {
    param($q, $default = "Y")
    
    while ($true) {
        $r = Read-Host "$q [$default]"
        if ([string]::IsNullOrWhiteSpace($r)) { $r = $default }
        $r = $r.Trim().ToUpper()
        
        if ($r -eq "Y" -or $r -eq "YES") { return $true }
        elseif ($r -eq "N" -or $r -eq "NO") { return $false }
        else { Write-Warning "Please enter Y or N" }
    }
}

function Build-MkDocs {
    param($path, $name)
    
    if (-not (Test-Path $path)) {
        Write-Info2 "$name folder not found, skipping build"
        return $true
    }
    
    Write-Info2 "Building $name MkDocs..."
    Push-Location $path
    
    try {
        mkdocs build
        if ($LASTEXITCODE -eq 0) {
            Write-Success "$name MkDocs build completed"
            return $true
        } else {
            Write-Error2 "$name MkDocs build failed"
            return $false
        }
    } catch {
        Write-Error2 "$name MkDocs build error: $_"
        return $false
    } finally {
        Pop-Location
    }
}

function Show-Help {
    Write-Host @"
==========================================
Obsidian Sync Script v$VERSION
==========================================

Usage:
  .\sync-obsidian.ps1 [-Help]

Features:
  1. Sync Obsidian notes to project
  2. Optional local MkDocs build
  3. Auto commit and push to GitHub
  4. GitHub Actions auto deploy

Configuration:
  Method 1 (Recommended): Create sync-config.ps1
    Copy sync-config.example.ps1 to sync-config.ps1
    Edit the paths in sync-config.ps1
  
  Method 2: Edit this script directly
    Change OBSIDIAN_*_PATH variables (lines 19-21)

Example paths:
  English: D:/Obsidian/PersonalWebsite/TechNotes
  Chinese: D:/Obsidian/个人网站/技术笔记

"@ -ForegroundColor Cyan
}

# Main Program
function Main {
    if ($Help) {
        Show-Help
        return
    }
    
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "  Obsidian Sync Script v$VERSION" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Questions
    $buildLocally = Ask-YesNo "Build MkDocs locally? (N recommended, GitHub will build)" "N"
    $pushToGitHub = Ask-YesNo "Push to GitHub?" "Y"
    $forcePush = $false
    if ($pushToGitHub) {
        $forcePush = Ask-YesNo "Force overwrite remote branch? (Use with caution)" "N"
    }
    
    Write-Host ""
    Write-Info2 "Starting sync process..."
    Write-Host ""
    
    # Step 1: Sync folders
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "  Step 1: Sync Obsidian Notes" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $ok = $true
    if (-not (Sync-Folder $OBSIDIAN_TECH_PATH $TECH_DOCS_PATH "Tech")) { $ok = $false }
    if (-not (Sync-Folder $OBSIDIAN_BUSINESS_PATH $BUSINESS_DOCS_PATH "Business")) { $ok = $false }
    if (-not (Sync-Folder $OBSIDIAN_ART_PATH $ART_DOCS_PATH "Art")) { $ok = $false }
    
    if (-not $ok) {
        Write-Host ""
        Write-Error2 "Sync errors occurred"
        Write-Info2 "Check errors above and fix before re-running"
        return
    }
    
    Write-Host ""
    
    # Step 2: Build MkDocs
    if ($buildLocally) {
        Write-Host "==========================================" -ForegroundColor Cyan
        Write-Host "  Step 2: Build MkDocs Locally" -ForegroundColor Cyan
        Write-Host "==========================================" -ForegroundColor Cyan
        Write-Host ""
        
        try {
            $v = mkdocs --version
            Write-Success "MkDocs found: $v"
        } catch {
            Write-Error2 "MkDocs not installed. Install with: pip install mkdocs mkdocs-material"
            Write-Info2 "Or select N next time to let GitHub build"
            return
        }
        
        $buildOk = $true
        if (-not (Build-MkDocs (Join-Path $PROJECT_ROOT "notes\tech") "Tech")) { $buildOk = $false }
        if (-not (Build-MkDocs (Join-Path $PROJECT_ROOT "notes\business") "Business")) { $buildOk = $false }
        if (-not (Build-MkDocs (Join-Path $PROJECT_ROOT "notes\art") "Art")) { $buildOk = $false }
        
        if (-not $buildOk) {
            Write-Host ""
            Write-Error2 "MkDocs build errors"
            Write-Info2 "Fix errors and re-run, or skip local build"
            return
        }
        
        Write-Host ""
    }
    
    # Step 3: Git push
    if ($pushToGitHub) {
        Write-Host "==========================================" -ForegroundColor Cyan
        Write-Host "  Step 3: Commit and Push" -ForegroundColor Cyan
        Write-Host "==========================================" -ForegroundColor Cyan
        Write-Host ""
        
        if (-not (Test-Path (Join-Path $PROJECT_ROOT ".git"))) {
            Write-Error2 "Not a Git repository. Run: git init"
            return
        }
        
        try {
            $user = git config user.name
            $email = git config user.email
            Write-Success "Git user: $user <$email>"
        } catch {
            Write-Error2 "Git user not configured"
            Write-Info2 "Run: git config user.name 'Name' and git config user.email 'Email'"
            return
        }
        
        try {
            $url = git remote get-url origin
            Write-Success "Remote: $url"
        } catch {
            Write-Error2 "Remote not configured"
            Write-Info2 "Run: git remote add origin <your-repo-url>"
            return
        }
        
        Push-Location $PROJECT_ROOT
        try {
            Write-Info2 "Adding files..."
            git add .
            
            $status = git status --porcelain
            if ([string]::IsNullOrWhiteSpace($status)) {
                Write-Info2 "No changes, skipping commit"
            } else {
                $msg = "$COMMIT_MESSAGE_PREFIX - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
                Write-Info2 "Committing..."
                git commit -m $msg
                
                if ($LASTEXITCODE -ne 0) {
                    Write-Error2 "Commit failed"
                    return
                }
            }
            
            Write-Info2 "Pushing..."
            if ($forcePush) {
                Write-Warning "Force pushing (--force-with-lease)"
                git push origin $GIT_BRANCH --force-with-lease
            } else {
                git push origin $GIT_BRANCH
            }
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Success "Pushed to GitHub successfully!"
                Write-Host ""
                Write-Info2 "GitHub Actions is running..."
                Write-Info2 "Check: https://github.com/ladygege2494.github.io/actions"
                Write-Host ""
                Write-Info2 "Wait 1-2 minutes, then visit: https://ladygege2494.github.io"
                Write-Host ""
            } else {
                Write-Host ""
                Write-Error2 "Push failed"
                Write-Info2 "Check network and permissions"
                return
            }
        } finally {
            Pop-Location
        }
    } else {
        Write-Host ""
        Write-Info2 "Skipped push"
        Write-Info2 "Manual push: git add . && git commit -m 'docs: sync from Obsidian' && git push origin $GIT_BRANCH"
    }
    
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "  Sync completed!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
}

Main
