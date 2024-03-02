// basic express backend

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fetch from 'node-fetch';

import { Mongoose } from 'mongoose';
import {MongoClient} from 'mongodb';
import axios from 'axios';

// import { DB_client } from './db_client.js';
import './db_client.js';
import SentimentController from './db_controller.js';

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());




app.get('/', (req, res) => {
      res.send('welcome to the express sentiment microservice');
    }
);

app.use('/api', SentimentController);
 
  
app.listen(5001, () => console.log('Server running on port 5001'));
  
