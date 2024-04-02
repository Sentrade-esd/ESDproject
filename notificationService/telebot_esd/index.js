const { Telegraf } = require("telegraf");
const bot = new Telegraf(
  process.env.BOT_TOKEN || "7039505633:AAFoCvJc3XwP8N7bUd1XsjkCP5rH311TrWQ"
);
const express = require("express");
const http = require("http");
const cors = require("cors");
const app = express();

const tinyurl = require("tinyurl-api");

app.use(express.json());
app.use(cors());
const server = http.createServer(app);

const PORT = process.env.PORT || 3002;
let referer = "";
bot.start((ctx) => {
  // bot.telegram.setMyCommands({
  //   command: "send_Drago",
  //   description: "Send a msg to drago",
  // });
  const userId = ctx.from.id;
  // if (!referer) {
  //   console.error("Referer is not defined");
  //   return;
  // }
  const redirectUrl = `${referer}?teleId=${userId}`;
  console.log(`User ID: ${userId}`);
  console.log(`Redirect URL: ${redirectUrl}`);
  ctx.reply(`[Click here to go back to the website](${redirectUrl})`, {
    parse_mode: "Markdown",
  });
  // ... rest of your code
});
bot.command("send_Drago", (ctx) => {
  bot.telegram.sendMessage(491465735, "Hello, Drago!");
});
bot.launch();
// server.listen(process.env.PORT || 3002, () => {
//   console.log("Server listening on port 3001");
// });
app.post("/teleBot/send_message", (req, res) => {
  const { telegramIds, teleMessage } = req.body;

  if (!Array.isArray(telegramIds) || typeof teleMessage !== "string") {
    return res.status(400).json({ error: "Invalid request body" });
  }

  telegramIds.forEach((id) => {
    const numericId = Number(id);
    bot.telegram.sendMessage(numericId, teleMessage);
  });

  res.status(200).json({ status: "Messages sent" });
});
app.get("/teleBot/redirect", async (req, res) => {
  try {
    referer = req.headers.bro;

    referer = await tinyurl(referer);

    console.log(`Request made from: ${referer}`);
    res.status(200).send("https://t.me/SenTrade_Bot");
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).send("An error occurred");
  }
});
server.listen(PORT, () => {
  console.log("Server listening on port 3002");
});
