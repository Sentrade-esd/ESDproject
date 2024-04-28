-- Create the database
CREATE DATABASE user_data;

-- Connect to the newly created database
\c user_data;

-- Create a table for your User model
CREATE TABLE IF NOT EXISTS "user" (
    UserID SERIAL PRIMARY KEY,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Telehandle VARCHAR(255),
    TeleID INTEGER,
    CreationDate VARCHAR(255) NOT NULL
);