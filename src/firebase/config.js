/**
 * config.js
 * 
 * Firebase SDK Initialization and Configuration.
 * Connects to Firebase Authentication and Cloud Firestore.
 * Supports graceful fallback when keys are pending in .env.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Check if valid Firebase configuration is present
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
  !firebaseConfig.apiKey.includes('PASTE_')
);

// Initialize Firebase App singleton safely
let app;
let auth;
let db;

try {
  if (isFirebaseConfigured) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    try {
      db = initializeFirestore(app, {
        ignoreUndefinedProperties: true
      });
    } catch {
      db = getFirestore(app);
    }
  } else {
    // Dummy initialization fallback so imports never throw in dev mode
    app = null;
    auth = null;
    db = null;
  }
} catch (error) {
  console.warn('Firebase initialization notice:', error.message);
  app = null;
  auth = null;
  db = null;
}

export { app, auth, db };
export default firebaseConfig;
