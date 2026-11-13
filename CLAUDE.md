# CLAUDE.md

## Design source

Before building or changing UI, read the Penpot project `wiski` through the Penpot MCP tools; [README.md](README.md#design) has its id.

Design desktop screens at 1440×768 so the page never scrolls; only inner areas (asset panel, lists) may scroll. Mobile and tablet are out of scope until requested.

## UI text

Every user-visible string, `aria-label` and tooltip goes through `src/i18n.ts` in `es` and `en`, even where no language switch exists yet. Editor controls are icon-only: the text lives in the `aria-label` and the tooltip. Exception: the Tool menu of Cover editing has text labels.

## Icons

Use `@phosphor-icons/vue` in the regular weight (the default). Phosphor has no vertical rectangle: rotate `PhRectangle` 90°. The Penpot design still draws lucide shapes until its icons are redrawn: pick the Phosphor equivalent.

## Penpot API gotchas

- `setParentIndex(i)` counts from the end of `children`. To reorder, call `bringToFront()` on each child in the desired order and print `children.map(c => c.name)` to confirm.
- Layer names treat `/` as a path separator (shown as `/`). Keep URLs out of names and put them in a text layer.
- `resize()` switches a board to `fix` sizing: set `verticalSizing`/`horizontalSizing` back to `'auto'` afterwards.
- `insertChild(i, …)` counts from the end like `setParentIndex`: to place a child, `appendChild` the siblings in visual order.
- `createShapeFromSvg` returns a group with an invisible full-size wrapper rectangle: `resize` the group first, then remove the wrapper.
- Text wraps differently in Penpot and in the browser (a description fit 2 lines in Penpot, 3 in Chrome): check line counts in the browser before sizing containers.

## Visual check

Styling has no tests: compare the running UI against Penpot. With `make up` running, capture it with `google-chrome --headless=new --no-sandbox --window-size=1440,1200 --virtual-time-budget=10000 --screenshot=<file> http://localhost:5173/` and read the PNG next to `export_shape` of the board. The time budget lets web fonts load; the Vue devtools badge at the bottom is dev-only.

Screenshots cannot show drags, hover states or the file picker. [scripts/](scripts/) drives the headless Chrome over CDP from the host's Node (≥ 22, built-in `WebSocket`): `cdp.mjs` launches it and presses, moves and drops the mouse, `fixtures.mjs` uploads test photos, and `drag-to-trash.mjs` is a runnable example (`node scripts/drag-to-trash.mjs`, with `make up` running). Detect the file picker with `Page.setInterceptFileChooserDialog` through `browser.send`.

After `bun add` or `bun remove`, Vite re-optimizes on the first page load and reloads it mid-script: open the page once and wait before running a script, or its first query returns `undefined`. A failed script leaves its Chrome running on port 9333: close it with `pkill -f "[w]iski-cdp-profile"` (the brackets stop `pkill` from matching its own shell).

Tests cannot judge how a PDF looks. Build a sample from a throwaway `.ts` file with `docker compose run --rm dev bun run <file>`, render it on the host with `pdftoppm -png -r 45 <file>.pdf <name>` and read the PNG. Delete the throwaway file afterwards.

## Drag and drop gotchas (`@vue-dnd-kit/core`)

- The draggable element gets `role` and `tabindex`, which overrides a `<li>`'s `listitem` role: make an inner `div` the draggable.
- The library already dims the dragged element (`opacity: .4`) and the overlay clone copies it: adding your own opacity doubles it.
- A drop target's `overOverlay` replaces the overlay while the drag is over it (used to shrink the photo over the asset panel and the trash); `snapCenterToCursor` centers the overlay on the cursor.

## Test gotchas

- `onClickOutside` (`@vueuse/core`) ignores a second click in the same macrotask and needs a `pointerdown` first: `await` a `setTimeout` between opening the menu and clicking outside.
- `reka-ui` dialogs unmount a moment after closing, and the rest of the page stays `aria-hidden` until then: assert with `findBy*` or `vi.waitFor`.
- A shortcut test must send the key to `document.activeElement`, not to the component root. `@pointerdown.prevent` stops the browser from focusing the element, so the key never arrives while the test still passes. `CoverPreview.spec.ts` has an example.
- Real drags cannot be simulated in happy-dom: check them in Chrome (see Visual check).
- happy-dom has no layout: `useElementSize` reads `NaN` or `0` and its `ResizeObserver` never reports a size. Stub `ResizeObserver` so it reports one on `observe`, as `slotSizedInPixels` does in `SlotCell.spec.ts`, and pass `box: 'border-box'` to `useElementSize` (the default content-box path turns empty padding strings into `NaN`).
- The `dev` container runs Node 20 and `pdfjs-dist` needs Node ≥ 22.13: read a PDF in tests with `pdf-lib` (`src/__tests__/pdfContent.ts`). Keep `pdfjs-dist` behind `src/lib/renderPdf.ts` and mock that module in component tests.

## Specs

Every new spec in `specs/` gets a row in `specs/index.md` with state `pending`. The **Resumen** column has at most 2 sentences about where the spec stands. Update it when the state changes.

## Formatting

Run `bunx biome check --write <files>` on the files you changed. On `src` it reorders imports and reflows lines in files you did not touch, and the diff fills with noise.

## Docker only

Bun is not installed on the host: run every command inside the `dev` container. The `Makefile` and [README.md](README.md) list the commands.

## Why `type-check` uses `node` instead of `bun`

`vue-tsc` does not resolve `.vue` modules under the Bun runtime ([vuejs/language-tools#6090](https://github.com/vuejs/language-tools/issues/6090)), so the image installs Node.js and the `type-check` script calls `node node_modules/vue-tsc/bin/vue-tsc.js --build`. Keep it that way: it is an intentional workaround, not an oversight.

## Import alias

`@/` → `src/` is configured in three places that must stay in sync: `vite.config.ts`, `tsconfig.json`/`tsconfig.app.json`, and `components.json` (read by the shadcn-vue CLI).
