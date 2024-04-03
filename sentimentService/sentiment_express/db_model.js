import mongoose from "mongoose";

const sentimentSchema = new mongoose.Schema({

    datetime: {
        type: Date,
        default: Date.now
    },
    search: {
        type: String,
        required: true
    },
    sentiment_score: {
        type: Number,
        required: true
    },
    emotion: {
        type: Object,
        required: true
    },
    keyword: {
        type: Object,
        required: true
    }
});

const commentSchema = new mongoose.Schema({

    // TO DO: add in datetime. program should chekc if the time is less than 24 hours
    // if it is then new comments will add to the same sentiment object
    // if it is not then a new sentiment object will be created
    // will reset every 24 hours at 12:00am

    datetime: {
        type: Date,
        default: Date.now
    },

    search: {
        type: String,
        required: true
    },
    sentiment_score: {
        type: Number,
        required: true
    },
    emotion: {
        type: Object,
        required: true
    }
});


const cronJobSchema = new mongoose.Schema({
    // datetime: {
    //     type: Date,
    //     default: Date.now
    // },
    search: {
        type: String,
        required: true
    },
    sentiment_score: {
        type: Number,
        required: true
    },
    // emotion: {
    //     type: Object,
    //     required: true
    // }
});


// export both schemas
export const Sentiment = mongoose.model("Sentiment", sentimentSchema);
export const Comment = mongoose.model("Comment", commentSchema);
export const CronJob = mongoose.model("CronJob", cronJobSchema);
// export default mongoose.model("Sentiment", sentimentSchema);