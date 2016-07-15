var TelegramBot = require("node-telegram-bot-api"),
    token = process.env.TOKEN,
    port = process.env.PORT,
    host = process.env.IP,
    url = process.env.URL,
    cert = '../certificate/cert.pem';

var bot = new TelegramBot(token);
bot.setWebHook(url + bot.token, cert);

module.exports = bot;