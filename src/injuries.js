  
  const source = "physioworks.com.au/";

  //Function that returns the injury details relied to the muscleGroup. 
  exports.findByCategory = function(muscleGroup){
    return new Promise(function (fulfill, reject){
      MongoClient.connect(urlDB,{ useNewUrlParser: true },function(err, db) {
        if (err) 
          throw err;
        else {
          var dbo = db.db("Fit_AdvisorDB");
          //TODO
        } 
      });
    });
  }

  //Crea la lista, per ogni elemento della lista effettua uno scraping completo di quell'injury, crea un doc e salvalo in mongo db
  exports.createInjuriesDataset= function(){
   /*  var noodles= require('noodlejs');
    //Retrieve the injuries list
    noodles.query({
      url: 'https://physioworks.com.au/Injuries-Conditions/Activities/weightlifting-injuries',
      type: 'html',
      selector: 'div.main-body li a',
      extract: ['href','']
    }).then(function(results){
      console.log(results);
      console.log(results[0]);
    }); */

    var request= require("request");
    var cheerio= require("cheerio");
    var url= "https://physioworks.com.au/Injuries-Conditions/Activities/weightlifting-injuries"
    request(url,function(err,res,body){
        if(err){
          console.log(err);
        }else{
          var $= cheerio.load(body);
          $("a[href *='/injuries-conditions-1/']").each(function(){
            console.log($(this).attr('href'));
          });
        }
    }
    )
  }


