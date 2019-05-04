var request = require('sync-request');
var search = require('youtube-search');
var fs = require('fs');

exports.exerciseRequest = function() {
  exerciseRequest();
}

exports.videoExerciseRequest = function() {
  videoExercise();
}

function exerciseRequest() {
  var jsonDocuments = "";
  for(i=1; i < 30; i++) {
   
    var getUrl = 'https://wger.de/api/v2/exerciseinfo';
     
    jsonDocuments+= httpGet(getUrl,i);

    if(i == 29) {
      fs.writeFileSync('exercise.json', '['+ jsonDocuments+']', function (err) {
        if (err) throw err;
        console.log('JSON FILE CREATED!!');
      });
    }
    function httpGet(url,i){
      var response = request('GET',url+'?page='+i);
        console.log("Status Code (request "+i+ ") : "+response.statusCode);
        if(i > 1)
          response.body = ","+response.body;
        return response.body;
    }
  }
}

function videoExercise() {
  
  var opts = {
    maxResults: 4,
    key: 'AIzaSyB10jgQoDvOoZo3NopHUvYPpHFFIFU1e6o'
  };
   
  search('arms exercise', opts, function(err, results) {
    if(err) return console.log(err);
    //console.dir(results);
  });
}
