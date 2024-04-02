const {parentPort} = require('worker_threads');
let puppeteer = require("puppeteer");

require("dotenv").config();

require("./scraperDBclient.js");

async function performScraping(query) {
    let browser = await puppeteer.launch({
        headless: "new",
        executablePath: "/usr/bin/chromium",
        args: ["--no-sandbox"],
        });
        let page = await browser.newPage();

        let url = `https://sg.finance.yahoo.com/quote/${query}`;
        // await page.goto(url);
        await page.goto(url, { waitUntil: "networkidle2" });
        let priceSelector =
        "#quote-header-info > div.My\\(6px\\).Pos\\(r\\).smartphone_Mt\\(6px\\).W\\(100\\%\\) > div.D\\(ib\\).Va\\(m\\).Maw\\(65\\%\\).Ov\\(h\\) > div.D\\(ib\\).Mend\\(20px\\) > fin-streamer.Fw\\(b\\).Fz\\(36px\\).Mb\\(-4px\\).D\\(ib\\)";
        let alternatePriceSelector =
        "#quote-header-info > div.My\\(6px\\).Pos\\(r\\).smartphone_Mt\\(6px\\).W\\(100\\%\\) > div.D\\(ib\\).Va\\(m\\).Maw\\(65\\%\\).Ov\\(h\\) > div > fin-streamer.Fw\\(b\\).Fz\\(36px\\).Mb\\(-4px\\).D\\(ib\\) > span"; // Replace with your alternate selector
        // let descriptionSelector = 'p.Mt\\(15px\\).Lh\\(1.6\\)';
        let marketCapSelector = `[data-test="MARKET_CAP-value"]`;
        let avgVolumeSelector = `[data-test="AVERAGE_VOLUME_3MONTH-value"]`;
        let previousCloseSelector = '[data-test="PREV_CLOSE-value"]';

        let data = {};
        try {
        await page.waitForSelector(priceSelector, { timeout: 5000 }); // Wait for 5 seconds
        data.price = await page.evaluate((priceSelector) => {
            return document.querySelector(priceSelector).innerText;
        }, priceSelector);
        console.log("No Error, All is good");
        } catch (error) {
        console.log("Error in priceSelector", error);
        await page.waitForSelector(alternatePriceSelector, { timeout: 5000 }); // Wait for 5 seconds
        data.price = await page.evaluate((alternatePriceSelector) => {
            return document.querySelector(alternatePriceSelector).innerText;
        }, alternatePriceSelector);
        }

        data.marketCap = await page.evaluate((marketCapSelector) => {
        return document.querySelector(marketCapSelector).innerText;
        }, marketCapSelector);
        data.avgVolume = await page.evaluate((avgVolumeSelector) => {
        return document.querySelector(avgVolumeSelector).innerText;
        }, avgVolumeSelector);
        data.previousClose = await page.evaluate((previousCloseSelector) => {
        return document.querySelector(previousCloseSelector).innerText;
        }, previousCloseSelector);

        await browser.close();
        return data;
}

parentPort.on('message', async message => {
    const {ticker} = message;
    console.log('worker ticker', ticker);

    try {
        // let response = await scrapePrice(ticker);
        // console.log("Current Price: ", response);
        // res.send(response);

        let response = await performScraping(ticker);
        // console.log('response', response);
        parentPort.postMessage(response);

    } catch (error) {
        // Handle errors
        parentPort.postMessage({ error: error.message });
    }

});



