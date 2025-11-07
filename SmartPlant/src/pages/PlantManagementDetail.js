// screens/PlantManagementDetail.js
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../firebase/FirebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  setDoc,            // << added
  collection,        // << added (for moderation_logs)
  addDoc,            // << added (for moderation_logs)
  arrayUnion,        // << added (append sample_images)
} from "firebase/firestore";
import ImageSlideshow from "../components/ImageSlideShow"; // << already added

const fmtDate = (ts) => {
  if (!ts) return "—";
  const ms = ts.toMillis?.() ?? (ts.seconds ? ts.seconds * 1000 : null);
  if (!ms) return "—";
  try {
    return new Date(ms).toDateString();
  } catch {
    return "—";
  }
};

export default function PlantManagementDetail({ route, navigation }) {
  const { id } = route.params || {};
  const [post, setPost] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // NEW: selected category (common | rare | endangered)
  const [category, setCategory] = useState(null);

  // match PlantDetailUser pattern for slideshow
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ref = doc(db, "plant_identify", id);
        const snap = await getDoc(ref);
        if (mounted && snap.exists()) {
          const data = { id: snap.id, ...snap.data() };
          setPost(data);
          // preload existing category if present
          const existing = (data?.conservation_status || data?.category || "").toLowerCase();
          if (existing === "common" || existing === "rare" || existing === "endangered") {
            setCategory(existing);
          }
        }
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const top1 = post?.model_predictions?.top_1 || null;
  const sciName = top1?.plant_species || top1?.class || "—";
  const identifyStatus = (post?.identify_status || "pending").toLowerCase();
  const coords = post?.coordinate || null;

  // All available images for this identification (used to enrich plant catalog)
  const images = useMemo(() => {
    if (!post) return [];
    if (Array.isArray(post?.ImageURLs) && post.ImageURLs.length) {
      return post.ImageURLs.filter((u) => typeof u === "string" && u.trim() !== "");
    }
    if (typeof post?.ImageURL === "string" && post.ImageURL.trim() !== "") {
      return [post.ImageURL.trim()];
    }
    return [];
  }, [post]);

  const approve = async () => {
    if (!post?.id) return;

    // Require a category before approving
    if (!category) {
      Alert.alert("Select a category", "Please choose Common, Rare, or Endangered before approving.");
      return;
    }

    setLoadingAction(true);
    try {
      // 1) Update the identification document
      await updateDoc(doc(db, "plant_identify", post.id), {
        identify_status: "verified",
        verified_by: auth.currentUser?.uid || "expert",
        verified_at: serverTimestamp(),
        // Save category (use a consistent field name for listing)
        conservation_status: category,      // <- used in PlantManagementList
        categorized_by: auth.currentUser?.uid || "expert",
        categorized_at: serverTimestamp(),
      });

      // 2) ALSO persist into the plant catalog (merge, do not overwrite existing fields)
      //    We DO NOT touch existing plant_image; instead we keep a growing sample_images array.
      if (sciName && sciName !== "—") {
        const plantRef = doc(db, "plant", sciName);
        const sampleImagesPayload = images.length ? { sample_images: arrayUnion(...images) } : {};
        await setDoc(
          plantRef,
          {
            scientific_name: sciName,
            conservation_status: category,       // keep latest chosen status
            last_verified_at: serverTimestamp(),
            last_verified_by: auth.currentUser?.uid || "expert",
            last_identify_id: post.id,
            ...sampleImagesPayload,
          },
          { merge: true }
        );
      }

      // 3) Optional: moderation log (handy for auditing)
      await addDoc(collection(db, "plant_identify", post.id, "moderation_logs"), {
        action: "approved",
        by: auth.currentUser?.uid || "expert",
        at: serverTimestamp(),
        category,
      });

      setPost((p) => ({ ...p, identify_status: "verified", conservation_status: category }));

      Alert.alert("Approved", "Post has been verified and categorized.");
      // redirect after approval
      navigation.navigate("PlantManagementList");
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to approve.");
    } finally {
      setLoadingAction(false);
    }
  };

  const reject = async () => {
    if (!post?.id) return;
    setLoadingAction(true);
    try {
      // 1) Update the identification document
      await updateDoc(doc(db, "plant_identify", post.id), {
        identify_status: "rejected",
        verified_by: auth.currentUser?.uid || "expert",
        verified_at: serverTimestamp(),
      });

      // 2) Optional: moderation log
      await addDoc(collection(db, "plant_identify", post.id, "moderation_logs"), {
        action: "rejected",
        by: auth.currentUser?.uid || "expert",
        at: serverTimestamp(),
      });

      setPost((p) => ({ ...p, identify_status: "rejected" }));
      Alert.alert("Rejected", "Post has been rejected.");
      // redirect after reject
      navigation.navigate("PlantManagementList");
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to reject.");
    } finally {
      setLoadingAction(false);
    }
  };

  const viewOnMap = () => {
    if (!coords) return;
    navigation.navigate("MapPage", { focusCoordinate: coords });
  };

  const statusChip = useMemo(() => {
    const base = [styles.statusChip];
    let label = "Pending";
    let icon = "time";
    let bg = { backgroundColor: "#9CA3AF" };
    if (identifyStatus === "verified") {
      label = "Verified";
      icon = "checkmark-circle";
      bg = { backgroundColor: "#27AE60" };
    }
    if (identifyStatus === "rejected") {
      label = "Rejected";
      icon = "close-circle";
      bg = { backgroundColor: "#D36363" };
    }
    return (
      <View style={[...base, bg]}>
        <Ionicons name={icon} size={16} color="#fff" />
        <Text style={styles.statusText}>{label}</Text>
      </View>
    );
  }, [identifyStatus]);

  // Kept for any other usage you already do; not used for rendering now
  const bannerURI = useMemo(() => {
    if (!post) return null;
    if (Array.isArray(post?.ImageURLs) && post.ImageURLs.length) return post.ImageURLs[0];
    if (typeof post?.ImageURL === "string") return post.ImageURL;
    return null;
  }, [post]);

  // Helper for category pill style
  const categoryPillStyle = (key) => {
    const base = [styles.catPill];
    const selected = category === key;
    if (key === "common") base.push(selected ? styles.catCommonOn : styles.catCommonOff);
    if (key === "rare") base.push(selected ? styles.catRareOn : styles.catRareOff);
    if (key === "endangered") base.push(selected ? styles.catEndOn : styles.catEndOff);
    return base;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 140 }}>
      {/* Top banner — now mirrors PlantDetailUser with ImageSlideshow */}
      {images.length > 0 ? (
        <ImageSlideshow
          imageURIs={images}
          onSlideChange={(index) => setCurrentSlide(index)}
          style={styles.banner}
        />
      ) : bannerURI ? (
        <Image source={{ uri: bannerURI }} style={styles.banner} />
      ) : (
        <View style={styles.banner} />
      )}

      {/* Content */}
      <View style={styles.card}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={styles.sectionHeader}>Common Name:</Text>
          {statusChip}
        </View>
        <Text style={styles.value}>—</Text>

        <Text style={styles.sectionHeader}>Scientific Name:</Text>
        <Text style={styles.value}>{sciName}</Text>

        <Text style={styles.sectionHeader}>Conservation Status:</Text>
        {/* Show current selection */}
        <View style={styles.chipRow}>
          {category ? (
            <View
              style={[
                styles.chosenChip,
                category === "common" && { backgroundColor: "#2FA66A" },
                category === "rare" && { backgroundColor: "#E6A23C" },
                category === "endangered" && { backgroundColor: "#D36363" },
              ]}
            >
              <Text style={styles.chosenChipText}>{category.toUpperCase()}</Text>
            </View>
          ) : (
            <Text style={[styles.value, { opacity: 0.7 }]}>—</Text>
          )}
        </View>

        <View style={styles.divider} />

        <Text style={[styles.sectionHeader, { marginTop: 10 }]}>Sighting Details</Text>
        <Text style={styles.fieldLabel}>Submitted by:</Text>
        <Text style={styles.value}>{post?.author_name || "User"}</Text>
        <Text style={styles.fieldLabel}>Date identified:</Text>
        <Text style={styles.value}>{fmtDate(post?.createdAt)}</Text>

        <Text style={styles.fieldLabel}>Location:</Text>
        <View style={styles.locationBox} />
        {coords ? (
          <>
            <Text style={styles.value}>
              lat: {coords.latitude ?? "—"} | lng: {coords.longitude ?? "—"}
            </Text>
            <TouchableOpacity style={styles.mapBtn} onPress={viewOnMap}>
              <Ionicons name="map" size={16} color="#fff" />
              <Text style={styles.mapBtnText}>View on Map</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={[styles.value, { opacity: 0.7 }]}>—</Text>
        )}

        <Text style={[styles.sectionHeader, { marginTop: 10 }]}>Identification</Text>
        <Text style={styles.fieldLabel}>Confidence Score</Text>
        <View style={styles.quote}>
          <Text style={styles.quoteText}>
            {top1?.ai_score != null
              ? `“AI identified this with ${Math.round((top1.ai_score || 0) * 100)}% confidence.”`
              : "—"}
          </Text>
        </View>
      </View>

      {/* Category selector */}
      {identifyStatus === "pending" && (
        <View style={styles.categoryBar}>
          <TouchableOpacity style={categoryPillStyle("common")} onPress={() => setCategory("common")}>
            <Text style={styles.catText}>Common</Text>
          </TouchableOpacity>
          <TouchableOpacity style={categoryPillStyle("rare")} onPress={() => setCategory("rare")}>
            <Text style={styles.catText}>Rare</Text>
          </TouchableOpacity>
          <TouchableOpacity style={categoryPillStyle("endangered")} onPress={() => setCategory("endangered")}>
            <Text style={styles.catText}>Endangered</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Actions — hidden once approved/rejected */}
      {identifyStatus === "pending" && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.approve, loadingAction && { opacity: 0.6 }]}
            onPress={approve}
            disabled={loadingAction}
          >
            <Text style={styles.btnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.reject, loadingAction && { opacity: 0.6 }]}
            onPress={reject}
            disabled={loadingAction}
          >
            <Text style={styles.btnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F1E9" },
  banner: { height: 160, backgroundColor: "#5A7B60" },
  card: { backgroundColor: "#FFF5EB", padding: 16 },
  sectionHeader: { fontWeight: "700", color: "#2b2b2b", marginTop: 6 },
  fieldLabel: { color: "#2b2b2b", opacity: 0.7, marginTop: 6 },
  value: { color: "#2b2b2b", marginBottom: 4 },
  divider: { height: 1, backgroundColor: "#cfcfcf", marginVertical: 8 },
  locationBox: { height: 90, borderRadius: 8, backgroundColor: "#CFD4D0", marginTop: 4 },
  quote: { marginTop: 8, paddingVertical: 12, borderTopWidth: 1, borderColor: "#cfcfcf" },
  quoteText: { fontStyle: "italic", color: "#2b2b2b" },

  actions: {
    backgroundColor: "#FFF5EB",
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexDirection: "row",
    gap: 12,
  },
  btn: { flex: 1, borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  approve: { backgroundColor: "#27AE60" },
  reject: { backgroundColor: "#D36363" },
  btnText: { color: "#fff", fontWeight: "700" },

  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#9CA3AF",
  },
  statusText: { color: "#fff", fontWeight: "700" },

  mapBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#496D4C",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mapBtnText: { color: "#fff", fontWeight: "700" },

  // ---- Category selector ----
  categoryBar: {
    backgroundColor: "#FFF5EB",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    flexDirection: "row",
    gap: 10,
  },
  catPill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 2,
  },
  // Common
  catCommonOff: { borderColor: "#2FA66A", backgroundColor: "transparent"},
  catCommonOn: { borderColor: "#2FA66A", backgroundColor: "#2FA66A" },
  // Rare
  catRareOff: { borderColor: "#E6A23C", backgroundColor: "transparent" },
  catRareOn: { borderColor: "#E6A23C", backgroundColor: "#E6A23C" },
  // Endangered
  catEndOff: { borderColor: "#D36363", backgroundColor: "transparent" },
  catEndOn: { borderColor: "#D36363", backgroundColor: "#D36363" },

  catText: { color: "#000000ff", fontWeight: "700" },

  // Chosen chip in details section
  chipRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  chosenChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chosenChipText: { color: "#fff", fontWeight: "700" },
});
