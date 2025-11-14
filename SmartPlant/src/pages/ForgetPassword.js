import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import { auth, db } from "../firebase/FirebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgetPassword({ navigation }) {
  const [email, setEmail] = useState("");

  async function handlePasswordReset() {
    if (!email) {
      Alert.alert("Error", "Please enter your registered email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Password Reset Email Sent",
        "A password reset link has been sent to your email. Please check your inbox or spam folder."
      );
      navigation.navigate("UserLogin");
    } catch (error) {
      console.error("Password reset error:", error);
      Alert.alert("Error", "Failed to send password reset email. Please try again.");
    }
  }

  function toSelection(){
    navigation.navigate("LoginSelection");
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toSelection}>
        <Image style={styles.backlogo} source={require('../../assets/backlogo.png')}></Image>
      </TouchableOpacity>    
          
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.text}>Enter your registered email address. A password reset link will be sent to you.</Text>

      <TextInput style={styles.input} placeholder="Email Address" onChangeText={setEmail} value={email} keyboardType="email-address" autoCapitalize="none"/>

      <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
        <Text style={styles.buttonText}>Send Reset Link</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFAE4"
  },

  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 10, 
    color: "#344d36ff" 
  },

  text: { 
    fontSize: 16, 
    textAlign: "center", 
    marginBottom: 20, 
    color: "#555" 
  },

  input: { 
    width: "100%", 
    borderWidth: 1, 
    borderColor: "#ccc", 
    borderRadius: 10, 
    padding: 10, 
    backgroundColor: "#fff", 
    marginBottom: 20 
  },

  button: { 
    backgroundColor: "#578C5B", 
    padding: 15, 
    borderRadius: 10, 
    width: "100%", 
    alignItems: "center" 
  },

  buttonText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 16 
  },

  backlogo: {
    width: 40,
    height: 40,
    bottom: 270,
    right: 165,
  },
});
