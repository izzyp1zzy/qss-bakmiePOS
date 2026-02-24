// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Konfigurasi dari file App.jsx kamu sebelumnya
const firebaseConfig = {
  apiKey: "AIzaSyCiSq-gr6rbD0eUCbWyMBSBSPnrtBwQG9o",
  authDomain: "first-c8892.firebaseapp.com",
  projectId: "first-c8892",
  storageBucket: "first-c8892.firebasestorage.app",
  messagingSenderId: "581412448552",
  appId: "1:581412448552:web:e72f55a7deef47ee70081d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export service agar bisa dipakai di file lain
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;