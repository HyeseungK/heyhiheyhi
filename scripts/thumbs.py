"""Make small copies of every photo for the photo table and the spreads.

Writes assets/photos/<...>/thumbs/<name>.jpg (900px on the long side) next to each photo;
the full-size file is only loaded in the lightbox. Run after adding photos:

    python3 scripts/thumbs.py
"""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent / 'assets' / 'photos'
made = 0
for src in root.rglob('*.jpg'):
    if src.parent.name == 'thumbs':
        continue
    out = src.parent / 'thumbs' / src.name
    if out.exists() and out.stat().st_mtime >= src.stat().st_mtime:
        continue
    out.parent.mkdir(exist_ok=True)
    im = Image.open(src).convert('RGB')
    im.thumbnail((900, 900))
    im.save(out, quality=80, optimize=True, progressive=True)
    made += 1
print(f'{made} thumbnails written')
