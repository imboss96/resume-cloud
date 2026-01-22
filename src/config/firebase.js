// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, update } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbUaXY5iXpDs8MNuTpfgzFtxDcp9inzdc",
  authDomain: "masterpiece-cv.firebaseapp.com",
  projectId: "masterpiece-cv",
  storageBucket: "masterpiece-cv.firebasestorage.app",
  messagingSenderId: "81402561194",
  appId: "1:81402561194:web:d9c5d2879d7be0faae06d3",
  measurementId: "G-L02JQD8DCJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

export { app, database, ref, get, set, update, analytics };