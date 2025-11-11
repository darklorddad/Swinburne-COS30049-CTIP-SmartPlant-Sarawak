import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../FirebaseConfig";

/**
 * addNotification({ userId, type, title, message, payload? })
 * Generates IDs like N001, N002, ...
 */
export async function addNotification({ userId, type, title, message, payload = {} }) {
  if (!userId) throw new Error("userId is required");

  const counterRef = doc(db, "counters", "notifications"); // store seq counter
  const pad = (num, size = 3) => String(num).padStart(size, "0");

  try {
    const newId = await runTransaction(db, async (tx) => {
      // read or create counter
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

    return newId; // e.g. "N005"
  } catch (e) {
    console.error("Failed to add sequential notification:", e);
    throw e;
  }
}

