"use client";

import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;

async function getFirebaseApp() {
  if (firebaseApp) return firebaseApp;

  const { getApp, getApps, initializeApp } = await import("firebase/app");
  firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return firebaseApp;
}

export async function getClientAuth() {
  if (auth) return auth;

  const [{ getAuth }, app] = await Promise.all([
    import("firebase/auth"),
    getFirebaseApp()
  ]);
  auth = getAuth(app);
  return auth;
}

export async function getClientStorage() {
  if (storage) return storage;

  const [{ getStorage }, app] = await Promise.all([
    import("firebase/storage"),
    getFirebaseApp()
  ]);
  storage = getStorage(app);
  return storage;
}

export async function getClientFirestore() {
  if (firestore) return firestore;

  const [{ getFirestore }, app] = await Promise.all([
    import("firebase/firestore"),
    getFirebaseApp()
  ]);
  firestore = getFirestore(app);
  return firestore;
}

export async function createGoogleProvider() {
  const { GoogleAuthProvider } = await import("firebase/auth");
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: "select_account" });
  return googleProvider;
}

export async function initializeFirebaseAnalytics() {
  if (typeof window === "undefined") return null;
  const [{ getAnalytics, isSupported }, app] = await Promise.all([
    import("firebase/analytics"),
    getFirebaseApp()
  ]);
  const supported = await isSupported().catch(() => false);
  return supported ? getAnalytics(app) : null;
}
