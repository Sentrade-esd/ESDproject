const { Telegraf } = require("telegraf");
const bot = new Telegraf(
  process.env.BOT_TOKEN || "7039505633:AAFoCvJc3XwP8N7bUd1XsjkCP5rH311TrWQ"
);
const express = require("express");
const http = require("http");
const app = express();

app.use(express.json());

const server = http.createServer(app);

const PORT = process.env.PORT || 3002;

bot.start((ctx) => {
  // bot.telegram.setMyCommands({
  //   command: "send_Drago",
  //   description: "Send a msg to drago",
  // });
  const userId = ctx.from.id;

  ctx.reply("Welcome to the bot!");
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
  const { telegramIds, message } = req.body;

  if (!Array.isArray(telegramIds) || typeof message !== "string") {
    return res.status(400).json({ error: "Invalid request body" });
  }

  telegramIds.forEach((id) => {
    const numericId = Number(id);
    bot.telegram.sendMessage(numericId, message);
  });

  res.status(200).json({ status: "Messages sent" });
});

server.listen(PORT, () => {
  console.log("Server listening on port 3002");
});
