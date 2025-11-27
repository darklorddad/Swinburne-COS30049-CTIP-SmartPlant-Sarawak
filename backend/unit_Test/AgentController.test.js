//AgentController.test.js//
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

test("fetchLatestReadingTool returns latest Firestore data", async () => {
  const mockData = { temp: 25, humidity: 50 };

  // Mock snapshot
  const admin = require("firebase-admin");
  admin.firestore().collection().limit().get.mockResolvedValue({
    empty: false,
    docs: [{ data: () => mockData }]
  });

  const result = await fetchLatestReadingTool.func();

  expect(JSON.parse(result)).toEqual(mockData);
});


test("fetchHistoryReadingTool returns history data", async () => {
  const mockHistory = [{ temp: 25 }, { temp: 26 }];

  const admin = require("firebase-admin");
  admin.firestore().collection().orderBy().limit().get.mockResolvedValue({
    empty: false,
    docs: mockHistory.map(d => ({ data: () => d }))
  });

  const result = await fetchHistoryReadingTool.func();

  expect(JSON.parse(result)).toEqual(mockHistory);
});

