// basic express backend

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import cron from "node-cron";

import './db_client.js';
import SentimentController from './db_controller.js';
import { Sentiment, Comment, CronJob } from './db_model.js';
import sentiment_methods from "./methods.js";

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

try {


  // insert test document
  let newCron = {
      search: "test",
      sentiment_score: 0,
  };

  const docTest1 = await CronJob.findOneAndReplace(
      { search: "test" }, 
      newCron, 
      { new: true, upsert: true },
  );

} catch (error) {
  console.log("DB initialisation failed");
  console.log(error);
}


app.get('/', (req, res) => {
      res.send('welcome to the express sentiment microservice');
    }
);

app.use('/sentimentAPI', SentimentController);


// cron job for every 1 min
cron.schedule("*/1 * * * *", async () => {
  console.log('Running a task every 1 min');
  let combined_sentiments = {};

  try {
    
    let all_sentiments = await Sentiment.find({});
    let all_comments = await Comment.find({});
  
    let all_cron = await CronJob.find({});
  
    // stage 1: compare the sentiment + comment vs cron
    // combine all_sentiments and all_comments into one object
    all_sentiments.forEach((sentiment) => {
      combined_sentiments[sentiment.search] = sentiment.sentiment_score;
    });
  
    all_comments.forEach((comment) => {
      if (combined_sentiments[comment.search]) {
        combined_sentiments[comment.search] += comment.sentiment_score;
      } else {
        combined_sentiments[comment.search] = comment.sentiment_score;
      }
    });
  
    // compare combined_sentiments with all_cron
    // if difference is more than 10%, return search term
    
    let difference_search = [];

    all_cron.forEach((cron) => {

      if (combined_sentiments[cron.search]) {
        let pcntChange = (combined_sentiments[cron.search] - cron.sentiment_score) / Math.abs(cron.sentiment_score);
        
        // if percentage change is +/- 10%
        if (Math.abs(pcntChange) > 0.1 || Math.abs(pcntChange) < -0.1) {
          difference_search.push({
            search: cron.search,
            change: pcntChange,
            new_score: combined_sentiments[cron.search]
          });
        }

        // anybody with a stop loss of 5-25% (steps of 5), send to a endpoint with the search term and percentage change and current price
        if (pcntChange <= -0.05) {
          console.log("stoploss triggered");
          let size = Math.abs(Math.floor(pcntChange / 0.05));

          sentiment_methods.getCurrentPrice(cron.search)
            .then((res) => {
              //   {
              //     "price": "170.03",
              //     "marketCap": "2.626T",
              //     "avgVolume": "61,281,215",
              //     "previousClose": "171.48"
              // }
              let currPrice = res.data.price;

              console.log("current price from scraper: " + currPrice);

              try {
                sentiment_methods.triggerStoploss(cron.search, size*5, currPrice);
              } catch (error) {
                // if error != 404 requeue
                if (error.response.status != 404) {
                  console.log("error triggering stoploss");
                  console.log(error.response);
                  sentiment_methods.stoplossRetryQueue({search: cron.search, size: size*5})
                }
              }
            })
            .catch((error) => {
              console.log("error getting current price");
              console.log(error.response);
              sentiment_methods.stoplossRetryQueue({search: cron.search, size: size*5})
            });


          // trigger triggerStoploss() without waiting for a response (fire and forget)
        }

      }
    });
  
    console.log("combined sentiments: " + JSON.stringify(combined_sentiments));
    console.log("difference search: " + JSON.stringify(difference_search));
    
    if (difference_search.length > 0) {
      sentiment_methods.produceNotification(difference_search)
    }

  } catch (error) {
    console.log("cron job failed");
    console.log(error.response);
  }



  // stage 2: after comparison, update the cron collection
  try {
    
    console.log("dropping cron after comparison");
    CronJob.collection.drop();
  
    // if all sentiments not empty, create a new cron item for each sentiment
    if (Object.keys(combined_sentiments).length > 0) {
      // for each item in senitments, create a new cron item
      for (let search of Object.keys(combined_sentiments)) {
        // upsert
        let filter =  { search: search };

        let newCron = {
          search: search,
          sentiment_score: combined_sentiments[search],
        };

        sentiment_methods.upsert_data(CronJob, filter, newCron);
      }
    }

  } catch (error) {
    console.log("cron db reset failed");
    console.log(error.response);
  }  
});

// start queue connection
(async () => {
  await sentiment_methods.start_amqp();
  sentiment_methods.consumeNotification();
  sentiment_methods.consumeStoplossRetry();
})();



 
  
app.listen(5001, () => console.log('Server running on port 5001'));
  
