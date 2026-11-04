# wiski

Vue 3 + TypeScript frontend, built with Bun and shadcn-vue (Tailwind v4). The whole workflow runs inside Docker; Bun does not need to be installed on the host.

## Design

The UI design lives in the Penpot project named `wiski` (file id `0f3fb038-01f9-8046-8008-c9b32eb8336d`), all of it, whatever pages it has. It is the source of truth for layout, colors and typography.

## Development

```sh
docker compose up
```

This exposes the app at http://localhost:5173 with hot-reload. The code is bind-mounted; `node_modules` lives in a separate named volume so it does not clash with the `node_modules` installed inside the image.

To run one-off commands inside the container (with the service already up):

```sh
docker compose exec dev bun run test:unit
docker compose exec dev bun run type-check
docker compose exec dev bun run check   # biome lint + format
```

To install a new dependency:

```sh
docker compose exec dev bun add <package>
docker compose build   # to pin it in the image
```

## Type-checking and Bun

`vue-tsc` does not resolve `.vue` modules correctly when run under the Bun runtime ([vuejs/language-tools#6090](https://github.com/vuejs/language-tools/issues/6090)). That is why the image installs Node.js alongside Bun, and why the `type-check` script invokes `vue-tsc` explicitly with `node` instead of `bunx`/`bun run`. The rest of the project (dev server, tests, build) runs on Bun without problems.

## UI components (shadcn-vue)

```sh
docker compose exec dev bunx --bun shadcn-vue@latest add <component>
```

`--bun` is required: the CLI's `undici` needs a newer Node than the one in the image (20), so without it the command crashes on `zstd`.

`vega` style (the former "New York"), `neutral` base color, CSS variables for theming (dark mode prepared at the CSS level, no UI toggle yet).

## Conventions

- Lint and format: [Biome](https://biomejs.dev/) (single quotes, no semicolons). `bun run check` applies fixes.
- Tests: [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/docs/vue-testing-library/intro/), `happy-dom` environment.
- Import alias: `@/` → `src/`.
