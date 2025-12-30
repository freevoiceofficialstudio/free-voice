/* =========================================================
   FREE VOICE — GLOBAL APPLICATION CONFIGURATION
   Owner: Subhan Ahmad
   Product: Free Voice
   File: shared/app.config.js
   DO NOT MODIFY AFTER INITIAL BUILD
========================================================= */

const APP_CONFIG = Object.freeze({

  /* =====================================================
     BASIC APP INFO
  ===================================================== */
  app: {
    name: "Free Voice",
    slug: "free-voice",
    owner: "Subhan Ahmad",
    version: "1.0.0",
    environment: "production", // development | production
    website: "https://freevoice.app",
    supportEmail: "jobsofficial786@gmail.com",
    copyright: `© ${new Date().getFullYear()} Free Voice`
  },

  /* =====================================================
     PLATFORM FLAGS
  ===================================================== */
  platforms: {
    web: {
      enabled: true,
      seoEnabled: true,
      liveVoiceAllowed: false
    },
    mobile: {
      enabled: true,
      liveVoiceAllowed: true,
      backgroundMicRequired: true
    },
    desktop: {
      enabled: true,
      liveVoiceAllowed: true,
      systemMicIntercept: true
    }
  },

  /* =====================================================
     AUTHENTICATION RULES
  ===================================================== */
  auth: {
    provider: "google",
    allowAnonymous: false,
    autoCreateProfile: true,
    requiredFields: [
      "uid",
      "name",
      "email",
      "photoURL",
      "membership",
      "membershipExpiry"
    ]
  },

  /* =====================================================
     MEMBERSHIP SYSTEM (STRICT)
  ===================================================== */
  membership: {
    requiredForLiveVoice: true,
    requiredForUltraVoices: true,

    plans: {
      weekly: {
        id: "weekly",
        durationMs: 7 * 24 * 60 * 60 * 1000
      },
      monthly: {
        id: "monthly",
        durationMs: 30 * 24 * 60 * 60 * 1000
      },
      yearly: {
        id: "yearly",
        durationMs: 365 * 24 * 60 * 60 * 1000
      }
    },

    expirationBehavior: {
      lockImmediately: true,
      disableLiveVoice: true,
      disableUltraVoices: true,
      forceRecheckIntervalMs: 5000
    }
  },

  /* =====================================================
     VOICE SYSTEM RULES
  ===================================================== */
  voiceSystem: {
    allowPreinstalledVoices: false,

    downloadRequired: true,

    offlineMode: {
      enabled: true,
      allowModification: false,
      allowCopy: false
    },

    categories: {
      free: {
        requiresMembership: false
      },
      premium: {
        requiresMembership: true
      },
      ultra: {
        requiresMembership: true,
        ultraRealistic: true
      }
    },

    liveVoice: {
      enabled: true,
      requiresMembership: true,
      realtimeProcessing: true,
      latencyTargetMs: 30,
      stopOnExpiry: true,
      preventOfflineBypass: true
    }
  },

  /* =====================================================
     STRIPE CONFIG (ENV ONLY)
  ===================================================== */
  stripe: {
    enabled: true,
    mode: "live",
    keys: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY
    },
    checkoutLinks: {
      weekly: "https://buy.stripe.com/fZufZg2zKe3zcyAep6gjC04",
      monthly: "https://buy.stripe.com/8x2fZg7U47Fb56894MgjC05",
      yearly: "https://buy.stripe.com/cNi14ma2cbVr2Y080IgjC06"
    },
    webhook: {
      validateServerSideOnly: true,
      rejectClientCalls: true
    }
  },

  /* =====================================================
     UPDATE SYSTEM (JSON BASED)
  ===================================================== */
  updates: {
    enabled: true,
    source: "cloud",
    endpoints: {
      voices: "/data/voices.json",
      premium: "/data/premium.json",
      version: "/data/version.json"
    },
    autoRefreshIntervalMs: 60000
  },

  /* =====================================================
     UI THEME (SIMPLE, CLEAN, FINAL)
  ===================================================== */
  ui: {
    theme: {
      modeSupport: ["light", "dark"],
      primaryColor: "#6366F1",   // Indigo
      secondaryColor: "#0F172A", // Dark slate
      accentColor: "#22C55E",    // Green
      backgroundLight: "#FFFFFF",
      backgroundDark: "#020617",
      textLight: "#020617",
      textDark: "#E5E7EB"
    },

    layout: {
      maxWidth: 1200,
      borderRadius: 12,
      spacingUnit: 8
    }
  },

  /* =====================================================
     SECURITY FLAGS
  ===================================================== */
  security: {
    frontendBypassProtection: true,
    serverValidationRequired: true,
    tamperDetectionEnabled: true,
    blockModifiedApps: true,
    strictMembershipVerification: true
  },

  /* =====================================================
     LEGAL & DISCLAIMERS
  ===================================================== */
  legal: {
    aiGeneratedVoices: true,
    userResponsibility: true,
    fairUseDisclaimer: true
  }

});

export default APP_CONFIG;

/* =========================================================
   END OF FILE — DO NOT SPLIT — DO NOT EDIT
========================================================= */
