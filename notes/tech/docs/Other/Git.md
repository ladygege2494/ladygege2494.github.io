离最开始接触Git也过去好久了，陆陆续续学了些，一直没有真正的应用场景，到了该用的时候，每次都要重新查一遍 x
因此自己再写一篇文章整理一下，目的是达成真正内化，加强记忆，理解本质。
# 版本的存储方式
- 全量存储
- 增量存储
- 快照存储，git 属于这种
# 三大区域&四种状态
三大区域：
- 工作区 modified
- 暂存区 staged
- 仓库 committed/unmodified
❗注意 untracked 不属于三大区域
![image.png](../assets/Git/image.png)
# 前期准备
## 安装
https://git-scm.com/downloads/win (for Windows)
验证 `git -v`
## 配置
全局变量/本地
`git config [--global/local] user. name <Your Name>
`git config [--global/local] user. email <YourEmail>``
## 获取 git 仓库
- 将尚未进行版本控制的本地目录转换为 Git 仓库 `git init`
- 从其它服务器克隆一个已存在的Git仓库`git clone <URL> <DirName>`
# 基本操作
## 检查文件状态
详细输出 `git status`
简洁输出 `git status [-s]` 
- ? : 未追踪 
- A (DD) : 新追踪 
- M (ODIFY) : 已修改 
- D (ELETE) : 已删除
- R (ENAME) : 重命名 
- U (NMERGED) : 未合并
输出中有两栏，左栏指明了暂存区的状态，右栏指明了工作区的状态。
## 暂存和追踪 stage/track
暂存已修改文件/开始追踪新文件 `git add <FileName/DirName/RegExp>`
取消暂存文件 
`git reset HEAD <FileName/DirName/RegExp>`
不再追踪文件 
`git rm <file>` 停止追踪+从工作目录中移除
`git rm --cached <FileName/DirName/RegExp>` 只停止追踪回到 untracked 状态
文件目录下的`.gitignore`用于声明不希望被 Git 追踪的文件名。
## 比较 diff
比较文件差异
- 工作区和暂存区`git diff`
- 暂存区和最后一次提交 `git diff --staged`
## 修改 modify
撤销对文件的修改 `git checkout -- <FileName>`
## 提交 commit
提交 （存档点）
`git commit` 先 add 后 commit，需在编辑器内输入提交信息，按 q 退出
`git commit [-a] [-m] "<Commit Message>"` 自动将 tracked 并且 modified 的文件 add，直接标注提交信息
`git commit --amend ` 修订上次提交

提交日志
`git log []默认/[-p]最详细/[--stat]历史+更改/[--oneline]简洁版` 
签出到某次提交
`git checkout <HashAbstract>`

# Git 分支
本质上仅仅是指向提交对象的可变指针。
默认分支名字是 master, HEAD 指向工作区当前所在的提交。

查看分支 `git branch []/[-v]详细/[-vv]非常详细`
创建分支 `git branch <BranchName>`
签出到分支
`git checkout <BranchName> [<SrcBranchName>]`
`git checkout -b <BranchName> [<SrcBranchName>]` 创建并切换 
`git checkout <BranchName> -f ` 丢弃所有修改，强制切换
删除分支 `git branch -d <BranchName>`

从分支合并 `git merge <SrcBranchName>`
两种情况：
- FastForward：无冲突自然合并
- CONFLICT：手动解决冲突 
# Git 远程
远程是指托管在网络中的你的项目的版本库。

查看远程 `git remote [-v]`
添加远程 `git remote add <RemoteName> <RemoteURL>` 使用git clone克隆的 Git 仓库会自动添加origin远程。
删除远程 `git remote remove <RemoteName>`

远程分支形如 `<RemoteName>/<BranchName>` 的形式，只读
从远程抓取 
`git fetch <RemoteName>`
推送到远程
`git push <RemoteName> <BranchName>
`git push <RemoteName> <LocalBranchName>:<RemoteBranchName>` 指定分支

追踪远程分支
`git checkout -b <BranchName> <RemoteName>/<RemoteBranchName>`使用git clone克隆的 Git 仓库会自动添加origin/master追踪
设置追踪
`git branch -u <RemoteName>/<RemoteBranchName>`
从远程拉取
`git pull`
`git pull <RemoteName> <RemoteBranchName>:<LocalBranchName>` 指定分支
# vim 编辑器
输入 `:q(退出vim编辑器)` 即可，或者输入 `:q!(强制退出不保存)`、`:[wq](保存后退出)`、`:wq!(强制保存后退出)` 也可以退出编辑器。
# Git GUI
Git for VSCode
GitHub Desktop

# 命令行语法
`.` 当前目录
`..` 上一级目录
`~` 当前用户的家目录
`-` 上一个所在目录
`/` 路径分隔符

# Git Commit 的规范
以中文为主，参考国际通用的 **Conventional Commits（约定式提交）** 结构。以下为你制定的“小白友好型”个人规范：
### 一、核心格式
推荐采用以下结构：
```text
<类型>: <简短描述>

[可选：详细描述，解释为什么要这么改]
```
### 二、常用类型（Type）
这是规范的灵魂。你可以直接在代码中使用这些**英文关键词**（因为它们是行业黑话，且能让 IDE 插件自动识别生成图标），后面跟**中文描述**。

| 类型 | 关键词 | 使用场景 |
| :--- | :--- | :--- |
| **功能** | `feat` | 新增了功能（Feature） |
| **修复** | `fix` | 修复了 Bug |
| **文档** | `docs` | 修改了 README、注释、项目文档等 |
| **样式** | `style` | 不影响逻辑的修改（如空格、格式化、修错别字） |
| **重构** | `refactor` | 代码逻辑优化（不是增功能也不是改 Bug） |
| **性能** | `perf` | 提升性能、运行速度的改动 |
| **测试** | `test` | 增加或修改测试用例 |
| **杂务** | `chore` | 构建过程、依赖库更新、辅助工具改动 |

### 三、具体的书写示例
#### 1. 新增功能
> `feat: 增加用户登录界面的手机号验证功能`
#### 2. 修复 Bug
> `fix: 修复了在 iOS 浏览器下按钮点击无效的问题`
#### 3. 改进代码（重构）
> `refactor: 提取公共组件中的冗余逻辑，优化代码结构`
#### 4. 更新文档
> `docs: 修改项目安装说明，补充环境变量配置步骤`
#### 5. 杂务（如更新包）
> `chore: 升级 axios 依赖版本到 1.x`
### 四、几条实用的“进阶”原则
1.  **原子化提交：** 一次 Commit 只做一件事。不要改了 Bug 又顺便写了新功能。如果做了两件事，就分两次提交。
2.  **简短有力：** 第一行描述尽量控制在 50 个字符以内。如果说不清楚，可以在空一行后写详细的“正文”。
3.  **用“完成时”还是“现在时”？** 中文习惯用“增加”、“修复”，这比“增加了”、“修复了”更简洁。
4.  **善用 Emoji（可选）：** 很多开发者喜欢在开头加图标，让 Log 看起来更美观。
    *   ✨ `feat:`
    *   🐛 `fix:`
    *   📝 `docs:`
    *   🚀 `perf:`
### 五、给小白的辅助工具推荐
既然你还不需要参与大型项目，可以利用工具来强迫自己养成习惯：
1.  **VS Code 插件：`GitLens` 或 `Conventional Commits`**
    *   安装后，它会提供一个可视化的界面，让你下拉选择 `feat` 或 `fix`，你只需要填空即可。
2.  **命令行（进阶）：`Commitizen`**
    *   这是一个 Node. js 工具，你输入 `git cz` 之后，它会一步步问你问题，最后自动生成符合规范的注释。
### 总结你的“私人模板”：
```text
[图标] 类型: 做了什么事 (为什么这么做)
```
**坚持这个习惯两周，你会发现回看自己代码历史时，有一种强迫症被治愈的爽快感！**

