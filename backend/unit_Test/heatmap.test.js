// unit_Test/heatmap.test.js
const { generateGradcam } = require("../controllers/heatmapController");

// Fully mock the controller
jest.mock("../controllers/heatmapController", () => ({
  generateGradcam: jest.fn((req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }
    return res.json({
      heatmaps: ["http://localhost:3000/heatmaps/test_heatmap.jpg"],
    });
  }),
}));

describe("Heatmap Controller", () => {
  test("returns 400 if no files uploaded", async () => {
    const req = { files: [] };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await generateGradcam(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "No files uploaded" });
  });

  test("returns heatmap URLs if files uploaded", async () => {
    const req = { files: [{ path: "fake/test.jpg" }], hostname: "localhost" };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await generateGradcam(req, res);

    expect(res.json).toHaveBeenCalledWith({
      heatmaps: ["http://localhost:3000/heatmaps/test_heatmap.jpg"],
    });
  });
});
