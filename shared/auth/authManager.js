/* =========================================================
   FREE VOICE — AUTH MANAGER
   File: shared/auth/authManager.js
   Owner: Subhan Ahmad

   PURPOSE:
   - Google Sign-In only
   - Auto profile creation
   - Membership binding
========================================================= */

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

import APP_CONFIG from "../app.config.js";

/* =====================================================
   FIREBASE INIT (NO STORAGE USED)
===================================================== */
const firebaseApp = initializeApp(APP_CONFIG.firebase);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const provider = new GoogleAuthProvider();

/* =====================================================
   USER PROFILE CREATION
===================================================== */
async function createUserProfile(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photo: user.photoURL || null,
      membership: {
        active: false,
        plan: null,
        expiry: null
      },
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
  } else {
    await updateDoc(ref, {
      lastLogin: serverTimestamp()
    });
  }
}

/* =====================================================
   PUBLIC AUTH API
===================================================== */
async function loginWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  await createUserProfile(result.user);
  return result.user;
}

async function logout() {
  await signOut(auth);
}

function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/* =====================================================
   USER DATA FETCH
===================================================== */
async function getUserProfile(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

/* =====================================================
   MEMBERSHIP VALIDATION
===================================================== */
function isMembershipActive(profile) {
  if (!profile?.membership?.active) return false;
  if (!profile.membership.expiry) return false;
  return Date.now() < profile.membership.expiry;
}

/* =====================================================
   EXPORTS
===================================================== */
export {
  auth,
  loginWithGoogle,
  logout,
  onAuthChange,
  getUserProfile,
  isMembershipActive
};

/* =========================================================
   END OF FILE
   ✔ Google Auth only
   ✔ Auto profile
   ✔ Membership-safe
========================================================= */
