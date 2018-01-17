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
{x: 40, y: 40, rgb: '#ccdddd', label: 'Hello World!', id: '0', wpid: '1'},
{x: 40, y: 90, rgb: '#ccdddd', label: 'Week 1 of new cMOOC', id: '1', wpid: '3093'},
{x: 40, y: 140, rgb: '#ccdddd', label: 'Lighthearted Exercise', id: '2', wpid: '3091'},
{x: 40, y: 190, rgb: '#ccdddd', label: 'Magic of Zettelkasten', id: '3', wpid: '3086'},
{x: 40, y: 240, rgb: '#ccdddd', label: 'New page: Recognizing', id: '4', wpid: '3077'},
{x: 40, y: 290, rgb: '#ccdddd', label: 'Sequential requirements', id: '5', wpid: '3041'},
{x: 40, y: 340, rgb: '#ccdddd', label: 'Tangible Associations', id: '6', wpid: '3032'},
{x: 40, y: 390, rgb: '#ccdddd', label: 'Im-/Export from/to other think tools', id: '7', wpid: '3029'},
{x: 40, y: 440, rgb: '#ccdddd', label: 'Unflattening', id: '8', wpid: '3023'},
{x: 40, y: 490, rgb: '#ccdddd', label: 'Wish list', id: '9', wpid: '3018'}
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
{text: 'Welcome to WordPress. This is your first post. Edit or delete it, then start writing!'},
{text: 'Why do learners need interactivity? Because watching their peers recognizing helps their own recognizing more than consuming canned resources.'},
{text: '20 interesting goals from a new game can also be used for something entirely different: You can try to find connections between them. E.g., some are similar to others, or impact others in positive or negative ways, seem to include others, or be otherwise related. And thinking about their complex relationships can be too difficult if you only look at a linear list and most of the connections are only in your head. This might be a good opportunity to demonstrate the benefit of a think tool.'},
{text: 'My tool is now able to import from/ export to tools that are inspired by Luhmann\'s famous Zettelkasten. The magic of this was that he allowed for arbitrary branching at every point in his hierarchical numbering scheme,'},
{text: 'The new page is a remix of all my blog posts about McGilchrist\'s (@divided_brain) and @Downes\' ideas on recognizing: https://x28newblog.wordpress.com/recognizing-2/'},
{text: 'Does a neural network need domain knowledge? I think artificial ones do, but human ones do not because they use recognition from the beginning.'},
{text: 'I understand now better how the \"magic\" of my tool works: it makes associations tangible. It turns elusive mental relationships into \"hands on\" experience, and it compensates for the abstractness of some thought links, with a drawn line \"at our fingertips\".'},
{text: 'Comparing two other think tools with my own tool one can say that they are rather suited as the big long-term storage \"cupboard\" while my own tool is more like the \"table\" where things are put for a temporary large overview.'},
{text: 'The gem of Sousanis\' book \"Unflattening\" was that it does a great job explaining why the right hemisphere mode (\"all-at-once\") lives from relations: Basically, it argues that the eye is \"dancing and darting\", i.e. by its saccadic motion (palpation by means of the gaze) it captures only small fragments at a time, and it is our imagination that needs to combine them into vision.'},
{text: 'There was the question of what @downes and @gsiemens can do working together, and I don\'t want to miss this opportunity for an early Christmas wish list :-)  I there is much to be done in the field of machine-supported human recognition.'}
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
		var data = ev.dataTransfer.getData("text");
		x = ev.pageX - translatedX - 6; 
		y = ev.pageY - translatedY - 8; 
		newStuff(data);
		alert("wert: " + data);		
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
	document.getElementById("wipe").addEventListener('click', wipe);
				
    function rightmenu(e) {
		e.preventDefault();
		document.getElementById("rmenu").className = "show";  
		document.getElementById("rmenu").style.top =  e.y + 'px';
		document.getElementById("rmenu").style.left = e.x + 'px';
	}
    		
	function newnode() {
		document.getElementById("demo").className = "hide";
		document.getElementById("fillDetails").className = "fill";
	}
    		
	function newnode2() {
		id = nodes.length;
		var newLabel = document.forms[0].elements[0].value;
		nodes.push({x: x, y: y, rgb: '#ffbbbb', label: newLabel, id: id, wpid: 'fake' + id});
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

//
//	Process the dropped stuff

	function newStuff(data) {
		var lines = data.split('\n');
		id = nodes.length;
		for (var i = 0; i < lines.length; i++) {
			yps = y + i * 50;
			var fields = lines[i].split('\t');
			nodes.push({x: x, y: yps, rgb: '#bbffbb', label: fields[0], id: id, 
				wpid: 'fake' + id});
			details.push({text: fields[1]});
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
}	
