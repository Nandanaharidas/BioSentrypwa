import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBsMDCr4gGNmdtaKQDFcYa4kQcs5VfRKJ4",
    authDomain: "biosentry-3dabf.firebaseapp.com",
    projectId: "biosentry-3dabf",
    storageBucket: "biosentry-3dabf.firebasestorage.app",
    messagingSenderId: "1087161359925",
    appId: "1:1087161359925:web:99fe49e626c02c868a5b7c",
    measurementId: "G-2X75T0HJD0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
