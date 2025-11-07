import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Text, Dimensions, Image, ActivityIndicator } from "react-native";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase/FirebaseConfig";
import ImageSlideshow from "../components/ImageSlideShow";

export default function SavedScreen({ navigation }) {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const myId = auth.currentUser?.uid; // current logged-in user's ID
  const screenWidth = Dimensions.get("window").width;
  const numColumns = 3;
  const boxSize = screenWidth / numColumns;
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: "Saved",
      headerTitleAlign: "center",
      headerBackVisible: true, // shows arrow if opened from Profile
      headerStyle: { backgroundColor: "#fefae0" },
      headerTintColor: "#333",
      headerTitleStyle: { fontWeight: "bold", fontSize: 22 },
    });
  }, [navigation]);

  useEffect(() => {
    if (!myId) return;

    const accountsCol = collection(db, "account");
    const unsubAccounts = onSnapshot(accountsCol, (accountsSnap) => {
        const accountsMap = new Map();
        accountsSnap.forEach(doc => {
            accountsMap.set(doc.data().user_id, doc.data());
        });

        const plantsQuery = query(
            collection(db, "plant_identify"),
            where("saved_by", "array-contains", myId)
        );

        const unsubPosts = onSnapshot(plantsQuery, async (snapshot) => {
            setLoading(true);
            const posts = await Promise.all(
                snapshot.docs.map(async (docSnap) => {
                    const data = docSnap.data();
                    const uploaderData = accountsMap.get(data.user_id) || {};

                    let uploader = {
                        id: data.user_id || "",
                        name: uploaderData.full_name || uploaderData.email || "Unknown Uploader",
                        email: uploaderData.email || "",
                        profile_picture: uploaderData.profile_pic || "",
                    };

                    let predictions = [];
                    if (data.model_predictions) {
                        if (data.model_predictions.top_1) predictions.push(data.model_predictions.top_1);
                        if (data.model_predictions.top_2) predictions.push(data.model_predictions.top_2);
                        if (data.model_predictions.top_3) predictions.push(data.model_predictions.top_3);
                    }

                    const postTime = data.time ?? data.createdAt ?? null;

                    const imageURIs = Array.isArray(data.ImageURLs) && data.ImageURLs.length > 0
                        ? data.ImageURLs
                        : (data.ImageURL ? [data.ImageURL] : []);

                    return {
                        id: docSnap.id,
                        imageURIs: imageURIs,
                        caption: data.caption || "",
                        locality: data.locality || "",
                        coordinate: data.coordinate || null,
                        time: postTime,
                        prediction: predictions,
                        author: data.author_name || uploader?.name || "User",
                        liked_by: data.liked_by || [],
                        saved_by: data.saved_by || [],
                        uploader,
                    };
                })
            );
            setSavedPosts(posts);
            setLoading(false);
        });

        return () => unsubPosts();
    });

    return () => unsubAccounts();
}, [myId]);


  return (
    <View style={styles.container}>
      {/* Saved Posts Grid */}
      <View style={styles.grid}>
        {loading ? (
          <ActivityIndicator size="large" color="#00796b" style={styles.loading} />
        ) : savedPosts.length === 0 ? (
          <Text style={styles.noPostText}>No saved posts yet</Text>
        ) : (
          savedPosts.map((post, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.box, { width: boxSize, height: boxSize }]}
              onPress={() => navigation.navigate("PostDetail", { postId: post.id })}
            >
              <ImageSlideshow
                imageURIs={ post.imageURIs }
                onSlideChange={(index) => setCurrentSlide(index) }
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
  settings: { 
    fontSize: 20,
    position: "absolute",
    right: 5
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  box: {
    borderWidth: 1,
    borderColor: "white"
  },
  loading:{
     marginTop: 50,
  },
  boxImage:{
    width: "100%", 
    height: "100%"
  },
noPostText: {
  textAlign: "center",
  marginTop: 30,
  fontSize: 16,
  color: "#777",
  width: "100%",
},
});
