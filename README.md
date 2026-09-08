# Blue Mat Academy — Administración

App web (HTML + JS + Firebase) para administrar Blue Mat Academy (taekwondo):
alumnos, grupos, tarifas y becas, cobranza mensual, anualidad, recordatorios
por WhatsApp, importación desde Google Sheets, y usuarios con roles
(administrador, recepción, instructor).

Es una app estática de un solo archivo (`index.html`) que se conecta
directo a Firebase (Firestore + Authentication) desde el navegador. No
tiene backend propio ni proceso de build.

## Archivos de este repositorio

- **`index.html`** — la app completa (HTML, CSS y JavaScript en un solo archivo).
- **`firebase-config.js`** — tu configuración real de Firebase. **No viene
  en este repo** (ver abajo). Sin este archivo la app no carga.
- **`firebase-config.example.js`** — plantilla de cómo debe verse ese
  archivo. Cópialo, renómbralo a `firebase-config.js` y pon tus datos reales.
- **`firestore.rules`** — las reglas de seguridad de Firestore, para
  tenerlas versionadas junto con el código (además de publicadas en
  Firebase Console).

## Configuración inicial

1. Copia `firebase-config.example.js` → `firebase-config.js` y rellena tus
   valores reales (Firebase Console → ⚙️ Configuración del proyecto → tus
   apps → SDK setup and configuration).
2. En Firebase Console → Firestore Database → Reglas, pega el contenido de
   `firestore.rules` y publica.
3. Asegúrate de tener al menos un documento en la colección `usuarios` con
   tu propio UID, `rol: "admin"` y `activo: true` — si no, nadie puede
   entrar a la app (ni siquiera tú).

## ¿Necesito Vercel?

**No.** Esta app es 100% estática — no hay build, no hay backend propio,
todo el "servidor" es Firebase. Vercel no aporta nada aquí que no te dé
una opción más simple. Las alternativas razonables, de más a menos
recomendada para este proyecto:

- **Firebase Hosting** (recomendada): ya usas Firebase para todo lo demás,
  así que hospedar ahí también mantiene todo en un solo lugar. Gratis para
  este tamaño de proyecto, HTTPS automático, y el despliegue es un solo
  comando (`firebase deploy`) una vez que corres `firebase init hosting`
  en esta carpeta.
- **GitHub Pages**: igual de válido, gratis, y ya que vas a tener el
  código en GitHub de todas formas, activarlo es cuestión de un ajuste en
  Settings → Pages del repositorio. Sin comandos ni cuentas nuevas.
- **Vercel / Netlify**: funcionan perfecto también (arrastran y sueltan
  cualquier carpeta estática), pero no tienen ninguna ventaja real sobre
  las dos opciones de arriba para este caso — son más útiles cuando hay
  un framework con build (Next.js, etc.), que no es tu caso.

## Nota sobre `firebase-config.js` y repos públicos

Los valores de `firebaseConfig` (apiKey, authDomain, etc.) **no son
secretos** — Firebase los diseñó para vivir en el navegador de cualquiera
que abra la app. La seguridad real la dan las reglas de Firestore
(`firestore.rules`) y Firebase Authentication, no ocultar este archivo.
Puedes subirlo a un repo público sin problema. Si de todas formas
prefieres no hacerlo, agrégalo a `.gitignore` y súbelo solo a tu hosting
manualmente.
