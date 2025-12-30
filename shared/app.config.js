/* ============================================================
   Free Voice — Global App Config Loader
   Owner: Subhan Ahmad
   File: shared/app.config.js
   ============================================================ */

(function () {
  "use strict";

  const APP_CONFIG = {
    product: "Free Voice",
    owner: "Subhan Ahmad",

    endpoints: {
      baseUrl: "",
      voices: "/shared/voices.json",
      premium: "/shared/premium.json",
      version: "/shared/version.json"
    },

    runtime: {
      initialized: false,
      online: navigator.onLine,
      lastSync: null
    },

    data: {
      voices: null,
      premium: null,
      version: null
    },

    security: {
      blockOnFailure: true,
      integrityCheck: true
    }
  };

  /* ------------------ Utility ------------------ */

  function noCacheUrl(url) {
    return url + "?t=" + Date.now();
  }

  async function fetchJson(url) {
    const res = await fetch(noCacheUrl(url), {
      cache: "no-store",
      credentials: "omit"
    });

    if (!res.ok) {
      throw new Error("Failed to load " + url);
    }
    return res.json();
  }

  /* ------------------ Loaders ------------------ */

  async function loadVoices() {
    APP_CONFIG.data.voices = await fetchJson(
      APP_CONFIG.endpoints.voices
    );
  }

  async function loadPremiumRules() {
    APP_CONFIG.data.premium = await fetchJson(
      APP_CONFIG.endpoints.premium
    );
  }

  async function loadVersionInfo() {
    APP_CONFIG.data.version = await fetchJson(
      APP_CONFIG.endpoints.version
    );
  }

  /* ------------------ Validation ------------------ */

  function validateData() {
    if (
      !APP_CONFIG.data.voices ||
      !APP_CONFIG.data.premium ||
      !APP_CONFIG.data.version
    ) {
      throw new Error("Config validation failed");
    }
  }

  function checkForcedUpdate() {
    const version = APP_CONFIG.data.version;
    if (version.forceUpdate === true) {
      alert(version.forceUpdateMessage || "Update required");
      window.location.reload();
    }
  }

  /* ------------------ Init ------------------ */

  async function init() {
    if (APP_CONFIG.runtime.initialized) return;

    try {
      await Promise.all([
        loadVoices(),
        loadPremiumRules(),
        loadVersionInfo()
      ]);

      validateData();
      checkForcedUpdate();

      APP_CONFIG.runtime.initialized = true;
      APP_CONFIG.runtime.lastSync = Date.now();

      console.log("[Free Voice] Config loaded successfully");

    } catch (err) {
      console.error("[Free Voice] Config error:", err);

      if (APP_CONFIG.security.blockOnFailure) {
        alert("Free Voice failed to initialize securely.");
      }
    }
  }

  /* ------------------ Network Watch ------------------ */

  window.addEventListener("online", () => {
    APP_CONFIG.runtime.online = true;
    init();
  });

  window.addEventListener("offline", () => {
    APP_CONFIG.runtime.online = false;
  });

  /* ------------------ Expose ------------------ */

  window.FreeVoiceConfig = {
    init,
    getVoices: () => APP_CONFIG.data.voices,
    getPremiumRules: () => APP_CONFIG.data.premium,
    getVersion: () => APP_CONFIG.data.version,
    isOnline: () => APP_CONFIG.runtime.online
  };

})();
