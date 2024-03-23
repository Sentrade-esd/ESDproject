import express, { response } from "express";

import {Sentiment, Comment} from './db_model.js';

import sentiment_methods from "./methods.js";

const SentimentController = express.Router();


try {
    // findOneAndUpdate(
    //     { _id: userID },
    //     {
    //       teleId: teleID,
    //       $addToSet: { watchlistedCompanies: watchlistedCompany },
    //     },
    //     { new: true, upsert: true }

    // insert test document
    let newSentiment = {
        datetime: Date.now(),
        search: "test",
        sentiment_score: 0,
        // emotion: {"joy": 0, "others": 0, "surprise": 0, 
        // "sadness": 0, "fear": 0, "anger": 0, "disgust": 0, "love":0},
        emotion: {"anger": 0, "joy": 0, "sadness": 0, "optimism": 0},
        keyword: {"test": 0}
    };
    
    const docTest2 = await Sentiment.findOneAndReplace(
        { search: "test" }, 
        newSentiment, 
        { new: true, upsert: true }, 
    );

    // console.log("dropping comment");
    // // drop collection
    // Comment.collection.drop();
    // Comment.createCollection();

    // insert test document
    let newComment = {
        datetime: Date.now(),
        search: "test",
        sentiment_score: 0,
        ememotion: {"anger": 0, "joy": 0, "sadness": 0, "optimism": 0}
    };

    const docTest3 = await Comment.findOneAndReplace(
        { search: "test" },
        newComment,
        { new: true, upsert: true },
    );

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
    const ticker = req.query.ticker;
    let newsArticles = null;


    let sentiments = await Sentiment.findOne({search: search_term});
    let comments = await Comment.findOne({search: search_term});         // TO USE: combine comments and news sentiments and return 

    let sentiment_flag = false;

    if (sentiments) {
        if ((Date.now() - sentiments.datetime) / 1000 < 1800) {
            let newsFromDB = await sentiment_methods.getNewsFromDB(ticker);
            newsArticles = newsFromDB.scrapedCompany.news;
            console.log("In DB. Returning data...");
        } else {
            sentiment_flag = true;
            // delete expired sentiment

            await Sentiment.deleteOne({search: search_term});
        }

    } else {
        sentiment_flag = true;
    }


    if (sentiment_flag) {
        console.log("Not in DB. Getting data...");
        
        const res = await sentiment_methods.scraper(search_term, ticker);
        newsArticles = res[1];
        // console.log(res)

    
        console.log("Analysing...");
    
    
        try {
            // Wait for the promise to resolve and store the result in the variable 'results'
            let results = await sentiment_methods.add_sentiments(res[0]);
        
            console.log("Inserting...");
        
            const newSentiment = new Sentiment({
                datetime: Date.now(),
                search: search_term,
                sentiment_score: results.results.headlines_score, // + results.results.description_score
                emotion: results.results.emotions,
                keyword: results.keyword_results
            });
            sentiments = newSentiment;
        
            // await newSentiment.save();
            sentiment_methods.save_data(newSentiment);

            // if (newSentiment) {
                // set the result to the sentiments variable
            // }
    
        } catch (error) {
            // Handle any errors that occur during promise resolution
            console.error("Error:", error);
            return res.status(500).json({ error: "Adding to DB failed"});
        }

    }


    // const comments_output = [];
    let comments_flag = false;

    if (comments) {
        if ((Date.now() - comments.datetime) / 1000 < 86400) {
            console.log("comment in db. Returning data...");

        } else {
            console.log("comment in db expired");

            await Comment.deleteOne({search: search_term});
            // delete expired comment
            
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
            // emotion: {
            //     "joy": sentiments.emotion.joy + comments.emotion.joy,
            //     "others": sentiments.emotion.others + comments.emotion.others,
            //     "surprise": sentiments.emotion.surprise + comments.emotion.surprise,
            //     "sadness": sentiments.emotion.sadness + comments.emotion.sadness,
            //     "fear": sentiments.emotion.fear + comments.emotion.fear,
            //     "anger": sentiments.emotion.anger + comments.emotion.anger,
            //     "disgust": sentiments.emotion.disgust + comments.emotion.disgust,
            //     "love": sentiments.emotion.love + comments.emotion.love
            // },
            emotion: {
                "joy": sentiments.emotion.joy + comments.emotion.joy,
                "anger": sentiments.emotion.anger + comments.emotion.anger,
                "sadness": sentiments.emotion.sadness + comments.emotion.sadness,
                "optimism": sentiments.emotion.optimism + comments.emotion.optimism
            },
            keyword: sentiments.keyword
        }
        return res.json({sentiments: combined_sentiment, newsArticles: newsArticles});
    } else {
        // return just the sentiment
        console.log("returning just sentiment");
        return res.json({sentiments: sentiments, newsArticles: newsArticles});
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

                if ((Date.now() - exisiting_comments.datetime) / 1000 < 86400){
                    
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
                    console.log("comment in db expired");
                    await Comment.deleteOne({search: search_term});

                    let newComment = new Comment({
                        datetime: Date.now(),
                        search: search_term,
                        sentiment_score: results.score,
                        // emotion: {"joy":0, "others":0, "surprise":0, "sadness":0, "fear":0, "anger":0, "disgust":0, "love":0}
                        emotion: {"anger": 0, "joy": 0, "sadness": 0, "optimism": 0}
                    });

                    newComment.emotion[results.emotion] += 1;

                    console.log("saving new comment");
                    // await newComment.save();
                    sentiment_methods.save_data(newComment);

                    return res.json({ result: newComment });
                }
            } else {
                // if no record exists, create a new one
                let newComment = new Comment({
                    datetime: Date.now(),
                    search: search_term,
                    sentiment_score: results.score,
                    // emotion: {"joy":0, "others":0, "surprise":0, "sadness":0, "fear":0, "anger":0, "disgust":0, "love":0}
                    emotion: {"anger": 0, "joy": 0, "sadness": 0, "optimism": 0},
                });
    
                newComment.emotion[results.emotion] += 1;
    
                console.log("saving new comment");
                // await newComment.save();
                sentiment_methods.save_data(newComment);
    
                return res.json({ result: newComment });
            }

        } catch (error) {
            return res.status(500).json({ error: "Internal Server Error" });
        }

    } catch (error) {
        
    }

});


export default SentimentController;



