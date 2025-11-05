import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Settings } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from "expo-image-picker";
import Entypo from '@expo/vector-icons/Entypo';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import BottomNav from "../components/Navigation";
import { PermissionContext } from "../components/PermissionManager";
import { useIsFocused } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import CustomButton from '../components/Button';

//noti start
import { addNotification } from "../firebase/notification_user/addNotification";
import { auth } from "../firebase/FirebaseConfig";
import { showMessage } from "react-native-flash-message";
const currentUserId = auth.currentUser?.uid || "U001";
//noti end

export default function IdentifyPage() {
    const [permission, requestPermission] = useCameraPermissions();
    const [images, setImages] = useState([]);
    const cameraRef = useRef(null);
    const navigation = useNavigation();
    const route = useRoute();
    const { mode } = route.params || { mode: "single" }; // default single
    const [facing, setFacing] = useState("back");
    //prediction variable
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const { cameraGranted, photosGranted, requestCameraPermission, requestPhotosPermission, } = useContext(PermissionContext);
    const [permissionChecked, setPermissionChecked] = useState(false);
    const isFocused = useIsFocused();

    //Reset images when switching modes
    useEffect(() => {
        setImages([]);
    }, [mode]);

    // Camera & photo permissions in Settings
    useEffect(() => {
        if (!isFocused) return;
        (async () => {
            const camStatus = await Camera.getCameraPermissionsAsync();
            if (camStatus.status !== 'granted') {
                Alert.alert(
                    "Camera Access Required",
                    "Please enable camera access in device settings.",
                    [
                        {
                            text: "OK",
                            onPress: () => navigation.navigate("Setting"), // 👈 Only navigates when OK is pressed
                        },
                    ],
                    { cancelable: false } // optional: prevent dismissing by tapping outside
                );
                setPermissionChecked(false);
            } else {
                setPermissionChecked(true);
            }

            // --- Photos ---
            const photoStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
            if (photoStatus.status !== 'granted') {
                Alert.alert(
                    "Photo Library Access Required",
                    "Please enable photo library access in device settings."
                );
                setPermissionChecked(false);
            } else {
                setPermissionChecked(true);
            }
        })();
    }, [isFocused, cameraGranted, photosGranted]);

    useEffect(() => {
        if (!isFocused) return;

        if (cameraGranted === false && photosGranted === false) {
            Alert.alert(
                "Camera and Photo Library Disabled",
                "Camera and photo library permission are turned off. Please enable them in Settings."
            );
        } else if (cameraGranted === false) {
            Alert.alert(
                "Camera Disabled",
                "Camera permission is turned off. Please enable it in Settings to use this feature."
            );
        } else if (photosGranted === false) {
            Alert.alert(
                "Photo Library Disabled",
                "Photo library permission is turned off. Please enable it in Settings to upload images."
            );
        }
    }, [cameraGranted, photosGranted, isFocused]);

    const toggleCameraFacing = () => {
        setFacing((current) => (current === "back" ? "front" : "back"));
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const data = await cameraRef.current.takePictureAsync();
                if (mode === "single") {
                    setImages([data.uri]); // replace
                } else {

                    if (images.length >= 3) {
                        alert("Maximum 3 images allowed!");
                        return images;
                    }


                    setImages((prev) => [...prev, data.uri]); // append
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
        const granted = status === "granted";

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled) {
            const newUri = result.assets[0].uri;
            setImages((prev) => {
                if (prev.length >= 3) {
                    alert("Maximum 3 images allowed!");
                    return prev;
                }
                return [...prev, newUri];
            });
        }
    };

    const removeImage = (uri) => {
        setImages((prev) => prev.filter((img) => img !== uri));
    };


    //prediction 
    const identifyImage = async () => {
        if (images.length === 0) {
            alert("Please capture or pick an image first");
            return;
        }

        // let formData = new FormData();
        // formData.append("image", {
        //     uri: images[0],   // single mode
        //     type: "image/jpeg",
        //     name: "photo.jpg",
        // });
        const formData = new FormData();

        if (images.length === 1) {
            // Single image mode
            formData.append("image", {
                uri: images[0],
                type: "image/jpeg",
                name: "photo.jpg",
            });
        } else if (images.length === 3) {
            // Multi-image mode (3 images)
            images.forEach((imgURI, index) => {
                formData.append("images", {
                    uri: imgURI,
                    type: "image/jpeg",
                    name: `photo_${index + 1}.jpg`,
                });
            });
        }

        try {
            setLoading(true);
            const endpoint =
                images.length === 3
                    ? "http://172.17.18.149:3000/predict_multiple"
                    : "http://172.17.18.149:3000/predict";

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "multipart/form-data" },
                body: formData,})

            const data = await response.json();
            setLoading(false);

            // ===== noti start (REPLACE WHOLE BLOCK) =====
            const label = data?.label ?? (typeof data?.raw === "string" ? data.raw : "Unknown");
            const conf = data?.confidence ?? null;

            // normalize to top1~top3 array for identify_output
            const prediction =
                Array.isArray(data)
                    ? data
                    : Array.isArray(data?.top3) && data.top3.length
                        ? data.top3.map(x => ({
                            class: x.class || x.label || label || "Unknown",
                            confidence: typeof x.confidence === "number" ? x.confidence : (typeof conf === "number" ? conf : 0),
                        }))
                        : [{ class: label || "Unknown", confidence: typeof conf === "number" ? conf : 0 }];

            while (prediction.length < 3) {
                prediction.push({ class: prediction[0].class, confidence: prediction[0].confidence ?? 0 });
            }

            const top1 = prediction[0] || { class: "Unknown", confidence: 0 };
            if (!auth.currentUser?.uid) console.warn("No signed-in user, using fallback U001 for test.");

            // create the notification and CAPTURE its id
            const notiId = await addNotification({
                userId: auth.currentUser?.uid || "U001",
                type: "plant_identified",
                title: "Plant Identification Complete",
                message: `${top1.class} (${Math.round((top1.confidence || 0) * 100)}%)`,
                payload: {
                    model_predictions: {
                        top_1: { plant_species: prediction[0]?.class ?? "Unknown", ai_score: prediction[0]?.confidence ?? 0 },
                        top_2: { plant_species: prediction[1]?.class ?? "", ai_score: prediction[1]?.confidence ?? 0 },
                        top_3: { plant_species: prediction[2]?.class ?? "", ai_score: prediction[2]?.confidence ?? 0 },
                    }
                    // imageURL will be added later by identify_output after upload
                }
            });
            
            showMessage({
                message: "Plant Identification Complete",
                description: `${top1.class} (${Math.round((top1.confidence || 0) * 100)}%)`,
                type: "success",
                duration: 3000,
                onPress: () => navigation.navigate("NotificationUser"),
            });

            // pass notiId so identify_output can update the same notification with imageURL after upload
            navigation.navigate("IdentifyOutput", {
                prediction,
                imageURI: images,         // local preview
                notiId,                      // 👈 IMPORTANT
                fromNotification: false,
                hasImage: true               // you currently have a local image selected
            });
            return;
            // ===== noti end =====
        } catch (err) {
            console.log("Upload error:", err);
            alert("Failed to identify. Check backend connection.");
        }
    };

    return (

        <SafeAreaView style={styles.container}>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#00ff3cff" />
                    <Text style={{ color: "white", marginTop: 10 }}>Identifying...</Text>
                </View>
            )}

            {/* Camera */}
            {images.length === 0 || mode === "multiple" ? (
                <CameraView style={styles.camera} ref={cameraRef} facing={facing}>
                    <View style={{flex:1}}>
                        <View style={styles.overlay} pointerEvents="box-none">
                            <View style={styles.topBar}>
                                <TouchableOpacity onPress={() => navigation.goBack()}>
                                    <Entypo name="cross" size={48} color="white" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={toggleCameraFacing}>
                                    <Entypo name="cycle" size={36} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                        {/* Multiple mode preview row */}
                        {mode === "multiple" && images.length > 0 && (

                            <ScrollView horizontal contentContainerStyle={styles.previewRow}>
                                {images.map((uri, index) => (
                                    <View key={index} style={styles.card}>
                                        <Image source={{ uri }} style={styles.image} />
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => removeImage(uri)}
                                        >
                                            <Text style={{ color: "white", fontWeight: "bold" }}>×</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>

                        )}
                        {/* Mode buttons */}
                        <View style={styles.topRow}>
                            <TouchableOpacity
                                style={[styles.smallButton, mode === "single" ? styles.active : styles.inactive]}
                                onPress={() => navigation.navigate("IdentifyPage", { mode: "single" })}
                            >
                                <Text style={{ fontWeight: '900', color: mode === "single" ? "black" : "white" }}>Identify</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.smallButton, mode === "multiple" ? styles.active : styles.inactive]}
                                onPress={() => navigation.navigate("IdentifyPage", { mode: "multiple" })}
                            >
                                <Text style={{ fontWeight: '900', color: mode === "multiple" ? "black" : "white" }}>Multiple</Text>
                            </TouchableOpacity>
                        </View>


                        {/* Bottom controls */}
                        {images.length === 3 ? (
                            <View style={styles.bottomRow}>
                                <CustomButton title={'Identify'} icon="check" onPress={identifyImage} />
                            </View>
                        ) : (
                            <View style={styles.bottomRow}>
                                <TouchableOpacity onPress={pickImage} disabled={!photosGranted} style={{ opacity: photosGranted ? 1 : 0.5 }}>
                                    <Ionicons name="images-outline" size={54} color='white' />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.CaptureButton} onPress={takePicture} disabled={!cameraGranted} />
                                <TouchableOpacity onPress={() => navigation.navigate("IdentifyTips")}>
                                    <MaterialIcons name="info-outline" size={54} color='white' />
                                </TouchableOpacity>
                            </View>
                        )}

                    </View>
                </CameraView>
            ) : (
                // Single image preview mode
                <ImageBackground source={{ uri: images[0] }} style={styles.camera} imageStyle={[styles.previewImage, facing === "front" ? { transform: [{ scaleX: -1 }] } : null,]}>
                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <View style={styles.bottomRow}>
                            <CustomButton title={'Retake'} icon="retweet" onPress={() => setImages([])} />
                            <CustomButton title={'Identify'} icon="check" onPress={identifyImage} />
                        </View>
                    </View>
                </ImageBackground>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    loadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1000,
    },

    container: {
        flex: 1,
        backgroundColor: '#000'
    },
    Box: {
        backgroundColor: '#000'
    },
    camera: {
        flex: 1,
        width: '100%',
        height: '100%'

    },
    previewImage: {
        resizeMode: 'contain', // keeps aspect ratio 
        width: '100%',
        height: '100%',
    },
    topBar: {
        position: 'absolute',
        top: 40,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    smallButton: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 12
    },
    active: {
        backgroundColor: 'white'
    },
    inactive: {
        backgroundColor: 'transparent'
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginBottom: 20
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginBottom: 20
    },
    CaptureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#B3B3B3',
        borderWidth: 10,
        borderColor: '#D9D9D9',
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    card: {
        position: "relative",
        marginLeft: 10,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    deleteButton: {
        position: "absolute",
        top: 5,
        right: 5,
        backgroundColor: "rgba(0,0,0,0.6)",
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    previewRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    identifyButton: {
        backgroundColor: 'green',
        width: "65%",
        paddingHorizontal: 18,
        paddingVertical: 16,
        borderRadius: 12
    },
});
