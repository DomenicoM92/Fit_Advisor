var buttonNumb = 1;

function buildTable(category) {
    var LIMIT_ITEM = 10;

    $.get("/exerciseCategory?category=" + category, function (data, status) {
        var exercises = data;
        var tbody = document.getElementById("body_table");
        for (i = 0; i < exercises.length; i++) {
            var row = tbody.insertRow(i);
            row.id = i;
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            cell1.innerHTML = exercises[i].name;
            var form = document.createElement('form');
            form.setAttribute('method', 'POST');
            form.setAttribute('action', "/exercise_info");
            form.enctype = "application/x-www-form-urlencoded";
            var card = document.createElement('input');
            card.type = "hidden";
            card.name = "card";
            card.value = JSON.stringify(exercises[i]);
            // add a submit button
            var submit = document.createElement('input');
            submit.type = 'submit';
            submit.value = "show more";
            submit.className = 'btn btn-outline-dark btn-smal';
            form.appendChild(card);
            form.appendChild(submit);
            cell2.appendChild(form);
            cell1.style.textAlign = "left";
            cell1.style.fontSize = "medium";
            cell2.style.textAlign = "center";
            if (i > LIMIT_ITEM)
                row.style.display = "none";
            row.appendChild(cell1);
            row.appendChild(cell2);
            tbody.appendChild(row);
        }
        var exeNumb = document.getElementById("body_table").children.length;
        var list_container = document.getElementById("list_container");
        for (i = 0; i < exeNumb / 10; i++) {
            var li = document.createElement("li");
            var a = document.createElement("a");
            a.innerHTML = i + 1;
            a.id = "anchor" + (i + 1);
            a.className = "text-dark";
            a.addEventListener('click', function (event) {
                if (!event) event = window.event;
                var offset = (parseInt(event.target.childNodes[0].textContent)) - 1;
                buttonNumb = offset + 1;
                var allExer = document.getElementById("body_table").children.length;
                //remove active button
                for (i = 1; i < (allExer / 10) + 1; i++) {
                    if (i == buttonNumb)
                        document.getElementById("anchor" + i).style.backgroundColor = "Gainsboro";
                    else
                        document.getElementById("anchor" + i).style.backgroundColor = "White";
                }
                for (i = 0; i < allExer; i++) {
                    if (i > (offset * 10) && i <= ((offset * 10) + 10)) {
                        document.getElementById(i).style.display = "table-row";
                    } else {
                        document.getElementById(i).style.display = "none";
                    }
                }
            });
            li.style.display = "inline";
            li.style.padding = "0 5%";
            li.appendChild(a);
            list_container.appendChild(li);
            if (i == 0)
                document.getElementById("anchor" + (i + 1)).style.backgroundColor = "Gainsboro";
        }
    });
}

function pageSwitch(value) {

    if (value > 0 && buttonNumb < document.getElementById("list_container").children.length) {
        buttonNumb += value;
        document.getElementById("anchor" + buttonNumb).click();
        document.getElementById("anchor" + buttonNumb).style.backgroundColor = "Gainsboro";
        document.getElementById("anchor" + (buttonNumb - 1)).style.backgroundColor = "White";
    }
    if (buttonNumb > 1 && value < 0) {
        buttonNumb += value;
        document.getElementById("anchor" + buttonNumb).click();
        document.getElementById("anchor" + buttonNumb).style.backgroundColor = "Gainsboro";
        document.getElementById("anchor" + (buttonNumb + 1)).style.backgroundColor = "White";
    }
}