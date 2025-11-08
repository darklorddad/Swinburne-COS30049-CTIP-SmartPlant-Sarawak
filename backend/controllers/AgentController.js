// routes/ask.js
const express = require("express");
const router = express.Router();
const { db } = require("../firebase/firebaseConfig");

require("dotenv").config();

const { ChatGroq } = require("@langchain/groq");
const { DynamicTool } = require("@langchain/core/tools");
const { createReactAgent } = require("@langchain/langgraph/prebuilt");

//Firestore tool for live IoT data
const getLatestSensorDataTool = new DynamicTool({
  name: "get_latest_sensor_data",
  description:
    "Fetch the latest IoT sensor readings such as humidity, temperature, and soil moisture from Firestore.",
  func: async () => {
    const snapshot = await db
      .collection("readings")
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) return "No sensor data available.";
    const latest = snapshot.docs[0].data();
    return JSON.stringify(latest);
  },
});

//LangChain + Groq Agent Route
router.post("/", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query)
      return res.status(400).json({ error: "Missing 'query' in request body." });

    const model = new ChatGroq({
      apiKey: "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",
      model: "meta-llama/llama-4-maverick-17b-128e-instruct",
    });

    // Fetch Firestore data directly
    const snapshot = await db
      .collection("readings")
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    let responseText = "No sensor data available.";
    if (!snapshot.empty) {
      const latest = snapshot.docs[0].data();
      const data = JSON.stringify(latest, null, 2);
      responseText = await model.invoke([
        {
          role: "system",
          content:
            "You are an IoT assistant. Summarize plant sensor data clearly and naturally.",
        },
        { role: "user", content: `Here is the latest data: ${data}. ${query}` },
      ]);
    }

    res.json({
      query,
      response: responseText.content,
    });
  } catch (err) {
    console.error("Errror in LangChain /ask route:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
