// Blue Mat Academy - puente de Firebase
// Este archivo inicializa las dependencias de Firebase y después carga
// los módulos de la aplicación en orden. Los módulos conservan el estado
// compartido para minimizar cambios sobre la aplicación que ya funciona.

import { db, auth } from "../firebase-config.js";
import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { collection, getDocs, getDoc, addDoc, setDoc, doc, updateDoc, deleteDoc, Timestamp, query, where } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

Object.assign(window, { db, auth, initializeApp, deleteApp, collection, getDocs, getDoc, addDoc, setDoc, doc, updateDoc, deleteDoc, Timestamp, query, where, getAuth, onAuthStateChanged, signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword, signOut });

const archivos = [
    "core.js",
    "tarifas.js",
    "grupos.js",
    "usuarios.js",
    "alumnos.js",
    "asistencia-grupo.js",
    "asistencia-individual.js",
    "cobranza.js",
    "importacion.js",
    "auth.js",
    "perfil-y-arranque.js"
];

function cargarScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `./js/${src}`;
        script.async = false;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
        document.body.appendChild(script);
    });
}

for (const archivo of archivos) {
    await cargarScript(archivo);
}
