// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbUaXY5iXpDs8MNuTpfgzFtxDcp9inzdc",
  authDomain: "masterpiece-cv.firebaseapp.com",
  projectId: "masterpiece-cv",
  storageBucket: "masterpiece-cv.firebasestorage.app",
  messagingSenderId: "81402561194",
  appId: "1:81402561194:web:d9c5d2879d7be0faae06d3",
  measurementId: "G-L02JQD8DCJ",
  databaseURL: "https://masterpiece-cv-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, googleProvider, analytics };