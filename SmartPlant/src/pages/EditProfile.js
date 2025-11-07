import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image } from "react-native";
import { getFullProfile } from "../firebase/UserProfile/UserUpdate";
import { updateUserProfile } from "../firebase/UserProfile/ProfileUpdate";
import { storage } from "../firebase/FirebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

const colors = ['#fca5a5', '#16a34a', '#a3e635', '#fef08a', '#c084fc', '#60a5fa', '#f9a8d4'];
const getColorForId = (id) => {
  if (!id) return colors[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function EditProfile({ navigation, route }) {
  // Get email passed from MyProfile
  const { email } = route.params; 
  const [profile, setProfile] = useState(null);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: "Edit Profile",
      headerTitleAlign: "center",
      headerBackVisible: true, // shows arrow if opened from Profile
      headerStyle: { backgroundColor: "#fefae0" },
      headerTintColor: "#333",
      headerTitleStyle: { fontWeight: "bold", fontSize: 22 },
    });
  }, [navigation]);

  // Fetch profile info from Firebase
  useEffect(() => {
    if (!email) {   
      Alert.alert("Error", "No email provided. Please log in.");
      return;
    }
    const fetchProfile = async () => {
      try {
        const data = await getFullProfile(email);
        setProfile(data);
        setOriginalProfile(data);
        setImageUri(data.profile_pic || null);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [email]);

  // Update text fields
  const handleChange = (key, value) => setProfile({ ...profile, [key]: value });

  // Pick image from gallery
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const newImageUri = result.assets[0].uri;
      setImageUri(newImageUri);
      setProfile(prevProfile => ({ ...prevProfile, profile_pic: newImageUri }));
    }
  };

  // Upload image to Firebase Storage
  const uploadImage = async (uri, email) => {
    if (!uri) return null;
    try {
      console.log("Uploading from:", uri);
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `profile_pictures/${email}_${Date.now()}.jpg`;
      const imageRef = ref(storage, filename);
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.error(" Error uploading image:", error);
      throw error;
    }
  };

  // Handle updated profile
  const handleSave = async () => {
    try {
      let updatedProfile = { ...profile };

      // Full Name check
      if (profile.full_name !== originalProfile.full_name) {
        if (profile.full_name.trim().length < 3) {
          Alert.alert("Invalid Name", "Full name must be at least 3 characters long.");
          return;
        }
      }

      // Phone number check
      if (profile.phone_number !== originalProfile.phone_number) {
        const phoneRegex = /^\d{10,}$/;
        if (!phoneRegex.test(profile.phone_number)) {
          Alert.alert("Invalid Phone", "Phone number must have at least 10 digits.");
          return;
        }
      }

      // Address check
      if (profile.address !== originalProfile.address) {
        if (profile.address.trim().length < 5) {
          Alert.alert("Invalid Address", "Address must be at least 5 characters long.");
          return;
        }
      }
      
      // NRIC check
      if (profile.nric !== originalProfile.nric) {
        const nricRegex = /^\d{6}-\d{2}-\d{4}$/;
        if (!nricRegex.test(profile.nric)) {
          Alert.alert("Invalid NRIC", "NRIC must follow the format XXXXXX-XX-XXXX.");
          return;
        }
      }

      // District check
      if (profile.division !== originalProfile.division) {
        if (profile.division.trim().length < 3) {
          Alert.alert("Invalid District", "District name must be at least 3 characters long.");
          return;
        }
      }

      // Postcode check
      if (profile.postcode !== originalProfile.postcode) {
        const postcodeRegex = /^\d{5}$/;
        if (!postcodeRegex.test(profile.postcode)) {
          Alert.alert("Invalid Postcode", "Postcode must be exactly 5 digits.");
          return;
        }
      }

      // Race check
      if (profile.race !== originalProfile.race) {
        if (profile.race.trim().length < 3) {
          Alert.alert("Invalid Race", "Race must be at least 3 characters long.");
          return;
        }
      }

      // Occupation check
      if (profile.occupation !== originalProfile.occupation) {
        if (profile.occupation.trim().length < 2) {
          Alert.alert("Invalid Occupation", "Occupation must be at least 2 characters long.");
          return;
        }
      }

      // Upload new image if changed
      if (imageUri && imageUri !== profile.profile_pic) {
        const downloadURL = await uploadImage(imageUri, email);
        updatedProfile.profile_pic = downloadURL;
      }

      // Password validation 
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          Alert.alert("Error", "Passwords do not match");
          return;
        }
        updatedProfile.password = newPassword; // hardcoded for your setup
      }

      // Update Firestore profile
      await updateUserProfile(email, updatedProfile);

      Alert.alert("Success", "Profile updated!");
      navigation.replace("Profile", { userEmail: email });
    } catch (err) {
      console.error("Error updating profile:", err);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  if (!profile) {
    return (
      <View style={styles.loadingstyle}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Picture */}
      <TouchableOpacity style={styles.profileContainer} onPress={pickImage}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.profileImage}
          />
        ) : (
          <View style={[styles.profileImage, { backgroundColor: getColorForId(profile?.user_id), justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={styles.avatarText}>{(profile?.full_name || "U").charAt(0)}</Text>
          </View>
        )}
        <Text style={styles.changeText}>Change Profile Picture</Text>
      </TouchableOpacity>

      {/* Editable fields input */}
      <InputField label="Full Name" value={profile.full_name} onChange={(v) => handleChange("full_name", v)} />
      <InputField label="Phone" value={profile.phone_number || ""} onChange={(v) => handleChange("phone_number", v)} />
      <InputField label="Address" value={profile.address || ""} onChange={(v) => handleChange("address", v)} />

      <View style={styles.radioGroup}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.radioOptions}>
          {["Male", "Female"].map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.radioOption}
              onPress={() => handleChange("gender", option)}
            >
              <View
                style={[
                  styles.radioCircle,
                  profile.gender === option && styles.radioSelected,
                ]}
              />
              <Text style={styles.radioText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Date of Birth</Text>
        <TouchableOpacity
          style={styles.inputBox}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {profile.date_of_birth
              ? profile.date_of_birth
              : "Select your date of birth"}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={
              profile.date_of_birth
                ? new Date(profile.date_of_birth)
                : new Date()
            }
            mode="date"
            display="spinner"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                const formatted = selectedDate.toISOString().split("T")[0];
                handleChange("date_of_birth", formatted);
              }
            }}
          />
        )}
      </View>

      <InputField label="NRIC" value={profile.nric || ""} onChange={(v) => handleChange("nric", v)} />
      <InputField label="District" value={profile.division || ""} onChange={(v) => handleChange("division", v)} />
      <InputField label="Postcode" value={profile.postcode || ""} onChange={(v) => handleChange("postcode", v)} />
      <InputField label="Race" value={profile.race || ""} onChange={(v) => handleChange("race", v)} />
      <InputField label="Occupation" value={profile.occupation || ""} onChange={(v) => handleChange("occupation", v)} />
      <InputField label="New Password" value={newPassword} onChange={setNewPassword} secureTextEntry={true}/>
      <InputField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} secureTextEntry={true}/>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

{/* Input layout */}
const InputField = ({ label, value, onChange, secureTextEntry }) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.inputBox}
      value={value}
      onChangeText={onChange}
      secureTextEntry={secureTextEntry}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fefae0",
    padding: 20,
  },
  profileContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginVertical: 15,
  },
  changeImageText: {
    textAlign: "center",
    color: "blue",
    marginTop: 5,
  },
  changeText: {
    color: "blue",
  },
  saveButton: { 
    backgroundColor: "#5A7B60", 
    padding: 12, 
    borderRadius: 8, 
    marginTop: 20 
  },
  saveText: { 
    color: "#fff", 
    textAlign: "center", 
    fontWeight: "bold" 
  },
  loadingstyle:{
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center"
  },
  inputContainer:{
    marginBottom: 12,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    justifyContent: "center",
  },
  inputWrapper: {
    marginBottom: 30,
  },
  radioGroup: {
    marginBottom: 30,
  },
  inputLabel: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
  },
  radioOptions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 4,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  radioCircle: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioSelected: {
    backgroundColor: "#ccc",
  },
  radioText: {
    fontSize: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
});

