// pages/TopSuggestions.js
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import BottomNav from "../components/Navigation";
import { TOP_PAD } from "../components/StatusBarManager";
import { useRoute } from "@react-navigation/native";

// helper
const fmtDate = (ms) => {
  if (!ms) return "—";
  try { return new Date(ms).toDateString(); } catch { return "—"; }
};

export default function TopSuggestions() {
  const route = useRoute();
  const { prediction, post } = route.params || {};

  // Normalize to exactly the 3 outputs from identify_output
  const cards = useMemo(() => {
    // 1) If the identify_output passed predictions directly
    let preds = Array.isArray(prediction) ? prediction : [];

    // 2) Or if a post was passed with model_predictions
    if ((!preds || preds.length === 0) && post?.model_predictions) {
      preds = [
        post.model_predictions.top_1,
        post.model_predictions.top_2,
        post.model_predictions.top_3,
      ].filter(Boolean);
    }

    // Keep only top 3 (already ordered by your pipeline), and map to UI model
    const three = (preds || []).slice(0, 3);

    // pick a display date (from post if provided)
    const dateMs =
      post?.time ??
      post?.createdAt?.toMillis?.() ??
      (post?.createdAt?.seconds ? post.createdAt.seconds * 1000 : null);

    // pick a thumb from post if provided
    const thumb =
      (Array.isArray(post?.imageURIs) && post.imageURIs[0]) ||
      (Array.isArray(post?.ImageURLs) && post.ImageURLs[0]) ||
      post?.ImageURL ||
      null;

    const rows = three.map((p, idx) => {
      const species = p?.plant_species ?? p?.class ?? "Unknown Plant";
      const score = typeof p?.ai_score === "number"
        ? p.ai_score
        : (typeof p?.confidence === "number" ? p.confidence : null);

      return {
        id: `${post?.id || "pred"}-${idx}`,
        title: species,
        confidence: typeof score === "number" ? Math.round(score * 100) : null,
        date: fmtDate(dateMs),
        thumb,
      };
    });

    // fallback if nothing was passed
    if (rows.length === 0) {
      return [{ id: "empty", title: "No suggestions", confidence: null, date: "—", thumb: null }];
    }

    return rows;
  }, [prediction, post]);

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
