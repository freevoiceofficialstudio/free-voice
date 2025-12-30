/* =========================================================
   FREE VOICE — LIVE VOICE ENGINE (REAL TIME)
   File: shared/voice/liveVoiceEngine.js
   Owner: Subhan Ahmad

   GUARANTEES:
   ✔ Real-time voice processing
   ✔ Membership enforced every frame
   ✔ Expiry = instant stop
   ✔ No offline / tamper bypass
   ✔ No server audio transfer
========================================================= */

import APP_CONFIG from "../app.config.js";
import {
  guardLiveVoice,
  startMembershipEnforcement,
  stopMembershipEnforcement
} from "../membership/membershipGuard.js";

/* =====================================================
   INTERNAL STATE
===================================================== */
let audioContext = null;
let mediaStream = null;
let sourceNode = null;
let processorNode = null;
let destinationNode = null;
let liveActive = false;

/* =====================================================
   PERMISSION HELPERS
===================================================== */
async function requestMicPermission() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("❌ Microphone API not supported");
  }

  return navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: false
    }
  });
}

/* =====================================================
   AUDIO CONTEXT INIT
===================================================== */
function initAudioContext() {
  if (audioContext) return audioContext;

  audioContext = new (window.AudioContext ||
    window.webkitAudioContext)({
    latencyHint: "interactive",
    sampleRate: 44100
  });

  return audioContext;
}

/* =====================================================
   VOICE PROCESSOR (PLACEHOLDER FOR AI MODEL)
===================================================== */
function createProcessor(ctx) {
  const processor = ctx.createScriptProcessor(1024, 1, 1);

  processor.onaudioprocess = event => {
    // 🔒 Membership enforced per audio frame
    guardLiveVoice();

    const input = event.inputBuffer.getChannelData(0);
    const output = event.outputBuffer.getChannelData(0);

    // ⚠️ Placeholder for AI voice transformation
    // Currently pass-through (architecture ready)
    for (let i = 0; i < input.length; i++) {
      output[i] = input[i];
    }
  };

  return processor;
}

/* =====================================================
   START LIVE VOICE
===================================================== */
async function startLiveVoice() {
  if (liveActive) return;

  // Global kill-switch flag
  if (typeof window !== "undefined") {
    window.__FREE_VOICE_LIVE_ACTIVE__ = false;
  }

  // Membership hard check
  guardLiveVoice();

  // Start continuous enforcement
  startMembershipEnforcement();

  mediaStream = await requestMicPermission();
  const ctx = initAudioContext();

  sourceNode = ctx.createMediaStreamSource(mediaStream);
  processorNode = createProcessor(ctx);
  destinationNode = ctx.destination;

  sourceNode.connect(processorNode);
  processorNode.connect(destinationNode);

  liveActive = true;

  if (typeof window !== "undefined") {
    window.__FREE_VOICE_LIVE_ACTIVE__ = true;
  }
}

/* =====================================================
   STOP LIVE VOICE (HARD)
===================================================== */
function stopLiveVoice() {
  if (!liveActive) return;

  stopMembershipEnforcement();

  try {
    processorNode?.disconnect();
    sourceNode?.disconnect();
  } catch {}

  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop());
  }

  audioContext?.close();

  audioContext = null;
  mediaStream = null;
  sourceNode = null;
  processorNode = null;
  destinationNode = null;
  liveActive = false;

  if (typeof window !== "undefined") {
    window.__FREE_VOICE_LIVE_ACTIVE__ = false;
  }
}

/* =====================================================
   STATUS HELPERS
===================================================== */
function isLiveVoiceActive() {
  return liveActive === true;
}

/* =====================================================
   BACKGROUND / SYSTEM HOOKS
===================================================== */
function attachSystemHooks(adapter) {
  /**
   * Desktop (Electron):
   * adapter.interceptSystemMic(stream)
   *
   * Mobile (Android):
   * adapter.attachCallAudio(stream)
   *
   * This keeps shared logic clean
   */
  if (!adapter || typeof adapter !== "object") return;
  adapter.onStop = stopLiveVoice;
}

/* =====================================================
   EXPORTS
===================================================== */
export {
  startLiveVoice,
  stopLiveVoice,
  isLiveVoiceActive,
  attachSystemHooks
};

/* =========================================================
   END OF FILE
   ✔ Real-time enforcement
   ✔ Expiry = instant stop
   ✔ System-wide ready
========================================================= */


