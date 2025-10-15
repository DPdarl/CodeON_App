// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCeWUUSLKm5zy6UyoTF-fg2-QHtqMBrCW4",
  authDomain: "codeon-gamified-programming.firebaseapp.com",
  projectId: "codeon-gamified-programming",
  storageBucket: "codeon-gamified-programming.firebasestorage.app",
  messagingSenderId: "756330301463",
  appId: "1:756330301463:web:1cb2b4db509078aec0b452",
  measurementId: "G-LTY8KZ6CF3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;
