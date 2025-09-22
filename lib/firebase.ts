import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAdb2Rhscsaan-CDtfifbXJI7EWGJxRhV4",
  authDomain: "learnsight-2c59e.firebaseapp.com",
  projectId: "learnsight-2c59e",
  storageBucket: "learnsight-2c59e.firebasestorage.app",
  messagingSenderId: "259767805521",
  appId: "1:259767805521:web:5b199bdd70a804acac3a70",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
