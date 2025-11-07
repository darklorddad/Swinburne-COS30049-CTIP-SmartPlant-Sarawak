import React, { useCallback, useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from "react-native";
import BottomNav from "../components/Navigation";
import { getFullProfile } from "../firebase/UserProfile/UserUpdate";
import { auth } from "../firebase/FirebaseConfig";
import { useFocusEffect } from '@react-navigation/native';


const NAV_HEIGHT = 60;
const NAV_MARGIN_TOP =150;

const colors = ['#fca5a5', '#16a34a', '#a3e635', '#fef08a', '#c084fc', '#60a5fa', '#f9a8d4'];
const getColorForId = (id) => {
  if (!id) return colors[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerBackVisible: false,
      headerLeft: () => null,
      headerTitle: "Profile",
      headerTitleAlign: "center",
      headerStyle: { backgroundColor: "#fefae0" },
      headerTintColor: "#333",
      headerTitleStyle: { fontWeight: "bold", fontSize: 22 },
    });
  }, [navigation]);
  
  const fetchProfile = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser; 
        if (!user) {
          Alert.alert("Error", "No logged-in user found. Please log in again.");
          navigation.replace("Login");
          return;
        }

        const email = user.email;
        const data = await getFullProfile(email);
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
  
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingstyle}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingstyle}>
        <Text>Profile not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.background}>
      <ScrollView style={styles.scroller} 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* Profile Image */}
        <View style={styles.profileContainer}>
          {profile?.profile_pic ? (
            <Image
              source={{ uri: profile.profile_pic }}
              style={styles.profileImage}
            />
          ) : (
            <View style={[styles.profileImage, { backgroundColor: getColorForId(profile.user_id), justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={styles.avatarText}>{(profile.full_name || "U").charAt(0)}</Text>
            </View>
          )}
          <Text style={styles.username}>{profile.full_name}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate("MyProfile", { userEmail: profile.email })}

          >
            <Text style={styles.menuText}>My Profile</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}
            onPress={() => navigation.navigate("MyPost")}
          >
            <Text style={styles.menuText}>Uploaded Post</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate("Saved")} 
          >
            <Text style={styles.menuText}>Saved</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate("Setting")} 
          >
            <Text style={styles.menuText}>Settings</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} 
          onPress={async () => {
              try {
                await auth.signOut();
                navigation.replace("UserLogin");
              } catch (error) {
                console.error("Error logging out:", error);
              }
            }}>
            <Text style={styles.menuText}>Log Out</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Fixed Bottom Nav */}
      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  background:{
    flex: 1, 
    backgroundColor: "#fefae0", 
  },
  scroller: {
    marginBottom: -NAV_MARGIN_TOP
  },
  container: {
    paddingBottom: NAV_HEIGHT + NAV_MARGIN_TOP + 16,
    backgroundColor: "#fefae0",
    alignItems: "center",
    padding: 20,
  },
  profileContainer: {
    alignItems: "center",
    marginVertical: 20,
    width: "100%",
  },
  profileImage: {
    width: 100,
    height: 100,
    aspectRatio: 1,
    borderRadius: 100,
    resizeMode: "cover",
    backgroundColor: "#ddd",
  },
  username: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "500",
  },
  menuContainer: {
    width: "100%",
    marginTop: 20,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  menuText: {
    fontSize: 16,
  },
  arrow: {
    fontSize: 18,
    color: "#333",
  },
  loadingstyle:{
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center"
  },
  avatarText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
});
