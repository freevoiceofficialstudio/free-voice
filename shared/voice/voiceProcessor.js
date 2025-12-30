/* =========================================================
   FREE VOICE — VOICE PROCESSING CORE
   File: shared/voice/voiceProcessor.js
   Owner: Subhan Ahmad

   PURPOSE:
   - Real-time voice transformation engine
   - Works with WebAudio API
   - Shared across Web / Mobile / Desktop
   - No audio stored anywhere
========================================================= */

import { isLiveActive } from "./liveVoiceGate.js";

/* =====================================================
   INTERNAL STATE
===================================================== */
let audioContext = null;
let sourceNode = null;
let processorNode = null;
let destinationNode = null;
let activeVoiceProfile = null;

/* =====================================================
   INIT AUDIO CONTEXT
===================================================== */
function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext ||
      window.webkitAudioContext)({
      latencyHint: "interactive"
    });
  }
}

/* =====================================================
   LOAD VOICE PROFILE (METADATA ONLY)
===================================================== */
function loadVoiceProfile(voiceMeta) {
  if (!voiceMeta?.id) {
    throw new Error("INVALID_VOICE_PROFILE");
  }

  activeVoiceProfile = {
    id: voiceMeta.id,
    style: voiceMeta.style,
    gender: voiceMeta.gender,
    category: voiceMeta.category
  };
}

/* =====================================================
   CORE PROCESSOR
===================================================== */
function createProcessor() {
  processorNode = audioContext.createScriptProcessor(4096, 1, 1);

  processorNode.onaudioprocess = event => {
    if (!isLiveActive()) return;

    const input = event.inputBuffer.getChannelData(0);
    const output = event.outputBuffer.getChannelData(0);

    for (let i = 0; i < input.length; i++) {
      let sample = input[i];

      // === SIMPLE REAL-TIME MODULATION CORE ===
      // (placeholder — can be replaced with DSP/WASM later)

      if (activeVoiceProfile?.gender === "female") {
        sample *= 1.1;
      }

      if (activeVoiceProfile?.style === "deep") {
        sample *= 0.9;
      }

      output[i] = sample;
    }
  };
}

/* =====================================================
   START PROCESSING
===================================================== */
async function startProcessing(mediaStream) {
  if (!mediaStream) {
    throw new Error("NO_MEDIA_STREAM");
  }

  initAudioContext();

  sourceNode = audioContext.createMediaStreamSource(mediaStream);
  destinationNode = audioContext.createMediaStreamDestination();

  createProcessor();

  sourceNode.connect(processorNode);
  processorNode.connect(destinationNode);

  return destinationNode.stream;
}

/* =====================================================
   STOP PROCESSING
===================================================== */
function stopProcessing() {
  try {
    sourceNode?.disconnect();
    processorNode?.disconnect();
  } catch {}

  sourceNode = null;
  processorNode = null;
  destinationNode = null;
}

/* =====================================================
   STATUS
===================================================== */
function isProcessingActive() {
  return !!processorNode;
}

/* =====================================================
   EXPORTS
===================================================== */
export {
  loadVoiceProfile,
  startProcessing,
  stopProcessing,
  isProcessingActive
};

/* =========================================================
   END OF FILE
   ✔ Real-time engine
   ✔ No audio storage
   ✔ Shared DSP core
========================================================= */
