// pages/identify_output.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { addPlantIdentify } from "../firebase/plant_identify/addPlantIdentify.js";
import { uploadImage } from "../firebase/plant_identify/uploadImage.js";
import { auth, db } from "../firebase/FirebaseConfig";
import {
  serverTimestamp,
  addDoc,
  collection,
  doc,
  getDoc,
} from "firebase/firestore";
import PlantSuggestionCard from "../components/PlantSuggestionCard.js";
import ImageSlideshow from "../components/ImageSlideShow.js";
import { useRoute, useNavigation } from "@react-navigation/native";
// noti
import { updateNotificationPayload } from "../firebase/notification_user/updateNotificationPayload";
import { getDisplayName } from "../firebase/UserProfile/getDisplayName";
// device/location
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";

export default function ResultScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { prediction = [], imageURI } = route.params || {};

  // normalize predictions (at least 3)
  const safePred =
    Array.isArray(prediction) && prediction.length
      ? [...prediction]
      : [{ class: "Unknown", confidence: 0 }];
  while (safePred.length < 3) {
    safePred.push({
      class: safePred[0].class,
      confidence: safePred[0].confidence ?? 0,
    });
  }

  // slideshow + heatmap state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heatmapURIs, setHeatmapURIs] = useState([]);
  const [loading, setLoading] = useState(false); // heatmap spinner
  const [showHeatmap, setShowHeatmap] = useState(false);

  // upload spinner
  const [UPloading, setUPLoading] = useState(false);

  // top 3 plant images for suggestion cards
  const [plantImages, setPlantImages] = useState([]);

  // ----- helpers -----
  const normalizeImages = (input) => {
    if (!input) return [];
    const arr = Array.isArray(input) ? input : [input];
    return arr
      .filter((u) => typeof u === "string")
      .map((u) => u.trim())
      .filter(Boolean);
  };

  const images = normalizeImages(imageURI);

  const constructHeatmap = async () => {
    if (heatmapURIs.length > 0) {
      setShowHeatmap((v) => !v);
      return;
    }
    if (!images.length) {
      Alert.alert("No image", "Image is missing.");
      return;
    }
    const formData = new FormData();
    images.forEach((uri, index) => {
      formData.append("images", {
        uri,
        type: "image/jpeg",
        name: `photo_${index + 1}.jpg`,
      });
    });

    try {
      setLoading(true);
      const response = await fetch("http://192.168.1.8:3000/heatmap", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setLoading(false);

      if (data?.heatmaps && Array.isArray(data.heatmaps)) {
        setHeatmapURIs(data.heatmaps.filter((u) => typeof u === "string"));
        setShowHeatmap(true);
      } else {
        Alert.alert("Heatmaps not returned from server.");
      }
    } catch (err) {
      setLoading(false);
      Alert.alert("Failed to generate heatmaps. Check backend connection.");
    }
  };

  const makeLocality = async (lat, lng) => {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });
      const r = results?.[0];
      if (!r) return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      const city = r.city || r.subregion || r.district || "";
      const region = r.region || r.subregion || "";
      const parts = [city, region].filter(Boolean);
      return parts.length ? parts.join(", ") : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  };

  const uploadDataToDatabase = async () => {
    // guard: must have images
    if (!images.length) {
      Alert.alert("No images found", "Please select at least one image to upload.");
      return;
    }

    try {
      setUPLoading(true);

      // ----- upload all images -----
      const downloadURLs = [];
      for (let i = 0; i < images.length; i++) {
        const uri = images[i];
        if (uri.startsWith("http")) {
          downloadURLs.push(uri);
          continue;
        }
        try {
          const uploadedURL = await uploadImage(uri, safePred?.[i]?.class || "Unknown");
          downloadURLs.push(uploadedURL);
        } catch (e) {
          Alert.alert("Upload failed", `Image ${i + 1} failed. Please try again.`);
          // keep going to upload others
        }
      }

      // update notification payload (if present)
      try {
        const { notiId } = route.params || {};
        if (notiId && downloadURLs.length > 0) {
          await updateNotificationPayload(notiId, {
            imageURLs: downloadURLs,
            top_1: {
              plant_species: safePred?.[0]?.class || "Unknown",
              ai_score: safePred?.[0]?.confidence || 0,
            },
            top_2: {
              plant_species: safePred?.[1]?.class || "",
              ai_score: safePred?.[1]?.confidence || 0,
            },
            top_3: {
              plant_species: safePred?.[2]?.class || "",
              ai_score: safePred?.[2]?.confidence || 0,
            },
          });
          navigation.setParams({ imageURI: downloadURLs, hasImage: true });
        }
      } catch {
        // ignore notification update errors
      }

      // ----- EXIF/device location -----
      let latitude = null;
      let longitude = null;
      try {
        const exifResult = await ImagePicker.getExifAsync(images[0]);
        if (exifResult?.GPSLatitude && exifResult?.GPSLongitude) {
          latitude = exifResult.GPSLatitude;
          longitude = exifResult.GPSLongitude;
        }
      } catch {
        // ignore EXIF errors
      }
      if (latitude == null || longitude == null) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          latitude = loc.coords.latitude;
          longitude = loc.coords.longitude;
        }
      }

      let locality = "—";
      if (latitude != null && longitude != null) {
        locality = await makeLocality(latitude, longitude);
      }

      // ----- prediction (top1 used only for caption text) -----
      const top1 = safePred?.[0];

      // ----- user info -----
      const user = auth.currentUser || null;
      const userID = user?.uid ?? "anonymous";
      const userName = await getDisplayName(
        user?.uid,
        user?.displayName || (user?.email ? user.email.split("@")[0] : null) || "User"
      );

      // ----- firestore: plant_identify -----
      // IMPORTANT CHANGE: always start as "pending"
      const plantData = {
        model_predictions: {
          top_1: {
            plant_species: top1?.class ?? null,
            ai_score: top1?.confidence ?? null,
          },
          top_2: {
            plant_species: safePred?.[1]?.class ?? null,
            ai_score: safePred?.[1]?.confidence ?? null,
          },
          top_3: {
            plant_species: safePred?.[2]?.class ?? null,
            ai_score: safePred?.[2]?.confidence ?? null,
          },
        },
        createdAt: serverTimestamp(),
        ImageURLs: downloadURLs,
        coordinate: { latitude: latitude ?? null, longitude: longitude ?? null },
        user_id: userID,
        identify_status: "pending", // <— no auto-verify
        author_name: userName,
        locality,
      };

      const docId = await addPlantIdentify(plantData);

      // mirror into markers (best-effort)
      try {
        await addDoc(collection(db, "markers"), {
          title: top1?.class || "Plant",
          type: "Plant",
          coordinate: {
            latitude: latitude ?? 1.5495,
            longitude: longitude ?? 110.3632,
          },
          identifiedBy: userName,
          time: serverTimestamp(),
          images: downloadURLs,
          description: "Uploaded from identification",
          plant_identify_id: docId,
          locality,
        });
      } catch {
        // ignore marker write errors
      }

      // build feed post and navigate
      const newPost = {
        id: docId,
        images: downloadURLs,
        caption: top1
          ? `Top: ${top1.class} (${Math.round((top1.confidence || 0) * 100)}%)`
          : "New identification",
        author: userName,
        time: Date.now(),
        locality,
        prediction: safePred.slice(0, 3),
        coordinate: { latitude: latitude ?? null, longitude: longitude ?? null },
      };

      navigation.navigate("HomepageUser", { newPost });
    } catch (error) {
      Alert.alert("Upload failed", error?.message || "Please try again.");
    } finally {
      setUPLoading(false);
    }
  };

  const getPlantImage = async (speciesName) => {
    try {
      const docRef = doc(db, "plant", speciesName);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data().plant_image : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchAllImages = async () => {
      if (!safePred || safePred.length === 0) return;
      const urls = await Promise.all(safePred.map((p) => getPlantImage(p.class)));
      setPlantImages(urls);
    };
    fetchAllImages();
  }, [prediction]); // keep original dep to match your flows

  const handleUploadConfirmation = () => {
    if (!prediction?.length) {
      Alert.alert("No predictions", "There are no predictions to upload.");
      return;
    }

    Alert.alert(
      "Upload Permission Request",
      "Do you give us permission to upload the plant image and info into our database?",
      [
        {
          text: "NO",
          onPress: () => navigation.goBack(),
          style: "cancel",
        },
        { text: "Upload", onPress: () => uploadDataToDatabase() },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {UPloading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00ff3cff" />
          <Text style={{ color: "white", marginTop: 10 }}>Uploading...Please wait</Text>
        </View>
      )}

      <View style={styles.imageBox}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#00ff3cff" />
            <Text style={{ color: "white", marginTop: 10 }}>Generating...</Text>
          </View>
        )}

        <ImageSlideshow imageURIs={images} onSlideChange={(index) => setCurrentSlide(index)} />

        {showHeatmap && heatmapURIs[currentSlide] && (
          <Image
            source={{ uri: heatmapURIs[currentSlide] }}
            style={styles.heatmapOverlay}
            resizeMode="cover"
            pointerEvents="none"
          />
        )}

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            if (heatmapURIs.length > 0) setShowHeatmap((v) => !v);
            else constructHeatmap();
          }}
        >
          <View style={styles.circle} />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>AI Identification Result</Text>

      {safePred && safePred.length > 0 && (safePred[0].confidence ?? 0) >= 0.1 ? (
        <View style={{ width: "100%", alignItems: "center" }}>
          {safePred.map((item, index) => (
            <PlantSuggestionCard
              key={index}
              name={item.class || "Unknown Plant"}
              image={plantImages[index] || null}
              confidence={(item.confidence * 100).toFixed(2)}
              onPress={() => {}}
            />
          ))}
        </View>
      ) : (
        <View style={styles.lowConfidenceContainer}>
          <Text style={styles.lowConfidenceText}>
            The confidence score is too low.{"\n"}
            Our team would wish to send this case to an expert for further verification.
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.doneButton} onPress={handleUploadConfirmation}>
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8E1", alignItems: "center", padding: 30 },
  imageBox: {
    width: 220,
    height: 220,
    backgroundColor: "#D9D9D9",
    borderRadius: 4,
    marginTop: 30,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  iconButton: { position: "absolute", top: 8, right: 8 },
  circle: { width: 20, height: 20, backgroundColor: "gray", borderRadius: 10, zIndex: 10 },
  title: { fontSize: 18, fontWeight: "bold", marginVertical: 1, marginBottom: 20 },
  doneButton: {
    backgroundColor: "#496D4C",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 16,
    marginTop: "auto",
    marginBottom: 30,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1000,
  },
  lowConfidenceContainer: { alignItems: "center", justifyContent: "center", padding: 20 },
  lowConfidenceText: { fontSize: 16, color: "gray", textAlign: "center", fontStyle: "italic" },
  heatmapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 0.6,
    zIndex: 2,
  },
});
