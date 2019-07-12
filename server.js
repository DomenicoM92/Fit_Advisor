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
const workoutRoutine = require('./src/workout_routine_mongo');

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
  //Update Exercise every month
  schedule.scheduleJob('* * 23 * 1 7', function () {
    console.log('Update Exercise ' + new Date().toISOString());
    if (request('GET', "https://wger.de/api/v2/exerciseinfo?page=1").statusCode == 200) {
      //make a backup of collection exercises
      return new Promise(function (fulfill, reject) {
        MongoClient.connect(urlDB, { useNewUrlParser: true }, function (err, db) {
          if (err) throw err;
          var dbo = db.db("Fit_AdvisorDB");
          dbo.collection("Exercise").find({}).toArray(function (err, result) {
            if (err) console.log(err);
            fs.writeFile("security_backup_mongoDB/exercise_backup.json", JSON.stringify(result), function (err) {
              if (err) console.log("Backup failed");
              console.log("Backup copy of Exercise is correctly stored in security_backup_mongoDB/");
              //delete collection exercise 
              dbo.collection("Exercise").drop(function (err, delOK) {
                if (err) {
                  console.log("Deletion failed");
                  console.log(err);
                }
                if (delOK) {
                  console.log("Collection deleted");
                  fulfill();
                }
                db.close();
              });
            });
          });
        });
      }).then(function () {
        //after deletion redo API call
        exercise.exerciseHandler(MongoClient, urlDB);
        res.render('exercise_list',{category:req.query.category});
      });
    } else {
      res.render('exercise_list',{category:req.query.category});
    }
  });
  res.render('exercise_list',{category:req.query.category});
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
    res.render('exercise_info',{card:JSON.stringify(exerciseCard), categoryName:exerciseCard.category.name, exeName:exerciseCard.name, description:exerciseCard.description});
  }).catch(function(){
      res.sendFile(path.join(__dirname + "/public/html/not_found.html"));
  })
});

app.post('/exercise_info', function (req, res) {
  var exerciseCard = JSON.parse(req.body.card);
  res.render('exercise_info',{card:JSON.stringify(exerciseCard), categoryName:exerciseCard.category.name, exeName:exerciseCard.name, description:exerciseCard.description});
});

app.get('/exercise_video', function (req, res) {
  var exercise_video = exercise.videoExerciseRequest(req.query.name);
  exercise_video.then(function (result) {
    res.setHeader('Content-Type', 'application/json');
    res.send(result);
  }).catch(function () {
    res.sendStatus(403);
  });
});

app.get('/injuries', function(req, res) {
  res.sendFile(path.join(__dirname + "/public/html/injuries_list.html"));    
});

app.get('/injuryDetails', function(req, res){
  /* var details= injuries.findByInjuryName('Neck Headache', MongoClient, urlDB);
  details.then(function(result){
    res.setHeader('Content-Type', 'text/html'); 
    res.send(result);
  }).catch(function(){
    res.sendStatus(403);
  }); */
});

app.get('/equipment', function(req, res) {

  res.sendFile(path.join(__dirname + "/public/equipment_list.html"));

});

app.get('/equipmentProducts', function(req, res) {

  var products = equipment.findByKeywordAmz(MongoClient, urlDB, req.get("domainCode"), req.get("keyword"), req.get("sortBy"), req.get("page"));
  products.then(function(result){
    res.setHeader('Content-Type', 'application/json');  
    res.send(result);
  });
});

app.get('/workoutRoutine', function(req, res) {
  res.sendFile(path.join(__dirname + "/public/html/workoutroutine.html"));
});

app.get('/retrieveRoutine', function(req, res) {
  var muscularGroup = req.query.category;
  if(muscularGroup != undefined)
    workoutRoutine.retrieveByMuscularGroup(req.query.category, function(woutRoutines){
      res.send(woutRoutines);
    });
});

app.listen(8080, function() {
  console.log('Fit_Advisor app listening on port 8080!');
});
