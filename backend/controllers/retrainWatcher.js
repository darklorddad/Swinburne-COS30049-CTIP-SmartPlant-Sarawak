const { spawn } = require("child_process");
const { bucket } = require("../firebase/firebaseConfig"); // use exported bucket

let lastRetrainTime = 0;
const RETRAIN_COOLDOWN = 30 * 60 * 1000; 
let intervalHandle = null;

function startRetrainWatcher() {
  async function checkForNewVerifiedImages() {
    console.log("🔍 Checking for new verified images...");

    const [files] = await bucket.getFiles({ prefix: "plant_images/verified/" });

    const recentFiles = files.filter(f => {
      const updatedTime = new Date(f.metadata?.updated).getTime();
      return Date.now() - updatedTime < RETRAIN_COOLDOWN;
    });

    if (recentFiles.length > 0 && Date.now() - lastRetrainTime > RETRAIN_COOLDOWN) {
      console.log(`Found ${recentFiles.length} new verified images, retraining...`);
      lastRetrainTime = Date.now();
      spawnRetrainingScript();
    } else {
      console.log("No new verified uploads found.");
    }
  }

  function spawnRetrainingScript() {
    const process = spawn("python", ["../backend/training/retrain_from_firebase.py"]);

    process.stdout.on("data", data => console.log(`${data.toString()}`));
    process.stderr.on("data", data => console.error(` ${data.toString()}`));

    process.on("close", code => console.log(`Retraining finished with code ${code}`));
  }

  intervalHandle = setInterval(checkForNewVerifiedImages, 30 * 60 * 1000);
  console.log("Retrain watcher started.");
}

function stopRetrainWatcher() {
  if (intervalHandle) clearInterval(intervalHandle);
  console.log("Retrain watcher stopped.");
}

module.exports = { startRetrainWatcher, stopRetrainWatcher };
