var request = require('request');
const NUTRIDIGM_SUBSCRIPTION_ID = "MyID"

exports.sayHello = function() {
    console.log("HelloFood");
}


//Retrieve all foods from the nutridigm API
exports.getFoodItems = function() {
  request('https://api.nutridigm.com/api/v1/nutridigm/fooditems?subscriptionId=MyID', {json : true}, function(error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the response body
  });
}

