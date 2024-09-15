class Disentangle {
    nodes = new Map();
    edges = new Map();
    cb = new Map;
    delta = new Map;
    prev = new Map;
    cbRev = new Map();
    array = [];
    nodesPos = new Map();

    constructor(controler, level) {
        this.controler = controler;
        this.level = level;
        if (level == 3) this.askForLevel(); 
        this.randomMap(level);
        this.brandes();
        this.recolor();
        new InsertMap(this.nodes, this.edges, controler); 
    }

    askForLevel() {
        var th = this;
        var disentangle = document.getElementById("disentangle");
        disentangle.id = "disentangle";
        disentangle.className = "disentangle";
        while (disentangle.firstElementChild) disentangle.firstChild.remove();

        var goal = document.createElement("div");
        goal.id = "goal";
        goal.className = "opt";
        goal.innerHTML = "Try to minimize overlaps. Help?<hr>";
        document.getElementById("disentangle").appendChild(goal);
        document.getElementById("goal").addEventListener('click', function() {
            alert("Drag an icon to move it, drag the canvas to pan it.\n\n" +
                "Advanced: Use mousewheel + drag to span a rectangle selection;\n" +
                "click the rectangle inside and drag it to move all icons in it,\n" +
                "rightclick inside to flip it, doubleclick to dismiss it.\n" +
                "Without mousewheel, use doubleclick before dragging.")}); 

        var skip = document.createElement("a");
        skip.id = "skip";
        skip.className = "opt";
        skip.innerHTML = "Skip to level " + (this.level + 1).valueOf();
        document.getElementById("disentangle").appendChild(skip);
        document.getElementById("skip").addEventListener('click', function() { 
            th.level++; 
            skip.innerHTML = "Skip to level " + (th.level + 1).valueOf();
        });

        var play = document.createElement("a");
        play.id = "play";
        play.className = "opt";
        play.innerHTML = "Play";
        document.getElementById("disentangle").appendChild(play);
        document.getElementById("play").addEventListener('click', function() { 
            document.getElementById("disentangle").className = "hide";
            if (th.level > 3) th.controler.startDisentangle(th.level);
        });

        document.getElementById("disentangle").className = "show";
        document.getElementById("disentangle").style.top = 50 + "px";
        document.getElementById("disentangle").style.left = 50 + "px";
    }

    randomMap() {
          
        var levels = [0, 5, 15, 32, 55, 88, 129, 181, 243, 316];
        var total = levels[this.level];
        var edgesNum = 0;

		for (var i = 0; i < total; i++) {
            i = i.toFixed();
			var x = Math.random() * 800;
            x = x.toFixed();
			var y = Math.random() * 600;
            y = y.toFixed();
			var node = new GraphNode(i, [x, y], "#ccdddd", i + "", "");
			this.nodes.set(i, node);
		}

		for (var i = 0; i < total; i++) {
            i = i.toFixed();
			var node = this.nodes.get(i);
			var found = false;
			while (!found) {
                var otherID = Math.random() * (total - 1);
                otherID = otherID.toFixed();
				if (otherID == i) continue;
				var otherNode = this.nodes.get(otherID);
                edgesNum = edgesNum.toFixed();
				var edge = new GraphEdge(edgesNum, node, otherNode, "#c0c0c0", "x");
				this.edges.set(edgesNum, edge);
                node.addEdge(edge);
                otherNode.addEdge(edge);
				edgesNum++;
				node.setDetail("Hyperhop to <a href=\"#" + otherID + "\">" + otherID + "</a>");	// hyperhopping just for demo
				if (Math.random() > .05) found = true;
			}
		}
    }

    brandes() {
        // U. Brandes' algorithm for Betweenness Centrality, pseudo code from Wikipedia Aug 2024

        this.nodes.forEach(u => {        // Initialize
            this.cb.set(u, 0);
        });

        // Loop over s
        this.nodes.forEach(s => {
            this.sigma = new Map;    // Number of shortest paths
            this.dist = new Map;     // distance, depth

            // Loop over v
            this.nodes.forEach(v => {
                this.delta.set(v, 0);    // "Single dependency"
                this.prev.set(v, []);    // Immediate predecessors of v during BFS
                this.sigma.set(v, 0);
            });
            this.sigma.set(s, 1);
            this.dist.set(s, 0);
            this.q = new Queue();       // Breadth-first search
            this.q.enqueue(s);
            this.visited = [];  // order in which vertices are visited ("S" in the pseudo code)

            // Stage 1 Single-source shortest path

            while (!this.q.isEmpty) {
                var u = this.q.dequeue();
                this.visited.push(u);
                u.getEdges().forEach(edge => {
                    var v = u.relatedNode(edge);
					var distU = this.dist.get(u);
					if (this.dist.get(v) == null) {
						this.dist.set(v, distU + 1);
						this.q.enqueue(v);
					}
					var distV = this.dist.get(v);
					if (distV == distU + 1) {
						var sigmaV = this.sigma.get(v);
						var sigmaU = this.sigma.get(u);
						this.sigma.set(v, sigmaU + sigmaV);
                        this.prev.get(v).push(u);
					}
                })
            }

            // Stage 2 Backpropagation of dependencies

            while (this.visited.length > 0) {
                var v = this.visited.pop();
                var vPrev = this.prev.get(v);
                vPrev.forEach(u => {
                    var deltaU = this.delta.get(u);
                    var deltaV = this.delta.get(v);
                    var sigmaU = this.sigma.get(u);
                    var sigmaV = this.sigma.get(v);
                    var adding = sigmaU / sigmaV * (1 + deltaV);
                    deltaU += adding;
                    this.delta.set(u, deltaU);
                    if (u != s) {
                        var newCB = this.cb.get(v) + this.delta.get(v);
                        this.cb.set(v, newCB);
                    }
                })
            }
        });
    }

    recolor() {
        var th = this;
        var disambig = 0.001;
        this.nodes.forEach(node => {
            var centrality = this.cb.get(node);
            var detail = "Betweenness Centrality = " + centrality.toFixed(1) + "<p>" + node.getDetail();
            node.setDetail(detail);     // just to demonstrate the detail pane
            while (th.cbRev.has(centrality)) centrality += disambig;
            th.cbRev.set(centrality, node);
        })

        var iterator = Array.from(this.cbRev.keys());
        iterator.sort(function(a, b){return a - b});
        iterator.reverse(function(a, b){return a - b});

        for (var i = 0; i < iterator.length; i++) {
            var node = this.cbRev.get(iterator[i]);
            this.array[i] = node;
        }

        var nonLeaves = this.nodes.size;
        this.nodes.forEach(node => {
            if (node.getEdges().length < 2) nonLeaves--;
        })
        for (var i = 0; i < this.cb.size; i++) {
            this.nodesPos.set(this.array[i], i + 1);
        }
        var numPerColor = Math.floor(nonLeaves/6);

        for (var pos = 1; pos <= nonLeaves; pos++) {
            var node = this.array[pos - 1];
            var colorString = "#d8d8d8";
			if (pos < numPerColor * 6) colorString = "#b200b2";
			if (pos < numPerColor * 5) colorString = "#0000ff";
			if (pos < numPerColor * 4) colorString = "#00ff00";
			if (pos < numPerColor * 3) colorString = "#ffff00";
			if (pos < numPerColor * 2) colorString = "#ffaa00";
			if (pos < numPerColor) colorString = "#ff0000";
			node.setColor(colorString);
        }

        // Color the Edges
		
        var model = null;
        this.edges.forEach(edge => {
            var node1 = edge.getNode1();
            var node2 = edge.getNode2();
			var pos1 = this.nodesPos.get(node1);
			var pos2 = this.nodesPos.get(node2);
            model = node1;
            if (pos2 >= pos1) model = node2;
			var color = model.getColor();
            edge.setColor(color);
        })
    }
}

class Queue {
    constructor() {
        this.elements = {};
        this.head = 0;
        this.tail = 0;
    }

    enqueue(element) {
        this.elements[this.tail] = element;
        this.tail++;
    }

    dequeue() {
        if (this.head !== this.tail) {
            const item = this.elements[this.head];
            delete this.elements[this.head];
            this.head++;
            return item;
        }
        return undefined;
    }

    peek() {
        return this.elements[this.head];
    }

    get length() {
        return this.tail - this.head;
    }

    get isEmpty() {
        return this.length === 0;
    }
}
