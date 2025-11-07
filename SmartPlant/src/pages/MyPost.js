import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../firebase/FirebaseConfig";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import ImageSlideshow from "../components/ImageSlideShow";

export default function MyPost({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userFullName, setUserFullName] = useState("");
  const userId = auth.currentUser?.uid;
  const userEmail = auth.currentUser?.email || "";
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: "My Posts",
      headerTitleAlign: "center",
      headerBackVisible: true, // shows arrow if opened from Profile
      headerStyle: { backgroundColor: "#fefae0" },
      headerTintColor: "#333",
      headerTitleStyle: { fontWeight: "bold", fontSize: 22 },
    });
  }, [navigation]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "account", userId);
        const userSnap = await getDoc(userRef);
        let fullName = "";
        let profilePicture = "";

        if (userSnap.exists()) {
          const userData = userSnap.data();
          fullName = userData.full_name || "";
          profilePicture = userData.profile_pic || "";
          setUserFullName(fullName);
        } else {
          const userRef = doc(db, "user", userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            fullName = userData.full_name || "";
            setUserFullName(fullName);
          } 
        }

        // Only the posts uploaded by this user
        const postsQuery = query(collection(db, "plant_identify"), 
          where("user_id", "==", userId),
          where("identify_status", "==", "verified")
        );
        console.log("Current User UID:", userId);
        const snapshot = await getDocs(postsQuery);

        if (snapshot.empty) {
          setPosts([]);
          setLoading(false);
          return;
        }

        // No need to fetch "user" collection — just use the logged-in user info
        const userPosts = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();

          let predictions = [];
          if (data.model_predictions) {
            if (data.model_predictions.top_1) predictions.push(data.model_predictions.top_1);
            if (data.model_predictions.top_2) predictions.push(data.model_predictions.top_2);
            if (data.model_predictions.top_3) predictions.push(data.model_predictions.top_3);
          }

          const imageURIs = Array.isArray(data.ImageURLs)
            ? data.ImageURLs.filter(u => typeof u === "string" && u.trim() !== "")
            : data.ImageURLs && typeof data.ImageURLs === "string"
              ? [data.ImageURLs]
              : [];

          console.log(`Post ${docSnap.id} imageURIs:`, imageURIs);
          
          const postTime = data.time ?? data.createdAt ?? null;

          let image = null;
          if (data.ImageURLs && data.ImageURLs.length > 0) {
            image = data.ImageURLs[0];
          } else if (data.ImageURL) {
            image = data.ImageURL;
          }

          return {
            id: docSnap.id,
            imageURIs: imageURIs,
            caption: data.caption || "",
            locality: data.locality || "",
            coordinate: data.coordinate || null,
            time: postTime,
            prediction: predictions,
            like_count: data.like_count || 0,
            comment_count: data.comment_count || 0,
            saved_by: data.saved_by || [],
            liked_by_me: (data.liked_by || []).includes(userId),
            saved_by_me: (data.saved_by || []).includes(userId),
            user: {
              id: userId,
              name: fullName,
              email: userEmail,
              profile_picture: profilePicture,
            },
            liked_by: data.liked_by || [],
            saved_by: data.saved_by || [],
            uploader: {
              id: userId,
              name: fullName,
              email: userEmail,
              profile_picture: profilePicture,
            },
            user_id: userId,
          };
          
        });

        setPosts(userPosts);

      } catch (err) {
        console.log("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [userId]);

  if (loading) {
    return <ActivityIndicator style={styles.loadingIndicator} size="large" color="#00796b" />;
  }



  return (
    <ScrollView contentContainerStyle={styles.background}>
      {/* Posts */}
      {posts.length === 0 ? (
        <Text style={styles.noPostText}>You haven’t uploaded any posts yet.</Text>
      ) : (
        posts.map((post) => (
          <TouchableOpacity
            key={post.id}
            style={styles.postCard}
            onPress={() => navigation.navigate("PostDetail", { postId: post.id })}
          >
            {/* Header */}
            <View style={styles.postHeader}>
              <Image
                source={{ uri: post.uploader.profile_picture }}
                style={styles.avatar}
              />
              <View>
                <Text style={styles.name}>{post.uploader.name}</Text>
                <Text style={styles.meta}>
                  {post.time ? new Date(post.time.seconds * 1000).toLocaleString() : "Unknown"}
                </Text>
              </View>
            </View>

            {/* Image */}
            <ImageSlideshow imageURIs={post.imageURIs} onSlideChange={(index) => setCurrentSlide(index) } style={styles.photo} />

            {/* Actions */}
            <View style={styles.actions}>
              <Ionicons name={post.liked_by_me ? "heart" : "heart-outline"} size={22} color="#333" />
              <Text style={styles.countText}>{post.like_count}</Text>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color="#333" style={styles.icon} />
              <Text style={styles.countText}>{post.comment_count}</Text>
              <Ionicons name={post.saved_by_me ? "bookmark" : "bookmark-outline"} size={22} color="#333" style={styles.icon} />
              <Text style={styles.countText}>{post.saved_by.length}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    flexGrow: 1,
    paddingBottom: 20,
    backgroundColor: "#fefae0"
  },
  postCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd"
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center"
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#D7E3D8",
    marginRight: 8
  },
  name: {
    fontWeight: "700"
  },
  meta: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 10,
  },
  photo: {
    width: "100%",
    height: 200,
    backgroundColor: "#5A7B60",
    borderRadius: 10,
    marginTop: 12
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10
  },
  noPostText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#777"
  },
  loadingIndicator: {
    marginTop: 100
  },
  icon: {
    marginLeft: 14,
  },
  countText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#333",
  },
});
