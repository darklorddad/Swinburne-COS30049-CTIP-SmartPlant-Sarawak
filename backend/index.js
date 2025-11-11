const express = require("express");
const path = require("path");

const predictRoutes = require("./routes/predict");
const predictMultipleRoutes = require("./routes/predict_multiple");
const heatmapRoutes = require("./routes/heatmap");
const askRoutes = require("./controllers/AgentController");
///add for retraining
const { startRetrainWatcher } = require("./controllers/retrainWatcher");
///end add


const app = express();
app.use(express.json());




try {

  // Serve generated heatmaps
  app.use("/heatmaps", express.static(path.join(__dirname, "heatmaps")));

  // Mount routes
  app.get("/", (req, res) => {
    res.send("Server is running");
  });

  app.use("/predict", predictRoutes);
  app.use("/predict_multiple", predictMultipleRoutes);
  app.use("/heatmap", heatmapRoutes);
  app.use("/ask", askRoutes);
  // Start retrain watcher
  startRetrainWatcher();

  const HOST = '0.0.0.0'; // Listen on all available network interfaces

  app.listen(3000, HOST, () => {
    console.log(`✅ Server running on http://${HOST}:3000`);
  });
} catch (error) {
  console.error("Failed to start application:", error);
  process.exit(1);
}


