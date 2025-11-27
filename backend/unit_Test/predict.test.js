const request = require("supertest"); 
const express = require("express");
const multer = require("multer");
const { handlePrediction } = require("../controllers/predictController");

const app = express();
const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), handlePrediction);
app.use("/predict", router);

// Helper to mock Python process
const mockPythonProcess = (stdout = "[]", stderr = "", exitCode = 0) => ({
  stdout: { on: (event, cb) => { if (event === "data") cb(stdout); } },
  stderr: { on: (event, cb) => { if (event === "data") cb(stderr); } },
  on: (event, cb) => { if (event === "close") cb(exitCode); },
});

const { spawn } = require("child_process");
jest.mock("child_process");

describe("Predict Controller", () => {
  
  // ----- Silence console.error during tests -----
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  beforeEach(() => spawn.mockReset());

  test("returns 400 if no file uploaded", async () => {
    const res = await request(app).post("/predict").send();
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("No image uploaded");
  });

  test("returns parsed prediction for valid JSON", async () => {
    spawn.mockImplementation(() => mockPythonProcess(JSON.stringify([[0.1, 0.9]])));

    const res = await request(app)
      .post("/predict")
      .attach("image", Buffer.from("fake image"), "test.jpg");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([0.1, 0.9]);
  });

  test("returns 500 for invalid JSON", async () => {
    spawn.mockImplementation(() => mockPythonProcess("not-json"));

    const res = await request(app)
      .post("/predict")
      .attach("image", Buffer.from("fake image"), "test.jpg");

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Invalid JSON output from Python");
  });

  test("returns 500 if Python process fails", async () => {
    spawn.mockImplementation(() => mockPythonProcess("", "Python error", 1));

    const res = await request(app)
      .post("/predict")
      .attach("image", Buffer.from("fake image"), "test.jpg");

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Python process failed");
    expect(res.body.details).toBe("Python error");
  });

});
