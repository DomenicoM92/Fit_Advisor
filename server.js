var express = require('express');
var app = express();
var path = require('path');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017/';
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
  exercise.exerciseRequest(MongoClient,url);
  //exercise.videoExerciseRequest();
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
  dbConnection();
});

function dbConnection() {
  // Database Name
  const dbName = 'Fit_AdvisorDB';

  // Create a new MongoClient
  const client = new MongoClient(url);

  // Use connect method to connect to the Server
  client.connect(function(err) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    db = client.db(dbName);

    client.close();
  });
}