// pages/ReportError.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import BottomNav from "../components/Navigation";
import { TOP_PAD } from "../components/StatusBarManager";

import { db, auth } from "../firebase/FirebaseConfig"; // app/storage not needed anymore
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ReportError({ navigation, route }) {
  // NEW: if someone navigates with navigation.navigate("ReportError", { post })
  // we capture that post here. If not provided, this is just undefined.
  const { post } = route?.params || {};

  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter what the error is about.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "error_reports"), {
        title: title.trim(),
        details: details.trim(),
        user_id: auth?.currentUser?.uid || "anon",
        user_email: auth?.currentUser?.email || null,
        platform: Platform.OS,
        status: "open",
        createdAt: serverTimestamp(),

        // 🔹 NEW: extra info so admin knows which post was reported
        // (these are null if ReportError was opened without a post)
        post_id: post?.id || null,
        post_author: post?.author || post?.identifiedBy || null,
        post_locality: post?.locality || null,
        post_coordinate: post?.coordinate || null,
      });

      Alert.alert("Thanks!", "Your report has been submitted.");
      navigation.goBack();
    } catch (e) {
      console.log("Submit error:", e);
      Alert.alert("Submit failed", e?.message || "Please try again.");
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
  submit: {
    alignSelf: "center",
    marginTop: 18,
    backgroundColor: "#6EA564",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 8,
  },
});
