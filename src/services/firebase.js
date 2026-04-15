// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCbijFwODksuIuUjMUh205-DwEoNPKXerI",
  authDomain: "mamevcosmetics.firebaseapp.com",
  projectId: "mamevcosmetics",
  storageBucket: "mamevcosmetics.firebasestorage.app",
  messagingSenderId: "235940846139",
  appId: "1:235940846139:web:3b2094c7a53dad6f0d1a1e",
  measurementId: "G-BV1JPJKZ65",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

const secondaryApp = initializeApp(firebaseConfig, "Secondary");
export const secondaryAuth = getAuth(secondaryApp);
