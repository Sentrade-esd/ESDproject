// const connect = require("amqplib/connect");
// const axios = require("axios");
// const express = require("express");

import amqplib from "amqplib";
import axios from "axios";
import express from "express";

const queue = "sentiment_notification_queue";

const app = express();
const PORT = 3001;

const amqp_url = process.env.AMQP_SERVER || "amqp://localhost:5672";
const watchlist_url = process.env.WATCHLIST_URL || "http://localhost:3000/";
const telebut_url = process.env.TELEBOT_URL || "http://localhost:3002/";

let connection= null;
let channel = null;

app.use(express.json());

async function start_amqp() {
  return new Promise((resolve, reject) => {
      const start = async () => {
          try {
              connection = await amqplib.connect(amqp_url);
              channel = await connection.createChannel();

              connection.on('error', async (err) => {
                  if (err.message !== 'Connection closing') {
                      console.error('[AMQP] conn error', err.message);
                  }
              });

              connection.on('close', () => {
                  console.error('[AMQP] reconnecting');
                  return setTimeout(start, 10000);
              });

              console.log('[AMQP] connected');
              resolve();
          } catch (err) {
              console.error('[AMQP] could not connect', err.message);
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
    const content = JSON.parse(message.content.toString());
    const company = content.search;
    const change = content.change;

    try {
      const response = await axios.get(
        `${watchlist_url}watchlist/company/${company}`
      );
      console.log(response.data);

      // Send message to Telegram bot
      const telegramIds = response.data; // Replace this with the actual array of Telegram IDs
      const message = `The company ${company} has a change of ${change}.`; // Replace this with the actual message

      await axios.post(`${telebut_url}teleBot/send_message`, {
        telegramIds,
        message,
      });
    } catch (error) {
      console.error(`Error getting watchlist for company ${company}:`, error);
    }

    channel.ack(message);
  });

})();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});