// Additional tests for session memory and error handling

const request = require("supertest");
const express = require("express");
const sessionMemory = require("../memory/sessionMemory");

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

// We need to be able to mock the agent behavior per test
const mockAgentInvoke = jest.fn();

jest.mock("@langchain/langgraph/prebuilt", () => ({
  createReactAgent: jest.fn().mockImplementation(() => ({
    invoke: mockAgentInvoke
  }))
}));

// Mock tools so they don't call Firestore
jest.mock("../controllers/AgentController.js", () => ({
  fetchLatestReadingTool: { name: "latestMock", func: jest.fn() },
  fetchHistoryReadingTool: { name: "historyMock", func: jest.fn() },
}));

// Mock memory - we use a real object for the mock so we can inspect it
jest.mock("../memory/sessionMemory", () => ({}));

describe("Ask Route Extended Tests", () => {
  beforeEach(() => {
    // Clear memory and mocks before each test
    for (const key in sessionMemory) delete sessionMemory[key];
    mockAgentInvoke.mockReset();
    mockAgentInvoke.mockResolvedValue({
      messages: [{ role: "assistant", content: "Mocked response" }]
    });
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  test("POST /ask returns chatbot response and updates memory", async () => {
    const res = await request(app)
      .post("/ask")
      .set("x-session-id", "test-session")
      .send({ query: "Hello" });

    expect(res.statusCode).toBe(200);
    expect(res.body.response).toBe("Mocked response");

    // Check memory
    expect(sessionMemory["test-session"]).toBeDefined();
    expect(sessionMemory["test-session"].messages).toHaveLength(2);
    expect(sessionMemory["test-session"].messages[0]).toEqual({ role: "user", content: "Hello" });
    expect(sessionMemory["test-session"].messages[1]).toEqual({ role: "assistant", content: "Mocked response" });
  });

  test("POST /ask maintains conversation history", async () => {
    // Pre-populate memory
    sessionMemory["test-session"] = {
      messages: [{ role: "user", content: "Old message" }, { role: "assistant", content: "Old reply" }]
    };

    await request(app)
      .post("/ask")
      .set("x-session-id", "test-session")
      .send({ query: "New query" });

    expect(sessionMemory["test-session"].messages).toHaveLength(4);
    expect(sessionMemory["test-session"].messages[2].content).toBe("New query");
  });

  test("POST /ask limits memory to last 12 messages", async () => {
    // Create 12 messages
    const messages = [];
    for (let i = 0; i < 12; i++) {
      messages.push({ role: i % 2 === 0 ? "user" : "assistant", content: `msg ${i}` });
    }
    sessionMemory["test-session"] = { messages };

    await request(app)
      .post("/ask")
      .set("x-session-id", "test-session")
      .send({ query: "New query" });

    // Should add 2 (total 14) then slice to 12
    expect(sessionMemory["test-session"].messages).toHaveLength(12);
    // The last message should be the new response
    expect(sessionMemory["test-session"].messages[11].content).toBe("Mocked response");
    // The second to last should be the new query
    expect(sessionMemory["test-session"].messages[10].content).toBe("New query");
    // The first message should be index 2 from original (msg 2)
    expect(sessionMemory["test-session"].messages[0].content).toBe("msg 2");
  });

  test("POST /ask handles agent errors", async () => {
    mockAgentInvoke.mockRejectedValue(new Error("Agent failure"));

    const res = await request(app)
      .post("/ask")
      .send({ query: "Crash me" });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Internal server error");
  });
});
