# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Vue 3 + TypeScript, Vite, Tailwind v4, shadcn-vue (estilo `reka-vega`, color base `neutral`, iconos `lucide`). Bun como runtime y package manager. Biome para lint/formato, no ESLint/Prettier. Vitest + Testing Library (Vue) con `happy-dom` para tests.

## Todo el flujo corre en Docker

No hace falta Bun instalado en el host; todos los comandos se ejecutan dentro del contenedor `dev`.

```sh
make up      # docker compose up — levanta el dev server en http://localhost:5173 con hot-reload
make down    # docker compose down
make test    # test:unit --run (una sola pasada, sin watch) dentro de un contenedor efímero
```

Con el servicio ya levantado (`make up` en otra terminal), para correr comandos sueltos:

```sh
docker compose exec dev bun run test:unit       # vitest en modo watch
docker compose exec dev bun run test:unit --run # una sola pasada
docker compose exec dev bun run type-check
docker compose exec dev bun run check           # biome lint + format (aplica fixes)
docker compose exec dev bun run lint            # solo lint, sin fixes
```

Para correr un test específico: `docker compose exec dev bun run test:unit <ruta-o-patrón>` (vitest filtra por nombre de archivo).

Instalar una dependencia nueva:

```sh
docker compose exec dev bun add <paquete>
docker compose build   # fija la dependencia en la imagen
```

Agregar un componente shadcn-vue:

```sh
docker compose exec dev bunx shadcn-vue@latest add <componente>
```

## Por qué `type-check` usa `node` en vez de `bun`

`vue-tsc` no resuelve módulos `.vue` correctamente bajo el runtime de Bun ([vuejs/language-tools#6090](https://github.com/vuejs/language-tools/issues/6090)). Por eso la imagen instala Node.js además de Bun, y el script `type-check` (`package.json`) invoca `vue-tsc` explícitamente con `node node_modules/vue-tsc/bin/vue-tsc.js --build` en vez de con `bunx`/`bun run`. El resto del proyecto (dev server, tests, build) corre sobre Bun sin problema. No "simplificar" ese script a `bunx vue-tsc` — es una solución intencional a un bug conocido, no un descuido.

## Alias de imports

`@/` → `src/`. Configurado en tres lugares que deben mantenerse en sync si cambia: `vite.config.ts` (resolve.alias), `tsconfig.json`/`tsconfig.app.json` (paths), y `components.json` (aliases, usado por el CLI de shadcn-vue al generar componentes).
