// const connect = require("amqplib/connect");
// const axios = require("axios");
// const express = require("express");

import amqplib from "amqplib";
import axios from "axios";
import express from "express";
import cors from "cors";

const queue = "sentiment_notification_queue";
const routingKey = "notify";
const waitingExchange = "waiting_exchange";
const waitingQueue = "notifications_waiting_queue";

const app = express();
const PORT = 3001;

const amqp_url = process.env.AMQP_SERVER || "amqp://localhost:5672";
const watchlist_url = process.env.WATCHLIST_URL || "http://localhost:3000/";
const telebut_url = process.env.TELEBOT_URL || "http://localhost:3002/";

let connection = null;
let channel = null;

app.use(express.json());
app.use(cors());

async function start_amqp() {
  return new Promise((resolve, reject) => {
    const start = async () => {
      try {
        connection = await amqplib.connect(amqp_url);
        channel = await connection.createChannel();

        connection.on("error", async (err) => {
          if (err.message !== "Connection closing") {
            console.error("[AMQP] conn error", err.message);
          }
        });

        connection.on("close", () => {
          console.error("[AMQP] reconnecting");
          return setTimeout(start, 10000);
        });

        console.log("[AMQP] connected");
        resolve();
      } catch (err) {
        console.error("[AMQP] could not connect", err.message);
        return setTimeout(start, 10000);
      }
    };
    start();
  });
}

(async () => {
  await start_amqp();
  // await channel.assertQueue(queue, { durable: true });

  channel.consume(queue, async (message) => {
    // for each message, parse the message and send to telegram)
    const parsedMessage = JSON.parse(message.content.toString());

    for (let i = 0; i < parsedMessage.length; i++) {
      const content = parsedMessage[i];
      console.log(content);
      const company = content.search;
      let change = content.change;
      let changeType = "";
      if (Number(change) < 0) {
        changeType = "decreased";
      } else {
        changeType = "increased";
      }
      change = Math.abs(change) * 100;
      console.log(
        `Received message for company ${company} with change ${change}`
      );

      try {
        const response = await axios.get(
          `${watchlist_url}watchlist/company/${company}`
        );
        console.log(response.data);

        // Send message to Telegram bot
        const telegramIds = response.data; // Replace this with the actual array of Telegram IDs
        const teleMessage = `Sentiment for the company: ${company} has ${changeType} by ${change} %.`; // Replace this with the actual message

        await axios.post(`${telebut_url}teleBot/send_message`, {
          telegramIds,
          teleMessage,
        });

        channel.ack(message);

      } catch (error) {
        console.log(error.response);

        if (error.response.status == 404) {
          channel.ack(message);
        } else {
          console.error(`Error getting watchlist for company ${company}:`, error.response.data);
          channel.nack(message, false, false);
          channel.publish(waitingExchange, routingKey, message.content);
        }
      }
    }
  });
})();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
