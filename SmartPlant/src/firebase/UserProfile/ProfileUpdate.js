import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { storage, db } from "../FirebaseConfig";

// Upload profile image
export const uploadProfilePicture = async (uri, email) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `profile_pictures/${email}_${Date.now()}.jpg`;
    const imageRef = ref(storage, filename);
    await uploadBytes(imageRef, blob);
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
};

// Validate profile info
export const validateProfileData = (data) => {
  if (!data.name) return "Name is required.";
  if (!data.phone) return "Phone number is required.";
  return null;
};

export const updateUserProfile = async (email, data) => {
  const batch = writeBatch(db);

  // Get user document by email to find user_id
  const userQuery = query(collection(db, "user"), where("email", "==", email));
  const userSnap = await getDocs(userQuery);

  if (userSnap.empty) {
    throw new Error(`No user found with email: ${email}`);
  }

  const userDoc = userSnap.docs[0];
  const userId = userDoc.id; // Firestore document ID for user

  // Update only full_name and password in user document
  const userDocRef = doc(db, "user", userId);
  const userUpdateData = {};
  if (data.full_name) userUpdateData.full_name = data.full_name;
  if (data.password) userUpdateData.password = data.password;

  if (Object.keys(userUpdateData).length > 0) {
    batch.set(userDocRef, userUpdateData, { merge: true });
  }

  // Update account document(s) matching this user_id
  const accountQuery = query(collection(db, "account"), where("user_id", "==", userId));
  const accountSnap = await getDocs(accountQuery);

  accountSnap.forEach((accountDoc) => {
    const accountRef = doc(db, "account", accountDoc.id);
    batch.set(accountRef, data, { merge: true });
  });

  // Update posts authored by this user
  if (data.full_name) {
    const postsQuery = query(collection(db, "plant_identify"), where("user_id", "==", userId));
    const postsSnap = await getDocs(postsQuery);

    postsSnap.forEach((postDoc) => {
      const postRef = doc(db, "plant_identify", postDoc.id);
      batch.update(postRef, { author_name: data.full_name });
    });
  }

  // Commit all updates in a single batch
  await batch.commit();
};