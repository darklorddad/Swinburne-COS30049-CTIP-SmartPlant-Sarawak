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
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "../components/NavigationExpert";
import ImageSlideshow from "../components/ImageSlideShow";

import { auth, db } from "../firebase/FirebaseConfig";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  runTransaction,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  getDocs,
} from "firebase/firestore";

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

// pretty initials color (same palette as user page)
const colors = ["#fca5a5", "#16a34a", "#a3e635", "#fef08a", "#c084fc", "#60a5fa", "#f9a8d4"];
const getColorForId = (id) => {
  if (!id) return colors[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function HomepageExpert({ navigation }) {
  const expertName =
    auth.currentUser?.displayName ||
    (auth.currentUser?.email ? auth.currentUser.email.split("@")[0] : "Expert");

  const myId = auth.currentUser?.uid || "anon";

  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [likeBusy, setLikeBusy] = useState(new Set()); // prevent spam taps
  const [saveBusy, setSaveBusy] = useState(new Set());

  // ------- Profiles map (robust: index by doc.id, uid/user_id, and email) -------
  const [profilesMap, setProfilesMap] = useState(new Map());
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "account"), (snap) => {
      const map = new Map();
      snap.forEach((s) => {
        const data = s.data() || {};
        const docId = s.id;
        const uid = data.user_id || data.uid;
        const email = (data.email || data.user_email || "").toLowerCase();
        [docId, uid, email].filter(Boolean).forEach((k) => map.set(String(k), data));
      });
      setProfilesMap(map);
    });
    return () => unsub();
  }, []);
  // -----------------------------------------------------------------------------

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

        // resolve profile for avatar
        const uidKey = v?.user_id ? String(v.user_id) : null;
        const emailKey = (v?.user_email || v?.author_email || "").toLowerCase();
        const prof =
          (uidKey && profilesMap.get(uidKey)) ||
          (emailKey && profilesMap.get(emailKey)) ||
          null;

        const authorName =
          prof?.full_name ||
          v?.author_name ||
          (v?.user_id ? `@${String(v.user_id).slice(0, 6)}` : "User");

        const userImage = prof?.profile_pic || null;

        const imageURIs = Array.isArray(v?.ImageURLs)
          ? v.ImageURLs.filter((u) => typeof u === "string" && u.trim() !== "")
          : v?.ImageURL
          ? [v.ImageURL]
          : [];

        const liked_by = Array.isArray(v?.liked_by) ? v.liked_by : [];
        const saved_by = Array.isArray(v?.saved_by) ? v.saved_by : [];
        const like_count = typeof v?.like_count === "number" ? v.like_count : liked_by.length;
        const saved_count = typeof v?.saved_count === "number" ? v.saved_count : saved_by.length;

        return {
          id: d.id,
          user_id: v.user_id || null,
          user_email: v.user_email || null,
          userImage, // ← resolved avatar
          imageURIs,
          // caption now just the plant name will render below; keep this for compatibility
          caption: top1
            ? `Top: ${top1.plant_species} (${Math.round((top1.ai_score || 0) * 100)}%)`
            : "New identification",
          author: authorName,
          time: ms,
          locality: v?.locality || "Kuching",
          prediction: [
            v?.model_predictions?.top_1,
            v?.model_predictions?.top_2,
            v?.model_predictions?.top_3,
          ].filter(Boolean),
          coordinate: v?.coordinate ?? null,
          like_count,
          comment_count: typeof v?.comment_count === "number" ? v.comment_count : 0,
          saved_by,
          saved_count,
          liked_by,
          identify_status: (v?.identify_status || "pending").toLowerCase(),

          // allow experts to see if a manual (new-species) name exists
          manual_scientific_name:
            typeof v?.manual_scientific_name === "string" ? v.manual_scientific_name : null,
        };
      });

      // only pending + verified (hide rejected)
      const visibleItems = items.filter((it) => it.identify_status !== "rejected");
      setPosts(visibleItems);
    });
    return () => unsub();
  }, [profilesMap]);

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

  const openDetail = (post) => navigation.navigate("PostDetail", { postId: post.id });

  // ===== interactions =====
  const setPostPartial = (id, patch) =>
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const toggleLike = async (p) => {
    if (!p?.id) return;
    if (likeBusy.has(p.id)) return;
    const busyNext = new Set(likeBusy);
    busyNext.add(p.id);
    setLikeBusy(busyNext);

    const already = Array.isArray(p.liked_by) && p.liked_by.includes(myId);
    const optimisticLikedBy = already
      ? p.liked_by.filter((x) => x !== myId)
      : [...(p.liked_by || []), myId];
    const optimisticLikeCount = (p.like_count || 0) + (already ? -1 : 1);

    // optimistic UI
    setPostPartial(p.id, { liked_by: optimisticLikedBy, like_count: optimisticLikeCount });

    const postRef = doc(db, "plant_identify", p.id);
    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(postRef);
        if (!snap.exists()) return;
        const v = snap.data() || {};
        const likedBy = Array.isArray(v.liked_by) ? v.liked_by : [];
        const has = likedBy.includes(myId);
        if (has && !already) {
          tx.update(postRef, {});
          return;
        }
        tx.update(postRef, {
          liked_by: already ? arrayRemove(myId) : arrayUnion(myId),
          like_count: increment(already ? -1 : 1),
        });
      });
    } catch (e) {
      // revert on fail
      setPostPartial(p.id, { liked_by: p.liked_by, like_count: p.like_count });
      console.log("toggleLike failed:", e);
    } finally {
      const done = new Set(likeBusy);
      done.delete(p.id);
      setLikeBusy(done);
    }
  };

  const toggleSave = async (p) => {
    if (!p?.id) return;
    if (saveBusy.has(p.id)) return;
    const busyNext = new Set(saveBusy);
    busyNext.add(p.id);
    setSaveBusy(busyNext);

    const already = Array.isArray(p.saved_by) && p.saved_by.includes(myId);
    const optimisticSavedBy = already
      ? p.saved_by.filter((x) => x !== myId)
      : [...(p.saved_by || []), myId];
    const optimisticSavedCount = (p.saved_count || 0) + (already ? -1 : 1);

    // optimistic UI
    setPostPartial(p.id, { saved_by: optimisticSavedBy, saved_count: optimisticSavedCount });

    const postRef = doc(db, "plant_identify", p.id);
    try {
      await updateDoc(postRef, {
        saved_by: already ? arrayRemove(myId) : arrayUnion(myId),
        saved_count: increment(already ? -1 : 1),
      });
    } catch (e) {
      // revert on fail
      setPostPartial(p.id, { saved_by: p.saved_by, saved_count: p.saved_count });
      console.log("toggleSave failed:", e);
    } finally {
      const done = new Set(saveBusy);
      done.delete(p.id);
      setSaveBusy(done);
    }
  };

  // Round icon-only badge (same look, we'll position it absolute in styles)
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
        <Ionicons name={icon} size={16} color="#fff" />
      </View>
    );
  };

  // For the small "Recent" row, use plant name (manual override then top-1)
  const recentTitle = useMemo(() => {
    if (!latest) return "Plant";
    const manual = (latest.manual_scientific_name || "").trim();
    if (manual) return manual;
    const top1 =
      (latest.prediction && latest.prediction[0]) ||
      (latest.model_predictions?.top_1 ?? null);
    return top1?.plant_species || top1?.class || "Plant";
  }, [latest]);

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greetingCard}>
          <View style={[styles.avatar, { backgroundColor: "#D7E3D8" }]} />
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
                <Text style={styles.recentTitle}>{recentTitle}</Text>
                {/* small inline badge */}
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

        {/* Feed */}
        {posts.map((p) => {
          const savedCount =
            typeof p.saved_count === "number" ? p.saved_count : p.saved_by?.length || 0;
          const liked = Array.isArray(p.liked_by) && p.liked_by.includes(myId);
          const saved = Array.isArray(p.saved_by) && p.saved_by.includes(myId);

          // plant display name: manual override → top-1 species/class → "Plant"
          const plantName =
            (p.manual_scientific_name && p.manual_scientific_name.trim()) ||
            (p.prediction?.[0]?.plant_species || p.prediction?.[0]?.class) ||
            "Plant";

          return (
            <View key={p.id} style={styles.feedCard}>
              {/* Absolute status badge top-right */}
              <View style={styles.statusAbsolute}>
                <StatusIcon status={p.identify_status} />
              </View>

              <TouchableOpacity onPress={() => openDetail(p)} activeOpacity={0.85}>
                <View style={styles.feedHeader}>
                  {p.userImage ? (
                    <Image source={{ uri: p.userImage }} style={styles.feedAvatar} />
                  ) : (
                    <View
                      style={[
                        styles.feedAvatar,
                        { backgroundColor: getColorForId(p.user_id) },
                      ]}
                    >
                      <Text style={styles.feedAvatarText}>
                        {(p.author || "U").charAt(0)}
                      </Text>
                    </View>
                  )}
                  <View style={{ marginLeft: 8, flexShrink: 1, flex: 1 }}>
                    <Text style={styles.feedName} numberOfLines={1}>
                      {p.author ?? "User"}
                    </Text>
                    <Text style={styles.feedMeta}>
                      {timeAgo(p.time)} — {p.locality ?? "—"}
                    </Text>
                  </View>
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

                {/* Plant name subtitle */}
                <Text style={{ marginTop: 8 }}>{plantName}</Text>
              </TouchableOpacity>

              {/* Bottom row with interactive icons + Details on the right */}
              <View style={styles.feedActions}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {/* like */}
                  <TouchableOpacity
                    onPress={() => toggleLike(p)}
                    disabled={likeBusy.has(p.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.countGroup}
                  >
                    <Ionicons name={liked ? "heart" : "heart-outline"} size={20} />
                    <Text style={styles.countText}>{p.like_count || 0}</Text>
                  </TouchableOpacity>

                  {/* comment -> detail page (composer there) */}
                  <TouchableOpacity
                    onPress={() => openDetail(p)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={[styles.countGroup, { marginLeft: 16 }]}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={20} />
                    <Text style={styles.countText}>{p.comment_count || 0}</Text>
                  </TouchableOpacity>

                  {/* save */}
                  <TouchableOpacity
                    onPress={() => toggleSave(p)}
                    disabled={saveBusy.has(p.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={[styles.countGroup, { marginLeft: 16 }]}
                  >
                    <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={22} />
                    <Text style={[styles.countText, { marginLeft: 6 }]}>{savedCount}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => openDetail(p)}
                  activeOpacity={0.85}
                  style={styles.detailsBtn}
                >
                  <Text style={styles.detailsBtnText}>Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
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

  // Recent
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
  recentTitle: { fontWeight: "700", color: "#2b2b2b", marginBottom: 4, maxWidth: "80%" },
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

  // Feed
  feedCard: {
    marginTop: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    position: "relative", // needed for absolute status badge
  },
  feedHeader: { flexDirection: "row", alignItems: "center" },
  feedAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#D7E3D8",
    alignItems: "center",
    justifyContent: "center",
  },
  feedAvatarText: { color: "white", fontSize: 12, fontWeight: "bold" },
  feedName: { fontWeight: "700", color: "#2b2b2b", maxWidth: "80%" },
  feedMeta: { color: "#2b2b2b", opacity: 0.7, fontSize: 12, marginBottom: 10 },

  feedImage: { height: 140, backgroundColor: "#5A7B60", borderRadius: 10, marginTop: 12 },

  // bottom row now has details on the right
  feedActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    justifyContent: "space-between",
  },
  countGroup: { flexDirection: "row", alignItems: "center" },
  countText: { marginLeft: 6 },

  // (banner style kept; element removed)
  banner: { marginTop: 12, height: 160, borderRadius: 12, backgroundColor: "#5A7B60" },

  // ===== Visible icon-only status badge (same look) =====
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

  // absolute placement like the screenshot
  statusAbsolute: { position: "absolute", top: 8, right: 10, zIndex: 2 },

  // Details pill bottom-right
  detailsBtn: {
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  detailsBtnText: { color: "#fff", fontWeight: "700" },
});
