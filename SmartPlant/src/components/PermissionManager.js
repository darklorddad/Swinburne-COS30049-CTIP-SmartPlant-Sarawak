import React, { createContext, useState, useEffect } from "react";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera } from "expo-camera";

export const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [locationGranted, setLocationGranted] = useState(false);
  const [cameraGranted, setCameraGranted] = useState(false);
  const [photosGranted, setPhotosGranted] = useState(false);

  useEffect(() => {
    (async () => {
      // location
      const stored = await AsyncStorage.getItem("locationEnabled");
      if (stored === "true") {
        // Check actual OS permission
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === "granted") {
          setLocationGranted(true);
        } else {
          setLocationGranted(false);
          await AsyncStorage.setItem("locationEnabled", "false");
        }
      }
    
      // --- Camera ---
      const storedCam = await AsyncStorage.getItem("cameraEnabled");
      if (storedCam === "true") {
        const { status } = await ImagePicker.getCameraPermissionsAsync();
        if (status === "granted") {
          setCameraGranted(true);
        } else {
          setCameraGranted(false);
          await AsyncStorage.setItem("cameraEnabled", "false");
        }
      }

      // --- Photos ---
      const storedPhotos = await AsyncStorage.getItem("photosEnabled");
      if (storedPhotos === "true") {
        const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (status === "granted") {
          setPhotosGranted(true);
        } else {
          setPhotosGranted(false);
          await AsyncStorage.setItem("photosEnabled", "false");
        }
      }
    })();
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      await AsyncStorage.setItem("locationEnabled", "true");
      setLocationGranted(true);
      return true;
    } else {
      await AsyncStorage.setItem("locationEnabled", "false");
      setLocationGranted(false);
      return false;
    }
  };

  const revokeLocationPermission = async () => {
    await AsyncStorage.setItem("locationEnabled", "false");
    setLocationGranted(false);
  };

  // --- Camera ---
  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    const granted = status === "granted";
    await AsyncStorage.setItem("cameraEnabled", granted ? "true" : "false");
    setCameraGranted(granted);
    return granted;
  };


  const revokeCameraPermission = async () => {
    await AsyncStorage.setItem("cameraEnabled", "false");
    setCameraGranted(false);
  };

  // --- Photos ---
  const requestPhotosPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const granted = status === "granted";
    await AsyncStorage.setItem("photosEnabled", granted ? "true" : "false");
    setPhotosGranted(granted);
    return granted;
  };

  const revokePhotosPermission = async () => {
    await AsyncStorage.setItem("photosEnabled", "false");
    setPhotosGranted(false);
  };

  return (
    <PermissionContext.Provider
      value={{
        locationGranted,
        cameraGranted,
        photosGranted,
        setCameraGranted,
        requestLocationPermission,
        revokeLocationPermission,
        requestCameraPermission,
        requestPhotosPermission,
        revokeCameraPermission,
        revokePhotosPermission,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};
