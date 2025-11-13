// useNotification.js (replace with this debug-friendly version)
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot, limit as fbLimit } from "firebase/firestore";
import { db } from "../FirebaseConfig";

export function useNotifications(userId, max = 200) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!userId) {
      console.log("[useNotifications] no userId provided");
      setItems([]);
      return;
    }

    console.log("[useNotifications] start listening for userId:", userId);

    // build query: where userId == X and order by createdAt desc
    // note: keep limit to avoid huge streams
    const col = collection(db, "notifications");
    const q = query(col, where("userId", "==", userId), orderBy("createdAt", "desc"), fbLimit(max));

    const unsub = onSnapshot(q, (snap) => {
      try {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        console.log("[useNotifications] snapshot docs count:", docs.length, "sample ids:", docs.slice(0,5).map(x => x.id));
        // hide deleted flag if present
        const visible = docs.filter(n => !n.deleted);
        setItems(visible);
      } catch (e) {
        console.error("[useNotifications] onSnapshot parse error:", e);
        setItems([]);
      }
    }, (err) => {
      console.error("[useNotifications] onSnapshot ERROR:", err);
    });

    return () => {
      console.log("[useNotifications] unsubscribing for userId:", userId);
      unsub();
    };
  }, [userId, max]);

  return items;
}