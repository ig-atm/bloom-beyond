import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

nav_links_pattern = re.compile(r'(<ul class="nav-links">)(.*?)(</ul>)', re.DOTALL)
nav_mobile_pattern = re.compile(r'(<div class="nav-mobile"[^>]*>)(.*?)(</div>)', re.DOTALL)

for f in html_files:
    with open(f, 'r') as file:
        content = file.read()
    
    res_active = ' active' if f in ['listings.html', 'property.html'] else ''
    about_active = ' active' if f == 'agency.html' else ''
    
    desktop_links = f"""
      <li><a href="listings.html" class="nav-link{res_active}">Residential</a></li>
      <li><a href="#" class="nav-link">Commercial</a></li>
      <li><a href="#" class="nav-link">Sellers</a></li>
      <li><a href="agency.html" class="nav-link{about_active}">About us</a></li>
      <li><a href="agency.html#contact" class="nav-link">Contact Us</a></li>
    """
    
    mobile_links = f"""
  <a href="listings.html" class="nav-link{res_active}">Residential</a>
  <a href="#" class="nav-link">Commercial</a>
  <a href="#" class="nav-link">Sellers</a>
  <a href="agency.html" class="nav-link{about_active}">About us</a>
  <a href="agency.html#contact" class="nav-link">Contact Us</a>
"""
    
    content = nav_links_pattern.sub(r'\g<1>' + desktop_links + r'\g<3>', content)
    content = nav_mobile_pattern.sub(r'\g<1>' + mobile_links + r'\g<3>', content)
    
    with open(f, 'w') as file:
        file.write(content)
print("Updated all html files.")
