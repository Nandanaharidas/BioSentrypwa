// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCC_JBgaVs9sNve6LTQQcpwF_UjyNLlW6g",
  authDomain: "biosentry-3dabf.firebaseapp.com",
  projectId: "biosentry-3dabf",
  storageBucket: "biosentry-3dabf.firebasestorage.app",
  messagingSenderId: "1087161359925",
  appId: "1:1087161359925:web:f26dfde5bdcfb1af8a5b7c",
  measurementId: "G-4Y3JM2TLWG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);