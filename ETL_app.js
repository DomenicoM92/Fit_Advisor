const foodETL = require('./src/foodETL');
const exercise = require('./src/exercise');
var equipment = require('./src/equipment');
const MongoClient = require('mongodb').MongoClient;
const urlDB = 'mongodb://localhost:27017/';

//foodETL.performETL();

exercise.exerciseHandler(MongoClient, urlDB);

//Setup Equipment Collection and Populate Products
equipment.initEquipmentCollection(MongoClient, urlDB, "com", "relevanceblender", "1");

