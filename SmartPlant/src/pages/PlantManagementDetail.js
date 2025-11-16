// pages/PlantManagementDetail.js
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../firebase/FirebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  setDoc,
  collection,
  addDoc,
  arrayUnion, // ← needed in approve() for sample_images
} from "firebase/firestore";
import ImageSlideshow from "../components/ImageSlideShow";

// new imports
import submitVerification from "../firebase/verification/submitVerification"; // default export
import { getDisplayName } from "../firebase/UserProfile/getDisplayName";

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

const HIGH_CONFIDENCE_THRESHOLD = 0.75;
const TOP_PAD =
  Platform.OS === "ios" ? 56 : (StatusBar.currentHeight || 0) + 8; // ↓ push content down

export default function PlantManagementDetail({ route, navigation }) {
  const { id } = route.params || {};
  const [post, setPost] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // existing category state (used for pills)
  const [category, setCategory] = useState(null);

  const [currentSlide, setCurrentSlide] = useState(0);

  const [autoSuggest, setAutoSuggest] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState(null);

  // read-only fallback category if doc has none but plant catalog has one (verified docs)
  const [catalogCategory, setCatalogCategory] = useState(null);

  // ===== species source mode =====
  const [mode, setMode] = useState("prediction");

  // when admin creates a new species
  const [newSciName, setNewSciName] = useState("");

  // conservation status fetched for the predicted sciName from plant catalog
  const [predictionFetchedStatus, setPredictionFetchedStatus] = useState(null);

  // show friendly name for who decided (verified_by / rejected_by / decided_by)
  const [verifiedByName, setVerifiedByName] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ref = doc(db, "plant_identify", id);
        const snap = await getDoc(ref);
        if (!mounted || !snap.exists()) return;

        const data = { id: snap.id, ...snap.data() };
        setPost(data);

        // fetch who decided if exists
        const decidedUid =
          data?.verified_by || data?.rejected_by || data?.decided_by || null;
        if (decidedUid) {
          try {
            const name = await getDisplayName(decidedUid);
            if (mounted) setVerifiedByName(name || decidedUid);
          } catch {
            if (mounted) setVerifiedByName(decidedUid);
          }
        } else {
          if (mounted) setVerifiedByName(null);
        }

        const existing = (
          data?.conservation_status ||
          data?.category ||
          ""
        ).toLowerCase();
        if (["common", "rare", "endangered"].includes(existing)) {
          setCategory(existing);
        }

        const top1 = data?.model_predictions?.top_1 || {};
        const score = typeof top1?.ai_score === "number" ? top1.ai_score : 0;

        // ✅ PREFER manual_scientific_name if it already exists on the doc
        const sciName =
          (typeof data?.manual_scientific_name === "string" &&
            data.manual_scientific_name.trim()) ||
          top1?.plant_species ||
          top1?.class ||
          null;

        const isPending =
          (data?.identify_status || "pending").toLowerCase() === "pending";

        // Auto-suggest for pending + high confidence + known species
        if (isPending && sciName && score >= HIGH_CONFIDENCE_THRESHOLD) {
          try {
            const plantSnap = await getDoc(doc(db, "plant", sciName));
            if (plantSnap.exists()) {
              const cat = (
                plantSnap.data()?.conservation_status || ""
              ).toLowerCase();
              if (["common", "rare", "endangered"].includes(cat)) {
                setSuggestedCategory(cat);
                if (!existing) setCategory(cat);
                setAutoSuggest(true);
              }
            }
          } catch {
            // ignore
          }
        }

        // If verified but no category on doc, show catalog value read-only
        const isVerified =
          (data?.identify_status || "pending").toLowerCase() === "verified";
        if (isVerified && sciName && !existing) {
          try {
            const plantSnap = await getDoc(doc(db, "plant", sciName));
            if (plantSnap.exists()) {
              const cat = (
                plantSnap.data()?.conservation_status || ""
              ).toLowerCase();
              if (["common", "rare", "endangered"].includes(cat)) {
                setCatalogCategory(cat);
              }
            }
          } catch {
            // ignore
          }
        }

        // always fetch conservation status for predicted/explicit sciName (for prediction mode)
        if (sciName) {
          try {
            const plantSnap = await getDoc(doc(db, "plant", sciName));
            if (plantSnap.exists()) {
              const cat = (
                plantSnap.data()?.conservation_status || ""
              ).toLowerCase();
              if (["common", "rare", "endangered"].includes(cat)) {
                setPredictionFetchedStatus(cat);
              } else {
                setPredictionFetchedStatus(null);
              }
            } else {
              setPredictionFetchedStatus(null);
            }
          } catch {
            setPredictionFetchedStatus(null);
          }
        } else {
          setPredictionFetchedStatus(null);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const top1 = post?.model_predictions?.top_1 || null;

  // ✅ PREFER manual_scientific_name for display & for map title
  const sciName =
    (typeof post?.manual_scientific_name === "string" &&
      post.manual_scientific_name.trim()) ||
    top1?.plant_species ||
    top1?.class ||
    "—";

  const identifyStatus = (post?.identify_status || "pending").toLowerCase();
  const coords = post?.coordinate || null;
  const locationLabel = post?.locality || "Unknown location";

  const images = useMemo(() => {
    if (!post) return [];
    if (Array.isArray(post?.ImageURLs) && post.ImageURLs.length) {
      return post.ImageURLs.filter(
        (u) => typeof u === "string" && u.trim() !== ""
      );
    }
    if (typeof post?.ImageURL === "string" && post.ImageURL.trim() !== "") {
      return [post.ImageURL.trim()];
    }
    return [];
  }, [post]);

  const approve = async () => {
    if (!post?.id) return;

    // Determine final scientific name + category by mode
    let finalSciName = null;
    let finalCategory = null;

    if (mode === "prediction") {
      finalSciName = sciName && sciName !== "—" ? sciName : null;
      finalCategory =
        predictionFetchedStatus || // from plant catalog
        suggestedCategory || // auto-suggested (if available)
        catalogCategory || // read-only fallback (verified)
        null;

      if (!finalSciName) {
        Alert.alert("Missing species", "No predicted species available.");
        return;
      }
      if (!finalCategory) {
        Alert.alert(
          "Missing conservation status",
          "This species is not in the catalog yet. Please switch to 'New Species' and set a category."
        );
        return;
      }
    } else {
      // mode === "new"
      finalSciName = (newSciName || "").trim();
      finalCategory = category || null;

      if (!finalSciName) {
        Alert.alert(
          "Enter scientific name",
          "Please type the new species scientific name."
        );
        return;
      }
      if (!["common", "rare", "endangered"].includes(finalCategory || "")) {
        Alert.alert(
          "Select a category",
          "Please choose Common, Rare, or Endangered."
        );
        return;
      }
    }

    setLoadingAction(true);
    try {
      // First attempt to submit the verification decision via centralized function.
      const res = await submitVerification({
        plantIdentifyId: post.id,
        expertId: auth.currentUser?.uid,
        vote: "approve",
      });

      if (res && res.alreadyDecided) {
        // someone already decided
        const whoUid = res.decidedBy || null;
        let whoName = whoUid;
        try {
          whoName = whoUid ? await getDisplayName(whoUid) : whoUid;
        } catch {
          whoName = whoUid;
        }
        Alert.alert(
          "Already decided",
          `This item was already ${res.decidedStatus} by ${whoName || whoUid}.`
        );
        // refresh document to reflect final state
        const fresh = await getDoc(doc(db, "plant_identify", post.id));
        if (fresh.exists()) setPost({ id: fresh.id, ...fresh.data() });
        navigation.navigate("PlantManagementList");
        return;
      }

      // ✅ Persist chosen sciName + category back onto plant_identify doc
      try {
        const identifyRef = doc(db, "plant_identify", post.id);
        const updatePayload = {
          conservation_status: finalCategory,
        };
        if (mode === "new") {
          updatePayload.manual_scientific_name = finalSciName;
        }
        await updateDoc(identifyRef, updatePayload);
      } catch (err) {
        console.warn(
          "Failed to update plant_identify with manual sci name/category:",
          err
        );
      }

      // Merge into plant catalog (append sample_images only; don't overwrite plant_image)
      if (finalSciName) {
        const plantRef = doc(db, "plant", finalSciName);
        const sampleImagesPayload = images.length
          ? { sample_images: arrayUnion(...images) }
          : {};
        await setDoc(
          plantRef,
          {
            scientific_name: finalSciName,
            conservation_status: finalCategory,
            last_verified_at: serverTimestamp(),
            last_verified_by: auth.currentUser?.uid || "expert",
            last_identify_id: post.id,
            ...sampleImagesPayload,
          },
          { merge: true }
        );
      }

      // Log moderation action locally as well (best-effort)
      try {
        await addDoc(
          collection(db, "plant_identify", post.id, "moderation_logs"),
          {
            action: "approved",
            by: auth.currentUser?.uid || "expert",
            at: serverTimestamp(),
            category: finalCategory,
            mode,
          }
        );
      } catch {
        // ignore
      }

      // ✅ Update local state so UI shows verified + new sci name (if any)
      setPost((p) => ({
        ...p,
        identify_status: "verified",
        conservation_status: finalCategory,
        verified_by: auth.currentUser?.uid,
        ...(mode === "new"
          ? { manual_scientific_name: finalSciName }
          : {}),
      }));
      setCategory(finalCategory);

      Alert.alert("Approved", "Post has been verified and categorized.");
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
      const res = await submitVerification({
        plantIdentifyId: post.id,
        expertId: auth.currentUser?.uid,
        vote: "reject",
      });

      if (res && res.alreadyDecided) {
        const whoUid = res.decidedBy || null;
        let whoName = whoUid;
        try {
          whoName = whoUid ? await getDisplayName(whoUid) : whoUid;
        } catch {
          whoName = whoUid;
        }
        Alert.alert(
          "Already decided",
          `This item was already ${res.decidedStatus} by ${whoName || whoUid}.`
        );
        const fresh = await getDoc(doc(db, "plant_identify", post.id));
        if (fresh.exists()) setPost({ id: fresh.id, ...fresh.data() });
        navigation.navigate("PlantManagementList");
        return;
      }

      // add moderation log
      try {
        await addDoc(
          collection(db, "plant_identify", post.id, "moderation_logs"),
          {
            action: "rejected",
            by: auth.currentUser?.uid || "expert",
            at: serverTimestamp(),
          }
        );
      } catch {
        // ignore
      }

      setPost((p) => ({
        ...p,
        identify_status: "rejected",
        rejected_by: auth.currentUser?.uid,
      }));
      Alert.alert("Rejected", "Post has been rejected.");
      navigation.navigate("PlantManagementList");
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to reject.");
    } finally {
      setLoadingAction(false);
    }
  };

  // send coords + id so MapPage can center AND open the card
  const viewOnMap = () => {
    if (!coords) return;

    const lat = Number(coords.latitude);
    const lng = Number(coords.longitude);

    navigation.navigate("MapPage", {
      focus: {
        latitude: lat,
        longitude: lng,
        title: sciName || "Plant",
      },
      focusMarkerId: post.id, // for MapPage to auto-open this marker
    });
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

  const bannerURI = useMemo(() => {
    if (!post) return null;
    if (Array.isArray(post?.ImageURLs) && post.ImageURLs.length)
      return post.ImageURLs[0];
    if (typeof post?.ImageURL === "string") return post.ImageURL;
    return null;
  }, [post]);

  const categoryPillStyle = (key) => {
    const base = [styles.catPill];
    const selected = category === key;
    if (key === "common") base.push(selected ? styles.catCommonOn : styles.catCommonOff);
    if (key === "rare") base.push(selected ? styles.catRareOn : styles.catRareOff);
    if (key === "endangered") base.push(selected ? styles.catEndOn : styles.catEndOff);
    return base;
  };

  const topConfidencePct = useMemo(() => {
    if (!top1?.ai_score && top1?.ai_score !== 0) return null;
    return Math.round(top1.ai_score * 100);
  }, [top1?.ai_score]);

  // which category to show in the details section
  const displayCategory =
    (mode === "prediction"
      ? predictionFetchedStatus || suggestedCategory || catalogCategory || category
      : category) || null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: TOP_PAD, // 🔻 this pushes everything down
        paddingBottom: 140,
      }}
    >
      {/* Banner / slideshow */}
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

      <View style={styles.card}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={styles.sectionHeader}>Common Name:</Text>
          {statusChip}
        </View>
        <Text style={styles.value}>—</Text>

        {/* species source switch */}
        {identifyStatus === "pending" && (
          <>
            <Text style={[styles.sectionHeader, { marginTop: 8 }]}>
              Species Source
            </Text>
            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[
                  styles.modePill,
                  mode === "prediction" ? styles.modeOn : styles.modeOff,
                ]}
                onPress={() => setMode("prediction")}
              >
                <Text
                  style={[
                    styles.modeText,
                    mode === "prediction" && styles.modeTextOn,
                  ]}
                >
                  Use Prediction
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modePill,
                  mode === "new" ? styles.modeOn : styles.modeOff,
                ]}
                onPress={() => setMode("new")}
              >
                <Text
                  style={[
                    styles.modeText,
                    mode === "new" && styles.modeTextOn,
                  ]}
                >
                  New Species
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Text style={styles.sectionHeader}>Scientific Name:</Text>
        {mode === "new" && identifyStatus === "pending" ? (
          <TextInput
            value={newSciName}
            onChangeText={setNewSciName}
            placeholder="Enter new scientific name"
            style={styles.input}
            placeholderTextColor="#666"
          />
        ) : (
          <Text style={styles.value}>{sciName}</Text>
        )}

        <Text style={styles.sectionHeader}>Conservation Status:</Text>

        {/* show a hint when auto-suggested (pending) */}
        {identifyStatus === "pending" &&
          autoSuggest &&
          mode === "prediction" && (
            <View style={styles.autoBanner}>
              <Ionicons name="flash" size={16} color="#fff" />
              <Text style={styles.autoBannerText}>
                Suggested:{" "}
                {(suggestedCategory || predictionFetchedStatus)?.toUpperCase() ||
                  "—"}{" "}
                (from catalog / high confidence)
              </Text>
            </View>
          )}

        {/* Read-only chip in prediction mode; selector in new mode */}
        {mode === "prediction" ? (
          <View style={styles.chipRow}>
            {displayCategory ? (
              <View
                style={[
                  styles.chosenChip,
                  displayCategory === "common" && {
                    backgroundColor: "#2FA66A",
                  },
                  displayCategory === "rare" && {
                    backgroundColor: "#E6A23C",
                  },
                  displayCategory === "endangered" && {
                    backgroundColor: "#D36363",
                  },
                ]}
              >
                <Text style={styles.chosenChipText}>
                  {displayCategory.toUpperCase()}
                </Text>
              </View>
            ) : (
              <Text style={[styles.value, { opacity: 0.7 }]}>—</Text>
            )}
          </View>
        ) : (
          <View style={styles.categoryBar}>
            <TouchableOpacity
              style={categoryPillStyle("common")}
              onPress={() => setCategory("common")}
            >
              <Text style={styles.catText}>Common</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={categoryPillStyle("rare")}
              onPress={() => setCategory("rare")}
            >
              <Text style={styles.catText}>Rare</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={categoryPillStyle("endangered")}
              onPress={() => setCategory("endangered")}
            >
              <Text style={styles.catText}>Endangered</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="divider" style={styles.divider} />

        <Text style={[styles.sectionHeader, { marginTop: 10 }]}>
          Sighting Details
        </Text>
        <Text style={styles.fieldLabel}>Submitted by:</Text>
        <Text style={styles.value}>{post?.author_name || "User"}</Text>
        <Text style={styles.fieldLabel}>Date identified:</Text>
        <Text style={styles.value}>{fmtDate(post?.createdAt)}</Text>

        {/* LOCATION SECTION */}
        <Text style={styles.fieldLabel}>Location:</Text>
        <Text style={styles.value}>{locationLabel}</Text>
        {coords && (
          <TouchableOpacity style={styles.mapBtn} onPress={viewOnMap}>
            <Ionicons name="map" size={16} color="#fff" />
            <Text style={styles.mapBtnText}>View on Map</Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.sectionHeader, { marginTop: 10 }]}>
          Identification
        </Text>
        <Text style={styles.fieldLabel}>Confidence Score</Text>
        <View style={styles.quote}>
          <Text style={styles.quoteText}>
            {topConfidencePct != null
              ? `“AI identified this with ${topConfidencePct}% confidence.”`
              : "—"}
          </Text>
        </View>
      </View>

      {/* show verified/rejected by when available */}
      {(identifyStatus === "verified" || identifyStatus === "rejected") &&
        verifiedByName && (
          <View style={{ marginTop: 10, paddingHorizontal: 16 }}>
            <Text style={[styles.fieldLabel]}>
              {identifyStatus === "verified"
                ? "Verified by:"
                : "Rejected by:"}
            </Text>
            <Text style={styles.value}>{verifiedByName}</Text>
          </View>
        )}

      {/* Actions (only while pending) */}
      {identifyStatus === "pending" && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.btn,
              styles.approve,
              loadingAction && { opacity: 0.6 },
            ]}
            onPress={approve}
            disabled={loadingAction}
          >
            <Text style={styles.btnText}>
              {mode === "prediction"
                ? "Approve Prediction"
                : "Approve New Species"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.btn,
              styles.reject,
              loadingAction && { opacity: 0.6 },
            ]}
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
  locationBox: {
    height: 90,
    borderRadius: 8,
    backgroundColor: "#CFD4D0",
    marginTop: 4,
  },
  quote: { marginTop: 8, paddingVertical: 12, borderTopWidth: 1, borderColor: "#cfcfcf" },
  quoteText: { fontStyle: "italic", color: "#2b2b2b" },

  actions: {
    backgroundColor: "#FFF5EB",
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  btn: {
    flexGrow: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
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

  // Existing category selector (used in "new" mode)
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
  catCommonOff: { borderColor: "#2FA66A", backgroundColor: "transparent" },
  catCommonOn: { borderColor: "#2FA66A", backgroundColor: "#2FA66A" },
  catRareOff: { borderColor: "#E6A23C", backgroundColor: "transparent" },
  catRareOn: { borderColor: "#E6A23C", backgroundColor: "#E6A23C" },
  catEndOff: { borderColor: "#D36363", backgroundColor: "transparent" },
  catEndOn: { borderColor: "#D36363", backgroundColor: "#D36363" },
  catText: { color: "#000000ff", fontWeight: "700" },

  chipRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  chosenChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  chosenChipText: { color: "#fff", fontWeight: "700" },

  autoBanner: {
    marginTop: 6,
    marginBottom: 6,
    backgroundColor: "#60A5FA",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  autoBannerText: { color: "#fff", fontWeight: "700" },

  // species source switch & input
  modeRow: { flexDirection: "row", gap: 10, marginTop: 6, marginBottom: 4 },
  modePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    borderWidth: 2,
  },
  modeOn: { backgroundColor: "#2FA66A", borderColor: "#2FA66A" },
  modeOff: { backgroundColor: "transparent", borderColor: "#2FA66A" },
  modeText: { fontWeight: "700", color: "#2b2b2b" },
  modeTextOn: { color: "#fff" },
  input: {
    marginTop: 6,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#222",
  },
});
