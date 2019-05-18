var request = require('sync-request');
var search = require('youtube-search');
const REQUEST_NUMB = 30;


exports.exerciseHandler = function (MongoClient, urlDB) {
  exerciseHandler(MongoClient, urlDB);
}

exports.videoExerciseRequest = function (exerciseName) {
  return new Promise(function (fulfill, reject){
    var opts = {
      maxResults: 4,
      key: 'AIzaSyB10jgQoDvOoZo3NopHUvYPpHFFIFU1e6o'
    };
    search(exerciseName, opts, function(err, results) {
      if(err) return console.log(err);
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
        dbo.collection("Exercise").find({"category.name":category}).toArray(function(err, result) {
          if (err) throw err;
          //console.log(exercises);
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
      var response = request('GET', APIUrl + '?page=' + i);
      console.log("Status Code (request " + i + ") : " + response.statusCode);
      //insert document on MongoDB 
      MongoClient.connect(urlDB, { useNewUrlParser: true },function (err, db) {
        if (err) throw err;
        var dbo = db.db("Fit_AdvisorDB");
        dbo.collection("Exercise").insertMany(JSON.parse(response.body).results, function (err, res) {
          if (err) throw err;
          console.log(i + " document inserted");
          db.close();
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


