
var selectedPass = null;
var selectedArtists = [];
var foodCounts = {}; // id -> how many
var selectedGames = [];
var lastTicket = null;

function showPage(name) {
  document.getElementById("page-home").style.display = "none";
  document.getElementById("page-make").style.display = "none";
  document.getElementById("page-mypasses").style.display = "none";

  document.getElementById("page-" + name).style.display = "block";

  if (name == "make") {
    renderPasses();
    renderArtists();
    renderFood();
    renderGames();
    updateTotal();
  }
  if (name == "mypasses") {
    renderMyPasses();
  }
}

function updatePreview() {
  var url = document.getElementById("in-photo").value;
  var img = document.getElementById("preview-img");
  if (url.length > 0) {
    img.src = url;
    img.style.display = "inline-block";
  } else {
    img.style.display = "none";
  }
}

// passes

function renderPasses() {
  var area = document.getElementById("pass-area");
  area.innerHTML = "";
  for (var i = 0; i < passes.length; i++) {
    var p = passes[i];
    var div = document.createElement("div");
    div.className = "pass-card";
    if (selectedPass == p.id) {
      div.className = "pass-card selected";
    }
    div.innerHTML = "<b>" + p.name + "</b><br>" + p.desc + "<br>₹" + p.price;
    div.setAttribute("onclick", "pickPass('" + p.id + "')");
    area.appendChild(div);
  }
}

function pickPass(id) {
  selectedPass = id;
  renderPasses();
  updateTotal();
}

// artist

function renderArtists() {
  var area = document.getElementById("artist-area");
  area.innerHTML = "";
  for (var i = 0; i < artists.length; i++) {
    var a = artists[i];
    var div = document.createElement("div");
    div.className = "artist-card";
    if (selectedArtists.indexOf(a.id) > -1) {
      div.className = "artist-card selected";
    }
    div.innerHTML = "<img src='" + a.img + "'><br><b>" + a.name + "</b><br>" + a.genre + "<br>" + a.day;
    div.setAttribute("onclick", "toggleArtist('" + a.id + "')");
    area.appendChild(div);
  }
}

function toggleArtist(id) {
  var pos = selectedArtists.indexOf(id);
  if (pos > -1) {
    selectedArtists.splice(pos, 1);
  } else {
    selectedArtists.push(id);
  }
  renderArtists();
}

// food

function renderFood() {
  var area = document.getElementById("food-area");
  area.innerHTML = "";
  for (var i = 0; i < foods.length; i++) {
    var f = foods[i];
    var qty = foodCounts[f.id] || 0;
    var row = document.createElement("tr");
    row.innerHTML =
      "<td>" + " " + f.name + " (₹" + f.price + ")</td>" +
      "<td><button class='qtybtn' onclick=\"changeFood('" + f.id + "', -1)\">-</button> " +
      "<span id='foodqty-" + f.id + "'>" + qty + "</span> " +
      "<button class='qtybtn' onclick=\"changeFood('" + f.id + "', 1)\">+</button></td>";
    area.appendChild(row);
  }
}

function changeFood(id, change) {
  var current = foodCounts[id] || 0;
  current = current + change;
  if (current < 0) {
    current = 0;
  }
  foodCounts[id] = current;
  document.getElementById("foodqty-" + id).innerHTML = current;
  updateTotal();
}

// games

function renderGames() {
  var area = document.getElementById("games-area");
  area.innerHTML = "";
  for (var i = 0; i < games.length; i++) {
    var g = games[i];
    var checked = selectedGames.indexOf(g.id) > -1 ? "checked" : "";
    var row = document.createElement("tr");
    row.innerHTML =
      "<td>"  + " " + g.name + " (₹" + g.price + ")</td>" +
      "<td><input type='checkbox' " + checked + " onclick=\"toggleGame('" + g.id + "')\"></td>";
    area.appendChild(row);
  }
}

function toggleGame(id) {
  var pos = selectedGames.indexOf(id);
  if (pos > -1) {
    selectedGames.splice(pos, 1);
  } else {
    selectedGames.push(id);
  }
  updateTotal();
}

// total

function updateTotal() {
  var total = 0;

  if (selectedPass != null) {
    for (var i = 0; i < passes.length; i++) {
      if (passes[i].id == selectedPass) {
        total = total + passes[i].price;
      }
    }
  }

  for (var key in foodCounts) {
    var qty = foodCounts[key];
    for (var i = 0; i < foods.length; i++) {
      if (foods[i].id == key) {
        total = total + foods[i].price * qty;
      }
    }
  }

  for (var i = 0; i < selectedGames.length; i++) {
    for (var j = 0; j < games.length; j++) {
      if (games[j].id == selectedGames[i]) {
        total = total + games[j].price;
      }
    }
  }

  document.getElementById("total-price").innerHTML = "₹" + total;
  return total;
}

// ticket banana

function makeTicket() {
  var name = document.getElementById("in-name").value;
  var roll = document.getElementById("in-roll").value;
  var photo = document.getElementById("in-photo").value;

  if (name == "" || roll == "" || photo == "") {
    alert("Hey! Fill in your name, Roll Number AND a photo link !");
    return;
  }
  if (selectedPass == null) {
    alert("Pick a Pass!");
    return;
  }
  if (selectedArtists.length == 0) {
    alert("Pick at least 1 artist!!");
    return;
  }

  var passObj = null;
  for (var i = 0; i < passes.length; i++) {
    if (passes[i].id == selectedPass) {
      passObj = passes[i];
    }
  }

  var artistNames = [];
  for (var i = 0; i < selectedArtists.length; i++) {
    for (var j = 0; j < artists.length; j++) {
      if (artists[j].id == selectedArtists[i]) {
        artistNames.push(artists[j].name);
      }
    }
  }

  var foodNames = [];
  for (var key in foodCounts) {
    if (foodCounts[key] > 0) {
      for (var i = 0; i < foods.length; i++) {
        if (foods[i].id == key) {
          foodNames.push(foods[i].name + " x" + foodCounts[key]);
        }
      }
    }
  }

  var gameNames = [];
  for (var i = 0; i < selectedGames.length; i++) {
    for (var j = 0; j < games.length; j++) {
      if (games[j].id == selectedGames[i]) {
        gameNames.push(games[j].name);
      }
    }
  }

  var total = updateTotal();
  var ticketId = "ECL26-" + Math.floor(Math.random() * 900000 + 100000);

  var ticket = {
    id: ticketId,
    name: name,
    roll: roll,
    photo: photo,
    passName: passObj.name,
    artists: artistNames,
    food: foodNames,
    games: gameNames,
    total: total
  };

  lastTicket = ticket;
  paintTicket(ticket);
  savePassToStorage(ticket);

  document.getElementById("ticket-box").style.display = "block";
}

function paintTicket(ticket) {
  document.getElementById("t-photo").src = ticket.photo;
  document.getElementById("t-name").innerHTML = ticket.name;
  document.getElementById("t-roll").innerHTML = "Roll No: " + ticket.roll;
  document.getElementById("t-pass").innerHTML = "Pass: " + ticket.passName;
  document.getElementById("t-artists").innerHTML = "Artists: " + ticket.artists.join(", ");
  document.getElementById("t-food").innerHTML = "Food: " + (ticket.food.length > 0 ? ticket.food.join(", ") : "none");
  document.getElementById("t-games").innerHTML = "Games: " + (ticket.games.length > 0 ? ticket.games.join(", ") : "none");
  document.getElementById("t-total").innerHTML = "TOTAL: ₹" + ticket.total;
  document.getElementById("t-id").innerHTML = "#" + ticket.id;
  document.getElementById("t-qr").src = "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=" + ticket.id;
}

function downloadTicket() {
  html2canvas(document.getElementById("the-ticket")).then(function (canvas) {
    var link = document.createElement("a");
    link.download = lastTicket.id + ".png";
    link.href = canvas.toDataURL();
    link.click();
  });
}

// pass save karega

function savePassToStorage(ticket) {
  var all = getSavedPasses();
  all.push(ticket);
  localStorage.setItem("myPasses", JSON.stringify(all));
  document.getElementById("passcount").innerHTML = all.length;
}

function getSavedPasses() {
  var raw = localStorage.getItem("myPasses");
  if (raw == null) {
    return [];
  }
  return JSON.parse(raw);
}

function renderMyPasses() {
  var all = getSavedPasses();
  var list = document.getElementById("passes-list");

  if (all.length == 0) {
    list.innerHTML = "<p>Empty?</p>";
    return;
  }

  list.innerHTML = "";
  for (var i = 0; i < all.length; i++) {
    var t = all[i];
    var div = document.createElement("div");
    div.className = "pass-item";
    div.innerHTML =
      "<b>" + t.name + "</b> - " + t.passName + " - ₹" + t.total +
      " - #" + t.id +
      " <button onclick=\"deletePass(" + i + ")\">delete</button>";
    list.appendChild(div);
  }
}

function deletePass(index) {
  var all = getSavedPasses();
  all.splice(index, 1);
  localStorage.setItem("myPasses", JSON.stringify(all));
  renderMyPasses();
  document.getElementById("passcount").innerHTML = all.length;
}

// when the page loads, show the home page and how many passes we saved already
window.onload = function () {
  showPage("home");
  var all = getSavedPasses();
  document.getElementById("passcount").innerHTML = all.length;
};
