var request = require('sync-request');
var search = require('youtube-search');
const REQUEST_NUMB = 30;

exports.exerciseRequest = function (MongoClient, urlDB) {
  exerciseRequest(MongoClient, urlDB);
}

exports.videoExerciseRequest = function () {
  videoExercise();
}

function exerciseRequest(MongoClient, urlDB) {

  for (i = 1; i < REQUEST_NUMB; i++) {

    var APIUrl = 'https://wger.de/api/v2/exerciseinfo';
    
    if(i == 29) {
      //Create index after all request and insertion
      MongoClient.connect(urlDB, function (err, db) {
        if (err) throw err;
        var dbo = db.db("Fit_AdvisorDB");
        
        dbo.collection("Exercise").createIndex(
          { "category.name" : 1 }, function(err, result) {
          console.log(result);
          
        });
      });
    }
    httpGet(APIUrl, i);

    function httpGet(APIUrl, i) {
      var response = request('GET', APIUrl + '?page=' + i);
      console.log("Status Code (request " + i + ") : " + response.statusCode);
      //insert document on MongoDB 
      MongoClient.connect(urlDB, function (err, db) {
        if (err) throw err;
        var dbo = db.db("Fit_AdvisorDB");
        dbo.collection("Exercise").insertMany(JSON.parse(response.body).results, function (err, res) {
          if (err) throw err;
          console.log(i + " document inserted");
          db.close();
        });
      });
    }
  }
}

function videoExercise() {

  var opts = {
    maxResults: 4,
    key: 'AIzaSyB10jgQoDvOoZo3NopHUvYPpHFFIFU1e6o'
  };

}
