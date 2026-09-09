import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDgPKZFVm6H0Tvq9KzApZ_szX7e0bOglpQ",
    authDomain: "blue-mat-academy.firebaseapp.com",
    projectId: "blue-mat-academy",
    storageBucket: "blue-mat-academy.firebasestorage.app",
    messagingSenderId: "693145778237",
    appId: "1:693145778237:web:6f3776daa4520ac5dc1254"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
