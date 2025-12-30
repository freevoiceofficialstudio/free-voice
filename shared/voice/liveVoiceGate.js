/* =========================================================
   FREE VOICE — LIVE VOICE GATEKEEPER
   File: shared/voice/liveVoiceGate.js
   Owner: Subhan Ahmad

   PURPOSE:
   - Enforce membership before LIVE voice
   - Handle mic permission
   - Stop instantly on expiry
========================================================= */

import { getMembershipStatus } from "../membership/membershipManager.js";

/* =====================================================
   INTERNAL STATE
===================================================== */
let mediaStream = null;
let active = false;

/* =====================================================
   PERMISSION HANDLERS
===================================================== */
async function requestMicPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });
    stream.getTracks().forEach(t => t.stop());
    return true;
  } catch {
    return false;
  }
}

/* =====================================================
   MEMBERSHIP GATE
===================================================== */
function membershipAllowed() {
  const status = getMembershipStatus();
  return status.active === true && status.remainingMs > 0;
}

/* =====================================================
   START LIVE VOICE
===================================================== */
async function startLiveVoice() {
  if (!membershipAllowed()) {
    throw new Error("LIVE_VOICE_LOCKED_NO_MEMBERSHIP");
  }

  const permission = await requestMicPermission();
  if (!permission) {
    throw new Error("MIC_PERMISSION_DENIED");
  }

  mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: true
  });

  active = true;

  window.addEventListener(
    "FREE_VOICE_MEMBERSHIP_EXPIRED",
    stopLiveVoice,
    { once: true }
  );

  return mediaStream;
}

/* =====================================================
   STOP LIVE VOICE (HARD)
===================================================== */
function stopLiveVoice() {
  if (!active) return;

  try {
    mediaStream?.getTracks()?.forEach(t => t.stop());
  } catch {}

  mediaStream = null;
  active = false;
}

/* =====================================================
   STATUS
===================================================== */
function isLiveActive() {
  return active === true;
}

/* =====================================================
   EXPORTS
===================================================== */
export {
  startLiveVoice,
  stopLiveVoice,
  isLiveActive
};

/* =========================================================
   END OF FILE
   ✔ Membership gate enforced
   ✔ Instant stop on expiry
   ✔ Mic permission safe
========================================================= */
