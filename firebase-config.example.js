// ⚠️ Esto es una PLANTILLA, no tu archivo real.
//
// Renómbralo a "firebase-config.js" y pon aquí los valores
// que ya tienes funcionando (los ves en Firebase Console →
// Configuración del proyecto → tus apps → SDK setup and
// configuration → Config).
//
// index.html espera exactamente este archivo, en la misma
// carpeta, exportando "db" y "auth".

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "blue-mat-academy.firebaseapp.com",
    projectId: "blue-mat-academy",
    storageBucket: "blue-mat-academy.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
