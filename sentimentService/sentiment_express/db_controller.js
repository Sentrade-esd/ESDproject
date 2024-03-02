import express from "express";

import {Sentiment, Comment} from './db_model.js';

import db_methods from "./db_methods.js";

const SentimentController = express.Router();


try {
    // // drop collection
    console.log("dropping sentiment");
    Sentiment.collection.drop();
    Sentiment.createCollection();

    // insert test document
    let newSentiment = new Sentiment({
        datetime: Date.now(),
        search: "test",
        sentiment_score: 0,
        emotion: "test",
        keyword: {"test": 0}
    });

    console.log("saving sentiment test");
    await newSentiment.save();

    console.log("dropping comment");
    // drop collection
    Comment.collection.drop();
    Comment.createCollection();

    // insert test document
    let newComment = new Comment({
        search: "test",
        sentiment_score: 0,
        emotion: "test"
    });

    console.log("saving comment test");
    await newComment.save();

    console.log("DB initialised");

} catch (error) {
    console.log("DB initialisation failed");
    console.log(error);
}

SentimentController.get("/", (req, res) => {
    res.send('welcome to the sentiment db controller');
});

SentimentController.get("/query", async (req, res) => {
    const search_term = req.query.search_term;
    console.log(search_term);

    const sentiments = await Sentiment.find({search: search_term});
    const comments = await Comment.find({search: search_term});         // TO USE: combine comments and news sentiments and return 

    const output = [];

    if (sentiments) {
        for (let sentiment of sentiments) {
            if ((Date.now() - sentiment.datetime) / 1000 < 3600) {
                output.push(sentiment);
            }
        }

        if (output.length > 0) {
            console.log("In DB. Returning data...");
            return res.json({data_source:"DB", result: output});
        }
    }

    console.log("Not in DB. Getting data...");
    // const response = await axios.get(`your_scraper_url?search_term=${search_term}`);
    
    const response = await db_methods.scraper(search_term);
    console.log(response);
    // return res.json({result: response});

    console.log("Analysing...");

    try {
        // Wait for the promise to resolve and store the result in the variable 'results'
        const results = await db_methods.add_sentiments(response);
        console.log(results);
    
        console.log("Inserting...");
    
        const newSentiment = new Sentiment({
            datetime: Date.now(),
            search: search_term,
            // Access the properties of the resolved value 'results' and calculate sentiment_score
            sentiment_score: results.results.headlines_score + results.results.description_score,
            emotion: results.results.emotions,
            keyword: results.keyword_results
        });
    
        await newSentiment.save();
    
        return res.json({ result: newSentiment });
    } catch (error) {
        // Handle any errors that occur during promise resolution
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }




});

SentimentController.post("/comment", async (req, res) => {
    const comment = req.body.comment;
    const search_term = req.body.search_term;

    console.log(comment);
    console.log(search_term);

    try {
        const results = await db_methods.analyse_comment(comment);

        console.log("controller");
        console.log(results, typeof results);
        console.log(results.score, results.emotion, search_term);


        console.log("Inserting...");
        let newComment = new Comment({
            search: search_term,
            sentiment_score: results.score,
            emotion: results.emotion
        });

        console.log("saving...");
        await newComment.save();

        return res.json({ result: newComment });

    } catch (error) {
        
    }

});


export default SentimentController;











// get env variable and place it in url
// try {
//     const sentiment_service_url = process.env.SENTIMENT_SERVICE_URL;
//     console.log("URL retrieved from env variable: " + sentiment_service_url);

//     // test the url
//     axios.get(sentiment_service_url)
//         .then(response => console.log("sentiment_service_url is valid"))
//         .catch(error => console.log("sentiment_service_url failed"));
// } catch (error) {
//     console.log("sentiment_service_url failed");
// }

// require('./db_client.js');


// try {
//     // const db_url = process.env.DB_URL;
//     // console.log("URL retrieved from env variable: " + db_url);

//     // const DB_client = await connect();

//     console.log("Connecting to database");
//     DB_client()
//     // DB_client.connect()
//     // .then(() =>{
//     //     console.log("started");

//     //     collection = DB_client.db("sentiments").collection("sentiments");
//     //     console.log("Connected to database");

//     //     collection.drop();
//     //     console.log("Dropped collection");

//     //     collection.insertOne({
//     //         datetime: new Date(),   
//     //         search: "test",
//     //         sentiment_score: 'test',
//     //         emotion: 'test',
//     //         keyword: {"test": 0}
//     //     });

//     //     console.log("Inserted test document");
//     // })
//     // .catch((err) => {
//     //     console.log("Could not connect to database");
//     //     console.log(err)
//     // });

// } catch (error) {
//     console.log("Could not connect to database");
// }




// app.get('/query', async (req, res) => {
//     const search_term = req.query.search_term;

//     collection.find()

//     // const res = await collection.find({search: search_term});
//     // const output = [];
  
//     // if (sentiments) {
//     //   for (let sentiment of sentiments) {
//     //     if ((Date.now() - sentiment.datetime) / 1000 < 3600) {
//     //       output.push(sentiment);
//     //     }
//     //   }
  
//     //   if (output.length > 0) {
//     //     return res.json({result: output});
//     //   }
//     // }

  
//     console.log("getting data");
//     // const response = await axios.get(`your_scraper_url?search_term=${search_term}`);
//     const response = scraper(search_term)
//     const json_data = response.data;
//     console.log(json_data);
  
//     console.log("analysing");
//     const results = await add_sentiments(json_data);
  
//     console.log("inserting");
//     const newSentiment = new Sentiment({
//       datetime: Date.now(),
//       search: "test",
//       sentiment_score: results.results.headlines_score + results.results.description_score,
//       emotion: results.results.emotions,
//       keyword: results.keyword_results
//     });
  
//     await newSentiment.save();
//   });