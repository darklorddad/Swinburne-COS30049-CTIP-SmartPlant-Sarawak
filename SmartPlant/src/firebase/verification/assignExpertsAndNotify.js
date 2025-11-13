// firebase/verification/assignExpertsAndNotify.js
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { addNotification } from "../notification_user/addNotification";

// pick n random from array
const pickRandom = (arr, n) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
};

/**
 * assignExpertsAndNotify({ plantId, uploaderUid, threshold = 3 })
 */
export async function assignExpertsAndNotify({ plantId, uploaderUid, threshold = 3 }) {
  if (!plantId) throw new Error("plantId required");

  // query active experts in user collection (your schema: role == "expert", is_active == true)
  const q = query(collection(db, "user"), where("role", "==", "expert"), where("is_active", "==", true));
  const snaps = await getDocs(q);
  const experts = snaps.docs.map(d => {
    const data = d.data();
    return {
      firebase_uid: data.firebase_uid || d.id,
      full_name: data.full_name || data.full_name || "Expert",
      email: data.email || ""
    };
  });

  if (!experts.length) {
    console.warn("No active experts found");
    return [];
  }

  // choose up to threshold experts randomly
  const chosen = pickRandom(experts, Math.min(threshold, experts.length)).map(e => e.firebase_uid);

  // update plant_identify doc
  const plantRef = doc(db, "plant_identify", plantId);
  await updateDoc(plantRef, {
    verification_assigned: chosen,
    verification_needed: threshold,
    verification_status: "pending",
    verification_assigned_at: serverTimestamp()
  });

  // notify each chosen expert
  for (const uid of chosen) {
    try {
      await addNotification({
        userId: uid,
        type: "verification_request",
        title: "Verification request",
        message: "A plant identification requires your review.",
        payload: { plantId, uploaderUid }
      });
    } catch (e) {
      console.error("notify expert failed", uid, e);
    }
  }

  return chosen;
}
