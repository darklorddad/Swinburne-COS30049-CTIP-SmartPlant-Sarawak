// src/firebase/verification/assignExpertsAndNotify.js
import { db } from "../FirebaseConfig";
import {
  doc,
  getDoc,
  collection,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// 使用你的 addNotification helper（确保路径与项目一致）
import { addNotification } from "../notification_user/addNotification";

/**
 * Assign all experts and send each a notification.
 *
 * Params (single object):
 *  - plantIdentifyId (preferred) OR payload with plantIdentifyId / identifyId / id / plantId
 *  - extra (optional) - extra info to include in notification.payload (not required)
 *
 * Returns assignedExperts array (objects with uid + full_name + placeholders)
 */
export default async function assignExpertsAndNotify({
  plantIdentifyId = null,
  payload = null,
  extra = {},
} = {}) {
  try {
    // derive id from multiple possible keys
    const id =
      plantIdentifyId ||
      (payload &&
        (payload.plantIdentifyId ||
          payload.identifyId ||
          payload.id ||
          payload.plantId)) ||
      null;

    if (!id) {
      throw new Error("plantIdentifyId required");
    }

    // 1) fetch plant_identify doc to ensure it exists and to read uploader
    const identifyRef = doc(db, "plant_identify", id);
    const identifySnap = await getDoc(identifyRef);
    if (!identifySnap.exists()) {
      throw new Error(`plant_identify doc not found for id=${id}`);
    }
    const identifyData = identifySnap.data() || {};

    // 2) query all experts from "user" collection (role == "expert")
    const usersCol = collection(db, "user");
    const q = query(usersCol, where("role", "==", "expert"));
    const qSnap = await getDocs(q);

    if (qSnap.empty) {
      // no experts found — still update plant_identify verification metadata to avoid repeated attempts
      await updateDoc(identifyRef, {
        "verification.assignedExperts": [],
        "verification.required": 0,
        "verification.responses": {},
        "verification.visible": "true",
        "verification.status": "no_experts",
        "verification.lastAssignedAt": serverTimestamp(),
      });
      return [];
    }

    // 3) build assignedExperts and push notifications (use addNotification for Nxxx ids)
    const assignedExperts = [];
    const notifyPromises = [];

    qSnap.forEach((uDoc) => {
      const u = uDoc.data() || {};
      // prefer firebase uid keys used in your DB
      const firebaseUid =
        u.firebase_uid || u.firebaseUid || u.firebaseId || u.firebaseIdToken || null;
      if (!firebaseUid) {
        // skip experts without firebase uid (can't listen for them)
        console.warn("[assignExpertsAndNotify] skipping expert without firebase uid:", u);
        return;
      }

      const fullname = u.full_name || u.fullName || u.name || "";

      assignedExperts.push({
        uid: firebaseUid,
        full_name: fullname,
        decidedAt: null,
        decidedBy: null,
      });

      // notification payload for this expert
      const notiPayload = {
        plantIdentifyId: id,
        uploaderUid:
          identifyData.user_id ||
          identifyData.userId ||
          identifyData.uploaderUid ||
          null,
        // attach any extra info (e.g., top1, score, imageURLs) if provided
        ...(extra && typeof extra === "object" ? { extra } : {}),
      };

      // use addNotification helper (returns the notification id like "N001")
      // addNotification signature: addNotification({ userId, type, title, message, payload })
      const p = addNotification({
        userId: firebaseUid,
        type: "verification_request",
        title: "Verification request",
        message: "A plant identification requires your review.",
        payload: notiPayload,
      });

      notifyPromises.push(p);
    });

    // 4) decide required threshold (first-decider policy = 1)
    const requiredCount = assignedExperts.length > 0 ? 1 : 0;

    // 5) update plant_identify verification metadata
    const verificationPayload = {
      "verification.assignedExperts": assignedExperts,
      "verification.required": requiredCount,
      "verification.responses": {}, // expertUid -> { vote: "approved"|"rejected", at: TS }
      "verification.result": null,
      "verification.status": assignedExperts.length > 0 ? "pending" : "no_experts",
      "verification.visible": "true",
      "verification.decidedBy": null,
      "verification.decidedAt": null,
      "verification.lastAssignedAt": serverTimestamp(),
    };

    const updatePromise = updateDoc(identifyRef, verificationPayload);

    // 6) wait for all writes (update plant_identify + create notifications)
    //    addNotification uses transactions internally; Promise.all will wait them
    await Promise.all([updatePromise, ...notifyPromises]);

    console.log(
      `[assignExpertsAndNotify] assigned ${assignedExperts.length} experts for plant_identify ${id}`
    );
    return assignedExperts;
  } catch (err) {
    console.error("assignExpertsAndNotify failed:", err);
    throw err;
  }
}
