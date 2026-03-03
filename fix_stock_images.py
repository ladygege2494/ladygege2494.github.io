"""
修复股票.md 中的图片引用
将 Obsidian语法 ![[...]] 转换为 Markdown语法 ![alt](path)
"""

import os
import re

def fix_stock_md():
    file_path = r'd:\MyBlog\homepage\notes\business\docs\Investment\股票.md'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 匹配 Obsidian 引用 ![[个人网站/商业笔记/Investment/asserts/股票/xxx.png]]
    obsidian_pattern = r'!\[\[个人网站/商业笔记/Investment/asserts/股票/([^\]]+)\]\]'
    
    matches = list(re.finditer(obsidian_pattern, content))
    print(f'找到 {len(matches)} 个需要修复的图片引用')
    
    # 替换为 Markdown 语法
    def replace_func(match):
        filename = match.group(1)
        return f'![{filename}](asserts/股票/{filename})'
    
    new_content = re.sub(obsidian_pattern, replace_func, content)
    
    # 保存文件
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print('✅ 修复完成！')
    print('\n修复的图片列表：')
    for match in matches:
        print(f'  - {match.group(1)}')

if __name__ == '__main__':
    fix_stock_md()
