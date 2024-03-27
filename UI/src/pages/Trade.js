import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsonData from '../test.json';
// import WordCloud from 'react-wordcloud';
import { useLocation } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import WordCloud from '../components/wordCloud.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function Trade() {
    // const [data, setData] = useState(null);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             // const response = await axios.get('https://microservice-endpoint-url'); // This will be the microserivce eventually
    //             setData(response.data);
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         }
    //     };

    //     fetchData();
    // }, []);

    // return (
    //     <div>
    //         <h2>New Page</h2>
    //         {data && (
    //             <div>
    //                 <p>{data.title}</p>
    //                 <p>{data.description}</p>
    //             </div>
    //         )}
    //     </div>
    // );
    
    // This is the company and ticker information coming over from search
    const location = useLocation();
    const companyName = location.state?.companyName;
    const companySymbol = location.state?.companySymbol;
    
    const keywordData = jsonData.result.keyword;
    const emotionData = jsonData.result.emotion;

    // Convert the keyword data object into an array of objects with text and value properties
    const keywords = Object.entries(keywordData).map(([text, value]) => ({ text, value }));
    const emotions = Object.entries(emotionData).map(([text, value]) => ({ text, value }));
    
    const options = {
        rotations: 0,
        rotationAngles: [0, 0],
        fontSizes: [24, 96],
    };

    const { search, sentiment_score } = jsonData.result;

    const [comment, setComment] = useState('');

    const handleCommentSubmit = () => {
        var commentsArr = [];
        if(comment) {
           // Should send User ID and update the comments database through the endpoint provided by microservice
        //    console.log(comment);

           setComment('');
            // Company, Comment IF NOT SURE FOLLOW DOCS
            // When comment made, it comes in as array, need to shift right to add the new comment
            // Locally, the user will see all the comments he make plus the 5 from DB
            // Stored as dict key = company value = comment

        }
        localStorage.setItem("Comments",commentsArr.unshift(comment));

    };

    const handleFollowTrade = async() => {
        // Should be calling FollowTrades here
        // Store this email, ticker, targetDate, buyAmountPerFiling, maxBuyAmount and send

    };

    const handleBuyStock = async () => {
        // Should be calling Transaction here
        // Store company name, id, email, buy amount
        let url = "http://localhost:6002/transaction/newTrade";
        
        let data = {
            UserID: localStorage.getItem("id"),
            Email: localStorage.getItem("username"),
            Company: localStorage.getItem("companyName"),
            buyAmount: tradeAmount,
            Threshold: threshold
        }

        try {
            let response = await axios.post(url, data);
            console.log(response.data);
            alert('Transaction successful');
        } catch (error) {
            console.error(error);
            alert('Unable to process the transaction');
        }
    };

    const handleSellStock = async () => {
        // Should be calling FollowTrades here
        // Store this email, ticker, targetDate, buyAmountPerFiling, maxBuyAmount and send
        let url = "http://localhost:6002/transaction/newTrade";
        
        let data = {
            UserID: localStorage.getItem("id"),
            Email: localStorage.getItem("username"),
            Company: localStorage.getItem("companyName"),
            buyAmount: tradeAmount
        }

        try {
            let response = await axios.post(url, data);
            console.log(response.data);
            alert('Transaction successful');
        } catch (error) {
            console.error(error);
            alert('Unable to process the transaction');
        }
    };

    const [tradeAmount, setTradeAmount] = useState(0);
    const [maxBuy, setMaxBuy] = useState(0);
    const [threshold, setStopLoss] = useState(0);

    const MyWordCloud = React.memo(({ words, options }) => 
    <div style={{width: '600px', height: '400px'}}>
        <WordCloud words={words} options={options} />
    </div>
);

const [startDate, setStartDate] = useState(new Date());
const endDate = new Date(); // Current date

    return (
        <div>
            <div className="container">
                <div className="row">
                    <div className="col-md-6 mt-3">
                        <h2>{companyName}</h2>
                        <p>Search Term: {companyName}</p>
                        <p>Ticker: {companySymbol}</p>
                        <p>Sentiment Score: {sentiment_score}</p>

                        <Form.Group>
                            <Form.Control
                            type="number"
                            id="tradeAmount"
                            name="tradeAmount"
                            value={tradeAmount}
                            onChange={(e) => setTradeAmount(e.target.value)}
                            />
                        </Form.Group>

                        <Button variant="primary" onClick={handleBuyStock} className="mt-3">Buy Stock</Button>
                        <Button variant="primary" onClick={handleSellStock} className="mt-3">Sell Stock</Button>


                        <h3>Date Range:</h3>
                        <div>
                            Start Date: <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} maxDate={endDate} />
                        </div>
                        <div>
                            End Date: {endDate.toLocaleDateString()}
                        </div>
                        
                        <div>
                            <h3>Max buy amount per filling ($)</h3>
                        </div>
                        <Form.Group>
                            <Form.Control
                            type="number"
                            id="maxBuy"
                            name="maxBuy"
                            value={maxBuy}
                            onChange={(e) => setMaxBuy(e.target.value)}
                            />

                            <Form.Control
                                    type="number"
                                    id="stopLoss"
                                    name="stopLoss"
                                    min="0"
                                    max="100"
                                    step="5"
                                    aria-label="Stop Loss Input"
                                    onChange={(e) => setStopLoss(e.target.value)}
                                />
                        </Form.Group>

                        <Button variant="primary" onClick={handleFollowTrade} className="mt-3">Follow Trade</Button>
                        
                    </div>

                        {/* It will re-render everyime when someone types something in the comment box. Hard limitation of the library used.
                        Can be done with lower level libraries but is very time intensive. Leave it as is? */}
                    <div className="col-md-6">
                        <MyWordCloud words={emotions} options={options} />
                    </div>
                </div>
            </div>

            {/* <div style={{width: '600px', height: '400px'}}>
                <WordCloud words={emotions} options={options} />
            </div> */}
            <hr></hr>
            <div className="m-3 p-3 shadow-sm rounded bg-light">
                <Form.Group controlId="commentInput" className="mb-3">
                    <Form.Control 
                        as="textarea" 
                        placeholder="Leave a comment..." 
                        rows={3}
                        className="mb-3"
                        value={comment} 
                        onChange={e => setComment(e.target.value)}
                        aria-label="Input comment here"
                    />
                    <Button variant="primary" onClick={handleCommentSubmit} className="float-end">Submit</Button>
                </Form.Group>
            </div>

            <h1>Comments:</h1>
              


        </div>
    );
}

export default Trade;