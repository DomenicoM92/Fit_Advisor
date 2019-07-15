const cheerio = require('cheerio');
const request = require('request');

const url = 'https://legionathletics.com/muscle-groups/';

exports.findByMuscGroup = function(muscGroup, callback){
    var description = {
        title:"",
        content:[]
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
            var content = "";
            
            if(elem.tagName === 'p'){
                if($(elem).first().children.length > 0){
                    var image = undefined;

                    if(elem.firstChild.tagName === "img"){
                        $(elem).find('img').each(function(i, ele) {
                            image = $(ele).attr('src');

                        });
                        if(image != undefined){
                            content = '<p><img src="' + image + '"/></p>';
                            description.content[i] = content;
                        }
                        else{
                            content = '<p>' + $(this).text() + '</p>';
                            description.content[i] = content;

                        }

                    }
                    else {
                        $(elem).find('span img').each(function(i, ele) {
                                image = $(ele).attr('src');
                        });
                        if(image != undefined){
                            content = '<p><img src="' + image + '"/></p>';
                            description.content[i] = content;
                        }
                        else{
                            content = '<p>' + $(this).text() + '</p>';
                            description.content[i] = content;

                        }
                    }

                    
                }
            }
            else if(elem.tagName === 'ul'){
                content = '<ul>' + $(this).html() + '</ul>';
                description.content[i] = content;
                //console.log(content);
            }
            else if(elem.tagName === 'h4'){
                content = '<h4>' + $(this).text() +'</h4>';
                description.content[i] = content;

            }
        });

        callback(description);
    });
}