/* =========================================================
   FREE VOICE — GLOBAL HELPERS & UTILITIES
   File: shared/utils/helpers.js
   Owner: Subhan Ahmad

   PURPOSE:
   - Shared helper functions across Web / Mobile / Desktop
   - Defensive coding utilities
   - Zero backend dependency
========================================================= */

/* =====================================================
   ENV & PLATFORM HELPERS
===================================================== */
function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function isNode() {
  return typeof process !== "undefined" && !!process.versions?.node;
}

function isProduction() {
  return (
    (import.meta?.env?.MODE || process?.env?.NODE_ENV) === "production"
  );
}

/* =====================================================
   SAFE JSON HELPERS
===================================================== */
function safeJSONParse(input, fallback = null) {
  try {
    return JSON.parse(input);
  } catch {
    return fallback;
  }
}

function safeJSONStringify(input, fallback = "{}") {
  try {
    return JSON.stringify(input);
  } catch {
    return fallback;
  }
}

/* =====================================================
   LOCAL STORAGE (SAFE WRAPPERS)
===================================================== */
function storageAvailable() {
  if (!isBrowser()) return false;
  try {
    const test = "__FV_TEST__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function lsGet(key, fallback = null) {
  if (!storageAvailable()) return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  return safeJSONParse(raw, fallback);
}

function lsSet(key, value) {
  if (!storageAvailable()) return false;
  localStorage.setItem(key, safeJSONStringify(value));
  return true;
}

function lsRemove(key) {
  if (!storageAvailable()) return false;
  localStorage.removeItem(key);
  return true;
}

/* =====================================================
   TIME HELPERS
===================================================== */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatMs(ms) {
  if (!ms || ms <= 0) return "00:00:00";

  const totalSeconds = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");

  return `${h}:${m}:${s}`;
}

/* =====================================================
   FUNCTION CONTROL
===================================================== */
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function throttle(fn, limit = 300) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/* =====================================================
   ID & HASH HELPERS
===================================================== */
function generateUID(prefix = "fv") {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function simpleHash(str) {
  let hash = 0;
  if (!str) return hash.toString();

  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
}

/* =====================================================
   NETWORK HELPERS
===================================================== */
function isOnline() {
  if (!isBrowser()) return true;
  return navigator.onLine === true;
}

function onNetworkChange(callback) {
  if (!isBrowser() || typeof callback !== "function") return () => {};

  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);

  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

/* =====================================================
   DEFENSIVE GUARDS
===================================================== */
function assert(condition, message = "Assertion failed") {
  if (!condition) {
    throw new Error(message);
  }
}

function freeze(obj) {
  return Object.freeze(obj);
}

/* =====================================================
   EXPORTS
===================================================== */
export {
  // env
  isBrowser,
  isNode,
  isProduction,

  // json
  safeJSONParse,
  safeJSONStringify,

  // storage
  lsGet,
  lsSet,
  lsRemove,

  // time
  sleep,
  formatMs,

  // function control
  debounce,
  throttle,

  // id & hash
  generateUID,
  simpleHash,

  // network
  isOnline,
  onNetworkChange,

  // guards
  assert,
  freeze
};

/* =========================================================
   END OF FILE
   ✔ Shared helpers
   ✔ Defensive & safe
   ✔ Production-ready
========================================================= */


