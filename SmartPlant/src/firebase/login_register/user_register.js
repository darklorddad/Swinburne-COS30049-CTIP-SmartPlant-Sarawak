import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../FirebaseConfig";
import { doc, setDoc, runTransaction, serverTimestamp } from "firebase/firestore";

export async function user_register(fullName, email, password) {
  try {
    // Firebase Authentication: Create User
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseuid = userCredential.user.uid;

    // Generate sequential user_id
    const counterRef = doc(db, "counters", "userCounter");

    const userId = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      let newCount = 1;

      if (!counterDoc.exists()) {
        // Initialize counter if not found
        transaction.set(counterRef, { count: 1 });
      } else {
        const currentCount = counterDoc.data().count;
        newCount = currentCount + 1;
        transaction.update(counterRef, { count: newCount });
      }

      // Return ID: U001, U002
      return "U" + newCount.toString().padStart(3, "0");
    });

    // Add user info to user table
    await setDoc(doc(db, "user", userId), {
      user_id: userId,
      firebase_uid: firebaseuid,
      full_name: fullName,
      email: email,
      password: password, // If you want security, better not store this openly
      login_method: "manual",
      provider_id: null,
      role: "user",
      is_active: true,
      created_at: serverTimestamp(),
    });

    // Create empty profile in account table
    await setDoc(doc(db, "account", userId), {
      account_id: userId,
      user_id: userId,
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
