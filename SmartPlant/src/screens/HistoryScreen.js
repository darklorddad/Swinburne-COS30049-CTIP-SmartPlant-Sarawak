import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

import { LineChart } from "react-native-chart-kit";
import { Picker } from "@react-native-picker/picker";

import * as ScreenOrientation from "expo-screen-orientation";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { db } from "../firebase/FirebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

import useHistorySeries from "../hooks/useHistorySeries";


// --- Clean values before charting ---
function safeValues(history, key) {
  if (!history || history.length === 0) return [0];

  const values = history.map((r) => {
    let val = r[key];

    if (typeof val === "string") val = parseFloat(val);
    if (typeof val === "boolean") val = val ? 1 : 0;
    if (!val || isNaN(val) || !isFinite(val)) return 0;

    return Number(val);
  });

  return values.length > 0 ? values : [0];
}



export default function HistoryScreen() {
  const history = useHistorySeries(50);
  const [selected, setSelected] = useState("temperature");

  const { width, height } = useWindowDimensions();
  const [orientation, setOrientation] = useState("PORTRAIT");


  // 📱 Detect orientation
  useEffect(() => {
    async function setupOrientation() {
      const o = await ScreenOrientation.getOrientationAsync();
      setOrientation(
        o === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
          o === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
          ? "LANDSCAPE"
          : "PORTRAIT"
      );
    }

    setupOrientation();

    const sub = ScreenOrientation.addOrientationChangeListener((event) => {
      const o = event.orientationInfo.orientation;

      setOrientation(
        o === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
          o === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
          ? "LANDSCAPE"
          : "PORTRAIT"
      );
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(sub);
    };
  }, []);


  const labels = history.map((_, i) => (i % 5 === 0 ? "•" : ""));
  const chartWidth = width - 32;
  const chartHeight =
    orientation === "LANDSCAPE" ? height * 0.7 : 250;


  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
    labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
    propsForDots: { r: "2" },
  };


  const labelsMap = {
    temperature: "Temperature (°C)",
    humidity: "Humidity (%)",
    soil: "Soil Moisture (%)",
    rainPercent: "Rain Drop (%)",
    motionCount: "Motion Count",
    soundEvents: "Sound Events",
    distance: "Distance (cm)",
  };



  // 🧹 Clear Firestore history after export
  async function clearHistory() {
    try {
      const snapshot = await getDocs(collection(db, "iotHistory"));
      const deletes = snapshot.docs.map((d) =>
        deleteDoc(doc(db, "iotHistory", d.id))
      );

      await Promise.all(deletes);
      alert("History cleared successfully.");
    } catch (err) {
      console.error("Error clearing history:", err);
      alert("Failed to clear history.");
    }
  }



  // 📤 Export CSV + Auto-delete
  async function exportCSV() {
    try {
      if (!history || history.length === 0) {
        alert("No history data available.");
        return;
      }

      const headers = [
        "timestamp",
        "temperature",
        "humidity",
        "soil",
        "soilCondition",
        "rainPercent",
        "rainCondition",
        "motionCount",
        "soundEvents",
        "soundLevel",
        "distance",
        "angle",
        "latitude",
        "longitude",
      ];

      const csvData = [];
      csvData.push(headers.join(",")); // header row

      history.forEach((row) => {
        const line = [
          row.timestamp || "",
          row.temperature || "",
          row.humidity || "",
          row.soil || "",
          row.soilCondition || "",
          row.rainPercent || "",
          row.rainCondition || "",
          row.motionCount || "",
          row.soundEvents || "",
          row.soundLevel || "",
          row.distance || "",
          row.angle || "",
          row.latitude || "",
          row.longitude || "",
        ].join(",");

        csvData.push(line);
      });

      const csvString = csvData.join("\n");

      const fileUri =
        FileSystem.documentDirectory + "iot_history_export.csv";

      await FileSystem.writeAsStringAsync(fileUri, csvString, {
        encoding: "utf8",
      });

      await Sharing.shareAsync(fileUri);

      // 🧹 auto-clear after share
      await clearHistory();
    } catch (error) {
      console.error("CSV Export Error:", error);
      alert("CSV export failed.");
    }
  }




  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Sensor History</Text>

      {/* 📥 Export Button */}
      <TouchableOpacity style={styles.exportButton} onPress={exportCSV}>
        <Text style={styles.exportText}>Export CSV</Text>
      </TouchableOpacity>

      {/* 🔽 Picker */}
      <View style={styles.dropdownWrapper}>
        <Picker
          selectedValue={selected}
          onValueChange={(v) => setSelected(v)}
          style={styles.dropdown}
        >
          <Picker.Item label="Temperature" value="temperature" />
          <Picker.Item label="Humidity" value="humidity" />
          <Picker.Item label="Soil Moisture" value="soil" />
          <Picker.Item label="Rain Drop" value="rainPercent" />
          <Picker.Item label="Motion Count" value="motionCount" />
          <Picker.Item label="Sound Events" value="soundEvents" />
          <Picker.Item label="Distance" value="distance" />
        </Picker>
      </View>

      {/* 📈 Chart */}
      <View style={styles.chartBlock}>
        <Text style={styles.chartTitle}>{labelsMap[selected]}</Text>

        <LineChart
          data={{
            labels,
            datasets: [
              {
                data: safeValues(history, selected),
              },
            ],
          }}
          width={chartWidth}
          height={chartHeight}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      <Text style={styles.note}>
        Orientation: {orientation} ({Math.round(width)}x{Math.round(height)})
      </Text>
    </ScrollView>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f6f7fb" },

  header: { fontSize: 22, fontWeight: "800", marginBottom: 8 },

  exportButton: {
    backgroundColor: "#3C3633",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 14,
  },
  exportText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  dropdownWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 16,
  },
  dropdown: { width: "100%" },

  chartBlock: { alignItems: "center" },

  chartTitle: { fontWeight: "600", marginBottom: 10 },

  chart: { borderRadius: 16, marginBottom: 30 },

  note: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: "center",
    marginTop: 10,
  },
});
