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


const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };
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

async function performScrapingComments(query, ticker) {
  let browser = await puppeteer.launch({
    headless: 'new',
    // executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  let page = await browser.newPage();

  let url = `https://finance.yahoo.com/quote/${ticker}/community`;
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

  await page.goto(url, { waitUntil: "networkidle2" });
  // await page.goto(url);
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
    // console.log(comment);
    let commentDetails = {}
    commentDetails.title = comment.content[0].text;
    commentDetails.link = "COMMENT";
    commentDetails.dateTime = new Date(comment["written_at"] * 1000).toISOString();
    data.push(commentDetails);
    // data.push(comment.content[0].text);
  });

  console.log("Done scraping Comments");

  // let comments = parsedResponse["conversation"]['comments']
  // let comments = JSON.parse(response).conversation.comments;
  // let commentsBody = [];
  // comments.map((comment)=> {
  //   console.log("Comment:", comment.content.text);
  //   commentsBody.push(comment.content.text);
  // })



  return data;

  
}

// Listen for messages from the main thread
parentPort.on('message', async message => {
    const { query, ticker } = message;
    
    try {
        // Perform CPU-bound task (e.g., scraping)
        const response = await performScraping(query, ticker);
        const responseComments = await performScrapingComments(query, ticker);

        console.log('adding to db');
        let addToDBResponse = await scraperDBMethods.add(ticker, query, response);
        console.log('added to db');

        // console.log('addToDBresponse: ', addToDBResponse);

        // // add responseComments list into response
        // let combinedResponse = [...response, ...responseComments];
        // console.log(combinedResponse);
        let n = 1;
        let lastNumber = response[response.length-1]["i"];
        console.log(lastNumber);
        if(responseComments.length > 0){
        for (let i = 0; i < responseComments.length; i ++ ){
            let body = {};
            body["i"] = n + lastNumber;
            body["title"] = responseComments[i].title;
            body ["link"] = responseComments[i].link;
            body["datetime"] = responseComments[i].dateTime;
            // console.log(body);
            response.push(body);
            n++
          }
        }
        console.log("Response:", response)


        parentPort.postMessage(response);
    } catch (error) {
        // Handle errors
        parentPort.postMessage({ error: error.message });
    }
});