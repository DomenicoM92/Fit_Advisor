var request = require('request');
var search = require('youtube-search');
const REQUEST_NUMB = 30;
const LanguageDetect = require('languagedetect');
const lngDetector = new LanguageDetect();
var docDuplicate = {};

exports.exerciseHandler = function (MongoClient, urlDB) {

  return new Promise(function (fulfill, reject) {
    console.log("EXERCISE: begin etl module")
    for (i = 1; i < REQUEST_NUMB; i++) {
      var APIUrl = 'https://wger.de/api/v2/exerciseinfo';
      request(APIUrl + '?page=' + i, function (error, response, body) {
        MongoClient.connect(urlDB, { useNewUrlParser: true }, function (err, db) {
          if (err) throw err;
          var dbo = db.db("Fit_AdvisorDB");
          var exercises = JSON.parse(response.body).results;
          for (var item in exercises) {
            if (checkBadResult(exercises[item].name)) {
              delete exercises[item];
            } else {
              if (exercises[item].description != undefined) {
                var lang = lngDetector.detect(exercises[item].description);
                if (lang != undefined)
                  exercises[item]["lang"] = lang[0];
                if (exercises[item].category.name == "Calves") {
                  exercises[item].category.name = "Legs";
                }
                exercises[item]["timestamp"] = new Date().toISOString();
                dbo.collection("Exercise").insertOne(exercises[item], function (err) {
                  if (err) throw err;
                });
              }
            }
          }
        });
      });
    }
    fulfill();
  }).then(function () {
    console.log("EXERCISE: Documents inserted");
    MongoClient.connect(urlDB, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err;
      var dbo = db.db("Fit_AdvisorDB");
      dbo.collection("Exercise").createIndex(
        { "category.name": 1 }, function (err, result) {
          console.log("EXERCISE: Index:" + result + ", created correctly");
        });
      db.close();
    });
  });
}

exports.videoExerciseRequest = function (exerciseName, MongoClient, urlDB) {
  return new Promise(function (fulfill, reject) {
    MongoClient.connect(urlDB, { useNewUrlParser: true }, function (err, db) {
      if (err)
        throw err;
      else {
        var dbo = db.db("Fit_AdvisorDB");
        dbo.collection("Url_Video_Cache").findOne({ "name": exerciseName }, function (err, result) {
          if (err) throw err;
          if (result) {
            console.log("Url video in cached");
            fulfill(result);
          } else {
            console.log("Url video not cached");
            var opts = {
              maxResults: 1,
              key: 'AIzaSyBN8MLWR0-2bOIMbOzr8I3CX8y8OVBntiA',
              type: 'video',
              videoCategoryId: '17'
            };
            search(exerciseName + "GYM EXERCISE", opts, function (err, results) {
              if (err) {
                reject();
              }
              else {
                var dbo = db.db("Fit_AdvisorDB");
                results[0]["name"] = exerciseName;
                results[0]["timestamp"] = new Date().toISOString();
                dbo.collection("Url_Video_Cache").insertOne(results[0], function (err) {
                  if (err) throw err;
                });
                fulfill(results[0]);
              }
            });
          }
        });
      }
    });

  });
}

exports.findByCategory = function (category, MongoClient, urlDB) {

  return new Promise(function (fulfill, reject) {
    MongoClient.connect(urlDB, { useNewUrlParser: true }, function (err, db) {
      if (err)
        throw err;
      else {
        var dbo = db.db("Fit_AdvisorDB");
        dbo.collection("Exercise").find({ "category.name": category, "lang.0": "english" }).sort({ name: 1 }).toArray(function (err, result) {
          if (err) throw err;
          db.close();
          fulfill(result);
        });
      }
    });
  });
}

exports.findByName = function (name, MongoClient, urlDB) {

  return new Promise(function (fulfill, reject) {
    MongoClient.connect(urlDB, { useNewUrlParser: true }, function (err, db) {
      if (err)
        throw err;
      else {
        var dbo = db.db("Fit_AdvisorDB");
        var query = ".*" + name + ".*";
        dbo.collection("Exercise").findOne({ 'name': { '$regex': query, '$options': 'i' }, "lang.0": "english" }, function (err, result) {
          if (err) throw err;
          db.close();
          fulfill(result);
        });
      }
    });
  }).catch(function () {
    reject();
  })
}


//Francesco Zone
const cheerio = require('cheerio');
const assert = require('assert');

const url = 'https://www.weight-lifting-complete.com/major-muscle-groups/';

const muscleGroups = {
  'Legs': ['Quadriceps', 'Hamstrings', 'Calves'],
  'Chest': [],
  'Back': ['Back', 'Trapezius'],
  'Shoulder': [],
  'Arms': ['Triceps', 'Biceps', 'Forearms'],
  'Ab': []
}

exports.scrapeBestEx = function (MongoClient, urlDB) {
  MongoClient.connect(urlDB, {useNewUrlParser:true}, function(err, client) {
    assert.equal(null, err);
    //console.log("Connected successfully to server");
    var db = client.db('Fit_AdvisorDB');
    const collection = db.collection('BestExercise');

    collection.drop(function(err, delOK) {
      if (delOK) console.log("BESTEXERCISE: Collection deleted");
      
      console.log('BESTEXERCISE: Starting insertion...');

      request(url, function (error, response, body) {
        if (error) throw error;

        var $ = cheerio.load(body);
        //console.log(response.body);
        const keys = Object.keys(muscleGroups);
        //console.log(keys);

        for(i=0; i<keys.length; i++){
          var bestObject = {
            category: "",
            exercises: []
          }

          var key = keys[i];
          var muscles = muscleGroups[key];      
          var musclesNum = muscles.length;
          var category;

          bestObject.exercises = [];
          bestObject.category = keys[i];

          if(musclesNum == 0){//Scraping caso nessun sotto muscolo
            category = keys[i];

            var title = $('h4').filter(function(i, el) {
              return $(this).text().trim() === "Best "+ category +" Exercises";
            });

            var exercisesList = title.nextUntil('ul').next();

            exercisesList.find('li').each(function(index, elem) {
              if($(this).text() === 'Single Arm Overhead Press (my favorite)')
                bestObject.exercises.push('Single Arm Overhead Press');
              else
                bestObject.exercises.push($(this).text());
            });

            //console.log(bestObject.category);
            //console.log(bestObject.exercises+"\n\n");
          }
          else{//Scraping caso sottomuscoli
            for(j=0; j<muscles.length;j++){  
              category = muscles[j];

              var title = $('h4').filter(function(i, el) {
                return $(this).text().trim() === "Best "+ category +" Exercises";
              });

              var exercisesList = title.nextUntil('ul').next();

              exercisesList.find('li').each(function(index, elem) {
                var duplicate = false;
                for(k=0; k<bestObject.exercises.length;k++){
                  var savedExercise = bestObject.exercises[k];
                  if(savedExercise === $(this).text())
                    duplicate = true;
                }
                if(!duplicate)
                  bestObject.exercises.push($(this).text());
              });
            }
          }
          /*
          console.log(bestObject.category);
          console.log(bestObject.exercises+"\n\n");*/

          //Mongo insertion
          collection.insertOne(bestObject);

        }
        if(i==keys.length)
          client.close();
      });
    });
  });
}

exports.checkBest = function (category, exerciseName, MongoClient, urlDB, callback) {
  MongoClient.connect(urlDB, {useNewUrlParser:true}, function(err, client) {
    assert.equal(null, err);
    //console.log("Connected successfully to server");
    var db = client.db('Fit_AdvisorDB');
    const collection = db.collection('BestExercise');

    collection.findOne({'category': category}, function(err, result) {
      if (err) throw err;

      if(result == null) {
        client.close();
        callback(false);
        return;
      }
      //console.log(result);
      for(i=0; i<result.exercises.length; i++){
        if(result.exercises[i] == exerciseName){
          console.log(exerciseName);
          client.close();
          callback(true);
          return;
        }
      };
      client.close();
      callback(false);
      return;
    });
  });
}

////////////////



function checkBadResult(name) {
  var rejectedValues = ["", "Test", "Test Pullups", "TestBicep", "Mart.05.035l", "What", "Awesome", "L-sit (tucked)", "52", "Abcd", "Developpé Couché", "Upper Body", "Snach", "BenchPress", "Arch Hold", "10 Min Abs", "Back Squat", "Run - Interval Training", "Boxing", "Circuit - Pullups", "Pushups", "Crunches", "Air Squats", "Squat", "Swimming", "Walking", "Bicep", "Nuevo", "Yolk Walks"];
  for (index in rejectedValues) {
    if (rejectedValues[index] == name) {
      return true;
    }
  }

  if (!docDuplicate[name])
    docDuplicate[name] = name;
  else
    return true;

  return false;
}

