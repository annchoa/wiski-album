"""Move illustrations from an inbox folder into public/illustrations and record their credits.

Usage: python3 -I add_illustration.py <inbox> [--max-width 1200]

<inbox>/credits.json is a list with one entry per image that has a credit. An entry has "file" and either
"attribution" (the HTML as pasted from the source) or the final fields: "source", "sourceUrl" and, optionally,
"author" and "authorUrl". An image with no entry has no credit.
"""
import argparse
import html
import json
import re
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
OUTPUT = ROOT / "public" / "illustrations"
CREDITS = ROOT / "src" / "data" / "illustration-credits.json"
LINK = re.compile(r'<a href="([^"]+)">([^<]+)</a>')


def build_credit(file_name, entry):
    if "attribution" not in entry:
        return {**entry, "file": file_name}
    links = LINK.findall(entry["attribution"])
    if len(links) != 2:
        raise SystemExit(f"{file_name}: expected 2 links (author, source), found {len(links)}")
    (author_url, author), (source_url, source) = links
    return {
        "file": file_name,
        "author": html.unescape(author),
        "authorUrl": html.unescape(author_url),
        "source": html.unescape(source),
        "sourceUrl": html.unescape(source_url),
    }


def shrink_raster(path, max_width):
    image = Image.open(path)
    if image.width > max_width:
        height = round(image.height * max_width / image.width)
        image = image.resize((max_width, height), Image.LANCZOS)
    target = OUTPUT / (path.stem + ".png")
    image.save(target, optimize=True)
    return target, image.width, image.height


def copy_svg(path):
    text = path.read_text()
    match = re.search(r'viewBox="[\d.\-]+ [\d.\-]+ ([\d.]+) ([\d.]+)"', text)
    assert match, f"{path.name}: no viewBox"
    target = OUTPUT / path.name
    shutil.copy(path, target)
    return target, float(match[1]), float(match[2])


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("inbox", type=Path)
    parser.add_argument("--max-width", type=int, default=1200)
    args = parser.parse_args()

    entries = {e["file"]: e for e in json.loads((args.inbox / "credits.json").read_text())}
    images = sorted(p for p in args.inbox.iterdir() if p.suffix in {".png", ".jpg", ".jpeg", ".svg"})
    credits = json.loads(CREDITS.read_text()) if CREDITS.exists() else []
    by_file = {c["file"]: c for c in credits}

    OUTPUT.mkdir(parents=True, exist_ok=True)
    for source in images:
        if source.suffix == ".svg":
            target, width, height = copy_svg(source)
        else:
            target, width, height = shrink_raster(source, args.max_width)
        if source.name in entries:
            by_file[target.name] = build_credit(target.name, entries[source.name])
        before, after = source.stat().st_size, target.stat().st_size
        print(f"{target.name}: {before // 1024} KB -> {after // 1024} KB, {width}x{height}")

    CREDITS.parent.mkdir(parents=True, exist_ok=True)
    CREDITS.write_text(json.dumps(sorted(by_file.values(), key=lambda c: c["file"]), indent="\t", ensure_ascii=False) + "\n")


main()
