import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Dimensions,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Picker } from "@react-native-picker/picker";
import * as ScreenOrientation from "expo-screen-orientation";
import useHistorySeries from "../hooks/useHistorySeries";

// --- Clean all data before chart ---
function safeValues(history, key) {
  if (!history || history.length === 0) return [0];
  const arr = history.map((r) => {
    let val = r[key];
    if (typeof val === "string") val = parseFloat(val);
    if (typeof val === "boolean") val = val ? 1 : 0;
    if (val === null || val === undefined || isNaN(val) || !isFinite(val))
      return 0;
    return Number(val);
  });
  const filtered = arr.filter((v) => isFinite(v));
  return filtered.length > 0 ? filtered : [0];
}

export default function HistoryScreen() {
  const history = useHistorySeries(50);
  const [selected, setSelected] = useState("temperature");
  const { width, height } = useWindowDimensions();
  const [orientation, setOrientation] = useState("PORTRAIT");

  // 🔄 Detect phone rotation dynamically
  useEffect(() => {
    async function getInitialOrientation() {
      const o = await ScreenOrientation.getOrientationAsync();
      setOrientation(
        o === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
          o === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
          ? "LANDSCAPE"
          : "PORTRAIT"
      );
    }
    getInitialOrientation();

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
  const chartHeight = orientation === "LANDSCAPE" ? height * 0.7 : 250;

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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Sensor History</Text>

      {/* 🔽 Dropdown Selector */}
      <View style={styles.dropdownWrapper}>
        <Picker
          selectedValue={selected}
          onValueChange={(itemValue) => setSelected(itemValue)}
          style={styles.dropdown}
        >
          <Picker.Item label="Temperature" value="temperature" />
          <Picker.Item label="Humidity" value="humidity" />
          <Picker.Item label="Soil Moisture" value="soil" />
          <Picker.Item label="Rain Drop" value="rainPercent" />
          <Picker.Item label="Motion" value="motionCount" />
          <Picker.Item label="Sound" value="soundEvents" />
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
  dropdownWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  dropdown: { width: "100%" },
  chartBlock: { alignItems: "center" },
  chartTitle: { fontWeight: "600", marginBottom: 10 },
  chart: { borderRadius: 16, marginBottom: 30 },
  note: { fontSize: 12, opacity: 0.6, textAlign: "center" },
});
