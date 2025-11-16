import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import {
  StyleSheet,
  TextInput,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRoute } from "@react-navigation/native";
import mapStyle from "../../assets/mapStyle.json";
import { db, auth } from "../firebase/FirebaseConfig.js";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  doc,
  runTransaction,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PermissionContext } from "../components/PermissionManager";
import { TOP_PAD } from "../components/StatusBarManager";

const { width, height } = Dimensions.get("window");

const MapPage = ({ navigation }) => {
  const route = useRoute();
  const me = auth.currentUser;
  const myId = me?.uid ?? "anon";

  const [searchText, setSearchText] = useState("");
  const [selectedFilters, setSelectedFilters] = useState(["All"]);

  const [selectedMarker, setSelectedMarker] = useState(null);
  const selectedMarkerRef = useRef(selectedMarker);
  const [userLocation, setUserLocation] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { locationGranted } = useContext(PermissionContext);
  const [likeInFlight, setLikeInFlight] = useState(false);

  // temporary focus pin when navigating from detail pages
  const [focusPin, setFocusPin] = useState(null);

  // remember which specific marker we already auto-focused (from focusMarkerId)
  const focusMarkerIdRef = useRef(route.params?.focusMarkerId || null);
  const [hasAutoFocusedMarker, setHasAutoFocusedMarker] = useState(false);

  useEffect(() => {
    selectedMarkerRef.current = selectedMarker;
  }, [selectedMarker]);

  const mapRef = useRef(null);
  const bottomSheetHeight = useRef(new Animated.Value(100)).current;
  const currentHeightRef = useRef(100);

  const KUCHING_REGION = {
    latitude: 1.5495,
    longitude: 110.3632,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // center camera if route passes a "focus" param (from PlantDetailUser or PlantManagementDetail)
  useEffect(() => {
    const f = route.params?.focus;
    if (f?.latitude != null && f?.longitude != null) {
      const region = {
        latitude: Number(f.latitude),
        longitude: Number(f.longitude),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current?.animateToRegion(region, 1000);
      setFocusPin({
        coordinate: { latitude: region.latitude, longitude: region.longitude },
        title: f.title || "Plant",
      });
    }
  }, [route.params?.focus]);

  // distance (km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const getLatestMarkers = (markersList, count = 3) => {
    const sorted = markersList.sort(
      (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
    );
    const latest = sorted.slice(0, count);

    if (!userLocation) {
      return latest;
    }
    return latest.map((marker) => ({
      ...marker,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        marker.coordinate.latitude,
        marker.coordinate.longitude
      ),
    }));
  };

  const getLatestInArea = (markersList, radius = 50) => {
    if (!userLocation) {
      const sorted = markersList.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );
      return sorted.map((m) => ({ ...m, distance: null }));
    }

    const markersInArea = markersList
      .map((marker) => ({
        ...marker,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          marker.coordinate.latitude,
          marker.coordinate.longitude
        ),
      }))
      .filter((marker) => marker.distance <= radius);

    const sorted = markersInArea.sort(
      (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
    );

    return sorted;
  };

  const handleTabPress = useCallback((tab) => {
    setSelectedFilters((prev) => {
      if (tab === "All") {
        return ["All"];
      }

      let newFilters = prev.includes("All") ? [] : [...prev];

      const index = newFilters.indexOf(tab);
      if (index > -1) {
        newFilters.splice(index, 1);
      } else {
        newFilters.push(tab);
      }

      if (newFilters.length === 0) {
        return ["All"];
      }

      return newFilters;
    });
  }, []);

  const formatTime = (timeData) => {
    if (!timeData) return "Unknown time";
    try {
      if (timeData.seconds && timeData.nanoseconds) {
        const date = new Date(timeData.seconds * 1000);
        const now = new Date();
        const diffInMs = now - date;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        if (diffInDays === 0) return "Today";
        if (diffInDays === 1) return "Yesterday";
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
        return date.toLocaleDateString();
      }
      if (typeof timeData === "string") return timeData;
      return "Unknown time";
    } catch {
      return "Unknown time";
    }
  };

  // MASTER PLANT LIST (taxonomy database)
  const [plantMaster, setPlantMaster] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "plant"), (snap) => {
      const arr = snap.docs.map((d) => ({
        id: d.id, // Example: Burmannia_Longifolia
        ...d.data(),
      }));
      setPlantMaster(arr);
    });
    return () => unsub();
  }, []);

  const fixMarkerData = (docSnap, source) => {
    const data = docSnap.data();

    // Only verified & visible plants should appear
    if (source === "plant_identify") {
      if (data.identify_status !== "verified" || data.visible === false) {
        return null;
      }
    }

    // Skip missing coordinates
    if (
      !data.coordinate ||
      data.coordinate.latitude == null ||
      data.coordinate.longitude == null
    ) {
      return null;
    }

    const latitude =
      typeof data.coordinate.latitude === "string"
        ? parseFloat(data.coordinate.latitude)
        : data.coordinate.latitude;
    const longitude =
      typeof data.coordinate.longitude === "string"
        ? parseFloat(data.coordinate.longitude)
        : data.coordinate.longitude;

    if (isNaN(latitude) || isNaN(longitude)) {
      return null;
    }

    if (source === "plant_identify") {
      const top = data.model_predictions?.top_1;
      const predicted = top?.plant_species || "Unknown";

      // taxonomy id likely "Burmannia_Longifolia"
      const formattedName = predicted.replace(/\s+/g, "_");
      const taxonomyMatch = plantMaster.find(
        (p) => p.id.toLowerCase() === formattedName.toLowerCase()
      );

      const createdAt = data.createdAt || null;
      const timeMs = createdAt?.toMillis
        ? createdAt.toMillis()
        : createdAt?.seconds
        ? createdAt.seconds * 1000
        : null;
      const timeLabel = formatTime(createdAt);

      // build imageURIs array for PlantDetailUser slideshow
      const imageURIs =
        Array.isArray(data.ImageURLs) && data.ImageURLs.length > 0
          ? data.ImageURLs
          : data.ImageURL
          ? [data.ImageURL]
          : [];

      // build prediction array like other screens
      const prediction = [];
      if (data.model_predictions) {
        if (data.model_predictions.top_1)
          prediction.push(data.model_predictions.top_1);
        if (data.model_predictions.top_2)
          prediction.push(data.model_predictions.top_2);
        if (data.model_predictions.top_3)
          prediction.push(data.model_predictions.top_3);
      }

      return {
        // 🔑 Firestore doc id (for comments in PlantDetailUser)
        id: docSnap.id,
        source,

        // For map & bottom sheet
        title: predicted,
        type: "Plant",
        identify_status: data.identify_status,
        coordinate: { latitude, longitude },
        identifiedBy: data.author_name || "Unknown",
        time: timeMs, // used by PlantDetailUser (Date Identified)
        timeLabel, // used by map UI ("Today", "2 days ago")

        image:
          imageURIs[0] ||
          taxonomyMatch?.plant_image ||
          "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
        imageURIs, // PlantDetailUser will use this

        description: top
          ? `Top prediction: ${predicted} (${Math.round(
              (top.ai_score || 0) * 100
            )}% confidence)`
          : "No description available",

        // Extra data so PlantDetailUser can render correctly
        author: data.author_name || "User",
        model_predictions: data.model_predictions || null,
        manual_scientific_name: data.manual_scientific_name || null,
        prediction,
        createdAt,
        locality: data.locality || null,

        // Category for filters + detail pill
        conservation_status: taxonomyMatch?.conservation_status || "common",

        like_count: data.like_count || 0,
        liked_by: data.liked_by || [],
      };
    }

    return null;
  };

  const fetchMarkers = async () => {
    try {
      setLoading(true);
      const markersCollection = collection(db, "plant_identify");
      const markerSnapshot = await getDocs(markersCollection);
      const markersList = markerSnapshot.docs
        .map((d) => fixMarkerData(d, "plant_identify"))
        .filter(Boolean);
      setMarkers(markersList);
    } catch (error) {
      console.error("❌ 获取markers错误:", error);
      Alert.alert("错误", `无法加载植物数据: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListener = () => {
    const collectionsToFetch = ["plant_identify"];
    const unsubscribes = collectionsToFetch.map((collectionName) => {
      const q = query(collection(db, collectionName));
      return onSnapshot(
        q,
        (snapshot) => {
          const newMarkers = snapshot.docs
            .map((docSnap) => fixMarkerData(docSnap, collectionName))
            .filter(Boolean);
          setMarkers((prev) => {
            const otherMarkers = prev.filter(
              (m) => m.source !== collectionName
            );
            return [...otherMarkers, ...newMarkers];
          });
          setLoading(false);
        },
        (error) => {
          console.error(`Error fetching from ${collectionName}:`, error);
          setLoading(false);
        }
      );
    });

    return () => unsubscribes.forEach((unsub) => unsub());
  };

  useEffect(() => {
    const unsubscribe = setupRealtimeListener();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadLocation = async () => {
      if (locationGranted) {
        try {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        } catch (error) {
          Alert.alert("Error", "Unable to fetch location.");
        }
      } else {
        setUserLocation(null);
      }
    };
    loadLocation();
  }, [locationGranted]);

  const filteredMarkersForMap = useMemo(() => {
    const searchedMarkers =
      searchText.trim() === ""
        ? markers
        : markers.filter((marker) => {
            const term = searchText.toLowerCase();
            return (
              (marker.title && marker.title.toLowerCase().includes(term)) ||
              (marker.description &&
                marker.description.toLowerCase().includes(term)) ||
              (marker.identifiedBy &&
                marker.identifiedBy.toLowerCase().includes(term))
            );
          });

    if (selectedFilters.includes("All")) {
      return searchedMarkers;
    }

    return searchedMarkers.filter((marker) => {
      return selectedFilters.every((filter) => {
        const lowerCaseFilter = filter.toLowerCase();

        // verified
        if (lowerCaseFilter === "verified") {
          return marker.identify_status === "verified";
        }

        // common / rare / endangered
        if (["common", "rare", "endangered"].includes(lowerCaseFilter)) {
          const cs = (marker.conservation_status || "").toLowerCase();
          return cs === lowerCaseFilter;
        }

        // type (e.g. Plant)
        if (marker.type) {
          return marker.type.toLowerCase() === lowerCaseFilter;
        }

        return false;
      });
    });
  }, [markers, selectedFilters, searchText]);

  const markersForBottomSheet = useMemo(() => {
    return getLatestInArea(filteredMarkersForMap);
  }, [filteredMarkersForMap, userLocation]);

  const focusOnUserLocation = useCallback(() => {
    if (userLocation) {
      mapRef.current?.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  }, [userLocation]);

  const closeMarkerDetail = useCallback(() => {
    setSelectedMarker(null);
    Animated.spring(bottomSheetHeight, {
      toValue: 100,
      useNativeDriver: false,
    }).start(() => {
      currentHeightRef.current = 100;
    });
  }, [bottomSheetHeight]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          currentHeightRef.current = bottomSheetHeight._value;
        },
        onPanResponderMove: (evt, gestureState) => {
          const minHeight = 100;
          const maxHeight = selectedMarkerRef.current ? height * 0.45 : 320;
          const newHeight = Math.max(
            minHeight,
            Math.min(maxHeight, currentHeightRef.current - gestureState.dy)
          );
          bottomSheetHeight.setValue(newHeight);
        },
        onPanResponderRelease: (evt, gestureState) => {
          const currentHeightValue = bottomSheetHeight._value;
          const openHeight = selectedMarkerRef.current ? height * 0.45 : 320;
          const closedHeight = 100;

          let targetHeight;
          if (gestureState.vy > 0.5) {
            targetHeight = closedHeight; // flick down
          } else if (gestureState.vy < -0.5) {
            targetHeight = openHeight; // flick up
          } else {
            const halfway = (openHeight + closedHeight) / 2;
            targetHeight = currentHeightValue < halfway ? closedHeight : openHeight;
          }

          if (targetHeight === closedHeight && selectedMarkerRef.current) {
            setSelectedMarker(null);
          }

          Animated.spring(bottomSheetHeight, {
            toValue: targetHeight,
            useNativeDriver: false,
          }).start(() => {
            currentHeightRef.current = targetHeight;
          });
        },
      }),
    []
  );

  const handleMarkerPress = useCallback((marker) => {
    setSelectedMarker(marker);

    Animated.spring(bottomSheetHeight, {
      toValue: height * 0.45,
      useNativeDriver: false,
    }).start(() => {
      currentHeightRef.current = height * 0.45;
    });

    mapRef.current?.animateToRegion(
      {
        latitude: marker.coordinate.latitude,
        longitude: marker.coordinate.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      800
    );
  }, []);

  // ✅ NEW: when coming from "View on Map" with focusMarkerId, auto-open that marker
  useEffect(() => {
    const focusId = focusMarkerIdRef.current;
    if (!focusId || hasAutoFocusedMarker || !markers.length) return;

    const marker = markers.find((m) => m.id === focusId);
    if (!marker) return;

    handleMarkerPress(marker);
    setHasAutoFocusedMarker(true);
  }, [markers, hasAutoFocusedMarker, handleMarkerPress]);

  const renderBottomSheet = () => {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [showMenu, setShowMenu] = useState(false);
    const menuButtonRef = useRef(null);
    const [menuPosition, setMenuPosition] = useState(null);

    useEffect(() => {
      if (selectedMarker) {
        setIsLiked((selectedMarker.liked_by || []).includes(myId));
        setLikeCount(selectedMarker.like_count || 0);
      }
    }, [selectedMarker]);

    const toggleLike = async () => {
      if (likeInFlight || !selectedMarker) return;

      const source = selectedMarker.source || "plant_identify";
      const docId = selectedMarker.id;
      if (!docId) {
        Alert.alert("Cannot like this item.");
        return;
      }
      const postRef = doc(db, source, docId);

      setLikeInFlight(true);

      const optimisticNext = !isLiked;
      setIsLiked(optimisticNext);
      setLikeCount((c) => (optimisticNext ? c + 1 : c - 1));

      try {
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(postRef);
          if (!snap.exists()) throw new Error("Post does not exist");

          const currentLikedBy = snap.data().liked_by || [];
          const alreadyLiked = currentLikedBy.includes(myId);

          if (optimisticNext && !alreadyLiked) {
            tx.update(postRef, {
              liked_by: arrayUnion(myId),
              like_count: increment(1),
            });
          } else if (!optimisticNext && alreadyLiked) {
            tx.update(postRef, {
              liked_by: arrayRemove(myId),
              like_count: increment(-1),
            });
          }
        });
      } catch (e) {
        setIsLiked(!optimisticNext);
        setLikeCount((c) => (optimisticNext ? c - 1 : c + 1));
        console.error("Failed to toggle like:", e);
        Alert.alert("Error", "Could not update like status.");
      } finally {
        setLikeInFlight(false);
      }
    };

    const handleMenuPress = () => {
      if (showMenu) {
        setShowMenu(false);
        return;
      }
      if (menuButtonRef.current) {
        menuButtonRef.current.measureInWindow((x, y, w, h) => {
          const menuHeight = 130;
          setMenuPosition({
            top: y - menuHeight,
            right: width - (x + w),
          });
          setShowMenu(true);
        });
      }
    };

    const handleCloseMenu = () => setShowMenu(false);

    const handleMenuAction = (action) => {
      setShowMenu(false);

      switch (action) {
        case "more":
          if (selectedMarker) {
            // pass full post object to PlantDetailUser
            navigation.navigate("PlantDetailUser", {
              post: selectedMarker,
            });
          }
          break;

        case "report":
          if (selectedMarker) {
            navigation.navigate("ReportError", {
              post: selectedMarker,
            });
          } else {
            navigation.navigate("ReportError");
          }
          break;

        case "save":
          navigation.navigate("Saved");
          break;

        default:
          break;
      }
    };

    return (
      <Animated.View
        style={[styles.bottomSheet, { height: bottomSheetHeight }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.bottomSheetHandle} />
        <View style={styles.bottomSheetContent}>
          {selectedMarker ? (
            <ScrollView
              style={styles.detailScrollView}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.markerDetail}>
                <View style={styles.markerDetailHeader}>
                  <TouchableOpacity
                    onPress={closeMarkerDetail}
                    style={styles.backButton}
                  >
                    <Ionicons name="chevron-back" size={28} color="#333" />
                  </TouchableOpacity>
                  <Text style={styles.markerDetailTitle}>
                    {selectedMarker.title}
                  </Text>
                  <View style={{ width: 28 }} />
                </View>
                <View style={styles.identifiedBy}>
                  <Text style={styles.identifiedText}>
                    Identified by {selectedMarker.identifiedBy}
                  </Text>
                  <Text style={styles.timeText}>
                    {selectedMarker.timeLabel}
                  </Text>
                </View>
                <Image
                  source={{ uri: selectedMarker.image }}
                  style={styles.markerImage}
                  resizeMode="cover"
                />
                <Text style={styles.descriptionText}>
                  {selectedMarker.description}
                </Text>
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.likeButton}
                    onPress={toggleLike}
                    disabled={likeInFlight}
                  >
                    <Ionicons
                      name={isLiked ? "heart" : "heart-outline"}
                      size={24}
                      color={isLiked ? "#FF3B30" : "#666"}
                    />
                    <Text style={styles.likeCount}>{likeCount}</Text>
                  </TouchableOpacity>
                  <View style={styles.menuContainer}>
                    <TouchableOpacity
                      ref={menuButtonRef}
                      style={styles.menuButton}
                      onPress={handleMenuPress}
                    >
                      <Ionicons
                        name="ellipsis-vertical"
                        size={20}
                        color="#666"
                      />
                    </TouchableOpacity>
                    <Modal
                      transparent
                      visible={showMenu}
                      onRequestClose={handleCloseMenu}
                      animationType="fade"
                    >
                      <Pressable
                        style={styles.modalBackdrop}
                        onPress={handleCloseMenu}
                      >
                        {menuPosition && (
                          <Pressable
                            style={[
                              styles.menuOverlay,
                              {
                                top: menuPosition.top,
                                right: menuPosition.right,
                              },
                            ]}
                          >
                            <TouchableOpacity
                              style={styles.menuItem}
                              onPress={() => handleMenuAction("more")}
                            >
                              <Ionicons
                                name="information-circle"
                                size={18}
                                color="#666"
                              />
                              <Text style={styles.menuText}>More details</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.menuItem}
                              onPress={() => handleMenuAction("report")}
                            >
                              <Ionicons name="flag" size={18} color="#666" />
                              <Text style={styles.menuText}>Report</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.menuItem}
                              onPress={() => handleMenuAction("save")}
                            >
                              <Ionicons
                                name="bookmark"
                                size={18}
                                color="#666"
                              />
                              <Text style={styles.menuText}>Saved</Text>
                            </TouchableOpacity>
                          </Pressable>
                        )}
                      </Pressable>
                    </Modal>
                  </View>
                </View>
              </View>
            </ScrollView>
          ) : (
            <>
              <Text style={styles.sectionTitle}>
                {!selectedFilters.includes("All")
                  ? `Latest ${selectedFilters.join(", ")}`
                  : "Latest in the area"}
              </Text>
              {loading ? (
                <Text style={styles.loadingText}>Loading plants...</Text>
              ) : markersForBottomSheet.length === 0 ? (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>
                    {!selectedFilters.includes("All")
                      ? `No ${selectedFilters
                          .join(", ")
                          .toLowerCase()} nearby`
                      : "No plants nearby"}
                  </Text>
                  <Text style={styles.noDataSubtext}>
                    {!selectedFilters.includes("All")
                      ? "Try exploring other areas"
                      : "Move around to discover plants"}
                  </Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.latestContainer}
                >
                  {markersForBottomSheet.map((marker, index) => (
                    <TouchableOpacity
                      key={marker.id}
                      style={styles.latestItem}
                      onPress={() => handleMarkerPress(marker)}
                    >
                      <Image
                        source={{ uri: marker.image }}
                        style={styles.latestImage}
                      />
                      <View style={styles.latestTextContainer}>
                        <Text style={styles.latestTitle}>{marker.title}</Text>
                        <Text style={styles.latestInfo}>
                          {marker.distance
                            ? `${marker.distance.toFixed(1)} km away`
                            : "Calculating distance..."}
                        </Text>
                        <Text style={styles.latestSubInfo}>
                          Identified by {marker.identifiedBy} •{" "}
                          {marker.timeLabel}
                        </Text>
                      </View>
                      {index === 0 && (
                        <View style={styles.closestBadge}>
                          <Text style={styles.closestBadgeText}>Latest</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          )}
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate("HomepageUser")}
          >
            <Ionicons name="home" size={24} color="#4285F4" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={focusOnUserLocation}
          >
            <Ionicons name="locate" size={24} color="#4285F4" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={KUCHING_REGION}
        showsUserLocation={locationGranted}
        showsMyLocationButton={false}
        showsCompass={true}
        customMapStyle={mapStyle}
        onPress={(e) => {
          if (!e?.nativeEvent?.action) {
            closeMarkerDetail();
          }
        }}
        scrollEnabled={!selectedMarker}
      >
        {/* markers with images */}
        {filteredMarkersForMap.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            onPress={() => handleMarkerPress(marker)}
          >
            <View style={styles.mapMarkerContainer}>
              <Image
                source={{ uri: marker.image }}
                style={styles.mapMarkerImage}
              />
            </View>
          </Marker>
        ))}

        {/* temporary focus pin when coming from detail pages */}
        {focusPin && (
          <Marker coordinate={focusPin.coordinate} title={focusPin.title} />
        )}

        {userLocation && (
          <Circle
            center={userLocation}
            radius={500}
            fillColor="rgba(66, 133, 244, 0.2)"
            strokeColor="rgba(66, 133, 244, 0.5)"
          />
        )}
      </MapView>

      {/* Search + tabs */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search here"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabContainer}
        >
          {["All", "Verified", "Plant", "Common", "Rare", "Endangered"].map(
            (tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  selectedFilters.includes(tab) && styles.selectedTab,
                ]}
                onPress={() => handleTabPress(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedFilters.includes(tab) && styles.selectedTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>
      </View>

      {renderBottomSheet()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
  searchContainer: { position: "absolute", top: TOP_PAD, left: 20, right: 20 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  tabContainer: { marginTop: 15, maxHeight: 40 },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  selectedTab: { backgroundColor: "#4CAF50" },
  tabText: { color: "#666", fontWeight: "500" },
  selectedTabText: { color: "white" },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  bottomSheetContent: { flex: 1 },
  detailScrollView: { flex: 1 },
  bottomSheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 15,
  },
  latestContainer: { paddingBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  latestItem: {
    width: 150,
    marginRight: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 10,
  },
  latestImage: { width: "100%", height: 100, borderRadius: 8, marginBottom: 8 },
  latestTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  latestInfo: { fontSize: 12, color: "#666" },
  mapMarkerContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  mapMarkerImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  markerDetail: { flex: 1, paddingBottom: 20 },
  markerDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  backButton: { padding: 5 },
  markerDetailTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  identifiedBy: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  identifiedText: { fontSize: 14, color: "#495057" },
  timeText: { color: "#666" },
  markerImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  descriptionText: { fontSize: 16, lineHeight: 22, color: "#555" },
  buttonsContainer: {
    position: "absolute",
    right: 20,
    top: -130,
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  homeButton: {
    backgroundColor: "white",
    borderRadius: 30,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  locationButton: {
    backgroundColor: "white",
    borderRadius: 30,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingTop: "5",
  },
  likeCount: { fontSize: 14, color: "#666", fontWeight: "500" },
  menuContainer: {},
  menuButton: { padding: 5 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  menuOverlay: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 150,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  menuText: { fontSize: 14, color: "#333" },
  noDataContainer: { alignItems: "center", padding: 20 },
  noDataText: { fontSize: 16, color: "#666", marginBottom: 8 },
  noDataSubtext: { fontSize: 14, color: "#999", marginBottom: 16 },
  loadingText: { textAlign: "center", color: "#666", marginTop: 20 },
  latestSubInfo: { fontSize: 10, color: "#888", marginTop: 2 },
  closestBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  closestBadgeText: { color: "white", fontSize: 10, fontWeight: "bold" },
});

export default MapPage;
