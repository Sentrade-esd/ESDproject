// Requiring module
const express = require("express");
const cors = require("cors");
const { Worker } = require('worker_threads');



// let puppeteer = require("puppeteer-extra");
let puppeteer = require("puppeteer");

require("dotenv").config();

require("./scraperDBclient.js");

// Axios module
const axios = require("axios");

// dotenv
require("dotenv").config();

// Parser module
const xml2js = require("xml2js");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const scraperDBMethods = require("./scraperDBmethods");

// const chromiumPath = process.env.CHROMIUM_PATH;

// Creating express object
const app = express();
app.use(cors());
// Handling GET request
app.get("/", (req, res) => {
  res.send(
    "A Google News Scraper " + "/scrape/:query/:ticker to have a suprise"
  );
  res.end();
});

app.get("/scraper/getNewsFromDB/:ticker", async (req, res) => {
  const { ticker } = req.params;
  console.log("ticker: ", ticker);

  try {
    let response = await scraperDBMethods.get(ticker);
    console.log("response", response);
    res.send(response);
  } catch (error) {
    console.error("An error occurred:", error);
    res
      .status(500)
      .send({ error: "An error occurred while fetching the data." });
  }
});

// Handling GET query scrape to news artcles about a company using the Google News
// app.get("/scraper/getNews/:query/:ticker", async (req, res) => {
//   const { query, ticker } = req.params;
//   console.log(query, ticker);

//   try {
//     // run scrapping script
//     let response = await scrape(query);

//     // call db endpoint to add to db for news
//     console.log("response: ", response);
//     let addToDBResponse = await scraperDBMethods.add(ticker, query, response);

//     // console.log('addToDBresponse', addToDBResponse);
//     res.send(response);
//   } catch (error) {
//     console.error("An error occurred:", error);
//     res
//       .status(500)
//       .send({ error: "An error occurred while fetching the data." });
//   }
// });

app.get("/scraper/getNews/:query/:ticker", async (req, res) => {
  const { query, ticker } = req.params;
  console.log(query, ticker);

  try {
    // Create a worker thread to perform CPU-bound task
    const worker = new Worker('./methodsGetNews.js');
    
    // Listen for messages from the worker thread
    worker.on('message', message => {
        // Send response back to the client
        res.send(message);
    });

    // Send message to worker thread with query and ticker
    worker.postMessage({ query, ticker });

  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send({ error: "An error occurred while fetching the data." });
  }
});

// Handling GET query scraper to scrape for the stock price using the Alpha Vantage API
app.get("/scraper/pullPrice/:ticker/:targetDate", async (req, res) => {
  const { ticker, targetDate } = req.params;
  console.log("Ticker: ", ticker, "TargetDate :", targetDate);

  try {
    // run scrapping script
    // return response
    let response = await stockPrice(ticker, targetDate);
    console.log("response", response);
    res.send(response);
  } catch (error) {
    console.error("An error occurred:", error);
    res
      .status(500)
      .send({ error: "An error occurred while fetching the data." });
  }
});

async function stockPrice(query, targetDate) {
  // replace the "demo" apikey below with your own key from https://www.alphavantage.co/support/#api-key
  // var url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${query}&interval=5min&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
  var url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${query}&outputsize=full&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;

  let response;

  try {
    response = await axios.get(url);
  } catch (error) {
    console.error(`HTTP error! status: ${error.response?.status}`);
    throw error;
  }

  if (response.status !== 200) {
    console.log("Status", response.status);
  } else {
    let data = response.data;
    console.log("data", data);

    let refreshDate = new Date(data["Meta Data"]["3. Last Refreshed"]); // format: "2024-03-28"

    let metaData = data["Meta Data"];
    let prices = data["Time Series (Daily)"];

    // find number of days targetDate to today Date
    let today = new Date();
    let target = new Date(targetDate);
    let diffTime = Math.abs(today - target);
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let returnList = {};
    let n = 0;
    for (let dateKey of Object.keys(prices)) {
      if (n === diffDays) {
        break;
      }
      returnList[dateKey] = prices[dateKey];
      n += 1;
    }

    return { prices: returnList, refreshDate: refreshDate };
    // return returnList;
  }

  
  return response;
}

// Handling to get the currentPrice from yahoo finance
app.get("/scraper/scrapeCurrentPrice", async (req, res) => {
  // const {ticker} = req.params;
  let ticker = req.query.ticker || null;
  let company = req.query.company || null;

  if (!ticker && company) {
    console.log("getting ticker");
    ticker = await convertCompanyToTicker(company);
  }

  console.log("Ticker: ", ticker);

  try {


    const worker = new Worker('./methodsGetCurrentPrice.js');
    
    // Listen for messages from the worker thread
    worker.on('message', message => {
        // Send response back to the client
        res.send(message);
    });

    // Send message to worker thread with query and ticker
    worker.postMessage({ ticker });


  } catch (error) {
    console.error(error);
    // return 500 with error message
    res.status(500).send("Error: " + error);
  }
});

async function convertCompanyToTicker(company) {
  // Get company ticker
  // let keys = ["GIEADKJM8OSQN0AR", "TQXOA5D8XQ2ATY3J", "GIC3VJ1I8N8DXJAO"];
  let keys = ["5BUS8YPR47FLW0EI","UQU1R3C26QP6KHZN", "YLGQRGQIJKRT0AWI", "GIEADKJM8OSQN0AR", "TQXOA5D8XQ2ATY3J", "GIC3VJ1I8N8DXJAO"]
  
  let key = keys[Math.floor(Math.random() * keys.length)];

  // let company = company
  let url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${company}&apikey=${key}`;

  const response = await axios.get(url);
  console.log(response.data)
  ticker = response.data["bestMatches"][0]["1. symbol"];
  // ticker = response.data.bestMatches[0]["1. symbol"];

  return ticker;
}

// Port Number
const PORT = process.env.PORT || 5000;

// Server Setup
app.listen(PORT, console.log(`Server started on port ${PORT}`));
