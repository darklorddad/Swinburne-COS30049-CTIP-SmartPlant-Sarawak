// src/firebase/notification_user/deleteNotification.js
import { db } from "../FirebaseConfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

/** Soft-delete by setting {deleted:true, deletedAt:...}.
 *  Tries the new collection 'notifications' first; falls back
 *  to legacy 'notification_user' if you still have old docs there.
 */
export async function deleteNotification(id) {
  const candidates = ["notifications", "notification_user"]; // new then legacy

  for (const col of candidates) {
    const ref = doc(db, col, id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, { deleted: true, deletedAt: serverTimestamp() });
      return { ok: true, collection: col };
    }
  }
  return { ok: false, error: "not_found" };
}
