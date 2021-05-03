function main() { 

	var nodes;
	var edges;
	var canvas;
	var context;
	 
	var mousedown = false;
	var modified = false;
	var moving = false;
				
	var selectedNode = -1;
				
	var lastX = 0; 
	var lastY = 0; 
	var translatedX = 0; 
	var translatedY = 0;
	var hintText;
	
	init();
		
	function init() {
		document.head.innerHTML = 
			'<meta charset="UTF-8"><title>Condensr Demo (limited)</title>' +
			'<link rel="stylesheet" type="text/css" href="x28demo.css">';

		var root = textPane.parentNode;		// textPane is defined in calling HTML

		canvas = document.createElement("canvas");
		root.insertBefore(canvas, textPane);
		canvas.id = "myCanvas";
		canvas.width = 760;
		canvas.height = 580;
		
		context = canvas.getContext('2d');
		context.font = "12px Arial"; 

		// Load from localStorage (like an uncleaned blackboard of yesterday)
		if (localStorage.nodes) {
			nodes = JSON.parse(localStorage.nodes);
			canvas.title = "Rightclick to wipe clean";
		} else {
			nodes = [];
			canvas.title = "Rightclick to load TSV file";
		}
		if (localStorage.edges) {
			edges = JSON.parse(localStorage.edges);
		} else {
			edges = [];
		}
		
		draw();
		save();

		canvas.addEventListener('mousedown', down); 
		canvas.addEventListener('mousemove', move); 
		canvas.addEventListener('mouseup', up); 

		// help text
		
		hintText = document.createElement("div");
		hintText.innerHTML = '<em>Drag the canvas to pan it;  <br />' + 
		'<em>drag an icon to move it;  <br />click an icon for its details.<br />' + 
		'ALT + drag an icon to connect it.<br />&nbsp;<br />&nbsp;<br />' + 
		'<a href="http://x28hd.de/demo/?help-en.xml">Get help?</a></em> </div>';
		textPane.appendChild(hintText);
		
		// init temporary testing controls
		
		var rmenu = document.createElement("p");
		rmenu.innerHTML = '<div class="hide" id="rmenu">' + 
		'<a id = "load" class=\'opt\'>Load TSV file</a><br />' + 
		'<a id = "wipe" class=\'opt\'>Wipe clean</a><br /></div>';
		root.appendChild(rmenu);

		canvas.addEventListener('contextmenu', rightmenu, false);
		document.getElementById("load").addEventListener('click', uploadTsv);
		document.getElementById("wipe").addEventListener('click', wipe);
					
	}
							    		
	function down(evt) {
		lastX = evt.offsetX; 
		lastY = evt.offsetY; 
		if (evt.altKey || evt.which == 2) {
			modified = true;
		} else modified = false;
		selectedNode = findClicked(evt);
		if (selectedNode == -1) {
			document.getElementById("textPane").innerHTML = hintText.innerHTML;
			document.getElementById("rmenu").className = "hide";
		}
		mousedown = true;
		draw(evt);
		canvas.title = "";
    }
    		
	function move(evt){ 
		if (!mousedown) return;
		var deltaX = evt.offsetX - lastX; 
		var deltaY = evt.offsetY - lastY; 
		if (mousedown && !modified) {
			if (selectedNode > -1) {		// Move node 
				nodes[selectedNode].x += deltaX;
				nodes[selectedNode].y += deltaY;
			} else {						// Move canvas
				translatedX += deltaX; 
				translatedY += deltaY; 
				context.translate(deltaX, deltaY); 
			}
		}
		moving = true;
		lastX = evt.offsetX; 
		lastY = evt.offsetY; 
		draw(evt); 
	} 

	function up(evt){ 
		if (moving && modified) {	// growing a new edge?
			var targetNode = findClicked(evt);
			if ((targetNode > -1) && (targetNode != selectedNode)) {
				edges.push({n1: selectedNode + 0, n2: targetNode + 0, color: '#c0c0c0'});
			} 
		}
		moving = false;
		mousedown = false;
		modified = false;
    		
		draw(evt);
		save();
	}  
    		
//
//	Core functions
				    		
	function draw(evt) { 
		context.clearRect(-translatedX, -translatedY, 860, 580); 
		if (edges.length > 0) {
			for (var i = 0; i < edges.length; i++) { 
				context.strokeStyle = edges[i].color; 
				context.lineWidth = 2;
				context.beginPath(); 
				context.moveTo(nodes[edges[i].n1].x, nodes[edges[i].n1].y); 
				context.lineTo(nodes[edges[i].n2].x, nodes[edges[i].n2].y); 
				context.stroke(); 
			} 
		}
		for (var i = 0; i < nodes.length; i++) { 
			context.beginPath(); 
			context.fillStyle = nodes[i].color; 
			context.rect(nodes[i].x - 10, nodes[i].y - 8, 20, 16); 
//			context.arc(nodes[i].x, nodes[i].y, 9, 0, 2 * Math.PI); 
			context.fill(); 
			context.fillStyle = "#000000"; 
			context.fillText(nodes[i].label, nodes[i].x - 9, nodes[i].y + 23); 
			if ((i == selectedNode)) expose(i, context, nodes);
		} 
		if ((selectedNode > -1) && moving && modified) {	// Draw ray
			context.strokeStyle = "#000000"; 
			context.lineWidth = 2;
			context.beginPath(); 
			context.moveTo(nodes[selectedNode].x, nodes[selectedNode].y); 
			absoluteX = evt.offsetX - translatedX; 
			absoluteY = evt.offsetY - translatedY; 
			context.lineTo(absoluteX, absoluteY); 
			context.stroke(); 
		}
	} 

	function findClicked(evt) {
		node = -1;
		x = evt.offsetX - translatedX; 
		y = evt.offsetY - translatedY; 
		for (var i = 0; i < nodes.length; i++) { 
			if (Math.abs(x - nodes[i].x) < 11 && Math.abs(y - nodes[i].y) < 11) { 
				node = i;
			}
		}
		return node;
	}
	
	function expose(i) {
		context.strokeStyle = "#ff0000";
		context.strokeRect(nodes[i].x - 11, nodes[i].y - 11, 22, 22); 
		var detailText = nodes[i].detail;
		document.getElementById("textPane").innerHTML = detailText;
	}

	
//
//	Process the input stuff "tsv"

	function newStuff(tsv) {
		var xnew;
		var ynew;
		
		var lines = tsv.split('\n');
		row = 0;
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
			ynew = y + row * 50;
			if (row > 9) {
				row = 0;
				ynew = y;
				xnew += 150;
			}
			row++;
			nodes.push({x: xnew, y: ynew, color: '#ccdddd', label: label, detail: detail});
		}
		draw();
		save();
		canvas.title = "Rightclick to wipe clean";
	}
	
	function save() {
		var savedNodes = JSON.stringify(nodes);
		localStorage.nodes = savedNodes;
		var savedEdges = JSON.stringify(edges);
		localStorage.edges = savedEdges;
	}
	
//
//	Temporary testing controls
	
	function uploadTsv() {		// if TSV is not passed otherwise
		var input = document.createElement('input');
		input.type = 'file';
		input.onchange = e => { 
			var file = e.target.files[0]; 
			var reader = new FileReader();
			reader.readAsText(file);
			reader.onload = function(readerEvent) {
				var tsv = readerEvent.target.result;
				
				newStuff(tsv);
				draw();
				save();
			}
		}
		input.click();
		document.getElementById("rmenu").className = "hide";
	}
	
    function rightmenu(evt) {
		evt.preventDefault();
		if (selectedNode == -1) {
			document.getElementById("rmenu").className = "show";  
			document.getElementById("rmenu").style.top =  evt.y + 'px';
			document.getElementById("rmenu").style.left = evt.x + 'px';
		}
	}
	
	function wipe(){
		localStorage.removeItem("nodes");
		localStorage.removeItem("edges");
		nodes = [];
		edges = [];
		document.getElementById("rmenu").className = "hide";
		draw();
		canvas.title = "Rightclick to load TSV file";
	};
	
}
