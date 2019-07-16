var MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName = 'Fit_AdvisorDB';


module.exports = {
    retrieveByMuscleGroup: function(muscleGroup, callback){
        //console.log(muscleGroup);
        MongoClient.connect(url, {useNewUrlParser:true}, function(err, client) {
            assert.equal(null, err);
            //console.log("Connected successfully to server");
            var db = client.db('Fit_AdvisorDB');
            const collection = db.collection('WorkoutRoutine');
            
            findDocuments(muscleGroup, db, function(results){
                client.close();
                callback(results);
            })
        });
    }
}

const findDocuments = function(muscleGroup, db, callback) {
    const collection = db.collection('WorkoutRoutine');
    
    collection.find({'muscleGroup': ""+muscleGroup+""}).toArray(function(err, docs) {
      assert.equal(err, null);
      //console.log("Found records");
      callback(docs);
    });
}