// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyClaAckNGehLO70upvTGx-3MH0R2BF9fEY",
  authDomain: "reportapp-585ec.firebaseapp.com",
  projectId: "reportapp-585ec",
  storageBucket: "reportapp-585ec.firebasestorage.app",
  messagingSenderId: "1013295658594",
  appId: "1:1013295658594:web:3ea0a766cf91cbf048833b",
  measurementId: "G-MGJC15CQHM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

