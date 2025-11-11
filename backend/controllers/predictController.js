// const { spawn } = require("child_process");
// const path = require("path");

// const handlePrediction = (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: "No image uploaded" });
//   }

//   const imagePath = path.join(__dirname, "..", req.file.path);

//   // Spawn a fresh Python process
//   const python = spawn("python", ["predict.py", imagePath]);

//   let output = "";
//   let errorOutput = "";

//   python.stdout.on("data", (data) => {
//     output += data.toString();
//   });

//   python.stderr.on("data", (data) => {
//     errorOutput += data.toString();
//     console.error(`Python error: ${data}`);
//   });

//   python.on("close", (code) => {
//     if (code !== 0) {
//       return res.status(500).json({ error: "Python process failed", details: errorOutput });
//     }
//     try {
//       const result = JSON.parse(output); // Expect JSON from Python
//       res.json(result);
//     } catch (e) {
//       res.json({ raw: output.trim() }); // fallback if plain text
//     }
//   });
// };

// module.exports = { handlePrediction };


const { spawn } = require("child_process");
const path = require("path");

const handlePrediction = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  const imagePath = path.join(__dirname, "..", req.file.path);

  const python = spawn("python", ["training/predict.py", imagePath]);

  let output = "";
  let errorOutput = "";

  python.stdout.on("data", (data) => {
    output += data.toString();
  });

  python.stderr.on("data", (data) => {
    errorOutput += data.toString();
    console.error(`Python error: ${data}`);
  });

  python.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: "Python process failed", details: errorOutput });
    }

    try {
      const result = JSON.parse(output.trim());

      // ✅ If the output is [[...]], unwrap it
      const formatted =
        Array.isArray(result) && result.length === 1 && Array.isArray(result[0])
          ? result[0]
          : result;

      res.json(formatted);
    } catch (e) {
      console.error("JSON parse error:", e);
      res.status(500).json({ error: "Invalid JSON output from Python", raw: output.trim() });
    }
  });
};

module.exports = { handlePrediction };
