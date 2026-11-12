# Ideas

Ideas que aún no son spec. Agrúpalas por tema.

Cuando una idea se convierte en spec, crea `specs/<nombre>.md` y quita la idea de esta lista. Las funcionalidades se construyen desde los specs, no desde las ideas.

## Diseño del editor

- Mover el Template strip más cerca del Worksheet, probablemente a un lado.
- Marcar el lomo del libro en el Worksheet, para que el usuario sepa si trabaja una Page izquierda o derecha.
- Poner la papelera a la derecha, con el margen derecho más ancho, para que se vean las Photos detrás.

## Sesión

- Guardar el id de la sesión en local storage.
- Modelo de una sesión:
  - duración en semanas
  - Cover y Back cover
  - número de Pages
  - número de Photos
  - un id
  - un tipo de álbum
  - estado de pago: pagada o por pagar
  - un PDF para imprimir
- Una Page tiene 0, 1 o varias Photos.
- Una Photo está en una sola Page. Puede haber Photos sin Page.
- Avisar al usuario de cuánto duran sus Photos (por ejemplo: «en x semanas se purgan»).
- De desktop a móvil: un botón siempre disponible para el código QR. El usuario continúa la sesión en el móvil y sube Photos desde ahí.
- De móvil a desktop: un diálogo para copiar o compartir la URL y seguir editando o subiendo Photos desde desktop.

## Backend

- Usar SQLite.
- Compilar con Bun.
- Procesar las Photos en el backend antes de guardarlas, con ImageMagick. La Resolution debe ser correcta para imprimir.
- Gestión de una Photo: esperar a tener el problema para mejorarlo.
- Pregunta: cuando el backend devuelve una Photo al frontend, ¿devuelve una versión más ligera?
- Hacer la API usable desde un CLI, para que un agente le pida cosas.

## Operaciones

- Monitorear los gigas de Photos, ataques y otros problemas con el plan gratuito de Grafana.
- Backoffice para controlar el estado de los álbumes, con usuario y contraseña.

## Marketing

- Para obtener el correo: ofrecer un descuento a cambio del correo y enviar una newsletter.
