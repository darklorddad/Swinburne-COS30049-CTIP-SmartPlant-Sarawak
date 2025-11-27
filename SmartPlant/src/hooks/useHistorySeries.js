import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import { decrypt } from "../utils/Encryption";

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
        const arr = snap.docs.map((doc) => {
          const v = doc.data() || {};
          let latitude = v.latitude ?? null;
          let longitude = v.longitude ?? null;
          if (v.coordinate) {
            try {
              const coord = decrypt(v.coordinate);
              if (coord?.latitude != null && coord?.longitude != null) {
                latitude = coord.latitude;
                longitude = coord.longitude;
              }
            } catch {}
          }
          return { id: doc.id, ...v, latitude, longitude };
        });
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
