const foodETL = require('./src/foodETL');
const exercise = require('./src/exercise');
const MongoClient = require('mongodb').MongoClient;
const urlDB = 'mongodb://localhost:27017/';

foodETL.performETL();
exercise.exerciseHandler(MongoClient, urlDB);