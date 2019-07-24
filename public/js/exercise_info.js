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

    //equipment offers
    createOffersTable(card.equipment, "rating");

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
            var link = "https://www.youtube.com/embed/" + video.id;
            document.getElementById('iFrame1').setAttribute("src", link);
        }else {
            console.log("error 403 (exceeded number request YouTube API)");
        }
    }); 

}

function createOffersTable(equipment) {

    console.log(equipment);
    if(equipment.length == 0) {}
    else if(equipment[0].name.startsWith("none") || equipment[0].name == "-") {}
    else {

        $.get("./html/offers_table.html", function(html) {

            $("#offersDiv").empty();
            
            for (let j = 0; j < equipment.length; j++) {

                $("#offersDiv").append(html);
                document.getElementById("offersTable").id = "offersTable_" + j;
                document.getElementById("body_table").id = "body_table_" + j;
                document.getElementById("equipmentName").id = "equipmentName_" + j;

                var table = $.get("/equipmentOffers?keyword=" + equipment[j].name, function (data, status) {
                    var offers = data;
                    var tbody = document.getElementById("body_table_" + j);
                    document.getElementById("equipmentName_" + j).innerHTML = equipment[j].name;
                    for (i = 0; i < offers.length; i++) {
                        var row = tbody.insertRow(i);
                        row.id = i;
                        
                        var cell1 = row.insertCell(0); //image
                        var cell2 = row.insertCell(1); //name
                        var cell3 = row.insertCell(2); //price
                        var cell4 = row.insertCell(3); //marketplace
            
                        cell1.innerHTML = "<img src='" + offers[row.id].image +"' width = '50px' height = '50px'>"
                        cell2.innerHTML = offers[row.id].name;
                        if(offers[row.id].price == "More buying offers") {
                            cell3.innerHTML = offers[row.id].price;
                        }
                        else {
                            cell3.innerHTML = offers[row.id].price+" $";
                        }
                        if(offers[row.id].marketplace == "amazon") {
                            cell4.innerHTML = "<a href='" + offers[row.id].itemLink + "'><img src='./media/amazon.png' height='30px'></img></a>";
                            cell4.dataset.order = "amazon"
                        }
                        else if(offers[row.id].marketplace == "ebay") {
                            cell4.innerHTML = "<a href='" + offers[row.id].itemLink + "'><img src='./media/ebay.png' height='30px'></img></a>";
                            cell4.dataset.order = "ebay"
                        }

            
                        cell1.style.textAlign = "center";
                        cell2.style.textAlign = "center";
                        cell3.style.textAlign = "center";
                        cell4.style.textAlign = "center";
            
                        cell1.style.cssText = "max-width: 50px"
                        cell2.style.cssText = "text-overflow:ellipsis; overflow: hidden; white-space: nowrap; max-width: 300px; font-size: 12px; padding-left: 5px"
            
                        row.appendChild(cell1);
                        row.appendChild(cell2);
                        row.appendChild(cell3);
                        row.appendChild(cell4);
                        tbody.appendChild(row);
                    }
                });

                table.then(function() {
                    $('#offersTable_' + j).DataTable({
                        "columnDefs": [
                            { "type": "num-fmt", "targets": 2 }
                          ],
                        "order": [[ 2, "asc" ]],
                        "pageLength": 5,
                        bAutoWidth: false,
                        language: {
                            search: "_INPUT_",
                            searchPlaceholder: "Search for " + equipment[j].name + "..."
                        },
                        "lengthChange": false
                    });
                }).then(function() {
                    console.log("CCC");
                    $('#offersTable_' + j+ '_wrapper').find(".row").find(".col-sm-12.col-md-6:first-child").remove();
                });
            }  
        });
    }
}