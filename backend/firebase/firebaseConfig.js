// // firebaseConfig.js
// var admin = require("firebase-admin");
// const fs = require("fs");

// var serviceAccount = JSON.parse(
//   fs.readFileSync("./smartplantsarawak.json", "utf8")
// );

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://smartplantsarawak-default-rtdb.asia-southeast1.firebasedatabase.app"
// });

// const db = admin.firestore();
// module.exports = { db };


const admin = require("firebase-admin");
const fs = require("fs");

// Check if any app is already initialized
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    fs.readFileSync("./smartplantsarawak.json", "utf8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://smartplantsarawak-default-rtdb.asia-southeast1.firebasedatabase.app",
  });
}

// Export admin services
const db = admin.firestore();
const bucket = admin.storage().bucket("smartplantsarawak.firebasestorage.app");

module.exports = { admin, db, bucket };
