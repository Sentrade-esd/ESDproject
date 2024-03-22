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
app.use(express.json());

// Handling GET request
app.get('/', (req, res) => { 
	res.send('A Google News Scraper '
		+ '/scrape/:query to have a suprise') 
	res.end()
})

// Handling POST follow trade
app.post('/followTrade/buy', async (req, res) => {
    let response;
    try {
        const {email, ticker, targetDate, buyAmountPerFiling, maxBuyAmount} = req.body;
        response = await followTrade(email, ticker, targetDate, buyAmountPerFiling, maxBuyAmount);
    }
    catch(error){
        console.log(error);
    }
    res.send(response);
    
});

async function followTrade(email, ticker, targetDate, buyAmountPerFiling, maxBuyAmount){
    // Promise request to get user account balance, stock price, senator filings
    let data = {};
    let updateBalanceStatus = await checkBalance(email, maxBuyAmount);
    if (updateBalanceStatus){
        try {
            let [
                stockPrice, 
                senatorFilings
                ] = await Promise.all([
                getStockPrice(ticker, targetDate),
                getSenatorFilings(ticker, targetDate),
            ]);

            console.log("Account Balance:" , updateBalanceStatus);
            // console.log("Stock Price:" , stockPrice);
            console.log("Senator Filings:" , senatorFilings);

            let filings = JSON.parse(senatorFilings.data);

            // Convert the file_date to a date string
            filings.forEach(filing => {
                let date = new Date(filing.file_date);
                let year = date.getFullYear();
                let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JavaScript
                let day = String(date.getDate()).padStart(2, '0');
                filing.file_date = `${year}-${month}-${day}`;
                date = new Date(filing.tx_date);
                year = date.getFullYear();
                month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JavaScript
                day = String(date.getDate()).padStart(2, '0');
                filing.tx_date = `${year}-${month}-${day}`;
                filing.file_price = stockPrice[filing.file_date]['4. close'];
                filing.tx_price = stockPrice[filing.tx_date]['4. close'];
            });

            // console.log(filings);
            data['filings']= filings;
            // give me the latest key of stock price
            data['email'] = email;
            data['currentPrice'] = stockPrice[Object.keys(stockPrice)[0]]['4. close'];
            data['maxBuyAmount'] = maxBuyAmount;
            data['buyAmountPerFiling'] = buyAmountPerFiling;
            const body =  {status: 'success', data};
            const response = await axios.post(`http://localhost:5004/followTradeTransaction`, body);
            console.log(response.data);
            boughtAmount = response.data['boughtAmount'];
            fractionalSharesBought = response.data['fractionalSharesBought'];
            PnL = response.data['PnL'];
            sellAmount = response.data['sellAmount'];

            return {status: 'success', data, boughtAmount: boughtAmount, fractionalSharesBought: fractionalSharesBought, PnL: PnL, sellAmount: sellAmount};
        } catch (error){
            console.log(error);
            return {status: 'error', data};
        }
    }
    else {
        return {status:'error', data: 'Insufficient funds to buy stock.'}
    }
}


async function checkBalance(email, amount){
    // Get account balance
    // return account balance
    let action = 'deduct';
    let accountBalance = 5000;
    console.log("Amount:", amount);

    if (action === "deduct") {
        // Add amount to account balance
        console.log('deducting')
        console.log("Acount Balance:", accountBalance);
        if (accountBalance < amount){
            return false;
        }else {
            accountBalance -= amount;
            return true;
        }
    }



    // try {
    //     let data = {};
    //     data['email']= email;
    //     // give me the latest key of stock price
    //     data['maxBuyAmount'] = maxBuyAmount;
    //     const body =  {status: 'success', data};
    //     const response = await axios.post(`http://localhost:5000/transactions/checkBalance`, body);
    //     // console.log(response.data);
    //     return response.data;
    // } catch (error) {
    //     console.error(`HTTP error! status: ${error.response.status}`);
    //     throw error;
    // }

}

async function getStockPrice(ticker, targetDate){
    try {
        const response = await axios.get(`http://localhost:5000/scraper/pullPrice/${ticker}/${targetDate}`);
        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(`HTTP error! status: ${error.response.status}`);
        throw error;
    }
}

async function getSenatorFilings(ticker, targetDate){
    try {
        const response = await axios.get(`http://localhost:5001/senatorFilings/getFilings/${ticker}/${targetDate}`);
        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(`HTTP error! status: ${error.response.status}`);
        throw error;
    }
}

// Port Number
const PORT = process.env.PORT ||5002;

// Server Setup
app.listen(PORT,console.log(
`Server started on port ${PORT}`));