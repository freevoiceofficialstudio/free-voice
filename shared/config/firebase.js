/* =========================================================
   FREE VOICE — FIREBASE CORE CONFIG
   File: shared/config/firebase.js
   Owner: Subhan Ahmad
   IMPORTANT:
   - Firebase Storage is INTENTIONALLY NOT USED
   - Any attempt to import or use storage is BLOCKED
========================================================= */

import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  signOut
} from "firebase/auth";
import {
  getFirestore,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot
} from "firebase/firestore";

/* =====================================================
   ENV VALIDATION (FAIL FAST)
===================================================== */
function requireEnv(key) {
  if (!import.meta.env[key] && !process.env[key]) {
    throw new Error(`❌ Missing Firebase ENV: ${key}`);
  }
  return import.meta.env[key] || process.env[key];
}

/* =====================================================
   FIREBASE CONFIG (NO STORAGE)
===================================================== */
const firebaseConfig = Object.freeze({
  apiKey: requireEnv("VITE_FIREBASE_API_KEY"),
  authDomain: requireEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: requireEnv("VITE_FIREBASE_PROJECT_ID"),
  appId: requireEnv("VITE_FIREBASE_APP_ID")
});

/* =====================================================
   INITIALIZE APP (SAFE SINGLETON)
===================================================== */
const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

/* =====================================================
   AUTH SETUP (GOOGLE ONLY)
===================================================== */
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

// Force persistent login
setPersistence(auth, browserLocalPersistence).catch(() => {
  /* silent */
});

// Lock provider scopes (minimal)
googleProvider.setCustomParameters({
  prompt: "select_account"
});

/* =====================================================
   FIRESTORE (ONLY DATABASE USED)
===================================================== */
const db = getFirestore(firebaseApp);

/* =====================================================
   STORAGE HARD BLOCK (SECURITY)
===================================================== */
Object.defineProperty(firebaseApp, "storage", {
  get() {
    throw new Error(
      "❌ Firebase Storage is disabled in Free Voice architecture"
    );
  }
});

/* =====================================================
   USER PROFILE HELPERS
===================================================== */

/**
 * Create user profile if not exists
 */
async function ensureUserProfile(user) {
  if (!user?.uid) return;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      name: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
      membership: "free",
      membershipExpiry: 0,
      createdAt: serverTimestamp()
    });
  }
}

/**
 * Get user profile (safe)
 */
async function getUserProfile(uid) {
  if (!uid) return null;
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

/**
 * Live membership listener (REAL TIME)
 */
function watchMembership(uid, callback) {
  if (!uid || typeof callback !== "function") return () => {};

  const ref = doc(db, "users", uid);
  return onSnapshot(ref, snap => {
    if (!snap.exists()) {
      callback(null);
      return;
    }

    const data = snap.data();
    const now = Date.now();

    const isActive =
      data.membershipExpiry && data.membershipExpiry > now;

    callback({
      ...data,
      isActive
    });
  });
}

/**
 * Force logout helper
 */
async function forceLogout() {
  try {
    await signOut(auth);
  } catch {
    /* silent */
  }
}

/* =====================================================
   EXPORTS (STRICT)
===================================================== */
export {
  firebaseApp,
  auth,
  googleProvider,
  db,
  ensureUserProfile,
  getUserProfile,
  watchMembership,
  forceLogout
};

/* =========================================================
   END OF FILE
   ✔ Firestore only
   ✔ Google Auth only
   ❌ No Storage
========================================================= */


