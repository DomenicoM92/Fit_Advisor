var express = require('express');
var app = express();
var path = require('path');
var request = require('sync-request');
var fs = require('fs');
var bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const urlDB = 'mongodb://localhost:27017/';
var compression = require('compression');
var schedule = require('node-schedule');
var exercise = require('./src/exercise');
var injuries = require('./src/injuries');
var equipment = require('./src/equipment');
var scheduledUpdate = require('./src/scheduled_update');
const workoutRoutine = require('./src/woutRoutine');
const muscGroupDesc = require('./src/muscles_desc');


//Serving static files such as Images, CSS, JavaScript
app.use(express.static("public"));
app.use(express.static("public/js"));

app.use(bodyParser.urlencoded({ extended: true }));
//for render page.ejs (for pass parameter from node to html with post method)
app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'ejs');

//Using gzip compression on responses to improve performances
app.use(compression());

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + "/public/index.html"));
});

app.get('/exercise', function (req, res) {
  res.render('exercise_list', { category: req.query.category });
});

app.get('/exerciseCategory', function (req, res) {
  var exerciseByCategory = exercise.findByCategory(req.query.category, MongoClient, urlDB);
  exerciseByCategory.then(function (result) {
    res.setHeader('Content-Type', 'application/json');
    res.send(result);
  });
});

app.get('/exerciseByName', function (req, res) {
  var exerciseByName = exercise.findByName(req.query.exe_name, MongoClient, urlDB);
  exerciseByName.then(function (result) {
    var exerciseCard = result;
    res.render('exercise_info', { card: JSON.stringify(exerciseCard), categoryName: exerciseCard.category.name, exeName: exerciseCard.name, description: exerciseCard.description });
  }).catch(function () {
    res.sendFile(path.join(__dirname + "/public/html/not_found.html"));
  })
});

app.post('/exercise_info', function (req, res) {
  var exerciseCard = JSON.parse(req.body.card);
  //Francesco
  res.render('exercise_info',{card:JSON.stringify(exerciseCard), categoryName:exerciseCard.category.name, exeName:exerciseCard.name, description:exerciseCard.description, equipment:exerciseCard.equipment, img:exerciseCard.category.name.toLowerCase()});
});

app.get('/exercise_video', function (req, res) {
  var exercise_video = exercise.videoExerciseRequest(req.query.name, MongoClient,urlDB);
  exercise_video.then(function (result) {
    res.setHeader('Content-Type', 'application/json');
    res.send(result);
  }).catch(function () {
    res.sendStatus(403);
  });
});

app.get('/injury', function (req, res) {
  res.sendFile(path.join(__dirname + "/public/html/injuries_list.html"));
});

app.get("/injuryList", function (req, res) {
  var categoryName = req.query.category;
  
  injuries.retrieveByMuscularGroup(categoryName, MongoClient, urlDB, function (result) {
    res.setHeader('Content-Type', 'application/json');
    res.send(result);
  });
})

app.get('/injuryDetails', function (req, res) {
  injuries.findByInjuryName(req.query.title, MongoClient, urlDB, function (result) {
    res.setHeader('Content-Type', 'text/html');
    res.render('injury_detail', {title: result.title, content: result.content});
  });

});

app.get('/equipment', function(req, res) {
  //every sunday at 23:00
  schedule.scheduleJob('* * 23 * * 7', function () {
    console.log('Offers Update Started:' + new Date().toISOString());
    equipment.updateEquipmentCollection(MongoClient, urlDB, "com", "relevanceblender", "1");
  });
  exercise.findByCategory(req.query.category, MongoClient, urlDB).then(function(result) {
    var equipment = [];
    result.forEach(ex => {
      ex.equipment.forEach(eq => {
        if(!equipment.includes(eq.name) && !eq.name.startsWith("none"))
          equipment.push(eq.name);
      });
    });
    res.render("equipment_list", {category:req.query.category, equipment:equipment});
  })

});

app.get('/equipmentOffers', function(req, res) {
  var products = equipment.findByKeywordAmz(MongoClient, urlDB, req.query.domainCode, req.query.keyword, req.query.sortBy, req.query.page);
  products.then(function(result){
    res.setHeader('Content-Type', 'application/json');  
    res.send(result);
  });
});

app.get('/workoutRoutine', function (req, res) {
  res.sendFile(path.join(__dirname + "/public/html/workoutroutine.html"));
});

app.get('/retrieveRoutine', function (req, res) {
  var muscleGroup = req.query.category;
  if (muscleGroup != undefined)
    workoutRoutine.retrieveByMuscleGroup(req.query.category, function (woutRoutines) {
      res.send(woutRoutines);
    });
});

app.get('/description', function (req, res) {
  res.sendFile(path.join(__dirname + "/public/html/description.html"));
});

app.get('/retrieveDesc', function (req, res) {
  var muscleGroup = req.query.category;
  const mGroupCapitalized = muscleGroup.charAt(0).toUpperCase() + muscleGroup.slice(1);
  if (muscleGroup != undefined){
      muscGroupDesc.findByMuscGroup(mGroupCapitalized, function (description) {
        res.send(description);
    });
  }
});

app.listen(8080, function () {
  console.log('Fit_Advisor app listening on port 8080!');
  //every sunday of jenuary at 23:00
  schedule.scheduleJob('* * 23 * 1 7', function () {
    console.log('Update Started:' + new Date().toISOString());
    scheduledUpdate.update();
  });
  //flush video cache exercise everyday at midnight
  schedule.scheduleJob('0 0 * * *', function () {
    console.log('Started flush video exercise cache:' + new Date().toISOString());
    MongoClient.connect(urlDB, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err;
      var dbo = db.db("Fit_AdvisorDB");
      dbo.collection("Url_Video_Cache").deleteMany();
      console.log("Url_Video_Cache: Flushed!");
    });
  });
});
