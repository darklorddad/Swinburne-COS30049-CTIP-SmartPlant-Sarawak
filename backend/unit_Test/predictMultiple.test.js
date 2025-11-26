// unit_Test/predictMultiple.test.js
const request = require("supertest");
const express = require("express");
const multer = require("multer");
const path = require("path");
const { handleMultiplePrediction } = require("../controllers/predictMultipleController");

const app = express();
const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.array("images", 3), handleMultiplePrediction);
app.use("/predict_multiple", router);

// Helper to mock Python process
const mockPythonProcess = (stdout = "[]", stderr = "", exitCode = 0) => ({
  stdout: { on: (event, cb) => { if (event === "data") cb(stdout); } },
  stderr: { on: (event, cb) => { if (event === "data") cb(stderr); } },
  on: (event, cb) => { if (event === "close") cb(exitCode); },
});

// Mock child_process.spawn
const { spawn } = require("child_process");
jest.mock("child_process");

describe("Multiple Prediction Controller", () => {

  beforeEach(() => {
    spawn.mockReset();
    jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress logs
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  test("returns 400 if no images uploaded", async () => {
    const res = await request(app).post("/predict_multiple").send();
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("No images uploaded");
  });

  test("returns top 3 averaged predictions for multiple images", async () => {
    // Mock two Python processes returning results
    const results = [
      JSON.stringify([{ class: "PlantA", confidence: 0.8 }, { class: "PlantB", confidence: 0.1 }, { class: "PlantC", confidence: 0.1 }]),
      JSON.stringify([{ class: "PlantA", confidence: 0.6 }, { class: "PlantC", confidence: 0.1 },{ class: "PlantB", confidence: 0.1 }]),
      JSON.stringify([{ class: "PlantA", confidence: 0.4 }, { class: "PlantC", confidence: 0.4 },{ class: "PlantB", confidence: 0.1 }]),
    ];
    let callIndex = 0;
    spawn.mockImplementation(() => mockPythonProcess(results[callIndex++]));

    const res = await request(app)
      .post("/predict_multiple")
      .attach("images", Buffer.from("fake1"), "img1.jpg")
      .attach("images", Buffer.from("fake2"), "img2.jpg")
      .attach("images", Buffer.from("fake3"), "img3.jpg");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      { class: "PlantA", confidence: 0.6 },
      { class: "PlantC", confidence: 0.2 },
      { class: "PlantB", confidence: 0.1 },
    ]);
  });

  test("returns 500 if one Python process fails", async () => {
    spawn.mockImplementation(() => mockPythonProcess("", "Python error", 1));

    const res = await request(app)
      .post("/predict_multiple")
      .attach("images", Buffer.from("fake1"), "img1.jpg");

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("One or more prediction processes failed");
    expect(res.body.details).toBe("Python error");
  });

  test("returns 500 if Python outputs invalid JSON", async () => {
    spawn.mockImplementation(() => mockPythonProcess("not-json"));

    const res = await request(app)
      .post("/predict_multiple")
      .attach("images", Buffer.from("fake1"), "img1.jpg");

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("One or more prediction processes failed");
    expect(res.body.details).toBe("No JSON array found in Python output");

  });

});
