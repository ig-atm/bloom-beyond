import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

# Pattern to match the Markets list in the footer
pattern = re.compile(
    r'(<div class="footer-col">\s*<h4>Markets</h4>\s*<ul>\s*)(.*?)(</ul>\s*</div>)',
    re.DOTALL
)

replacement = r'\1<li><a href="#">Dubai</a></li>\n        \3'

for f in html_files:
    with open(f, 'r') as file:
        content = file.read()
    
    new_content = pattern.sub(replacement, content)
    
    if new_content != content:
        with open(f, 'w') as file:
            file.write(new_content)
        print(f"Updated footer in {f}")

print("Footer Markets updated successfully.")
