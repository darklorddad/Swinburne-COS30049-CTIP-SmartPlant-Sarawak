import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import useLiveReading from "../hooks/useLiveReading";
import { Ionicons } from "@expo/vector-icons";
import mapStyle from "../../assets/mapStyle.json";

export default function MapScreen({ navigation }) {
  const live = useLiveReading();
  const mapRef = useRef(null);

  const [plants, setPlants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🌿 Fetch all verified plants (visible + hidden)
  useEffect(() => {
    const unsubIdentify = onSnapshot(collection(db, "plant_identify"), async (snap) => {
      const detected = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((p) => p.identify_status === "verified" && p.coordinate);

      // Load master plant list
      const unsubMaster = onSnapshot(collection(db, "plant"), (snap2) => {
        const master = snap2.docs.map((d) => ({
          id: d.id,   // example: Burmannia_Longifolia
          ...d.data()
        }));

        // Merge prediction → conservation_status
        const merged = detected.map((p) => {
          const predicted = p.model_predictions?.top_1?.plant_species ?? "";
          
          // Convert spaces to underscores (match Firestore ID)
          const formatted = predicted.replace(/\s+/g, "_");

          const match = master.find(
            (m) => m.id.toLowerCase() === formatted.toLowerCase()
          );

          return {
            ...p,
            conservation_status: match?.conservation_status ?? "common",
            master_plant_image: match?.plant_image ?? null,
          };
        });

        setPlants(merged);
        setFiltered(merged);
        setLoading(false);
      });

      return () => unsubMaster();
    });

    return () => unsubIdentify();
  }, []);


  // 📍 Get user location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      let loc = await Location.getCurrentPositionAsync({});
      setUserLocation(loc.coords);
    })();
  }, []);

  // 🎨 Marker color logic
  const getPinColor = (status, isIoT = false, isHidden = false) => {
    if (isIoT) return "#000000";
    if (isHidden) return "#95a5a6";
    switch ((status || "").toLowerCase()) {
      case "rare":
        return "#f1c40f";
      case "endangered":
        return "#e74c3c";
      case "common":
        return "#2ecc71";
      default:
        return "#2ecc71";
    }
  };

  // 🔍 Filter + search logic
  useEffect(() => {
    let list = [...plants];

    if (selectedFilter === "Hidden Plant") {
      // Show only hidden plants
      list = list.filter((p) => p.visible === false);
    } else if (selectedFilter !== "all") {
      if (selectedFilter === "iot") list = [];
      else list = list.filter(
        (p) => (p.conservation_status || "").toLowerCase() === selectedFilter.toLowerCase()
      );
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.model_predictions?.top_1?.label?.toLowerCase().includes(term) ||
          p.locality?.toLowerCase().includes(term)
      );
    }

    setFiltered(list);
  }, [search, selectedFilter, plants]);


  // 🌏 Map region
  const initialRegion = {
    latitude: live?.latitude ?? 1.5533,
    longitude: live?.longitude ?? 110.3592,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // 🧭 Go to user
  const goToUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        800
      );
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 🔎 Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#555" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search plant or location..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* 🟩 Filter Buttons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 10 }}>
        {["all", "iot", "common", "rare", "endangered", "Hidden Plant"].map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterBtn, selectedFilter === key && styles.filterBtnActive]}
            onPress={() => setSelectedFilter(key)}
          >
            <Text
              style={[styles.filterText, selectedFilter === key && styles.filterTextActive]}
            >
              {key.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 🗺 Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        customMapStyle={mapStyle}
        showsUserLocation
      >
        {/* 🛰 IoT Marker */}
        {(!selectedFilter || selectedFilter === "all" || selectedFilter === "iot") && live && (
          <Marker
            coordinate={{
              latitude: live.latitude ?? 1.5533,
              longitude: live.longitude ?? 110.3592,
            }}
            title="IoT Device"
            pinColor={getPinColor(null, true)}
          >
            <Callout tooltip>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>IoT Device</Text>
                <Text>🌡 {live.temperature?.toFixed(1)}°C</Text>
                <Text>💧 {live.humidity?.toFixed(1)}%</Text>
              </View>
            </Callout>
          </Marker>
        )}

        {/* 🌿 Plant Markers (All visible + hidden) */}
        {filtered.map((p) => (
          <Marker
            key={p.id}
            coordinate={{
              latitude: p.coordinate?.latitude ?? 0,
              longitude: p.coordinate?.longitude ?? 0,
            }}
            title={p.model_predictions?.top_1?.plant_species ?? "Unknown Plant"}
            description={p.locality ?? "Unknown"}
            pinColor={getPinColor(p.conservation_status, false, p.visible === false)}
            opacity={p.visible === false ? 0.6 : 1.0}
            onCalloutPress={() => navigation.navigate("PlantDetailScreen", { plant: p })}
          >
            {/* 🏷️ Hidden Tag Above Marker */}
            {p.visible === false && (
              <View style={styles.hiddenTagContainer}>
                <Text style={styles.hiddenTagText}>Hidden</Text>
              </View>
            )}

            {Platform.OS === 'ios' ? (
              <Callout tooltip>
                <View style={styles.calloutCard}>
                  {p.ImageURLs && p.ImageURLs[0] && (
                    <Image
                      source={{ uri: p.ImageURLs[0] }}
                      style={styles.plantImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.calloutContent}>
                    <Text style={styles.calloutTitle}>
                      {p.model_predictions?.top_1?.plant_species ?? "Unknown Plant"}
                      {p.visible === false && (
                        <Text style={{ color: "#95a5a6" }}> (Hidden)</Text>
                      )}
                    </Text>
                    <Text>📍 {p.locality ?? "Unknown"}</Text>
                    <Text
                      style={{
                        fontWeight: "700",
                        color: getPinColor(p.conservation_status, false, p.visible === false),
                      }}
                    >
                      {p.conservation_status?.toUpperCase() ?? "COMMON"}
                    </Text>
                  </View>
                </View>
              </Callout>
            ) : null}
          </Marker>
        ))}
      </MapView>

      {/* 📍 Locate Button */}
      <TouchableOpacity style={styles.locateBtn} onPress={goToUserLocation}>
        <Ionicons name="locate" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

// 💅 Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  map: { flex: 1 },
  searchContainer: {
    position: "absolute",
    top: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 40,
    left: 15,
    right: 15,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 5,
  },
  searchInput: { flex: 1, fontSize: 15 },
  filterRow: {
    position: "absolute",
    top: Platform.OS === "android" ? StatusBar.currentHeight + 65 : 90,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  filterBtn: {
    backgroundColor: "#eee",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterBtnActive: { backgroundColor: "#2ecc71" },
  filterText: { fontSize: 14, fontWeight: "600", color: "#555" },
  filterTextActive: { color: "#fff" },
  callout: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    minWidth: 150,
  },
  calloutCard: {
    width: 220,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 5,
  },
  plantImage: { width: "100%", height: 120 },
  calloutContent: { padding: 8 },
  calloutTitle: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  locateBtn: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#2ecc71",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  hiddenTagContainer: {
    backgroundColor: "#555",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    marginBottom: 40, 
  },
  hiddenTagText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
});
