import { Admin, MongoClient, ServerApiVersion } from "mongodb";
import  mongoose  from "mongoose";

const DB_service_url = process.env.DB_URL // sentiment_db:27017

// mongoose.connect('mongodb://root:root@localhost:27017/sentiments', {authSource: "admin"})
mongoose.connect('mongodb://root:root@' + DB_service_url + '/sentiments', {authSource: "admin"})
.then(() => {
    // console.log("Connected to database");
    console.log("Connected to database: " + mongoose.connection.host);

    // check if Sentiment database exists
    const db = mongoose.connection.db;

    if (!db) {
        db.dropDatabase();
        console.log("Dropped database");
        db.createCollection("sentiments");
        console.log("Created database");
    }
})
.catch(error => console.log("DB_client failed: " + error));