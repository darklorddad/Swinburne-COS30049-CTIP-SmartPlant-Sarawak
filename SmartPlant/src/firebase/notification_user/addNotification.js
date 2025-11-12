import { doc, runTransaction, serverTimestamp } from "firebase/firestore"; 
import { db } from "../FirebaseConfig";

/**
 * addNotification({ userId, type, title, message, payload? })
 * Generates IDs like N001, N002, ...
 */
export async function addNotification({ userId, type, title, message, payload = {} }) {
  console.log("[addNotification] called with", { userId, type, title, message, payload });
  if (!userId) throw new Error("userId is required");

  const counterRef = doc(db, "counters", "notifications");
  const pad = (num, size = 3) => String(num).padStart(size, "0");

  try {
    const newId = await runTransaction(db, async (tx) => {
      const snap = await tx.get(counterRef);
      let seq = 1;
      if (snap.exists()) {
        const current = snap.data()?.seq ?? 0;
        seq = current + 1;
        tx.update(counterRef, { seq });
      } else {
        tx.set(counterRef, { seq: 1 });
      }

      const id = `N${pad(seq)}`;
      const notiRef = doc(db, "notifications", id);
      tx.set(notiRef, {
        userId,
        type,
        title,
        message,
        payload,
        read: false,
        createdAt: serverTimestamp(),
      });
      return id;
    });

    console.log("[addNotification] created notification id:", newId);
    return newId;
  } catch (e) {
    console.error("[addNotification] Failed:", e);
    throw e;
  }
}
