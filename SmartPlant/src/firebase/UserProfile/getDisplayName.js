// firebase/UserProfile/getDisplayName.js
import { db } from "../FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export async function getDisplayName(uid, fallback) {
  if (!uid) return fallback || "User";
  try {
    const snap = await getDoc(doc(db, "user", uid));
    const name = snap.exists() ? snap.data()?.full_name : null;
    return name || fallback || "User";
  } catch {
    return fallback || "User";
  }
}
