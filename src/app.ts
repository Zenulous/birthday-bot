import Discord = require("discord.js");
import { config } from "dotenv";
import path = require("path");
import low = require("lowdb");
import FileSync = require("lowdb/adapters/FileSync");
import schedule = require("node-schedule");
import { BirthdayCommandHandler } from "./handlers/commands/BirthdayCommandHandler";
import express from "express";

const app = express();

config({
  path: path.join(__dirname, "..", ".env"),
});

const adapter = new FileSync<Schema>("db.json");

interface Schema {
  birthdays: [{ userId: string; date: string }];
}

export const db = low(adapter);

db.defaults({ birthdays: [] }).write();

schedule.scheduleJob("0 6 * * *", async () =>
  BirthdayCommandHandler.handleBirthdays()
);

export const client = new Discord.Client();
client.login(process.env.BOT_TOKEN);
client.on("ready", () => {
  console.log(`Bot is ready.`);
});

const TRIGGER = process.env.TRIGGER || "!birthday";

client.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(TRIGGER)) {
    await BirthdayCommandHandler.handleMessage(message);
    return;
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

app.get("/", (req, res) => {
  res.send("Service is alive");
});
