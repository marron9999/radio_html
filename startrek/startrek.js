const rm = 100;
var rc = 0;
var conn;
var band = 80;
var group = 0;
var addr = "";

window.onload = function () {
	let url = wspath();
	conn = new WebSocket(url);
	conn.onmessage = onmessage;
	conn.onopen = function() {
		conn.send("band " + band);
		conn.send("group " + group);
		conn.send("S:start");
	};
	game = document.getElementById("game");
	short = document.getElementById("short");
	stat = document.getElementById("line");
}

var mark = [];
var last = null;
function select(e) {
	if(last != null) {
		last.style.background = null;
	}
	last = e;
	last.style.background = "#cfc";
	let c = e.id.charAt(0);
	mark = [parseInt(e.id.charAt(2)), parseInt(e.id.charAt(1))];
	e = document.getElementById("mark");
	if(c == 'b') {
		e.innerHTML = "Mark: quad " + (mark[0]+1) + "," + (mark[1]+1);
		document.getElementById("warp").style.display = "inline-block";
		document.getElementById("move").style.display = "none";
		document.getElementById("photon").style.display = "none";
		document.getElementById("phaser0").style.display = "none";
	} else {
		e.innerHTML = "Mark: sec " + (mark[0]+1) + "," + (mark[1]+1);
		document.getElementById("warp").style.display = "none";
		document.getElementById("move").style.display = "inline-block";
		document.getElementById("photon").style.display = "inline";
		document.getElementById("phaser0").style.display = "block";
	}
}
function push(e) {
	if(last != null) {
		last.style.background = null;
	}
	last = null;
	if(e.id == "phaser") {
		e = "S:phaser " + document.getElementById("energy").value;
		conn.send(e);
	} else if(e.id == "warp") {
		e = "S:warp " + (mark[0] - quad[0]) + " " + (mark[1] - quad[1]);
		conn.send(e);
	} else {
		e = "S:" + e.id + " " + (mark[0] - sec[0]) + " " + (mark[1] - sec[1]);
		conn.send(e);
	}
	e = document.getElementById("mark");
	e.innerHTML = "";
	document.getElementById("warp").style.display = "none";
	document.getElementById("move").style.display = "none";
	document.getElementById("photon").style.display = "none";
	document.getElementById("phaser0").style.display = "none";
}

var quad = [];
var sec = [];
var stat = null;
var short = null;
var game = null;

function onmessage(msg) {
	msg = msg.data;
	if(msg.indexOf("title") == 0) {
		let p = msg.indexOf(" ");
		addr = msg.substr(p+1).trim();
		document.title = addr;
		p = addr.indexOf(" ");
		addr = addr.substr(0, p);
		return;
	}
	if(msg.indexOf("users") == 0) {
		let e = document.getElementById("client");
		e.innerHTML = "";
		let n = msg.replace(/,/g, " ").split(" ");
		for(let i=3; i<n.length; i++) {
			if(n[i] == addr)
				e.innerHTML += "<div>[" + n[i] + "]</div>";
			else e.innerHTML += "<div>" + n[i] + "</div>";
		}
		return;
	}
	if(msg.indexOf("S:") != 0) return;
	msg = msg.substr(2);
	let v  = msg.split(" ");
	if(v[0] == "game") {
		let y = parseInt(v[1]);
		if(y == 0) {
			game.innerHTML = "";
		}
		let d = "";
		for(let i=2; i<v.length; i++) {
			d += "<div onclick='select(this)' id=b" + y + (i-2) + ">";
			if(v[i] == "-1")
				d += "***";
			else {
				v[i] = "00" + v[i];
				v[i] = v[i].substr(v[i].length - 3);
				d += v[i];
			}
			d += "</div>";
		}
		game.innerHTML += "<div>" + d + "</div>";
		if(y == 7) {
			e = document.getElementById("b" + quad[1] + quad[0]).className = "C";
		}
		return;
	}
	if(v[0] == "short") {
		let y = parseInt(v[1]);
		if(y == 0) {
			short.innerHTML = "";
		}
		let d = "";
		for(let i=0; i<v[2].length; i++) {
			d += "<div onclick='select(this)' id=s" + y + i;
			if(v[2][i] != ".") d += " class=" + v[2][i];
			d += "><div>";
			if(v[2][i] == ".") d += " ";
			else {
				//d += v[2][i];
				if(v[2][i] == "E") d += "<img src=startrek/fighter.png>";
				else if(v[2][i] == "S") d += "<img src=startrek/star.png>";
				else if(v[2][i] == "K") d += "<img src=startrek/ufo.png>";
				else if(v[2][i] == "B") d += "<img src=startrek/ship.png>";
				else d += v[2][i];
			}
			d += "</div></div>";
		}
		short.innerHTML += "<div>" + d + "</div>";
		return;
	}
	if(v[0] == "quad") {
		stat.innerHTML = "";
		quad = [parseInt(v[1]), parseInt(v[2])];
	} else if(v[0] == "sec") {
		sec = [parseInt(v[1]), parseInt(v[2])];
	}
	v = msg.indexOf(" ");
	let m = (v[0] == "msg")? "class=m" : "";
	stat.innerHTML += "<tr>"
		+ "<td>" + msg.substr(0,v) + "</td>"
		+ "<td>&nbsp;</td>"
		+ "<td " + m + ">" + msg.substr(v+1) +"</td></tr>";
}
