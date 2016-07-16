var express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    bodyParser = require('body-parser');

mongoose.connect(process.env.DATABASE);

require("./bot/setup")();

app.use(bodyParser.json());

app.post('/' + process.env.TOKEN, function (req, res) {
  //require("./bot/bot").processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(process.env.PORT, function(err) {
    if(err) throw err;
    console.log('bot starting at', process.env.PORT);
});
