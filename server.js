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
var foodETL = require('./src/foodETL');
var foodAPI = require('./src/foodAPI');

//Server startup routines
function startupRoutines() {

  //Setup Equipment Collection and Populate Products
  //equipment.initEquipmentCollection(MongoClient, urlDB, "com", "relevanceblender", "1");
}

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
        res.sendFile(path.join(__dirname + "/public/html/exercise_list.html"));
      });
    } else {
      res.sendFile(path.join(__dirname + "/public/html/exercise_list.html"));
    }
  });
  res.sendFile(path.join(__dirname + "/public/html/exercise_list.html"));
});

app.get('/exerciseCategory', function (req, res) {
  var exerciseByCategory = exercise.findByCategory(req.get("category"), MongoClient, urlDB);
  exerciseByCategory.then(function (result) {
    res.setHeader('Content-Type', 'application/json');
    res.send(result);
  });
});

app.post('/exercise_info', function (req, res) {
  res.render('exercise_info',{card:req.body.card});
});

app.get('/exercise_video', function (req, res) {
  var exercise_video = exercise.videoExerciseRequest(req.get("name"));
  exercise_video.then(function (result) {
    res.setHeader('Content-Type', 'application/json');
    res.send(result);
  }).catch(function () {
    res.sendStatus(403);
  });
});

app.get('/food', function (req, res) {
  foodETL.mongoConnect;
  //res.sendFile(path.join(__dirname + "/public/html/food.html"));
});

app.get('/injuries', function(req, res) {
  res.sendFile(path.join(__dirname + "/public/html/injuries_list.html"));

    /*result.then(function ([title, content]){
       //STORE THE RETRIEVED CONTENT IN A DOCUMENT LOCATED INTO A 'Injuries' COLLECTION 
       const dbo = db.db("Fit_AdvisorDB");
       var injury_obj= {injuryName: title, injuryContent: ""+content.html()};
       dbo.collection("Injuries").insertOne(injury_obj, function (err, res) {
         if (err) throw err;
         db.close();
       });
    });*/


    /*var ijrs= injuries.getInjuriesList(db);
    ijrs.then(function(result){
      res.setHeader('Content-Type', 'application/json');
      res.send(result); 
    });*/
    
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

startupRoutines();

app.listen(8080, function() {
  console.log('Fit_Advisor app listening on port 8080!');
});
