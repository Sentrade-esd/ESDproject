const { parentPort } = require('worker_threads');
const axios = require("axios");

const scraperDBMethods = require("./scraperDBmethods");

let puppeteer = require("puppeteer");

require("dotenv").config();

require("./scraperDBclient.js");

// Parser module
const xml2js = require("xml2js");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// Function to perform the CPU-bound task (e.g., scraping)
async function performScraping(query, ticker) {
    let url = `https://news.google.com/rss/search?q=${query}&hl=en-SG&gl=SG&ceid=SG:en`;
    let response = await axios.get(url);
    let content = response.data;
    // console.log(content);

    // Convert xml2js.parseString to return a Promise
    let result = await new Promise((resolve, reject) => {
        xml2js.parseString(content, function (err, result) {
        if (err) reject(err);
        else resolve(result);
        });
    });

    let items = result.rss.channel[0].item;

    let results = [];

    for (let i = 0; i < 80; i++) {
        let item = items[i];
        let title = item.title[0].split(" - ")[0];
        let pubDate = item.pubDate[0];
        // Change pubDate to sgt
        let date = new Date(pubDate);
        let sgtDate = new Date(date.getTime() + 8 * 60 * 60 * 1000); // SGT => UTC+8
        let datetime = sgtDate.toISOString();

        // Parse the HTML in the description to extract the text
        // let dom = new JSDOM(item.description[0]);
        // let description = dom.window.document.querySelector('a').textContent;

        // include obj in results only if the result is less than a week old
        if (date > new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)) {
        let link = item.link[0];
        let obj = {
            i,
            title,
            // description,
            link,
            datetime,
        };
        // console.log(obj);
        results.push(obj);
        }
    }

    // Now you can return items or use it elsewhere in your code
    // return items;
    // console.log('results: ', results);
    return results;
}

// Listen for messages from the main thread
parentPort.on('message', async message => {
    const { query, ticker } = message;
    
    try {
        // Perform CPU-bound task (e.g., scraping)
        const response = await performScraping(query, ticker);
        console.log('response', response);

        console.log('adding to db');
        let addToDBResponse = await scraperDBMethods.add(ticker, query, response);
        console.log('added to db');

        console.log('addToDBresponse: ', addToDBResponse);
        // res.send(response);
        // Send result back to the main thread
        parentPort.postMessage(response);
    } catch (error) {
        // Handle errors
        parentPort.postMessage({ error: error.message });
    }
});