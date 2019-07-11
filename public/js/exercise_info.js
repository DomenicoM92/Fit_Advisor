function fillSection(card) {
    
    //equipment
    var equipments = "";
    if (card.equipment.length > 1) {
        for (i = 0; i < card.equipment.length; i++) {
            if (i < card.equipment.length - 1)
                equipments += card.equipment[i].name + ", ";
            else
                equipments += card.equipment[i].name;
        }
        document.getElementById("equipment").innerHTML = equipments;
    } else if (card.equipment.length == 1) {
        equipments = card.equipment[0].name;
        document.getElementById("equipment").innerHTML = equipments;
    } else {
        document.getElementById("equipment").innerHTML = "-";
    }
    //primaryM
    var primaryM = "";
    if (card.muscles.length > 1) {
        for (i = 0; i < card.muscles.length; i++) {
            if (i < card.muscles.length - 1)
                primaryM += card.muscles[i].name + ", ";
            else
                primaryM += card.muscles[i].name;
        }
        document.getElementById("primary_muscles").innerHTML = primaryM;
    } else if (card.muscles.length == 1) {
        primaryM = card.muscles[0].name;
        document.getElementById("primary_muscles").innerHTML = primaryM;
    } else {
        document.getElementById("primary_muscles").innerHTML = card.category.name;
    }
    //secondaryM
    var secondaryM = "";
    if (card.muscles_secondary.length > 1) {
        for (i = 0; i < card.muscles_secondary.length; i++) {
            if (i < card.muscles_secondary.length - 1)
                secondaryM += card.muscles_secondary[i].name + ", ";
            else
                secondaryM += card.muscles_secondary[i].name;
        }
        document.getElementById("secondary_muscles").innerHTML = secondaryM;
    } else if (card.muscles_secondary.length == 1) {
        secondaryM = card.muscles_secondary[0].name;
        document.getElementById("secondary_muscles").innerHTML = secondaryM;
    } else {
        document.getElementById("secondary_muscles").innerHTML = "-";
    }
   
    $.get("/exercise_video?name=" + card.name, function (data, status) {
        console.log("data"+data)
        if(status == "success") {
            var video = data;
            console.log(video);
            var link = "https://www.youtube.com/embed/" + video[0].id;
            document.getElementById('iFrame1').setAttribute("src", link);
        }else {
            console.log("error 403 (exceeded number request YouTube API)");
        }
    });
}