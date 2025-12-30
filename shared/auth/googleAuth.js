/* =========================================================
   FREE VOICE — GOOGLE AUTH CONTROLLER
   File: shared/auth/googleAuth.js
   Owner: Subhan Ahmad

   RULES:
   ✔ Google Sign-In ONLY
   ✔ Auto create user profile
   ✔ Attach membership listener
   ❌ No anonymous auth
   ❌ No other providers
========================================================= */

import {
  auth,
  googleProvider,
  ensureUserProfile,
  watchMembership,
  forceLogout
} from "../config/firebase.js";

/* =====================================================
   INTERNAL STATE
===================================================== */
let currentUser = null;
let unsubscribeMembership = null;

/* =====================================================
   AUTH STATE LISTENER (GLOBAL)
===================================================== */
auth.onAuthStateChanged(async user => {
  if (!user) {
    cleanup();
    return;
  }

  currentUser = user;

  // Ensure Firestore profile exists
  await ensureUserProfile(user);

  // Attach real-time membership listener
  unsubscribeMembership = watchMembership(user.uid, state => {
    window.__FREE_VOICE_MEMBERSHIP__ = state;
  });
});

/* =====================================================
   LOGIN WITH GOOGLE
===================================================== */
async function loginWithGoogle() {
  try {
    const { signInWithPopup } = await import("firebase/auth");

    const result = await signInWithPopup(auth, googleProvider);

    if (!result?.user) {
      throw new Error("❌ Google authentication failed");
    }

    return result.user;
  } catch (err) {
    throw new Error(
      err?.message || "❌ Google Sign-In Error"
    );
  }
}

/* =====================================================
   LOGOUT (FORCED CLEANUP)
===================================================== */
async function logout() {
  cleanup();
  await forceLogout();
}

/* =====================================================
   CLEANUP HANDLER
===================================================== */
function cleanup() {
  currentUser = null;

  if (typeof unsubscribeMembership === "function") {
    unsubscribeMembership();
    unsubscribeMembership = null;
  }

  if (typeof window !== "undefined") {
    delete window.__FREE_VOICE_MEMBERSHIP__;
  }
}

/* =====================================================
   GET CURRENT USER (SAFE)
===================================================== */
function getCurrentUser() {
  return currentUser;
}

/* =====================================================
   GET MEMBERSHIP STATE (SAFE)
===================================================== */
function getMembershipState() {
  if (typeof window === "undefined") return null;
  return window.__FREE_VOICE_MEMBERSHIP__ || null;
}

/* =====================================================
   ACCESS GUARDS
===================================================== */
function requireAuth() {
  if (!currentUser) {
    throw new Error("🔒 Login Required");
  }
}

function requireActiveMembership() {
  const state = getMembershipState();
  if (!state?.isActive) {
    throw new Error("🔒 Active Membership Required");
  }
}

/* =====================================================
   EXPORTS
===================================================== */
export {
  loginWithGoogle,
  logout,
  getCurrentUser,
  getMembershipState,
  requireAuth,
  requireActiveMembership
};

/* =========================================================
   END OF FILE
   ✔ Google only
   ✔ Auto profile
   ✔ Real-time membership
========================================================= */


