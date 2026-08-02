// src/config/firebase-config.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Para autenticação
import { getFirestore } from "firebase/firestore"; // Para Firestore, se necessário
import { getDatabase } from "firebase/database"; // Para Realtime Database, se necessário

// Sua configuração do Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID",
  measurementId: "SEU_MEASUREMENT_ID"
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);

// Obtenha instâncias dos serviços
const auth = getAuth(app);
const firestore = getFirestore(app);
// const database = getDatabase(app);

export { auth, firestore };
