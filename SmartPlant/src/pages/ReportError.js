// pages/ReportError.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import BottomNav from "../components/Navigation";
import { TOP_PAD } from "../components/StatusBarManager";

import { db, app, auth } from "../firebase/FirebaseConfig"; // leave your config unchanged
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

// ✅ Use your bucket explicitly (does not modify your config file)
const storage = getStorage(app, "gs://smartplantsarawak.appspot.com");

// --- Helpers -----------------------------------------------------

// best-effort detection for extension + mime from a picker asset/uri
const guessFileInfo = (assetOrUri) => {
  let uri = typeof assetOrUri === "string" ? assetOrUri : assetOrUri?.uri;
  let fileName = assetOrUri?.fileName || uri?.split("/").pop() || "image";
  let ext = (fileName.split(".").pop() || "").toLowerCase();

  // fallbacks for iOS HEIC/HEIF and unknowns
  if (!ext || ext.length > 5) ext = "jpg";
  let mime =
    assetOrUri?.mimeType ||
    (ext === "heic" || ext === "heif"
      ? "image/heic"
      : ext === "png"
      ? "image/png"
      : "image/jpeg");

  // Some Android URIs end without extension, keep jpg
  if (!["jpg", "jpeg", "png", "heic", "heif", "webp"].includes(ext)) {
    ext = "jpg";
    if (!mime) mime = "image/jpeg";
  }

  // Normalize jpeg extension
  if (ext === "jpeg") ext = "jpg";

  return { ext, mime };
};

const toBlob = async (uri) => {
  const resp = await fetch(uri);
  return await resp.blob();
};

// ---------------------------------------------------------------

export default function ReportError({ navigation }) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [localImage, setLocalImage] = useState(null); // file:// preview
  const [assetMeta, setAssetMeta] = useState(null); // keep asset for mime/ext guessing
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Please allow photo library access.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      // base64 not required; blob upload is used
    });

    if (res.canceled) return;

    const asset = res.assets?.[0];
    if (!asset?.uri) {
      Alert.alert("Pick failed", "No image URI returned.");
      return;
    }
    setLocalImage(asset.uri);
    setAssetMeta(asset);
  };

  const uploadImageAsync = async (uri, asset) => {
    const { ext, mime } = guessFileInfo(asset || uri);
    const blob = await toBlob(uri);

    const uid = auth?.currentUser?.uid || "anon";
    const ts = Date.now();
    const path = `error_reports/${uid}/${ts}.${ext}`;
    const sref = ref(storage, path);

    // Use a resumable upload to surface server-side errors clearly
    const task = uploadBytesResumable(sref, blob, { contentType: mime });

    await new Promise((resolve, reject) => {
      task.on(
        "state_changed",
        // progress callback (optional; no-op)
        () => {},
        (err) => reject(err),
        () => resolve()
      );
    });

    const url = await getDownloadURL(sref);
    return url;
  };

  const submit = async () => {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter what the error is about.");
      return;
    }

    setSubmitting(true);
    try {
      let imageURL = null;
      if (localImage) {
        imageURL = await uploadImageAsync(localImage, assetMeta);
      }

      await addDoc(collection(db, "error_reports"), {
        title: title.trim(),
        details: details.trim(),
        image_url: imageURL, // public download URL
        user_id: auth?.currentUser?.uid || "anon",
        user_email: auth?.currentUser?.email || null,
        platform: Platform.OS,
        status: "open",
        createdAt: serverTimestamp(),
      });

      Alert.alert("Thanks!", "Your report has been submitted.");
      navigation.goBack();
    } catch (e) {
      console.log("Submit/Upload error:", e);
      // Give clearer messages for common Storage errors
      const msg =
        e?.code === "storage/unauthorized"
          ? "You don't have permission to upload to Storage. Check your Firebase Storage rules."
          : e?.code === "storage/quota-exceeded"
          ? "Storage quota exceeded on the project."
          : e?.message || "Upload failed. Please try again.";
      Alert.alert("Upload failed", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Report</Text>

        <Text style={styles.label}>What is the error about?</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} />

        <Text style={[styles.label, { marginTop: 10 }]}>
          Please describe the error in detail. Please provide reasons if possible.
        </Text>
        <TextInput
          style={[styles.input, { height: 110 }]}
          value={details}
          onChangeText={setDetails}
          multiline
        />

        <Text style={styles.help}>
          You can upload a screenshot or photo from a source here. (Optional)
        </Text>

        {localImage ? (
          <Image source={{ uri: localImage }} style={styles.preview} />
        ) : null}

        <TouchableOpacity style={styles.smallBtn} onPress={pickImage}>
          <Text>{localImage ? "Change Image" : "Upload Image"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submit, submitting && { opacity: 0.6 }]}
          onPress={submit}
          disabled={submitting}
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>
            {submitting ? "Submitting..." : "Submit"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#FFF8EE" },
  container: { padding: 16, paddingTop: TOP_PAD, paddingBottom: 110 },
  header: { fontSize: 18, fontWeight: "800", marginBottom: 8 },
  label: { fontWeight: "600", marginTop: 6 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cfcfcf",
    padding: 10,
    marginTop: 4,
  },
  help: { fontSize: 12, color: "#444", marginTop: 8 },
  smallBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#eee",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 6,
  },
  submit: {
    alignSelf: "center",
    marginTop: 18,
    backgroundColor: "#6EA564",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 8,
  },
  preview: { width: "100%", height: 220, borderRadius: 10, marginTop: 10 },
});
