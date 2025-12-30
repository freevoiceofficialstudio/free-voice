/* =========================================================
   FREE VOICE — OFFLINE VOICE MANAGER (STRICT)
   File: shared/voice/offlineVoiceManager.js
   Owner: Subhan Ahmad

   RULES:
   ✔ Offline voices allowed
   ✔ No modification
   ✔ No copying
   ✔ Membership expiry = disable offline access
========================================================= */

import APP_CONFIG from "../app.config.js";
import {
  getMembershipState
} from "../auth/googleAuth.js";

/* =====================================================
   INTERNAL STATE
===================================================== */
const OFFLINE_KEY_PREFIX = "__FREE_VOICE__OFFLINE__";
let offlineAccessLocked = false;

/* =====================================================
   STORAGE HELPERS
===================================================== */
function getKey(voiceId) {
  return `${OFFLINE_KEY_PREFIX}${voiceId}`;
}

function readLocal(voiceId) {
  try {
    const raw = localStorage.getItem(getKey(voiceId));
    if (!raw) return null;

    const data = JSON.parse(raw);

    if (
      !data ||
      data.locked !== true ||
      data.voiceId !== voiceId
    ) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function writeLocal(voiceId, payload) {
  const wrapped = Object.freeze({
    voiceId,
    payload,
    locked: true,
    createdAt: Date.now()
  });

  localStorage.setItem(getKey(voiceId), JSON.stringify(wrapped));
}

/* =====================================================
   MEMBERSHIP CHECK (OFFLINE SAFE)
===================================================== */
function hasOfflinePermission() {
  const state = getMembershipState();

  if (!state) return false;

  // Free voices always allowed
  if (state.plan === "free") return true;

  // Premium required for others
  return state.isActive === true;
}

/* =====================================================
   ACCESS GUARD
===================================================== */
function guardOfflineVoice(voice) {
  if (!APP_CONFIG.voiceSystem.offlineMode.enabled) {
    throw new Error("🔒 Offline mode disabled");
  }

  if (!hasOfflinePermission()) {
    offlineAccessLocked = true;
    throw new Error(
      "🔒 Offline voice locked — Membership expired"
    );
  }

  if (offlineAccessLocked) {
    throw new Error("🔒 Offline access permanently locked");
  }

  return true;
}

/* =====================================================
   SAVE OFFLINE VOICE (CONTROLLED)
===================================================== */
function saveOfflineVoice(voiceId, payload) {
  guardOfflineVoice({ id: voiceId });
  writeLocal(voiceId, payload);
}

/* =====================================================
   LOAD OFFLINE VOICE
===================================================== */
function loadOfflineVoice(voiceId) {
  guardOfflineVoice({ id: voiceId });

  const data = readLocal(voiceId);
  if (!data) {
    throw new Error("❌ Offline voice not found");
  }

  return data.payload;
}

/* =====================================================
   INVALIDATE ALL OFFLINE VOICES
===================================================== */
function invalidateOfflineVoices() {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(OFFLINE_KEY_PREFIX)) {
      localStorage.removeItem(key);
    }
  });

  offlineAccessLocked = true;
}

/* =====================================================
   TAMPER DETECTION
===================================================== */
function detectOfflineTamper() {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(OFFLINE_KEY_PREFIX)) {
      const data = readLocal(key.replace(OFFLINE_KEY_PREFIX, ""));
      if (!data) {
        invalidateOfflineVoices();
      }
    }
  });
}

/* =====================================================
   EXPORTS
===================================================== */
export {
  saveOfflineVoice,
  loadOfflineVoice,
  invalidateOfflineVoices,
  detectOfflineTamper
};

/* =========================================================
   END OF FILE
   ✔ Offline voices protected
   ✔ Expiry = disable
   ✔ No copy / modify
========================================================= */


