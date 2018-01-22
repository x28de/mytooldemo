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
		
	document.getElementById("help").addEventListener('click', loadHelp);
	document.getElementById("example").addEventListener('click', loadHelp);

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
		if (app.savedNodes.length > 0) {
			if (!confirm("This will wipe clean your map. \n" +
					"(You may want to export it first,\n" +
					"via right-click on the canvas.)")) {
				return;}
		}
		wipe();
        var targetElement = e.target || e.srcElement;
        if (targetElement.id == "help") {
            nodes = [
    			{x: 40, y: 40, rgb: '#ffbbbb', label: 'Click this and look right', id: '0'},
    			{x: 40, y: 90, rgb: '#d2bbd2', label: 'Move', id: '1'},
    			{x: 40, y: 140, rgb: '#d2bbd2', label: 'Connect', id: '2'},
    			{x: 40, y: 190, rgb: '#d2bbd2', label: 'Pan', id: '3'},
    			{x: 40, y: 240, rgb: '#bbbbff', label: 'Drop input', id: '4'},
    			{x: 40, y: 290, rgb: '#bbbbff', label: 'Drop a file', id: '5'},
    			{x: 40, y: 340, rgb: '#bbbbff', label: 'Add single items', id: '6'},
    			{x: 40, y: 390, rgb: '#bbffbb', label: 'Wipe', id: '7'},
    			{x: 40, y: 440, rgb: '#bbffbb', label: 'Export', id: '8'},
    			{x: 40, y: 490, rgb: '#ffff99', label: 'Re-color', id: '9'},
    			{x: 190, y: 90, rgb: '#d2bbd2', label: 'Drag', id: '10'},
    			{x: 190, y: 140, rgb: '#d2bbd2', label: 'ALT + drag', id: '11'},
    			];
    		app.savedNodes = nodes;
    		edges = [ 
    			]; 
    		app.savedEdges = edges;
    		app.saveTopology();
    		details = [
    			{text: 'Click an item on the left pane to view its details on the right pane.' +
    				'<br /><br />It is a bit like turning cards face up in the ' +
    				'game of Pairs (aka Memory or Concentration) -- ' +
    				'just that it won\'t cost you scores. \'Turn\' as often as you need.'},
    			{text: 'To move an icon, drag it, i.e., press and hold the left mouse-button, ' +
    				'move the mouse-pointer, and release the mouse-button.' +
    				'<br /><br />Do that to move similar items close to each other.'},
    			{text: 'To connect one icon to a second icon, you will ALT + drag it, i.e. ' +
    				'<br />- point at the first icon, ' +
    				'<br />- press and hold the ALT key, ' +
    				'<br />- then drag the mouse until you reach the second icon,' +
    				'<br />- then release both the mouse-button and the ALT key.' +
    				'<br /><br />Exercise: Connect the \'ALT + drag\' icon to some related icon.'},
    			{text: 'To pan the canvas, drag its background.' +
    				'<br /><br />Try it! Does it work?'},
    			{text: 'The easiest way to get your input into the map is ' +
    				'<br />- to select some text in another browser window' +
    				'<br />- and just drag and drop it onto the canvas.' +
    				'<br /><br />If you don\'t believe it, just try it. ' +
    				'Don\'t be confused by the unexpected shapes of the mouse pointer -- ' +
    				'once the mouse is over the canvas, it will change.' +
    				'<br /><br />Exercise: Select the two items below and drag them to the canvas: <br />' +
    				'<br />Item 1\tdemo' +
    				'<br />Item 2\tdemo' +
    				'<br /><br />Now try text from a different window.'},
    			{text: 'You may drop a simple text file onto the canvas. Each line becomes an item.' +
    					'You may separate the \'detail\' part from the \'label\' by a TAB character.'},
    			{text: 'Right-click the canvas and select \'Add a new item here\', ' +
    					'then fill in the \'Label\' and/ or \'Details\' fields.' +
    					'<br />In the (limited) demo version, press \'Done\' after editing.' +
    					'<br /><br />Single icons are useful if you want to create \'towns\' ' +
    					'amidst the \'villages\' on your thought map. ' +
    					'But unlike categories, they don\'t even need a name!'},
    			{text: 'Right-click the canvas and select \'Wipe clean\'.' +
    					'<br /><br />This limited map is like a blackboard in a classroom: ' +
    					'When you re-open your browser tomorrow, you will still ' +
    					'see the drawings that you left here today. (They live in the browser\'s cache database.)' +
    					'<br />For new maps, wipe clean. Perhaps export them first.' +
    					'<br /><br />(The full version supports filing as you would expect it.)'},
    			{text: 'Right-click the canvas and select \'Export\' to get an .xml file ' + 
    					'that can be opened in the full Condensr version (free download here:' +
    					'<a href="http://condensr.de">condensr.de</a>).'},
    			{text: 'Right-click an icon, and select a new color.'},
    			{text: 'Drag an icon to move it. Drag the canvas background to pan.'},
    			{text: 'ALT + drag an icon to connect it.'},
    			];
    		app.savedDetails = details;
    		app.saveTexts();
    		draw();
        } else {
        	nodes = [	// placeholder for amore professional story
        		{x: 40, y: 40, rgb: '#ccdddd', label: 'Lady\'s Uncle', id: '0'},
        		{x: 40, y: 90, rgb: '#bbbbff', label: 'Butler', id: '1'},
        		{x: 40, y: 140, rgb: '#bbbbff', label: 'Gardener', id: '2'},
        		{x: 40, y: 190, rgb: '#ffbbbb', label: 'Cook', id: '3'},
        		{x: 40, y: 240, rgb: '#ffbbbb', label: 'Nephew', id: '4'},
        		{x: 40, y: 290, rgb: '#bbbbff', label: 'Coachman', id: '5'},
        		{x: 40, y: 340, rgb: '#bbbbff', label: 'Pianist', id: '6'},
        		{x: 40, y: 390, rgb: '#bbbbff', label: 'Pastor', id: '7'},
        		{x: 40, y: 440, rgb: '#bbbbff', label: 'Chambermaid', id: '8'},
        		{x: 40, y: 490, rgb: '#bbbbff', label: 'Stable-lad', id: '9'},
        		{x: 190, y: 40, rgb: '#ffbbbb', label: 'Flower girl', id: '10'},
        		{x: 190, y: 90, rgb: '#bbbbff', label: 'Tutor', id: '11'},
        		{x: 190, y: 140, rgb: '#bbbbff', label: 'Neighbour boy', id: '12'},
        		{x: 190, y: 190, rgb: '#ffbbbb', label: 'Governess', id: '13'},
        		{x: 190, y: 240, rgb: '#ffbbbb', label: 'Aunt from America', id: '14'},
        		{x: 190, y: 290, rgb: '#bbbbff', label: 'Riding instructor', id: '15'},
        		{x: 190, y: 340, rgb: '#bbbbff', label: 'Brother in law', id: '16'},
        		{x: 190, y: 390, rgb: '#bbbbff', label: 'Lord', id: '17'},
        		{x: 190, y: 440, rgb: '#ffbbbb', label: 'Lady', id: '18'},
        		{x: 190, y: 490, rgb: '#ffbbbb', label: 'Lady\'s Sister', id: '19'}
        		];
        	app.savedNodes = nodes;
        	edges = [ 
        		]; 
        	app.savedEdges = edges;
        	app.saveTopology();
        	details = [
        		{text: 'lies dead in the fishpond. Who does not have an alibi?'},
        		{text: 'was in the fireside lounge'},
        		{text: 'was in the horse stable'},
        		{text: 'was in the fireside lounge'},
        		{text: 'was in the tower chamber'},
        		{text: 'was in the smoking room'},
        		{text: 'was in the music room'},
        		{text: 'was in the wine cellar'},
        		{text: 'was in the tower chamber'},
        		{text: 'was in the garden shed'},
        		{text: 'was in der Library'},
        		{text: 'was in the Blue Parlour'},
        		{text: 'was in the garden shed'},
        		{text: 'was in the wine cellar'},
        		{text: 'was in the horse stable'},
        		{text: 'was in the smoking room'},
        		{text: 'was in the Onyx bathroom'},
        		{text: 'was in the music room'},
        		{text: 'was in der Library'},
        		{text: 'was in the Blue Parlour'}
        		];
        	app.savedDetails = details;
        	app.saveTexts();
        	draw();
        }
	}
	
	function recolor(e) {
        var targetElement = e.target || e.srcElement;
        colorID = targetElement.id.substring(5, 6);
		nodes[selectedNode].rgb = colors[colorID];
		document.getElementById("rmenu2").className = "hide";
	}
}	
