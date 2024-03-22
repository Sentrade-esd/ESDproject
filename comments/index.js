const express = require("express");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const amqp = require("amqplib");
const app = express();
const PORT = 3003;
app.use(express.json());
const DB_service_url =
  process.env.DB_URL || "mongodb://127.0.0.1:27017/comments";
console.log("mongodb://" + DB_service_url + "/comments");
let connection;
let channel;
let amqpServer = process.env.AMQP_SERVER || "amqp://localhost";
mongoose
  .connect("mongodb://" + DB_service_url + "/comments", {})
  // mongoose.connect(`${uri}/watchlist`, {})
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

const commentsByCompanySchema = new Schema({
  _id: { type: String, alias: "company", unique: true },
  commentsMade: [String],
});
const comments = mongoose.model("comments", commentsByCompanySchema);

// ----------------- AMQP -----------------

const startAmqp = async () => {
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
      return setTimeout(startAmqp, 10000);
    });

    console.log("[AMQP] connected");
  } catch (err) {
    console.error("[AMQP] could not connect", err.message);
    return setTimeout(startAmqp, 10000);
  }
};

const sendToQueue = async (exchange, routingKey, msg) => {
  channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(msg)), {
    persistent: true,
  });
  console.log(`[x] Sent ${msg}`);
};

// ----------------- RESTFUL API -----------------
app.post("/comments", async (req, res) => {
  const company = req.body.company;
  const comment = req.body.comment;

  if (!company || !comment) {
    return res
      .status(400)
      .send({ message: "Company and comment are required" });
  }

  try {
    const msg = { company, comment };
    await sendToQueue("comments_exchange", "comment", msg);
    const companyComments = await comments.findOneAndUpdate(
      { _id: company },
      { $push: { commentsMade: comment } },
      { new: true, upsert: true }
    );

    if (companyComments.commentsMade.length > 5) {
      companyComments.commentsMade.shift();
      await companyComments.save();
    }

    res.send(companyComments);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).send({ message: "Error adding comment" });
  }
});

app.get("/comments/:company", async (req, res) => {
  const company = req.params.company;

  try {
    const companyComments = await comments.findOne({ _id: company });

    if (!companyComments) {
      return res.status(404).send({ message: "Company not found" });
    }

    res.send(companyComments.commentsMade);
  } catch (error) {
    console.error("Error getting comments:", error);
    res.status(500).send({ message: "Error getting comments" });
  }
});
startAmqp().catch(console.error);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
