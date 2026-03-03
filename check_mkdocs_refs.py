"""
MkDocs 文件引用路径检查和修复脚本
功能：
1. 检查所有 markdown 文件中的图片和 PDF 引用
2. 验证文件是否存在
3. 自动修复错误的相对路径
"""

import os
import re
from pathlib import Path

def find_md_files(root_dir):
    """查找所有 markdown 文件"""
    md_files = []
    for root, dirs, files in os.walk(root_dir):
        if 'site' in root:
            continue
        for file in files:
            if file.endswith('.md'):
                md_files.append(os.path.join(root, file))
    return md_files

def check_file_references(md_file_path):
    """检查文件中的引用"""
    with open(md_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 匹配图片引用 ![alt](path)
    image_pattern = r'!\[([^\]]*)\]\(([^)]+)\)'
    # 匹配 embed 标签 <embed src="path"
    embed_pattern = r'<embed\s+src=["\']([^"\']+)["\']'
    
    issues = []
    
    # 检查图片引用
    for match in re.finditer(image_pattern, content):
        path = match.group(2).strip()
        if not path.startswith('http'):
            issues.append({
                'type': 'image',
                'path': path,
                'line': content[:match.start()].count('\n') + 1,
                'original': match.group(0)
            })
    
    # 检查 embed 引用
    for match in re.finditer(embed_pattern, content):
        path = match.group(1).strip()
        if not path.startswith('http'):
            issues.append({
                'type': 'embed',
                'path': path,
                'line': content[:match.start()].count('\n') + 1,
                'original': match.group(0)
            })
    
    return issues

def find_correct_path(reference_path, md_file_dir):
    """查找正确的文件路径"""
    # 如果是绝对路径或 HTTP 链接，跳过
    if reference_path.startswith('http') or reference_path.startswith('/'):
        return None
    
    # 尝试的路径
    possible_paths = [
        os.path.join(md_file_dir, reference_path),
        os.path.normpath(os.path.join(md_file_dir, reference_path)),
    ]
    
    # 如果路径中有中文括号，尝试英文括号版本
    if '(' in reference_path or ')' in reference_path:
        alt_path = reference_path.replace('(', '(').replace(')', ')')
        possible_paths.append(os.path.join(md_file_dir, alt_path))
    
    # 检查文件是否存在
    for path in possible_paths:
        if os.path.exists(path):
            # 计算相对路径
            rel_path = os.path.relpath(path, md_file_dir)
            return rel_path.replace('\\', '/')
    
    return None

def fix_markdown_file(md_file_path):
    """修复单个文件"""
    print(f'\n检查文件：{md_file_path}')
    
    with open(md_file_path, 'r', encoding='utf-8') as f:
        original_content = f.read()
    
    content = original_content
    md_file_dir = os.path.dirname(md_file_path)
    issues_found = 0
    issues_fixed = 0
    
    # 查找所有引用
    issues = check_file_references(md_file_path)
    
    for issue in issues:
        issues_found += 1
        print(f"  第{issue['line']}行：{issue['type']} - {issue['path']}")
        
        # 查找正确的路径
        correct_path = find_correct_path(issue['path'], md_file_dir)
        
        if correct_path:
            print(f"    ✓ 找到文件：{correct_path}")
            # 替换路径
            if issue['type'] == 'image':
                old_ref = f"![{issue['original'].split('(')[0].split(']')[1]}]({issue['path']})"
                new_ref = f"![{issue['original'].split('(')[0].split(']')[1]}]({correct_path})"
                content = content.replace(old_ref, new_ref)
            elif issue['type'] == 'embed':
                old_ref = f'src="{issue["path"]}"'
                new_ref = f'src="{correct_path}"'
                content = content.replace(old_ref, new_ref)
            issues_fixed += 1
        else:
            print(f"    ✗ 文件不存在：{issue['path']}")
    
    # 如果有修改，保存文件
    if content != original_content:
        with open(md_file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ 已修复 {issues_fixed}/{issues_found} 个问题")
    else:
        if issues_found > 0:
            print(f"  ⚠ 发现 {issues_found} 个问题，但未能自动修复")
        else:
            print(f"  ✓ 所有引用正常")
    
    return issues_found, issues_fixed

def main():
    root_dir = r'd:\MyBlog\homepage\notes\tech\docs'
    
    print('=' * 60)
    print('MkDocs 文件引用路径检查工具')
    print('=' * 60)
    
    md_files = find_md_files(root_dir)
    print(f'\n找到 {len(md_files)} 个 markdown 文件')
    
    total_issues = 0
    total_fixed = 0
    
    for file_path in md_files:
        issues, fixed = fix_markdown_file(file_path)
        total_issues += issues
        total_fixed += fixed
    
    print('\n' + '=' * 60)
    print(f'总计：发现 {total_issues} 个问题，修复 {total_fixed} 个')
    print('=' * 60)

if __name__ == '__main__':
    main()
