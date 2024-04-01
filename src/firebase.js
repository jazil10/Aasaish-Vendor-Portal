// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage"; // Correct import for Firebase Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBlpku9kr-hi_xdgq4Im3RrMG-jWaqHmio",
  authDomain: "aasaish-86242.firebaseapp.com",
  projectId: "aasaish-86242",
  storageBucket: "aasaish-86242.appspot.com",
  messagingSenderId: "96457134829",
  appId: "1:96457134829:web:25008fb8d9ea8e6412f2e4",
  measurementId: "G-JLSVXNCP54"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);

// Initialize Firebase Analytics
const analytics = getAnalytics(app);

export { db, storage, app as default };
