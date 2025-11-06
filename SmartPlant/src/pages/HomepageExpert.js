// pages/HomepageExpert.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Platform,          // ← added
  StatusBar,         // ← added
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "../components/NavigationExpert";
import ImageSlideshow from "../components/ImageSlideShow";

import { auth, db } from "../firebase/FirebaseConfig";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

// Match NavigationExpert.js overlay
const NAV_HEIGHT = 60;
const NAV_MARGIN_TOP = 150;

// small top padding so the heading sits lower (under status bar / notch safely)
const TOP_PAD = Platform.OS === "ios" ? 56 : (StatusBar.currentHeight || 0) + 8;

const timeAgo = (ms) => {
  const s = Math.max(1, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
};

export default function HomepageExpert({ navigation }) {
  const expertName =
    auth.currentUser?.displayName ||
    (auth.currentUser?.email ? auth.currentUser.email.split("@")[0] : "Expert");

  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Live feed
  useEffect(() => {
    const qRef = query(
      collection(db, "plant_identify"),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const unsub = onSnapshot(qRef, (snap) => {
      const items = snap.docs.map((d) => {
        const v = d.data() || {};
        const top1 = v?.model_predictions?.top_1;
        const ms =
          (v?.createdAt?.toMillis?.() ??
            (v?.createdAt?.seconds ? v.createdAt.seconds * 1000 : Date.now())) ||
          Date.now();

        const author =
          v?.author_name || (v?.user_id ? `@${String(v.user_id).slice(0, 6)}` : "User");

        const imageURIs = Array.isArray(v?.ImageURLs)
          ? v.ImageURLs.filter((u) => typeof u === "string" && u.trim() !== "")
          : v?.ImageURL
          ? [v.ImageURL]
          : [];

        return {
          id: d.id,
          imageURIs,
          caption: top1
            ? `Top: ${top1.plant_species} (${Math.round((top1.ai_score || 0) * 100)}%)`
            : "New identification",
          author,
          time: ms,
          locality: v?.locality || "Kuching",
          prediction: [
            v?.model_predictions?.top_1,
            v?.model_predictions?.top_2,
            v?.model_predictions?.top_3,
          ].filter(Boolean),
          coordinate: v?.coordinate ?? null,
          like_count: typeof v?.like_count === "number" ? v.like_count : 0,
          comment_count: typeof v?.comment_count === "number" ? v.comment_count : 0,
          saved_by: Array.isArray(v?.saved_by) ? v.saved_by : [],
          saved_count: typeof v?.saved_count === "number" ? v.saved_count : undefined,
          identify_status: (v?.identify_status || "pending").toLowerCase(),
        };
      });

      setPosts(items);
    });
    return () => unsub();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 400);
  }, []);

  const latest = posts[0];
  const formattedDate = useMemo(() => {
    if (!latest?.time) return "—";
    try {
      return new Date(latest.time).toDateString();
    } catch {
      return "—";
    }
  }, [latest?.time]);

  const openDetail = (post) => navigation.navigate("PostDetail", { post });

  // Bigger, high-contrast icon-only badge
  const StatusIcon = ({ status }) => {
    let style = styles.iconWrapPending;
    let icon = "time";
    if (status === "verified") {
      style = styles.iconWrapVerified;
      icon = "checkmark";
    } else if (status === "rejected") {
      style = styles.iconWrapRejected;
      icon = "close";
    }
    return (
      <View style={[styles.iconWrapBase, style]}>
        <Ionicons name={icon} size={20} color="#fff" />
      </View>
    );
  };

  return (
    <View style={styles.background}>
      <ScrollView
        style={styles.scroller}
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: TOP_PAD,                              // ← added
            paddingBottom: NAV_HEIGHT + NAV_MARGIN_TOP + 16,
          },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting (same as user) */}
        <View style={styles.greetingCard}>
          <View style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingTitle}>Good Morning</Text>
            <Text style={styles.greetingSub}>{expertName}</Text>
            <Text style={styles.greetingMeta}>{posts.length} 🌱 identified so far!</Text>
          </View>
        </View>

        {/* Recent */}
        <Text style={styles.sectionTitle}>Recent</Text>
        {latest ? (
          <TouchableOpacity style={styles.recentCard} onPress={() => openDetail(latest)}>
            {Array.isArray(latest.imageURIs) && latest.imageURIs[0] ? (
              <Image source={{ uri: latest.imageURIs[0] }} style={styles.recentThumb} />
            ) : (
              <View style={styles.recentThumb} />
            )}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={styles.recentTitle}>Plant</Text>
                <StatusIcon status={latest.identify_status} />
              </View>
              <Text style={styles.recentMeta}>{formattedDate}</Text>
              <Text style={styles.recentMeta}>{latest.locality ?? "—"}</Text>
            </View>
            <Text style={styles.linkText}>See More →</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.recentCard, { opacity: 0.6 }]}>
            <View style={styles.recentThumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.recentTitle}>No posts yet</Text>
              <Text style={styles.recentMeta}>—</Text>
              <Text style={styles.recentMeta}>—</Text>
            </View>
          </View>
        )}

        {/* Plant Management summary */}
        <TouchableOpacity
          style={styles.pmCard}
          onPress={() => navigation.navigate("PlantManagementList")}
        >
          <Text style={styles.pmTitle}>Plant Management</Text>
          <Text style={styles.pmCount}>{posts.length || 0}</Text>
        </TouchableOpacity>

        {/* Feed — same structure as HomepageUser */}
        {posts.map((p) => {
          const savedCount =
            typeof p.saved_count === "number" ? p.saved_count : (p.saved_by?.length || 0);

          return (
            <View key={p.id} style={styles.feedCard}>
              <TouchableOpacity onPress={() => openDetail(p)} activeOpacity={0.85}>
                <View style={styles.feedHeader}>
                  <View style={styles.feedAvatar} />
                  <View style={{ marginLeft: 8, flexShrink: 1, flex: 1 }}>
                    <Text style={styles.feedName} numberOfLines={1}>
                      {p.author ?? "User"}
                    </Text>
                    <Text style={styles.feedMeta}>
                      {timeAgo(p.time)} — {p.locality ?? "—"}
                    </Text>
                  </View>

                  {/* Larger, visible icon-only badge */}
                  <StatusIcon status={p.identify_status} />

                  <Text style={[styles.detailsPill, { marginLeft: 8 }]}>Details</Text>
                </View>

                {Array.isArray(p.imageURIs) && p.imageURIs.length > 0 ? (
                  <ImageSlideshow
                    imageURIs={p.imageURIs}
                    onSlideChange={setCurrentSlide}
                    style={styles.feedImage}
                  />
                ) : (
                  <View style={styles.feedImage} />
                )}

                {p.caption ? <Text style={{ marginTop: 8 }}>{p.caption}</Text> : null}
              </TouchableOpacity>

              <View style={styles.feedActions}>
                <View style={styles.countGroup}>
                  <Ionicons name="heart-outline" size={20} />
                  <Text style={styles.countText}>{p.like_count || 0}</Text>
                </View>
                <View style={[styles.countGroup, { marginLeft: 16 }]}>
                  <Ionicons name="chatbubble-ellipses-outline" size={20} />
                  <Text style={styles.countText}>{p.comment_count || 0}</Text>
                </View>
                <View style={[styles.countGroup, { marginLeft: 16 }]}>
                  <Ionicons name="bookmark-outline" size={22} />
                  <Text style={[styles.countText, { marginLeft: 6 }]}>{savedCount}</Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* Banner (kept) */}
        <View style={styles.banner} />
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#F6F1E9" },
  scroller: { marginBottom: -NAV_MARGIN_TOP },
  container: { flexGrow: 1, padding: 16, minHeight: "100%" },

  // Greeting (same as user)
  greetingCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#D7E3D8" },
  greetingTitle: { fontSize: 16, fontWeight: "600", color: "#2b2b2b" },
  greetingSub: { fontSize: 14, color: "#2b2b2b", marginTop: 2 },
  greetingMeta: { fontSize: 12, color: "#4c6b50", marginTop: 6 },

  sectionTitle: { marginTop: 18, marginBottom: 8, fontWeight: "700", color: "#2b2b2b" },

  // Recent (same footprint as user)
  recentCard: {
    backgroundColor: "#E7F0E5",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  recentThumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#d8e3d8",
  },
  recentTitle: { fontWeight: "700", color: "#2b2b2b", marginBottom: 4 },
  recentMeta: { color: "#2b2b2b", opacity: 0.7, fontSize: 12 },
  linkText: { color: "#2b2b2b", opacity: 0.8, fontWeight: "600" },

  // PM summary
  pmCard: {
    marginTop: 12,
    backgroundColor: "#D1E7D2",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  pmTitle: { color: "#2b2b2b", fontWeight: "700" },
  pmCount: { marginTop: 6, fontSize: 28, fontWeight: "800", color: "#2b2b2b" },

  // Feed (matches HomepageUser)
  feedCard: { marginTop: 16, backgroundColor: "#FFF", borderRadius: 12, padding: 12 },
  feedHeader: { flexDirection: "row", alignItems: "center" },
  feedAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#D7E3D8" },
  feedName: { fontWeight: "700", color: "#2b2b2b", maxWidth: "80%" },
  feedMeta: { color: "#2b2b2b", opacity: 0.7, fontSize: 12, marginBottom: 10 },
  detailsPill: {
    backgroundColor: "#E7F0E5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginLeft: "auto",
  },

  feedImage: { height: 140, backgroundColor: "#5A7B60", borderRadius: 10, marginTop: 12 },

  feedActions: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  countGroup: { flexDirection: "row", alignItems: "center" },
  countText: { marginLeft: 6 },

  banner: { marginTop: 12, height: 160, borderRadius: 12, backgroundColor: "#5A7B60" },

  // ===== Visible icon-only status badge =====
  iconWrapBase: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  iconWrapVerified: { backgroundColor: "#27AE60" },
  iconWrapRejected: { backgroundColor: "#D36363" },
  iconWrapPending: { backgroundColor: "#9CA3AF" },
});
