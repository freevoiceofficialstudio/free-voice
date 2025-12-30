/* ============================================================
   Free Voice — Stripe Webhook Cloud Function
   Owner: Subhan Ahmad
   File: functions/index.js
   ============================================================ */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Stripe = require("stripe");

admin.initializeApp();
const db = admin.firestore();

/* ================== STRIPE CONFIG ================== */
/* NEVER expose secret key in frontend */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ================== HELPERS ================== */

function getPlanDetails(priceId) {
  switch (priceId) {
    case "weekly":
      return { tier: "weekly", hours: 168 };
    case "monthly":
      return { tier: "monthly", hours: 720 };
    case "yearly":
      return { tier: "yearly", hours: 8760 };
    default:
      return null;
  }
}

function calculateExpiry(hours) {
  return Date.now() + hours * 60 * 60 * 1000;
}

/* ================== WEBHOOK ================== */

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature failed", err.message);
    return res.status(400).send("Webhook Error");
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const uid = session.client_reference_id;
      if (!uid) {
        throw new Error("Missing user UID");
      }

      // Map plan (based on checkout link metadata)
      const planType = session.metadata.plan;
      const plan = getPlanDetails(planType);

      if (!plan) {
        throw new Error("Invalid plan");
      }

      const expiry = calculateExpiry(plan.hours);

      await db.collection("users").doc(uid).update({
        membership: {
          tier: plan.tier,
          expiry: expiry
        },
        lastPayment: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log("Membership updated:", uid, plan.tier);
    }

    res.json({ received: true });

  } catch (err) {
    console.error("Webhook processing failed:", err);
    res.status(500).send("Webhook handler failed");
  }
});


