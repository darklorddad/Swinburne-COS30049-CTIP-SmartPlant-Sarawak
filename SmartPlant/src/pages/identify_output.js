// pages/identify_output.js
import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert
} from "react-native";
import { addPlantIdentify } from "../firebase/plant_identify/addPlantIdentify.js";
import { uploadImage } from "../firebase/plant_identify/uploadImage.js";
import { auth, db } from "../firebase/FirebaseConfig";
import { serverTimestamp, addDoc, collection, doc, getDoc, query, where, getDocs } from "firebase/firestore";
import PlantSuggestionCard from "../components/PlantSuggestionCard.js";
import ImageSlideshow from '../components/ImageSlideShow.js';
import { useRoute, useNavigation } from '@react-navigation/native';
// noti start
import { updateNotificationPayload } from "../firebase/notification_user/updateNotificationPayload";
// noti end
import * as Location from "expo-location"; // (KEEP) getting current device location
import * as ImagePicker from "expo-image-picker"; // (KEEP) for picking images with EXIF
import IdentifyPage from './identify.js';

export default function ResultScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  // (KEEP) prediction is expected to be an array like:
  // [{ class: "Nepenthes_tentaculata", confidence: 0.7321 }, {...}, {...}]
  const { prediction = [], imageURI } = route.params || {};
  //console.log("Images array:", imageURI);
  // noti start — normalize prediction to at least 3 items, detect noti + image state
  let p = Array.isArray(prediction) ? [...prediction] : [{ class: "Unknown", confidence: 0 }];
  while (p.length < 3) p.push({ class: p[0].class, confidence: p[0].confidence ?? 0 });

  const fromNotification = route.params?.fromNotification ?? false;
  const hasImage =
    route.params?.hasImage ??
    Boolean(imageURI && !String(imageURI).startsWith("data:image/png;base64"));

  if (fromNotification && !hasImage) {
    console.log("Opened from notification without a real image URL; image box will show placeholder/blank.");
  }
  // noti end
  const [heatmapURIs, setHeatmapURIs] = React.useState([]);

  const [loading, setLoading] = React.useState(false); // heatmap loading
  const [showHeatmap, setShowHeatmap] = React.useState(false); // (KEEP) toggle overlay
  const [UPloading, setUPLoading] = React.useState(false); // upload in-flight
  const [plantImages, setPlantImages] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const constructHeatmap = async () => {
    console.log("constructHeatmap called");
    console.log("imageURI:", imageURI);

    // If heatmaps already exist, toggle visibility
    if (heatmapURIs.length > 0) {
      console.log("Heatmaps already exist:", heatmapURIs);
      setShowHeatmap(!showHeatmap);
      console.log("Toggled heatmap visibility:", !showHeatmap);
      return;
    }
    console.log("passed block 1")
    if (!imageURI || imageURI.length === 0) {
      Alert.alert("No image", "Image is missing.");
      return;
    }
    console.log("passed block 2")
    const formData = new FormData();
    imageURI.forEach((uri, index) => {
      formData.append("images", {
        uri,
        type: "image/jpeg",
        name: `photo_${index + 1}.jpg`,
      });
    });
    console.log("before try")
    try {
      setLoading(true);
      const response = await fetch("http://172.16.58.27:3000/heatmap", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      setLoading(false);

      // Expecting backend to return: { heatmaps: ["url1", "url2", "url3"] }
      if (data?.heatmaps && Array.isArray(data.heatmaps)) {
        setHeatmapURIs(data.heatmaps);
        setShowHeatmap(true);
      } else {
        Alert.alert("Heatmaps not returned from server.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setLoading(false);
      Alert.alert("Failed to generate heatmaps. Check backend connection.");
    }
  };



  // (KEEP) asking user permission to save the data
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
          onPress: () => {
            navigation.navigate(IdentifyPage);
            console.log("User refuse to upload");
          },
          style: "cancel",
        },

        {
          text: "Upload",
          onPress: () => uploadDataToDatabase(),
        },
      ]
    );
  };

  // (KEEP) helper if EXIF returns DMS arrays in the future
  function dmsToDecimal(dms, ref) {
    const [deg, min, sec] = dms.map(parseFloat);
    let dec = deg + min / 60 + sec / 3600;
    if (ref === "S" || ref === "W") dec = -dec;
    return dec;
  }

  // reverse-geocode helper -> "City, Region" or "lat,lng"
  const makeLocality = async (lat, lng) => {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
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
    const fromNotification = route.params?.fromNotification ?? false;
    const hasImage =
      route.params?.hasImage ??
      Boolean(imageURI && !String(imageURI).startsWith("data:image/png;base64"));

    if (fromNotification) {
      Alert.alert(
        hasImage ? "Already uploaded" : "No image to upload",
        hasImage
          ? "This identification has already been uploaded. You can view it on the map."
          : "Open the camera and re-identify to upload a photo."
      );
      return;
    }

    const alreadyUploaded = route.params?.alreadyUploaded ?? false;
    if (alreadyUploaded) {
      Alert.alert("Already uploaded", "This item was uploaded in this session.");
      return;
    }

    try {
      // ========= 🖼️ MULTI-IMAGE HANDLING =========
      if (!Array.isArray(imageURI) || imageURI.length === 0) {
        Alert.alert("No images found", "Please select at least one image to upload.");
        return;
      }

      let downloadURLs = [];

      for (let i = 0; i < imageURI.length; i++) {
        let effectiveURI = imageURI[i];
        let downloadURL = null;

        if (typeof effectiveURI === "string" && effectiveURI.startsWith("http")) {
          // Already hosted (from notification)
          downloadURL = effectiveURI;
        } else {
          // Ask user to pick one if placeholder or empty
          if (
            !effectiveURI ||
            (typeof effectiveURI === "string" && effectiveURI.startsWith("data:"))
          ) {
            const res = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 1,
            });
            if (res.canceled) {
              setUploadLoading(false);
              Alert.alert("No image selected", "Please choose an image to upload.");
              return;
            }
            effectiveURI = res.assets[0].uri;
          }

          // Upload real image
          try {
            const uploadedURL = await uploadImage(
              effectiveURI,
              (prediction?.[i]?.class) || "Unknown"
            );
            console.log(`✅ Image ${i + 1} uploaded with URL:`, uploadedURL);
            downloadURL = uploadedURL;
          } catch (e) {
            console.log(`❌ Error uploading image ${i + 1}:`, e);
            Alert.alert("Upload failed", `Image ${i + 1} failed. Please try again.`);
            continue;
          }
        }

        downloadURLs.push(downloadURL);
      }

      // ========= 🔔 Notification payload update =========
      try {
        const { notiId } = route.params || {};
        console.log("notiId for payload update:", notiId);

        if (notiId && downloadURLs.length > 0) {
          await updateNotificationPayload(notiId, {
            imageURLs: downloadURLs, // updated to plural for multiple images
            top_1: {
              plant_species: prediction?.[0]?.class || "Unknown",
              ai_score: prediction?.[0]?.confidence || 0,
            },
            top_2: {
              plant_species: prediction?.[1]?.class || "",
              ai_score: prediction?.[1]?.confidence || 0,
            },
            top_3: {
              plant_species: prediction?.[2]?.class || "",
              ai_score: prediction?.[2]?.confidence || 0,
            },
          });
          console.log("✅ Notification payload updated with imageURLs/top3");
          navigation.setParams({ imageURI: downloadURLs, hasImage: true });
        } else {
          console.log("⚠️ Missing notiId or downloadURLs; skip payload update.");
        }
      } catch (e) {
        console.log("⚠️ Failed to update notification payload:", e);
      }

      setUPLoading(true);

      // ========= 📍 EXIF LOCATION HANDLING =========
      let latitude = null;
      let longitude = null;

      try {
        const exifResult = await ImagePicker.getExifAsync(imageURI[0]); // get EXIF from first image
        if (exifResult?.GPSLatitude && exifResult?.GPSLongitude) {
          latitude = exifResult.GPSLatitude;
          longitude = exifResult.GPSLongitude;
          console.log("Got GPS from EXIF:", latitude, longitude);
        }
      } catch (e) {
        console.log("No EXIF location found, fallback to device location...");
      }

      if (latitude == null || longitude == null) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          latitude = loc.coords.latitude;
          longitude = loc.coords.longitude;
          console.log("Got GPS from device:", latitude, longitude);
        } else {
          console.log("Location permission denied.");
        }
      }

      // ========= 🏡 Locality =========
      let locality = "—";
      if (latitude != null && longitude != null) {
        locality = await makeLocality(latitude, longitude);
      }

      // ========= 🧠 Prediction Info =========
      const top1 = prediction?.[0];
      const top2 = prediction?.[1];
      const top3 = prediction?.[2];
      const identify_status =
        (top1?.confidence ?? 0) > 0.7 ? "verified" : "pending";

      // ========= 👤 User Info =========
      const user = auth.currentUser || null;
      const userID = user?.uid ?? "anonymous";
      const userName =
        user?.displayName ||
        (user?.email ? user.email.split("@")[0] : null) ||
        "User";
      console.log("userID:", userID, "userName:", userName);

      // ========= 🌿 Firestore Upload =========
      const plantData = {
        model_predictions: {
          top_1: {
            plant_species: top1?.class ?? null,
            ai_score: top1?.confidence ?? null,
          },
          top_2: {
            plant_species: top2?.class ?? null,
            ai_score: top2?.confidence ?? null,
          },
          top_3: {
            plant_species: top3?.class ?? null,
            ai_score: top3?.confidence ?? null,
          },
        },
        createdAt: serverTimestamp(),
        ImageURLs: downloadURLs, // plural: multiple URLs
        coordinate: { latitude: latitude ?? null, longitude: longitude ?? null },
        user_id: userID,
        identify_status,
        author_name: userName,
        locality,
      };

      const docId = await addPlantIdentify(plantData);
      console.log("Added to Firestore with ID:", docId);

      // ========= 🗺️ Mirror to markers =========
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
      } catch (e) {
        console.log("Failed to mirror marker:", e);
      }

      navigation.setParams({ alreadyUploaded: true });

      // ========= 📰 Build Feed Post =========
      const newPost = {
        id: docId,
        images: downloadURLs,
        caption: top1
          ? `Top: ${top1.class} (${Math.round((top1.confidence || 0) * 100)}%)`
          : "New identification",
        author: userName,
        time: Date.now(),
        locality,
        prediction: prediction.slice(0, 3),
        coordinate: { latitude: latitude ?? null, longitude: longitude ?? null },
      };

      navigation.navigate("HomepageUser", { newPost });
    } catch (error) {
      console.log("Image upload failed:", error);
      Alert.alert("Upload failed", error?.message || "Please try again.");
    } finally {
      setUploadLoading(false);
      setUPLoading(false);
    }
  };



  //retrieve the image url for display purpose
  const getPlantImage = async (speciesName) => {
    const docRef = doc(db, "plant", speciesName);
    const docSnap = await getDoc(docRef);
    const imageUrl = docSnap.exists() ? docSnap.data().plant_image : null;
    //console.log(imageUrl)
    return imageUrl;
  };

  useEffect(() => {
    const fetchAllImages = async () => {
      if (!prediction || prediction.length === 0) return;

      const urls = await Promise.all(
        prediction.map((p) => getPlantImage(p.class))
      );
      setPlantImages(urls);
    };

    fetchAllImages();
  }, [prediction]);


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

        <ImageSlideshow
          imageURIs={Array.isArray(imageURI) ? imageURI : [imageURI]}
          onSlideChange={(index) => setCurrentSlide(index)}
        />

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
            console.log("Heatmap button pressed");
            if (Array.isArray(heatmapURIs) && heatmapURIs.length > 0)
              setShowHeatmap(!showHeatmap);
            else
              constructHeatmap();
          }}
        >
          <View style={styles.circle} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.title}>AI Identification Result</Text>

      {/* Top 3 Results */}
      {prediction && prediction.length > 0 && prediction[0].confidence >= 0.1 ? (
        <View style={{ width: "100%", alignItems: "center" }}>
          {prediction.map((item, index) => (
            <PlantSuggestionCard
              key={index}
              name={item.class || "Unknown Plant"}
              image={plantImages[index] || null}
              confidence={(item.confidence * 100).toFixed(2)}
              onPress={() => console.log(`See more for ${item.class}`)}
            />
          ))
          }
        </View>
      ) : (
        <View style={styles.lowConfidenceContainer}>
          <Text style={styles.lowConfidenceText}>
            The confidence score is too low.{"\n"}
            Our team would wish to send this case to an expert for further verification.
          </Text>
        </View>
      )}

      {/* Done Button */}
      <TouchableOpacity style={styles.doneButton} onPress={handleUploadConfirmation}>
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

// (KEEP) helper to safely read top-1 confidence
function top1Confidence(prediction) {
  if (!prediction?.length) return 0;
  return prediction[0]?.confidence ?? 0;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E1",
    alignItems: "center",
    padding: 30,
  },
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
  },
  image: { width: "100%", height: "100%", borderRadius: 4 },
  iconButton: { position: "absolute", top: 8, right: 8 },
  circle: { width: 20, height: 20, backgroundColor: "gray", borderRadius: 10, zIndex: 10, },
  title: { fontSize: 18, fontWeight: "bold", marginVertical: 1, marginBottom: 20, },
  resultsContainer: { width: "100%", paddingHorizontal: 10, marginBottom: 20 },
  resultCard: {
    backgroundColor: "#496D4C",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: "center",
    marginVertical: 6,
  },
  resultRank: { color: "white", fontWeight: "bold", marginBottom: 4 },
  resultLabel: { color: "white", fontWeight: "bold", fontSize: 14, marginBottom: 4 },
  resultValue: { color: "white", fontWeight: "bold", fontSize: 16 },
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
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: "center", alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000,
  },
  lowConfidenceContainer: { alignItems: "center", justifyContent: "center", padding: 20 },
  lowConfidenceText: { fontSize: 16, color: "gray", textAlign: "center", fontStyle: "italic" },
  Topsuggestion: { paddingBottom: 20, alignItems: "center" },
  heatmapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 0.6, // tweak transparency as you like
    zIndex: 2,
  },
});
