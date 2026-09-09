# Blue Mat Academy — Administración

App web (HTML + JS + Firebase) para administrar Blue Mat Academy (taekwondo):
alumnos, grupos, tarifas y becas, cobranza mensual, anualidad, recibos por
correo con QR, recordatorios por WhatsApp, importación desde Google Sheets,
usuarios con roles (administrador, recepción, instructor), y un kiosco de
check-in por tarjeta NFC.

Es una app estática (sin backend propio, sin proceso de build) que se
conecta directo a Firebase (Firestore + Authentication) desde el navegador.

## Archivos de este repositorio

- **`index.html`** — el panel de administración completo.
- **`styles.css`** — los estilos de `index.html` (debe estar en la misma
  carpeta, si no la app se ve sin diseño).
- **`checkin.html`** — el kiosco de asistencia por NFC. Página aparte, sin
  login, pensada para dejarla abierta en una pantalla/tablet en la entrada.
- **`firebase-config.js`** — tu configuración real de Firebase. **No viene
  en este repo** (ver abajo). Sin este archivo NINGUNA de las páginas carga.
- **`firebase-config.example.js`** — plantilla de cómo debe verse ese
  archivo. Cópialo, renómbralo a `firebase-config.js` y pon tus datos reales.
- **`firestore.rules`** — las reglas de seguridad de Firestore, para
  tenerlas versionadas junto con el código (además de publicadas en
  Firebase Console).

## Configuración inicial

1. Copia `firebase-config.example.js` → `firebase-config.js` y rellena tus
   valores reales (Firebase Console → ⚙️ Configuración del proyecto → tus
   apps → SDK setup and configuration). Este mismo archivo lo usan tanto
   `index.html` como `checkin.html`.
2. En Firebase Console → Firestore Database → Reglas, pega el contenido de
   `firestore.rules` y publica.
3. Asegúrate de tener al menos un documento en la colección `usuarios` con
   tu propio UID, `rol: "admin"` y `activo: true` — si no, nadie puede
   entrar a la app (ni siquiera tú).
4. **Para el kiosco de NFC**: en Firebase Console → Authentication →
   Sign-in method, activa el proveedor **Anonymous**. Sin esto,
   `checkin.html` no puede ni conectarse.
5. **Para el recibo por correo**: crea una cuenta gratis en
   [emailjs.com](https://www.emailjs.com), conecta tu correo como "Email
   Service", crea un "Email Template" con las variables `to_email`,
   `alumno_nombre`, `periodo`, `monto`, `fecha_pago`, `metodo_pago`,
   `folio` y `qr_url` (esta última como `<img src="{{qr_url}}">` en el
   HTML de la plantilla), y pon tu Public Key, Service ID y Template ID
   en las constantes `EMAILJS_*` al inicio del `<script>` de `index.html`.

## Kiosco de check-in (`checkin.html`)

Pensado para dejarlo abierto en una tablet o mini-pantalla en la entrada,
sin que nadie tenga que iniciar sesión. Usa una sesión anónima de Firebase
(invisible para el alumno) y solo puede leer un directorio mínimo
(`directorio_nfc`: nombre, foto, y si está activo) — nunca teléfono,
correo, ni datos de pago. Ese directorio se mantiene sincronizado solo,
cada vez que das de alta o editas un alumno con NFC UID asignado desde
`index.html`.

Funciona con cualquier lector NFC que se comporte como teclado (manda el
UID como si se tecleara) — típico en lectores USB tipo "keyboard wedge".
Tu ESP32 + RC522 puede mandar el UID por la misma vía si lo configuras en
modo HID, o adaptar el mismo patrón para escribir directo a Firestore.

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
