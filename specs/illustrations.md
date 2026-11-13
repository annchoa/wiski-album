# Ilustraciones

## Goal

Añadir ilustraciones gratuitas a la **Illustration list** y guardar el crédito de cada autor. Marca cada punto con `[x]` cuando se cumpla.

## Checklist

- [x] Skill `add-illustration` (`.claude/skills/add-illustration/`): dada una carpeta con imágenes y `credits.json`, un script reduce el tamaño de cada imagen y guarda su crédito.
- [x] Créditos de las ilustraciones que ya estaban: `undraw_*` (fuente unDraw) y `arl_dlt-summer-7200676_640.png` (Arl, Pixabay). `lemon-blue.png` no tiene fuente y no lleva crédito. `rome-people.svg` se eliminó.
- [x] `arl_dlt-summer-7200676_640.png` y `pastelila_id-flower-7875159_1280.png` están en la Illustration list, con su crédito.
- [x] Una PNG empieza en su tamaño máximo de impresión y no crece más allá (ver «Tamaño en la Cover»).
- [ ] Revisar en el navegador cómo se ven la flor y la de Arl en la Cover.
- [ ] Probar la skill con ilustraciones nuevas.
- [ ] Las imágenes están en `public/illustrations/`.
- [ ] Cada imagen tiene su crédito en `src/data/illustration-credits.json`.
- [ ] Las ilustraciones nuevas están en la Illustration list.
- [ ] Los créditos aparecen en un footer, generados desde `illustration-credits.json`. Se hace después. Los textos salen de `i18n` en `es` y `en`.

## Flujo (el que menos tokens gasta)

El usuario deja las imágenes en una carpeta y escribe un `credits.json` en ella: una lista con una entrada por imagen, con `file` y el HTML de atribución (`attribution`) tal como lo da la fuente, o con los campos finales (`source`, `sourceUrl`, y opcional `author`, `authorUrl`). Una imagen sin entrada no tiene crédito. La skill corre el script y no lee ni las imágenes ni el JSON: los datos viajan por el sistema de archivos.

Si hay `attribution`, el script extrae del HTML el autor y la fuente, con sus URLs, y guarda los datos, no el HTML. El footer construye los enlaces desde esos datos. Ejemplo de HTML que da Pixabay:

```html
Image by <a href="https://pixabay.com/users/arl_dlt-25264338/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=7200676">Arl</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=7200676">Pixabay</a>
```

- Conserva los parámetros `utm_*` de las URLs.
- La licencia de Pixabay no exige atribución: se cita por cortesía. Revisa la de otras fuentes.
- Ancho máximo de los PNG y JPG: 1200 px. La Cover mide 20 cm de ancho (7,87 in) en los dos Products. 1200 px dan 152 ppi a todo el ancho, justo sobre el umbral de **Low resolution** (150 ppi, `src/lib/resolution.ts`). Una ilustración más pequeña que la Cover tiene más ppi. Más píxeles solo pesan más.
- Una imagen más pequeña que 1200 px no se amplía. Imprime nítida (150 ppi) hasta `píxeles / 150 × 2,54` cm de ancho: 416 px → 7 cm, 860 px → 14,6 cm.
- Los SVG se copian sin cambios.

## Tamaño en la Cover

Una ilustración PNG tiene un número fijo de píxeles. Su tamaño máximo es el ancho que aún imprime a 150 ppi: `píxeles / 150 × 2,54` cm. Eso se calcula con el ancho de la hoja del Product (`sheetWidthCm`).

- Una PNG empieza en ese tamaño máximo, sin pasar del ancho de la hoja.
- El usuario puede reducirla. No puede agrandarla más allá del máximo.
- Un SVG no tiene máximo: sigue empezando como `small` (icono de unos 30 px) o `large`.
- Para una PNG, `width` y `height` de `illustrations.ts` son sus píxeles reales. Para un SVG solo cuenta la proporción.
- La ilustración inicial de la Cover (`lemon-blue`) no cambia su tamaño de inicio, pero sí queda limitada por su máximo. Los PNG y JPG se reducen a un ancho máximo y se guardan como PNG.

## Open questions

- ¿Los créditos aparecen también en el PDF impreso? Por defecto, no.
- Confirmar el término **Credits** antes de usarlo en código o en el GLOSSARY.
