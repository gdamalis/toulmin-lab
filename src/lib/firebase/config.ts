// Firebase configuration
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if it hasn't been initialized
export const firebaseApp = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApps()[0];

export const auth = getAuth(firebaseApp);

// Disabled for now, due to the emulator not being able to provide a valid token
// // Connect to Auth emulator when in development
// if (process.env.NODE_ENV === 'development') {
//   connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
//   // Add persistence to keep auth state across redirects
//   setPersistence(auth, browserLocalPersistence);
// }

export default firebaseApp;
