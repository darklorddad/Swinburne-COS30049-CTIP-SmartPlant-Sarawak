import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator, Alert, ScrollView } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import PlantSuggestionCard from '../components/PlantSuggestionCard';
import { addPlantIdentify } from '../firebase/plant_identify/addPlantIdentify.js';
import { uploadImage } from '../firebase/plant_identify/uploadImage.js';
import { db, auth } from "../firebase/FirebaseConfig";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// noti start
import { updateNotificationPayload } from "../firebase/notification_user/updateNotificationPayload";
// noti end

import * as Location from 'expo-location'; //getting current device location
import * as ImagePicker from 'expo-image-picker'; // for picking images with EXIF

export default function ResultScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { prediction, imageURI } = route.params || {};

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
  const [loading, setLoading] = React.useState(false);
  const [showHeatmap, setShowHeatmap] = React.useState(false); // toggle overlay
  const [Uploadloading, setUploadLoading] = React.useState(false);
  // prediction is expected to be an array like:
  // [{ class: "Nepenthes_tentaculata", confidence: 0.7321 }, {...}, {...}]

  console.log("Predictions received:", prediction);

  const constructHeatmap = async () => {
    if (heatmapURI) {
      // toggle overlay
      setShowHeatmap(!showHeatmap);
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

      const response = await fetch("http://172.17.27.224:3000/heatmap", {
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
        body: formData,
      });

      const data = await response.json();
      setLoading(false);

      if (data.heatmap) {
        setHeatmapURI(data.heatmap);
        setShowHeatmap(true);
      } else {
        alert("Heatmap not returned from server.");
      }
    } catch (err) {
      console.log("Upload error:", err);
      setLoading(false);
      alert("Failed to generate heatmap. Check backend connection.");
    }
  };

  //asking user permission to save the data
  const handleUploadConfirmation = () => {

    Alert.alert(
      "Upload Permission Request",
      "Do you give us permission to upload the plant image and info into our database?",
      [
        {
          text: "NO",
          onPress: () => {
            navigation.goBack();
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

  function dmsToDecimal(dms, ref) {
    const [deg, min, sec] = dms.map(parseFloat);
    let dec = deg + min / 60 + sec / 3600;
    if (ref === 'S' || ref === 'W') dec = -dec;
    return dec;
  }

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
      setUploadLoading(true);
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

      let latitude = null;
      let longitude = null;

      // Try to extract location from EXIF (if imageURI is from picker with exif)
      try {
        const exifResult = await ImagePicker.getExifAsync(imageURI);
        if (exifResult && exifResult.GPSLatitude && exifResult.GPSLongitude) {
          latitude = exifResult.GPSLatitude;
          longitude = exifResult.GPSLongitude;
          console.log('Got GPS from EXIF:', latitude, longitude);
        }
      } catch (e) {
        console.log('No EXIF location found, fallback to device location...');
      }

      //Fallback — get current device location   (needa fix later, what if they upload the image at home)
      if (!latitude || !longitude) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          latitude = loc.coords.latitude;
          longitude = loc.coords.longitude;
          console.log('Got GPS from device:', latitude, longitude);
        } else {
          console.log('Location permission denied.');
        }
      }

      //determince identification status?
      let identify_status = "";
      if (prediction[0].confidence > 0.7) {
        identify_status = "verified";
      } else {
        identify_status = "pending";
      }


      //Get user id 
      const user = auth.currentUser;
      const userID = user.uid;
      console.log(userID);

      //Upload image to storage
      //const downloadURL = await uploadImage(imageURI, prediction[0].class);
      //console.log('Added to storage with URL:', downloadURL);

      //Uplaod info to firestore
      const plantData = {
        model_predictions: {
          top_1: {
            plant_species: prediction[0].class,
            ai_score: prediction[0].confidence,
          },
          top_2: {
            plant_species: prediction[1].class,
            ai_score: prediction[1].confidence,
          },
          top_3: {
            plant_species: prediction[2].class,
            ai_score: prediction[2].confidence,
          },
        },
        createdAt: serverTimestamp(),
        ImageURL: downloadURL,
        coordinate: { latitude: latitude, longitude: longitude },
        user_id: userID,
        identify_status: identify_status,

      };

      try {
        const docId = await addPlantIdentify(plantData);
        console.log('Added to Firestore with ID:', docId);
        //noti start
        navigation.setParams({ alreadyUploaded: true });
        //noti end
        navigation.navigate("MapPage")
      } catch (error) {
        console.error('Error adding plant:', error);
      }

    } catch (error) {
      console.log("Image upload failed:", error);
    }
    setUploadLoading(false);
  };

  return (

    <View style={styles.container}>
      {Uploadloading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#00ff3cff" />
            <Text style={{ color: "white", marginTop: 10 }}>Upload...</Text>
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
            if (heatmapURI) {

              setShowHeatmap(!showHeatmap);
            } else {
              // generate heatmap first
              constructHeatmap();
            }
          }}
        >
          <View style={styles.circle} />
        </TouchableOpacity>
      </View>


      {/* Title */}
      <Text style={styles.title}>AI Identification Result</Text>

      {/* Top 3 Results */}
      {prediction && prediction.length > 0 && prediction[0].confidence >= 0.7 ? (
        <FlatList
          data={prediction}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.resultCard}>
              <Text style={styles.resultRank}>#{index + 1}</Text>
              <Text style={styles.resultLabel}>{item.class}</Text>
              <Text style={styles.resultValue}>
                {(item.confidence * 100).toFixed(2)}%
              </Text>
            </View>
          )}
          contentContainerStyle={styles.resultsContainer}
        />
      ) : (

        <View style={styles.lowConfidenceContainer}>
          <Text style={styles.lowConfidenceText}>
            The confidence score is too low.
            Our team would wish to send this case to an expert for further verification.
          </Text>
        </View>
      )
      }
      {/* {prediction && prediction.length > 0 && prediction[0].confidence >= 0.7 ? (
        <View style={{ width: "100%", alignItems: "center" }}>
          {prediction.map((item, index) => (
            <PlantSuggestionCard
              key={index}
              name={item.class || "Unknown Plant"}
              confidence={(item.confidence * 100).toFixed(2)}
              onPress={() => console.log(`See more for ${item.class}`)}
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
      )} */}



      {/* Done Button */}
      <TouchableOpacity style={styles.doneButton} onPress={handleUploadConfirmation}>
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>Done</Text>
      </TouchableOpacity>
    </View>
  );
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
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
  iconButton: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  circle: {
    width: 20,
    height: 20,
    backgroundColor: "gray",
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 12,
  },
  resultsContainer: {
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: "#496D4C",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: "center",
    marginVertical: 6,
  },
  resultRank: {
    color: "white",
    fontWeight: "bold",
    marginBottom: 4,
  },
  resultLabel: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
  },
  resultValue: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
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
  lowConfidenceContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  lowConfidenceText: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    fontStyle: "italic",
  },
  Topsuggestion: {
    paddingBottom: 20,
    alignItems: "center",
  }

});
