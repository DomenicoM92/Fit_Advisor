const exercise = require('./src/exercise');
const equipment = require('./src/equipment');
const injury = require('./src/injuries');
const woutRoutine= require('./src/workout_routine_scraper');

const MongoClient = require('mongodb').MongoClient;
const urlDB = 'mongodb://localhost:27017/';
var request = require('sync-request');

var fs = require('fs');

//Setup Equipment Collection and Populate Products
equipment.initEquipmentCollection(MongoClient, urlDB, "com", "relevanceblender", "1");


//Setup Injury Collection 
injury.ETLInjury(MongoClient, urlDB, function(){
    MongoClient.connect(urlDB, { useNewUrlParser: true }, function (err, client) {
        var db = client.db("Fit_AdvisorDB");
        var collection= db.collection("Injury");
        collection.createIndex({'category': 1}, function(err, result) {
            console.log("INJURY: Index created correctly");
            client.close();
        });
    });
});

//Setup and Populate Workout Routine Collection
woutRoutine.ETLWoutRoutine();

//Check if API is available, then save a backup copy of Exercise collection, delete it, eventually call exercise handler (wrapper for exercise)
//console.log('Update Exercise ' + new Date().toISOString());
if (request('GET', "https://wger.de/api/v2/exerciseinfo?page=1").statusCode == 200) {
    //make a backup of collection exercises
    return new Promise(function (fulfill, reject) {
        MongoClient.connect(urlDB, { useNewUrlParser: true }, function (err, db) {
            if (err) throw err;
            var dbo = db.db("Fit_AdvisorDB");
            dbo.collection("Exercise").find({}).toArray(function (err, result) {
                if (err) console.log(err);
                fs.writeFile("security_backup_mongoDB/exercise_backup.json", JSON.stringify(result), function (err) {
                    if (err) console.log("Backup failed");
                    console.log("Backup copy of Exercise is correctly stored in security_backup_mongoDB/");
                    //delete collection exercise 
                    dbo.collection("Exercise").drop(function (err, delOK) {
                        if (err) {
                            console.log("Deletion failed");
                            console.log(err);
                        }
                        if (delOK) {
                            console.log("Collection deleted");
                            fulfill();
                        }
                        db.close();
                    });
                });
            });
        });
    }).then(function () {
        //after deletion redo API call
        exercise.exerciseHandler(MongoClient, urlDB);
    }).then(function(){
        //Setup url video cache
        MongoClient.connect(urlDB, { useNewUrlParser: true }, function (err, db) {
            if (err) throw err;
            var dbo = db.db("Fit_AdvisorDB");
            dbo.createCollection("Url_Video_Cache");
            dbo.collection("Url_Video_Cache").deleteMany();
            dbo.collection("Url_Video_Cache").createIndex({ "name": 1 }, function (err, result) {
                console.log("Url_Video_Cache: Index created correctly");
            });
            db.close();
            console.log("Url_Video_Cache: Created!");
        });
    });
}