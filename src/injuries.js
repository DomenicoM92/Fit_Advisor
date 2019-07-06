  
  const URL_ROOT = "http://physioworks.com.au";
  const URL_LIST_ITEMS= "https://physioworks.com.au/Injuries-Conditions/Activities/weightlifting-injuries";


  exports.getInjuriesList = function(db){
    var dbo = db.db("Fit_AdvisorDB");
    dbo.collection("Injuries").find({'injuryName': 1}).sort({injuryName: 1}).toArray(function(err, result){
      if(err) throw err;
      db.close();
    });
  }


  exports.findByInjuryName = function(injuryName,MongoClient, urlDB){
    MongoClient.connect(urlDB,{ useNewUrlParser: true },function(err, db) {
      if (err) 
        throw err;
      else {
        var dbo = db.db("Fit_AdvisorDB");
        dbo.collection("Injuries").findOne({'injuryName':injuryName}, function(err, result){
          if(err) throw err;
            db.close();
        });
      } 
    });
  }

  exports.createInjuriesDataset= function(db){
    var request= require("request");
    var cheerio= require("cheerio");
    var fs= require("fs");

    request(URL_LIST_ITEMS,function(err,res,body){
        if(err){
          console.log(err);
        }else{
          var $= cheerio.load(body);
          $("a[href *='/injuries-conditions-1/']").each(function(){
            const URL_RESOURCE= URL_ROOT+$(this).attr('href');     
            request(URL_RESOURCE, function(err,res,body){
              if(err){
                console.log(err);
              }else{
                if(res.statusCode == 200){
                  var $= cheerio.load(body);
                  //RETRIEVE THE INJURY TITLE 
                  var title= $('td h1').text();
                  console.log("TITLE: "+ title);
                  //RETIREVE THE MAIN BODY CONTENT OF THE INJURY'S DESCRIPTION
                  var content= $("tbody");
                  //REMOVE EMPTY PARAGRAPHS
                  content.find('p[style *= "text-align:"]').remove();
                  //ADJUST ALL IMAGES PATH 
                  content.find('div > img, tbody tr td p > img').each((i,el)=>{
                    var img_src= $(el).attr('src');
                    if(! img_src.includes('://')){
                      $(el).attr('src', URL_ROOT+$(el).attr('src'));
                    }
                    //console.log($(el).attr('src'));
                  });
                  //REMOVE ALL ANCHORS, SCRIPTS AND PRE ELEMENTS FROM THE CONTENT
                  content.find('a, script, pre').each(function(){
                    $(this).remove();
                  });
                  //REMOVE ALL ELEMENTS AFTER THE 'ins' ELEMENT
                  content.find('ins').nextAll().remove();
                  //FINALLY REMOVE THE 'ins' ELEMENT
                  content.find('ins').remove();
                  //REMOVE ALL EMPTY 'li' ELEMENT
                  content.find('ul li').each(function(){
                    if($(this).html()== "" || typeof($(this).html())== "undefined")
                      $(this).remove();
                  });
                  fs.writeFile("/home/francali/Desktop/Files/"+title+".html", content, function(err) {
                    if(err) {
                        return console.log(err);
                    }      
                }); 
                
                }        
              }       
            });    
          });
        } //END OF REQUEST FUNCT
        
    }); //END OF MODULE










  } 

