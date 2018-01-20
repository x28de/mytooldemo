/**
 * 
 */
function main() { 

	var nodes;
	var edges;
	var details;
		
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
				
	var fillForm = document.getElementById("fillDetails");
	fillForm.addEventListener('submit',newnode2);
	
	var colors = ["#d2bbd2", "#bbbbff", "#bbffbb", "#ffff99", 
		"#ffe8aa", "#ffbbbb", "#eeeeee", "#ccdddd"];
		
	document.getElementById("example").addEventListener('click', loadExample);

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
		x = ev.pageX - translatedX - 6; 
		y = ev.pageY - translatedY - 8; 
		if (dt.items[0].kind == "file") {
			var file = dt.items[0].getAsFile();
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
		myFunction(nodes[i].id); 
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
	}
    		
	function newnode2() {
		id = nodes.length;
		var newLabel = document.forms[0].elements[0].value;
		nodes.push({x: x, y: y, rgb: '#ffbbbb', label: newLabel, id: id});
		app.saveTopology();

		var newDetail = document.forms[0].elements[1].value;
		details.push({text: newDetail});
		app.savedDetails = details;
		app.saveTexts();
		app.savedDetails = localStorage.savedDetails;
		app.savedDetails = JSON.parse(app.savedDetails);
		details = app.savedDetails;
			
		document.getElementById("rmenu").className = "hide";
		// TODO: highlight(id, ctx, nodes);	
	}
				
	function wipe(){
		localStorage.removeItem("savedNodes");
		localStorage.removeItem("savedEdges");
		localStorage.removeItem("savedDetails");
		location.reload();
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
			content += "<topic id=\"" + id + "\" x=\"" + node.x + "\" y=\"" + node.y + "\" color=\"" + node.rgb + "\">" + 
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
		expAnchor.setAttribute('download', 'e28export.xml');		}

//
//	Process the dropped stuff

	function newStuff(data) {
		var lines = data.split('\n');
		id = nodes.length;
		j = 0;
		xnew = x;
		for (var i = 0; i < lines.length; i++) {
			label = lines[i].trim();
			var fields = label.split('\t');
			if (fields.length < 2) {
				detail = label;
			} else {
				label = fields[0];
				detail = fields[1];
			}
			if (!label && !detail) continue; 
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
	
	function loadExample() {
		wipe();
		nodes = [
			{x: 40, y: 40, rgb: '#ccdddd', label: 'Lady\'s Onkel', id: '0'},
			{x: 40, y: 90, rgb: '#ccdddd', label: 'Butler', id: '1'},
			{x: 40, y: 140, rgb: '#ccdddd', label: 'Gärtner', id: '2'},
			{x: 40, y: 190, rgb: '#ccdddd', label: 'Köchin', id: '3'},
			{x: 40, y: 240, rgb: '#ccdddd', label: 'Zimmermädchen', id: '4'},
			{x: 40, y: 290, rgb: '#ccdddd', label: 'Chauffeur', id: '5'},
			{x: 40, y: 340, rgb: '#ccdddd', label: 'Klavierspieler', id: '6'},
			{x: 40, y: 390, rgb: '#ccdddd', label: 'Pastor', id: '7'},
			{x: 40, y: 440, rgb: '#ccdddd', label: 'Neffe', id: '8'},
			{x: 40, y: 490, rgb: '#ccdddd', label: 'Stallbursche', id: '9'},
			{x: 190, y: 40, rgb: '#ccdddd', label: 'Gouvernante', id: '10'},
			{x: 190, y: 90, rgb: '#ccdddd', label: 'Hauslehrer', id: '11'},
			{x: 190, y: 140, rgb: '#ccdddd', label: 'Nachbarsjunge', id: '12'},
			{x: 190, y: 190, rgb: '#ccdddd', label: 'Blumenfrau', id: '13'},
			{x: 190, y: 240, rgb: '#ccdddd', label: 'Tante aus Amerika', id: '14'},
			{x: 190, y: 290, rgb: '#ccdddd', label: 'Reitlehrer', id: '15'},
			{x: 190, y: 340, rgb: '#ccdddd', label: 'Schwager', id: '16'},
			{x: 190, y: 390, rgb: '#ccdddd', label: 'Lord', id: '17'},
			{x: 190, y: 440, rgb: '#ccdddd', label: 'Lady', id: '18'},
			{x: 190, y: 490, rgb: '#ccdddd', label: 'Lady\'s Schwester', id: '19'}
			];
		app.savedNodes = nodes;
		edges = [ 
			]; 
		app.savedEdges = edges;
		app.saveTopology();
		details = [
			{text: 'liegt tot im Fischteich. Wer hat kein Alibi?'},
			{text: 'war im Kaminzimmer'},
			{text: 'war im Pferdestall'},
			{text: 'war im Kaminzimmer'},
			{text: 'war im Turmzimmer'},
			{text: 'war im Raucherzimmer'},
			{text: 'war im Musikzimmer'},
			{text: 'war im Weinkeller'},
			{text: 'war im Turmzimmer'},
			{text: 'war im Gartenhäuschen'},
			{text: 'war in der Bibliothek'},
			{text: 'war im Blauen Salon'},
			{text: 'war im Gartenhäuschen'},
			{text: 'war im Weinkeller'},
			{text: 'war im Pferdestall'},
			{text: 'war im Raucherzimmer'},
			{text: 'war im Onyx-Bad'},
			{text: 'war im Musikzimmer'},
			{text: 'war in der Bibliothek'},
			{text: 'war im Blauen Salon'}
			];
		app.savedDetails = details;
		app.saveTexts();
		draw();
	}
	
	function recolor(e) {
        var targetElement = e.target || e.srcElement;
        colorID = targetElement.id.substring(5, 6);
		nodes[selectedNode].rgb = colors[colorID];
		document.getElementById("rmenu2").className = "hide";
	}
}	
