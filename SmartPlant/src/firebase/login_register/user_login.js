import { auth, db } from "../FirebaseConfig";
import { getFullProfile } from "../UserProfile/UserUpdate";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, getDoc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

let otpStorage = {};

async function loginWithEmail(email, password) {
  if (!email || !password) {
    return { success: false, error: "Please enter email and password" };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get from user collection
    const q = query(collection(db, "user"), where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: "User record not found in Firestore." };
    }

    let userData;
    querySnapshot.forEach((docSnap) => {
      userData = docSnap.data();
    });

    if (userData.is_active === false) {
      return { success: false, error: "Your account has been deactivated. Please contact support." };
    }

    const role = userData.role || "user";
    const userId = userData.account_id || userData.user_id || "";
    const fullName = userData.full_name || "";

    // Check if account exists — if not, create one
    const accountRef = doc(db, "account", userId);
    const accountSnap = await getDoc(accountRef);

    if (!accountSnap.exists()) {
      await setDoc(accountRef, {
        account_id: userId,
        full_name: fullName || "Unknown",
        email: email,
        role: role,
        address: "",
        gender: "",
        division: "",
        occupation: role === "admin" ? "administrator" : role,
        date_of_birth: "",
        created_at: serverTimestamp(),
        is_active: true,
        login_method: "manual"
      });
      console.log(`Created missing account record for ${role}: ${userId}`);
    }

    return {
      success: true,
      user,
      role,
      userId,
      email
    };

  } catch (error) {
    let message;
    switch (error.code) {
      case "auth/invalid-email":
        message = "Please enter a valid email address.";
        break;
      case "auth/wrong-password":
      case "auth/invalid-credential":
        message = "Incorrect password. Please try again.";
        break;
      case "auth/user-not-found":
        message = "No account found with this email.";
        break;
      case "auth/network-request-failed":
        message = "Network error. Please check your connection.";
        break;
      default:
        message = error.message;
    }
    return { success: false, error: message };
  }
}

// ---------------- SEND OTP ----------------
async function sendOTPToPhone(phoneNumber) {
  if (!phoneNumber) return { success: false, error: "Phone number is required" };

  try {
    // Generate 6-digit random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with expiration (5 min)
    const expiresAt = Date.now() + 5 * 60 * 1000;
    otpStorage[phoneNumber] = { code: otp, expiresAt };

    console.log(`[DEV] OTP for ${phoneNumber}: ${otp}`); // Always log OTP for testing

    // Always return OTP in development
    return { success: true, message: "OTP sent successfully", otp: otp };

  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, error: "Failed to send OTP. Please try again." };
  }
}

// ---------------- VERIFY OTP ----------------
async function verifyOTP(phoneNumber, otpCode) {
  if (!phoneNumber || !otpCode) return { success: false, error: "Phone number and OTP are required" };

  const storedOTP = otpStorage[phoneNumber];
  if (!storedOTP) return { success: false, error: "No OTP found. Please request a new one." };

  if (Date.now() > storedOTP.expiresAt) {
    delete otpStorage[phoneNumber];
    return { success: false, error: "OTP has expired. Please request a new one." };
  }

  if (storedOTP.code !== otpCode) return { success: false, error: "Invalid OTP. Please try again." };

  // OTP valid, clean up
  delete otpStorage[phoneNumber];
  return { success: true, message: "OTP verified successfully" };
}

async function saveBiometric(email) {
  try {
    await AsyncStorage.setItem("savedEmail", email);
    await AsyncStorage.setItem("biometricEnabled", "true");
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function saveCredentials(email, password) {
  try {
    if (!email || !password) {
      return { success: false, error: "Missing email or password." };
    }

    // Clear old stored credentials before saving new ones
    await AsyncStorage.multiRemove(["savedEmail", "savedPassword", "biometricEnabled"]);

    await AsyncStorage.setItem("savedEmail", email);
    await AsyncStorage.setItem("savedPassword", password);
    await AsyncStorage.setItem("biometricEnabled", "true");

    console.log("Credentials saved for:", email);
    return { success: true };
  } catch (e) {
    console.log("Error saving credentials:", e);
    return { success: false, error: e.message };
  }
}

async function getUserDataByEmail(email) {
  const q = query(collection(db, "user"), where("email", "==", email));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  let userData;
  querySnapshot.forEach(docSnap => {
    userData = docSnap.data();
  });
  return userData;
}

async function getSavedCredentials() {
  try {
    const email = await AsyncStorage.getItem("savedEmail");
    const password = await AsyncStorage.getItem("savedPassword");
    const biometricEnabled = await AsyncStorage.getItem("biometricEnabled");

    if (email && password && biometricEnabled === "true") {
      return { email, password };
    }
    return null;
  } catch (e) {
    return null;
  }
}



export {
  loginWithEmail,
  sendOTPToPhone,
  verifyOTP,
  saveBiometric,
  saveCredentials,
  getSavedCredentials,
  getUserDataByEmail,
  getFullProfile
};
