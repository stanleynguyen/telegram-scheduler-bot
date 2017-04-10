var Taskboard = require("./models/taskboard"),
    helpLib = require("./helplib"),
    Chuck = require("chucknorris-io"),
    fact = new Chuck(),
    request = require('request');
var errMessage = "Sorry there's something wrong with the server\nPlease try again!";

module.exports = function(bot) {
    
    bot.onText(/^\/start((\s+|)@schedulerr_bot|)$/i, function(message) {
        var chatID = message.chat.id;
        bot.sendMessage(chatID, "Hi there! My name is Schedulerr\nI have a big brain that can store tasks for you (Need proof? I know a lot of Chuck Norris facts, tell me /chuckfact)\nYou can command me using:\n\n" + commandList());
    });
    //bot introduction
    bot.onText(/^\/whoareyou((\s+|)@schedulerr_bot|)$/i, function(message) {
        var chatID = message.chat.id;
        bot.sendMessage(chatID, "I'm a scheduler bot created by Stanley Nguyen\nI can remember things for you and I know a lot of Chuck Norris facts\nBut I can understand a few certain commands only, please say /commands to see");
    });
    //see commands
    bot.onText(/^\/commands((\s+|)@schedulerr_bot|)$/i, function(message) {
        var chatID = message.chat.id;
        bot.sendMessage(chatID, "Here are ways that you can command me:\n\n" + commandList());
    });
    //register taskboard
    bot.onText(/^\/register((\s+|)@schedulerr_bot|)$/i, function(message, match) {
        var chatID = message.chat.id;
        Taskboard.findOne({_id: chatID}, function(err, taskboard) {
            if (err) return bot.sendMessage(chatID, errMessage);
            if (taskboard) {
                bot.sendMessage(chatID, (taskboard.group || "Your") + " taskboard has already been registered before!");
            } else {
                var newUser = new Taskboard({
                    _id: message.chat.id,
                    group: message.chat.title,
                    username: message.chat.username,
                    tasks: []
                });
                newUser.save(function(err) {
                    if (err) return bot.sendMessage(chatID, errMessage);
                    bot.sendMessage(chatID, "You have successfully registered " + (message.chat.title || "your") + " taskboard!");
                });
            }
        });
    });
    //schedule a task
    bot.onText(/^\/schedule(\s+\w+)+((\s+|)@schedulerr_bot|)$/i, function(message, match) {
        var chatID = message.chat.id;
        var task = match[0].slice(match[0].search(/\s+/), match[0].length).replace('@schedulerr_bot', '').trim();
        Taskboard.findOne({_id: chatID}, function(err, taskboard) {
            if (err) return bot.sendMessage(chatID, errMessage);
            if (!taskboard) {
                bot.sendMessage(chatID, "Please register a taskboard using /register first!");
            } else {
                taskboard.tasks.push(task);
                taskboard.save(function(err) {
                    if (err) return bot.sendMessage(chatID, errMessage);
                    bot.sendMessage(chatID, "You have successfully added an item to " + (taskboard.group||"your") + " board!");
                });
            }
        });
    });
    //log out tasks
    bot.onText(/^\/log((\s+|)@schedulerr_bot|)$/i, function(message) {
        var chatID = message.chat.id;
        Taskboard.findOne({_id: chatID}, function(err, taskboard) {
            if (err) return bot.sendMessage(chatID, errMessage);
            if (!taskboard) {
                bot.sendMessage(chatID, "Please register a taskboard using /register first!");
            } else {
                bot.sendMessage(chatID, generateTaskList(taskboard.tasks));
            }
        });
    });
    //delete task
    bot.onText(/^\/delete\s+\d+((\s+|)@schedulerr_bot|)$/i, function(message, match) {
        var chatID = message.chat.id;
        var matchNum = match[0].slice(match[0].search(/\s+/), match[0].length).replace('@schedulerr_bot', '').trim();
        var taskNum = parseInt(matchNum, 10);
        Taskboard.findOne({_id: chatID}, function(err, taskboard) {
            if (err) return bot.sendMessage(chatID, errMessage);
            if (!taskboard) {
                bot.sendMessage(chatID, "Please register a taskboard using /register first!");
            } else {
                if (taskNum < 1 || taskNum > taskboard.tasks.length) {
                    bot.sendMessage(chatID, "There's no such task!");
                } else {
                    taskboard.tasks.splice(taskNum - 1, 1);
                    taskboard.save(function(err) {
                        if (err) return bot.sendMessage(chatID, errMessage);
                        bot.sendMessage(chatID, "Successfully strike task numer " + taskNum + " off from taskboard!");
                    });
                }
            }
        });
    });
    bot.onText(/^\/remind\s+\w+\s+\d+((\s+|)@schedulerr_bot|)$/i, function(message, match) {
      var chatID = message.chat.id;
      var task = match[0].slice(match[0].search(/\s+\w+/), match[0].search(/\s+\d+/)).trim();
      var matchNum = match[0].slice(match[0].search(/\s+\d+/), match[0].length).replace('@schedulerr_bot', '').trim();
      var countDuration = parseInt(matchNum, 10) * 60000;
      bot.sendMessage(chatID, 'Start counting down for ' + matchNum + ' minutes');
      setTimeout(bot.sendMessage.bind(
        bot,
        chatID,
        'Reminder: ' + task
      ), countDuration);
    });
    //chuck norris fact
    bot.onText(/^\/chuckfact((\s+|)@schedulerr_bot|)$/i, function(message) {
        var chatID = message.chat.id;
        fact.getRandomJoke(function(err, joke) {
            if (err) return bot.sendMessage(chatID, errMessage);
            bot.sendMessage(chatID, joke.value);
        });
    });
    // let cleverbot handle the rest
    bot.onText(/^(((?!(\/start|\/whoareyou|\/register|\/schedule|\/log|\/delete|\/remind|\/chuckfact|\/commands)).)+)$/, function(message, match) {
      var chatID = message.chat.id;
      var text = match[0].replace('@schedulerr_bot', '').trim();
      createClvSess(bot, chatID, text);
    });
};

function commandList() {
    var message = "";
    for (var key in helpLib) {
        message += "/" + key + " - " + helpLib[key] + "\n";
    }
    return message;
}

function generateTaskList(taskList) {
    if (taskList.length === 0) return "There's no item on taskboard!\nStart adding using /schedule"
    var message = "";
    for (var i=0; i < taskList.length; i++) {
        message += (i + 1).toString() + " - " + taskList[i] + "\n";
    }
    return message;
}

function createClvSess(bot, chatID, text) {
  request.post({ url: 'https://cleverbot.io/1.0/create', form: {
    user: process.env.CLV_USR,
    key: process.env.CLV_KEY,
    nick: chatID
  }}, function(err, httpRes, body) {
    if (err) return bot.sendMessage(chatID, errMessage);
    askClv(bot, chatID, text);
  });
}

function askClv(bot, chatID, text) {
  request.post({ url: 'https://cleverbot.io/1.0/ask', form: {
    user: process.env.CLV_USR,
    key: process.env.CLV_KEY,
    nick: chatID,
    text: text
  }}, function(err, httpRes, body) {
    if (err) return bot.sendMessage(chatID, errMessage);
    try {
      var status = JSON.parse(body).status;
    } catch(e) {
      return bot.sendMessage(chatID, errMessage);
    }
    if (status !== 'success') return bot.sendMessage(chatID, errMessage);
    bot.sendMessage(chatID, JSON.parse(body).response);
  });
}
