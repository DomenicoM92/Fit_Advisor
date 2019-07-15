function createOffersTable(category, equipment) {
    var LIMIT_ITEM = 5;

    console.log(category, equipment[1]);
    if(equipment.length == 0) {}
    else if(equipment[0].startsWith("none") || equipment[0] == "-") {}
    else {

        $.get("./html/offers_table_big.html", function(html) {
            
            for (let j = 0; j < equipment.length; j++) {

                $("#offersDiv").append(html);
                document.getElementById("offersTable").id = "offersTable_" + j;
                document.getElementById("body_table").id = "body_table_" + j;
                document.getElementById("equipmentName").id = "equipmentName_" + j;

                if(equipment[j] == "SZ-Bar") equipment[j] = "EZ-Bar"; 

                $.get("/equipmentOffers?domainCode=com&keyword=" + equipment[j] + "&sortBy=relevancebalancer&page=1", function (data, status) {
                    var offers = data;
                    var tbody = document.getElementById("body_table_" + j);
                    document.getElementById("equipmentName_" + j).innerHTML = equipment[j];
                    for (i = 0; i < offers.length; i++) {
                        var row = tbody.insertRow(i);
                        row.id = i;
                        
                        var cell1 = row.insertCell(0); //image
                        var cell2 = row.insertCell(1); //name
                        var cell3 = row.insertCell(2); //price
                        var cell4 = row.insertCell(3); //rating
                        var cell5 = row.insertCell(4); //reviews
                        var cell6 = row.insertCell(5); //producer
                        var cell7 = row.insertCell(6); //seller
                        var cell8 = row.insertCell(7); //marketplace
            
                        cell1.innerHTML = "<img src='" + offers[i].imageUrlList[0] +"' width = '40px' height = '40px'>"
                        cell2.innerHTML = offers[i].productTitle;
                        cell3.innerHTML = offers[i].price+" $";
                        cell4.innerHTML = offers[i].productRating;
                        cell5.innerHTML = offers[i].countReview;
                        cell6.innerHTML = offers[i].manufacturer;
                        cell7.innerHTML = offers[i].soldBy;
                        cell8.innerHTML = "<a href='https://www.amazon.com/dp/" + offers[i].asin + "'><img src='./media/amazon.png' height='40px'></img></a>" ;


                        cell1.style.textAlign = "center";
                        cell2.style.textAlign = "center";
                        cell3.style.textAlign = "center";
                        cell4.style.textAlign = "center";
                        cell5.style.textAlign = "center";
                        cell6.style.textAlign = "center";
                        cell7.style.textAlign = "center";
                        cell8.style.textAlign = "center";
            
                        cell2.style.cssText = "text-overflow:ellipsis; overflow: hidden; white-space: nowrap; max-width: 200px;"
            
                        if (i >= LIMIT_ITEM)
                            row.style.display = "none";
            
                        row.appendChild(cell1);
                        row.appendChild(cell2);
                        row.appendChild(cell3);
                        row.appendChild(cell4);
                        row.appendChild(cell5);
                        row.appendChild(cell6);
                        row.appendChild(cell7);
                        row.appendChild(cell8);
                        tbody.appendChild(row);
                    }
                });

            }
            
        });
    }
}