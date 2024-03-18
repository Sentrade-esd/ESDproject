const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;
app.use(express.json());
const { Schema } = mongoose;
const uri = "mongodb://127.0.0.1:27017/watchlist";
mongoose
  .connect(uri, {})
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

const watchlistedCompaniesSchema = new Schema({
  _id: { type: String, alias: "userID", unique: true },
  teleId: { type: String, alias: "teleID", unique: true },
  watchlistedCompanies: [String],
});

// Create the model from the schema
const WatchlistedCompanies = mongoose.model(
  "WatchlistedCompanies",
  watchlistedCompaniesSchema
);
const companyWatchlistersSchema = new Schema({
  _id: { type: String, alias: "company", unique: true },
  watchlisters: [String],
});

const CompanyWatchlisters = mongoose.model(
  "CompanyWatchlisters",
  companyWatchlistersSchema
);
app.post("/watchlist/add", async (req, res) => {
  const { userID, teleID, watchlistedCompany } = req.body;

  try {
    const watchlist = await WatchlistedCompanies.findOneAndUpdate(
      { _id: userID },
      {
        teleId: teleID,
        $addToSet: { watchlistedCompanies: watchlistedCompany },
      },
      { new: true, upsert: true }
    );
    const watchlisters = await CompanyWatchlisters.findOneAndUpdate(
      { _id: watchlistedCompany },
      {
        $addToSet: { watchlisters: teleID },
      },
      { new: true, upsert: true }
    );

    res.json({ watchlist, watchlisters });
  } catch (err) {
    console.error("Error updating watchlist:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.post("/watchlist/remove", async (req, res) => {
  const { userID, teleId, watchlistedCompany } = req.body;

  try {
    const watchlist = await WatchlistedCompanies.findOneAndUpdate(
      { _id: userID },
      { $pull: { watchlistedCompanies: watchlistedCompany } },
      { new: true }
    );
    const watchlisters = await CompanyWatchlisters.findOneAndUpdate(
      { _id: watchlistedCompany },
      { $pull: { watchlisters: teleId } },
      { new: true }
    );

    res.json({ watchlist, watchlisters });
  } catch (err) {
    console.error("Error updating watchlist:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/watchlist/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const watchlist = await WatchlistedCompanies.findOne({ _id: userId });
    if (!watchlist) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(watchlist.watchlistedCompanies);
  } catch (err) {
    console.error("Error getting watchlist:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/watchlist/company/:company", async (req, res) => {
  const { company } = req.params;

  try {
    const watchlist = await CompanyWatchlisters.findOne({ _id: company });
    if (!watchlist) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(watchlist.watchlisters);
  } catch (err) {
    console.error("Error getting watchlist:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
