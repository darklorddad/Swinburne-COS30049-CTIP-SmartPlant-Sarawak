// firebase/verification/submitVerification.js
import {
  doc,
  runTransaction,
  serverTimestamp,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../FirebaseConfig"; // 调整为你项目中实际路径
// optional: notification helper if you want to notify owner / experts
import { addNotification } from "../notification_user/addNotification"; // adjust path if needed

/**
 * submitVerification({ plantIdentifyId, expertId, vote })
 * vote: "approve" | "reject"
 */
export async function submitVerification({ plantIdentifyId, expertId, vote }) {
  if (!plantIdentifyId) throw new Error("plantIdentifyId required");
  if (!expertId) throw new Error("expertId required");
  if (!["approve", "reject"].includes(vote)) throw new Error("vote must be 'approve' or 'reject'");

  const plantRef = doc(db, "plant_identify", plantIdentifyId);

  return runTransaction(db, async (tx) => {
    const snap = await tx.get(plantRef);
    if (!snap.exists()) throw new Error("Plant identify doc not found");

    const data = snap.data();
    const verification = data.verification || {};
    const required = Number.isInteger(verification.required) ? verification.required : 3;
    const assigned = Array.isArray(verification.assignedExperts) ? verification.assignedExperts : [];

    // Guard: expert must be assigned (optional - if you want enforce)
    if (assigned.length > 0 && !assigned.includes(expertId)) {
      throw new Error("You are not assigned to verify this identification");
    }

    const responses = verification.responses || {}; // object map expertId -> { vote, at }
    // set or overwrite this expert's vote
    responses[expertId] = { vote, at: serverTimestamp() };

    // compute votes so far (use current responses object)
    const votes = Object.values(responses).map((r) => r.vote);
    const votesCount = votes.length;

    let newVerification = {
      ...verification,
      responses,
    };

    let finalResult = null;
    let finalIdentifyStatus = null;
    let decided = false;

    if (votesCount >= required) {
      // Apply unanimous rule: only if ALL votes equal "approve" -> approved
      const allApprove = votes.every((v) => v === "approve");
      if (allApprove) {
        finalResult = "approved";
        finalIdentifyStatus = "verified";
      } else {
        // any non-approve among required votes => rejected
        finalResult = "rejected";
        finalIdentifyStatus = "rejected";
      }

      newVerification = {
        ...newVerification,
        result: finalResult,
        status: finalIdentifyStatus === "verified" ? "verified" : "pending", // keep status field consistent (optional)
        decidedAt: serverTimestamp(),
      };
      decided = true;
    }

    // write the updated verification subfields
    tx.update(plantRef, {
      "verification.responses": newVerification.responses,
      ...(newVerification.result ? { "verification.result": newVerification.result } : {}),
      ...(newVerification.decidedAt ? { "verification.decidedAt": newVerification.decidedAt } : {}),
      // set identify_status only when decided to avoid conflicting states
      ...(decided ? { identify_status: finalIdentifyStatus } : {}),
    });

    return { decided, result: finalResult, votesCount, required };
  }).then(async (res) => {
    // optional: send notifications after transaction committed
    // notify owner when decision made
    if (res.decided) {
      try {
        // fetch plant doc to know owner etc
        const plantSnap = await getDoc(doc(db, "plant_identify", plantIdentifyId));
        if (plantSnap.exists()) {
          const plant = plantSnap.data();
          const ownerUid = plant.user_id;
          // notify owner
          if (ownerUid) {
            await addNotification({
              userId: ownerUid,
              type: "verification_result",
              title: `Identification ${res.result === "approved" ? "Approved" : "Rejected"}`,
              message: `${plant.model_predictions?.top_1?.plant_species || "Plant"} was ${res.result}`,
              payload: { plantIdentifyId, result: res.result },
            });
          }
          // optionally notify assigned experts that decision reached
        }
      } catch (e) {
        // non-fatal - notification failure shouldn't break flow
        console.warn("post-decision notification failed", e);
      }
    }
    return res;
  }).catch((err) => {
    // bubble error
    throw err;
  });
}

export default submitVerification;
