import { collection, query, where, getDocs } from "firebase/firestore"; 
import { db, auth } from "../FirebaseConfig";

export const fetchUserPosts = async () => {
  try {
    const currentUserId = auth.currentUser?.uid; 
    if (!currentUserId) return [];

    const postsRef = collection(db, "plant_identify");
    const q = query(
      postsRef,
      where("user_id", "==", currentUserId),
      where("identify_status", "==", "verified")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    console.error("Error fetching user posts:", err);
    return [];
  }
};
