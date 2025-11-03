// pages/PlantDetailUser.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
} from "react-native";
import BottomNav from "../components/Navigation";

// Firestore (live comments)
import { db } from "../firebase/FirebaseConfig";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

// --- match your raised BottomNav ---
const NAV_HEIGHT = 60;      // height of BottomNav
const NAV_MARGIN_TOP = 150; // marginTop used in Navigation.js
const TOP_PAD =
  Platform.OS === "ios" ? 56 : (StatusBar.currentHeight || 0) + 8; // below notch/status bar
// -----------------------------------

const timeAgo = (ms) => {
  if (!ms) return "";
  const s = Math.max(1, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
};

export default function PlantDetailUser({ navigation, route }) {
  const { post } = route.params || {};
  const top1 = post?.prediction?.[0];

  // ---- Live comments pulled from the same place as PostDetail ----
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (!post?.id) return;
    const col = collection(db, "plant_identify", post.id, "comments");
    const q = query(col, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => {
        const v = d.data() || {};
        const ms =
          v?.createdAt?.toMillis?.() ??
          (v?.createdAt?.seconds ? v.createdAt.seconds * 1000 : Date.now());
        return {
          id: d.id,
          text: v?.text ?? "",
          user_name: v?.user_name ?? "User",
          createdAtMs: ms,
        };
      });
      setComments(rows);
    });
    return () => unsub();
  }, [post?.id]);
  // ----------------------------------------------------------------

  return (
    <View style={styles.background}>
      <ScrollView
        style={styles.scroller}
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: TOP_PAD,
            paddingBottom: NAV_HEIGHT + NAV_MARGIN_TOP + 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner / photo */}
        {post?.image ? (
          <Image source={{ uri: post.image }} style={styles.banner} />
        ) : (
          <View style={styles.banner} />
        )}

        <View style={styles.card}>
          <Text style={styles.label}>Common Name:</Text>
          <Text style={styles.value}>—</Text>

          <Text style={styles.label}>Scientific Name:</Text>
          <Text style={styles.value}>{top1?.plant_species || top1?.class || "—"}</Text>

          <Text style={styles.label}>Conservation Status:</Text>
          <View style={styles.hr} />

          <Text style={[styles.section, { marginTop: 8 }]}>Sighting Details</Text>
          <Text style={styles.sub}>Submitted By: {post?.author ?? "User"}</Text>
          <Text style={styles.sub}>
            Date Identified: {post?.time ? new Date(post.time).toDateString() : "—"}
          </Text>
          <Text style={styles.sub}>Location:</Text>
          <View style={styles.location} />

          <Text style={[styles.section, { marginTop: 10 }]}>Identification</Text>
          <Text style={styles.sub}>Confidence Score</Text>
          <Text style={styles.quote}>
            {top1
              ? `“AI identified this with ${Math.round(
                  ((top1?.ai_score ?? top1?.confidence ?? 0) * 100)
                )}% confidence.”`
              : "—"}
          </Text>

          <TouchableOpacity
            style={styles.suggestion}
            onPress={() => navigation.navigate("TopSuggestions", { post })}
          >
            <Text style={styles.suggestionText}>Top Suggestion</Text>
          </TouchableOpacity>

          {/* Comments (live) */}
          <Text style={[styles.section, { marginTop: 10 }]}>
            Comments {comments.length ? `(${comments.length})` : ""}
          </Text>

          {comments.length === 0 ? (
            <Text style={{ color: "#666", marginTop: 6 }}>No comments yet.</Text>
          ) : (
            <View style={styles.commentsBlock}>
              {comments.map((c) => (
                <View key={c.id} style={styles.commentRow}>
                  <View style={styles.commentAvatar} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>{c.user_name}</Text>
                      <Text style={styles.commentTime}>{timeAgo(c.createdAtMs)}</Text>
                    </View>
                    <Text style={styles.commentText}>{c.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <Text style={[styles.section, { marginTop: 10 }]}>Action</Text>
          <TouchableOpacity
            style={styles.report}
            onPress={() => navigation.navigate("ReportError", { post })}
          >
            <Text style={styles.reportText}>⚠ Report an Error!</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#FFF8EE" },

  // cancels the BottomNav’s big marginTop so you can scroll to the end
  scroller: { marginBottom: -NAV_MARGIN_TOP },

  // no big paddingBottom here; we add it via contentContainerStyle
  container: { flexGrow: 1 },

  banner: { height: 220, backgroundColor: "#5A7B60" },
  card: { backgroundColor: "#FFF", padding: 16 },
  label: { fontWeight: "700", color: "#222", marginTop: 6 },
  value: { color: "#333" },
  hr: { height: 1, backgroundColor: "#ddd", marginVertical: 8 },
  section: { fontWeight: "800", color: "#222" },
  sub: { color: "#444", marginTop: 4 },
  location: { height: 80, borderRadius: 8, backgroundColor: "#CFD4D0", marginTop: 4 },
  quote: { marginTop: 6, fontStyle: "italic", color: "#333" },
  suggestion: {
    marginTop: 8,
    backgroundColor: "#E0F0E0",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  suggestionText: { fontWeight: "700", color: "#2b2b2b" },


  commentsBlock: { marginTop: 10 },
  commentRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  commentAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#D7E3D8" },
  commentHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  commentAuthor: { fontWeight: "700", color: "#222" },
  commentTime: { fontSize: 12, color: "#666" },
  commentText: { color: "#222", marginTop: 2 },

  report: { marginTop: 10, paddingVertical: 10, alignItems: "flex-start" },
  reportText: { color: "#b05555", fontWeight: "700" },
});
