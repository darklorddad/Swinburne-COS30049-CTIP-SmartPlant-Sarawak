// AgentController.js//
const express = require("express");

const { DynamicTool } = require("@langchain/core/tools");

const admin = require("firebase-admin");
const serviceAccount = require("../smartplantsarawak-firebase-adminsdk-fbsvc-aee0d5a952.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const router = express.Router();

const fetchLatestReadingTool = new DynamicTool({
  name: "fetch_latest_sensor_data",
  description: `
    Fetch the latest IoT sensor reading from Firestore for realtime tracking.
    Useful for:
    • Plant condition: soil moisture, humidity, temperature, light
    • Alerts: motion count, distance, sound event, sound level
  `,
  func: async () => {
    try {
      const snapshot = await db
        .collection("iot")
        .doc("latest")
        .collection("history")
        .orderBy("timestamp", "desc")
        .limit(1)
        .get();

      if (snapshot.empty) return "No sensor data available.";

      const latest = snapshot.docs[0].data();
      return JSON.stringify(latest, null, 2);

    } catch (err) {
      console.error("Firestore tool error:", err);
      return "Error fetching latest sensor data.";
    }
  },
});
const fetchHistoryReadingTool = new DynamicTool({
  name: "fetch_history_sensor_data",
  description: `
    Fetch past IoT sensor readings for history tracking and analyzing trends.
    Useful for:
    • Past plant condition (moisture/humidity)
    • Checking previous motion/sound/distance alerts
  `,
  func: async () => {
    try {
      // Fetch the last 10 readings (old → new)
      const snapshot = await db
        .collection("iot")
        .doc("latest")
        .collection("history")
        .orderBy("timestamp", "desc")
        .limit(10)
        .get();

      if (snapshot.empty) return "No history data available.";

      const history = snapshot.docs.map(doc => doc.data());

      return JSON.stringify(history, null, 2);

    } catch (err) {
      console.error("Firestore tool error:", err);
      return "Error fetching sensor history.";
    }
  },
});


module.exports = {fetchHistoryReadingTool,fetchLatestReadingTool};
