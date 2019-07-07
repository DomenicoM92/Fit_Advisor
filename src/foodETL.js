const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var foodAPI = require('./foodAPI');

module.exports = {
    performETL: function (){
        const url = 'mongodb://localhost:27017';
    
        const dbName = "Fit_AdvisorDB";
    
        const client = new MongoClient(url, { useNewUrlParser: true });
    
        client.connect(function(err) {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            
            const db = client.db(dbName);
    
            insertDocuments(db, function(){
                client.close();
            });
            
        });
    }
}

const insertDocuments = function(db, callback) {
  
  insertFoodItems(db, function(){
    insertFoodGroups(db, function(){
      callback();
    })
  });
}
  
const insertFoodItems = function(db, callback){
  var collection = db.collection('FoodItems');
  foodAPI.retrieveFoodItemsN(function(foodItems){
    
    collection.insertMany(foodItems, function(err, result) {
      console.log("Inserted food items documents into the collection");
      callback();
    });
  });
} 

const insertFoodGroups = function(db, callback){
  var collection = db.collection('FoodGroups');
  foodAPI.retrieveFoodGroupsN(function(foodGroups){
    
    collection.insertMany(foodGroups, function(err, result) {
      console.log("Inserted food groups documents into the collection");
      callback(result);
    });
  });
} 


