import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";

export default function useHistorySeries(take = 50) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    // 🔥 Correct collection path after ESP32 fix → iotHistory (flat)
    const q = query(
      collection(db, "iotHistory"),
      orderBy("timestamp", "desc"),
      limit(take)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRows(arr.reverse()); // oldest → latest for chart
      },
      (err) => {
        console.error("History load error:", err);
      }
    );

    return () => unsub();
  }, [take]);

  return rows;
}
