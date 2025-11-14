const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { bucket } = require("../firebase/firebaseConfig"); // Firebase Storage bucket

const RETRAIN_COOLDOWN = 5* 60 *1000; //24 * 60 * 60 * 1000; // 24 hours in ms
let lastRetrainTime = 0;
let intervalHandle = null;

// Path to the text file that stores trained species
const speciesFilePath = path.resolve(__dirname, "../models/trained_species.txt");

// Load trained species from the .txt file
function loadTrainedSpecies() {
  if (!fs.existsSync(speciesFilePath)) return new Set();
  const lines = fs.readFileSync(speciesFilePath, "utf8").split("\n");
  return new Set(lines.map(l => l.trim()).filter(Boolean)); 
}

// Append new species to the .txt file and update in-memory set
function saveNewSpecies(newSpecies, trainedSpeciesSet) {
  if (newSpecies.length === 0) return;

  fs.appendFileSync(
    speciesFilePath,
    newSpecies.map(s => `\n${s}`).join(""),
    "utf8"
  );

  newSpecies.forEach(s => trainedSpeciesSet.add(s));

  console.log(` Added new species to trained_species.txt: ${newSpecies.join(", ")}`);
}

function startRetrainWatcher() {
  let trainedSpecies = loadTrainedSpecies();
  console.log("Trained species loaded from .txt:", [...trainedSpecies]);

  async function checkForNewVerifiedImages() {
    console.log("🔍 Checking for new verified species...");

    if (Date.now() - lastRetrainTime < RETRAIN_COOLDOWN) {
      console.log("Retraining is in cooldown period (24h). Skipping check.");
      return;
    }

    const basePrefix = "plant_images/verified/";

    // List all files under the verified folder
    const [speciesFiles] = await bucket.getFiles({
      directory: basePrefix,
      autoPaginate: false,
    });

    // Extract unique species folders
    const speciesFolders = [
      ...new Set(
        speciesFiles
          .map(f => f.name.split("/")[2]) // get the 3rd component
          .filter(s => s && s.trim())     // keep only defined & non-empty
          .map(s => s.trim())             // now safe to trim
      )
    ];

    if (speciesFolders.length === 0) {
      console.log(`[RetrainWatcher] No species folders found under prefix "${basePrefix}"`);
      return;
    }

    console.log(`[RetrainWatcher] Found species folders: ${speciesFolders.join(", ")}`);

    // Determine new species (not in trained_species.txt)
    const newSpecies = speciesFolders.filter(s => !trainedSpecies.has(s));

    if (newSpecies.length === 0) {
      console.log("No new species found.");
      return;
    }

    // Check if new species have >10 images
    const speciesWithEnoughImages = [];
    for (const species of newSpecies) {
      const speciesPrefix = `${basePrefix}${species}/`;
      const [files] = await bucket.getFiles({ prefix: speciesPrefix })
      if (files.length > 1) speciesWithEnoughImages.push(species);
    }

    if (speciesWithEnoughImages.length === 0) {
      console.log("New species found but none have more than 10 images. Skipping retraining.");
      return;
    }

    // If we reach here: new species exist, images>10, and cooldown > 24h
    console.log(`Triggering retraining for new species: ${speciesWithEnoughImages.join(", ")}`);
    lastRetrainTime = Date.now();
    await spawnRetrainingScript(speciesWithEnoughImages);
    saveNewSpecies(speciesWithEnoughImages, trainedSpecies);
  }

  // Spawn retraining script asynchronously
  function spawnRetrainingScript(speciesList) {
    return new Promise((resolve, reject) => {
      const process = spawn("python", ["../backend/training/retrain_from_firebase.py"]);

      process.stdout.on("data", data => console.log(`[PYTHON-STDOUT] ${data.toString().trim()}`));
      process.stderr.on("data", data => console.error(`[PYTHON-STDERR] ${data.toString().trim()}`));

      process.on("close", code => {
        console.log(`[WATCHER] Retraining finished with code ${code} for species: ${speciesList.join(", ")}`);
        resolve();
      });

      process.on("error", err => {
        console.error(`[WATCHER] Failed to start retraining script: ${err}`);
        reject(err);
      });
    });
  }

  // Start watcher interval (every 30 minutes)
  intervalHandle = setInterval(checkForNewVerifiedImages, 60 * 60 * 1000);
  console.log("Retrain watcher started.");

  // Run immediately once at startup
  checkForNewVerifiedImages();
}

function stopRetrainWatcher() {
  if (intervalHandle) clearInterval(intervalHandle);
  console.log("Retrain watcher stopped.");
}

module.exports = { startRetrainWatcher, stopRetrainWatcher };
