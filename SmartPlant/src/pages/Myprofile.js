import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert} from "react-native";
import { getFullProfile } from "../firebase/UserProfile/UserUpdate";

const colors = ['#fca5a5', '#16a34a', '#a3e635', '#fef08a', '#c084fc', '#60a5fa', '#f9a8d4'];
const getColorForId = (id) => {
  if (!id) return colors[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function MyProfile({ navigation, route }) {
  // Extracting email and updated profile info 
  const { userEmail, updatedProfile } = route.params || {};
  // Storing status
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: "My Profile",
      headerTitleAlign: "center",
      headerBackVisible: true, // shows arrow if opened from Profile
      headerStyle: { backgroundColor: "#fefae0" },
      headerTintColor: "#333",
      headerTitleStyle: { fontWeight: "bold", fontSize: 22 },
    });
  }, [navigation]);
  
  // Fetch profile info from Firebase
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!userEmail) {
          Alert.alert("Error", "No email provided. Please log in.");
          return;
        }
        const data = await getFullProfile(userEmail);
        //console.log("Fetched full profile:", data);
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userEmail, updatedProfile]);

  // Show loading
  if (loading) {
    return (
      <View style={styles.loadingstyle}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  // Show message if cannot be fetched
  if (!profile) {
    return (
      <View style={loadingstyle}>
        <Text>No profile data available as no login</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Picture */}
      <View style={styles.profileSection}>
        <Text style={styles.profileLabel}>Profile picture</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("EditProfile", { email: profile.email })} >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>
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

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{profile.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone Number</Text>
          <Text style={styles.value}>{profile.phone_number || "N/A"}</Text>
        </View>
      </View>

      {/* Personal Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{profile.full_name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Date of Birth</Text>
          <Text style={styles.value}>{profile.date_of_birth || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>NRIC</Text>
          <Text style={styles.value}>{profile.nric || "*******000"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Gender</Text>
          <Text style={styles.value}>{profile.gender|| "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{profile.address || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>District</Text>
          <Text style={styles.value}>{profile.division || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Postcode</Text>
          <Text style={styles.value}>{profile.postcode || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Race</Text>
          <Text style={styles.value}>{profile.race || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Occupation</Text>
          <Text style={styles.value}>{profile.occupation || "N/A"}</Text>
        </View>
      </View>

      {/* Security Centre */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Centre</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Change Password</Text>
          <Text style={styles.value}>*******</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fefae0",
    padding: 20,
    minHeight: "100%",
  },
  profileSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  editText: {
    fontSize: 16,
    color: "blue",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginVertical: 15,
  },
  section: {
    marginVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    paddingVertical: 5,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  value: {
    flex: 2,
    fontSize: 15,
    color: "#333",
    textAlign: "right",
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
