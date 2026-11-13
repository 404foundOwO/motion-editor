#!/usr/bin/env python3
"""Bump the app version before pushing, so the top-center label shows when GitHub Pages has deployed.

Usage: python3 tools/bump.py          # 0.21 -> 0.22, date = today
       python3 tools/bump.py 1.0      # set an exact version
Also stamps ?v=<version> on every local script and stylesheet in index.html, so browsers
fetch the new files after a deploy instead of mixing cached old ones with new ones.
"""
import re, sys, os, datetime
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
vf = os.path.join(ROOT, 'js', '00-version.js')
s = open(vf, encoding='utf-8').read()
cur = re.search(r"APPV='([^']+)'", s).group(1)
if len(sys.argv) > 1:
    new = sys.argv[1]
else:
    a, b = cur.split('.')[:2]
    new = f"{a}.{int(b) + 1}"
today = datetime.date.today().isoformat()
s = re.sub(r"APPV='[^']+'", f"APPV='{new}'", s)
s = re.sub(r"APPDATE='[^']+'", f"APPDATE='{today}'", s)
open(vf, 'w', encoding='utf-8').write(s)
ip = os.path.join(ROOT, 'index.html')
h = open(ip, encoding='utf-8').read()
h = re.sub(r'(src="(?:js|vendor)/[^"?]+\.js)(?:\?v=[^"]*)?"', lambda m: f'{m.group(1)}?v={new}"', h)
h = re.sub(r'(href="css/[^"?]+\.css)(?:\?v=[^"]*)?"', lambda m: f'{m.group(1)}?v={new}"', h)
open(ip, 'w', encoding='utf-8').write(h)
print(f'version {cur} -> {new} ({today})')
