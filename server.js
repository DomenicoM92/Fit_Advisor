var express = require('express');
var app = express();
var path = require('path');
const MongoClient = require('mongodb').MongoClient;
const urlDB = 'mongodb://localhost:27017/';
var compression = require('compression');
var schedule = require('node-schedule');
var exercise = require("./src/exercise");
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
  res.sendFile(path.join(__dirname + "/public/exercise_list.html"));
});

app.get('/exerciseCategory', function(req, res) {
  var exerciseByCategory = exercise.findByCategory(req.get("category"),MongoClient,urlDB);
  exerciseByCategory.then(function(result){
    res.setHeader('Content-Type', 'application/json');  
    res.send(result);
  });
});

app.get('/exercise_info', function(req, res) {
  res.sendFile(path.join(__dirname + "/public/exercise_info.html"));

});

app.get('/exercise_video', function(req, res) {
  var exercise_video =  exercise.videoExerciseRequest(req.get("name"));
  exercise_video.then(function(result){
    res.setHeader('Content-Type', 'application/json'); 
    res.send(result);
  }).catch(function(){
    res.sendStatus(403);
  });
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
  console.log('Fit_Advisor app listening on port 8080!');
});
