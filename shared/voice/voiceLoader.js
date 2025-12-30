/* =========================================================
   FREE VOICE — VOICE LOADER & CATALOG MANAGER
   File: shared/voice/voiceLoader.js
   Owner: Subhan Ahmad

   RULES:
   ✔ No preinstalled voices
   ✔ No server-side voice storage
   ✔ Local-only encrypted packages
   ✔ Membership enforced externally
========================================================= */

import APP_CONFIG from "../app.config.js";
import {
  guardUltraVoice
} from "../membership/membershipGuard.js";

/* =====================================================
   INTERNAL STATE
===================================================== */
let voiceCatalog = [];
let lastFetchedAt = 0;
let cachedVersion = null;

/* =====================================================
   STORAGE HELPERS (LOCAL ONLY)
===================================================== */
const LOCAL_KEY_PREFIX = "__FREE_VOICE__VOICE__";

function getLocalKey(voiceId) {
  return `${LOCAL_KEY_PREFIX}${voiceId}`;
}

function saveLocalVoice(voiceId, payload) {
  const wrapped = {
    id: voiceId,
    payload,
    savedAt: Date.now(),
    protected: true
  };

  localStorage.setItem(
    getLocalKey(voiceId),
    JSON.stringify(wrapped)
  );
}

function loadLocalVoice(voiceId) {
  const raw = localStorage.getItem(getLocalKey(voiceId));
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);
    if (!data.protected) return null;
    return data;
  } catch {
    return null;
  }
}

function hasLocalVoice(voiceId) {
  return !!loadLocalVoice(voiceId);
}

/* =====================================================
   FETCH VOICE CATALOG
===================================================== */
async function fetchVoiceCatalog(force = false) {
  const now = Date.now();

  if (
    !force &&
    voiceCatalog.length &&
    now - lastFetchedAt < APP_CONFIG.updates.autoRefreshIntervalMs
  ) {
    return voiceCatalog;
  }

  const res = await fetch(APP_CONFIG.updates.endpoints.voices, {
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error("❌ Failed to fetch voices.json");
  }

  const data = await res.json();

  if (!Array.isArray(data)) {
    throw new Error("❌ Invalid voices.json format");
  }

  voiceCatalog = Object.freeze(data);
  lastFetchedAt = now;

  return voiceCatalog;
}

/* =====================================================
   VERSION CHECK (AUTO INVALIDATE)
===================================================== */
async function checkVersionAndInvalidate() {
  const res = await fetch(APP_CONFIG.updates.endpoints.version, {
    cache: "no-store"
  });

  if (!res.ok) return;

  const data = await res.json();
  if (!data?.version) return;

  if (cachedVersion && cachedVersion !== data.version) {
    invalidateAllLocalVoices();
  }

  cachedVersion = data.version;
}

/* =====================================================
   INVALIDATE LOCAL VOICES (ON UPDATE)
===================================================== */
function invalidateAllLocalVoices() {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(LOCAL_KEY_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}

/* =====================================================
   DOWNLOAD VOICE (SIMULATED PACKAGE)
===================================================== */
async function downloadVoice(voice) {
  if (!voice?.id) {
    throw new Error("❌ Invalid voice");
  }

  if (voice.category === "ultra") {
    guardUltraVoice();
  }

  if (hasLocalVoice(voice.id)) {
    return loadLocalVoice(voice.id);
  }

  // Simulated encrypted payload (NO real voice data here)
  const encryptedPayload = btoa(
    JSON.stringify({
      voiceId: voice.id,
      signature: "FREE_VOICE_SECURE_PACKAGE",
      createdAt: Date.now()
    })
  );

  saveLocalVoice(voice.id, encryptedPayload);

  return loadLocalVoice(voice.id);
}

/* =====================================================
   PUBLIC HELPERS
===================================================== */
function listVoicesByCategory(category) {
  return voiceCatalog.filter(v => v.category === category);
}

function isVoiceAvailableOffline(voiceId) {
  return hasLocalVoice(voiceId);
}

/* =====================================================
   INIT (SAFE AUTO LOAD)
===================================================== */
async function initVoiceSystem() {
  await checkVersionAndInvalidate();
  await fetchVoiceCatalog(true);
}

/* =====================================================
   EXPORTS
===================================================== */
export {
  initVoiceSystem,
  fetchVoiceCatalog,
  downloadVoice,
  listVoicesByCategory,
  isVoiceAvailableOffline
};

/* =========================================================
   END OF FILE
   ✔ Local-only voices
   ✔ No Firebase Storage
   ✔ Auto update invalidation
========================================================= */


