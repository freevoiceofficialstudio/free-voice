/* =========================================================
   FREE VOICE — AUTO UPDATE FETCHER (JSON BASED)
   File: shared/api/fetchUpdates.js
   Owner: Subhan Ahmad

   PURPOSE:
   - Fetch voices.json, premium.json, version.json
   - Auto-refresh across Web / Mobile / Desktop
   - Offline-safe with last-known-good cache
========================================================= */

import APP_CONFIG from "../app.config.js";

/* =====================================================
   INTERNAL STATE
===================================================== */
const CACHE_PREFIX = "__FREE_VOICE__UPDATE__";
let lastFetchAt = 0;

/* =====================================================
   STORAGE HELPERS (LOCAL)
===================================================== */
function cacheKey(name) {
  return `${CACHE_PREFIX}${name}`;
}

function saveCache(name, data) {
  const wrapped = {
    data,
    savedAt: Date.now(),
    integrity: "FREE_VOICE_CACHE_V1"
  };
  localStorage.setItem(cacheKey(name), JSON.stringify(wrapped));
}

function loadCache(name) {
  try {
    const raw = localStorage.getItem(cacheKey(name));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (parsed.integrity !== "FREE_VOICE_CACHE_V1") {
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

/* =====================================================
   NETWORK FETCH (SAFE)
===================================================== */
async function safeFetch(url) {
  const res = await fetch(url, {
    cache: "no-store",
    credentials: "omit"
  });

  if (!res.ok) {
    throw new Error(`❌ Fetch failed: ${url}`);
  }

  return res.json();
}

/* =====================================================
   THROTTLE CHECK
===================================================== */
function canFetch() {
  const now = Date.now();
  if (
    now - lastFetchAt <
    APP_CONFIG.updates.autoRefreshIntervalMs
  ) {
    return false;
  }
  lastFetchAt = now;
  return true;
}

/* =====================================================
   CORE FETCHER
===================================================== */
async function fetchUpdate(name, endpoint, force = false) {
  if (!force && !canFetch()) {
    const cached = loadCache(name);
    if (cached) return cached;
  }

  try {
    const data = await safeFetch(endpoint);
    saveCache(name, data);
    return data;
  } catch (err) {
    const fallback = loadCache(name);
    if (fallback) return fallback;
    throw err;
  }
}

/* =====================================================
   PUBLIC API
===================================================== */
async function fetchVoices(force = false) {
  return fetchUpdate(
    "voices",
    APP_CONFIG.updates.endpoints.voices,
    force
  );
}

async function fetchPremium(force = false) {
  return fetchUpdate(
    "premium",
    APP_CONFIG.updates.endpoints.premium,
    force
  );
}

async function fetchVersion(force = false) {
  return fetchUpdate(
    "version",
    APP_CONFIG.updates.endpoints.version,
    force
  );
}

/* =====================================================
   FULL SYNC (ONE CALL)
===================================================== */
async function syncAll(force = false) {
  const [voices, premium, version] = await Promise.all([
    fetchVoices(force),
    fetchPremium(force),
    fetchVersion(force)
  ]);

  return {
    voices,
    premium,
    version
  };
}

/* =====================================================
   EXPORTS
===================================================== */
export {
  fetchVoices,
  fetchPremium,
  fetchVersion,
  syncAll
};

/* =========================================================
   END OF FILE
   ✔ JSON-based updates
   ✔ Offline-safe
   ✔ Shared logic
========================================================= */


