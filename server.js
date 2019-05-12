var express = require('express');
var app = express();
var path = require('path');
const MongoClient = require('mongodb').MongoClient;
const urlDB = 'mongodb://localhost:27017/';
var compression = require('compression');
var schedule = require('node-schedule');
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
    
  //Update Exercise every month
  schedule.scheduleJob('* * * 1 1 7', function(){
    console.log('Update Exercise '+ new Date());
    exercise.exerciseHandler(MongoClient,urlDB);
  });
  //exercise.videoExerciseRequest('Arnold Press');
  var exerciseByCategory = exercise.findByCategory("Arms",MongoClient,urlDB);
  res.sendFile(path.join(__dirname + "/public/index.html"));
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
