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
  Platform,   // ← added
  StatusBar,  // ← added
} from "react-native";
import { TOP_PAD, EXTRA_TOP_SPACE } from "../components/StatusBarManager";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import BottomNav from "../components/Navigation";

import { auth, db } from "../firebase/FirebaseConfig";
import { collection, query, orderBy, limit, onSnapshot, getDocs } from "firebase/firestore";
import { getFullProfile } from "../firebase/UserProfile/UserUpdate";

const NAV_HEIGHT = 60;      // height of your BottomNav
const NAV_MARGIN_TOP = 150; // its marginTop from Navigation.js

// top padding so the greeting isn't too high (handles notch/status bar)

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

export default function HomepageUser({ navigation }) {
  const route = useRoute();

  const currentUserName =
    auth.currentUser?.displayName ||
    (auth.currentUser?.email ? auth.currentUser.email.split("@")[0] : null) ||
    "User";

  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

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
      accountsSnapshot.forEach(doc => {
          profilesMap.set(doc.id, doc.data());
      });

      const q = query(collection(db, "plant_identify"), orderBy("createdAt", "desc"), limit(20));
      if (unsubPosts) unsubPosts(); 

      unsubPosts = onSnapshot(q, (snap) => {
          const items = snap.docs.map((d) => {
              const v = d.data();
              const userProfile = profilesMap.get(v.user_id) || {};
              
              const top1 = v?.model_predictions?.top_1;
              const ms =
                (v?.createdAt?.toMillis?.() ||
                  (v?.createdAt?.seconds ? v.createdAt.seconds * 1000 : Date.now())) ||
                Date.now();
              const author =
                v?.author_name || userProfile?.full_name || (v?.user_id ? `@${String(v.user_id).slice(0, 6)}` : "User");

              return {
                id: d.id,
                image: v?.ImageURLs?.[0] ?? v?.ImageURL ?? null,
                userImage: userProfile?.profile_pic || null,
                caption: top1
                  ? `Top: ${top1.plant_species} (${Math.round((top1.ai_score || 0) * 100)}%)`
                  : "New identification",
                author,
                time: ms,
                locality: "Kuching",
                prediction: [v?.model_predictions?.top_1, v?.model_predictions?.top_2, v?.model_predictions?.top_3].filter(Boolean),
                coordinate: v?.coordinate ?? null,
                like_count: typeof v?.like_count === "number" ? v.like_count : 0,
                comment_count: typeof v?.comment_count === "number" ? v.comment_count : 0,
                saved_by: Array.isArray(v?.saved_by) ? v.saved_by : [],
                saved_count: typeof v?.saved_count === "number" ? v.saved_count : undefined,
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
      if(unsubPosts) unsubPosts();
      if(unsubAccounts) unsubAccounts();
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

  const openDetail = (post) => navigation.navigate("PostDetail", { post });

  const latest = posts[0];
  const formattedDate = useMemo(() => {
    if (!latest?.time) return "—";
    try {
      return new Date(latest.time).toDateString();
    } catch {
      return "—";
    }
  }, [latest?.time]);

  // ===== Icon-only status (pending / verified / rejected) — same look as expert =====
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
            paddingTop: TOP_PAD,                                  // ← added
            paddingBottom: NAV_HEIGHT + NAV_MARGIN_TOP + 16,      // keep bottom room
          },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Greeting */}
        <View style={styles.greetingCard}>
          {userProfile?.profile_pic ? (
            <Image source={{ uri: userProfile.profile_pic }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar} />
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

        {/* Feed list */}
        {posts.map((p) => {
          const savedCount =
            typeof p.saved_count === "number" ? p.saved_count : (p.saved_by?.length || 0);

          return (
            <View key={p.id} style={styles.feedCard}>
              <TouchableOpacity onPress={() => openDetail(p)} activeOpacity={0.85}>
                <View style={styles.feedHeader}>
                  {p.userImage ? (
                    <Image source={{ uri: p.userImage }} style={styles.feedAvatar} />
                  ) : (
                    <View style={styles.feedAvatar} />
                  )}
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.feedName}>{p.author ?? "User"}</Text>
                    <Text style={styles.feedMeta}>
                      {timeAgo(p.time)} — {p.locality ?? "—"}
                    </Text>
                  </View>

                  <StatusIcon status={p.identify_status} />

                  <Text style={styles.detailsPill}>Details</Text>
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
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#F6F1E9" },

  // subtract the nav's marginTop from the ScrollView so you can reach the bottom
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
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#D7E3D8" },
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
  recentThumb: { width: 72, height: 72, borderRadius: 12, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#d8e3d8" },
  recentTitle: { fontWeight: "700", color: "#2b2b2b", marginBottom: 4 },
  recentMeta: { color: "#2b2b2b", opacity: 0.7, fontSize: 12 },
  linkText: { color: "#2b2b2b", opacity: 0.8, fontWeight: "600" },

  feedCard: { marginTop: 16, backgroundColor: "#FFF", borderRadius: 12, padding: 12 },
  feedHeader: { flexDirection: "row", alignItems: "center" },
  feedAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#D7E3D8" },
  feedName: { fontWeight: "700", color: "#2b2b2b" },
  feedMeta: { color: "#2b2b2b", opacity: 0.7, fontSize: 12, marginBottom: 10 },
  detailsPill: { marginLeft: "auto", backgroundColor: "#E7F0E5", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  feedImage: { height: 140, backgroundColor: "#5A7B60", borderRadius: 10, marginTop: 12 },

  feedActions: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  countGroup: { flexDirection: "row", alignItems: "center" },
  countText: { marginLeft: 6 },

  // Icon-only status badge (pending / verified / rejected)
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
    marginHorizontal: 8,
  },
  iconWrapVerified: { backgroundColor: "#27AE60" },
  iconWrapRejected: { backgroundColor: "#D36363" },
  iconWrapPending: { backgroundColor: "#9CA3AF" },
});
