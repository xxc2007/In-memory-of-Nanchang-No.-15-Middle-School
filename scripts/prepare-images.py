from pathlib import Path
from PIL import Image
import re
root = Path(__file__).resolve().parents[1]
# Preserve source JPEGs and their dimensions; these are alternate delivery formats.
html = (root / 'index.html').read_text(encoding='utf-8')
thumbs = [root / path for path in re.findall(r'<picture class="ph-img"><source[^>]+><img src="([^"]+\.jpg)"', html)]
for source in [root / 'images/full/18-plaza-summer.jpg', *thumbs]:
    with Image.open(source) as image:
        image.save(source.with_suffix('.avif'), quality=55, speed=6)
with Image.open(root / 'images/full/18-plaza-summer.jpg') as original:
    image = original.resize((800, 600), Image.Resampling.LANCZOS)
    image.save(root / 'images/full/18-plaza-summer-800.avif', quality=55, speed=6)
