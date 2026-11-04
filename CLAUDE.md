# CLAUDE.md

## Design source

Before building or changing UI, read the Penpot project `wiski` through the Penpot MCP tools; [README.md](README.md#design) has its id.

Design desktop screens at 1440×768 so the page never scrolls; only inner areas (asset panel, lists) may scroll. Mobile and tablet are out of scope until requested.

## UI text

Every user-visible string, `aria-label` and tooltip goes through `src/i18n.ts` in `es` and `en`, even where no language switch exists yet. Editor controls are icon-only: the text lives in the `aria-label` and the tooltip.

## Penpot API gotchas

- `setParentIndex(i)` counts from the end of `children`. To reorder, call `bringToFront()` on each child in the desired order and print `children.map(c => c.name)` to confirm.
- Layer names treat `/` as a path separator (shown as `/`). Keep URLs out of names and put them in a text layer.
- `resize()` switches a board to `fix` sizing: set `verticalSizing`/`horizontalSizing` back to `'auto'` afterwards.
- `insertChild(i, …)` counts from the end like `setParentIndex`: to place a child, `appendChild` the siblings in visual order.
- `createShapeFromSvg` returns a group with an invisible full-size wrapper rectangle: `resize` the group first, then remove the wrapper.
- Text wraps differently in Penpot and in the browser (a description fit 2 lines in Penpot, 3 in Chrome): check line counts in the browser before sizing containers.

## Visual check

Styling has no tests: compare the running UI against Penpot. With `make up` running, capture it with `google-chrome --headless=new --no-sandbox --window-size=1440,1200 --virtual-time-budget=10000 --screenshot=<file> http://localhost:5173/` and read the PNG next to `export_shape` of the board. The time budget lets web fonts load; the Vue devtools badge at the bottom is dev-only.

## Docker only

Bun is not installed on the host: run every command inside the `dev` container. The `Makefile` and [README.md](README.md) list the commands.

## Why `type-check` uses `node` instead of `bun`

`vue-tsc` does not resolve `.vue` modules under the Bun runtime ([vuejs/language-tools#6090](https://github.com/vuejs/language-tools/issues/6090)), so the image installs Node.js and the `type-check` script calls `node node_modules/vue-tsc/bin/vue-tsc.js --build`. Keep it that way: it is an intentional workaround, not an oversight.

## Import alias

`@/` → `src/` is configured in three places that must stay in sync: `vite.config.ts`, `tsconfig.json`/`tsconfig.app.json`, and `components.json` (read by the shadcn-vue CLI).
