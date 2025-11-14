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
import { useRoute, useNavigation } from "@react-navigation/native";

// Firestore fallback for images when a slot is missing
import { db } from "../firebase/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// helper
const fmtDate = (ms) => {
  if (!ms) return "—";
  try { return new Date(ms).toDateString(); } catch { return "—"; }
};

// normalize any of: string | string[] | undefined -> string[]
const normalizeImages = (v) => {
  if (!v) return [];
  const arr = Array.isArray(v) ? v : [v];
  return arr
    .filter((u) => typeof u === "string")
    .map((u) => u.trim())
    .filter(Boolean);
};

export default function TopSuggestions() {
  const route = useRoute();
  const navigation = useNavigation(); // ← provide a real navigation object
  const { prediction, post, imageURI } = route.params || {};

  // 1) Use the exact images passed from identify_output (keeps order)
  const identifyImages = useMemo(() => normalizeImages(imageURI), [imageURI]);

  // 2) Normalize to exactly the 3 outputs from identify_output
  const preds = useMemo(() => {
    let p = Array.isArray(prediction) ? prediction : [];
    if ((!p || p.length === 0) && post?.model_predictions) {
      p = [
        post.model_predictions.top_1,
        post.model_predictions.top_2,
        post.model_predictions.top_3,
      ].filter(Boolean);
    }
    return (p || []).slice(0, 3);
  }, [prediction, post]);

  // 3) Build base cards (title/conf/etc), and seed thumbs with identify_output images
  const baseCards = useMemo(() => {
    // pick a display date (from post if provided)
    const dateMs =
      post?.time ??
      post?.createdAt?.toMillis?.() ??
      (post?.createdAt?.seconds ? post.createdAt.seconds * 1000 : null);

    return preds.map((p, idx) => {
      const species = p?.plant_species ?? p?.class ?? "Unknown Plant";
      const score =
        typeof p?.ai_score === "number"
          ? p.ai_score
          : typeof p?.confidence === "number"
          ? p.confidence
          : null;

      return {
        id: `${post?.id || "pred"}-${idx}`,
        species,
        confidence: typeof score === "number" ? Math.round(score * 100) : null,
        date: fmtDate(dateMs),
        // seed thumb from identify_output (same index); may be null and filled later
        thumb: identifyImages[idx] || identifyImages[0] || null,
      };
    });
  }, [preds, identifyImages, post]);

  // 4) Resolve missing thumbs by fetching from plant collection
  const [cards, setCards] = useState(baseCards);
  useEffect(() => {
    let cancelled = false;
    setCards(baseCards);

    const fillMissing = async () => {
      const next = [...baseCards];

      await Promise.all(
        next.map(async (c, i) => {
          if (c.thumb) return; // already have image from identify_output
          const key = (c.species || "").replace(/ /g, "_");
          if (!key) return;

          try {
            const snap = await getDoc(doc(db, "plant", key));
            if (!snap.exists()) return;
            const data = snap.data() || {};
            const fallback =
              data.plant_image ||
              (Array.isArray(data.sample_images) ? data.sample_images[0] : null);
            if (fallback) next[i] = { ...c, thumb: fallback };
          } catch {
            // ignore fetch errors
          }
        })
      );

      if (!cancelled) setCards(next);
    };

    // Only fetch if at least one missing
    if (baseCards.some((c) => !c.thumb)) fillMissing();

    return () => { cancelled = true; };
  }, [baseCards]);

  // 5) UI
  const rendered = cards.length ? cards : [{
    id: "empty",
    species: "No suggestions",
    confidence: null,
    date: "—",
    thumb: null,
  }];

  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Top Suggestion</Text>

        {rendered.map((c) => (
          <View key={c.id} style={styles.card}>
            {c.thumb ? (
              <Image source={{ uri: c.thumb }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, { backgroundColor: "#FFF" }]} />
            )}

            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>
                {c.species || "Unknown Plant"}
              </Text>
              <Text style={styles.meta}>{c.date}</Text>
              <Text style={styles.meta}>
                {typeof c.confidence === "number" ? `${c.confidence}% Confidence` : "—"}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pass a real navigation object instead of null */}
      <BottomNav navigation={navigation} />
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
