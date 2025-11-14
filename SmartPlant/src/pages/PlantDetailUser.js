// pages/PlantDetailUser.js
import React, { useEffect, useMemo, useState } from "react";
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
import { collection, onSnapshot, orderBy, query, doc, getDoc } from "firebase/firestore";
import ImageSlideshow from "../components/ImageSlideShow";

// --- match your raised BottomNav ---
const NAV_HEIGHT = 60;      // height of BottomNav
const NAV_MARGIN_TOP = 150; // marginTop used in Navigation.js
const TOP_PAD =
  Platform.OS === "ios" ? 56 : (StatusBar.currentHeight || 0) + 8; // below notch/status bar
// -----------------------------------

const colors = ['#fca5a5', '#16a34a', '#a3e635', '#fef08a', '#c084fc', '#60a5fa', '#f9a8d4'];
const getColorForId = (id) => {
  if (!id) return colors[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

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

  const prediction = useMemo(() => {
    if (post?.prediction) return post.prediction;
    if (post?.model_predictions) {
      return [post.model_predictions.top_1, post.model_predictions.top_2, post.model_predictions.top_3].filter(Boolean);
    }
    return [];
  }, [post]);
  const top1 = prediction?.[0];

  // NEW: scientific name prioritizes manual_scientific_name from PlantManagementDetail
  const scientificName = useMemo(() => {
    const manual = typeof post?.manual_scientific_name === "string" ? post.manual_scientific_name.trim() : "";
    if (manual) return manual;
    return top1?.plant_species || top1?.class || "—";
  }, [post, top1]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [userProfiles, setUserProfiles] = useState(new Map());
  // ---- Live comments pulled from the same place as PostDetail ----
  const [comments, setComments] = useState([]);

  // NEW: display-only category (common/rare/endangered)
  const [displayCategory, setDisplayCategory] = useState(null); // ← NEW

  // Resolve category to display
  useEffect(() => {
    // prefer category persisted on the post (what your experts pick)
    const persisted = (post?.conservation_status || "").toLowerCase();
    if (persisted === "common" || persisted === "rare" || persisted === "endangered") {
      setDisplayCategory(persisted);
      return;
    }

    // otherwise, if verified + has a known scientific name, read from plant catalog
    const status = (post?.identify_status || "pending").toLowerCase();
    const sciName =
      post?.manual_scientific_name || // if expert created a new species
      post?.model_predictions?.top_1?.plant_species ||
      post?.model_predictions?.top_1?.class ||
      null;

    if (status === "verified" && sciName) {
      (async () => {
        try {
          const snap = await getDoc(doc(db, "plant", sciName));
          if (snap.exists()) {
            const cat = (snap.data()?.conservation_status || "").toLowerCase();
            if (cat === "common" || cat === "rare" || cat === "endangered") {
              setDisplayCategory(cat);
            } else {
              setDisplayCategory(null);
            }
          } else {
            setDisplayCategory(null);
          }
        } catch {
          setDisplayCategory(null);
        }
      })();
    } else {
      setDisplayCategory(null);
    }
  }, [post]); // ← NEW
  // ---------------------------------------------------------------

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
          user_id: v?.user_id ?? "anon",
          user_name: v?.user_name ?? "User",
          createdAtMs: ms,
        };
      });
      setComments(rows);
    });
    return () => unsub();
  }, [post?.id]);

  useEffect(() => {
    if (!comments.length) return;

    const fetchProfiles = async () => {
      const userIds = [...new Set(comments.map(c => c.user_id).filter(id => !userProfiles.has(id)))];
      if (!userIds.length) return;

      const newProfiles = new Map(userProfiles);
      await Promise.all(userIds.map(async id => {
        if (id === 'anon') return;
        const userRef = doc(db, "account", id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          newProfiles.set(id, userSnap.data());
        }
      }));
      setUserProfiles(newProfiles);
    };

    fetchProfiles();
  }, [comments]);
  // ----------------------------------------------------------------

  const lat = post?.coordinate?.latitude ?? null;
  const lng = post?.coordinate?.longitude ?? null;
  const locality = post?.locality || (lat != null && lng != null
    ? `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`
    : "—");

  const images = useMemo(() => {
    if (post?.imageURIs) return post.imageURIs;
    if (Array.isArray(post?.ImageURLs) && post.ImageURLs.length > 0) return post.ImageURLs;
    if (post?.ImageURL) return [post.ImageURL];
    if (Array.isArray(post?.image)) return post.image;
    if (post?.image) return [post.image];
    return [];
  }, [post]);

  // NEW: read-only category pill UI
  const CategoryPill = ({ category }) => {
    if (!category) return null;
    let wrap = styles.catCommon;
    let label = "Common";
    if (category === "rare") { wrap = styles.catRare; label = "Rare"; }
    if (category === "endangered") { wrap = styles.catEndangered; label = "Endangered"; }
    return (
      <View style={[styles.catPillBase, wrap]}>
        <Text style={styles.catPillText}>{label}</Text>
      </View>
    );
  };
  // -----

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
        {images.length > 0 ? (
          <ImageSlideshow
            imageURIs={images}
            onSlideChange={(index) => setCurrentSlide(index)}
            style={styles.banner}
          />
        ) : (
          <View style={styles.banner} />
        )}

        <View style={styles.card}>
          <Text style={styles.label}>Common Name:</Text>
          <Text style={styles.value}>—</Text>

          <Text style={styles.label}>Scientific Name:</Text>
          <Text style={styles.value}>{scientificName}</Text>

          <Text style={styles.label}>Conservation Status:</Text>

          {/* NEW: show category pill if we have one */}
          <View style={{ marginTop: 6, marginBottom: 6 }}>
            <CategoryPill category={displayCategory} />
          </View>

          <View style={styles.hr} />

          <Text style={[styles.section, { marginTop: 8 }]}>Sighting Details</Text>
          <Text style={styles.sub}>Submitted By: {post?.author ?? "User"}</Text>
          <Text style={styles.sub}>
            Date Identified: {post?.time ? new Date(post.time).toDateString() : "—"}
          </Text>

          {/* Location + View on Map */}
          <Text style={styles.sub}>Location: {locality}</Text>
          {lat != null && lng != null && (
            <TouchableOpacity
              style={styles.viewOnMapBtn}
              onPress={() =>
                navigation.navigate("MapPage", {
                  focus: {
                    latitude: Number(lat),
                    longitude: Number(lng),
                    title: scientificName || "Plant",
                  },
                })
              }
            >
              <Text style={styles.viewOnMapText}>View on Map</Text>
            </TouchableOpacity>
          )}

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
              {comments.map((c) => {
                const userProfile = userProfiles.get(c.user_id) || {};
                return (
                  <View key={c.id} style={styles.commentRow}>
                    {userProfile.profile_pic ? (
                      <Image source={{ uri: userProfile.profile_pic }} style={styles.commentAvatar} />
                    ) : (
                      <View style={[styles.commentAvatar, { backgroundColor: getColorForId(c.user_id) }]}>
                        <Text style={styles.avatarText}>{(userProfile.full_name || c.user_name || "U").charAt(0)}</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentAuthor}>{(userProfile && userProfile.full_name) || c.user_name || "User"}</Text>
                        <Text style={styles.commentTime}>{timeAgo(c.createdAtMs)}</Text>
                      </View>
                      <Text style={styles.commentText}>{c.text}</Text>
                    </View>
                  </View>
                );
              })}
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
  viewOnMapBtn: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: "#E0F0E0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewOnMapText: { color: "#2b2b2b", fontWeight: "700" },
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
  commentAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#D7E3D8", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "white", fontSize: 14, fontWeight: "bold" },
  commentHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  commentAuthor: { fontWeight: "700", color: "#222" },
  commentTime: { fontSize: 12, color: "#666" },
  commentText: { color: "#222", marginTop: 2 },

  report: { marginTop: 10, paddingVertical: 10, alignItems: "flex-start" },
  reportText: { color: "#b05555", fontWeight: "700" },

  // NEW: pill styles
  catPillBase: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, alignSelf: "flex-start" },
  catPillText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  catCommon: { backgroundColor: "#2FA66A" },
  catRare: { backgroundColor: "#E6A23C" },
  catEndangered: { backgroundColor: "#D36363" },
});
