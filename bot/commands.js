var Taskboard = require("./models/taskboard"),
    helpLib = require("./helplib");

module.exports = function(bot) {
    var errMessage = "Sorry there's something wrong with the server\nPlease try again!";
    bot.onText(/^\/start((\s+|)@schedulerr_bot|)$/, function(message) {
        var chatID = message.chat.id;
        bot.sendMessage(chatID, "Hi there! My name is Schedulerr\nI have a big brain that can store tasks for you\nYou can command me using:\n\n" + commandList());
    });
    //bot introduction
    bot.onText(/^\/whoareyou((\s+|)@schedulerr_bot|)$/, function(message) {
        var chatID = message.chat.id;
        bot.sendMessage(chatID, "I'm a scheduler bot created by Stanley Nguyen\nHow can I help you?\nI can understand a few certain commands only, please say /commands to see");
    });
    //see commands
    bot.onText(/^\/commands((\s+|)@schedulerr_bot|)$/, function(message) {
        var chatID = message.chat.id;
        bot.sendMessage(chatID, "Here are ways that you can command me:\n\n" + commandList());
    });
    //register taskboard
    bot.onText(/^\/register((\s+|)@schedulerr_bot|)$/, function(message, match) {
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
    bot.onText(/^\/schedule(\s+\w+)+((\s+|)@schedulerr_bot|)$/, function(message, match) {
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
                    bot.sendMessage(chatID, "You have successfully added an item to " + (taskboard.title||"your") + " board!");
                });
            }
        });
    });
    //log out tasks
    bot.onText(/^\/log((\s+|)@schedulerr_bot|)$/, function(message) {
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
    bot.onText(/^\/delete\s+\d+((\s+|)@schedulerr_bot|)$/, function(message, match) {
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
    //print out message for debugging
    // bot.onText(/(.*?)/, function(message) {
    //     console.log(message);
    // });
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