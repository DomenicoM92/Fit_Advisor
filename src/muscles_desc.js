const cheerio = require('cheerio');
const request = require('request');

const url = 'https://legionathletics.com/muscle-groups/';

exports.findByMuscGroup = function(muscGroup, callback){
    var description = {
        title:"",
        paragraphs:[]
    }
    
    request(url, function (error, response, body) {
        if(error) throw error;
        //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    
        var $ = cheerio.load(body);
    
        var title = $('h3').filter(function() {
            return $(this).text().trim() === muscGroup;
        });

        description.title = title.text();

        var content = title.nextUntil('h3').each(function(i, elem) {
            description.paragraphs[i] = $(this).text();
        });

        callback(description);
    });
}