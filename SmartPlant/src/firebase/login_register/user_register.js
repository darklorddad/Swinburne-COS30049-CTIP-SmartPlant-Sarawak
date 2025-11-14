import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../FirebaseConfig";
import { doc, setDoc, serverTimestamp, getDoc, collection, query, getDocs } from "firebase/firestore";

export async function user_register(fullName, email, password) {
  try {
    // Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseuid = userCredential.user.uid;

    // 1. Read all existing user IDs (OUTSIDE transaction)
    const userCollection = collection(db, "user");
    const snapshot = await getDocs(userCollection);

    let maxNumber = 0;

    snapshot.forEach((docSnap) => {
      const id = docSnap.id; 
      const number = parseInt(id.replace("U", ""));
      if (number > maxNumber) maxNumber = number;
    });

    // 2. Generate next user ID
    const nextNumber = maxNumber + 1;
    const newUserId = "U" + nextNumber.toString().padStart(3, "0");

    // 3. Create user document
    await setDoc(doc(db, "user", newUserId), {
      user_id: newUserId,
      firebase_uid: firebaseuid,
      full_name: fullName,
      email: email,
      password: password, 
      role: "user",
      is_active: true,
      created_at: serverTimestamp(),
    });

    // 4. Create matching account document
    await setDoc(doc(db, "account", newUserId), {
      account_id: newUserId,
      user_id: newUserId,
      profile_pic: null,
      phone_number: null,
      date_of_birth: null,
      nric: null,
      gender: null,
      address: null,
      division: null,
      postcode: null,
      race: null,
      occupation: null,
      created_at: serverTimestamp(),
    });

    return true;
  } catch (error) {
    throw error;
  }
}
