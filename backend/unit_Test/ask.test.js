//ask.test.js//

const request = require("supertest");
const express = require("express");

// Import route
const askRoute = require("../routes/ask");

// Create a fake app
const app = express();
app.use(express.json());
app.use("/ask", askRoute);

jest.mock("@langchain/groq", () => ({
  ChatGroq: jest.fn().mockImplementation(() => ({
    invoke: jest.fn()
  }))
}));

jest.mock("@langchain/langgraph/prebuilt", () => ({
  createReactAgent: jest.fn().mockImplementation(() => ({
    invoke: jest.fn().mockResolvedValue({
      messages: [
        { role: "assistant", content: "Mocked response" }
      ]
    })
  }))
}));

// Mock tools so they don't call Firestore
jest.mock("../controllers/AgentController.js", () => ({
  fetchLatestReadingTool: { name: "latestMock", func: jest.fn() },
  fetchHistoryReadingTool: { name: "historyMock", func: jest.fn() },
}));

// Mock memory
jest.mock("../memory/sessionMemory", () => ({}));


test("POST /ask with no query returns 400", async () => {
  const res = await request(app).post("/ask").send({});

  expect(res.statusCode).toBe(400);
  expect(res.body.error).toBe("Missing 'query' in request body.");
});


test("POST /ask returns chatbot response", async () => {

  const res = await request(app)
    .post("/ask")
    .send({ query: "How is the plant doing?" });

  expect(res.statusCode).toBe(200);
  expect(res.body.response).toBe("Mocked response");
});
