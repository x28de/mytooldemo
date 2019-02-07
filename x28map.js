/**
 * 
 */
	var channel;
	var lastMessage = "";

function main() { 

	if (navigator.userAgent.indexOf("Edge/") > 0) 
		alert("Warning: From the Edge browser, maps cannot be exported !");
	
//
//	Build the page
	
	document.body.innerHTML = 
			'<html><head>' + 
			'<meta charset="UTF-8"><title>Condensr Demo (limited)</title>' +
			'<link rel="stylesheet" type="text/css" href="http://x28hd.de/demo/x28map.css"></head>' + 
			'<canvas id="myCanvas" width="760" height="580">' +
			'Your browser does not support the HTML5 canvas tag. </canvas>' +
			'<div class="hide" id="rmenu">' + 
			'	<a id = "new" class=\'opt\'>Add a new item here</a><br />' + 
			'	<a id = "export" class=\'opt\' href=\'x28export.xml\'>Export</a><br />' + 
			'	<a id = "wipe" class=\'opt\'>Wipe clean</a><br />' + 
			'</div><div class="hide" id="rmenu2">' + 
			'	<a id = "color0" class=\'opt\'>Change color</a><br />' + 
			'	<a id = "color1" class=\'opt\'>Change color</a><br />' + 
			'	<a id = "color2" class=\'opt\'>Change color</a><br />' + 
			'	<a id = "color3" class=\'opt\'>Change color</a><br />' + 
			'	<a id = "color4" class=\'opt\'>Change color</a><br />' + 
			'	<a id = "color5" class=\'opt\'>Change color</a><br />' + 
			'	<a id = "color6" class=\'opt\'>Pale</a><br />' + 
			'	<a id = "color7" class=\'opt\'>Dark</a><br /></div>' + 
			'<div id="demo"><em>Drag an icon to move it;  <br />click an icon for its details.<br />' + 
			'ALT + drag an icon to connect it.<br />&nbsp;<br />&nbsp;<br />' + 
			'<a id="example" href="#">Play the intro game?</a><br />&nbsp;<br />' + 
			'<a id="help" href="#">Get help?</a></em> </div>' + 
			'<div id="fillDetails" class="hide">' + 
			'		<form action="#" method="post">' + 
			'		<span style="font-size: .7em;">Label</span>		<br />' + 
			'		<input type="text" name="label" autocomplete="off" title="Enter a label (optional)" /><br />' + 
			'		<span style="font-size: .7em;">Detail</span>' + 
			'		<textarea name="detail" title="Enter more text (optional)"></textarea>		<br />' + 
			'		<button id ="doneButton" type="button">Done</button>' + 
			'		</form></div>'; 
	
	var nodes;
	var edges;
	var details;
		
	new whiteboard();
	
//
//	Try to initialize the core arrays from localstorage 		

	var app = {
		savedNodes: [],
		savedEdges: [],
		savedDetails: [],
	};

	app.saveTopology = function() {
		var savedNodes = JSON.stringify(app.savedNodes);
		var savedEdges = JSON.stringify(app.savedEdges);
		localStorage.savedNodes = savedNodes;
		localStorage.savedEdges = savedEdges;
	};

	app.saveTexts = function() {
		var savedDetails = JSON.stringify(app.savedDetails);
		localStorage.savedDetails = savedDetails;
	};
		
	app.savedNodes = localStorage.savedNodes;
	app.savedEdges = localStorage.savedEdges;
	app.savedDetails = localStorage.savedDetails;
		
	if (app.savedNodes) {
		app.savedNodes = JSON.parse(app.savedNodes);
		nodes = app.savedNodes;
	} else {
		nodes = [
		];
		app.savedNodes = nodes;
	}
				
	if (app.savedEdges) {
		app.savedEdges = JSON.parse(app.savedEdges);
		edges = app.savedEdges;
	} else {
		edges = [ 
		]; 
		app.savedEdges = edges;
	}
				
	app.saveTopology();

	if (app.savedDetails) {
		try {
			app.savedDetails = JSON.parse(app.savedDetails);
		} catch(e) {
			alert(e);
			wipe();
		}
	    details = app.savedDetails;
	} else {
		details = [
		];
		app.savedDetails = details;
	}
				
	app.saveTexts();

//
//	Rest of initializing
				
	var can = document.getElementById("myCanvas"), 
	ctx = can.getContext('2d'),
				 
	mousedown = false;
	modified = false;
	moving = false;
				
	selectedNode = -1,
	targetNode = -1;
				
	lastX = 0, 
	lastY = 0, 
	translatedX = 0, 
	translatedY = 0;
				 
	ctx.font = "12px Arial"; 
	draw(null);
	var initText = document.getElementById("demo").innerHTML;
				
	var fillbutton = document.getElementById("doneButton");
	fillbutton.addEventListener('click',newnode2);
	
	var colors = ["#d2bbd2", "#bbbbff", "#bbffbb", "#ffff99", 
		"#ffe8aa", "#ffbbbb", "#eeeeee", "#ccdddd"];
		
	document.getElementById("help").addEventListener('click', loadHelp);
	document.getElementById("example").addEventListener('click', loadHelp);

	
	var publishNode;
	
//
//	Pointer down/ move/ up
				
	function down(e) {
		var evt = e || event; 
		lastX = evt.pageX; 
		lastY = evt.pageY; 
		if (evt.altKey || evt.which == 2) {
			modified = true;
		} else modified = false;
		selectedNode = findClicked(evt);
		if (selectedNode == -1) {
			document.getElementById("demo").innerHTML = initText;
			document.getElementById("rmenu").className = "hide";
			document.getElementById("rmenu2").className = "hide";
			document.getElementById("help").addEventListener('click', loadHelp);
			document.getElementById("example").addEventListener('click', loadHelp);
		}
		mousedown = true;
		draw(evt);
    }
    		
	function move(e){ 
		var evt = e || event; 
		var deltaX = evt.pageX - lastX; 
		var deltaY = evt.pageY - lastY; 
		if (mousedown && !modified) {
			if (selectedNode > -1) {		// Move node 
				nodes[selectedNode].x += deltaX;
				nodes[selectedNode].y += deltaY;
			} else {						// Move canvas
				translatedX += deltaX; 
				translatedY += deltaY; 
				ctx.translate(deltaX, deltaY); 
			}
		}
		moving = true;
		lastX = evt.pageX; 
		lastY = evt.pageY; 
		draw(evt); 
	} 

	function up(e){ 
		var evt = e || event; 
		if (moving && modified) {
			targetNode = findClicked(evt);
			if ((targetNode > -1) && (targetNode != selectedNode)) {
				edges.push({n1: selectedNode + 0, n2: targetNode + 0, rgb: '#c0c0c0'});
				if (channel) {
					n1 = nodes[selectedNode + 0].id;
					n2 = nodes[targetNode + 0].id;
					if (n1.length > 5 && n2.length > 5) {  // long uuid, i.e. for publishing
						var publishNode = {type: 'edge', n1, n2, rgb: '#c0c0c0'};
						publishData = JSON.stringify(publishNode);
						channel.trigger('client-my-event', {"publishNode" : publishData});
					}
				}
			} 
			targetNode = -1;
		}
		moving = false;
		mousedown = false;
		modified = false;

		app.savedNodes = nodes;
		app.savedEdges = edges;
		app.saveTopology();

		app.savedNodes = localStorage.savedNodes;
		app.savedEdges = localStorage.savedEdges;
		app.savedNodes = JSON.parse(app.savedNodes);
		app.savedEdges = JSON.parse(app.savedEdges);
		nodes = app.savedNodes;
		edges = app.savedEdges;
    		
		draw(evt);
	}  
    		
	if (window.PointerEvent) { 
		can.addEventListener('pointerdown', down); 
		can.addEventListener('pointermove', move); 
		can.addEventListener('pointerup', up); 
	} else if (window.TouchEvent) { 
		can.addEventListener('touchstart', down); 
		can.addEventListener('touchmove', move); 
		can.addEventListener('touchend', up); 
   	} else { 
		can.addEventListener('mousedown', down); 
		can.addEventListener('mousemove', move); 
		can.addEventListener('mouseup', up); 
	} 
							    		
//
//	Drag in

	function allowDrop(ev)  {
    	ev.preventDefault();
	}
				
	function drop(ev) {
		ev.preventDefault();
		var dt = ev.dataTransfer;
		var files = dt.files;
		x = ev.pageX - translatedX - 6; 
		y = ev.pageY - translatedY - 8; 
		if (files.length > 0) {
			var file = files[0];
			var reader = new FileReader();
			reader.onload = readFile(file);
			reader.readAsText(file);
		} else {
			var data = ev.dataTransfer.getData("text");
			newStuff(data);
		}
	}
	
	function readFile(file) {
		return function(e) {
			var data = e.target.result;
			newStuff(data);
		}
	}
				
	can.addEventListener('dragover', allowDrop, false);
	can.addEventListener('drop', drop, false);
				
//
//	Core 
				    		
	function draw(evt) { 
		ctx.clearRect(-translatedX, -translatedY, 860, 580); 
		if (edges.length > 0) {
			for (var i = 0; i < edges.length; i++) { 
				ctx.strokeStyle = edges[i].rgb; 
				ctx.lineWidth = 2;
				ctx.beginPath(); 
				ctx.moveTo(nodes[edges[i].n1].x, nodes[edges[i].n1].y); 
				ctx.lineTo(nodes[edges[i].n2].x, nodes[edges[i].n2].y); 
				ctx.stroke(); 
			} 
		}
		for (var i = 0; i < nodes.length; i++) { 
			ctx.beginPath(); 
			ctx.fillStyle = nodes[i].rgb; 
			ctx.rect(nodes[i].x - 10, nodes[i].y - 8, 20, 16); 
//			ctx.arc(nodes[i].x, nodes[i].y, 9, 0, 2 * Math.PI); 
			ctx.fill(); 
			ctx.fillStyle = "#000000"; 
			ctx.fillText(nodes[i].label, nodes[i].x - 9, nodes[i].y + 23); 
			if ((i == selectedNode)) highlight(i, ctx, nodes);
		} 
		if ((selectedNode > -1) && moving && modified) {	// Draw ray
			ctx.strokeStyle = "#000000"; 
			ctx.lineWidth = 2;
			ctx.beginPath(); 
			ctx.moveTo(nodes[selectedNode].x, nodes[selectedNode].y); 
			absoluteX = evt.pageX - translatedX; 
			absoluteY = evt.pageY - translatedY; 
			ctx.lineTo(absoluteX, absoluteY); 
			ctx.stroke(); 
		}
	} 

	function findClicked(evt) {
		node = -1;
		x = evt.pageX - translatedX - 6; 
		y = evt.pageY - translatedY - 8; 
		for (var i = 0; i < nodes.length; i++) { 
			if (Math.abs(x - nodes[i].x) < 11 && Math.abs(y - nodes[i].y) < 11) { 
				node = i;
			}
		}
		return node;
	}

//
//	Selected node			
				
	function highlight(i, ctx, nodes) {
		ctx.strokeStyle = "#ff0000";
		ctx.strokeRect(nodes[i].x - 11, nodes[i].y - 11, 22, 22); 
		myFunction(i); 
	}

	function myFunction(detail) { 
		var x = details[detail].text;
		document.getElementById("demo").innerHTML = x;
	}

//
//	Context menu								
				
	can.addEventListener('contextmenu', rightmenu, false);
	document.getElementById("new").addEventListener('click', newnode);
	document.getElementById("export").addEventListener('click', exp);
	document.getElementById("wipe").addEventListener('click', wipe);
	for (var i = 0; i < 8; i++) {
		var el = "color" + i;
		document.getElementById(el).addEventListener('click', recolor);
	}
				
    function rightmenu(e) {
		e.preventDefault();
		if (selectedNode == -1) {
		document.getElementById("rmenu").className = "show";  
		document.getElementById("rmenu").style.top =  e.y + 'px';
		document.getElementById("rmenu").style.left = e.x + 'px';
		} else {
			document.getElementById("rmenu2").className = "show";  
			document.getElementById("rmenu2").style.top =  e.y + 'px';
			document.getElementById("rmenu2").style.left = e.x + 'px';
			for (var i = 0; i < 8; i++) {
				document.getElementById("color" + i).style.background = colors[i];
			}
		}
	}
    		
	function newnode() {
		document.getElementById("demo").className = "hide";
		document.getElementById("fillDetails").className = "fill";
		mousedown = false;	// for mac
	}
    		
	function newnode2() {
		id = uuidv4();
		var newLabel = document.forms[0].elements[0].value;
		nodes.push({x: x, y: y, rgb: '#ffff66', label: newLabel, id: id});
		var newDetail = document.forms[0].elements[1].value;
		details.push({text: newDetail});
		if (channel) {
			var publishNode = {type: 'node', x,	y, rgb: '#ffff66', 
					label: newLabel, id, detail: newDetail};
			publishData = JSON.stringify(publishNode);
			channel.trigger('client-my-event', {"publishNode" : publishData});
		}

		newnode3();
		
		document.getElementById("rmenu").className = "hide";
		document.forms[0].elements[0].value = "";
		document.forms[0].elements[1].value = "";
		document.getElementById("demo").className = "show";
		document.getElementById("fillDetails").className = "hide";
		// TODO: highlight(id, ctx, nodes);	
	}
	
	function newnode3(){
		app.saveTopology();
		app.savedDetails = details;
		app.saveTexts();
		app.savedDetails = localStorage.savedDetails;
		app.savedDetails = JSON.parse(app.savedDetails);
		details = app.savedDetails;
	}
				
	function wipe(){
		wipe2();
		localStorage.savedURL = "reload";
		location.reload();	//	breaks xmlhttprequest.send() on Ffx !!
	};
	
	function wipe2(){
		localStorage.removeItem("savedNodes");
		localStorage.removeItem("savedEdges");
		localStorage.removeItem("savedDetails");
		nodes = [];
		edges = [],
		details = [];
	};
	
	function exp(){
		document.getElementById("rmenu").className = "hide";
		content ="<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
				"<!-- This is not for human readers but for http://x28hd.de/tool/ -->" +
				"<x28map>";
		for (var i = 0; i < nodes.length; i++) {
			node = nodes[i];
//			content += "<topic ID=\"" + node.id + "\" x=\"" + node.x + "\" y=\"" + node.y + "\" color=\"" + node.rgb + "\">" + 
			id = parseInt(node.id) + 1;		// respecting an old bug
			content += "<topic ID=\"" + id + "\" x=\"" + node.x + "\" y=\"" + node.y + "\" color=\"" + node.rgb + "\">" + 
					"<label><![CDATA[" + node.label + "]]></label>";
			content += "<detail><![CDATA[" + details[i].text + "]]></detail></topic>";
		}
		for (var i = 0; i < edges.length; i++) {
			edge = edges[i];
//			content += "<assoc n1=\"" + edge.n1 + "\" n2=\"" + edge.n2 + "\" color=\"" + edge.rgb + "\">" + 
			id1 = parseInt(edge.n1) + 1;
			id2 = parseInt(edge.n2) + 1;
			content += "<assoc n1=\"" + id1 + "\" n2=\"" + id2 + "\" color=\"" + edge.rgb + "\">" + 
					"<detail/></assoc>";
		}
		content += "</x28map>";
		uriContent = "data:text/xml," + encodeURIComponent(content);
		var expAnchor = document.getElementById("export");
		expAnchor.setAttribute('href', uriContent);
		expAnchor.setAttribute('download', 'x28export.xml');		}

//
//	Process the dropped stuff

	function newStuff(data) {
		var lines = data.split('\n');
		id = nodes.length;
		j = 0;
		xnew = x;
		for (var i = 0; i < lines.length; i++) {
			line = lines[i].trim();
			var fields = line.split('\t');
			if (fields.length < 2) {
				detail = line;
				label = line.substring(0, 30);
			} else {
				label = fields[0];
				detail = fields[1];
			}
			if (!label && !detail) continue; 
			if (label.substring(0, 2) == "[<") continue;  // Quick & dirty to exclude gRSShopper Edit button
			ynew = y + j * 50;
			if (j > 9) {
				j = 0;
				ynew = y;
				xnew += 150;
			}
			j++;
			nodes.push({x: xnew, y: ynew, rgb: '#ccdddd', label: label, id: id});
			details.push({text: detail});
			id++;
		}
		app.saveTopology();
		app.savedDetails = details;
		app.saveTexts();
		app.savedDetails = localStorage.savedDetails;
		app.savedDetails = JSON.parse(app.savedDetails);
		draw();
		details = app.savedDetails;
	}
	
	function loadHelp(e) {
        var targetElement = e.target || e.srcElement;
        helpHost = "x28hd.de";
        if (targetElement.id == "help") {
        	helpFile = "help-en.xml";
        } else {
        	str = navigator.language.substring(0, 2).toLowerCase();
        	if (str == "de") { 
        		helpFile = "example-" + str + ".xml";
        	} else {
        		helpFile = "example-en.xml";
        	}
        }
        if (location.host != helpHost) {
        	window.open("http://" + helpHost + "/demo/?" + helpFile);
        } else {
    		fetchXml(helpFile);
        }
	}

	function fetchXml(url) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function () {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				if (xhr.status === 200) {
					ending = url.substr(url.length - 4, url.length).toLowerCase();
					if (ending == ".xml") {
						whereToLoad("clean");
						loadXml(xhr.responseText);
					} else {
						whereToLoad("append");
						newStuff(xhr.responseText);
					}
				} else alert("Error loading url \n" + url + ":\n" + xhr.status + " " + xhr.statusText);
			}
		};
		xhr.send();
	}
	
	function whereToLoad(type) {
		if (type == "clean") {
			if (app.savedNodes.length > 0) {
				if (!confirm("This will wipe clean your map. \n" +
						"(You may want to export it first,\n" +
						"via right-click on the canvas.)")) {
					return;}
			}
			wipe2();
		} else {
			if (app.savedNodes.length > 0) {
				xmax = -999999;
				ymin = 999999;
				for (var i = 0; i < nodes.length; i++) {
					x = nodes[i].x;
					if (x > xmax) xmax = x;
					y = nodes[i].y;
					if (y < ymin) ymin = y;
				}
				x = xmax + 150;
				y = ymin - 40;
			} else {
				x = 40;
				y = 40;
			}
		}
	} 

	function loadXml(xml) {
		var parser;
		parser = new DOMParser();
		xmlDoc = parser.parseFromString(xml,"text/xml");
		var len = xmlDoc.documentElement.childNodes.length;
		nodes = [];
		details = [];
		oldIDs = [];
		id = 0;
		for (i = 0; i < len; i++) {
			var nodeType = xmlDoc.documentElement.childNodes[i].nodeName;
			if (nodeType == "topic") {
			var topic = xmlDoc.documentElement.childNodes[i];
			var x = topic.getAttribute("x");
			x = parseInt(x);
			var y = topic.getAttribute("y");
			y = parseInt(y);
			rgb = topic.getAttribute("color");
			var label = "";
			if (topic.getElementsByTagName("label")[0].childNodes[0]) {
				label = topic.getElementsByTagName("label")[0].childNodes[0].nodeValue;
			}
			nodes.push({x: x, y: y, rgb: rgb, label: label, id: id++});
			
			if (topic.getElementsByTagName("detail")[0].childNodes[0]) {
				detail = topic.getElementsByTagName("detail")[0].childNodes[0].nodeValue;
			}
			details.push({text: detail});
			
			var oldID = topic.getAttribute("ID");
			oldID = parseInt(oldID);
			oldIDs.push(oldID);
			} else if (nodeType == "assoc") {
				var oldN1 = xmlDoc.documentElement.childNodes[i].getAttribute("n1");
				oldN1 = parseInt(oldN1);
				var n1 = oldIDs.indexOf(oldN1);
				var oldN2 = xmlDoc.documentElement.childNodes[i].getAttribute("n2");
				oldN2 = parseInt(oldN2);
				var n2 = oldIDs.indexOf(oldN2);
				rgb = xmlDoc.documentElement.childNodes[i].getAttribute("color");
				edges.push({n1: n1, n2: n2, rgb: rgb});
				draw();
			}
		}
		app.savedNodes = nodes;
		app.savedEdges = edges;
		app.saveTopology();
		
		app.savedDetails = details;
		app.saveTexts();

		draw();
	}		
	
	function processRequestString() {
		var what = location.search.substr(1);
		if (what) {
			if (what == "wipe") {
				wipe2();
				return;
			}
			var lastWhat = localStorage.savedURL;
			if (lastWhat == "reload") {
				localStorage.removeItem("savedURL");
				return;
			} else if (lastWhat == what) {
				if (!confirm("Really add this once more? \n" + what)) trimURL();
			}
			fetchXml(what);
			localStorage.savedURL = what;
		} else {
			localStorage.removeItem("savedURL");
		}
	}
	
	function trimURL() {
		href = location.href;
		baseUrl = href.substring(0, href.indexOf('?'));
		location.assign(baseUrl);
	}
	
	function recolor(e) {
        var targetElement = e.target || e.srcElement;
        colorID = targetElement.id.substring(5, 6);
		nodes[selectedNode].rgb = colors[colorID];
		document.getElementById("rmenu2").className = "hide";
		mousedown = false;
		draw();
	}
	
//
//	Shared whiteboard 
	
	function whiteboard() {
		var wb = getUrlParameter('wb');
		if (!wb) {
			processRequestString();	// TODO: integrate here
			return;
		}
		if (wb == "new") {
			location.search = location.search
			? '&wb=' + getUniqueId() : 'wb=' + getUniqueId();
			return;
		}
		var pusher = new Pusher('4adbc41a101586f6da84', {	// change to your own values
			cluster: 'eu',
			forceTLS: true,
//			authEndpoint: 'http://condensr.de/whiteboard/php/x28auth.php',  
			authEndpoint: 'http://127.0.0.1/wp/whiteboard/php/x28auth.php',  
			auth: {
				headers: {
					'X-CSRF-Token': "SOME_CSRF_TOKEN"
				}
			}
		});

//		subscribe to the changes via Pusher
		channel = pusher.subscribe(wb);
		channel.bind('pusher:subscription_error', function(status) {
			alert("Subscription failed: " + status);
		});
		channel.bind('pusher:subscription_succeeded', function() {
			alert("Successfully subscribed.");
		});
		
		channel.bind('client-my-event', function(data) {
			// do something meaningful with the data here
			var s = JSON.parse(data.publishNode);
			if (s.type == 'node') {
				nodes.push({x: s.x, y: s.y, rgb: s.rgb, label: s.label, id: s.id});
				details.push({text: s.detail});
				newnode3();
			} else {
				n1 = -1;
				n2 = -1;
				for (var i = 0; i < nodes.length; i++) { 
					if (nodes[i].id == s.n1) n1 = i;
					if (nodes[i].id == s.n2) n2 = i;
				}
				if (n1 < 0 || n2 < 0) alert("Unknown item referenced.\nOut of sync?");
				edges.push({n1: n1, n2: n2, rgb: s.rgb});
				app.saveTopology();
			}
		});
	}

	// function to get a query param's value
	function getUrlParameter(name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(location.search);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	};

	// a unique random key generator
	function getUniqueId () {
		return 'private-' + Math.random().toString(36).substr(2, 9);
	}
	
	function uuidv4() {	// by Stackoverflow user broofa
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

}	
