//predictictMultipleController.js
const { spawn } = require("child_process");
const path = require("path");

// Helper function to run prediction for a single image
const runPythonPrediction = (imagePath) => {
    return new Promise((resolve, reject) => {
        // Only spawn with one image path
        const python = spawn("python", ["training/predict.py", imagePath]); 

        let output = "";
        let errorOutput = "";

        python.stdout.on("data", data => {
            output += data.toString();
        });

        python.stderr.on("data", data => {
            errorOutput += data.toString();
        });

        python.on("close", code => {
            if (code !== 0) {
                return reject({ error: "Python process failed", details: errorOutput, imagePath });
            }

            try {
                // Ensure ALL non-JSON output is stripped (important!)
                const jsonStart = output.indexOf("[");
                if (jsonStart === -1) {
                    return reject({ error: "No JSON array found in Python output", raw: output, imagePath });
                }
                const jsonText = output.slice(jsonStart).trim();

                const predictions = JSON.parse(jsonText); 
                resolve(predictions); // This is a list of Top-K results for one image
            } catch (err) {
                reject({ error: "Invalid JSON output from Python", raw: output, imagePath });
            }
        });
    });
};

// Main controller function
const handleMultiplePrediction = async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No images uploaded" });
    }

    const imagePaths = req.files.map(file => path.join(__dirname, "..", file.path));

    try {
        // Run predictions for all images sequentially
        const resultsPromises = imagePaths.map(runPythonPrediction);
        
        // Wait for all promises to resolve. `predictions` will be an array of result lists.
        // Example: [[{...}, {...}], [{...}, {...}]]
        const predictions = await Promise.all(resultsPromises);
        
        // The predictions are already a list of lists, ready to be flattened.
        const flattened = predictions.flat();

        // 🧮 Combine same species and 📊 Average and sort (Your existing logic, which is great!)
        const speciesMap = {};
        flattened.forEach(pred => {
            // Use 'class' property from the result object
            const species = pred.class; 
            const { confidence } = pred;
            
            if (!species) return; // Skip if somehow the prediction is missing the class

            if (!speciesMap[species]) {
                speciesMap[species] = { total: 0, count: 0 };
            }
            speciesMap[species].total += confidence;
            speciesMap[species].count += 1;
        });

        const averaged = Object.entries(speciesMap).map(([species, stats]) => ({
            class: species,
            confidence: parseFloat((stats.total / stats.count).toFixed(4)),
        }));

        averaged.sort((a, b) => b.confidence - a.confidence);
        const top3 = averaged.slice(0, 3);

        // ✅ Send same format as single image
        res.json(top3);

    } catch (err) {
        console.error("Prediction process error:", err);
        // Respond with a 500 status and the details of the failure
        res.status(500).json({ 
            error: "One or more prediction processes failed", 
            details: err.details || err.error 
        });
    }
};

module.exports = { handleMultiplePrediction };