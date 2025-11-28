const { startRetrainWatcher, stopRetrainWatcher } = require("../controllers/retrainWatcher");
const fs = require("fs");
const { spawn } = require("child_process");
const { bucket } = require("../firebase/firebaseConfig");

jest.mock("fs");
jest.mock("child_process");
jest.mock("../firebase/firebaseConfig", () => ({
  bucket: {
    getFiles: jest.fn(),
  },
}));

describe("Retrain Watcher", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    
    // Mock Date.now to ensure we pass the cooldown check (24h)
    jest.spyOn(Date, "now").mockReturnValue(1000000000000);
  });

  afterEach(() => {
    stopRetrainWatcher();
    jest.restoreAllMocks();
  });

  test("loads existing species and checks for new ones", async () => {
    // Mock fs
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue("Rose\nTulip");
    
    // Mock bucket response for species folders
    bucket.getFiles.mockResolvedValueOnce([
      [
        { name: "plant_images/verified/Rose/" },
        { name: "plant_images/verified/Orchid/" } // New species
      ]
    ]);

    // Mock bucket response for image count (Orchid)
    bucket.getFiles.mockResolvedValueOnce([
      new Array(15).fill({}) // > 10 images
    ]);

    // Mock spawn
    const mockProcess = {
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn((event, cb) => {
        if (event === "close") cb(0); // Success
      }),
    };
    spawn.mockReturnValue(mockProcess);

    startRetrainWatcher();

    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(bucket.getFiles).toHaveBeenCalled();
    expect(spawn).toHaveBeenCalledWith("python", expect.arrayContaining(["../backend/training/retrain_from_firebase.py"]));
    
    // Check if file was updated
    expect(fs.appendFileSync).toHaveBeenCalledWith(expect.any(String), expect.stringContaining("Orchid"), "utf8");
  });

  test("skips retraining if not enough images", async () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue("Rose");
    
    bucket.getFiles.mockResolvedValueOnce([
      [{ name: "plant_images/verified/Orchid/" }]
    ]);

    // Only 5 images
    bucket.getFiles.mockResolvedValueOnce([
      new Array(5).fill({})
    ]);

    startRetrainWatcher();
    
    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(spawn).not.toHaveBeenCalled();
  });
});
