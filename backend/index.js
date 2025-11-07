const express = require("express");
const path = require("path");

const predictRoutes = require("./routes/predict");
const predictMultipleRoutes = require("./routes/predict_multiple");
const heatmapRoutes = require("./routes/heatmap");

const app = express();
app.use(express.json());

// Serve generated heatmaps
app.use("/heatmaps", express.static(path.join(__dirname, "heatmaps")));

// Mount routes
app.use("/predict", predictRoutes); 
app.use("/predict_multiple", predictMultipleRoutes);      
app.use("/heatmap", heatmapRoutes); 

const HOST = '192.168.1.8'; // Your machine's IP address

app.listen(3000, HOST, () => {
  console.log(`✅ Server running on http://${HOST}:3000`);
});
