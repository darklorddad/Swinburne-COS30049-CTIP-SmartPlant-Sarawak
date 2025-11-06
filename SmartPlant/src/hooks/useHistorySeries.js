import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";

export default function useHistorySeries(take = 50) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "iot/latest/history"),
      orderBy("timestamp", "desc"),
      limit(take)
    );
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRows(arr.reverse());
    });
    return () => unsub();
  }, [take]);

  return rows;
}
