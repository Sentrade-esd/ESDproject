const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
    title: String, 
    description: String, 
    link: String, 
    pubDate: Date,
  });

const scrapedCompaniesSchema = new mongoose.Schema({
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