var request = require('request');
var googleAPIs = require('googleapis');
var jsonDocuments = []; 

exports.exerciseRequest = function() {
  exerciseRequest();
}

exports.videoExerciseRequest = function() {
  videoExercise();
}
function exerciseRequest() {
  for(i=1; i < 29; i++) {
    request.get({url: 'https://wger.de/api/v2/exerciseinfo', qs: {"page": i}}, 
    function(err, response, body) {
      console.log('statusCode:', response && response.statusCode); 
      jsonDocuments[i] = JSON.parse(body);
      //console.log(jsonDocuments[i]);
    });
  }
}

function videoExercise() {
  
  var opts = {
    maxResults: 10,
    key: 'AIzaSyB10jgQoDvOoZo3NopHUvYPpHFFIFU1e6o'
  };
   
  search('arms', opts, function(err, results) {
    if(err) return console.log(err);
   
    console.dir(results);
  });
}
