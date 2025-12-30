/* ============================================================
   Free Voice — Firebase Google Authentication Core
   Owner: Subhan Ahmad
   File: shared/firebase.auth.js
   ============================================================ */

(function () {
  "use strict";

  // 🔐 Firebase config (PUBLIC ONLY — safe for frontend)
  // Replace values when creating Firebase project
  const firebaseConfig = {
    apiKey: "REPLACE_WITH_API_KEY",
    authDomain: "REPLACE_WITH_AUTH_DOMAIN",
    projectId: "REPLACE_WITH_PROJECT_ID",
    appId: "REPLACE_WITH_APP_ID"
  };

  if (!window.firebase) {
    throw new Error("Firebase SDK not loaded");
  }

  // Initialize Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const auth = firebase.auth();
  const db = firebase.firestore();

  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account"
  });

  /* ------------------ Helpers ------------------ */

  function userRef(uid) {
    return db.collection("users").doc(uid);
  }

  async function createUserProfile(user) {
    const ref = userRef(user.uid);
    const snap = await ref.get();

    if (!snap.exists) {
      await ref.set({
        uid: user.uid,
        name: user.displayName || "",
        email: user.email || "",
        photo: user.photoURL || "",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        membership: {
          tier: "none",
          expiry: 0
        }
      });
    }
  }

  /* ------------------ Auth Actions ------------------ */

  async function signInWithGoogle() {
    const result = await auth.signInWithPopup(provider);
    await createUserProfile(result.user);
    return result.user;
  }

  async function signOut() {
    await auth.signOut();
  }

  function onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(async (user) => {
      if (user) {
        await createUserProfile(user);
        const snap = await userRef(user.uid).get();
        callback({
          user,
          profile: snap.data()
        });
      } else {
        callback(null);
      }
    });
  }

  /* ------------------ Membership Sync ------------------ */

  async function getMembership(uid) {
    const snap = await userRef(uid).get();
    if (!snap.exists) return null;
    return snap.data().membership || null;
  }

  async function updateMembership(uid, tier, expiryTimestamp) {
    await userRef(uid).update({
      membership: {
        tier,
        expiry: expiryTimestamp
      }
    });
  }

  /* ------------------ Expose API ------------------ */

  window.FreeVoiceAuth = {
    signInWithGoogle,
    signOut,
    onAuthStateChanged,
    getMembership,
    updateMembership
  };

})();
