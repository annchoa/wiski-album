# CLAUDE.md

## Design source

Before building or changing UI, read the Penpot project `wiski` through the Penpot MCP tools; [README.md](README.md#design) has its id.

## Docker only

Bun is not installed on the host: run every command inside the `dev` container. The `Makefile` and [README.md](README.md) list the commands.

## Why `type-check` uses `node` instead of `bun`

`vue-tsc` does not resolve `.vue` modules under the Bun runtime ([vuejs/language-tools#6090](https://github.com/vuejs/language-tools/issues/6090)), so the image installs Node.js and the `type-check` script calls `node node_modules/vue-tsc/bin/vue-tsc.js --build`. Keep it that way: it is an intentional workaround, not an oversight.

## Import alias

`@/` → `src/` is configured in three places that must stay in sync: `vite.config.ts`, `tsconfig.json`/`tsconfig.app.json`, and `components.json` (read by the shadcn-vue CLI).
