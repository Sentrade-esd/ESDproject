const mongoose = require("mongoose");

// const newsSchema = new mongoose.Schema({
//     title: String, 
//     description: String, 
//     link: String, 
//     pubDate: Date,
//   });

const scrapedCompaniesSchema = new mongoose.Schema({
    ticker: { type: String, unique: true },
    companyName : { type: String },
    timeStamp: { type: Date },
    news: {type: Object},
});
  
// Create the model from the schema
const scrapedCompanies = mongoose.model(
"scrapedCompanies",
scrapedCompaniesSchema
);

const methods = {
    add: async (ticker, companyName, news) => {
      const timeStamp = new Date();
  
      try {
        const scrapedCompany  = await scrapedCompanies.findOneAndUpdate(
          { ticker: ticker },
          {
            companyName: companyName,
            timeStamp: timeStamp,
            news: news
          },
          { new: true, upsert: true }
        );
  
        return { scrapedCompany };
      } catch (err) {
        console.error("Error updating watchlist:", err);
        throw new Error("Internal server error");
      }
    },
  
    remove: async (ticker) => {
      try {
        await scrapedCompanies.deleteOne({ ticker: ticker });
        return { message: "Company removed from the watchlist" };
      } catch (err) {
        console.error("Error removing company from watchlist:", err);
        throw new Error("Internal server error");
      }
    },
  
    get: async (ticker) => {
      try {
        const scrapedCompany = await scrapedCompanies.findOne({ ticker });
        return { scrapedCompany };
      } catch (err) {
        console.error("Error getting company from watchlist:", err);
        throw new Error("Internal server error");
      }
    }
  };
  
module.exports = methods;



