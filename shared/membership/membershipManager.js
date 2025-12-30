/* =========================================================
   FREE VOICE — MEMBERSHIP MANAGER
   File: shared/membership/membershipManager.js
   Owner: Subhan Ahmad

   PURPOSE:
   - Real-time membership validation
   - Immediate feature lock on expiry
   - Shared enforcement across all platforms
========================================================= */

import {
  doc,
  onSnapshot,
  updateDoc
} from "firebase/firestore";

import { auth } from "../auth/authManager.js";
import APP_CONFIG from "../app.config.js";

/* =====================================================
   INTERNAL STATE
===================================================== */
let currentProfile = null;
let unsubscribe = null;
let enforcementTimer = null;

/* =====================================================
   TIME HELPERS
===================================================== */
function now() {
  return Date.now();
}

function remainingMs(expiry) {
  return Math.max(0, expiry - now());
}

/* =====================================================
   ENFORCEMENT CORE
===================================================== */
function enforce(profile) {
  if (!profile?.membership) return;

  const { active, expiry } = profile.membership;

  if (!active || !expiry || now() >= expiry) {
    hardLock(profile);
  }
}

async function hardLock(profile) {
  if (!profile?.uid) return;

  try {
    await updateDoc(doc(APP_CONFIG.firestore, "users", profile.uid), {
      "membership.active": false,
      "membership.plan": null
    });
  } catch {
    // silent — local enforcement still applies
  }

  window.dispatchEvent(
    new CustomEvent("FREE_VOICE_MEMBERSHIP_EXPIRED")
  );
}

/* =====================================================
   REAL-TIME LISTENER
===================================================== */
function startMembershipListener(db) {
  const user = auth.currentUser;
  if (!user) return;

  unsubscribe = onSnapshot(
    doc(db, "users", user.uid),
    snap => {
      if (!snap.exists()) return;

      currentProfile = snap.data();
      enforce(currentProfile);
    }
  );

  enforcementTimer = setInterval(() => {
    if (currentProfile) enforce(currentProfile);
  }, APP_CONFIG.membership.checkIntervalMs);
}

/* =====================================================
   CLEANUP
===================================================== */
function stopMembershipListener() {
  if (unsubscribe) unsubscribe();
  unsubscribe = null;

  if (enforcementTimer) clearInterval(enforcementTimer);
  enforcementTimer = null;
}

/* =====================================================
   PUBLIC API
===================================================== */
function getMembershipStatus() {
  if (!currentProfile?.membership) {
    return {
      active: false,
      remainingMs: 0
    };
  }

  const { active, expiry } = currentProfile.membership;

  return {
    active: active && now() < expiry,
    remainingMs: remainingMs(expiry)
  };
}

/* =====================================================
   EXPORTS
===================================================== */
export {
  startMembershipListener,
  stopMembershipListener,
  getMembershipStatus
};

/* =========================================================
   END OF FILE
   ✔ Real-time enforcement
   ✔ Offline bypass blocked
   ✔ Live voice hard-stop ready
========================================================= */
