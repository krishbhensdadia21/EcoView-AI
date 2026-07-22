// /frontend/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import toast from "react-hot-toast";
import { auth, googleProvider } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      toast.success(`Welcome, ${result.user.displayName?.split(" ")[0] || "there"}!`);
      return result.user;
    } catch (err) {
      // Popup closed by user is not a real error — don't scare them with a toast
      if (err?.code !== "auth/popup-closed-by-user" && err?.code !== "auth/cancelled-popup-request") {
        console.error("Google sign-in failed:", err);
        toast.error("Sign-in failed. Please try again.");
      }
      return null;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success("Signed out.");
    } catch (err) {
      console.error("Sign-out failed:", err);
      toast.error("Sign-out failed. Please try again.");
    }
  };

  // Grab a fresh Firebase ID token to send to the backend as
  // `Authorization: Bearer <token>` on authenticated requests.
  const getIdToken = async () => {
    if (!auth.currentUser) return null;
    try {
      return await auth.currentUser.getIdToken();
    } catch (err) {
      console.error("Failed to get ID token:", err);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, signInWithGoogle, logout, getIdToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
