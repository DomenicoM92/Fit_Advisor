var express = require('express');
var app = express();
var path = require('path');
var compression = require('compression');
var exercise = require("./src/exercise");
var food = require("./public/js/food");
var injuries = require("./src/injuries");
var equipment = require("./src/equipment");

//Serving static files such as Images, CSS, JavaScript
app.use(express.static("public"));

//Using gzip compression on responses to improve performances
app.use(compression());

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + "/public/index.html"));

});

app.get('/exercise', function(req, res) {
    
  //res.sendFile(path.join(__dirname + "/public/exercise.html"));
  exercise.exerciseRequest();
  exercise.videoExerciseRequest();
});

app.get('/food', function(req, res) {
  res.sendFile(path.join(__dirname + "/public/food.html"));
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