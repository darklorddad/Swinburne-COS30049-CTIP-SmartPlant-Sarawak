// screens/PlantManagementList.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  Platform,   // ← added
  StatusBar,  // ← added
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../firebase/FirebaseConfig";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

// Now includes "All"
const CATEGORIES = ["All", "Common", "Rare", "Endangered"];

// small top padding so the header sits a bit lower (safe under notch/status bar)
const TOP_PAD = Platform.OS === "ios" ? 56 : (StatusBar.currentHeight || 0) + 8;

export default function PlantManagementList({ navigation }) {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");

  useEffect(() => {
    const q = query(collection(db, "plant_identify"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => {
        const v = d.data() || {};
        const imgs = Array.isArray(v?.ImageURLs)
          ? v.ImageURLs
          : v?.ImageURL
          ? [v.ImageURL]
          : [];
        return {
          id: d.id,
          label: v?.model_predictions?.top_1?.plant_species || "Plant",
          image: imgs[0] || null,
          status: (v?.identify_status || "pending").toLowerCase(),
          // read the saved category from detail approve flow
          category: (v?.conservation_status || "").toLowerCase(), // "common" | "rare" | "endangered" | ""
        };
      });
      setItems(rows);
    });
    return () => unsub();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 400);
  }, []);

  const filtered = useMemo(() => {
    // search first
    const s = search.trim().toLowerCase();
    let base = !s ? items : items.filter((t) => (t.label || "").toLowerCase().includes(s));

    // then category filter (skip if All)
    if (selectedCat === "All") return base;
    const key = selectedCat.toLowerCase(); // "common" | "rare" | "endangered"
    return base.filter((t) => t.category === key);
  }, [items, search, selectedCat]);

  const StatusDot = ({ status }) => {
    if (status === "verified")
      return (
        <View style={[styles.statusDot, { backgroundColor: "#27AE60" }]}>
          <Ionicons name="checkmark" size={12} color="#fff" />
        </View>
      );
    if (status === "rejected")
      return (
        <View style={[styles.statusDot, { backgroundColor: "#D36363" }]}>
          <Ionicons name="close" size={12} color="#fff" />
        </View>
      );
    return (
      <View style={[styles.statusDot, { backgroundColor: "#9CA3AF" }]}>
        <Ionicons name="time" size={12} color="#fff" />
      </View>
    );
  };

  const CategoryPill = ({ category }) => {
    if (!category) return null;
    let pillStyle = styles.catCommon;
    let text = "Common";
    if (category === "rare") {
      pillStyle = styles.catRare;
      text = "Rare";
    } else if (category === "endangered") {
      pillStyle = styles.catEndangered;
      text = "Endangered";
    }
    return (
      <View style={[styles.catPillBase, pillStyle]}>
        <Text style={styles.catPillText}>{text}</Text>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: TOP_PAD, paddingBottom: 120 }}  // ← added top pad
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Plant Management</Text>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search"
          style={styles.search}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category chips with selection (now includes All) */}
      <View style={styles.chipsRow}>
        {CATEGORIES.map((c) => {
          const isOn = selectedCat === c;
          return (
            <TouchableOpacity
              key={c}
              style={[styles.chip, isOn && styles.chipOn]}
              onPress={() => setSelectedCat(c)}
            >
              <Text style={[styles.chipText, isOn && styles.chipTextOn]}>{c}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {filtered.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={styles.tile}
            onPress={() => navigation.navigate("PlantManagementDetail", { id: t.id })}
          >
            {t.image ? (
              <Image source={{ uri: t.image }} style={styles.tileImage} />
            ) : (
              <View style={[styles.tileImage, { backgroundColor: "#CFD4D0" }]} />
            )}

            {/* category pill top-left */}
            <View style={styles.catWrapTopLeft}>
              <CategoryPill category={t.category} />
            </View>

            {/* species name bottom (kept) */}
            <View style={styles.tileFooter}>
              <Text numberOfLines={1} style={styles.tileLabel}>
                {t.label}
              </Text>
            </View>

            {/* status top-right */}
            <View style={styles.statusWrap}>
              <StatusDot status={t.status} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F1E9", padding: 16 },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 10, color: "#2b2b2b" },

  searchRow: { marginBottom: 10 },
  search: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: "#e2e8e2",
  },

  chipsRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  chip: {
    backgroundColor: "#D7EBD7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipOn: { backgroundColor: "#2FA66A" },
  chipText: { fontWeight: "600", color: "#2b2b2b" },
  chipTextOn: { color: "#fff" },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: {
    width: "31%",
    height: 110,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#EDEDE0",
    position: "relative",
  },
  tileImage: { width: "100%", height: "100%" },

  // bottom species label
  tileFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 6,
    paddingVertical: 6,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  tileLabel: { color: "#fff", fontWeight: "700", fontSize: 12 },

  // top-right status
  statusWrap: { position: "absolute", top: 6, right: 6 },
  statusDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  // top-left category pill
  catWrapTopLeft: { position: "absolute", top: 6, left: 6 },
  catPillBase: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  catPillText: { fontSize: 10, fontWeight: "700", color: "#fff" },
  catCommon: { backgroundColor: "#2FA66A" },
  catRare: { backgroundColor: "#E6A23C" },
  catEndangered: { backgroundColor: "#D36363" },
});
