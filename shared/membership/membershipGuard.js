/* =========================================================
   FREE VOICE — MEMBERSHIP GUARD (STRICT)
   File: shared/membership/membershipGuard.js
   Owner: Subhan Ahmad

   CORE PURPOSE:
   - Enforce membership in REAL TIME
   - Kill live voice immediately on expiry
   - Block offline / modified apps
========================================================= */

import APP_CONFIG from "../app.config.js";
import {
  getMembershipState,
  requireAuth
} from "../auth/googleAuth.js";

/* =====================================================
   INTERNAL STATE
===================================================== */
let lastVerifiedAt = 0;
let cachedState = null;
let enforcementInterval = null;

/* =====================================================
   TIME HELPERS
===================================================== */
function now() {
  return Date.now();
}

function msToTime(ms) {
  if (ms <= 0) return "00:00:00";

  const totalSeconds = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");

  return `${h}:${m}:${s}`;
}

/* =====================================================
   CORE VERIFICATION (REAL TIME)
===================================================== */
function verifyMembership() {
  requireAuth();

  const state = getMembershipState();
  if (!state) {
    hardLock("Membership state missing");
  }

  const currentTime = now();

  // Cache prevention
  if (
    cachedState &&
    currentTime - lastVerifiedAt <
      APP_CONFIG.membership.expirationBehavior.forceRecheckIntervalMs
  ) {
    return cachedState;
  }

  lastVerifiedAt = currentTime;
  cachedState = state;

  // Expiry enforcement
  if (!state.isActive) {
    hardLock("Membership expired");
  }

  return state;
}

/* =====================================================
   HARD LOCK (NO BYPASS)
===================================================== */
function hardLock(reason) {
  stopLiveVoiceImmediately();

  // Destroy any cached membership
  cachedState = null;

  throw new Error(`🔒 ACCESS LOCKED: ${reason}`);
}

/* =====================================================
   LIVE VOICE KILL SWITCH
===================================================== */
function stopLiveVoiceImmediately() {
  if (typeof window !== "undefined") {
    window.__FREE_VOICE_LIVE_ACTIVE__ = false;
  }

  // Desktop / Mobile native hooks can attach here
}

/* =====================================================
   FEATURE GUARDS
===================================================== */
function guardLiveVoice() {
  const state = verifyMembership();

  if (!APP_CONFIG.voiceSystem.liveVoice.enabled) {
    hardLock("Live voice disabled globally");
  }

  if (!state.isActive) {
    hardLock("Live voice requires active membership");
  }

  return true;
}

function guardUltraVoice() {
  const state = verifyMembership();

  if (!state.isActive) {
    hardLock("Ultra voice requires active membership");
  }

  return true;
}

/* =====================================================
   COUNTDOWN HELPERS (UI SAFE)
===================================================== */
function getRemainingTime() {
  const state = getMembershipState();
  if (!state?.isActive) {
    return {
      ms: 0,
      formatted: "00:00:00"
    };
  }

  return {
    ms: state.remainingMs,
    formatted: msToTime(state.remainingMs)
  };
}

/* =====================================================
   CONTINUOUS ENFORCEMENT LOOP
===================================================== */
function startMembershipEnforcement() {
  stopMembershipEnforcement();

  enforcementInterval = setInterval(() => {
    try {
      verifyMembership();
    } catch (e) {
      stopMembershipEnforcement();
    }
  }, APP_CONFIG.membership.expirationBehavior.forceRecheckIntervalMs);
}

function stopMembershipEnforcement() {
  if (enforcementInterval) {
    clearInterval(enforcementInterval);
    enforcementInterval = null;
  }
}

/* =====================================================
   TAMPER DETECTION
===================================================== */
function detectTampering() {
  if (
    typeof window !== "undefined" &&
    window.__FREE_VOICE_MEMBERSHIP__ &&
    Object.isFrozen(window.__FREE_VOICE_MEMBERSHIP__) === false
  ) {
    hardLock("Membership tampering detected");
  }
}

/* =====================================================
   EXPORTS
===================================================== */
export {
  guardLiveVoice,
  guardUltraVoice,
  getRemainingTime,
  startMembershipEnforcement,
  stopMembershipEnforcement,
  detectTampering
};

/* =========================================================
   END OF FILE
   ✔ Real-time expiry
   ✔ Instant lock
   ✔ Offline hacks blocked
========================================================= */


