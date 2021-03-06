var unirest = require('unirest');
var request = require('sync-request');

exports.initEquipmentCollection = function(MongoClient, urlDB) {

  console.log("EQUIPMENT: Creating Equipment Collection...");
  var created = createEquipmentCollection(MongoClient, urlDB);
  created.then(function(result) {
    populateEquipmentCollection(MongoClient, urlDB);
  }, function(err) {
    console.log(err)
  });
}

exports.updateEquipmentCollection = function(MongoClient, urlDB) {

  console.log("EQUIPMENT: Updating Equipment Collection...");
  populateEquipmentCollection(MongoClient, urlDB);
}

exports.findByKeyword = function(MongoClient, urlDB, keyword) {
  
  try {
    return new Promise(function(fulfill, reject) {

      var lookupResult = lookupByKeyword(MongoClient, urlDB, keyword);
      lookupResult.then(function(result) {
        fulfill(result);
      },
      function (err) {
        //console.log("Nothing found for '" + keyword + "' in DB.");
        var AmzResult = searchByKeywordAmz(MongoClient, urlDB, keyword);
        AmzResult.then(function(result) {
          var EbayResult = searchByKeywordEbay(MongoClient, urlDB, keyword);
          EbayResult.then(function(result) {
            var lookupResult = lookupByKeyword(MongoClient, urlDB, keyword);
            lookupResult.then(function(result) {
              fulfill(result);
            });
          });
        });
      });
    });
  }
  catch (err) {
    console.log(err);
  }

}

function createEquipmentCollection(MongoClient, urlDB) {

  return new Promise(function(fulfill, reject) {
    //console.log("Wger API Request for equipment...");
    // Wger API Request
    var APIUrl = 'https://wger.de/api/v2/equipment';
    var response = request('GET', APIUrl);
    if(response.statusCode != 200) reject("API call failed");

    //console.log("Creating Collection...");
    // Create Equipment Collection
    MongoClient.connect(urlDB, { useNewUrlParser: true },function (err, db) {
      if (err) throw err;
      var dbo = db.db("Fit_AdvisorDB");
      var equipment = JSON.parse(response.body).results;

      dbo.collection("Equipment").drop(function(err, res) {
        if(err);
        console.log("EQUIPMENT: Collection deleted");
      });
      dbo.collection("Equipment").insertMany(equipment, function (err, res) {
        if (err) throw err;
        console.log("EQUIPMENT: Collection created");
        db.close();
        fulfill(true);
      });
    });
  })
}

function populateEquipmentCollection(MongoClient, urlDB) {

  //console.log("Populating Equipment Collection...");
  // Populate Equipment Collection
  MongoClient.connect(urlDB, { useNewUrlParser: true },function (err, db) {
    if (err) throw err;
    var dbo = db.db("Fit_AdvisorDB");
    dbo.collection("Equipment").find({},  { name : 1}, function(err, equipment) {
      if(err);
      if(equipment) {
        console.log("EQUIPMENT: Populating collection...")
        equipment.forEach(eq => {
          if(eq.name != "none (bodyweight exercise)") {
            //console.log("Found equipment: '" + eq.name + "'.");
            searchByKeywordAmz(MongoClient, urlDB, eq.name);
            searchByKeywordEbay(MongoClient, urlDB, eq.name);
          }
        });
        db.close();
        console.log("EQUIPMENT: Collection populated")
      }
    });
  });
}

function lookupByKeyword(MongoClient, urlDB, keyword) {

  //console.log("Looking up for '" + keyword + "' in DB...");
  try {
    return new Promise(function (fulfill, reject){
      MongoClient.connect(urlDB,{ useNewUrlParser: true },function(err, db) {
        if (err) 
          throw err;
        else {
          var dbo = db.db("Fit_AdvisorDB");
          dbo.collection("Equipment").findOne({name : keyword},  { _id : 0, offers : 1}, function(err, found) {
            if(err) {
              console.log(err);
              db.close();
              reject(err);
            }
            db.close();
            fulfill(found.offers);
          });
        } 
      });
    });
  }
  catch (err) {
    console.log(err); 
  }
}

function searchByKeywordAmz(MongoClient, urlDB, keyword) {

  //console.log("Axesso API Request for '" + keyword + "'...");

  if(keyword == "Bench") keyword = "Flat bench";
  if(keyword == "SZ-Bar") keyword = "Super EZ curl";

  try {
    return new Promise(function (fulfill, reject) {

      var requestType = "amazon-search-by-keyword";
      var domainCode = "com";
      var sortBy = "relevanceblender";
      var page = "2";
  
    //Axesso Product Request
    unirest.get("https://axesso-axesso-amazon-data-service-v1.p.rapidapi.com/amz/"+ requestType +"?sortBy="+ sortBy +"&domainCode=" + domainCode +"&page=" + page +"&keyword=" + keyword)
      .header("Content-Type", "application/json")
      .header("X-RapidAPI-Host", "axesso-axesso-amazon-data-service-v1.p.rapidapi.com")
      .header("X-RapidAPI-Key", "adb25ade7fmsh2995e9bd3850f02p118461jsnf575decdb55f")
      .end(function(result) {
  
        if(result.statusCode != 200 || result.body.responseStatus != "PRODUCT_FOUND_RESPONSE") reject("API call failed");
        
        //console.log("Amazon " + result.statusCode, result.body.responseStatus);
  
        if(keyword == "Flat bench") keyword = "Bench";
        if(keyword == "Super EZ curl") keyword = "SZ-Bar";
  
  
        //console.log("Found Products for '" + keyword + "'...");
        
        //Update Equipment Collection Offers
        MongoClient.connect(urlDB, { useNewUrlParser: true },function (err, db) {
          if (err) throw err;
          var dbo = db.db("Fit_AdvisorDB");
          var offers = [];
          var equipmentSearch = JSON.parse(JSON.stringify(result.body)).foundProductDetails;
  
          equipmentSearch.forEach(eq => {
  
            let offer = {
              id: eq.asin,
              name: eq.productTitle,
              producer: eq.manufacturer,
              reviews: eq.countReview,
              rating: eq.productRating==null?"0 out of 5 stars":eq.productRating,
              seller: eq.soldBy==null?"Amazon":eq.soldBy,
              price: eq.price=="0"?"More buying offers":eq.price,
              image: eq.imageUrlList[0],
              itemLink: "https://www.amazon.com/dp/" + eq.asin,
              marketplace: "amazon"
            };
            if(offer.name != "") {
              offers.push(offer);
            }
          });
  
          //console.log("Updating '" + keyword + "' in DB...");
  
          dbo.collection("Equipment").updateMany(
            {"name" : keyword},
            {$addToSet: {"offers": {$each: offers}}}
          );
          //console.log("'" + keyword + "' Equipment Collection created");
          db.close();
        });
        
        fulfill(true);
  
      });
    });
  }
  catch (err) {
    console.log(err);
  }
  
}

function searchByKeywordEbay(MongoClient, urlDB, keyword) {

  var SECURITY_APPNAME = "PietroRu-FitAdvis-PRD-fd8d7989f-4f00e3ee";
  var SERVICE_VERSION = "1.0.0";
  var OPERATION_NAME = "findItemsAdvanced"
  var GLOBAL_ID = "EBAY-US";
  var RESPONSE_DATA_FORMAT = "JSON";
  var entries = "10";

  //console.log("Ebay API Request for '" + keyword + "'...");

  if(keyword == "Bench") keyword = "Flat bench";
  if(keyword == "SZ-Bar") keyword = "Super EZ curl";

  try {
    return new Promise(function (fulfill, reject) {


      //Ebay findItemsAdvanced Request
      unirest.get("https://svcs.ebay.com/services/search/FindingService/v1" +
      "?keywords=" + keyword +
      "&paginationInput.entriesPerPage=" + entries +
      "&outputSelector(0)=SellerInfo")
        .header("X-EBAY-SOA-GLOBAL-ID" , GLOBAL_ID)
        .header("X-EBAY-SOA-SECURITY-APPNAME", SECURITY_APPNAME)
        .header("X-EBAY-SOA-SERVICE-VERSION", SERVICE_VERSION)
        .header("X-EBAY-SOA-OPERATION-NAME", OPERATION_NAME)
        .header("X-EBAY-SOA-RESPONSE-DATA-FORMAT", RESPONSE_DATA_FORMAT)
        .end(function(result) {
          
          if(result.statusCode != 200 || findAndCorrect(JSON.parse(result.body)).findItemsAdvancedResponse.ack != "Success") reject("API call failed");
          
          //console.log("Ebay " + result.statusCode, findAndCorrect(JSON.parse(result.body)).findItemsAdvancedResponse.ack);

          if(keyword == "Flat bench") keyword = "Bench";
          if(keyword == "Super EZ curl") keyword = "SZ-Bar";
          
          //Update Equipment Collection Offers
          MongoClient.connect(urlDB, { useNewUrlParser: true },function (err, db) {
            if (err) throw err;
            var dbo = db.db("Fit_AdvisorDB");
            var offers = [];
            
            var equipmentSearch = findAndCorrect(JSON.parse(result.body)).findItemsAdvancedResponse.searchResult.item;

            equipmentSearch.forEach(eq => {

              let offer = {
                id: eq.itemId[0],
                name: eq.title[0], 
                producer: "Not available",
                reviews: "0",
                rating: "0 out of 5 stars",
                seller: eq.sellerInfo[0].sellerUserName[0],
                price: eq.sellingStatus[0].currentPrice[0].__value__,
                image: eq.galleryURL[0],
                itemLink: eq.viewItemURL[0],
                marketplace: "ebay"
              };

              offers.push(offer);
            });

            //console.log("Updating '" + keyword + "' in DB...");
            dbo.collection("Equipment").updateMany(
              {"name" : keyword},
              {$addToSet: {"offers": {$each: offers}}}
            );

            //console.log("'" + keyword + "' Equipment Collection created");
            db.close();

            fulfill(true);
          });
      });
    });
  }
  catch (err) {
    console.log(err);
  }
}

function findAndCorrect(obj){

  let o = obj,
      exclu = ['item'];

  for (const key in o) {
      if (o.hasOwnProperty(key)) {
          const val = o[key];

          if(Array.isArray(val) && val.length == 1){
              if(exclu.indexOf(key) == -1)
                  o[key] = val[0];
              o[key] = findAndCorrect(o[key]);
          }else if(!Array.isArray(val) && typeof val == 'object'){                        
              o[key] = findAndCorrect(val);
          }
      }
  }
  return o;
}