import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAeZ55Z0xzUwDZZewJSK9OEvqQ_vsEPjb8",
  authDomain: "stock-market-2e8d5.firebaseapp.com",
  databaseURL: "https://stock-market-2e8d5-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "stock-market-2e8d5",
  storageBucket: "stock-market-2e8d5.firebasestorage.app",
  messagingSenderId: "949922389072",
  appId: "1:949922389072:web:6281cb9234d2a8ed584555",
  measurementId: "G-X3FBBKH17Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { db, auth, app };
