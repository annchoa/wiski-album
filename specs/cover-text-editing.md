# Edición de texto de la Cover

## Goal

El usuario da formato al Title y a la Date line de la Cover desde la pestaña Tipografías del Tool panel: **Letter size**, **Line spacing**, **Letter spacing**, **Underline**, **Strikethrough** y **Alignment**. Es lo único nuevo: mover, escalar con Handles, editar el texto y elegir Typeface ya existen y no se especifican aquí. Las Pages no tienen texto y quedan fuera. Negrita y cursiva quedan fuera.

- **Barra de herramientas**
  - Va arriba de la lista de Typefaces, fija; solo la lista scrollea. El diseño está en Penpot (página `Worksheet/cover`); las medidas viven allí.
  - Se muestra siempre en la pestaña Tipografías. Sin texto seleccionado se ve deshabilitada, también el botón de espaciado.
  - Como la de Canva o Word, de solo icono. Los `aria-label` y tooltips salen de `i18n` en `es` y `en`.
  - De izquierda a derecha: grupo «− 46 +» del Letter size, Underline, Strikethrough, Alignment y Spacing.
- **Valor único por texto**: Title y Date line tienen cada uno el suyo, no por palabra. Cambiar el Typeface o el Color scheme los conserva.
- **Letter size**
  - Un grupo «− 46 +» sin icono delante. El número se puede teclear.
  - Se muestra en pt, derivado del ancho físico del Product, redondeado a entero. El modelo guarda la fracción del ancho de la hoja.
  - Rango de 8 a 150 pt, paso de 1 pt. El mismo rango vale para el Handle de esquina, que se detiene en el límite.
  - El Handle de esquina sigue escalando las letras y el campo se actualiza al instante.
- **Spacing**
  - Un botón de icono (una «T» sobre una flecha horizontal). Abre un popover bajo el botón con dos filas: Line spacing (`PhArrowsVertical`) y Letter spacing (`PhArrowsHorizontal`), cada una con «− valor +».
  - El botón se ve activo mientras el popover está abierto. El popover se cierra con clic fuera y con Escape.
  - **Line spacing**: multiplicador del Letter size, de 0,8 a 2,0, paso de 0,1. Empieza en 1,2 para Title y Date line, en lugar del `normal` actual.
  - **Letter spacing**: milésimas de em, de −100 a 500, paso de 10. Empieza en 0, el espaciado normal del Typeface.
- **Underline y Strikethrough**: interruptores por texto, apagados al empezar. El botón se ve activo, con fondo gris, mientras el texto los tiene.
- **Alignment**: un botón que cambia en cada clic entre izquierda, centro y derecha, con el icono del estado actual. Ambos textos empiezan centrados, como hoy.
- **Valor tecleado**: fuera de rango, se ajusta al límite al pulsar Enter o salir del campo. Vacío o no numérico, vuelve al valor anterior.
- **Caja al cambiar un valor**: el ancho y la esquina superior izquierda se quedan; el texto se reajusta y la vista mide la altura nueva. Si la altura pasa del borde inferior de la hoja, `y` sube hasta que quepa.
- **Código**: `fontSize` pasa a `letterSize`. Se añaden `lineSpacing`, `letterSpacing`, `underline`, `strikethrough` y `alignment` (`'left' | 'center' | 'right'`) al modelo.

## Open questions

- El usuario aprueba el board de Penpot (barra y popover) para empezar la implementación.
- El usuario confirma los seams de los tests: modelo `createCover`, conversión fracción ↔ pt, `ToolPanel` y cableado en `WorksheetView`.
