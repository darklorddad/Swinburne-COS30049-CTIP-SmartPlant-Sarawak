import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Text, Dimensions, Image, ActivityIndicator } from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase/FirebaseConfig";

export default function SavedScreen({ navigation }) {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const myId = auth.currentUser?.uid; // current logged-in user's ID
  const screenWidth = Dimensions.get("window").width;
  const numColumns = 3;
  const boxSize = screenWidth / numColumns;

  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (!myId) return;
      setLoading(true);

      try {
        // Query plant_identify for posts saved by current user
        const plantsQuery = query(
          collection(db, "plant_identify"),
          where("saved_by", "array-contains", myId)
        );
        const snapshot = await getDocs(plantsQuery);

        const posts = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();

            // Default uploader info
            let uploader = {
              id: data.user_id || "",
              name: data.uploader_name || "Unknown Uploader",
              email: data.uploader_email || "",
              profile_picture: "",
            };

            // Fetching uploader from 'users' collection
            if (data.user_id) {
              try {
                const usersCol = collection(db, "user");
                const userQuery = query(usersCol, where("user_id", "==", data.user_id));
                const userSnap = await getDocs(userQuery);

                if (!userSnap.empty) {
                  const userData = userSnap.docs[0].data();
                  uploader = {
                    id: data.user_id,
                    name: userData.full_name || userData.email || "Unknown Uploader",
                    email: userData.email || "",
                    profile_picture: userData.profile_picture || "",
                  };
                }
              } catch (err) {
                console.log("Error fetching uploader info:", err);
              }
            }
            
            // Transform model_predictions into array for top predictions
            let predictions = [];
            if (data.model_predictions) {
              if (data.model_predictions.top_1) predictions.push(data.model_predictions.top_1);
              if (data.model_predictions.top_2) predictions.push(data.model_predictions.top_2);
              if (data.model_predictions.top_3) predictions.push(data.model_predictions.top_3);
            }

            const postTime = data.time ?? data.createdAt ?? null;

            // Return complete post object
            return {
              id: docSnap.id,
              image: data.ImageURL,
              caption: data.caption || "",
              locality: data.locality || "",
              coordinate: data.coordinate || null,   
              time: postTime, 
              prediction: predictions, 
              author: data.author || uploader?.name || "User",
              liked_by: data.liked_by || [],
              saved_by: data.saved_by || [],
              uploader,
            };
          })
        );

        setSavedPosts(posts);
      } catch (error) {
        console.log("Error fetching saved posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [myId]);


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Saved</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Text style={styles.settings}>...</Text>
        </TouchableOpacity>
      </View>

      {/* Saved Posts Grid */}
      <View style={styles.grid}>
        {loading ? (
          <ActivityIndicator size="large" color="#00796b" style={styles.loading} />
        ) : savedPosts.length === 0 ? (
          <Text style={styles.noPosts}>No saved posts yet</Text>
        ) : (
          savedPosts.map((post, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.box, { width: boxSize, height: boxSize }]}
              onPress={() => navigation.navigate("PostDetail", { post })}
            >
              <Image
                source={{ uri: post.image }}
                style={styles.boxImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fefae0" 
  },
  header: {   
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    alignItems: "center",
  },
  back: {
    fontSize: 22,
    marginRight: 10,
    marginTop: 30,
  },
  title: { 
    fontSize: 18, 
    textAlign: "center",
    width: "80%",
    marginTop: 30,
  },
  settings: { 
    fontSize: 20,
    position: "absolute",
    right: 5, 
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  box: {
    borderWidth: 1,
    borderColor: "white",
  },
  loading:{
     marginTop: 50,
  },
  boxImage:{
    width: "100%", 
    height: "100%", 
  },
  noPosts:{
    marginTop: 50, 
    textAlign: "center", 
  },
});
