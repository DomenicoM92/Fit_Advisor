const NUTRIDIGM_SUBSCRIPTION_ID = "MyID"
const NUTRIDIGM_REST_ENDPOINT = "https://api.nutridigm.com/api/v1/nutridigm"
const NUTRIDIGM_ALL_FOODS_API = "/fooditems";
const NUTRIDIGM_ALL_HEALTH_CONDITIONS_API = "/healthconditions";


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
    { url: NUTRIDIGM_REST_ENDPOINT + NUTRIDIGM_ALL_HEALTH_CONDITIONS_API + "?subscriptionId=" + NUTRIDIGM_SUBSCRIPTION_ID, 
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