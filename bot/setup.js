module.exports = function() {
    var bot = require("./bot");
    require("./commands")(bot);
};