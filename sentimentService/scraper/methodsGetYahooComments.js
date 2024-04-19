const { parentPort } = require("worker_threads");
let puppeteer = require("puppeteer");

require("dotenv").config();

require("./scraperDBclient.js");

const axios = require("axios");

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function performScraping(query) {

  let browser = await puppeteer.launch({
    headless: "new",
    // executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  let page = await browser.newPage();

  let url = `https://sg.finance.yahoo.com/quote/${query}/community`;
  // await page.goto(url);
  await page.goto(url, { waitUntil: "networkidle2" });

  await sleep(30000);
  const cookies = await page.cookies();
  const cookieHeader = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join(`; `);
  const xAccessToken = await page.evaluate(() => {
    return sessionStorage.getItem("x-access-token");
  });

  console.log("CookieHeader:", cookieHeader, "xAccessToken:", xAccessToken);
  await browser.close();

  var options = {
    'method': 'POST',
    'url': 'https://api-2-0.spot.im/v1.0.0/conversation/read',
    'headers': {
      'accept': 'application/json',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      'cookie': cookieHeader,
      'dnt': '1',
      'origin': 'https://openweb.jac.yahoosandbox.com',
      'referer': 'https://openweb.jac.yahoosandbox.com/2.0.0/safeframe.html',
      'sec-ch-ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'x-access-token': xAccessToken,
      'x-post-id': 'finmb$24937',
      'x-spot-id': 'sp_Rba9aFpG',
      'x-spotim-device-uuid': '8bb4f001-04d9-4787-b6ef-5ab7726a4432',
      'x-spotim-page-view-id': '4f23009e-0892-422d-ae32-cfb50c875235'
    },
    body: JSON.stringify({
      "sort_by": "newest",
      "offset": 0,
      "count": 10,
      "depth": 2,
      "child_count": 2
    })
  };
  
  let response = await axios(options);
  console.log(response.data);


  let data = {};
  
  // data.marketCap = await page.evaluate((marketCapSelector) => {
  //   return document.querySelector(marketCapSelector).innerText;
  // }, marketCapSelector);
  // data.avgVolume = await page.evaluate((avgVolumeSelector) => {
  //   return document.querySelector(avgVolumeSelector).innerText;
  // }, avgVolumeSelector);
  // data.previousClose = await page.evaluate((previousCloseSelector) => {
  //   return document.querySelector(previousCloseSelector).innerText;
  // }, previousCloseSelector);

  return data;

  
}

parentPort.on("message", async (message) => {
  const { ticker } = message;
  console.log("worker ticker", ticker);

  try {
    // let response = await scrapePrice(ticker);
    // console.log("Current Price: ", response);
    // res.send(response);

    let response = await performScraping(ticker);
    response.ticker = ticker;
    // console.log('response', response);
    parentPort.postMessage(response);
  } catch (error) {
    // Handle errors
    parentPort.postMessage({ error: error.message });
  }
});
