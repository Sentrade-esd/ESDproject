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
    headless: 'new',
    // executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  let page = await browser.newPage();

  let url = `https://finance.yahoo.com/quote/${query}/community`;
  // await page.goto(url);

  let headers = {};
  let postData = {};

  let requestIntercepted = false;

  // Prepare to capture the request
  page.on('request', async interceptedRequest => {
    if (interceptedRequest.url().includes('api-2-0.spot.im/v1.0.0/conversation/read') && interceptedRequest.method() === 'POST') {
      headers = interceptedRequest.headers();
      postData = interceptedRequest.postData();

      console.log("Captured Headers:", headers);
      console.log("Captured Post Data:", postData);
      console.log("Captured URL:", interceptedRequest.url());

      requestIntercepted = true;

    }
  });

  // await page.goto(url, { waitUntil: "networkidle2" });
  await page.goto(url);
// Scroll to the middle of the page
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight / 2);
  });


  console.log("Waiting for request to be intercepted:", requestIntercepted);
  // Wait for the request to be intercepted
  while (!requestIntercepted) {
    await sleep(1000);
    console.log("Sleeping 1s")
  }

  await browser.close();

  var options = {
    'method': 'POST',
    'url': 'https://api-2-0.spot.im/v1.0.0/conversation/read',
    'headers': {
      'authority': 'api-2-0.spot.im', //accurate
      'accept': 'application/json', //accurate
      'accept-language': 'en-US,en;q=0.9', //accurate
      'content-type': 'application/json', // accurate
      'Cookie': `device_uuid=${headers["x-spotim-device-uuid"]}; access_token=${headers["x-access-token"]}; device_uuid=${headers["x-spotim-device-uuid"]}`,
      // 'cookie': `device_uuid=${headers["x-spotim-device-uuid"]}`, // accurate
      'origin': 'https://openweb.jac.yahoosandbox.com', // accurate
      'referer': 'https://openweb.jac.yahoosandbox.com/2.0.0/safeframe.html',  // accurate
      'sec-ch-ua': '"Chromium";v="121", "Not A(Brand";v="99"',
      'sec-ch-ua-mobile': '?0', // accurate
      'sec-ch-ua-platform': '"macOS"', // accurate
      'sec-fetch-dest': 'empty', // accurate
      'sec-fetch-mode': 'cors', // accurate
      'sec-fetch-site': 'cross-site', // accurate
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36', // accurate
      'x-access-token': headers["x-access-token"],  // accurate
      'x-post-id': headers["x-post-id"],  // accurate
      'x-spot-id': headers["x-spot-id"],  // accurate
      'x-spotim-device-uuid': headers["x-spotim-device-uuid"],  // accurate
      'x-spotim-page-view-id': headers["x-spotim-page-view-id"],  // accurate
    },
    data:{
      "sort_by": "best",
      "offset": 0,
      "count": 30,
      "depth": 2,
      "child_count": 2,
      "conversation_id": `${headers["x-spot-id"]}${headers["x-post-id"]}`,
    }
  };

  // let response = await request(options);
  let response = await axios(options);
  let parsedResponse = response.data;
  let comments = parsedResponse["conversation"].comments;
  let data = [];

  comments.map((comment) => {
    data.push(comment.content[0].text);
  });

  // let comments = parsedResponse["conversation"]['comments']
  // let comments = JSON.parse(response).conversation.comments;
  // let commentsBody = [];
  // comments.map((comment)=> {
  //   console.log("Comment:", comment.content.text);
  //   commentsBody.push(comment.content.text);
  // })



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
    if (response) {
        response.ticker = ticker;
        parentPort.postMessage(response);
    } else {
        parentPort.postMessage({ error: "Failed to get response" });
    }
    // let response = await performScraping(ticker);
    // response.ticker = ticker;
    // // console.log('response', response);
    // parentPort.postMessage(response);
  } catch (error) {
    // Handle errors
    parentPort.postMessage({ error: error.message });
  }
});
