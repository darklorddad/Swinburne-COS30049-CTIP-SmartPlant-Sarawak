// pages/TopSuggestions.js
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import BottomNav from "../components/Navigation";
import { TOP_PAD } from "../components/StatusBarManager";

// Firestore
import { db } from "../firebase/FirebaseConfig";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

// helper
const fmtDate = (ms) => {
  if (!ms) return "—";
  try { return new Date(ms).toDateString(); } catch { return "—"; }
};

export default function TopSuggestions() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    // Get a recent window of posts, then compute top-3 by confidence client-side
    const qRef = query(
      collection(db, "plant_identify"),
      orderBy("createdAt", "desc"),
      limit(200) // adjust if you want a larger/smaller window
    );

    const unsub = onSnapshot(qRef, (snap) => {
      const items = snap.docs.map((d) => {
        const v = d.data() || {};

        const top1 = v?.model_predictions?.top_1 || {};
        const species = top1?.plant_species ?? top1?.class ?? "Unknown Plant";
        const score = typeof top1?.ai_score === "number"
          ? top1.ai_score
          : (typeof top1?.confidence === "number" ? top1.confidence : null);

        const createdMs =
          v?.createdAt?.toMillis?.() ??
          (v?.createdAt?.seconds ? v.createdAt.seconds * 1000 : null);

        const imageURIs = Array.isArray(v?.ImageURLs) && v.ImageURLs.length
          ? v.ImageURLs
          : (v?.ImageURL ? [v.ImageURL] : []);

        return {
          id: d.id,
          species,
          score,                 // 0..1 (or null)
          date: fmtDate(createdMs),
          thumb: imageURIs[0] || null,
        };
      });

      setRows(items);
    });

    return () => unsub();
  }, []);

  const cards = useMemo(() => {
    const scored = rows
      .filter((r) => typeof r.score === "number")
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((r, idx) => ({
        id: r.id || idx,
        title: r.species || "Unknown Plant",
        confidence: Math.round((r.score || 0) * 100),
        date: r.date,
        thumb: r.thumb,
      }));

    if (scored.length === 0) {
      return [{ id: "empty", title: "No suggestions", confidence: null, date: "—", thumb: null }];
    }
    return scored;
  }, [rows]);

  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Top Suggestion</Text>

        {cards.map((c) => (
          <View key={c.id} style={styles.card}>
            {c.thumb ? (
              <Image source={{ uri: c.thumb }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, { backgroundColor: "#FFF" }]} />
            )}

            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>{c.title}</Text>
              <Text style={styles.meta}>{c.date}</Text>
              <Text style={styles.meta}>
                {typeof c.confidence === "number" ? `${c.confidence}% Confidence` : "—"}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <BottomNav navigation={null} />
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#FFF8EE" },
  container: { flexGrow: 1, padding: 16, paddingTop: TOP_PAD, paddingBottom: 110 },
  header: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
  card: {
    backgroundColor: "#E7F0E5",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  thumb: { width: 72, height: 72, borderRadius: 12, backgroundColor: "#E6E6E6" },
  title: { fontWeight: "800", color: "#2b2b2b" },
  meta: { fontSize: 12, color: "#2b2b2b" },
});
