const cheerio = require('cheerio');
const request = require('request');

request('https://www.workout-routine.com/workout-routines.html', function(error, response, body) {
    if(error)
        console.log('error:', error);
    console.log('statusCode:', response && response.statusCode);
    
    const $ = cheerio.load(body);
    var selector = 'body'

    const muscularGroups = ['Hot Abs', 'Strong Back', "Large Chest", 'Broad Shoulders', 'Ripped Arms', 'Defined Legs'];
    const equipment = ['dumbbells', 'barbell', 'gym', 'ball', 'bands'];
    
    
    var anchors = $("a:contains("+ muscularGroups[0] +")");

    request()

    console.log(anchors);


})





