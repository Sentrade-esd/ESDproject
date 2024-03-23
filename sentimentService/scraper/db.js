const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = 3001;


app.use(express.json());


const { Schema } = mongoose;
// const uri = "mongodb://127.0.0.1:27017/watchlist";

const DB_service_url = process.env.DB_URL || "mongodb://127.0.0.1:27017/scraperDB";
console.log('mongodb://' + DB_service_url + '/scraperDB')

mongoose.connect(DB_service_url, {})
// mongoose.connect(`${uri}/watchlist`, {})
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });


const newsSchema = new Schema({
  title: String, 
  description: String, 
  link: String, 
  pubDate: Date,
});



const scrapedCompaniesSchema = new Schema({
  ticker: { type: String, unique: true },
  companyName : { type: String },
  timeStamp: { type: Date },
  news: [newsSchema],
});

// Create the model from the schema
const scrapedCompanies = mongoose.model(
  "scrapedCompanies",
  scrapedCompaniesSchema
);

app.post("/scraperDB/add", async (req, res) => {
  const { ticker, companyName, news } = req.body;
  const timeStamp = new Date();

  try {
    const scrapedCompany  = await scrapedCompanies.findOneAndUpdate(
      { ticker: ticker },
      {
        companyName: companyName,
        timeStamp: timeStamp,
        $set: {news: news}
      },
      { new: true, upsert: true }
    );

    res.json({ scrapedCompany });
  } catch (err) {
    console.error("Error updating watchlist:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Remove a company from the watchlist

app.post("/scraperDB/remove", async (req, res) => {
  const { ticker } = req.body;

  try {
    await scrapedCompanies.deleteOne({ ticker: ticker });
    res.json({ message: "Company removed from the watchlist" });
  } catch (err) {
    console.error("Error removing company from watchlist:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
);

app.get("/scraperDB/get/:ticker", async (req, res) => {
  const { ticker } = req.params;

  try {
    const scrapedCompany = await scrapedCompanies.findOne({ ticker
    });
    res.json({ scrapedCompany });
  } catch (err) {
    console.error("Error getting company from watchlist:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
