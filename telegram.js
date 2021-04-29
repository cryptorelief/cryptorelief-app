require("dotenv").config();
const TelegramBot = require('node-telegram-bot-api');
const moment = require("moment");
const supabase = require("./db/init");

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
    (async () => {
        try {
            //console.log("telegram", tweet);
            const { data, error } = await supabase.from("Demands").insert([
              {
                source: "Telegram",
                status: "raw",
                source_id: msg.from.id,
                source_username: msg.from.username,
                group_id: msg.chat.id,
                group_username: msg.chat.username,
                content: msg.text,
                datetime: moment.unix(1619710536).toISOString(),
              },
            ]);
    
            if (error) {
              console.error(`Error white saving telegram message`, error);
            }
        } catch (error) {
            console.error(`Error white saving telegram message`, error);
        }
    })();

    bot.sendMessage(msg.from.username, "Message Received");
    bot.sendMessage(msg.chat.username, "Message Received");
});