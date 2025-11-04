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
import { auth, db } from "../firebase/FirebaseConfig"; // ← db added here
import { serverTimestamp, addDoc, collection, doc, getDoc, query, where, getDocs  } from "firebase/firestore";
import PlantSuggestionCard from "../components/PlantSuggestionCard.js";
// noti start
import { updateNotificationPayload } from "../firebase/notification_user/updateNotificationPayload";
// noti end
import * as Location from "expo-location"; // (KEEP) getting current device location
import * as ImagePicker from "expo-image-picker"; // (KEEP) for picking images with EXIF

export default function ResultScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  // (KEEP) prediction is expected to be an array like:
  // [{ class: "Nepenthes_tentaculata", confidence: 0.7321 }, {...}, {...}]
  const { prediction = [], imageURI } = route.params || {};

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

  const [heatmapURI, setHeatmapURI] = React.useState(null);
  const [loading, setLoading] = React.useState(false); // heatmap loading
  const [showHeatmap, setShowHeatmap] = React.useState(false); // (KEEP) toggle overlay
  const [UPloading, setUPLoading] = React.useState(false); // upload in-flight
  const [plantImages, setPlantImages] = useState([]);
  console.log(prediction)
  // --- Heatmap overlay ---
  const constructHeatmap = async () => {
    if (heatmapURI) {
      // (KEEP) toggle overlay
      setShowHeatmap(!showHeatmap);
      return;
    }

    if (!imageURI) {
      Alert.alert("No image", "Image is missing.");
      return;
    }

    const formData = new FormData();
    formData.append("image", {
      uri: imageURI,
      type: "image/jpeg",
      name: "photo.jpg",
    });

    try {
      setLoading(true);
      const response = await fetch("http://172.17.23.125:3000/heatmap", {
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      setLoading(false);

      if (data?.heatmap) {
        setHeatmapURI(data.heatmap);
        setShowHeatmap(true);
      } else {
        Alert.alert("Heatmap not returned from server.");
      }
    } catch (err) {
      console.log("Upload error:", err);
      setLoading(false);
      Alert.alert("Failed to generate heatmap. Check backend connection.");
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
            navigation.navigate(MyProfile); 
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
  // noti start — block upload when opened from a noti without an image
  const fromNotification = route.params?.fromNotification ?? false;
  const hasImage =
    route.params?.hasImage ??
    Boolean(imageURI && !String(imageURI).startsWith("data:image/png;base64"));

// If opened from a notification, never allow uploading again.
// (If it has an image => already uploaded; if it doesn't => nothing to upload.)
if (fromNotification) {
  Alert.alert(
    hasImage ? "Already uploaded" : "No image to upload",
    hasImage
      ? "This identification has already been uploaded. You can view it on the map."
      : "Open the camera and re-identify to upload a photo."
  );
  return;
}

// Also prevent double-tap or returning to this screen and pressing Done again
const alreadyUploaded = route.params?.alreadyUploaded ?? false;
if (alreadyUploaded) {
  Alert.alert("Already uploaded", "This item was uploaded in this session.");
  return;
}
// noti end

    try {
      // noti start — robust image handling for upload + re-use
    let effectiveURI = imageURI;       // what we got from navigation
    let downloadURL = null;

    // 1) If we already have a hosted URL (came from a noti AFTER upload), don't re-upload
    if (effectiveURI && effectiveURI.startsWith("http")) {
      downloadURL = effectiveURI;
    } else {
      // 2) If we have no image or it's the tiny data: placeholder, ask user to pick one
      if (!effectiveURI || effectiveURI.startsWith("data:")) {
        const res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
        });
        if (res.canceled) {
          setUploadLoading(false);
          Alert.alert("No image selected", "Please choose an image to upload.");
          return;
        }
        effectiveURI = res.assets[0].uri;    // this is a real file:// or content:// URI
      }

      // 3) Upload the real image
      try {
        downloadURL = await uploadImage(
          effectiveURI,
          (prediction?.[0]?.class) || "Unknown"
        );
        console.log("Added to storage with URL:", downloadURL);
      } catch (e) {
        console.log("Error uploading image:", e);
        setUploadLoading(false);
        Alert.alert("Upload failed", "Please try again.");
        return;
      }
    }
    // noti end
// ===== noti start =====
try {
  const { notiId } = route.params || {};
  console.log("notiId for payload update:", notiId);

  if (notiId && downloadURL) {
    await updateNotificationPayload(notiId, {
      imageURL: downloadURL,
      top_1: { plant_species: (prediction?.[0]?.class) || "Unknown", ai_score: prediction?.[0]?.confidence || 0 },
      top_2: { plant_species: (prediction?.[1]?.class) || "",        ai_score: prediction?.[1]?.confidence || 0 },
      top_3: { plant_species: (prediction?.[2]?.class) || "",        ai_score: prediction?.[2]?.confidence || 0 },
    });
    console.log("✅ Notification payload updated with imageURL/top3");
    // Refresh this screen so the image shows immediately
    navigation.setParams({ imageURI: downloadURL, hasImage: true });
  } else {
    console.log("⚠️ Missing notiId or downloadURL; skip payload update.");
  }
} catch (e) {
  console.log("⚠️ Failed to update notification payload:", e);
}
// ===== noti end =====

      setUPLoading(true);
      let latitude = null;
      let longitude = null;

      try {
        const exifResult = await ImagePicker.getExifAsync(imageURI);
        if (exifResult?.GPSLatitude != null && exifResult?.GPSLongitude != null) {
          latitude = exifResult.GPSLatitude;
          longitude = exifResult.GPSLongitude;
          console.log("Got GPS from EXIF:", latitude, longitude);
        }
      } catch (e) {
        console.log("No EXIF location found, fallback to device location...");
      }

      // (KEEP) Fallback — get current device location (consider: image could be uploaded later at home)
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

      // Build locality string
      let locality = "—";
      if (latitude != null && longitude != null) {
        locality = await makeLocality(latitude, longitude);
      }

      // -------- 2) Determine identification status --------
      const top1 = prediction?.[0];
      const top2 = prediction?.[1];
      const top3 = prediction?.[2];
      const identify_status =
        (top1?.confidence ?? 0) > 0.7 ? "verified" : "pending";

      // -------- 3) Current user id + unified user name --------
      const user = auth.currentUser || null;
      const userID = user?.uid ?? "anonymous";
      const userName =
        user?.displayName ||
        (user?.email ? user.email.split("@")[0] : null) ||
        "User";
      console.log("userID:", userID, "userName:", userName);

      // -------- 4) Upload image to storage --------
      if (!imageURI) throw new Error("Missing imageURI");
      downloadURL = await uploadImage(imageURI, top1?.class || "unknown");
      console.log("Added to storage with URL:", downloadURL);

      // -------- 5) Upload info to Firestore (plant_identify) --------
      const plantData = {
        model_predictions: {
          top_1: {
            plant_species: top1?.class ?? null,
            ai_score: top1?.confidence ?? null,
          },
        // (KEEP) keep extra predictions in case your teammate re-enables more UI:
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
        ImageURL: downloadURL,
        coordinate: { latitude: latitude ?? null, longitude: longitude ?? null },
        user_id: userID,
        identify_status,
        author_name: userName, // <<— single source of truth for display name
        locality,              // <<— save readable locality for UI
      };

      const docId = await addPlantIdentify(plantData);
      console.log("Added to Firestore with ID:", docId);

      // -------- 6) Mirror to markers so MapPage shows a pin automatically --------
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
          image: downloadURL,
          description: "Uploaded from identification",
          plant_identify_id: docId, // backlink if you need it later
          locality,
        });
      } catch (e) {
        console.log("Failed to mirror marker:", e);
      }
      //noti start
        navigation.setParams({ alreadyUploaded: true });
      //noti end

      // -------- 7) Build a feed post and navigate to HomepageUser --------
      const newPost = {
        id: docId,
        image: downloadURL,
        caption: top1
          ? `Top: ${top1.class} (${Math.round((top1.confidence || 0) * 100)}%)`
          : "New identification",
        author: userName, // same name everywhere
        time: Date.now(),
        locality,         // use nice string in feed
        prediction: prediction.slice(0, 3),
        coordinate: { latitude: latitude ?? null, longitude: longitude ?? null },
      };

      navigation.navigate("HomepageUser", { newPost });
    } catch (error) {
      console.log("Image upload failed:", error);
      Alert.alert("Upload failed", error?.message || "Please try again.");
    } finally {
      setUploadLoading(false);
    }
    setUPLoading(false);
  };

  // retrieve the image url for display purpose
  const getPlantImage = async (speciesName) => {
    const docRef = doc(db, "plant", speciesName);
    const docSnap = await getDoc(docRef);
    const imageUrl = docSnap.exists() ? docSnap.data().plant_image : null;
    console.log(imageUrl)
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

        <Image
          source={{ uri: showHeatmap && heatmapURI ? heatmapURI : imageURI }}
          style={styles.image}
        />

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            if (heatmapURI) setShowHeatmap(!showHeatmap);
            else constructHeatmap();
          }}
        >
          <View style={styles.circle} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.title}>AI Identification Result</Text>

      {/* Top 3 Results */}
      {prediction && prediction.length > 0 && prediction[0].confidence >= 0.5 ? (
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
    padding: 20,
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
  circle: { width: 20, height: 20, backgroundColor: "gray", borderRadius: 10 },
  title: { fontSize: 18, fontWeight: "bold", marginVertical: 12 },
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
});
