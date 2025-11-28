// Additional tests for edge cases and error handling

const { fetchLatestReadingTool, fetchHistoryReadingTool } = require("../controllers/AgentController");

// Mock Firestore
jest.mock("firebase-admin", () => {
  const collectionMock = {
    limit: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    get: jest.fn(),
  };
  return {
    firestore: () => ({
      collection: () => collectionMock,
    }),
    credential: { cert: jest.fn() },
    initializeApp: jest.fn(),
  };
});

describe("AgentController Extended Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  test("fetchLatestReadingTool returns message when no data", async () => {
    const admin = require("firebase-admin");
    admin.firestore().collection().limit().get.mockResolvedValue({
      empty: true,
      docs: []
    });

    const result = await fetchLatestReadingTool.func();
    expect(result).toBe("No sensor data available.");
  });

  test("fetchLatestReadingTool handles errors", async () => {
    const admin = require("firebase-admin");
    admin.firestore().collection().limit().get.mockRejectedValue(new Error("Firestore error"));

    const result = await fetchLatestReadingTool.func();
    expect(result).toBe("Error fetching latest sensor data.");
  });

  test("fetchHistoryReadingTool returns message when no data", async () => {
    const admin = require("firebase-admin");
    admin.firestore().collection().orderBy().limit().get.mockResolvedValue({
      empty: true,
      docs: []
    });

    const result = await fetchHistoryReadingTool.func();
    expect(result).toBe("No history data available.");
  });

  test("fetchHistoryReadingTool handles errors", async () => {
    const admin = require("firebase-admin");
    admin.firestore().collection().orderBy().limit().get.mockRejectedValue(new Error("Firestore error"));

    const result = await fetchHistoryReadingTool.func();
    expect(result).toBe("Error fetching sensor history.");
  });
});
