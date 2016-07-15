var mongoose = require("mongoose");

var taskBoardSchema = new mongoose.Schema({
    _id: Number,
    username: String,
    group: String,
    tasks: Array
});

module.exports = mongoose.model('Taskboard', taskBoardSchema);