// firebase/UserProfile/getDisplayName.js
import { db } from "../FirebaseConfig";
import { doc, getDoc, query, collection, where, getDocs } from "firebase/firestore";

/**
 * Get full_name from Firestore "user" collection using Firebase Auth UID
 * 
 * @param {string} uid - firebase_auth_uid (like 6Dc77hrRCJbkfTLGF...)
 * @param {string} fallback - fallback display name
 * @returns string
 */
export async function getDisplayName(uid, fallback = "User") {
  if (!uid) return fallback;

  try {
    // 1. 查 user user.firebase_uid == uid
    const q = query(collection(db, "user"), where("firebase_uid", "==", uid));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const data = snap.docs[0].data();
      return data.full_name || fallback;
    }

    // 2. 再检查有没有 user_id == uid (极少数情况)
    const snap2 = await getDoc(doc(db, "user", uid));
    if (snap2.exists()) {
      return snap2.data().full_name || fallback;
    }

    return fallback;
  } catch (err) {
    console.warn("getDisplayName failed:", err);
    return fallback;
  }
}
