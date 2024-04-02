// Requiring module
const express = require('express');
const cors = require('cors');

// Axios module
const axios = require('axios');

// dotenv
require('dotenv').config();

// Parser module
const xml2js = require('xml2js');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;

var request = require('request');

const TRANSACTION_URL = process.env.TRANSACTION_URL || 'http://localhost:5004/';
const SCRAPER_URL = process.env.SCRAPER_URL || 'http://localhost:5000/';
const SENATOR_URL = process.env.SENATOR_URL || 'http://localhost:5001/';


// Creating express object
const app = express();
app.use(express.json());
app.use(cors());
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
        const {userId, email, ticker, targetDate, buyAmountPerFiling, maxBuyAmount, company} = req.body;
        console.log(userId);
        response = await followTrade(userId, email, ticker, targetDate, buyAmountPerFiling, maxBuyAmount,company);
    }
    catch(error){
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
    res.send(response);
    
});

async function followTrade(userId, email, ticker, targetDate, buyAmountPerFiling, maxBuyAmount, company){
    // Promise request to get user account balance, stock price, senator filings
    let data = {};
    let updateBalanceStatus = await checkBalance(userId, maxBuyAmount);
    // let updateBalanceStatus = true;
    if (updateBalanceStatus.data == true){
        try {
            let [
                stockPrice, 
                senatorFilings
                ] = await Promise.all([
                getStockPrice(ticker, targetDate),
                getSenatorFilings(ticker, targetDate),
            ]);

            console.log("Account Balance:" , updateBalanceStatus.data);
            // console.log("Stock Price:" , stockPrice);
            console.log("Senator Filings:" , senatorFilings);

            let refreshDate = new Date(stockPrice.refreshDate) // assume this is date object
            stockPrice = stockPrice.prices;

            let filings = JSON.parse(senatorFilings.data);
            // console.log(refreshDate);
            // console.log(typeof refreshDate);

            // Convert the file_date to a date string
            let filingsWithPrice = [];

            for (let i = 0; i < filings.length; i++) {
                let filing = filings[i];

                if (new Date(filing.file_date)  > refreshDate || new Date(filing.tx_date) > refreshDate){
                    continue;  
                } else {
                    
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
    
                    console.log(filing.file_date , filing.tx_date);
    
                    filing.file_price = stockPrice[filing.file_date]['4. close'];
                    filing.tx_price = stockPrice[filing.tx_date]['4. close'];

                    filingsWithPrice.push(filing);
                }
            };

            if (filingsWithPrice.length == 0){
                return {status: 'error', data: 'No filings found for the given date.'}
            }

            data['ticker'] = ticker;
            // console.log(filings);
            data['filings']= filingsWithPrice;
            // give me the latest key of stock price
            data['userId'] = userId;
            data['currentPrice'] = stockPrice[Object.keys(stockPrice)[0]]['4. close'];
            data['maxBuyAmount'] = maxBuyAmount;
            data['buyAmountPerFiling'] = buyAmountPerFiling;

            // TESTING CODE HERE
            data["company"] = company
            data["email"] = email
            // TESTING CODE ENDS


            const body =  {status: 'success', data};
            console.log(`${TRANSACTION_URL}followTradeTransaction`);
            console.log(body);
            const response = await axios.post(`${TRANSACTION_URL}followTradeTransaction`, body);
            
            console.log("This is response from transactions", response.data);
            let buyAmount = response.data.data['buyAmount'];
            let sellAmount = response.data.data['sellAmount'];
            let totalAccountValue = response.data.data['totalAccountValue'];
            // let fractionalSharesBought = response.data['fractionalSharesBought'];
            // let PnL = response.data['PnL'];

            // return {status: 'success', data, boughtAmount: boughtAmount, fractionalSharesBought: fractionalSharesBought, PnL: PnL, sellAmount: sellAmount, company: company};
            // return {status: 'success', data, boughtAmount: boughtAmount, fractionalSharesBought: fractionalSharesBought, PnL: PnL, sellAmount: sellAmount};
            return {status: 'success', buyAmount: buyAmount, sellAmount: sellAmount, totalAccountValue: totalAccountValue, data};
        } catch (error){
            console.log(error);
            return {status: 'error', error};
        }
    }
    else {
        return {status:'error', data: 'Insufficient funds to buy stock.'}
    }
}


async function checkBalance(userId, maxBuyAmount){
    // Get account balance
    // return account balance
    // let action = 'deduct';
    // let accountBalance = 5000;
    // console.log("Amount:", amount);

    try {
        let data = {};
        data['userId']= userId;
        // give me the latest key of stock price
        data['maxBuyAmount'] = maxBuyAmount;
        console.log(data);
        // const body =  data;
        const response = await axios.post(`${TRANSACTION_URL}checkBalance`, data);
        // console.log(response.data);
        return response;
    } catch (error) {
        console.error(`HTTP error! status: ${error.response.status}`);
        throw error;
    }

    // if (action === "deduct") {
    //     // Add amount to account balance
    //     console.log('deducting')
    //     console.log("Acount Balance:", accountBalance);
    //     if (accountBalance < amount){
    //         return false;
    //     }else {
    //         accountBalance -= amount;
    //         return true;
    //     }
    // }


}

async function getStockPrice(ticker, targetDate){
    // try {
    //     const response = await axios.get(`${SCRAPER_URL}/scraper/pullPrice/${ticker}/${targetDate}`);
    //     // console.log(response.data);
    //     return response.data;
    // } catch (error) {
    //     console.error(`HTTP error! status: ${error.response.status}`);
    //     throw error;
    // }
    try {
        const response = await axios.get(`${SCRAPER_URL}scraper/pullPrice/${ticker}/${targetDate}`);
        if (!response) {
            console.error('No response received from the request');
            return;
        }
        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(`HTTP error! status: ${error.response?.status}`);
        throw error;
    }
}

async function getSenatorFilings(ticker, targetDate){
    try {
        const response = await axios.get(`${SENATOR_URL}senatorFilings/getFilings/${ticker}/${targetDate}`);
        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(`HTTP error! status: ${error.response}`);
        throw error;
    }
}

// Port Number
const PORT = process.env.PORT ||5002;

// Server Setup
app.listen(PORT,console.log(
`Server started on port ${PORT}`));