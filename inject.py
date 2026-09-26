import os, glob

snippet = """
<!-- ══ MOBILE BOTTOM NAV ═══════════════════════════════════════ -->
<nav class="bottom-nav">
  <a href="index.html" class="bottom-nav-item">
    <svg class="bottom-nav-icon" viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
    <div class="bottom-nav-dot"></div>
  </a>
  <a href="listings.html" class="bottom-nav-item">
    <svg class="bottom-nav-icon" viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
    <div class="bottom-nav-dot"></div>
  </a>
  <a href="off-plan.html" class="bottom-nav-item">
    <svg class="bottom-nav-icon" viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
    <div class="bottom-nav-dot"></div>
  </a>
  <a href="#" class="bottom-nav-item" id="mobileClientAccess">
    <svg class="bottom-nav-icon" viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
    </svg>
    <div class="bottom-nav-dot"></div>
  </a>
</nav>
</body>"""

for f in glob.glob("*.html"):
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    if 'bottom-nav' not in content:
        content = content.replace("</body>", snippet)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print("Updated", f)
