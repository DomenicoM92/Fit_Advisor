const cheerio = require('cheerio');
const request = require('request');

const url = 'https://legionathletics.com/muscle-groups/';
const absSource = 'https://www.weight-lifting-complete.com/major-muscle-groups/';

exports.findByMuscGroup = function(muscGroup, callback){
    var description = {
        title:"",
        content:[]
    }
    

    if(muscGroup === 'Abs'){
        description.title = '<h1>Abs</h1>';
        request(absSource, function (error, response, body) {
            if(response.statusCode!=200 || error){
                callback(description);
                return;
            }
            var $ = cheerio.load(body);
            var absStart = $('#11_Abs').parent();
            var absEnd = $('#Best_Ab_Exercises').parent();

            //console.log(absStart.text());
            absStart.nextUntil(absEnd).each(function(index, elem) {
                //console.log(elem.tagName);
                if(elem.tagName === 'p'){
                    description.content[index] = '<p>' + $(elem).text() + '</p>';
                }
                else if(elem.tagName === 'ul'){
                    description.content[index] = '<ul>' + $(this).html() + '</ul>';
                }
                else if(elem.tagName === 'h4') {
                    description.content[index] = '<h4>' + $(this).text() + '</h4>';
                }
                else if(elem.tagName === 'figure') {
                    description.content[index] = $(this).html();
                }
            });
            //console.log(description.content);
            callback(description);
        });
    }
    else{
        request(url, function (error, response, body) {
            if(response.statusCode!=200 || error){
                callback(description);
                return;
            }
            var $ = cheerio.load(body);
        
            var title = $('h3').filter(function() {
                return $(this).text().trim() === muscGroup;
            });
    
            description.title = '<h1>' + title.text() + '</h1>';
    
    
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
                                description.content[i] = content
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
}