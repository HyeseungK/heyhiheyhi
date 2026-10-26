#!/usr/bin/env python3
"""Stamp asset URLs in index.html with a short content hash (?v=...).

Browsers and GitHub Pages cache JS/CSS; a changed hash forces a fresh download.
JS modules are versioned through the import map, so `import './content.js'`
inside other modules also picks up the new version. Run before committing:

    python3 scripts/version.py
"""
import hashlib
import json
import pathlib
import re

root = pathlib.Path(__file__).resolve().parent.parent
html_path = root / 'index.html'
html = html_path.read_text()


def stamp(rel):
    digest = hashlib.sha1((root / rel).read_bytes()).hexdigest()[:8]
    return f'./{rel}?v={digest}'


imports = {'three': stamp('vendor/three.module.min.js')}
for js in sorted((root / 'js').glob('*.js')):
    rel = js.relative_to(root).as_posix()
    imports[f'./{rel}'] = stamp(rel)

block = json.dumps({'imports': imports}, indent=2).replace('\n', '\n    ')
html = re.sub(r'<script type="importmap">.*?</script>',
              f'<script type="importmap">\n    {block}\n  </script>', html, flags=re.S)
html = re.sub(r'href="(?:\./)?css/style\.css(?:\?v=\w+)?"', f'href="{stamp("css/style.css")[2:]}"', html)
html = re.sub(r'src="(?:\./)?js/main\.js(?:\?v=\w+)?"', f'src="{stamp("js/main.js")[2:]}"', html)
html_path.write_text(html)
print('stamped', len(imports), 'modules')
