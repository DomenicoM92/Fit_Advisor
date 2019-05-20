const NUTRIDIGM_SUBSCRIPTION_ID = "MyID"
const NUTRIDIGM_REST_ENDPOINT = "https://api.nutridigm.com/api/v1/nutridigm"
const NUTRIDIGM_ALL_FOODS_API = "/fooditems";
const NUTRIDIGM_ALL_HC_API = "/healthconditions";

const USDA_REST_ENDPOINT = "https://api.nal.usda.gov/ndb";
const USDA_LIST_API = "/list";
const USDA_API_KEY = "hSixjvcZ0b6ypR1TrHCW9hzQigFvz0ZcbcSELazo";

//var resultJson;

/*Nutridigm HealthConditions
-Back pain 70
-Arrhythmia 62
-Athletic performance 67
-Chronic pain 107
-Fatigue 144
-leg cramps 201
*/


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
}