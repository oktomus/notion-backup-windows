const Fs = require("@supercharge/filesystem");
const execSync = require("child_process").execSync;
require('dotenv').config();
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
  execSync(`notion-backup`, {stdio: [0, 1, 2]});
  await Fs.touch(`./touch.txt`)
}

run().then(r => r).catch(e => {
  log(`❌: ${e.message}`);
  console.error(e);
});
