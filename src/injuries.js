  const URL_ROOT = "http://physioworks.com.au";
  const URL_LIST_ITEMS= "https://physioworks.com.au/Injuries-Conditions/Activities/weightlifting-injuries";
  const categories=  [
    {
      title: "Arms",
      values: ["bicep", "tricep", "forearm", "carpal"]
    },
    {
      title: "Abs",
      values: ["abdominal"]
    },
    {
      title: "Back",
      values: ["back", "spine", "neck"]
    },
    {
      title: "Chest",
      values: ["pectoral"]
    },
    {
      title: "Legs",
      values: ["glute", "femor", "hamstring", "knee", "calf"]
    },
    {
      title: "Shoulders",
      values: ["shoulder", "cuff"]
    }
  ];


  exports.retrieveByMuscularGroup = function(category, MongoClient, urlDB, callback){
    MongoClient.connect(urlDB,{ useNewUrlParser: true },function(err, db) {
      if (err) 
        throw err;
      else {
        var dbo = db.db("Fit_AdvisorDB");
        dbo.collection("Injury").find({'category': category}).toArray(function(err, result){
          if(err) throw err;
          db.close();
          callback(result);
        });
      }
    });
  }

  exports.findByInjuryName = function(injuryName,MongoClient, urlDB, callback){
    MongoClient.connect(urlDB,{ useNewUrlParser: true },function(err, db) {
      if (err) 
        throw err;
      else {
        var dbo = db.db("Fit_AdvisorDB");
        dbo.collection("Injury").findOne({'title':injuryName}, function(err, result){
          if(err) throw err;
            db.close();
            callback(result);
        });
      } 
    });
  }

  exports.bodyParser= function(MongoClient,urlDB, callback){
    var request= require("request");
    var cheerio= require("cheerio");
    //var fs= require("fs");

    request(URL_LIST_ITEMS,function(err,res,body){
        if(err){
          console.log(err);
        }else{
          console.log("INJURY: begin etl module")
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
                  //console.log("TITLE: "+ title);
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
                  MongoClient.connect(urlDB, { useNewUrlParser: true },function (err, db) {
                    if (err) throw err;
                    var dbo = db.db("Fit_AdvisorDB");
                    var injury_obj= {category:createMatchingByTitle(title), title: title, timestamp: new Date().toISOString(), content: ""+content.html()};
                    dbo.collection("Injury").insertOne(injury_obj, function (err, res) {
                    if (err) throw err;
                    });
                  });      
                }        
              }       
            });    
          });
        } //END OF REQUEST FUNCT
        console.log("INJURY: end etl module")
    }); //END OF MODULE

    callback();
  }


  function createMatchingByTitle(injuryName){
    var category="";
    var str= "Biceps Tendinopathy";
    categories.forEach(function(entry, index){
      for(var i=0; i<entry.values.length; i++){
        if(injuryName.toLowerCase().includes(entry.values[i].toLowerCase())){
          category= entry.title.toLowerCase();
        }        
      }
    });
    return category;
  }


