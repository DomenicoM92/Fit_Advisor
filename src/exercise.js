var request = require('request');
var search = require('youtube-search');
const REQUEST_NUMB = 30;
const LanguageDetect = require('languagedetect');
const lngDetector = new LanguageDetect();
var rejectedValues = ["", "Test","Test Pullups","TestBicep","Mart.05.035l","What","Awesome","L-sit (tucked)","52","Abcd","Developpé Couché"];
exports.exerciseHandler = function (MongoClient, urlDB) {
  exerciseHandler(MongoClient, urlDB);
}

exports.videoExerciseRequest = function (exerciseName) {
  return new Promise(function (fulfill, reject){
    var opts = {
      maxResults: 2,
      key: 'AIzaSyB10jgQoDvOoZo3NopHUvYPpHFFIFU1e6o'
    };
    search(exerciseName+" GYM Exercise", opts, function(err, results) {
      if(err) {
        //console.log(err);
        reject();
      }
      else
        fulfill(results);
    }); 
  });
}

exports.findByCategory = function (category,MongoClient,urlDB) {
  
   return new Promise(function (fulfill, reject){
    MongoClient.connect(urlDB,{ useNewUrlParser: true },function(err, db) {
      if (err) 
        throw err;
      else {
        var dbo = db.db("Fit_AdvisorDB");
        dbo.collection("Exercise").find({"category.name":category, "lang.0":"english", "name": { $nin : rejectedValues}})
                                  .sort({ name: 1 })
                                  .toArray(function(err, result) {
          if (err) throw err;
          db.close();
          fulfill(result);
        });
      } 
    });
  });
}

function exerciseHandler(MongoClient, urlDB) {

  for (i = 1; i < REQUEST_NUMB; i++) {

    var APIUrl = 'https://wger.de/api/v2/exerciseinfo';
    httpGet(APIUrl, i);
    function httpGet(APIUrl, i) {
      var response = request(APIUrl + '?page=' + i, function(error, response, body) {
        console.log("Status Code (request " + i + ") : " + response.statusCode);
        //insert document on MongoDB 
        MongoClient.connect(urlDB, { useNewUrlParser: true },function (err, db) {
          if (err) throw err;
          var dbo = db.db("Fit_AdvisorDB");
          var exercises = JSON.parse(response.body).results;
          for (var item in exercises) {
            if(exercises[item].description != undefined) {
              var lang = lngDetector.detect(exercises[item].description);
              if(lang != undefined)
                exercises[item]["lang"] = lang[0];
            }
            
          }
          dbo.collection("Exercise").insertMany(exercises, function (err, res) {
            if (err) throw err;
            console.log(i + " document inserted");
            db.close();
          });
        });
      });
     
    }
    if(i == 29) {
      //Create index after all request and insertion
      MongoClient.connect(urlDB, { useNewUrlParser: true },function (err, db) {
        if (err) throw err;
        var dbo = db.db("Fit_AdvisorDB");
        dbo.collection("Exercise").createIndex(
          { "category.name" : 1 }, function(err, result) {
          console.log("Index:"+result+", created correctly");
        });
      });
    }
  }
}


