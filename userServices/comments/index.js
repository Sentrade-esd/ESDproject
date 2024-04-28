const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");

const { Schema } = mongoose;
const amqp = require("amqplib");
const app = express();
const PORT = 6001;
app.use(express.json());
app.use(cors());

const DB_service_url =
  process.env.DB_URL || "mongodb://127.0.0.1:27017/comments";

console.log("mongodb://" + DB_service_url + "/comments");
let connection;
let channel;
let amqpServer = process.env.AMQP_SERVER || "amqp://localhost";

mongoose
  .connect("mongodb://root:root@" + DB_service_url + "/comments", {
    authSource: "admin",
  })
  // .connect(DB_service_url, {
  //   authSource: "admin",
  // })
  // mongoose.connect(`${uri}/watchlist`, {})
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

const commentSchema = new Schema({
  comment: String,
  likes: { type: Number, default: 0 },
  sentiment_comments: { type: Number, default: 0 },
  // add other properties as needed
});
const commentSchemaCompany = new Schema({
  userId: { type: String },
  commentIndex: { type: Number },
  comment: String,
  likes: { type: Number, default: 0 },
});
const commentsByCompanySchema = new Schema({
  // _id: { type: String, alias: "company", unique: true },
  // commentsMade: [String],

  company: { type: String, unique: true },
  commentsMade: [commentSchemaCompany],
});
const commentsByUserSchema = new Schema({
  // _id: { type: String, alias: "company", unique: true },
  // commentsMade: [String],

  userId: { type: String, unique: true },
  commentsMade: [commentSchema],
});

const comments = mongoose.model("comments", commentsByCompanySchema);

const commentsUser = mongoose.model("commentsUser", commentsByUserSchema);

// ----------------- Reputation algo -----------------
// Schedule task to run at 12 AM every day
cron.schedule("0 0 * * *", async function () {
  // Fetch all comments
  const comments = await commentsUser.find({});

  // Calculate reputation for each user
  const userReputations = {};
  comments.forEach((comment) => {
    if (!userReputations[comment.userId]) {
      userReputations[comment.userId] = {
        totalLikes: 0,
        totalComments: 0,
      };
    }
    comment.commentsMade.forEach((innerComment) => {
      userReputations[comment.userId].totalLikes += innerComment.likes;
      userReputations[comment.userId].totalComments += 1;
    });
  });

  // Update sentiment_comments for each user
  for (const userId in userReputations) {
    const reputation = userReputations[userId];
    let sentimentComments;
    const reputationRatio = reputation.totalLikes / reputation.totalComments;

    if (reputationRatio < 1) {
      sentimentComments = 1;
    } else if (reputationRatio < 2) {
      sentimentComments = 4;
    } else if (reputationRatio < 5) {
      sentimentComments = 10;
    }

    // Update all comments of the user
    await commentsUser.updateMany(
      { userId: userId },
      { sentiment_comments: sentimentComments }
    );
  }

  console.log("Reputation calculated for all users");
});
// ----------------- AMQP -----------------

const startAmqp = async () => {
  console.log(amqpServer);
  return new Promise((resolve, reject) => {
    const start = async () => {
      try {
        connection = await amqp.connect(amqpServer);
        channel = await connection.createChannel();

        connection.on("error", (err) => {
          if (err.message !== "Connection closing") {
            console.error("[AMQP] conn error", err.message);
          }
        });

        connection.on("close", () => {
          console.error("[AMQP] reconnecting");
          return setTimeout(start, 5000);
        });

        console.log("[AMQP] connected");
        resolve();
      } catch (err) {
        console.error("[AMQP] could not connect", err.message);
        return setTimeout(start, 5000);
      }
    };
    start();
  });
};

const sendToQueue = async (exchange, routingKey, msg) => {
  channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(msg)), {
    persistent: true,
  });
  // console.log(`[x] Sent ${msg}`);
  return true;
};

// ----------------- RESTFUL API -----------------
app.post("/comments", async (req, res) => {
  console.log(req.body)

  // {
  //   company: 'Apple Inc',
  //   comment: { userId: '6', commentIndex: 0, comment: 'stupid', likes: 0 },
  //   userId: '6'
  // }
  const company = req.body.company;
  const comment = req.body.comment.comment;
  const userId = req.body.userId;

  if (!company || !comment) {
    return res
      .status(400)
      .send({ message: "Company and comment are required" });
  }

  let companyComments = null;
  let userComments = null;
  const commentIn = {
    comment: comment,
  };
  let commentCompany = {};
  try {
    userComments = await commentsUser.findOneAndUpdate(
      { userId: userId },
      { $push: { commentsMade: commentIn } },
      { new: true, upsert: true }
    );
    const commentIndex = userComments.commentsMade.length - 1;
    commentCompany = {
      userId: userId,
      commentIndex: commentIndex,
      comment: comment,
      likes: 0,
    };
    companyComments = await comments.findOneAndUpdate(
      { company: company },
      { $push: { commentsMade: commentCompany } },
      { new: true, upsert: true }
    );
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).send({ message: "Error adding comment" });
  }

  try {
    // if (userComments.sentiment_comments > 0) {
      const msg = { company, comment };
      console.log(msg);
      await sendToQueue("comments_exchange", "comment", msg);

      // Decrement sentiment_comments by 1
      userComments.sentiment_comments -= 1;
      await userComments.save();
    // }

    res.send(companyComments);
  } catch (error) {
    console.error("Error sending message to queue:", error);
    res.status(500).send({ message: "Error sending message to queue" });
  }
});


app.post("/comments/like", async (req, res) => {

  const company = req.body.company;
  const commentIndex = req.body.commentIndex;
  const userId = req.body.userId;
  // console.log(company)
  // console.log(commentIndex)
  // console.log(userId)
  
  let companyComments = null;
  let userComments = null;
  // userComments = await commentsUser.findOne({ userId: userId });
  //   console.log(userComments)


  // if (!company || !commentIndex || !userId) {
  //   return res
  //     .status(400)
  //     .send({ message: "Company, commentIndex and userId are required" });
  // }

  try {
    userComments = await commentsUser.findOne({ userId: userId });
    console.log(userComments)
    if (!userComments) {
      return res.status(404).send({ message: "User not found" });
    }

    const comment = userComments.commentsMade[commentIndex];
    // console.log(comment)

    comment.likes += 1;

    // console.log(comment)
    await userComments.save();

    const filter = {
      company: company,
      "commentsMade.userId": userId,
      "commentsMade.commentIndex": commentIndex,
    };
  
    const update = {
      $inc: { "commentsMade.$.likes": 1 },
    };
  
    const doc = await comments.findOneAndUpdate(filter, update);
  
    if (!doc) {
      console.error("No matching document found");
    }
  
    res.sendStatus(200);
  } catch (error) {
    console.error("Error liking comment:", error);
    res.status(500).send({ message: "Error liking comment" });
  }
});

app.get("/comments/:company", async (req, res) => {
  const company = req.params.company;

  try {
    const companyComments = await comments.findOne({ company: company });

    if (!companyComments) {
      return res.status(404).send({ message: "Company not found" });
    }

    res.send(companyComments.commentsMade);
  } catch (error) {
    console.error("Error getting comments:", error);
    res.status(500).send({ message: "Error getting comments" });
  }
});

(async () => {
  await startAmqp();
})();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
