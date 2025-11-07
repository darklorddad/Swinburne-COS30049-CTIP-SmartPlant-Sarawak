import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";

export default function useLiveReading() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const d = doc(db, "iot/latest");
    const unsub = onSnapshot(d, (snap) => {
      setData(snap.data() || null);
    });
    return () => unsub();
  }, []);

  return data;
}
