// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD-pWvMe0DjE4NZQsmfPlTmm-4yayli_OU",
  authDomain: "velarix-spell.firebaseapp.com",
  projectId: "velarix-spell",
  storageBucket: "velarix-spell.firebasestorage.app",
  messagingSenderId: "347977401632",
  appId: "1:347977401632:web:0bf9d772c7b29b7b9b0345",
  measurementId: "G-N5J9FD5KL9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const token = await result.user.getIdToken();
    return { user: result.user, token: token };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const getCurrentUserToken = async () => {
  const user = auth.currentUser;
  if (user) return await user.getIdToken();
  return null;
};
