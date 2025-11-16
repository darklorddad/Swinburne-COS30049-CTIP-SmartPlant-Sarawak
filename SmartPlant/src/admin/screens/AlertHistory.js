import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import { collection, getDocs, orderBy, query, doc, deleteDoc } from "firebase/firestore";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { db } from "../../firebase/FirebaseConfig";

const AlertHistoryScreen = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const historyRef = collection(db, "alerts", "history", "history");
      const q = query(historyRef, orderBy("timestamp", "desc"));
      const snap = await getDocs(q);

      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAlerts(list);
    } catch (error) {
      console.log("Error loading alerts:", error);
    }

    setLoading(false);
  };

  const deleteAlert = async (id) => {
    try {
      const ref = doc(db, "alerts", "history", "history", id);
      await deleteDoc(ref);
      setAlerts(alerts.filter((a) => a.id !== id));
    } catch (error) {
      console.log("Delete error:", error);
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts?.seconds) return "Unknown";
    return new Date(ts.seconds * 1000).toLocaleString();
  };

  const visibleAlerts =
    filter === "all" ? alerts : alerts.filter((a) => a.type === filter);

  const filterOptions = ["all", "rain", "soil", "noisy", "motion", "object", "moved"];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#578C5B" />
        <Text>Loading alerts...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Alert History</Text>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filterOptions.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterButton,
              filter === f && styles.filterButtonActive
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive
              ]}
            >
              {f.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Alert Cards */}
      {visibleAlerts.map((alert) => (
        <Swipeable
          key={alert.id}
          renderRightActions={() => (
            <TouchableOpacity
              style={styles.deleteBox}
              onPress={() => deleteAlert(alert.id)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          )}
        >
          <View style={styles.card}>
            <Text style={styles.type}>🚨 {alert.type?.toUpperCase()}</Text>
            <Text style={styles.message}>{alert.message}</Text>
            <Text style={styles.timestamp}>🕒 {formatTimestamp(alert.timestamp)}</Text>
            <Text style={styles.status}>
              Status: {alert.status === "unread" ? "🔴 Unread" : "🟢 Read"}
            </Text>

            {alert.latitude && (
              <Text style={styles.location}>
                📍 {alert.latitude}, {alert.longitude}
              </Text>
            )}
          </View>
        </Swipeable>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#FFFBF5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 14, color: "#3C3633" },

  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 14,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#E5E5E5",
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: "#3C3633",
  },
  filterText: {
    color: "#444",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "white",
  },

  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  type: { fontSize: 18, fontWeight: "bold", color: "#b91c1c" },
  message: { fontSize: 15, marginTop: 6 },
  timestamp: { fontSize: 13, marginTop: 4, color: "#6b7280" },
  status: { fontSize: 14, marginTop: 6, color: "#374151" },
  location: { marginTop: 6, color: "#4b5563" },

  deleteBox: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    borderRadius: 10,
  },
  deleteText: { color: "white", fontWeight: "bold" },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AlertHistoryScreen;
