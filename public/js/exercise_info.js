function fillSection(card) {
    document.getElementById("name").innerHTML = card.name;
    document.getElementById("description").innerHTML = card.description;
    document.getElementById("category").innerHTML = card.category.name;
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
        document.getElementById("equipment").innerHTML = "Not required";
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
        document.getElementById("muscles_primary").innerHTML = primaryM;
    } else if (card.muscles.length == 1) {
        primaryM = card.muscles[0].name;
        document.getElementById("muscles_primary").innerHTML = primaryM;
    } else {
        document.getElementById("muscles_primary").innerHTML = "Not present";
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
        document.getElementById("muscles_secondary").innerHTML = secondaryM;
    } else if (card.muscles_secondary.length == 1) {
        secondaryM = card.muscles_secondary[0].name;
        document.getElementById("muscles_secondary").innerHTML = secondaryM;
    } else {
        document.getElementById("muscles_secondary").innerHTML = "Not present";
    }

    var httpReq = new XMLHttpRequest();
    httpReq.open("GET", "/exercise_video", false);
    httpReq.setRequestHeader("name", card.name);
    httpReq.send();
    if (httpReq.status == 200) {
        var video = JSON.parse(httpReq.response);
        var link1 = "https://www.youtube.com/embed/" + video[0].id;
        var link2 = "https://www.youtube.com/embed/" + video[1].id;
        document.getElementById('iFrameContainer').style.display = "block";
        document.getElementById('iFrame1').setAttribute("src", link1);
        document.getElementById('iFrame2').setAttribute("src", link2);
    } else {
        console.log("error 403 (exceeded number request YouTube API)");
        document.getElementById('iFrameContainer').style.display = "none";
    }
}