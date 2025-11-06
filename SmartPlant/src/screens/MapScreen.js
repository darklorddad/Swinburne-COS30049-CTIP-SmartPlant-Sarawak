import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import useLiveReading from "../hooks/useLiveReading";
import { Ionicons } from "@expo/vector-icons";

export default function MapScreen() {
  const live = useLiveReading(); // IoT data
  const mapRef = useRef(null);

  const [plants, setPlants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [userLocation, setUserLocation] = useState(null);

  // 🌿 Fetch plants
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "plant_identify"), (snap) => {
      const arr = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((p) => p.identify_status === "verified" && p.coordinate);
      setPlants(arr);
      setFiltered(arr);
    });
    return () => unsub();
  }, []);

  // 📍 Request user location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      let loc = await Location.getCurrentPositionAsync({});
      setUserLocation(loc.coords);
    })();
  }, []);

  // 🎨 Marker color based on status
  const getPinColor = (status, isIoT = false) => {
    if (isIoT) return "#000000"; // IoT black
    switch ((status || "").toLowerCase()) {
      case "rare":
        return "#f1c40f"; // yellow
      case "endangered":
        return "#e74c3c"; // red
      case "common":
        return "#2ecc71"; // green
      default:
        return "#2ecc71"; // fallback
    }
  };

  // 🔍 Filter & search logic
  useEffect(() => {
    let list = [...plants];
    if (selectedFilter !== "all") {
      if (selectedFilter === "iot") {
        list = []; // IoT handled separately
      } else {
        list = list.filter(
          (p) => (p.status || "").toLowerCase() === selectedFilter
        );
      }
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

  // 🗺 Default region
  const initialRegion = {
    latitude: live?.latitude ?? 1.5533,
    longitude: live?.longitude ?? 110.3592,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // 📍 Center on user
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
      >
        {["all", "iot", "common", "rare", "endangered"].map((key) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.filterBtn,
              selectedFilter === key && styles.filterBtnActive,
            ]}
            onPress={() => setSelectedFilter(key)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === key && styles.filterTextActive,
              ]}
            >
              {key.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 🗺 Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        followsUserLocation={false}
      >
        {/* 🛰 IoT Device */}
        {(!selectedFilter || selectedFilter === "all" || selectedFilter === "iot") &&
          live && (
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
                  <Text>
                    📍 {live.latitude?.toFixed(4)}, {live.longitude?.toFixed(4)}
                  </Text>
                </View>
              </Callout>
            </Marker>
          )}

        {/* 🌿 Plant Markers */}
        {filtered.map((p) => (
          <Marker
            key={p.id}
            coordinate={{
              latitude: p.coordinate?.latitude ?? 0,
              longitude: p.coordinate?.longitude ?? 0,
            }}
            title={p.model_predictions?.top_1?.label ?? "Plant"}
            pinColor={getPinColor(p.status)}
          >
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
                    {p.model_predictions?.top_1?.label ?? "Plant"}
                  </Text>
                  <Text style={styles.calloutSubtitle}>
                    Confidence:{" "}
                    {(p.model_predictions?.top_1?.ai_score * 100).toFixed(1)}%
                  </Text>
                  <Text>🧑 {p.author_name ?? "Anonymous"}</Text>
                  <Text>📍 {p.locality ?? "Unknown"}</Text>
                  <Text>
                    🌿 Status:{" "}
                    <Text
                      style={{
                        fontWeight: "700",
                        color: getPinColor(p.status),
                      }}
                    >
                      {p.status ?? "common"}
                    </Text>
                  </Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* 📍 My Location Button */}
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
    top: 40,
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
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterRow: {
    position: "absolute",
    top: 90,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 10,
  },
  filterBtn: {
    backgroundColor: "#eee",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterBtnActive: {
    backgroundColor: "#2ecc71",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  filterTextActive: {
    color: "#fff",
  },
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
  plantImage: {
    width: "100%",
    height: 120,
  },
  calloutContent: {
    padding: 8,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  calloutSubtitle: {
    fontSize: 12,
    marginBottom: 4,
    color: "#555",
  },
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
});
