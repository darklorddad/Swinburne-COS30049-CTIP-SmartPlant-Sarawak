import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchUserPosts } from "../firebase/UserProfile/UserPost";
import { auth } from "../firebase/FirebaseConfig";
import { Image } from "react-native";
import { getFullProfile } from "../firebase/UserProfile/UserUpdate";

export default function MyPost({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    const getPostsAndProfile = async () => {
      if (!auth.currentUser) {
        console.log("User not logged in yet");
        setLoading(false);
        return;
      }

      // Fetch posts
      const data = await fetchUserPosts();
      setPosts(data);

      // Fetch profile picture
      const profileData = await getFullProfile(auth.currentUser.email);
      setProfilePic(profileData.profile_pic);

      setLoading(false);
    };

    getPostsAndProfile();
  }, []);


  if (loading) {
    return <ActivityIndicator style={styles.loadingIndicator} size="large" color="#00796b"/>;
  }

  return (
    <ScrollView contentContainerStyle={styles.background}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate("Profile");
            }
          }}
        >
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Posts</Text>
      </View>

      {/* Posts list */}
        {posts.length === 0 ? (
          <Text style={styles.noPostText}>You haven’t uploaded any posts yet.</Text>
        ) : (
          posts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.postCard}
              onPress={() => navigation.navigate("PostDetail", { post })}
            >
              {/* Header for each post */}
              <View style={styles.postHeader}>
                <Image
                  source={profilePic ? { uri: profilePic } : require("../../assets/user2.png")}
                  style={styles.avatar}
                />

                <View>
                  <Text style={styles.name}>{auth.currentUser?.displayName || "You"}</Text>
                  <Text style={styles.meta}>
                    {/* {new Date(post.createdAt?.seconds * 1000).toLocaleString()} — {post.location || "Unknown"} */}
                    {new Date(post.createdAt?.seconds * 1000).toLocaleString()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.details}
                  onPress={() => navigation.navigate("PlantDetailUser", { post })}
                >
                  <Text style={styles.detailsText}>Details</Text>
                </TouchableOpacity>
              </View>

              {/* Image uploaded */}
              <Image source={{ uri: post.ImageURL }} style={styles.photo} />

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
};

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
    paddingHorizontal: 20,
  },
  back: {
    fontSize: 22,
    marginRight: 10,
    marginTop: 30,
  },
  headerTitle: {
    fontSize: 18, 
    textAlign: "center",
    width: "80%",
    marginTop: 30,
  },
  postCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",

  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#D7E3D8",
    marginRight: 8,
  },
  name: {
    fontWeight: "700",
  },
  meta: {
    fontSize: 12,
    opacity: 0.7,
  },
  details: {
    marginLeft: "auto",
    backgroundColor: "#E7F0E5",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  detailsText: {
    fontWeight: "700",
  },
  photo: {
    width: "100%",
    height: 200,
    backgroundColor: "#5A7B60",
    borderRadius: 10,
    marginTop: 12,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  noPostText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#777",
  },
  loadingIndicator:{
    marginTop: 100,
  },
});
