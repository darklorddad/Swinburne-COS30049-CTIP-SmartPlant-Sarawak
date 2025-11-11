import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import mapStyle from "../../assets/mapStyle.json";

export default function PlantDetailScreen({ route }) {
  const { plant } = route.params;

  const [editMode, setEditMode] = useState(false);
  const [coordinate, setCoordinate] = useState(plant.coordinate);
  const [visible, setVisible] = useState(
    plant.visible === undefined ? true : plant.visible
  );

  // 🌿 Toggle Plant Visibility (Hide/Unhide)
  const toggleVisibility = async () => {
    const newVisible = !visible;
    try {
      await updateDoc(doc(db, "plant_identify", plant.id), { visible: newVisible });
      setVisible(newVisible);
      Alert.alert(
        "Updated",
        newVisible
          ? "This plant is now visible to all users."
          : "This plant has been hidden from normal users."
      );
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  // 💾 Save new coordinates
  const saveLocation = async () => {
    try {
      await updateDoc(doc(db, "plant_identify", plant.id), { coordinate });
      setEditMode(false);
      Alert.alert("✅ Updated", "Plant coordinates updated successfully!");
    } catch (err) {
      Alert.alert("❌ Error", err.message);
    }
  };

  // 📍 Tap to move marker when editing
  const handleMapPress = (e) => {
    if (editMode) {
      const newCoord = e.nativeEvent.coordinate;
      setCoordinate(newCoord);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        {/* 🖼️ Image */}
        {plant.ImageURLs && plant.ImageURLs[0] ? (
          <Image source={{ uri: plant.ImageURLs[0] }} style={styles.image} />
        ) : (
          <View style={[styles.image, { backgroundColor: "#ccc" }]} />
        )}

        {/* 🌿 Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Plant Name</Text>
          <Text style={styles.value}>
            {plant.model_predictions?.top_1?.plant_species ?? "Unknown Plant"}
          </Text>

          <Text style={styles.label}>Plant Detail</Text>
          <Text style={styles.value}>
            🌿 Status: {plant.status ?? "common"}
            {"\n"}🧑 Author: {plant.author_name ?? "Anonymous"}
            {"\n"}📍 Locality: {plant.locality ?? "Unknown"}
          </Text>

          <Text style={[styles.label, { marginTop: 10 }]}>Coordinate</Text>
          <Text style={styles.coordText}>
            {coordinate
              ? `${coordinate.latitude.toFixed(5)}, ${coordinate.longitude.toFixed(5)}`
              : "No coordinate"}
          </Text>
        </View>

        {/* 🗺️ Map */}
        <MapView
          provider={PROVIDER_GOOGLE}
          customMapStyle={mapStyle}
          style={styles.map}
          initialRegion={{
            latitude: coordinate?.latitude ?? 1.5533,
            longitude: coordinate?.longitude ?? 110.3592,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={handleMapPress}
        >
          {coordinate && <Marker coordinate={coordinate} pinColor="red" />}
        </MapView>

        {/* ✏️ Edit / Save Buttons */}
        {!editMode ? (
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditMode(true)}>
            <Ionicons name="location-outline" size={18} color="#fff" />
            <Text style={styles.editBtnText}> Edit Location (Tap Map)</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.saveBtn} onPress={saveLocation}>
            <Ionicons name="save-outline" size={18} color="#fff" />
            <Text style={styles.saveBtnText}> Save New Location</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* 🧭 Bottom Button (Hide/Unhide Plant) */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[
            styles.bottomBtn,
            { backgroundColor: visible ? "#8e7a5c" : "#27ae60" },
          ]}
          onPress={toggleVisibility}
        >
          <Text style={styles.bottomBtnText}>
            {visible ? "Hide Plant from Users" : "Unhide Plant"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 💅 Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f2e7" },
  image: {
    width: "95%",
    height: 180,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: "center",
  },
  infoContainer: { marginTop: 15, marginHorizontal: 20 },
  label: { fontWeight: "bold", fontSize: 15, color: "#000", marginBottom: 2 },
  value: { fontSize: 15, color: "#333", marginBottom: 8 },
  coordText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 5,
    fontStyle: "italic",
  },
  map: {
    width: "90%",
    height: 220,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 10,
  },
  editBtn: {
    flexDirection: "row",
    backgroundColor: "#2ecc71",
    borderRadius: 10,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    width: "90%",
    alignSelf: "center",
  },
  editBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  saveBtn: {
    flexDirection: "row",
    backgroundColor: "#27ae60",
    borderRadius: 10,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    width: "90%",
    alignSelf: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  bottomActions: {
    position: "absolute",
    bottom: 15,
    width: "100%",
    alignItems: "center",
  },
  bottomBtn: {
    width: "90%",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginVertical: 5,
  },
  bottomBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
