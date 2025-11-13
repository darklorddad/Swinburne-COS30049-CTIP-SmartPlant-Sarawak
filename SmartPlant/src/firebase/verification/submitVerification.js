// firebase/verification/submitVerification.js
import { db } from "../FirebaseConfig";
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  collection,
} from "firebase/firestore";

import { addNotification } from "../notification_user/addNotification";

/**
 * submitVerification({ plantIdentifyId, expertId, vote })
 * vote: "approve" | "reject"
 * Returns structured result instead of throwing on "already decided".
 */
export default async function submitVerification({ plantIdentifyId, expertId, vote }) {
  if (!plantIdentifyId) throw new Error("plantIdentifyId required");
  if (!expertId) throw new Error("expertId required");
  if (!["approve", "reject"].includes(vote)) throw new Error("vote must be approve or reject");

  const plantRef = doc(db, "plant_identify", plantIdentifyId);

  try {
    const txResult = await runTransaction(db, async (tx) => {
      const snap = await tx.get(plantRef);
      if (!snap.exists()) throw new Error("Plant identify not found");
      const data = snap.data();

      const currentStatus = (data.identify_status || "").toLowerCase();
      if (currentStatus === "verified" || currentStatus === "rejected") {
        // someone already decided -> return info (do NOT throw)
        return {
          alreadyDecided: true,
          decidedStatus: currentStatus,
          decidedBy: data.verified_by || data.rejected_by || data.decided_by || null,
        };
      }

      const decidedStatus = vote === "approve" ? "verified" : "rejected";
      const updates = {
        identify_status: decidedStatus,
        decided_by: expertId,
        decided_at: serverTimestamp(),
        "verification.status": decidedStatus,
        "verification.decidedAt": serverTimestamp(),
        "verification.decidedBy": expertId,
      };

      // also set verified_by / rejected_by / verified_at / rejected_at
      if (decidedStatus === "verified") {
        updates.verified_by = expertId;
        updates.verified_at = serverTimestamp();
        updates["verification.result"] = "approved";
      } else {
        updates.rejected_by = expertId;
        updates.rejected_at = serverTimestamp();
        updates["verification.result"] = "rejected";
      }

      tx.update(plantRef, updates);

      // moderation log (create new doc under moderation_logs)
      const logsCol = collection(db, "plant_identify", plantIdentifyId, "moderation_logs");
      const newLogRef = doc(logsCol); // generates new id
      tx.set(newLogRef, {
        action: decidedStatus === "verified" ? "approved" : "rejected",
        by: expertId,
        at: serverTimestamp(),
      });

      return { alreadyDecided: false, decidedStatus, decidedBy: expertId };
    });

    // After transaction: if we got alreadyDecided true, return that object
    if (txResult.alreadyDecided) {
      return { ok: false, alreadyDecided: true, decidedStatus: txResult.decidedStatus, decidedBy: txResult.decidedBy };
    }

    // txResult indicates success and decidedBy
    // notify uploader (best-effort)
    try {
      const snapAfter = await getDoc(doc(db, "plant_identify", plantIdentifyId));
      if (snapAfter.exists()) {
        const plant = snapAfter.data();
        const ownerUid = plant.uploaderUid || plant.user_id || plant.userId || plant.userUid || null;
        const postId = plant.postId || plant.post_id || null;
        const decidedStatus = txResult.decidedStatus || (txResult.alreadyDecided ? txResult.decidedStatus : null);

        if (ownerUid) {
          await addNotification({
            userId: ownerUid,
            type: "verification_result",
            title: decidedStatus === "verified" ? "Plant Identification Verified" : "Plant Identification Rejected",
            message: decidedStatus === "verified"
              ? "An expert has approved your plant identification."
              : "An expert has rejected your plant identification.",
            payload: {
              plantIdentifyId,
              result: decidedStatus,
              decidedBy: txResult.decidedBy,
              postId: postId || null,
            },
          });
        }
      }
    } catch (notifErr) {
      console.warn("submitVerification notification error (non-fatal):", notifErr);
    }

    // mark verification_request notifications as read (best-effort)
    try {
      // We intentionally run a lightweight query outside transaction to mark related verification_request notifications read.
      // Implementation is optional here — keep as best-effort to avoid blocking main flow.
      const { query, where, getDocs, updateDoc } = await import("firebase/firestore");
      const notiCol = collection(db, "notifications");
      const q = query(notiCol, where("type", "==", "verification_request"), where("payload.plantIdentifyId", "==", plantIdentifyId));
      const snaps = await getDocs(q);
      const p = [];
      snaps.forEach((d) => {
        p.push(updateDoc(doc(db, "notifications", d.id), { read: true }));
      });
      await Promise.all(p);
    } catch (e) {
      // non-fatal
    }

    return { ok: true, decidedBy: txResult.decidedBy, decidedStatus: txResult.decidedStatus };
  } catch (e) {
    // any unexpected error -> rethrow so caller can handle
    console.error("submitVerification transaction failed:", e);
    throw e;
  }
}
