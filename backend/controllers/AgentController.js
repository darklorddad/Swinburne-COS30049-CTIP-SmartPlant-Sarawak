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



//Tool: Fetch latest Firestore sensor readings
const fetchLatestReadingTool = new DynamicTool({
  name: "fetch_latest_sensor_data",
  description:
    `Fetch the latest IoT sensor reading from Firestore for realtime tracking and alerts
    For example:
    Tracking plant condition : soil moisture and condition, humidity, temperature...
    Giving user alert : motion count, distance, sound event and sound level...
    `,
  func: async () => {
    try {
      const snapshot = await db
        .collection("readings")
        .orderBy("timestamp", "desc")
        .limit(1)
        .get();

      if (snapshot.empty) return "No sensor data available.";
      const latest = snapshot.docs[0].data();
      return JSON.stringify(latest, null, 2);
    } catch (err) {
      console.error("Firestore tool error:", err);
      return "Error fetching data from Firestore.";
    }
  },
});

const fetchHistoryReadingTool = new DynamicTool({
  name: "fetch_history_sensor_data",
  description:
    `Fetch the history IoT sensor reading from Firestore for history tracking and checking past alerts
    For example:
    Tracking plant condition : soil moisture and condition, humidity, temperature...
    Giving user alert : motion count, distance, sound event and sound level...
    `,
  func: async () => {
    try {
      const snapshot = await db
        .collection("iot").doc("latest").collection("history")
        .orderBy("timestamp", "desc")
        .limit(1)
        .get();

      if (snapshot.empty) return "No sensor data available.";
      const latest = snapshot.docs[0].data();
      return JSON.stringify(latest, null, 2);
    } catch (err) {
      console.error("Firestore tool error:", err);
      return "Error fetching data from Firestore.";
    }
  },
});


module.exports = {fetchHistoryReadingTool,fetchLatestReadingTool};
