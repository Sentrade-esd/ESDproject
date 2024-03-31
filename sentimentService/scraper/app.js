// Requiring module
const express = require('express');
// let puppeteer = require("puppeteer-extra");
let puppeteer = require("puppeteer");


require("dotenv").config();

require('./scraperDBclient.js');


// Axios module
const axios = require('axios');

// dotenv
require('dotenv').config();

// Parser module
const xml2js = require('xml2js');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const scraperDBMethods = require('./scraperDBmethods');


// const chromiumPath = process.env.CHROMIUM_PATH;


// Creating express object
const app = express();

// Handling GET request
app.get('/', (req, res) => { 
	res.send('A Google News Scraper '
		+ '/scrape/:query/:ticker to have a suprise') 
	res.end()
})

app.get ('/scraper/getNewsFromDB/:ticker', async (req, res) => {
    const { ticker } = req.params;
    console.log('ticker: ', ticker);
    
    try {
        let response = await scraperDBMethods.get(ticker);
        console.log('response', response);
        res.send(response);
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).send({ error: 'An error occurred while fetching the data.' });
    }

});

// Handling GET query scrape to news artcles about a company using the Google News
app.get('/scraper/getNews/:query/:ticker', async (req, res) => { 
    const {query, ticker} = req.params;
    console.log(query, ticker);
    
    try {
        // run scrapping script
        let response = await scrape(query);
    
        // call db endpoint to add to db for news
        console.log('response: ', response);
        let addToDBResponse = await scraperDBMethods.add(ticker, query, response);
    
        // console.log('addToDBresponse', addToDBResponse);
        res.send(response);
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).send({ error: 'An error occurred while fetching the data.' });
    }
})

async function scrape(query){
    let url = `https://news.google.com/rss/search?q=${query}&hl=en-SG&gl=SG&ceid=SG:en`
    let response = await axios.get(url);
    let content = response.data;
    // console.log(content);

    // Convert xml2js.parseString to return a Promise
    let result = await new Promise((resolve, reject) => {
        xml2js.parseString(content, function (err, result){
            if (err) reject(err);
            else resolve(result);
        });
    });

    let items = result.rss.channel[0].item;

    let results = [];

    for(let i = 0; i < 80; i++) {
        let item = items[i];
        let title = item.title[0].split(" - ")[0];
        let pubDate = item.pubDate[0];
        // Change pubDate to sgt
        let date = new Date(pubDate);
        let sgtDate = new Date(date.getTime() + 8*60*60*1000); // SGT => UTC+8
        let datetime = sgtDate.toISOString();

        
        // Parse the HTML in the description to extract the text
        // let dom = new JSDOM(item.description[0]);
        // let description = dom.window.document.querySelector('a').textContent;

        // include obj in results only if the result is less than a week old
        if (date > new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)){
            let link = item.link[0];
            let obj = {
                i,
                title,
                // description,
                link,
                datetime
            }
            // console.log(obj);
            results.push(obj);
        }

    }

    // Now you can return items or use it elsewhere in your code
    // return items;
    // console.log('results: ', results);
    return results;
}


async function addToDB(ticker, query, news){
    let response;
    try {
        // const {email, ticker, targetDate, buyAmountPerFiling, maxBuyAmount} = req.body;
        let body = {
            ticker: ticker,
            companyName: query,
            news: news
        }
       response = await scraperDBMethods.add();
    }
    catch(error){
        console.log(error);
    }
    return response.data;

}

// Handling GET query scraper to scrape for the stock price using the Alpha Vantage API
app.get('/scraper/pullPrice/:ticker/:targetDate', async (req, res) => { 
    const {ticker, targetDate} = req.params;
    console.log("Ticker: ", ticker, "TargetDate :", targetDate);
    
    try {
        // run scrapping script
        // return response
        let response = await stockPrice(ticker, targetDate);
        console.log('response', response);
        res.send(response);
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).send({ error: 'An error occurred while fetching the data.' });
    }
})

async function stockPrice(query, targetDate){

    // replace the "demo" apikey below with your own key from https://www.alphavantage.co/support/#api-key
    // var url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${query}&interval=5min&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
    var url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${query}&outputsize=full&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;

    let response; 

    try {
    response = await axios.get(url);
    } catch(error){
        console.error(`HTTP error! status: ${error.response?.status}`);
        throw error;
    }

    if (response.status !== 200){
        console.log("Status", response.status);
    }
    else {
        let data = response.data;
        console.log("data", data);
        let metaData = data['Meta Data'];
        let prices = data['Time Series (Daily)'];

        // find number of days targetDate to today Date
        let today = new Date();
        let target = new Date(targetDate);
        let diffTime = Math.abs(today - target);
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let returnList = {};
        let n = 0;
        for (let dateKey of Object.keys(prices)){
            if (n === diffDays){
                break;
            }
            returnList[dateKey] = prices[dateKey];
            n += 1;
        }

        console.log("return List:" ,returnList);

        // let timeSeries = data['Time Series (5min)'];
        // let firstKey = Object.keys(timeSeries)[0];

        // parsedData =
        // {
        //     "symbol": data["Meta Data"]["2. Symbol"],
        //     "lastRefreshed": data["Meta Data"]["3. Last Refreshed"],
        //     "interval": data["Meta Data"]["4. Interval"],
        //     "price":{
        //         "open": timeSeries[firstKey]['1. open'],
        //         "high": timeSeries[firstKey]['2. high'],
        //         "low": timeSeries[firstKey]['3. low'],
        //         "close": timeSeries[firstKey]['4. close'],
        //         "volume": timeSeries[firstKey]['5. volume']
        //     }
        // }
        // console.log("cleaned data: ", parsedData);
        return returnList;
    }

    // let parsedData = {};
    // let response = axios.get({
    //     url: url,
    //     json: true,
    //     headers: {'User-Agent': 'request'}
    // }, (err, res, data) => {
    //     if (err) {
    //     console.log('Error:', err);
    //     } else if (res.statusCode !== 200) {
    //     console.log('Status:', res.statusCode);
    //     } else {
    //     // data is successfully parsed as a JSON object:
    //     console.log('data', data);
    //     let timeSeries = data['Time Series (5min)'];
    //     let firstKey = Object.keys(timeSeries)[0];

    //     parsedData = 
    //     {
    //         "symbol": data["Meta Data"]["2. Symbol"],
    //         "lastRefreshed": data["Meta Data"]["3. Last Refreshed"],
    //         "interval": data["Meta Data"]["4. Interval"],
    //         "price":{
    //             "open": timeSeries[firstKey]['1. open'],
    //             "high": timeSeries[firstKey]['2. high'],
    //             "low": timeSeries[firstKey]['3. low'],
    //             "close": timeSeries[firstKey]['4. close'],
    //             "volume": timeSeries[firstKey]['5. volume']
    //         }
    //     }
    //     console.log("cleaned data: ", parsedData);
    //     return parsedData;
    //     }
    // });
    return response;
}

// Handling to get the currentPrice from yahoo finance
app.get('/scraper/scrapeCurrentPrice', async (req, res) => { 
    // const {ticker} = req.params;
    let ticker = req.query.ticker || null
    let company = req.query.company || null

    if (!ticker && company){
        console.log("getting ticker");
        ticker = await convertCompanyToTicker(company)
    }

    console.log("Ticker: ", ticker);

    try {
        let response = await scrapePrice(ticker);
        console.log('Current Price: ', response);
        res.send(response);
    } catch (error) {
        console.error(error);
        // return 500 with error message
        res.status(500).send("Error: " + error);
    }

})

async function convertCompanyToTicker(company){

    // Get company ticker
    key = "YJ3Q75JEFR08G0VB"
    // let company = company
    let url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${company}&apikey=${key}`

    const response = await axios.get(url);
    ticker = response.data.bestMatches[0]["1. symbol"];

    return ticker

}


async function scrapePrice(query) {
    // let browser = await puppeteer.launch({
    //     args: chromium.args,
    //     defaultViewport: chromium.defaultViewport,
    //     executablePath: await chromium.executablePath(),
    //     headless: chromium.headless,
    // });
    let browser = await puppeteer.launch({ 
        headless: 'new', 
        executablePath:'/usr/bin/chromium',
        args: ['--no-sandbox']
    });
    let page = await browser.newPage();

    let url = `https://sg.finance.yahoo.com/quote/${query}`;
    // await page.goto(url);
    await page.goto(url, {waitUntil: 'networkidle2'});
    let priceSelector = '#quote-header-info > div.My\\(6px\\).Pos\\(r\\).smartphone_Mt\\(6px\\).W\\(100\\%\\) > div.D\\(ib\\).Va\\(m\\).Maw\\(65\\%\\).Ov\\(h\\) > div.D\\(ib\\).Mend\\(20px\\) > fin-streamer.Fw\\(b\\).Fz\\(36px\\).Mb\\(-4px\\).D\\(ib\\)';
    let alternatePriceSelector = '#quote-header-info > div.My\\(6px\\).Pos\\(r\\).smartphone_Mt\\(6px\\).W\\(100\\%\\) > div.D\\(ib\\).Va\\(m\\).Maw\\(65\\%\\).Ov\\(h\\) > div > fin-streamer.Fw\\(b\\).Fz\\(36px\\).Mb\\(-4px\\).D\\(ib\\) > span'; // Replace with your alternate selector

    let data;
    try {
        await page.waitForSelector(priceSelector, { timeout: 5000 }); // Wait for 5 seconds
        data = await page.evaluate((priceSelector) => {
            return document.querySelector(priceSelector).innerText;
        }, priceSelector);
    } catch (error) {
        await page.waitForSelector(alternatePriceSelector, { timeout: 5000 }); // Wait for 5 seconds
        data = await page.evaluate((alternatePriceSelector) => {
            return document.querySelector(alternatePriceSelector).innerText;
        }, alternatePriceSelector);
    }

    await browser.close();
    return data;
}

// Port Number
const PORT = process.env.PORT ||5000;

// Server Setup
app.listen(PORT,console.log(
`Server started on port ${PORT}`));