import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { signInWithEmailAndPassword, updatePassword } from "firebase/auth";
import { auth, db } from "../firebase/FirebaseConfig";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";

export default function ForgetPassword({ navigation }) {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handlePasswordReset() {
    if (!email || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      // Step 1: Find the user document in Firestore
      const q = query(collection(db, "user"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Error", "No user found with this email.");
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userRef = doc(db, "user", userDoc.id);

      await updateDoc(userRef, { password: newPassword });

      Alert.alert("Success", "Password updated successfully!");
      navigation.navigate("UserLogin");
    } catch (error) {
      console.error("Password reset error:", error);
      Alert.alert("Error", "Failed to update password. Please try again.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.text}>Enter your registered email and new password</Text>

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        onChangeText={setNewPassword}
        value={newPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        onChangeText={setConfirmPassword}
        value={confirmPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#FFFAE4" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, color: "#344d36ff" },
  text: { fontSize: 16, textAlign: "center", marginBottom: 20, color: "#555" },
  input: { width: "100%", borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 10, backgroundColor: "#fff", marginBottom: 20 },
  button: { backgroundColor: "#578C5B", padding: 15, borderRadius: 10, width: "100%", alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
