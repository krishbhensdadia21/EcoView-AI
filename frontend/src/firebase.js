// /frontend/src/firebase.js
// Firebase Web (client) SDK setup — this is DIFFERENT from the backend's
// firebase_credentials.json (that's the Admin SDK, server-only, never used
// in the browser). This file uses the public Web App config, which is safe
// to expose client-side.
//
// Get these values from: Firebase Console → Project Settings → General →
// "Your apps" → Web app → SDK setup and configuration → Config.
//
// Put them in frontend/.env (see .env.example) as VITE_FIREBASE_* — never
// hardcode them here or commit a filled-in .env file.

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missingKeys.length > 0) {
  // Don't throw — let the app still render (so Scan/Results etc. keep
  // working for anonymous users) but make it obvious in the console why
  // login isn't working yet.
  console.warn(
    `[firebase] Missing config values: ${missingKeys.join(", ")}. ` +
    `Add them to frontend/.env — see .env.example. Google Sign-In will not work until then.`
  );
}

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
