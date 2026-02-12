import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBrcgEvqhipZ5H4U0lG3N2q4nChlVvIk2I",
  authDomain: "constellate-traction-hub.firebaseapp.com",
  projectId: "constellate-traction-hub",
  storageBucket: "constellate-traction-hub.firebasestorage.app",
  messagingSenderId: "64108002364",
  appId: "1:64108002364:web:e87cc5b02d731a20e19739",
  measurementId: "G-FTJB4BHVDZ"
};

// Initialize Firebase safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, auth, db, analytics };