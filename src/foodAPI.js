const NUTRIDIGM_SUBSCRIPTION_ID = "MyID"
const NUTRIDIGM_ENDPOINT = "https://api.nutridigm.com/api/v1/nutridigm"
const NUTRIDIGM_FOOD_ITEMS = "/fooditems";
const NUTRIDIGM_FOOD_GROUPS = "/foodgroups";
const NUTRIDIGM_ALL_HC_API = "/healthconditions";

const USDA_REST_ENDPOINT = "https://api.nal.usda.gov/ndb";
const USDA_LIST_API = "/list";
const USDA_API_KEY = "hSixjvcZ0b6ypR1TrHCW9hzQigFvz0ZcbcSELazo";

/*Nutridigm HealthConditions
-Back pain 70
-Arrhythmia 62
-Athletic performance 67
-Chronic pain 107
-Fatigue 144
-leg cramps 201
*/

const request = require('request');

module.exports = {
  retrieveFoodItemsN: function (callback){
    const url = NUTRIDIGM_ENDPOINT + NUTRIDIGM_FOOD_ITEMS + "?subscriptionId=" + NUTRIDIGM_SUBSCRIPTION_ID;
    request(url, {json:true}, (err, res, body) => {
      if(err) {return console.log(err);}
      console.log(url);
      var foodItems = res.body;
      callback(foodItems);
    })
  },
  retrieveFoodGroupsN: function (callback){
    const url = NUTRIDIGM_ENDPOINT + NUTRIDIGM_FOOD_GROUPS + "?subscriptionId=" + NUTRIDIGM_SUBSCRIPTION_ID;
    request(url, {json:true}, (err, res, body) => {
      if(err) {return console.log(err);}
      console.log(url);
      var foodGroups = res.body;
      callback(foodGroups);
    })
  }
}





/*
function listFoodsUsda(){
  
  $.ajax(
    { url: USDA_REST_ENDPOINT + USDA_LIST_API + "?api_key=" + USDA_API_KEY, 
    beforeSend: function(xhr){xhr.setRequestHeader('Cache-control', 'max-age=60,no-cache');},
      success: function(data, status, xhr){
                if(status == "success"){
                  resultJson = data;                    
                  for(i = 0; i < data.list.item.length; i++){
                    $(".result-div").append("<h5>" + data.list.item[i].name + "</h5>" + "</br>");
                  }
                }
              },
      dataType: "json",
      error: function(xhr, status, error){
        console.log(error);
      }
    });
}

//Retrieve all foods from the nutridigm API
function getFoodItems(){
  $.ajax(
    { url: NUTRIDIGM_REST_ENDPOINT + NUTRIDIGM_ALL_FOODS_API + "?subscriptionId=" + NUTRIDIGM_SUBSCRIPTION_ID, 
      //headers: {'cache-control': 'max-age=0'},
      success: function(data, status, xhr){
                if(status == "success")
                  printAPIResults(data, "fiText");
              },
      dataType: "json",
      error: function(xhr, status, error){
        console.log(error);
      }
    });
}

//Retrieve all healthconditions
function getHealthConditions(){
  $.ajax(
    { url: NUTRIDIGM_REST_ENDPOINT + NUTRIDIGM_ALL_HC_API + "?subscriptionId=" + NUTRIDIGM_SUBSCRIPTION_ID, 
      //headers: {'Cache-control':'max-age=0'},  
      success: function(data, status, xhr){
                if(status == "success")
                  printAPIResults(data, "hcText");
              },
      dataType: "json",
      error: function(xhr, status, error){
        console.log(error);
      }
    });
}

function printAPIResults(JsonArray, fieldToPrint){
  for(i = 0; i < JsonArray.length; i++){
    $(".result-div").append("<h5>" + JsonArray[i][fieldToPrint] + "</h5>" + "</br>");
  }
}*/