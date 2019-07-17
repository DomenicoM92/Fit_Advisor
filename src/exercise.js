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
              key: 'AIzaSyBN8MLWR0-2bOIMbOzr8I3CX8y8OVBntiA'
            };
            search(exerciseName + " GYM Exercise", opts, function (err, results) {
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

function checkBadResult(name) {
  var rejectedValues = ["", "Test", "Test Pullups", "TestBicep", "Mart.05.035l", "What", "Awesome", "L-sit (tucked)", "52", "Abcd", "Developpé Couché", "Upper Body", "Snach", "BenchPress","Arch Hold"];
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

