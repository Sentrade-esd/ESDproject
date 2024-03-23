const mongoose = require("mongoose");

const DB_service_url = process.env.DB_URL || "mongodb://127.0.0.1:27017/scraperDB";
console.log('mongodb://root:root@' + DB_service_url + '/scraperDB')

mongoose.connect('mongodb://root:root@' + DB_service_url + '/scraperDB', {authSource: "admin"})
// mongoose.connect(`${uri}/watchlist`, {})
  .then(() => {
    console.log("Connected to the database! "+ mongoose.connection.host);
    const db = mongoose.connection.db;

    if (!db) {
        db.dropDatabase();
        console.log("Dropped database");
        db.createCollection("scraperDB");
        console.log("Created database");
    }
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });