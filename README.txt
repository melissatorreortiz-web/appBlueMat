# Blue Mat Academy — estructura organizada

Esta versión separa el JavaScript del `index.html` sin cambiar deliberadamente la lógica funcional.

## Archivos
- `index.html`: estructura de la interfaz.
- `js/firebase-bridge.js`: inicializa Firebase y carga los módulos.
- `js/core.js`: estado global, referencias DOM y utilidades/base.
- `js/tarifas.js`: tarifas.
- `js/grupos.js`: grupos y días de clase.
- `js/usuarios.js`: usuarios y roles.
- `js/alumnos.js`: alumnos y expediente.
- `js/asistencia-grupo.js`: asistencia por grupo.
- `js/asistencia-individual.js`: asistencia individual, edición y eliminación.
- `js/cobranza.js`: eventos y lógica de cobranza.
- `js/importacion.js`: importación desde Sheets.
- `js/auth.js`: inicio de sesión.
- `js/perfil-y-arranque.js`: perfil, permisos y arranque final.

## Importante
`firebase-config.js` y `styles.css` permanecen en la raíz, junto a `index.html`.

Antes de sustituir la versión anterior, conservar una copia de seguridad.
