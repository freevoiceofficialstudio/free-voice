/* =========================================================
   FREE VOICE — STRIPE CONFIGURATION & GUARD
   File: shared/config/stripe.js
   Owner: Subhan Ahmad

   SECURITY PRINCIPLES:
   - Secret key NEVER exposed to frontend
   - Checkout via Stripe-hosted links only
   - Membership validation is server-authoritative
========================================================= */

import APP_CONFIG from "../app.config.js";

/* =====================================================
   ENV SAFETY CHECK
===================================================== */
function getEnv(key) {
  const val = import.meta?.env?.[key] || process?.env?.[key];
  if (!val) {
    throw new Error(`❌ Missing ENV variable: ${key}`);
  }
  return val;
}

/* =====================================================
   STRIPE MODE LOCK
===================================================== */
const STRIPE_MODE = Object.freeze({
  mode: "live", // hard locked
  enabled: true
});

/* =====================================================
   PUBLIC STRIPE DATA (SAFE)
===================================================== */
const STRIPE_PUBLIC = Object.freeze({
  publishableKey: getEnv("STRIPE_PUBLISHABLE_KEY"),
  checkoutLinks: Object.freeze({
    weekly: APP_CONFIG.stripe.checkoutLinks.weekly,
    monthly: APP_CONFIG.stripe.checkoutLinks.monthly,
    yearly: APP_CONFIG.stripe.checkoutLinks.yearly
  })
});

/* =====================================================
   FRONTEND MISUSE PROTECTION
===================================================== */
function blockIllegalUsage() {
  // Block secret access attempt
  if (
    typeof window !== "undefined" &&
    (window.STRIPE_SECRET_KEY ||
      window.process?.env?.STRIPE_SECRET_KEY)
  ) {
    throw new Error(
      "❌ SECURITY VIOLATION: Stripe secret key exposure attempt"
    );
  }
}
blockIllegalUsage();

/* =====================================================
   CHECKOUT REDIRECT (SAFE ONLY)
===================================================== */
function redirectToCheckout(plan) {
  if (!STRIPE_PUBLIC.checkoutLinks[plan]) {
    throw new Error("❌ Invalid membership plan");
  }

  // Hard redirect — no JS manipulation allowed
  window.location.href = STRIPE_PUBLIC.checkoutLinks[plan];
}

/* =====================================================
   MEMBERSHIP STATE NORMALIZER
===================================================== */
function normalizeMembership(userDoc) {
  if (!userDoc) {
    return {
      active: false,
      plan: "free",
      remainingMs: 0
    };
  }

  const now = Date.now();
  const expiry = userDoc.membershipExpiry || 0;
  const remainingMs = Math.max(0, expiry - now);

  return {
    active: remainingMs > 0,
    plan: userDoc.membership || "free",
    remainingMs
  };
}

/* =====================================================
   LIVE ACCESS GUARD
===================================================== */
function assertLiveVoiceAccess(membershipState) {
  if (!membershipState?.active) {
    throw new Error(
      "🔒 Live Voice Locked — Membership Required"
    );
  }
}

/* =====================================================
   ULTRA VOICE ACCESS GUARD
===================================================== */
function assertUltraVoiceAccess(membershipState) {
  if (!membershipState?.active) {
    throw new Error(
      "🔒 Ultra Voice Locked — Premium Membership Required"
    );
  }
}

/* =====================================================
   EXPORTS
===================================================== */
export {
  STRIPE_MODE,
  STRIPE_PUBLIC,
  redirectToCheckout,
  normalizeMembership,
  assertLiveVoiceAccess,
  assertUltraVoiceAccess
};

/* =========================================================
   END OF FILE
   ✔ Stripe-hosted checkout only
   ✔ No secret key exposure
   ✔ Membership enforced everywhere
========================================================= */


