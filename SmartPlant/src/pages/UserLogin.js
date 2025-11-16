import React, { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Recaptcha from 'react-native-recaptcha-that-works';
import { loginWithEmail, saveBiometric, saveCredentials } from '../firebase/login_register/user_login';
import * as LocalAuthentication from 'expo-local-authentication';

export default function UserLogin({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ReCAPTCHA
  const recaptchaRef = useRef();
  const [showCaptcha, setShowCaptcha] = useState(false);

  const SITE_KEY = "6LeViOkrAAAAAHFmBLtVJO5pc3VaeC6OINL3ThsB";
  const BASE_URL = "https://smartplantsarawak.com";

  // ---------------- LOGIN ----------------
  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    const result = await loginWithEmail(email, password);
    if (!result.success) {
      Alert.alert("Error", result.error);
      return;
    }

    // Store temporary login data
    global.tempUserResult = result;

    // Show reCAPTCHA
    setShowCaptcha(true);
    setTimeout(() => recaptchaRef.current.open(), 300);
  } 

  // ---------------- CAPTCHA SUCCESS ----------------
  async function onCaptchaSuccess(token) {
    setShowCaptcha(false);

    if (!token) {
      Alert.alert("Error", "reCAPTCHA failed. Please try again.");
      return;
    }

    // Run biometric after captcha
    await handleBiometricVerification();
  }


  async function handleBiometricVerification() {
    try {
      // Check biometric capability
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (!hasHardware || !isEnrolled || supportedTypes.length === 0) {
        Alert.alert("Biometrics not available", "Your device doesn't support biometric authentication.");
        return;
      }

      // Prompt biometric scan
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: "Verify your identity",
        fallbackLabel: "Use Passcode",
        disableDeviceFallback: false,
      });

      if (!authResult.success) {
        Alert.alert("Authentication failed", "Could not verify your identity.");
        return;
      }

      // If biometric passed → save credentials
      await saveBiometric(email);
      await saveCredentials(email, password);

      const loginData = global.tempUserResult;

      if (!loginData) {
        Alert.alert("Error", "Login session expired.");
        return;
      }

      const { role, userId } = loginData;

      // Navigate according to role
      if (role === "admin" || (userId && userId.startsWith("A"))) {
        Alert.alert("Welcome", "Login successful!");
        navigation.navigate("AdminDashboard");
      } 
      else if (role === "expert" || (userId && userId.startsWith("E"))) {
        Alert.alert("Welcome", "Login successful!");
        navigation.navigate("HomepageExpert", { userEmail: email });
      } 
      else if (role === "user" || (userId && userId.startsWith("U"))) {
        Alert.alert("Welcome", "Login successful!");
        navigation.navigate("HomepageUser", { userEmail: email });
      } 
      else {
        Alert.alert("Error", "Unrecognized account type.");
      }

    } catch (e) {
      console.log("Biometric Error:", e);
      Alert.alert("Error", "Biometric authentication failed.");
    }
  }

  // ---------------- NAVIGATION ----------------
  function toSelection() {
    navigation.navigate("LoginSelection");
  }

  function toUserRegister() {
    navigation.navigate("UserRegister");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* reCAPTCHA */}
      {showCaptcha && (
        <Recaptcha
          ref={recaptchaRef}
          siteKey={SITE_KEY}
          baseUrl={BASE_URL}
          onVerify={onCaptchaSuccess}
          size="normal"
          theme="light"
        />
      )}

      {/* MAIN UI */}
      <TouchableOpacity onPress={toSelection}>
        <Image style={styles.backlogo} source={require('../../assets/backlogo.png')} />
      </TouchableOpacity>

      <Image style={styles.logo_login1} source={require('../../assets/applogo.png')} />

      <View style={styles.login_container1}>
        <View style={styles.login_container_text}>
          <Text style={styles.login_title}>Welcome Back</Text>
        </View>

        <View>
          <Text style={styles.input_label}>Email</Text>
          <TextInput
            style={styles.input_textinput}
            placeholder="john@example.com"
            onChangeText={setEmail}
          />
        </View>

        <View>
          <Text style={styles.input_label}>Password</Text>
          <TextInput
            style={styles.input_textinput}
            placeholder="********"
            secureTextEntry
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.link1} onPress={() => navigation.navigate("ForgetPassword")}>Forget Password</Text>
        </View>

        <View style={styles.button_login_container}>
          <TouchableOpacity style={styles.button_login} onPress={handleLogin}>
            <Text style={styles.button_text}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.text2}>
        Don't have an account? <Text style={styles.link2} onPress={toUserRegister}>Sign Up</Text>
      </Text>
    </ScrollView>
  );
}

// ===== Keep OLD CSS =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAE4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  backlogo: {
    width: 40,
    height: 40,
    bottom: 140,
    right: 165,
  },

  logo_login1:{
    width: 100,
    height: 100,
    borderRadius: 50,
    bottom: 50,
    backgroundColor: "rgba(255, 255, 255, 0.49)", 
    shadowColor: "#366728ff",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",  
  },

  login_container1: {
    backgroundColor: '#578C5B',
    padding: 20,
    borderRadius: 20,
    width: '100%',
    shadowColor: '#143d17ff',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },

  login_container_text: {
    alignItems: 'center',
  },

  login_title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },

  input_label: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },

  input_textinput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    width: '100%',
    marginBottom: 15,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 5,
    marginTop: 5,
    marginLeft: 221,
  },

  link1: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    textDecorationLine: 'underline',
  },

  link2: {
    color: '#344d36ff',
    fontWeight: 'bold',
    fontSize: 15,
  },

  text2: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 15,
  },

  button_login_container: {
    alignItems: 'center',
  },

  button_login: {
    backgroundColor: '#496D4C',
    padding: 10,
    borderRadius: 10,
    width: '60%',
    marginVertical: 10,
  },

  button_text: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 17,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    width: "85%",
    borderRadius: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },

  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },

  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },

  countryCode: {
    fontSize: 16,
    marginRight: 10,
  },

  phoneInput: {
    flex: 1,
    fontSize: 16,
    padding: 10,
  },

  sendOTPButton: {
    backgroundColor: "#578C5B",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  verifyButton: {
    backgroundColor: "#496D4C",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },

  otpInput: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 10,
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
  },

  cancelButton: {
    padding: 10,
    alignItems: "center",
  },

  cancelText: {
    color: "red",
    fontSize: 14,
    fontWeight: "bold",
  },

  captcha: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    backgroundColor: "rgba(0,0,0,0.5)", 
    padding: 20,
  },
});
