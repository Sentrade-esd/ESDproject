import mongoose from "mongoose";

const sentimentSchema = new mongoose.Schema({
    //   datetime: Date.now(),
    //   search: "test",
    //   sentiment_score: results.results.headlines_score + results.results.description_score,
    //   emotion: results.results.emotions,
    //   keyword: results.keyword_results
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
    search: {
        type: String,
        required: true
    },
    sentiment_score: {
        type: Number,
        required: true
    },
    emotion: {
        type: String,
        required: true
    }
});

// export both schemas
export const Sentiment = mongoose.model("Sentiment", sentimentSchema);
export const Comment = mongoose.model("Comment", commentSchema);
// export default mongoose.model("Sentiment", sentimentSchema);