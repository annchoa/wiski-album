# wiski

Frontend Vue 3 + TypeScript, construido con Bun y shadcn-vue (Tailwind v4). Todo el flujo de trabajo corre dentro de Docker; no hace falta tener Bun instalado en el host.

## Desarrollo

```sh
docker compose up
```

Esto expone la app en http://localhost:5173 con hot-reload. El código se monta como bind mount; `node_modules` vive en un volumen nombrado aparte para no chocar con el `node_modules` instalado dentro de la imagen.

Para correr comandos sueltos dentro del contenedor (con el servicio ya levantado):

```sh
docker compose exec dev bun run test:unit
docker compose exec dev bun run type-check
docker compose exec dev bun run check   # biome lint + format
```

Para instalar una dependencia nueva:

```sh
docker compose exec dev bun add <paquete>
docker compose build   # para que quede fijada en la imagen
```

## Type-checking y Bun

`vue-tsc` no resuelve los módulos `.vue` correctamente cuando se ejecuta bajo el runtime de Bun ([vuejs/language-tools#6090](https://github.com/vuejs/language-tools/issues/6090)). Por eso la imagen instala Node.js además de Bun, y el script `type-check` invoca `vue-tsc` explícitamente con `node` en vez de con `bunx`/`bun run`. El resto del proyecto (dev server, tests, build) corre sobre Bun sin problema.

## Componentes UI (shadcn-vue)

```sh
docker compose exec dev bunx shadcn-vue@latest add <componente>
```

Estilo `vega` (el antiguo "New York"), color base `neutral`, variables CSS para temas (modo oscuro preparado a nivel de CSS, sin selector de UI todavía).

## Convenciones

- Lint y formato: [Biome](https://biomejs.dev/) (comillas simples, sin punto y coma). `bun run check` aplica fixes.
- Tests: [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/docs/vue-testing-library/intro/), entorno `happy-dom`.
- Alias de imports: `@/` → `src/`.
