import { auth, db } from "../FirebaseConfig";
import { getFullProfile } from "../UserProfile/UserUpdate";
import { signInWithEmailAndPassword, signInWithCredential, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, getDoc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

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


async function loginWithGoogle(id_token) {
  try {
    const credential = GoogleAuthProvider.credential(id_token);
    const userCredential = await signInWithCredential(auth, credential);
    const user = userCredential.user;

    await setDoc(doc(db, "user", user.uid), {
      email: user.email || "",
      full_name: user.displayName || "",
      login_method: "google",
      provider_id: user.uid,
      is_active: true,
      password: "",
      role: "",
      created_at: serverTimestamp(),
    }, { merge: true });

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function loginWithFacebook(access_token) {
  try {
    const credential = FacebookAuthProvider.credential(access_token);
    const userCredential = await signInWithCredential(auth, credential);
    const user = userCredential.user;

    await setDoc(doc(db, "user", user.uid), {
      email: user.email || "",
      full_name: user.displayName || "",
      login_method: "facebook",
      provider_id: user.uid,
      is_active: true,
      password: "",
      role: "",
      created_at: serverTimestamp(),
    }, { merge: true });

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// async function checkUserRole(uid) {
//   const docRef = doc(db, "account", uid);
//   const docSnap = await getDoc(docRef);

//   if (docSnap.exists()) {
//     const data = docSnap.data();
//     if (data.role) {
//       return data.role.toLowerCase();
//     }
//     return null;
//   } else {
//     return null;
//   }
// }

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
  saveBiometric, 
  saveCredentials, 
  loginWithGoogle, 
  loginWithFacebook, 
  // checkUserRole, 
  getSavedCredentials,
  getFullProfile,
  getUserDataByEmail
};
