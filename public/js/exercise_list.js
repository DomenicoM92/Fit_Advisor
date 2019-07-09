function openCurrentTab() {
    if (localStorage.getItem("category") == null) {
        var category = "Arms";
        localStorage.setItem("category", category);
        document.getElementById("ArmsButton").click();
    } else {
        var category = localStorage.getItem("category");
        document.getElementById(category + "Button").click();
    }
}
var someVarName = localStorage.getItem("category");
function switchTab(evt, category) {
    var i, tabcontent, tablinks;
    localStorage.setItem("category", category);
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(category).style.display = "block";
    evt.currentTarget.className += " active";

    var httpReq = new XMLHttpRequest();
    httpReq.open("GET", "/exerciseCategory", false);
    httpReq.setRequestHeader("category", category);
    httpReq.send();
    var exercises = JSON.parse(httpReq.response);
    if (httpReq.status == 200 && document.getElementById(category).children[0].children[0] == undefined) {
        for (i = 0; i < exercises.length; i++) {
            var table = document.getElementById(category).children[0];
            var row = table.insertRow(i);
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
            submit.className = 'btn btn-primary';
            form.appendChild(card);
            form.appendChild(submit);
            cell2.appendChild(form); 
            cell1.style.textAlign = "left";
            cell2.style.textAlign = "left";
        }
    }
}