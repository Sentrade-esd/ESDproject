-- Create the database if it doesn't exist

CREATE DATABASE transaction_data;

-- Connect to the newly created database
\c transaction_data;

-- Create a table for your Transaction model
-- DROP TABLE transaction;


CREATE TABLE IF NOT EXISTS "transaction" (
    TransactionID SERIAL PRIMARY KEY,
    UserID INTEGER NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Company VARCHAR(255),
    DateTimestamp TIMESTAMP NOT NULL,
    BuyAmount NUMERIC(10, 2),
    SellAmount NUMERIC(10, 2),
    StopLossSentimentThreshold NUMERIC(10, 2),
    StocksHeld NUMERIC(10,2),
    TotalAccountValue NUMERIC(10, 2) NOT NULL
);