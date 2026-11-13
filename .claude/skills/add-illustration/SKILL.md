---
name: add-illustration
description: Add downloaded illustrations to wiski-app. Shrinks each image and records its credit.
disable-model-invocation: true
---

The user leaves the images and `credits.json` in an inbox folder. The argument is that folder.

Do not read the images or `credits.json`. The script does all the work.

1. Run `python3 -I .claude/skills/add-illustration/add_illustration.py <inbox>`. The default maximum width is 1200 px; `--max-width` changes it.
2. Read its output: one line per image, with the new size and the pixel dimensions.
3. For each image, add an entry to `src/lib/illustrations.ts` (`id` is the file name without extension; `width` and `height` come from the output). Ask the user for `size` (`small` or `large`) of each one.
4. Done when every image in the inbox is in `public/illustrations/`, in `src/data/illustration-credits.json` and in `illustrations.ts`.

`credits.json` is a list. Each entry has `file` and either `attribution` (the HTML pasted from the source, with two links: author first, source second) or `source`, `sourceUrl` and optionally `author`, `authorUrl`. An image with no entry has no credit.

```json
[
  { "file": "summer.png", "attribution": "Image by <a href=\"…\">Arl</a> from <a href=\"…\">Pixabay</a>" },
  { "file": "bird.svg", "source": "unDraw", "sourceUrl": "https://handcrafts.undraw.co/app" }
]
```
