import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../firebase/FirebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function MyPost({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!userId) return setLoading(false);

      try {
        const postsQuery = query(
          collection(db, "plant_identify"),
          where("user_id", "==", userId)
        );
        const snapshot = await getDocs(postsQuery);

        const userPosts = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();

            // Default uploader info
            let uploader = {
              id: data.user_id || "",
              name: data.uploader_name || "Unknown Uploader",
              email: data.uploader_email || "",
              profile_picture: "",
            };

            // Fetch uploader from 'users' collection
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
                    profile_picture: userData.profile_pic || "",
                  };
                }
              } catch (err) {
                console.log("Error fetching uploader info:", err);
              }
            }

            // Transform model_predictions into array
            let predictions = [];
            if (data.model_predictions) {
              if (data.model_predictions.top_1) predictions.push(data.model_predictions.top_1);
              if (data.model_predictions.top_2) predictions.push(data.model_predictions.top_2);
              if (data.model_predictions.top_3) predictions.push(data.model_predictions.top_3);
            }

            const postTime = data.time ?? data.createdAt ?? null;

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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate("Profile");
          }}
        >
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Posts</Text>
      </View>

      {/* Posts */}
      {posts.length === 0 ? (
        <Text style={styles.noPostText}>You haven’t uploaded any posts yet.</Text>
      ) : (
        posts.map((post) => (
          <TouchableOpacity
            key={post.id}
            style={styles.postCard}
            onPress={() => navigation.navigate("PostDetail", { post })}
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
              <TouchableOpacity
                style={styles.details}
                onPress={() => navigation.navigate("PlantDetailUser", { post })}
              >
                <Text style={styles.detailsText}>Details</Text>
              </TouchableOpacity>
            </View>

            {/* Image */}
            <Image source={{ uri: post.image }} style={styles.photo} />

            {/* Actions */}
            <View style={styles.actions}>
              <Ionicons name="heart-outline" size={22} color="#333" />
              <Ionicons name="chatbubble-ellipses-outline" size={22} color="#333" style={{ marginLeft: 14 }} />
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
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 30, 
    marginBottom: 10, 
    paddingHorizontal: 20 
  },
  back: { 
    fontSize: 22, 
    marginRight: 10, 
    marginTop: 30 
  },
  headerTitle: { 
    fontSize: 18, 
    textAlign: "center", 
    width: "80%", 
    marginTop: 30 
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
    opacity: 0.7 
  },
  details: { 
    marginLeft: "auto", 
    backgroundColor: "#E7F0E5", 
    borderRadius: 10, 
    paddingHorizontal: 10, 
    paddingVertical: 6 
  },
  detailsText: { 
    fontWeight: "700" 
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
});
