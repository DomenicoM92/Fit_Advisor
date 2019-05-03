var express = require('express');
var app = express();
var path = require('path');
var compression = require('compression');
var exercise = require("./src/exercise");
var food = require("./src/food");
var injuries = require("./src/injuries");
var equipment = require("./src/equipment");

app.use(compression());
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + "/public/index.html"));

});

app.get('/exercise', function(req, res) {
    
  res.sendFile(path.join(__dirname + "/public/exercise.html"));
});

app.get('/food', function(req, res) {
  food.sayHello();
});

app.get('/injuries', function(req, res) {
  res.sendFile(path.join(__dirname + "/public/injuries.html"));
});

app.get('/equipment', function(req, res) {
  res.sendFile(path.join(__dirname + "/public/equipment.html"));
});

app.listen(8080, function() {
  console.log('Example app listening on port 8080!');
});