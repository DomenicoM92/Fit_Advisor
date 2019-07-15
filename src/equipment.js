var unirest = require('unirest');
var request = require('sync-request');


exports.initEquipmentCollection = function(MongoClient, urlDB, domainCode, sortBy, page) {

  console.log("EQUIPMENT: Creating Equipment Collection...");
  var created = createEquipmentCollection(MongoClient, urlDB);
  created.then(function(result) {
    populateEquipmentCollection(MongoClient, urlDB, domainCode, sortBy, page);
  }, function(err) {
    console.log(err)
  });
}

exports.updateEquipmentCollection = function(MongoClient, urlDB, domainCode, sortBy, page) {

  console.log("EQUIPMENT: Updating Equipment Collection...");
  populateEquipmentCollection(MongoClient, urlDB, domainCode, sortBy, page);
}

exports.findByKeywordAmz = function(MongoClient, urlDB, domainCode, keyword, sortBy, page) {
  
  return new Promise(function(fulfill, reject) {

    var lookupResult = lookupByKeywordAmz(MongoClient, urlDB, keyword);
    lookupResult.then(function(result) {
      fulfill(result);
    },
    function (err) {
      //console.log("Nothing found for '" + keyword + "' in DB.");
      var APIResult = searchByKeywordAmz(MongoClient, urlDB, domainCode, keyword, sortBy, page);
      APIResult.then(function(result) {
        var lookupResult = lookupByKeywordAmz(MongoClient, urlDB, keyword);
        lookupResult.then(function(result) {
          fulfill(result);
        });
      });
    });
  });

}

function createEquipmentCollection(MongoClient, urlDB) {

  return new Promise(function(fulfill, reject) {
    //console.log("Wger API Request for equipment...");
    // Wger API Request
    var APIUrl = 'https://wger.de/api/v2/equipment';
    var response = request('GET', APIUrl);
    //console.log("Request Status Code: " + response.statusCode);

    //console.log("Creating Collection...");
    // Create Equipment Collection
    MongoClient.connect(urlDB, { useNewUrlParser: true },function (err, db) {
      if (err) throw err;
      var dbo = db.db("Fit_AdvisorDB");
      var equipment = JSON.parse(response.body).results;
      equipment.forEach(eq => {
        if(eq.name == "SZ-Bar") eq.name = "EZ-Bar";
      });

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

function populateEquipmentCollection(MongoClient, urlDB, domainCode, sortBy, page) {

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
            searchByKeywordAmz(MongoClient, urlDB, domainCode, eq.name, sortBy, page);
          }
        });
        db.close();
        console.log("EQUIPMENT: Collection populated")
      }
    });
  });
}

function lookupByKeywordAmz(MongoClient, urlDB, keyword) {

  //console.log("Looking up for '" + keyword + "' in DB...");
  return new Promise(function (fulfill, reject){
    MongoClient.connect(urlDB,{ useNewUrlParser: true },function(err, db) {
      if (err) 
        throw err;
      else {
        var dbo = db.db("Fit_AdvisorDB");
        dbo.collection("Equipment").findOne({name : keyword},  { _id : 0, amazonProducts : 1}, function(err, found) {
          if(err) {
            console.log(err);
            reject(err);
          }
          if(found.amazonProducts != undefined) {
            //console.log("Found '" + keyword + "' in DB!");
            found.amazonProducts.sort(function(p1,p2) {
              if(p1.price < p2.price) return -1
              else return +1
            });
            db.close();
            fulfill(found.amazonProducts);
          }
          reject(false);
        });
      } 
    });
  });
}

function searchByKeywordAmz(MongoClient, urlDB, domainCode, keyword, sortBy, page) {

  //console.log("Axesso API Request for '" + keyword + "'...");

  if(keyword == "Bench") keyword = "Flat bench";
  if(keyword == "EZ-Bar") keyword = "Ez curl bar";

  return new Promise(function (fulfill, reject) {

    var requestType = "amazon-search-by-keyword";

  //Axesso Product Request
  unirest.get("https://axesso-axesso-amazon-data-service-v1.p.rapidapi.com/amz/"+ requestType +"?sortBy="+ sortBy +"&domainCode=" + domainCode +"&page=" + page +"&keyword=" + keyword)
    .header("Content-Type", "application/json")
    .header("X-RapidAPI-Host", "axesso-axesso-amazon-data-service-v1.p.rapidapi.com")
    .header("X-RapidAPI-Key", "adb25ade7fmsh2995e9bd3850f02p118461jsnf575decdb55f")
    .end(function(result) {

      if(keyword == "Flat bench") keyword = "Bench";
      if(keyword == "Ez curl bar") keyword = "EZ-Bar";


      //console.log("Found Products for '" + keyword + "'...");
      updateProducts(result, keyword, MongoClient, urlDB);
      fulfill(true);

    });
  });
}

function updateProducts(result, keyword, MongoClient, urlDB) {
  
  //Update MongoDB Equipment Collection Products (Cache)
  MongoClient.connect(urlDB, { useNewUrlParser: true },function (err, db) {
    if (err) throw err;
    var dbo = db.db("Fit_AdvisorDB");
    var equipmentSearch = JSON.parse(JSON.stringify(result.body)).foundProductDetails;


    //console.log("Updating '" + keyword + "' in DB...");

    dbo.collection("Equipment").updateMany(
      {"name" : keyword},
      {$set: {"amazonProducts": equipmentSearch}}
    );
    //console.log("'" + keyword + "' Equipment Collection created");
    db.close();
  });
}