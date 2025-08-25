var admin = require("firebase-admin");
var path = require("path");

// Use the correct path to the Firebase service account key
var serviceAccount = require(path.join(__dirname, "..", "public", "forum", "keys", "toursamsterdam-eu-1-firebase-adminsdk-e8an4-68217c7e8f.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://toursamsterdam-eu-1-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "toursamsterdam-eu-1.firebasestorage.app"
});

