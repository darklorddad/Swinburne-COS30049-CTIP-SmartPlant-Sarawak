import { db } from "../FirebaseConfig";
import { query, collection, where, getDocs, doc, getDoc } from "firebase/firestore";

async function getFullProfile(identifier) {
    if (!identifier) {
        console.error("No identifier provided to getFullProfile");
        return null;
    }

    try {
        // First, try to fetch by document ID, assuming identifier is a user_id.
        const docRef = doc(db, "account", identifier);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return docSnap.data();
        }

        // If not found, assume it's an email and query the collection.
        const userRef = collection(db, "account");
        const q = query(userRef, where("email", "==", identifier));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data();
        }

        // If still not found, then it doesn't exist.
        console.log(`No user profile found for identifier: ${identifier}`);
        return null;

    } catch (error) {
        console.error("Error fetching full profile:", error);
        return null; 
    }
}

export { getFullProfile };