import React from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity 
} from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { LineChart } from "react-native-chart-kit";
import { useNavigation } from "@react-navigation/native";
import useLiveReading from "../hooks/useLiveReading";

const screenWidth = Dimensions.get("window").width;
const itemSize = screenWidth / 2 - 24;

export default function DashboardScreen() {
  const navigation = useNavigation();
  const live = useLiveReading();

  if (!live)
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );

  // --- Prepare radar graph data ---
  const maxAngle = 180;
  const radarAngles = Array.from({ length: maxAngle + 1 }, (_, i) => i);
  const radarDistances = radarAngles.map((a) =>
    a === live.angle ? live.distance ?? 0 : null
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>SmartPlant Live Dashboard</Text>

      {/* ===== GRID ===== */}
      <View style={styles.grid}>
        {/* 🌡 Temperature */}
        <View style={styles.circleCard}>
          <AnimatedCircularProgress
            size={itemSize * 0.8}
            width={10}
            fill={live.temperature ?? 0}
            tintColor="#e67e22"
            backgroundColor="#eee"
          >
            {() => (
              <Text style={styles.circleText}>
                {live.temperature?.toFixed(1) ?? 0}°C
              </Text>
            )}
          </AnimatedCircularProgress>
          <Text style={styles.label}>Temperature</Text>
        </View>

        {/* 💧 Humidity */}
        <View style={styles.circleCard}>
          <AnimatedCircularProgress
            size={itemSize * 0.8}
            width={10}
            fill={live.humidity ?? 0}
            tintColor="#3498db"
            backgroundColor="#eee"
          >
            {() => (
              <Text style={styles.circleText}>
                {live.humidity?.toFixed(1) ?? 0}%
              </Text>
            )}
          </AnimatedCircularProgress>
          <Text style={styles.label}>Humidity</Text>
        </View>

        {/* 🌱 Soil Moisture (%) */}
        <View style={styles.circleCard}>
          <AnimatedCircularProgress
            size={itemSize * 0.8}
            width={10}
            fill={live.soil ?? 0}
            tintColor="#27ae60"
            backgroundColor="#eee"
          >
            {() => (
              <Text style={styles.circleText}>
                {live.soil?.toFixed(0) ?? 0}%
              </Text>
            )}
          </AnimatedCircularProgress>
          <Text style={styles.label}>Soil Moisture</Text>
        </View>

        {/* 🌧 Rain Intensity (%) */}
        <View style={styles.circleCard}>
          <AnimatedCircularProgress
            size={itemSize * 0.8}
            width={10}
            fill={live.rainPercent ?? 0}
            tintColor="#2980b9"
            backgroundColor="#eee"
          >
            {() => (
              <Text style={styles.circleText}>
                {live.rainPercent?.toFixed(0) ?? 0}%
              </Text>
            )}
          </AnimatedCircularProgress>
          <Text style={styles.label}>Rain Intensity</Text>
        </View>

        {/* 🟩 Soil Condition */}
        <View style={[styles.squareCard, { backgroundColor: "#2ecc71" }]}>
          <Text style={styles.squareTitle}>Soil Condition</Text>
          <Text style={styles.squareValue}>{live.soilCondition ?? "N/A"}</Text>
        </View>

        {/* 🟦 Rain Condition */}
        <View style={[styles.squareCard, { backgroundColor: "#3498db" }]}>
          <Text style={styles.squareTitle}>Rain Condition</Text>
          <Text style={styles.squareValue}>{live.rainCondition ?? "N/A"}</Text>
        </View>

        {/* 🟪 Sound Level */}
        <View style={[styles.squareCard, { backgroundColor: "#8e44ad" }]}>
          <Text style={styles.squareTitle}>Sound Level</Text>
          <Text style={styles.squareValue}>{live.soundLevel ?? "N/A"}</Text>
          <Text style={styles.squareSubtitle}>
            {live.soundEvents ?? 0} events
          </Text>
        </View>

        {/* 🟧 Motion Count */}
        <View style={[styles.squareCard, { backgroundColor: "#d35400" }]}>
          <Text style={styles.squareTitle}>Motion</Text>
          <Text style={styles.squareValue}>{live.motionCount ?? 0}</Text>
          <Text style={styles.squareSubtitle}>Detections</Text>
        </View>
      </View>

      {/* ===== ULTRASONIC RADAR GRAPH ===== */}
      <Text style={[styles.title, { marginTop: 20 }]}>Ultrasonic Radar</Text>

      <LineChart
        data={{
          labels: ["0°", "45°", "90°", "135°", "180°"],
          datasets: [
            {
              data: radarDistances.map((v) => v ?? 0),
              color: () => "#2ecc71",
            },
          ],
        }}
        width={screenWidth - 24}
        height={220}
        yAxisSuffix="cm"
        fromZero
        withShadow={false}
        withInnerLines={false}
        withOuterLines={false}
        chartConfig={{
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          propsForDots: { r: "3", strokeWidth: "2", stroke: "#27ae60" },
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />

      <Text style={styles.subtitle}>
        Angle: {live.angle ?? 0}° | Distance: {live.distance?.toFixed(1) ?? 0} cm
      </Text>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.navigate("back")}
        activeOpacity={0.85}
      >
        <Text style={styles.backBtnText}>Back to Admin Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: 20,
    color: "#666",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  circleCard: {
    width: itemSize,
    height: itemSize,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  circleText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  label: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  squareCard: {
    width: itemSize,
    height: itemSize,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  squareTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 4,
  },
  squareValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },
  squareSubtitle: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    width: screenWidth - 24,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  backBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
