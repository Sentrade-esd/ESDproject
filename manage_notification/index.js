const connect = require("amqplib/connect");
const axios = require("axios");
const express = require("express");
const queue = "notify";

const app = express();
const PORT = 3001;
app.use(express.json());

(async () => {
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();
  await channel.assertQueue(queue, { durable: true });

  channel.consume(queue, async (message) => {
    const content = JSON.parse(message.content.toString());
    const company = content.search;
    const change = content.change;

    try {
      const response = await axios.get(
        `http://localhost:3000/watchlist/company/${company}`
      );
      console.log(response.data);

      // Send message to Telegram bot
      const telegramIds = response.data; // Replace this with the actual array of Telegram IDs
      const message = `The company ${company} has a change of ${change}.`; // Replace this with the actual message

      await axios.post("http://localhost:3002/teleBot/send_message", {
        telegramIds,
        message,
      });
    } catch (error) {
      console.error(`Error getting watchlist for company ${company}:`, error);
    }

    channel.ack(message);
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
