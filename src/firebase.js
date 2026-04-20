import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD_vr_N3cE8P2slpaiBPyI3g4QRwCKylqQ",
  authDomain: "mediwise-1afe9.firebaseapp.com",
  projectId: "mediwise-1afe9",
  storageBucket: "mediwise-1afe9.firebasestorage.app",
  messagingSenderId: "763307259576",
  appId: "1:763307259576:web:d91271fc92aef73879e64d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
