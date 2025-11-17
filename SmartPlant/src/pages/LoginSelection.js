import React from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/FirebaseConfig";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

const db = getFirestore();


export default function LoginSelection({navigation}) {
  const [biometricEnabled, setBiometricEnabled] = React.useState(false);
  const [checking, setChecking] = React.useState(true);
  const [authLoading, setAuthLoading] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const flag = await AsyncStorage.getItem("biometricEnabled");
        setBiometricEnabled(flag === "true");
      } catch (e) {
        console.log("AsyncStorage read error:", e);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  async function handleQuickLogin() {
    setAuthLoading(true);
    try {
      const savedEmail = await AsyncStorage.getItem("savedEmail");
      const savedPassword = await AsyncStorage.getItem("savedPassword");

      if (!savedEmail || !savedPassword) {
        Alert.alert("No saved user", "Please login manually once to enable quick login.");
        setAuthLoading(false);
        return;
      }

      // Check biometric availability
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (!hasHardware || !isEnrolled || supportedTypes.length === 0) {
        Alert.alert("Biometrics not available", "Your device doesn't support biometric authentication or it isn't set up.");
        setAuthLoading(false);
        return;
      }

      // Authenticate biometrically
      const promptResult = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to Quick Login",
        fallbackLabel: "Use Passcode",
        disableDeviceFallback: false,
      });

      if (!promptResult.success) {
        Alert.alert("Authentication failed", "Could not authenticate using biometrics.");
        setAuthLoading(false);
        return;
      }

      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, savedEmail, savedPassword);
      const user = userCredential.user;

      // Fetch Firestore user role
      const userEmail = user.email.trim().toLowerCase();
      const q = query(collection(db, "user"), where("email", "==", userEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("User not found in database", "No matching Firestore record found.");
        setAuthLoading(false);
        return;
      }

      const userData = querySnapshot.docs[0].data();

      if (userData.is_active === false) {
        Alert.alert("Account Deactivated", "Your account has been deactivated. Please contact support.");
        setAuthLoading(false);
        return;
      }

      const role = userData.role?.toLowerCase();
      const userId = userData.user_id;

      // Navigate based on role
      if (role === "admin") {
        navigation.navigate("back");
      } else if (role === "expert") {
        navigation.navigate("HomepageExpert", { userEmail: user.email });
      } else {
        navigation.navigate("HomepageUser", { userEmail: user.email });
      }

      Alert.alert("Welcome back!", 'Login successful');
    } catch (e) {
      console.log("Quick login error:", e);
      Alert.alert("Error", "An error occurred during biometric authentication.");
    } finally {
      setAuthLoading(false);
    }
  }

  if (checking) {
    return (
      <View style={[styles.container, { justifyContent: 'center'}]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  function toLogin(){
    navigation.navigate("UserLogin");
  }

  function toRegister(){
    navigation.navigate("UserRegister");
  }

  return(
    <View style={styles.container}>
      <Image style={styles.logo} source={require('../../assets/applogo.png')} alt="Logo"></Image>
      <Text style={styles.logo_caption}>SmartPlant Sarawak</Text>
      <Text style={styles.logo_caption}>A Community-Driven Mobile App</Text>

      <View style={styles.button_container}>
        <TouchableOpacity style={styles.button_selection} onPress={toLogin}>
          <Text style={styles.button_text}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button_selection} onPress={toRegister}>
          <Text style={styles.button_text}>Register</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.quicklogin_text1}>Now! Use Touch ID for Quick Login</Text>
        {biometricEnabled ? (
        <TouchableOpacity style={styles.quicklogin_button} onPress={handleQuickLogin} disabled={authLoading}>
          {authLoading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Image style={styles.touchid} source={require('../../assets/touchid.png')} />
              <Text style={styles.quicklogin_text2}>Quick Login</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <Text style={{ marginTop: 10, color: '#666' }}>Quick login not enabled. Sign in once to enable.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAE4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  // Login Selection Page
  logo: {
    width: 100,
    height: 100,
    marginBottom: 18,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.49)", 
    shadowColor: "#366728ff",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8, // for Android
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",  
  },

  logo_caption: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#344d36ff',
    margin: 2,
  },

  touchid: {
    width: 85,
    height: 85,
    margin: 15,
  },

  button_container: {
    marginTop: 110,
    flexDirection: 'row',
  },

  button_text: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 17,
  },

  button_selection: {
    backgroundColor: '#578C5B',
    padding: 15,
    marginVertical: 10,
    borderRadius: 20,
    width: 150,
    marginHorizontal: 7,
  },

  quicklogin_text1: {
    marginTop: 60,
    fontWeight: 'bold',
    fontSize: 17,
    color: '#344d36ff',
  },

  quicklogin_text2: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 15,
  },

  // User Login Page & Admin Register Page
  backlogo: {
    width: 40,
    height: 40,
    bottom: 70,
    right: 165,
  },

  backlogo1: {
    width: 40,
    height: 40,
    bottom: 95,
    right: 165,
  },

  backlogo2: {
    width: 40,
    height: 40,
    bottom: 168,
    right: 165,
  },

  back_selction: {
    marginTop: 40,
    marginLeft: 10,
    fontSize: 17,
    fontWeight: 'bold',
    position: 'absolute',
    top: 10,
    left: 10,
  },

  logo_login:{
    width: 100,
    height: 100,
    borderRadius: 50,
    bottom: 50,
  },

  login_container: {
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
  },

  text1: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },

  text2: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 15,
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

  text_OR: {
    fontSize: 22,
    marginTop: 25,
    marginBottom: 25,
    fontWeight: 'bold',
  },

  login_method_container: {
    backgroundColor: '#578C5B',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#143d17ff',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    flexDirection: 'row',
  },

  login_method: {
    padding: 15,
    marginHorizontal: 10,
    backgroundColor: '#eee',
    borderRadius: 20,
    alignItems: 'center',
    width: '40%',
  },

  login_method_text: {
    fontSize: 17,
    fontWeight: 'bold',
  },

  text_agreement: {
    fontSize: 15,
    color: '#fff',
    alignItems: 'center',
  },

  text_agreement_container: {
    alignItems: 'center',
  },
});
