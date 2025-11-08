// firebaseConfig.js
var admin = require("firebase-admin");
const fs = require("fs");

var serviceAccount = JSON.parse(
  fs.readFileSync("./smartplantsarawak.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://smartplantsarawak-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.firestore();
module.exports = { db };
