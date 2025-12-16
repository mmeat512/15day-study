import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
// Check if app is already initialized BEFORE any operations
const isAppInitialized = getApps().length > 0;

const app = isAppInitialized ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Firestore with long polling for Vercel compatibility
// CRITICAL: Only initialize Firestore once, on first app initialization
const db = isAppInitialized
  ? getFirestore(app)
  : initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });

// Validate config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    "Firebase config is missing. Please check your .env.local file."
  );
}

export { app, auth, db };
