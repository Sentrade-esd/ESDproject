// Requiring module
const express = require('express');

// Axios module
const axios = require('axios');

// dotenv
require('dotenv').config();

// Parser module
const xml2js = require('xml2js');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;

var request = require('request');


// Creating express object
const app = express();

// Handling GET request
app.get('/', (req, res) => { 
	res.send('A Google News Scraper '
		+ '/scrape/:query to have a suprise') 
	res.end()
})

// Handling POST follow trade
app.post('/followTrade', async (req, res) => {
    try {
        const {ticker, targetDate, buyAmount} = req.body;
        await followTrade(ticker, targetDate, buyAmount);
    }
    catch(error){
        console.log(error);
    }
});

async function followTrade(userid, ticker, targetDate, buyAmount){

    // Promise request to get user account balance, stock price, senator filings
    let [updateBalanceStatus, stockPrice, senatorFilings] = await Promise.all([
        updateBalance(userid, amount, action),
        getStockPrice(ticker, targetDate),
        getSenatorFilings(ticker, targetDate),
    ]);

    console.log("Account Balance:" , updateBalanceStatus);
    console.log("Stock Price:" , stockPrice);
    console.log("Senator Filings:" , senatorFilings);
}


async function updateBalance(userId, amount, action){
    // Get account balance
    // return account balance
    let accountBalance = 1000;

    if (action === "deduct") {
        // Add amount to account balance
        if (accountBalance < amount){
            throw new Error("Insufficient funds")
        }else {
            accountBalance -= amount;
            return true;
        }

    } else {
        // Subtract amount from account balance
        accountBalance += amount;
        return true;
    }
}

async function getStockPrice(ticker, targetDate){
    // Get stock price
    // call the endpoint of localHost:5000/pullPrice/:ticker
    let data = {};
    return fetch(`http://localhost:5000/scraper/pullPrice/${ticker}/${targetDate}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        return data;
    });
}


async function getSenatorFilings(ticker, targetDate){
    // Get senator filings
    // return senator filings
    let data = {};
    return fetch(`http://localhost:5001/senatorFilings/${ticker}/${targetDate}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }).then(data  => {
        console.log(data);
        return data;
    })
}

// Port Number
const PORT = process.env.PORT ||5002;

// Server Setup
app.listen(PORT,console.log(
`Server started on port ${PORT}`));