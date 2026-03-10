// =============================================================
// 🔥 FIREBASE CONFIG — REMPLIS AVEC TES PROPRES VALEURS
// =============================================================
// 1. Va sur https://console.firebase.google.com/
// 2. Crée un projet "vagos-pvp"
// 3. Ajoute une app Web (icône </>)
// 4. Copie les valeurs firebaseConfig ici
// 5. Active "Realtime Database" dans le menu à gauche
//    → Crée la base en mode "test" (pour commencer)
// =============================================================

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA9bLdT3E5ml_3mKXgLlqV1QzFSWPtRGic",
  authDomain: "vagos-pvp.firebaseapp.com",
  databaseURL: "https://vagos-pvp-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "vagos-pvp",
  storageBucket: "vagos-pvp.firebasestorage.app",
  messagingSenderId: "833468285703",
  appId: "1:833468285703:web:4d12446bf3896b4c917ba2"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export default app;
