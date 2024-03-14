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
  console.log("dropping cron");
  CronJob.collection.drop();
  CronJob.createCollection();

  // insert test document
  let newCron = new CronJob({
      search: "test",
      sentiment_score: 0,
  });

  console.log("saving cron test");
  await newCron.save();
} catch (error) {
  console.log("DB initialisation failed");
  console.log(error);
}


app.get('/', (req, res) => {
      res.send('welcome to the express sentiment microservice');
    }
);

app.use('/sentimentAPI', SentimentController);


// cron job for every 20 sec
cron.schedule("*/1 * * * *", async () => {
  console.log('Running a task every 1 min');
  let combined_sentiments = {};

  try {
    
    let all_sentiments = await Sentiment.find({});
    let all_comments = await Comment.find({});
  
    let all_cron = await CronJob.find({});
  
    // console.log("all sentiments: " + all_sentiments);
    // console.log("all comments: " + all_comments);
  
  
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
    // let difference_flag = false;
    let difference_search = [];
    all_cron.forEach((cron) => {
      if (combined_sentiments[cron.search]) {
        // if percentage change is +/- 10%
        if (Math.abs((combined_sentiments[cron.search] - cron.sentiment_score) / Math.abs(cron.sentiment_score)) > 0.1) {
          difference_search.push({
            search: cron.search,
            change: (combined_sentiments[cron.search] - cron.sentiment_score) / Math.abs(cron.sentiment_score),
            new_score: combined_sentiments[cron.search]
          });
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
    console.log(error);
  }


  // do method to push to AMQP then proceed with stage 2


  // stage 2: after comparison, update the cron collection
  try {
    
    console.log("dropping cron after comparison");
    CronJob.collection.drop();
    CronJob.createCollection();
  
    // if all sentiments not empty, create a new cron item for each sentiment
  
    if (Object.keys(combined_sentiments).length > 0) {
      // for each item in senitments, create a new cron item
      for (let search of Object.keys(combined_sentiments)) {
        console.log("search: " + search);
        let newCron = new CronJob({
          search: search,
          sentiment_score: combined_sentiments[search],
        });
        await newCron.save();
      }
    }

  } catch (error) {
    console.log("cron db reset failed");
    console.log(error);
  }

  // if (all_sentiments.length > 0) {
  //   all_sentiments.forEach(async (sentiment) => {
  //     let newCron = new CronJob({
  //       search: sentiment.search,
  //       sentiment_score: sentiment.sentiment_score,
  //     });
  //     await newCron.save();
  //   });
  // }

  // // if all comments not empty, add it to the sentiment score in cron collection if it exists in the sentiment collection
  // // if it does not exist, create a new sentiment object
  // if (all_comments.length > 0) {
  //   all_comments.forEach(async (comment) => {
  //     let cronSentiment = await CronJob.findOne({search: comment.search});

  //     if (cronSentiment) {
  //       cronSentiment.sentiment_score += comment.sentiment_score;
  //       await cronSentiment.save();

  //     } else {
  //       let newCron = new CronJob({
  //         search: comment.search,
  //         sentiment_score: comment.sentiment_score,
  //       });

  //       await newCron.save();
  //     }
  //   });
  // }


  
});

// cron job for every 15 mins
// cron.schedule("*/15 * * * *", async () => {
//   console.log('Running a task every 15 minutes');
// });


 
  
app.listen(5001, () => console.log('Server running on port 5001'));
  
