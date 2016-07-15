var express = require("express"),
    app = express(),
    mongoose = require("mongoose");
    
mongoose.connect(process.env.DATABASE);
    
require("./bot/setup")();

app.listen(process.env.PORT, function(err) {
    if(err) throw err;
    console.log('bot starting at', process.env.PORT);
});
