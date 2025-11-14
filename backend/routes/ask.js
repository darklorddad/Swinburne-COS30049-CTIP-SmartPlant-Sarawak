//ask.js//
const { ChatGroq } = require("@langchain/groq");
const { createReactAgent } = require("@langchain/langgraph/prebuilt");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const  {fetchHistoryReadingTool,fetchLatestReadingTool} = require("../controllers/AgentController.js");

// ---- SHORT-TERM MEMORY STORE ----
const sessionMemory = require("../memory/sessionMemory");


router.post("/", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query)
      return res.status(400).json({ error: "Missing 'query' in request body." });

    // Identify session (you can switch to real session tokens)
    const sessionId = req.headers["x-session-id"] || req.ip;

    if (!sessionMemory[sessionId]) {
      sessionMemory[sessionId] = { messages: [] };
    }

    // Build short-term memory context
    const pastMessages = sessionMemory[sessionId].messages
      .map(m => `${m.role}: ${m.content}`)
      .join("\n");

    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "meta-llama/llama-4-maverick-17b-128e-instruct",
      temperature: 0.3,
    });

    const agent = createReactAgent({
      llm: model,
      tools: [fetchLatestReadingTool, fetchHistoryReadingTool],
      prompt: `
      You are a smart IoT reasoning assistant equipped with SHORT-TERM MEMORY.
      Use the short-term memory conversation history to understand user intent.

      Conversation history:
      ${pastMessages}

      Rules:
      - Think step-by-step.
      - Use tools only when needed.
      - Sensors measure outdoor plant environment for endangered species.
      - Sensors reading reflect the condition of that plant currently in, analyze if it is suitable foe the plant to grow, or human intervention is needed to make sure the plant survive
      - Provide reasoning, anomaly detection, alerts.
      - If question is unrelated to IoT or sensors, say it is out of scope.
      `,
    });

    const response = await agent.invoke({
      messages: [{ role: "user", content: query }],
    });

    const answer =
      typeof response?.messages?.at(-1)?.content === "string"
        ? response.messages.at(-1).content
        : JSON.stringify(response, null, 2);

    // ---- STORE MEMORY ----
    sessionMemory[sessionId].messages.push(
      { role: "user", content: query },
      { role: "assistant", content: answer }
    );

    // Keep last 6 turns only (short-term)
    sessionMemory[sessionId].messages = sessionMemory[sessionId].messages.slice(-12);

    res.json({ query, response: answer });

  } catch (err) {
    console.error("Error in /ask route:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;