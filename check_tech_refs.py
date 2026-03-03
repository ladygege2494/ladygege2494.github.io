"""
检查 tech 笔记中所有 markdown 文件的图片和 PDF 引用
"""

import os
import re

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

def check_references(md_file_path):
    """检查文件中的引用"""
    with open(md_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 匹配 Obsidian 引用 ![[...]]
    obsidian_pattern = r'!\[\[([^\]]+)\]\]'
    # 匹配 Markdown 图片 ![alt](path)
    markdown_pattern = r'!\[([^\]]*)\]\(([^)]+)\)'
    # 匹配 embed 标签 <embed src="path"
    embed_pattern = r'<embed\s+src=["\']([^"\']+)["\']'
    
    issues = []
    
    # 检查 Obsidian 引用
    for match in re.finditer(obsidian_pattern, content):
        ref = match.group(1)
        line = content[:match.start()].count('\n') + 1
        issues.append({
            'type': 'obsidian',
            'ref': ref,
            'line': line,
            'full_match': match.group(0)
        })
    
    # 检查 Markdown 图片
    for match in re.finditer(markdown_pattern, content):
        path = match.group(2).strip()
        line = content[:match.start()].count('\n') + 1
        if not path.startswith('http'):
            issues.append({
                'type': 'markdown_image',
                'path': path,
                'line': line,
                'full_match': match.group(0)
            })
    
    # 检查 embed
    for match in re.finditer(embed_pattern, content):
        path = match.group(1).strip()
        line = content[:match.start()].count('\n') + 1
        if not path.startswith('http'):
            issues.append({
                'type': 'embed',
                'path': path,
                'line': line,
                'full_match': match.group(0)
            })
    
    return issues

def main():
    root_dir = r'd:\MyBlog\homepage\notes\tech\docs'
    md_files = find_md_files(root_dir)
    
    print('=' * 80)
    print('Tech 笔记中的文件和引用检查')
    print('=' * 80)
    
    total_issues = 0
    
    for file_path in md_files:
        issues = check_references(file_path)
        if issues:
            rel_path = os.path.relpath(file_path, root_dir)
            print(f'\n📄 {rel_path}')
            for issue in issues:
                if issue['type'] == 'obsidian':
                    print(f"  第{issue['line']}行：❌ Obsidian语法 - ![[{issue['ref']}]]")
                elif issue['type'] == 'markdown_image':
                    print(f"  第{issue['line']}行：✅ Markdown图片 - {issue['path']}")
                elif issue['type'] == 'embed':
                    print(f"  第{issue['line']}行：✅ PDF嵌入 - {issue['path']}")
            total_issues += len(issues)
    
    print('\n' + '=' * 80)
    print(f'总计发现 {total_issues} 个引用')
    print('=' * 80)

if __name__ == '__main__':
    main()
