// firebase/verification/assignExpertsAndNotify.js
import { db } from "../FirebaseConfig";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";

/**
 * Assign all experts and send each a notification.
 *
 * Accepts an object param with possible fields:
 * - plantIdentifyId (preferred)
 * - payload (object) which may contain identifyId / plantIdentifyId / id
 *
 * Returns { ok: true, assignedCount: n } on success.
 */
export default async function assignExpertsAndNotify({ plantIdentifyId = null, payload = null } = {}) {
  try {
    // 1) try to derive id from multiple places
    const id =
      plantIdentifyId ||
      (payload && (payload.plantIdentifyId || payload.identifyId || payload.id || payload.plantId)) ||
      null;

    if (!id) {
      throw new Error("plantIdentifyId required");
    }

    // 2) fetch the plant_identify doc (ensure it exists)
    const identifyRef = doc(db, "plant_identify", id);
    const identifySnap = await getDoc(identifyRef);
    if (!identifySnap.exists()) {
      throw new Error(`plant_identify doc not found for id=${id}`);
    }
    const identifyData = identifySnap.data() || {};

    // 3) query all experts (expect user collection holds experts with firebase_uid)
    const usersCol = collection(db, "user");
    const q = query(usersCol, where("role", "==", "expert"));
    const qSnap = await getDocs(q);

    if (qSnap.empty) {
      // no experts found — still update verification structure to avoid repeated attempts
      await updateDoc(identifyRef, {
        "verification.assignedExperts": [],
        "verification.required": 0,
        "verification.responses": { status: "pending", result: null },
      });
      return { ok: true, assignedCount: 0 };
    }

    // 4) prepare assignedExperts array (store minimal info: firebase_uid + full_name + decidedBy/At placeholders)
    const assignedExperts = [];
    const notifyPromises = [];

    qSnap.forEach((uDoc) => {
      const u = uDoc.data();
      // prefer firebase_uid; fallback to user firebase auth uid field names you used
      const firebaseUid = u.firebase_uid || u.firebaseUid || u.firebaseId || u.firebaseUid || null;
      if (!firebaseUid) {
        // skip experts without firebase uid (cannot notify by listener keyed on auth uid)
        return;
      }
      assignedExperts.push({
        uid: firebaseUid,
        full_name: u.full_name || u.fullName || "",
        decidedAt: null,
        decidedBy: null,
      });

      // build notification payload for this expert
      const notiPayload = {
        type: "verification_request",
        title: "Verification request",
        message: "A plant identification requires your review.",
        createdAt: serverTimestamp(),
        read: false,
        userId: firebaseUid, // crucial: this is how expert's useNotifications listens
        payload: {
          plantId: id, // id of plant_identify doc
          uploaderUid: identifyData.user_id || identifyData.userId || identifyData.uploaderUid || null,
        },
      };

      // addDoc (auto id) so we don't overwrite existing notifications
      notifyPromises.push(addDoc(collection(db, "notifications"), notiPayload));
    });

    // 5) write verification metadata into plant_identify doc: assignedExperts & required & responses
    const requiredCount = assignedExperts.length > 0 ? 1 : 0; // your logic: first expert decides -> required = 1
    const verificationPayload = {
      "verification.assignedExperts": assignedExperts,
      "verification.required": requiredCount,
      "verification.responses": {
        status: "pending",
        result: null,
      },
      "verification.visible": "true",
      "verification.decidedBy": null,
      "verification.decidedAt": null,
    };

    const updatePromise = updateDoc(identifyRef, {
      ...verificationPayload,
      "verification.lastAssignedAt": serverTimestamp(),
    });

    // 6) wait for all writes
    await Promise.all([updatePromise, ...notifyPromises]);

    return { ok: true, assignedCount: assignedExperts.length };
  } catch (err) {
    console.error("assignExpertsAndNotify failed:", err);
    throw err;
  }
}
