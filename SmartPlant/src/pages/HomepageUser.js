// pages/HomepageUser.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { TOP_PAD } from "../components/StatusBarManager";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import BottomNav from "../components/Navigation";
import ImageSlideshow from "../components/ImageSlideShow";

import { auth, db } from "../firebase/FirebaseConfig";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  runTransaction,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import { getFullProfile } from "../firebase/UserProfile/UserUpdate";

const NAV_HEIGHT = 60;
const NAV_MARGIN_TOP = 150;

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

const colors = ["#fca5a5", "#16a34a", "#a3e635", "#fef08a", "#c084fc", "#60a5fa", "#f9a8d4"];
const getColorForId = (id) => {
  if (!id) return colors[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function HomepageUser({ navigation }) {
  const route = useRoute();

  const currentUserName =
    auth.currentUser?.displayName ||
    (auth.currentUser?.email ? auth.currentUser.email.split("@")[0] : null) ||
    "User";

  const myId = auth.currentUser?.uid || "anon"; // ← used for like/save

  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const fetchCurrentUserProfile = async () => {
        if (auth.currentUser?.email) {
          const profileData = await getFullProfile(auth.currentUser.email);
          setUserProfile(profileData);
        }
      };
      fetchCurrentUserProfile();
    }, [])
  );

  useEffect(() => {
    let unsubPosts = () => {};
    let unsubAccounts = () => {};

    const accountsCollection = collection(db, "account");
    unsubAccounts = onSnapshot(accountsCollection, (accountsSnapshot) => {
      const profilesMap = new Map();
      accountsSnapshot.forEach((doc) => {
        profilesMap.set(doc.id, doc.data());
      });

      const q = query(collection(db, "plant_identify"), orderBy("createdAt", "desc"), limit(20));
      if (unsubPosts) unsubPosts();

      unsubPosts = onSnapshot(q, (snap) => {
        const items = snap.docs.map((d) => {
          const v = d.data();
          const prof = profilesMap.get(v.user_id) || {};

          const top1 = v?.model_predictions?.top_1;
          const ms =
            (v?.createdAt?.toMillis?.() ||
              (v?.createdAt?.seconds ? v.createdAt.seconds * 1000 : Date.now())) ||
            Date.now();

          const author =
            prof?.full_name ||
            v?.author_name ||
            (v?.user_id ? `@${String(v.user_id).slice(0, 6)}` : "User");

          const imageURIs =
            Array.isArray(v.ImageURLs) && v.ImageURLs.length > 0
              ? v.ImageURLs
              : v.ImageURL
              ? [v.ImageURL]
              : [];

          return {
            id: d.id,
            user_id: v.user_id,
            identify_status: (v.identify_status || "pending").toLowerCase(),
            image: imageURIs[0] || null,
            imageURIs,
            userImage: prof?.profile_pic || null,
            caption: top1
              ? `Top: ${top1.plant_species} (${Math.round((top1.ai_score || 0) * 100)}%)`
              : "New identification",
            author,
            time: ms,
            locality: "Kuching",
            prediction: [
              v?.model_predictions?.top_1,
              v?.model_predictions?.top_2,
              v?.model_predictions?.top_3,
            ].filter(Boolean),
            coordinate: v?.coordinate ?? null,
            like_count:
              typeof v?.like_count === "number"
                ? v.like_count
                : Array.isArray(v?.liked_by)
                ? v.liked_by.length
                : 0,
            comment_count: typeof v?.comment_count === "number" ? v.comment_count : 0,
            saved_by: Array.isArray(v?.saved_by) ? v.saved_by : [],
            saved_count: typeof v?.saved_count === "number" ? v.saved_count : undefined,
            liked_by: Array.isArray(v?.liked_by) ? v.liked_by : [],

            // ← allow showing a manually assigned scientific name (new species)
            manual_scientific_name:
              typeof v?.manual_scientific_name === "string" ? v.manual_scientific_name : null,
          };
        });

        setPosts((prev) => {
          const map = new Map(prev.map((p) => [p.id, p]));
          items.forEach((it) => map.set(it.id, it));
          return Array.from(map.values()).sort((a, b) => b.time - a.time).slice(0, 20);
        });
      });
    });

    return () => {
      if (unsubPosts) unsubPosts();
      if (unsubAccounts) unsubAccounts();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const newPost = route.params?.newPost;
      if (newPost) {
        setPosts((prev) => {
          const exists = prev.some((p) => p.id === newPost.id);
          if (exists) return prev;
          return [
            {
              ...newPost,
              like_count: 0,
              comment_count: 0,
              saved_by: [],
              liked_by: [],
              saved_count: 0,
              identify_status: (newPost.identify_status || "pending").toLowerCase(),
            },
            ...prev,
          ].slice(0, 20);
        });
        navigation.setParams?.({ newPost: undefined });
      }
    }, [route.params?.newPost])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const openDetail = (post) => navigation.navigate("PostDetail", { postId: post.id });

  // ---- Filter: hide rejected; pending only if mine ----
  const visiblePosts = useMemo(
    () =>
      posts.filter((p) => {
        const status = (p.identify_status || "pending").toLowerCase();
        if (status === "rejected") return false;
        if (status === "pending") return p.user_id === myId;
        return true;
      }),
    [posts, myId]
  );

  // Recent card data based on visible posts
  const latest = visiblePosts[0];
  const formattedDate = useMemo(() => {
    if (!latest?.time) return "—";
    try {
      return new Date(latest.time).toDateString();
    } catch {
      return "—";
    }
  }, [latest?.time]);

  // Prefer manual (new species) name; else model top-1 species/class
  const recentTitle = useMemo(() => {
    if (!latest) return "Plant";
    const manual = (latest.manual_scientific_name || "").trim();
    if (manual) return manual;
    const top1 =
      (latest.prediction && latest.prediction[0]) ||
      (latest.model_predictions?.top_1 ?? null);
    return top1?.plant_species || top1?.class || "Plant";
  }, [latest]);

  const StatusIcon = ({ status }) => {
    let wrapStyle = styles.iconWrapPending;
    let icon = "time";
    if (status === "verified") {
      wrapStyle = styles.iconWrapVerified;
      icon = "checkmark";
    } else if (status === "rejected") {
      wrapStyle = styles.iconWrapRejected;
      icon = "close";
    }
    return (
      <View style={[styles.iconWrapBase, wrapStyle]}>
        <Ionicons name={icon} size={16} color="#fff" />
      </View>
    );
  };

  // ---- Feed actions (minimal + optimistic) ----
  const toggleLike = async (p) => {
    if (!p?.id) return;
    const ref = doc(db, "plant_identify", p.id);
    const already = Array.isArray(p.liked_by) && p.liked_by.includes(myId);
    setPosts((cur) =>
      cur.map((x) =>
        x.id === p.id
          ? {
              ...x,
              liked_by: already ? x.liked_by.filter((u) => u !== myId) : [...x.liked_by, myId],
              like_count: (x.like_count || 0) + (already ? -1 : 1),
            }
          : x
      )
    );
    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists()) return;
        const v = snap.data() || {};
        const likedBy = Array.isArray(v.liked_by) ? v.liked_by : [];
        const amIn = likedBy.includes(myId);
        if (amIn === !already) return;
        tx.update(ref, {
          liked_by: already ? arrayRemove(myId) : arrayUnion(myId),
          like_count: increment(already ? -1 : 1),
        });
      });
    } catch (e) {
      setPosts((cur) =>
        cur.map((x) =>
          x.id === p.id
            ? {
                ...x,
                liked_by: already ? [...x.liked_by, myId] : x.liked_by.filter((u) => u !== myId),
                like_count: (x.like_count || 0) + (already ? 1 : -1),
              }
            : x
        )
      );
    }
  };

  const toggleSave = async (p) => {
    if (!p?.id) return;
    const ref = doc(db, "plant_identify", p.id);
    const already = Array.isArray(p.saved_by) && p.saved_by.includes(myId);
    setPosts((cur) =>
      cur.map((x) =>
        x.id === p.id
          ? {
              ...x,
              saved_by: already ? x.saved_by.filter((u) => u !== myId) : [...x.saved_by, myId],
              saved_count:
                typeof x.saved_count === "number"
                  ? x.saved_count + (already ? -1 : 1)
                  : (x.saved_by?.length || 0) + (already ? -1 : 1),
            }
          : x
      )
    );
    try {
      await updateDoc(ref, {
        saved_by: already ? arrayRemove(myId) : arrayUnion(myId),
        saved_count: increment(already ? -1 : 1),
      });
    } catch (e) {
      setPosts((cur) =>
        cur.map((x) =>
          x.id === p.id
            ? {
                ...x,
                saved_by: already ? [...x.saved_by, myId] : x.saved_by.filter((u) => u !== myId),
                saved_count:
                  typeof x.saved_count === "number"
                    ? x.saved_count + (already ? 1 : -1)
                    : (x.saved_by?.length || 0) + (already ? 1 : -1),
              }
            : x
        )
      );
    }
  };

  const openCommentsComposer = (p) =>
    navigation.navigate("PostDetail", { postId: p.id, openComposer: true });

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
      >
        {/* Greeting */}
        <View style={styles.greetingCard}>
          {userProfile?.profile_pic ? (
            <Image source={{ uri: userProfile.profile_pic }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: getColorForId(userProfile?.user_id) }]}>
              <Text style={styles.avatarText}>
                {(userProfile?.full_name || currentUserName || "U").charAt(0)}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingTitle}>Good Morning</Text>
            <Text style={styles.greetingSub}>{userProfile?.full_name || currentUserName}</Text>
            <Text style={styles.greetingMeta}>{posts.length} 🌱 identified so far!</Text>
          </View>
        </View>

        {/* Recent */}
        <Text style={styles.sectionTitle}>Recent</Text>
        {latest ? (
          <TouchableOpacity style={styles.recentCard} onPress={() => openDetail(latest)}>
            {latest.image ? (
              <Image source={{ uri: latest.image }} style={styles.recentThumb} />
            ) : (
              <View style={styles.recentThumb} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.recentTitle}>{recentTitle}</Text>
              <Text style={styles.recentMeta}>{formattedDate}</Text>
              <Text style={styles.recentMeta}>{latest.locality ?? "—"}</Text>
            </View>
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

        {/* Feed list */}
        {visiblePosts.map((p) => {
          const savedCount =
            typeof p.saved_count === "number" ? p.saved_count : p.saved_by?.length || 0;
          const isLiked = Array.isArray(p.liked_by) && p.liked_by.includes(myId);
          const isSaved = Array.isArray(p.saved_by) && p.saved_by.includes(myId);

          // ---- Plant name for each card (manual first, else top-1) ----
          const plantName =
            (p.manual_scientific_name && p.manual_scientific_name.trim()) ||
            (p.prediction?.[0]?.plant_species || p.prediction?.[0]?.class) ||
            "Plant";

          return (
            <View key={p.id} style={styles.feedCard}>
              {/* Verified badge absolutely in top-right */}
              <View style={styles.statusAbsolute}>
                <StatusIcon status={p.identify_status} />
              </View>

              <TouchableOpacity onPress={() => openDetail(p)} activeOpacity={0.85}>
                <View style={styles.feedHeader}>
                  {p.userImage ? (
                    <Image source={{ uri: p.userImage }} style={styles.feedAvatar} />
                  ) : (
                    <View style={[styles.feedAvatar, { backgroundColor: getColorForId(p.user_id) }]}>
                      <Text style={styles.feedAvatarText}>{(p.author || "U").charAt(0)}</Text>
                    </View>
                  )}
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.feedName}>{p.author ?? "User"}</Text>
                    <Text style={styles.feedMeta}>
                      {timeAgo(p.time)} — {p.locality ?? "—"}
                    </Text>
                  </View>
                </View>

                {Array.isArray(p.imageURIs) && p.imageURIs.length > 0 ? (
                  <ImageSlideshow
                    imageURIs={p.imageURIs}
                    onSlideChange={(index) => setCurrentSlide(index)}
                    style={styles.feedImage}
                  />
                ) : (
                  <View style={styles.feedImage} />
                )}

                {/* Render plant name instead of "Top: ..." */}
                <Text style={{ marginTop: 8 }}>{plantName}</Text>
              </TouchableOpacity>

              {/* Bottom action row with Details pill on the right */}
              <View style={styles.feedActions}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={() => toggleLike(p)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.countGroup}
                  >
                    <Ionicons name={isLiked ? "heart" : "heart-outline"} size={20} />
                    <Text style={styles.countText}>{p.like_count || 0}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => openCommentsComposer(p)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={[styles.countGroup, { marginLeft: 16 }]}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={20} />
                    <Text style={styles.countText}>{p.comment_count || 0}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => toggleSave(p)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={[styles.countGroup, { marginLeft: 16 }]}
                  >
                    <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={22} />
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
  container: { flexGrow: 1, padding: 16, paddingTop: TOP_PAD },

  greetingCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#D7E3D8",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "white", fontSize: 22, fontWeight: "bold" },
  greetingTitle: { fontSize: 16, fontWeight: "600", color: "#2b2b2b" },
  greetingSub: { fontSize: 14, color: "#2b2b2b", marginTop: 2 },
  greetingMeta: { fontSize: 12, color: "#4c6b50", marginTop: 6 },

  sectionTitle: { marginTop: 18, marginBottom: 8, fontWeight: "700", color: "#2b2b2b" },
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

  feedCard: {
    marginTop: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    position: "relative",
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
  feedName: { fontWeight: "700", color: "#2b2b2b" },
  feedMeta: { color: "#2b2b2b", opacity: 0.7, fontSize: 12, marginBottom: 10 },

  feedImage: { height: 140, backgroundColor: "#5A7B60", borderRadius: 10, marginTop: 12 },

  feedActions: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  countGroup: { flexDirection: "row", alignItems: "center" },
  countText: { marginLeft: 6 },

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
  statusAbsolute: { position: "absolute", top: 8, right: 10, zIndex: 2 },

  detailsBtn: {
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  detailsBtnText: { color: "#fff", fontWeight: "700" },
});
