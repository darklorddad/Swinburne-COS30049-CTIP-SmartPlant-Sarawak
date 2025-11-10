const express = require("express");
const { ChatGroq } = require("@langchain/groq");
const { DynamicTool } = require("@langchain/core/tools");
const { createReactAgent } = require("@langchain/langgraph/prebuilt");
const admin = require("firebase-admin");
const serviceAccount = require("../smartplantsarawak.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const router = express.Router();
const APIKey = "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";



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

//route
router.post("/", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query)
      return res.status(400).json({ error: "Missing 'query' in request body." });

    const model = new ChatGroq({
      apiKey: APIKey,
      model: "meta-llama/llama-4-maverick-17b-128e-instruct",
      temperature: 0.3,
    });

    //  Modern ReAct reasoning agent
    const agent = createReactAgent({
      llm: model,
      tools: [fetchLatestReadingTool, fetchHistoryReadingTool],
      prompt:
        `You are a smart IoT reasoning assistant. Think step-by-step. The sensor is equipped near plant outdoor, normally out of reach from user. To protect endangered species, IoT-based monitoring systems for real-time tracking and alerts.Use tools only if needed to answer the user's query about sensor data. You analyze data, detect anomalies, and answer user questions about plant's condition. Perform reasoning like giving opinion if the plant is in danger situation and need human interruption.  `,
    });
    console.log(agent.type)

    const response = await agent.invoke({ messages: [{ role: "user", content: query }] });

    // Extract final answer text
    const answer =
      typeof response?.messages?.at(-1)?.content === "string"
        ? response.messages.at(-1).content
        : JSON.stringify(response, null, 2);

    res.json({
      query,
      response: answer,
    });
  } catch (err) {
    console.error("Error in /ask route:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



module.exports = router;
