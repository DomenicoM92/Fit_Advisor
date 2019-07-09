const cheerio = require('cheerio');
const request = require('request');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const SITE = 'www.workout-routine.com'

const equipment = ['dumbbells', 'barbell', 'gym', 'ball', 'bands'];
const muscularGroups = ['hot-abs', 'strong-back', "large-chest", 'broad-shoulders', 'ripped-arms', 'defined-legs'];

for(var i=0; i < equipment.length; i++){
    for(var j=0; j < muscularGroups.length; j++){
        var url = 'https://' + SITE + '/' + equipment[i] + "/" + muscularGroups[j];

        request(url, function(error, response, body) {
            if(error)
                console.log('error:', error);
            console.log('statusCode:', response && response.statusCode);
            if(response.statusCode != 404){
                $ = cheerio.load(body);
            
                var woutRoutine = {};
                woutRoutine['title'] = cleanText('title', $('title').text());
                woutRoutine['description'] = cleanText('description', $('p').first().text());
                woutRoutine['muscularGroup'] = muscularGroups[j];
                woutRoutine['equipment'] = equipment[i];
                woutRoutine['routine'] = $('.tableExercise').html(); //Modo becero, devo prendere singolarmente gli esercizi

                addToCollection(woutRoutine);

                console.log(woutRoutine);
            }

        });
    }
}

function cleanText(type, text){

    if(type == 'title')
        return text.split(" | ")[0];
    else
        return text.replace(/[\n\t]/g, '');
    
}

function addToCollection(woutRoutine){


}





