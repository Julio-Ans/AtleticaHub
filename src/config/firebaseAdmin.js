const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Caminho para seu JSON de credenciais do Firebase
const serviceAccount = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "firebase-service-account.json"),
    "utf-8"
  )
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "atleticahub-7b449.firebasestorage.app", 
  databaseURL: "https://atleticahub-7b449-default-rtdb.firebaseio.com/",
});

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };

