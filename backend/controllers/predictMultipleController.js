const { spawn } = require("child_process");
const path = require("path");

const handleMultiplePrediction = (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No images uploaded" });
  }

  const imagePaths = req.files.map(file => path.join(__dirname, "..", file.path));

  // Spawn a single Python process for all images
  const python = spawn("python", ["predict.py", ...imagePaths]);

  let output = "";
  let errorOutput = "";

  python.stdout.on("data", data => {
    output += data.toString();
  });

  python.stderr.on("data", data => {
    errorOutput += data.toString();
    console.error(`Python error: ${data}`);
  });

  python.on("close", code => {
    if (code !== 0) {
      return res.status(500).json({ error: "Python process failed", details: errorOutput });
    }

    try {
      // Extract JSON from any extra console output
      const jsonStart = output.indexOf("[");
      const jsonText = output.slice(jsonStart).trim();

      const predictions = JSON.parse(jsonText); // expects list of lists (if multiple)

      // ✅ Handle both cases:
      // - Python returns [[{...}, {...}], [{...}, {...}]] (multi-image)
      // - Python returns [{...}, {...}, {...}] (single-image)
      const flattened = Array.isArray(predictions[0])
        ? predictions.flat()
        : predictions;

      // 🧮 Combine same species
      const speciesMap = {};
      flattened.forEach(pred => {
        const { class: species, confidence } = pred;
        if (!speciesMap[species]) {
          speciesMap[species] = { total: 0, count: 0 };
        }
        speciesMap[species].total += confidence;
        speciesMap[species].count += 1;
      });

      // 📊 Average and sort
      const averaged = Object.entries(speciesMap).map(([species, stats]) => ({
        class: species,
        confidence: parseFloat((stats.total / stats.count).toFixed(4)),
      }));

      averaged.sort((a, b) => b.confidence - a.confidence);
      const top3 = averaged.slice(0, 3);

      // ✅ Send same format as single image
      res.json(top3);

    } catch (err) {
      console.error("Failed to parse Python output:", output);
      res.status(500).json({ error: "Invalid JSON output from Python", raw: output });
    }
  });
};

module.exports = { handleMultiplePrediction };
