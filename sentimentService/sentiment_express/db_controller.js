import express from "express";

import {Sentiment, Comment} from './db_model.js';

import sentiment_methods from "./methods.js";

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
        emotion: {"joy": 0, "others": 0, "surprise": 0, 
        "sadness": 0, "fear": 0, "anger": 0, "disgust": 0},
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
        datetime: Date.now(),
        search: "test",
        sentiment_score: 0,
        emotion: {"joy": 100, "others": 0, "surprise": 0, 
        "sadness": 0, "fear": 0, "anger": 0, "disgust": 0}
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




SentimentController.get("/sentiment_query", async (req, res) => {
    const search_term = req.query.search_term;
    // console.log(search_term);
    
    // Sentiment.findOne

    let sentiments = await Sentiment.findOne({search: search_term});
    let comments = await Comment.findOne({search: search_term});         // TO USE: combine comments and news sentiments and return 
    // let difference_flag = false;

    // const sentiment_output = [];

    let sentiment_flag = false;

    if (sentiments) {
        if ((Date.now() - sentiments.datetime) / 1000 < 86400) {
            console.log("In DB. Returning data...");
            // sentiment_output.push(sentiments);
        } else {
            sentiment_flag = true;
            difference_flag = true;
        }

    } else {
        sentiment_flag = true;
    }


    if (sentiment_flag) {
        console.log("Not in DB. Getting data...");
        // const response = await axios.get(`your_scraper_url?search_term=${search_term}`);
        
        const response = await sentiment_methods.scraper(search_term);
        // console.log(response);
        // return res.json({result: response});
    
        console.log("Analysing...");
    
        // const results = null;
    
        try {
            // Wait for the promise to resolve and store the result in the variable 'results'
            let results = await sentiment_methods.add_sentiments(response);
            // console.log(results);
        
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

            if (newSentiment) {
                // set the result to the sentiments variable
                sentiments = newSentiment;

            }
        
            // return res.json({ result: newSentiment });
    
        } catch (error) {
            // Handle any errors that occur during promise resolution
            console.error("Error:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }

    }


    // const comments_output = [];
    let comments_flag = false;

    if (comments) {
        if ((Date.now() - comments.datetime) / 1000 < 86400) {
            console.log("comment in db. Returning data...");
            // comments_output.push(comments);
        } else {
            console.log("comment in db expired");
            
            comments_flag = true;
        }
    } else {
        console.log("No comments in DB");
        comments_flag = true;
    }

    let combined_sentiment = {};
    
    if (sentiments && comments && !comments_flag) {
        console.log("combining sentiment and comments");
        combined_sentiment = {
            search: search_term,
            sentiment_score: sentiments.sentiment_score + comments.sentiment_score,
            emotion: {
                "joy": sentiments.emotion.joy + comments.emotion.joy,
                "others": sentiments.emotion.others + comments.emotion.others,
                "surprise": sentiments.emotion.surprise + comments.emotion.surprise,
                "sadness": sentiments.emotion.sadness + comments.emotion.sadness,
                "fear": sentiments.emotion.fear + comments.emotion.fear,
                "anger": sentiments.emotion.anger + comments.emotion.anger,
                "disgust": sentiments.emotion.disgust + comments.emotion.disgust
            },
            keyword: sentiments.keyword
        }
        return res.json({result: combined_sentiment});
    } else {
        // return just the sentiment
        console.log("returning just sentiment");
        return res.json({result: sentiments});
    }





});

SentimentController.post("/sentiment_comment", async (req, res) => {
    const comment = req.body.comment;
    const search_term = req.body.search_term;


    try {
        const results = await sentiment_methods.analyse_comment(comment);


        try {
            // chekc if DB has a record
            let exisiting_comments = await Comment.findOne({search: search_term});

            if (exisiting_comments) {
                console.log("comment exists");

                // override existing values with .replaceOnce method
                exisiting_comments.sentiment_score += results.score;
                exisiting_comments.emotion[results.emotion] += 1;

                let updateComment = await Comment.replaceOne({_id: exisiting_comments.id}, {
                    datetime: exisiting_comments.datetime,
                    search: exisiting_comments.search,
                    sentiment_score: exisiting_comments.sentiment_score,
                    emotion: exisiting_comments.emotion
                });

                console.log("saving existing comment");
                return res.json({ result: exisiting_comments });
                

            } else {
                // if no record exists, create a new one
                let newComment = new Comment({
                    datetime: Date.now(),
                    search: search_term,
                    sentiment_score: results.score,
                    emotion: {"joy":0, "others":0, "surprise":0, "sadness":0, "fear":0, "anger":0, "disgust":0}
                });
    
                newComment.emotion[results.emotion] += 1;
    
                console.log("saving new comment");
                await newComment.save();
    
                return res.json({ result: newComment });
            }

        } catch (error) {
            return res.status(500).json({ error: "Internal Server Error" });
        }

    } catch (error) {
        
    }

});


export default SentimentController;



