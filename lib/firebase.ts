"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider
} from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAn1Paw2vhn089IbbttzoUb6Txqs2DdCc0",
  authDomain: "foodystar-3d903.firebaseapp.com",
  projectId: "foodystar-3d903",
  storageBucket: "foodystar-3d903.firebasestorage.app",
  messagingSenderId: "802523323966",
  appId: "1:802523323966:web:30e8d7a55cc30ddcd2fb6f",
  measurementId: "G-8FYSMTY9VW"
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export async function initializeFirebaseAnalytics() {
  if (typeof window === "undefined") return null;
  const supported = await isSupported().catch(() => false);
  return supported ? getAnalytics(firebaseApp) : null;
}
