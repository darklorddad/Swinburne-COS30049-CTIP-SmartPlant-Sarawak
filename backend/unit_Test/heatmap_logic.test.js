const request = require("supertest");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { generateGradcam } = require("../controllers/heatmapController");

// Mock child_process
const { spawn } = require("child_process");
jest.mock("child_process");

// Mock fs (partial)
jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

const app = express();
const upload = multer({ dest: "uploads/" });
app.post("/heatmap", upload.array("images"), generateGradcam);

describe("Heatmap Controller Logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    spawn.mockReset();
    fs.existsSync.mockReturnValue(true); // Assume folder exists
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
    console.log.mockRestore();
  });

  test("returns 400 if no files uploaded", async () => {
    const res = await request(app).post("/heatmap").send();
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("No files uploaded");
  });

  test("generates heatmap successfully", async () => {
    // Mock successful python process
    const mockProcess = {
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn((event, cb) => {
        if (event === "close") cb(0);
      }),
    };
    spawn.mockReturnValue(mockProcess);

    const res = await request(app)
      .post("/heatmap")
      .attach("images", Buffer.from("fake"), "test.jpg");

    expect(res.statusCode).toBe(200);
    expect(res.body.heatmaps).toHaveLength(1);
    expect(res.body.heatmaps[0]).toContain("test_heatmap.jpg");
    expect(spawn).toHaveBeenCalledWith("python", expect.arrayContaining(["grad_CAM.py"]));
  });

  test("handles python process failure", async () => {
    // Mock failed python process
    const mockProcess = {
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn((event, cb) => {
        if (event === "close") cb(1); // Error code
      }),
    };
    spawn.mockReturnValue(mockProcess);

    const res = await request(app)
      .post("/heatmap")
      .attach("images", Buffer.from("fake"), "test.jpg");

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Server error during Grad-CAM generation");
  });
});
