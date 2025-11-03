import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, Image, Alert} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { PermissionContext } from "../components/PermissionManager";

export default function SettingsScreen({ navigation }) {
  const {locationGranted, cameraGranted, photosGranted,
    requestLocationPermission, revokeLocationPermission,
    setCameraGranted, requestCameraPermission, revokeCameraPermission,
    requestPhotosPermission, revokePhotosPermission,
  } = useContext(PermissionContext);
  const [location, setLocation] = useState(false);
  const [camera, setCamera] = useState(false);
  const [photos, setPhotos] = useState(false);

  useEffect(() => setLocation(locationGranted), [locationGranted]);
  useEffect(() => setCamera(cameraGranted), [cameraGranted]);
  useEffect(() => setPhotos(photosGranted), [photosGranted]);

  // Load saved toggle states (not OS state)
  useEffect(() => {
    (async () => {
      const loc = await AsyncStorage.getItem("locationEnabled");
      const cam = await AsyncStorage.getItem("cameraEnabled");
      const pho = await AsyncStorage.getItem("photosEnabled");
      setLocation(loc === "true");
      setCamera(cam === "true");
      setPhotos(pho === "true");
    })();
  }, []);

  const handleLocationToggle = async (value) => {
    if (value) {
      const granted = await requestLocationPermission();
      if (!granted) {
        setLocation(false);
        setLocationDisabled(true);
        Alert.alert(
          "Permission Denied",
          "Location access was not granted. Please enable it from system settings."
        );
      } else {
        setLocation(true);
      }
    } else {
      await revokeLocationPermission();
      setLocation(false);
      Alert.alert(
        "Location Disabled",
        "Location-based features have been turned off. To fully revoke access, go to system settings."
      );
    }
  };

  // --- Camera toggle ---
  const handleCameraToggle = async (value) => {
    if (value) {
      const granted = await requestCameraPermission();
      if (granted) {
        setCameraGranted(true);
        setCamera(true);  // permission granted → switch on
      } else {
        setCameraGranted(false);
        setCamera(false); // permission denied → switch stays off
        Alert.alert("Permission Denied", "Please enable camera in system settings.");
      }
    } else {
      await revokeCameraPermission();
      setCamera(false);
      Alert.alert(
        "Camera Disabled",
        "Camera access has been turned off. To fully revoke access, go to system settings."
      );
    }
  };

  const handlePhotosToggle = async (value) => {
    if (value) {
      const granted = await requestPhotosPermission();
      if (granted) {
        setPhotos(true);  // permission granted → switch on
        setPhotosGranted(true);
      } else {
        setPhotos(false); // permission denied → switch stays off
        setPhotosGranted(false);
        Alert.alert("Permission Denied", "Please enable photo library in system settings.");
      }
    } else {
      await revokePhotosPermission();
      setPhotos(false);
      Alert.alert(
        "Photo Access Disabled",
        "Photo library access has been turned off. To fully revoke access, go to system settings."
      );
    }
  };
  
  return (
    <View style={styles.container}>
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
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.row}>
        <Image source={require("../../assets/language.png")} style={styles.icon} />
        <Text style={styles.text}>Choose Language: English</Text>
      </View>

      <View style={styles.row}>
        <Image source={require("../../assets/location.png")} style={styles.icon} />
        <Text style={styles.text}>Location</Text>
        <Switch
          style={styles.switch}
          value={location}
          onValueChange={handleLocationToggle}
          trackColor={{ false: "white", true: "#496D4C" }}
          thumbColor={"#496D4C"}
        />
      </View>

      <View style={styles.row}>
        <Image source={require("../../assets/camera.png")} style={styles.icon} />
        <Text style={styles.text}>Camera</Text>
        <Switch
          style={styles.switch}
          value={camera}
          onValueChange={handleCameraToggle}
          trackColor={{ false: "white", true: "#496D4C" }}
          thumbColor={"#496D4C"}
        />
      </View>

      <View style={styles.row}>
        <Image source={require("../../assets/photos.png")} style={styles.icon} />
        <Text style={styles.text}>Photos</Text>
        <Switch
          style={styles.switch}
          value={photos}
          onValueChange={handlePhotosToggle}
          trackColor={{ false: "white", true: "#496D4C" }}
          thumbColor={"#496D4C"}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
      flex: 1, 
      backgroundColor: "#fefae0", 
      paddingHorizontal: "5%",
      padding: 20 
  },
  header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
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
  row: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 15,
  },
  icon: {
      width: 50,
      height: 50,
      marginRight: 15,
      resizeMode: "contain",
  },
  text: {
      fontSize: 16,
      flex: 1,
  },
  switch: {
      transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }], 
  },
});
