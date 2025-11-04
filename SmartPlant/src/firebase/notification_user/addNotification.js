// firebase/notification_user/addNotification.js
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../FirebaseConfig";

/**
 * addNotification({ userId, type, title, message, payload? })
 * type: 'plant_identified' | 'post_like' | 'post_comment' | 'admin_reply'
 */
export async function addNotification({ userId, type, title, message, payload = {} }) {
  if (!userId) throw new Error("userId is required");
  const ref = await addDoc(collection(db, "notifications"), { // <-- capture ref
    userId,
    type,
    title,
    message,
    payload,
    read: false,
    createdAt: serverTimestamp(),
  });
  return ref.id; // <-- return the doc id
}

