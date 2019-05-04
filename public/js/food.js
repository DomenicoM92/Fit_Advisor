const NUTRIDIGM_SUBSCRIPTION_ID = "MyID"
const NUTRIDIGM_ALL_FOODS_URL = "https://api.nutridigm.com/api/v1/nutridigm/fooditems?subscriptionId=MyID"



//Retrieve all foods from the nutridigm API
function getFoodItems(){
  $.ajax(
    { url: NUTRIDIGM_ALL_FOODS_URL, 
      success: function(data, status, xhr){
                if(status == "success")
                  printResult(data);
              },
      dataType: "json",
      error: function(xhr, status, error){
        console.log(error);
      }
    });
}



function printResult(JsonArray){
  for(i = 0; i < JsonArray.length; i++){
    $(".result-div").append("<h5>" + JsonArray[i].fiText + "</h5>" + "</br>");
  }
}
