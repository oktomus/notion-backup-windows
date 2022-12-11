const Fs = require("@supercharge/filesystem");
const fs = require('fs');

const execSync = require("child_process").execSync;
require('dotenv').config();
const runBackup = require("./run-backup.js").runBackup;
const TeleBot = require('telebot');

const bot = new TeleBot(process.env.TELEGRAM_BOT_API_TOKEN);

function log(...data) {
  console.log(...data);
  bot.sendMessage(process.env.TELEGRAM_BOT_CHAT_ID, ...data);
}

async function run() {

  // https://www.npmjs.com/package/telebot#sendmessagechat_id-text-parsemode-replytomessage-replymarkup-notification-webpreview

  log("💾 Running notion backup...");

  //=> Check last backup
  const lastBackup = await Fs.lastAccessed('./touch.txt');
  const currentDate = new Date();

  const diffTime = Math.abs(currentDate - lastBackup);
  const diffSeconds = diffTime / 1000.0;
  const diffDays = diffTime / (1000.0 * 60 * 60 * 24);

  if (diffDays < 7.0) {
    log(`Skipping notion-backup, last one done on ${lastBackup}`);
    return;
  }

  //=> Backup.
  if (fs.existsSync("./markdown-old.zip")) {
    fs.rmSync("./markdown-old.zip", {recursive: true, force: true});
  }

  if (fs.existsSync("./markdown.zip")) {
    fs.renameSync("./markdown.zip", "./markdown-old.zip");
  }

  await runBackup();

  await Fs.touch(`./touch.txt`)

  log("Backup done.");
}

run().catch(e => {
  log(`❌: ${e.message}`);
  console.error(e);
});
