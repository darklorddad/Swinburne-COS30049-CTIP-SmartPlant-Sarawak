const express = require("express");
const multer = require("multer");
const { handleMultiplePrediction } = require("../controllers/predictMultipleController");

const router = express.Router();

// 🧩 Configure multer to save uploaded files in "uploads/"
const upload = multer({ dest: "uploads/" });

// ✅ Use upload.array() to accept up to 3 images
router.post("/", upload.array("images", 3), handleMultiplePrediction);

module.exports = router;
