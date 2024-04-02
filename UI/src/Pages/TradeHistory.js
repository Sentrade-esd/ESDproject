import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardGroup, Row, Col } from 'react-bootstrap'

const TradeHistory = () => {
    const [transactions, setTransactions] = useState([]);
    // const email = sessionStorage.getItem('username');


    useEffect(() => {
        const UserID = sessionStorage.getItem('id'); 
        if (UserID) { // check if email is present
            axios.get(`http://127.0.0.1:5004/transaction/total/${UserID}`)
        .then(response => {
            // setTransactions(response.data);
            setTransactions(response.data.data.Transaction);
        })
        .catch(error => {
            console.error('There was an error!', error);
        });
        }
    }, []);

    return (
        <div>
            <CardGroup className='mt-3 row row-cols-3 row-cols-md-2 g-4'>
                {transactions.map((transaction, index) => (
                // <Col sm={12} md={6} lg={4} xl={3} key={transaction.TransactionID}>
                    <Card style={{ width: '18rem' }}>
                    <Card.Body>
                        <Card.Title>{transaction.Email}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">{transaction.Company}</Card.Subtitle>
                        <Card.Text>
                        Data and time: {new Date(transaction.DateTimestamp).toLocaleString()} <br />
                        Buy amount: {transaction.BuyAmount.toFixed(2)} <br />
                        Sell amount: {transaction.SellAmount.toFixed(2)} <br />
                        Stop loss sentiment threshold: {transaction.StopLossSentimentThreshold.toFixed(2)} <br />
                        Total account value: {transaction.TotalAccountValue.toFixed(2)}
                        </Card.Text>
                    </Card.Body>
                    </Card>
                // </Col>
                ))}
            </CardGroup>
            </div>
        );
    };

export default TradeHistory;