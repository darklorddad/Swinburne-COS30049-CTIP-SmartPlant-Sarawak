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

  // Update 'account' collection, which the frontend uses for displaying user info
  const accountQuery = query(collection(db, "account"), where("email", "==", email));
  const accountSnap = await getDocs(accountQuery);

  if (accountSnap.empty) {
    throw new Error(`No account found with email: ${email}`);
  }

  const accountDocId = accountSnap.docs[0].id;
  const accountDocRef = doc(db, "account", accountDocId);
  batch.set(accountDocRef, data, { merge: true });

  // If the user collection also has a matching doc, update it too
  const userQuery = query(collection(db, "user"), where("email", "==", email));
  const userSnap = await getDocs(userQuery);
  if(!userSnap.empty) {
      const userDocRef = doc(db, "user", userSnap.docs[0].id);
      batch.set(userDocRef, data, { merge: true });
  }

  // If full_name is being updated, find all posts by that user and update the author_name
  if (data.full_name) {
    const postsQuery = query(collection(db, "plant_identify"), where("user_id", "==", accountDocId));
    const postsSnap = await getDocs(postsQuery);
    postsSnap.forEach((postDoc) => {
      const postRef = doc(db, "plant_identify", postDoc.id);
      batch.update(postRef, { author_name: data.full_name });
    });
  }

  await batch.commit();
};