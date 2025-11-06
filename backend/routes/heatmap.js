const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { generateGradcam } = require("../controllers/heatmapController");

// Upload folder for heatmap processing
const upload = multer({ dest: "uploads/" });

// POST /predict/heatmap
router.post("/", upload.array("images"), generateGradcam);

module.exports = router;
