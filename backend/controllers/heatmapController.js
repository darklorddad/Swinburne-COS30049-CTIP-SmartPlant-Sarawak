const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

const generateGradcam = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const outputFolder = path.join(__dirname, "../heatmaps");
    if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);

    const heatmaps = [];

    // Process each uploaded image one by one
    for (const file of req.files) {
      const imagePath = file.path;
      const filename = path.basename(imagePath, path.extname(imagePath));
      const outputFilename = path.join(outputFolder, `${filename}_heatmap.jpg`);

      // Wrap the Python call in a Promise for async handling
      await new Promise((resolve, reject) => {
        const pythonProcess = spawn("python", [
          path.join(__dirname, "../gradcam.py"),
          imagePath,
          outputFilename,
        ]);

        pythonProcess.stdout.on("data", (data) => {
          console.log(`[GradCAM] stdout (${filename}):`, data.toString());
        });

        pythonProcess.stderr.on("data", (data) => {
          console.error(`[GradCAM] stderr (${filename}):`, data.toString());
        });

        pythonProcess.on("close", (code) => {
          if (code !== 0) {
            console.error(`Grad-CAM failed for ${filename}`);
            reject(new Error(`Python process failed for ${filename}`));
          } else {
            // Construct URL accessible by the React Native app
            const heatmapUrl = `http://${req.hostname}:3000/heatmaps/${filename}_heatmap.jpg`;
            heatmaps.push(heatmapUrl);
            resolve();
          }
        });
      });
    }

    // ✅ Return all heatmaps
    res.json({ heatmaps });
  } catch (err) {
    console.error("Error generating Grad-CAMs:", err);
    res.status(500).json({ error: "Server error during Grad-CAM generation" });
  }
};

module.exports = { generateGradcam };
