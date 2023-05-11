// Release: 1.0
class PresentationCore {
    nodes = new Map();
    edges = new Map();

    dummyNode = new GraphNode(-1, null, null, null, null);
    selectedTopic = this.dummyNode;		// TODO integrate into Selection()
    dummyEdge = new GraphEdge(-1, this.dummyNode, this.dummyNode, null, null);
    selectedAssoc = this.dummyEdge;

    constructor(graphClass) {
        this.graphClass = new graphClass(this);     // no constructor in Java version
    }

    initialize(readOnly) {
        // initialize

        this.readOnly = readOnly || false;
        this.createExample();
        this.setModel(this.nodes, this.edges);
        this.selection = this.graphClass.getSelectionInstance();	//	TODO eliminate again

        this.createMainGUI();
        this.createMainWindow("Simple Window");
        this.editorClass = new TextEditorCore(this, this.detailFieldHeight, this.readOnly, false);

        this.graphClass.draw();
    }

    createMainGUI() {
        var nav = navigator.userAgent;
        var weirdBrowser = nav.indexOf("Firefox") < 1 && nav.indexOf("Chrome") < 1 && nav.indexOf("Edg") < 1;

        // Simulating JSplitPane
        if (typeof (Split) != "undefined" && !weirdBrowser) 
            Split(['.a', '.b'], {
                gutterSize: 5,
                sizes: [75, 25]
            });

        var labelBox = document.createElement("div");
        labelBox.style.textAlign = "center";
        labelBox.innerHTML = "Label";
        labelBox.title = "Short text that also appears on the map. To see it there, click the map.";
        labelBox.style.backgroundColor = "#f0f0f0";
        labelBox.style.width = "100%";
        labelBox.style.top = "3px";
        labelBox.style.left = "0px";
        labelBox.style.padding = "2px";
        document.getElementById("rightPanel").appendChild(labelBox);

        var labelField = document.createElement("input");
        labelField.type = "text";
        labelField.id = "labelField";
        labelField.style.width = "100%";
        labelField.style.height = "22px";
        labelField.style.fontSize = "12px";
        labelField.style.top = "3px";
        labelField.style.left = "0px";
        labelField.style.backgroundColor = "white";
        labelField.style.border = "1px solid black";
        labelField.spellcheck = "false";
        labelField.autocorrect = "off";
        document.getElementById("rightPanel").appendChild(labelField);

        var th = this;
        labelField.addEventListener("keyup", function (e) { th.labelEnter(e) });

        var detailBox = document.createElement("div");
        detailBox.style.textAlign = "center";
        detailBox.innerHTML = "Detail";
        detailBox.title = "More text about the selected item, always at your fingertips.";
        detailBox.style.backgroundColor = "#f0f0f0";
        detailBox.style.width = "100%";
        detailBox.style.top = "3px";
        detailBox.style.left = "0px";
        detailBox.style.padding = "2px";
        detailBox.style.borderBottom = "1px solid black";
        document.getElementById("rightPanel").appendChild(detailBox);

        // add  an instance of an HTML text editor like tinyMCE
        var detailField = this.readOnly ? document.createElement("div") : document.createElement("textarea");
        detailField.id = "detailField";
        detailField.style.width = "100%";

        this.detailFieldHeight = document.getElementById("rightPanel").offsetHeight - 18 - 18 - 10 - 15;
        detailField.style.height = this.detailFieldHeight + "px";

        detailField.style.top = "3px";
        detailField.style.left = "0px";
        detailField.style.backgroundColor = "white";
        detailField.autocorrect = "off";
        document.getElementById("rightPanel").appendChild(detailField);
    }

    createMainWindow(title) {
        document.title = title;
    }

    createExample() {
        if (this.constructor.name != PresentationCore.name) return;
        var n1 = new GraphNode(1, [40, 40], "#ff0000", "Item 1", "Example text 1");
        var n2 = new GraphNode(2, [140, 40], "#00ff00", "Item 2", "Example text 2");
        this.nodes.set(1, n1);
        this.nodes.set(2, n2);
        var edge = new GraphEdge(1, n1, n2, "#ffff00", "");
        this.edges.set(1, edge);
        n1.addEdge(edge);
        n2.addEdge(edge);
    }

    // Selection processing

    deselectNode(node) {
        if (node != this.dummyNode) {
            node.setLabel(document.getElementById("labelField").value);
            document.getElementById("labelField").value = "";
            node.setDetail(this.editorClass.getText());     // store text 
            this.editorClass.setText("");
        }
        document.getElementById("rmenu").className = "hide";
        document.getElementById("rmenu2").className = "hide";
    }

    deselectEdge(edge) {
        if (edge != this.dummyEdge) {
            var det = this.editorClass.getText();
            if (det.length > 59) console.log(det.length);
            edge.setDetail(det);
            this.editorClass.setText("");
        }
        document.getElementById("rmenu").className = "hide";
        document.getElementById("rmenu2").className = "hide";
    }

    nodeSelected(node) {
        this.deselectNode(this.selectedTopic);
        this.deselectEdge(this.selectedAssoc);
        this.selectedAssoc = this.dummyEdge;
        this.selectedTopic = node;
        var labelText = this.selectedTopic.getLabel();
        document.getElementById("labelField").value = labelText;
        this.editorClass.setText(node.getDetail());     // load text
    }

    edgeSelected(edge) {
        this.deselectNode(this.selectedTopic);
        this.deselectEdge(this.selectedAssoc);
        this.selectedAssoc = edge;
        this.selectedTopic = this.dummyNode;
        this.editorClass.setText(edge.getDetail());
    }

    graphSelected() {
        this.deselectNode(this.selectedTopic);
        this.selectedTopic = this.dummyNode;
        this.deselectEdge(this.selectedAssoc);
        this.selectedAssoc = this.dummyEdge;
        this.editorClass.setText("");
    }

    createEdge(topic1, topic2) {
        if (topic1 != null && topic2 != null) {
            var newId = this.newKey(this.edges);
            var assoc = new GraphEdge(newId, topic1, topic2, "#c0c0c0", "");
            assoc.setID(newId);
            this.edges.set(newId, assoc);
            topic1.addEdge(assoc);
            topic2.addEdge(assoc);
            return assoc;
        } else {
            return null;
        }
    }

    setModel(nodes, edges) {
        this.graphClass.setModel(nodes, edges);
    }

    labelEnter(event) {     // in Jave version not in yet Core
        if (event.key === 'Enter') {
            event.preventDefault();
            var label = document.getElementById("labelField").value;
            this.selectedTopic.setLabel(label);
            this.graphClass.draw();
        }
    }

    addToLabel(textToAdd) {
        if (this.selectedTopic == this.dummyNode) return;
        labelField.value += " " + textToAdd;
        var justUpdated = this.selectedTopic;
        this.graphSelected();
        this.nodeSelected(justUpdated);
        this.graphClass.draw();
    }

    newKey(map) {
        var set = new Set(map.keys());
        var idTest = set.size;
        while (set.has(idTest)) idTest++;
        this.key++;
        return idTest;
    }
}

class TextEditorCore {
    constructor(controler, detailFieldHeight, readOnly, restarted) {
        this.controler = controler;
        var th = this;

        if (readOnly) {
            var textArea = document.getElementById("detailField");
            textArea.style.fontSize = "16px";
            textArea.style.fontFamily = "Serif";
            textArea.style.overflow = "auto";
            textArea.style.height = detailFieldHeight + "px";
            textArea.style.width = "100%";
            textArea.style.padding = "10px";
            this.fallback = true;
            document.getElementById("detailField").addEventListener(
                'click', function(e) { if (!e.target.href) return;
                    location.assign(e.target.href); 
                    th.controler.findHash(location.hash.substring(1)); });

            var editButton = document.createElement("button");
            editButton.innerHTML = "<a href=\"#\"><em>Edit</em></a>";
            editButton.style.position = "absolute";
            editButton.style.padding = "8px";
            editButton.style.bottom = "1px";
            editButton.addEventListener('click', function(e) {
                editButton.remove();
                th.controler.enableEdit();
            });
            textArea.parentNode.appendChild(editButton);
            return;
        }

        // Tap into the tinyMCE editor

        if (typeof (tinyMCE) == "undefined") {
            alert("Network down? 'tinyMCE' not found");
            this.fallback = true;
            return;
        }
        tinyMCE.init({
            selector: '#detailField',
            height: detailFieldHeight,
            content_style: 'body { margin: 0px 5px 0px 5px; font-size: 16px; font-family: Serif; line-height: 1.2;}',
            menubar: false,
            toolbar: 'bold italic underline | more | myCustomToolbarButton ',
            toolbar_groups: {
                more: {
                  icon: 'more-drawer',
                  tooltip: 'more',
                  items: 'undo redo cut copy paste link'
                }
              },
            plugins: 'link',
            setup: (editor) => {
                editor.ui.registry.addButton('myCustomToolbarButton', {
                    text: 'B+',
                    tooltip: 'Bold and special action',
                    // onAction: () => alert('Button clicked!')
                    onAction: () => this.boldSpecialAction()
                });
                editor.on('init', function (e) {
                    getPromiseFromEvent();
                });
            },
            toolbar_location: 'bottom'
        });

        waitForInit().then(() => {
            console.log("TinyMCE init done");
            if (!document.location.hash && !restarted) this.controler.graphSelected();
            // if started from a hyperhopping URL, we expect landing on a node; 
            // && if restarted by enableEdit, avoid problem with deselectNode: select graph before restart
        });

        function getPromiseFromEvent() {
            return new Promise((resolve) => {
                setTimeout(function() {resolve();}, 1000);     // activeEditor may still be late
            });
        }
        async function waitForInit() {
            await getPromiseFromEvent();
        }
    }

    boldSpecialAction() {
        if (this.fallback) return;
        var textToAdd = tinymce.activeEditor.selection.getContent({ format: 'text' }).trim();
        tinyMCE.execCommand('Bold');
        this.controler.addToLabel(textToAdd);
    }

    setText(text) {
        if (this.fallback) {
            var detailField = document.getElementById("detailField");
            detailField.value = text;
        } else {
            this.editorPane = tinyMCE.activeEditor;
            this.editorPane.setContent(text);
        }
    }

    getText() {
        if (this.fallback) {
            var detailField = document.getElementById("detailField");
            return detailField.value;
        } else {
            return this.editorPane.getContent();
        }
    }
}

class GraphCore {
    selection = new Selection();
    // directly from jri:
    translateInProgress;	// \
    moveInProgress;			// | max one is set
    edgeInProgress;			// |

    translation = [0, 0];
    lastPoint = [0, 0];
    dumbCaller;

    constructor(caller) {
        var th = this;
        this.controlerCore = caller;
        this.dumbCaller = (caller.constructor.name == PresentationCore.name);
        var canvas = document.getElementById("myCanvas");

        var nav = navigator.userAgent;
        var weirdBrowser = nav.indexOf("Firefox") < 1 && nav.indexOf("Chrome") < 1 && nav.indexOf("Edg") < 1;
        if (weirdBrowser) {  // Safari won't handle my use of split.js
            canvas.width = 75 * window.innerWidth / 100;
        } else if (typeof (Split) == "undefined") {    // split.js library missing: fix divider 
            alert("Network down? 'Split' not found");
            canvas.width = 75 * window.innerWidth / 100;
        } else {
            canvas.width = screen.width;
        }
        canvas.height = screen.height;

        this.ctx = canvas.getContext('2d');

        if (window.PointerEvent) {
            canvas.addEventListener('pointerdown', function (e) { th.thisPanelPressed(e) });
            canvas.addEventListener('pointerup', function (e) { th.thisPanelReleased(e) });
            canvas.addEventListener('pointermove', function (e) { th.thisPanelDragged(e) });
            canvas.addEventListener('pointerleave', function (e) { th.thisPanelReleased(e) });
        } else if (window.MouseEvent) {
        canvas.addEventListener('mousedown', function (e) { th.thisPanelPressed(e) });
        canvas.addEventListener('mouseup', function (e) { th.thisPanelReleased(e) });
        canvas.addEventListener('mousemove', function (e) { th.thisPanelDragged(e) });
        // see https://stackoverflow.com/questions/21298918/is-it-possible-to-call-a-class-method-with-addeventlistener
        // for why we use the above syntax
        }
    }

    // Paint methods

    draw() {
        var context = this.ctx;
        context.font = "12px Arial";
        context.clearRect(-this.translation[0], -this.translation[1],
            window.innerWidth, window.innerHeight);    // not in Java version
        // context.translate(this.translation[0], this.translation[1]); // see translateGraph() instead
        this.paintEdges();
        this.paintNodes();
    }

    paintNodes() {
        var context = this.ctx;
        this.nodes.forEach(node => {
            var color = node.getColor();
            context.fillStyle = color;
            var x = node.getXY()[0];
            var y = node.getXY()[1];
            context.fillRect(x - 10, y - 8, 20, 16);
            var label = node.getLabel();
            context.fillStyle = "#000000";
            context.fillText(label, x - 9, y + 23);
            if (node == this.selection.topic && this.selection.mode == Selection.SELECTED_TOPIC) {
                context.strokeStyle = "#ff0000";
                context.strokeRect(x - 11, y - 11, 22, 22);
            }
        });
    }

    paintEdges() {
        var context = this.ctx;
        this.edges.forEach(edge => {
            var color = edge.getColor();
            var point1 = edge.getNode1().getXY();
            var point2 = edge.getNode2().getXY();
            this.paintLine(point1, point2, color);
            if (edge == this.selection.assoc && this.selection.mode == Selection.SELECTED_ASSOCIATION) {
                this.highlightEdge(edge, this.ctx);     // different from Java version
            }
        });

        if (this.edgeInProgress) {      // paint ray of growing edge
            var p = this.selection.topic.getXY();
            document.getElementById("myCanvas").style.cursor = "crosshair";
            this.paintLine(p, [this.ex - this.translation[0], this.ey - this.translation[1]], "#000000");
        }
    }

    paintLine(point1, point2, color) {
        var context = this.ctx;
        context.strokeStyle = color;
        context.lineWidth = 1;
        var x1 = point1[0];
        var y1 = point1[1];
        var x2 = point2[0];
        var y2 = point2[1];
        // idea is from Joerg Richter's DeepaMehta 2
        filament(x1, y1 - 1, x2, y2);
        filament(x1 + 1, y1 - 1, x2, y2);
        filament(x1 + 2, y1, x2, y2);
        filament(x1 + 2, y1 + 1, x2, y2);
        filament(x1 + 1, y1 + 2, x2, y2);
        filament(x1, y1 + 2, x2, y2);
        filament(x1 - 1, y1 + 1, x2, y2);
        filament(x1 - 1, y1, x2, y2);

        function filament(x1, y1, x2, y2) {
            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            context.stroke();
        }
    }

    // Clicking

    thisPanelPressed(e) {
        this.mousedown = true;
        var x = e.clientX;
        var y = e.clientY;
        this.mX = x;
        this.mY = y;

        var foundNode = this.findNode(x, y);
        var node = foundNode || null;
        var edge = !foundNode ? this.findEdge(x, y) : null;

        if (node && edge) { // TODO eliminate in Java version
            this.edgeClicked(edge, e);
        } else if (edge) {
            this.edgeClicked(edge, e);
        } else if (node) {
            this.nodeClicked(node, e);
        } else {
            this.graphClicked(e);
        }
    }

    thisPanelReleased(e) {
        this.mousedown = false;
        if (this.moveInProgress) {
            this.moveInProgress = false;
        } else if (this.translateInProgress) {
            this.translateInProgress = false;
        } else if (this.edgeInProgress) {
            this.edgeInProgress = false;
            if (this.targetNode != null && this.targetNode != this.selection.topic) {
                var node1 = this.selection.topic;
                var node2 = this.targetNode;
                this.controlerCore.createEdge(node1, node2);
            }
            document.getElementById("myCanvas").style.cursor = "default";
            this.draw();
        }
    }

    thisPanelDragged(e) {
        if (!this.mousedown) return;
        if (this.moveInProgress || this.translateInProgress) {
            var x = e.clientX;
            var y = e.clientY;
            var dx = x - this.mX;
            var dy = y - this.mY;
            this.mX = x;
            this.mY = y;
            if (this.moveInProgress) {
                this.translateNode(this.selection.topic, dx, dy);
            } else {
                this.translateGraph(dx, dy);
            }
            this.draw();
        } else if (this.edgeInProgress) {
            this.ex = e.clientX;
            this.ey = e.clientY;
            var foundNode = this.findNode(this.ex, this.ey);
            this.targetNode = foundNode;
            if (this.targetNode != null) {
                var p = this.targetNode.getXY();
                this.ex = p[0] + this.translation[0];
                this.ey = p[1] + this.translation[1];
            }
            // see paintEdges() for continuation
        }
        this.draw();
    }

    findNode(x, y) {    // different from Java version
        var foundNode = null;
        x -= this.translation[0];
        y -= this.translation[1];
        this.nodes.forEach(node => {
            var nodesX = node.getXY()[0];
            var nodesY = node.getXY()[1];
            var label = node.getLabel();
            if (Math.abs(x - nodesX) < 13 && Math.abs(y - nodesY) < 13) {
                foundNode = node;
                var id = node.getID();
            }
        });
        return foundNode;
    }

    findEdge(x, y) {    // different from Java version
        var foundEdge = null;
        this.edges.forEach(edge => {
            var x1 = edge.getNode1().getXY()[0];
            var y1 = edge.getNode1().getXY()[1];
            var x2 = edge.getNode2().getXY()[0];
            var y2 = edge.getNode2().getXY()[1];
            this.lineAsRect(x1, y1, x2, y2, 20, this.ctx);
            if (this.ctx.isPointInPath(x, y)) {
                foundEdge = edge;
                var id = edge.getID();
            }
        });
        return foundEdge;
    }

    nodeClicked(node, e) {
        this.nodeSelected(node);
        var x = e.clientX;
        var y = e.clientY;
        if (e.altKey || e.button == 1 || this.dblclick) {
            this.modified = true;
        } else this.modified = false;
        if (this.modified) {
            this.dblclick = false;
            this.edgeInProgress = true;
            this.targetNode = null;
            this.ex = x;
            this.ey = y;
        } else {							// default -- start moving a node
            this.moveInProgress = true;
            this.lastPoint = [x, y];
        }
    }

    edgeClicked(edge, e) {
        this.edgeSelected(edge);
    }

    graphClicked(e) {
        this.graphSelected();
        if (!this.modified) this.translateInProgress = true;
        document.getElementById("rmenu").className = "hide";
        document.getElementById("rmenu2").className = "hide";
    }

    // Selecting

    nodeSelected(node) {
        if (node == this.selection.topic) return;
        this.selection.mode = Selection.SELECTED_TOPIC;
        this.controlerCore.nodeSelected(node);
        this.selection.topic = node;
        this.selection.assoc = null;
        this.draw();
    }

    edgeSelected(edge) {
        if (edge == this.selection.assoc) return;
        this.selection.mode = Selection.SELECTED_ASSOCIATION;
        this.controlerCore.edgeSelected(edge);
        this.selection.assoc = edge;
        this.selection.topic = null;
        this.draw();
    }

    graphSelected() {
        if (this.selection.mode == Selection.SELECTED_TOPICMAP) return;
        this.selection.mode = Selection.SELECTED_TOPICMAP;
        this.selection.topic = null;
        this.selection.assoc = null;
        this.controlerCore.graphSelected();
        this.draw();
    }

    translateNode(node, x, y) {
        // simulating Java Point method: node.getXY().translate(x, y);    TODO: replace by dx, dy
        var p = node.getXY();
        p[0] += x;
        p[1] += y;
        node.setXY(p);
    }

    translateGraph(dx, dy) {
        this.translation[0] += dx;
        this.translation[1] += dy;
        this.ctx.translate(dx, dy);     // different from Java version
        this.draw();
    }

    // Accessories

    lineAsRect(x1, y1, x2, y2, lineWidth, ctx) {
        // inspired by http://jsfiddle.net/m1erickson/QyWDY
        var dx = x2 - x1;
        var dy = y2 - y1;
        var lineLength = Math.sqrt(dx * dx + dy * dy);
        var lineRadianAngle = Math.atan2(dy, dx);
        // var ctx = this.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.translate(x1, y1);
        ctx.rotate(lineRadianAngle);
        ctx.rect(0, -lineWidth / 2, lineLength, lineWidth);
        ctx.translate(-x1, -y1);
        ctx.rotate(-lineRadianAngle);
        ctx.restore();
        ctx.closePath();
    }

    highlightEdge(edge, ctx) {
        var x1 = edge.getNode1().getXY()[0];
        var y1 = edge.getNode1().getXY()[1];
        var x2 = edge.getNode2().getXY()[0];
        var y2 = edge.getNode2().getXY()[1];
        this.lineAsRect(x1, y1, x2, y2, 5, ctx);
        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Communication between classes

    setModel(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
    }

    getSelectionInstance() {
        return this.selection;
    }

    init() {
    }
}

class Selection {
    static SELECTED_NONE = 1;
    static SELECTED_TOPIC = 2;
    static SELECTED_ASSOCIATION = 3;
    static SELECTED_TOPICMAP = 4;

    // GraphNode topic  \ max one
    // GraphNode assoc  / is set

    constructor() {
        this.mode = this.SELECTED_NONE;
    }
}

class GraphNode {
    associations = [];

    constructor(id, xy, color, label, detail) {
        this.id = id;
        this.xy = xy;
        this.color = color;
        this.label = label;
        this.detail = detail;
    }

    getID() { return this.id; }
    getXY() { return this.xy; }
    getColor() { return this.color; }
    getLabel() { return this.label; }
    getDetail() { return this.detail; }

    setID(id) { this.id = id; }
    setXY(xy) { this.xy = xy; }
    setColor(color) { this.color = color; }
    setLabel(label) { this.label = label; }
    setDetail(detail) { this.detail = detail; }

    relatedNode(edge) {
        if (this == edge.getNode1()) {
            return edge.getNode2();
        } else if (this == edge.getNode2()) {
            return edge.getNode1();
        } else {
            console.log("*** GraphNode.relatedNode(): " + this.getID() + " is not part of edge \"" + edge + "\"");
            return null;
        }
    }
    getEdges() { return this.associations; }
    addEdge(edge) { this.associations.push(edge); }
    removeEdge(edge) {  // simulating Java Vector.removeElement
        var index = this.associations.indexOf(edge);
        if (index > -1) {
            this.associations.splice(index, 1);
            return true;
        } else { return false; }
    }
}

class GraphEdge {
    constructor(id, node1, node2, color, detail) {
        this.id = id;
        this.node1 = node1;
        this.node2 = node2;
        this.color = color;
        this.detail = detail;
        this.n1 = node1.getID();
        this.n2 = node2.getID();
    }

    getID() { return this.id; }
    getNode1() { return this.node1; }
    getNode2() { return this.node2; }
    getColor() { return this.color; }
    getDetail() { return this.detail; }
    getN1() { return this.n1; }
    getN2() { return this.n2; }

    setID(id) { this.id = id; }
    setColor(color) { this.color = color; }
    setDetail(detail) { this.detail = detail; }
}

class PresentationService extends PresentationCore {
    lifeCycle = new LifeCycle();

    constructor(graphClass, newStuffClass) {         // no constructor in Java version
        super(graphClass);
        if (newStuffClass) {
            this.newstuff = new newStuffClass(this);
        } else {
            this.newstuff = new NewStuff(this);
        }
    }

    initialize() {
        var queryString = document.location.search;
        if (queryString.substring(1,4) == "wb=") queryString = null;
        if (queryString) {this.readOnly = true;}
        this.openHash = document.location.hash ? true : false;

        super.initialize(this.readOnly);
        document.title = "Condensr - Main Window";
        // graphClass, newstuff & 2 more need each other & connect via these init() calls
        this.graphClass.init();

        this.createContextMenu();
        // load map specified in URL "?" string
        // (because of CORS this is mainly for self-hosted or/ and demo files)
        if (queryString) {
            new IngestXML(queryString.substring(1), 3, this);
        }
    }

    createContextMenu() {
        var th = this;

        // Graph menu
        var rmenu = document.getElementById("rmenu");
        rmenu.id = "rmenu";
        rmenu.className = "hide";

        var newItem = document.createElement("a");
        newItem.id = "new";
        newItem.className = "opt";
        newItem.innerHTML = "New Item";
        document.getElementById("rmenu").appendChild(newItem);
        document.getElementById("new").addEventListener('click', function() { th.createNode(th.x, th.y) });

        var saveMap = document.createElement("a");
        saveMap.id = "store";
        saveMap.className = "opt";
        saveMap.innerHTML = "Save Map";
        document.getElementById("rmenu").appendChild(saveMap);
        document.getElementById("store").addEventListener('click', function() { th.startStoring() });

        var loadFile = document.createElement("a");
        loadFile.id = "load";
        loadFile.className = "opt";
        loadFile.innerHTML = "Load File(s)";
        document.getElementById("rmenu").appendChild(loadFile);
        document.getElementById("load").addEventListener('click', function() { th.startLoading() });
      
        var help = document.createElement("a");
        help.id = "help";
        help.className = "opt";
        help.innerHTML = "Help";
        help.target = "_blank";
        help.href = "?help-en.xml";
        document.getElementById("rmenu").appendChild(help);
        document.getElementById("help").addEventListener('click',
            function () { document.getElementById("rmenu").className = "hide"; });

        // Nodes and Edges menu
        var rmenu2 = document.getElementById("rmenu2");
        rmenu2.id = "rmenu2";
        rmenu2.className = "hide";
        var colors = ["#b277b2", "#7777ff", "#77ff77", "#ffff77", 
		              "#ffc877", "#ff7777", "#d8d8d8", "#b0b0b0"];
        var color;
        for (var i = 0; i < 8; i++) {
            color = document.createElement("a");
            color.id = "color" + i;
            color.className = "opt";
            if (i == 0 || i == 1 || i == 5 || i == 7) color.className = "opt2";
            color.innerHTML = "Change Color";
            if (i == 6) color.innerHTML = "Pale";
            if (i == 7) color.innerHTML = "Dark";
            document.getElementById("rmenu2").appendChild(color);
            document.getElementById("color" + i).style.background = colors[i];
        }
        for (var i = 0; i < 8; i++) {
            var el = "color" + i;
            document.getElementById(el).addEventListener('click', function(e) { th.recolor(e) });
        }
    
        var del = document.createElement("a");
        del.id = "del";
        del.className = "opt";
        del.innerHTML = "Delete";
        document.getElementById("rmenu2").appendChild(del);
        document.getElementById("del").addEventListener('click', function() { th.delete() });
    }

    displayContextMenu(x, y) {
        this.x = x;
        this.y = y;
        if (this.selection.mode == Selection.SELECTED_TOPICMAP) {
            document.getElementById("rmenu").className = "show";
            document.getElementById("rmenu").style.top = y + "px";
            document.getElementById("rmenu").style.left = x + "px";
            this.insertLocation = [x, y];
        } else {
            document.getElementById("rmenu2").className = "show";
            document.getElementById("rmenu2").style.top = y + "px";
            document.getElementById("rmenu2").style.left = x + "px";
        }
    }

    nodeSelected(node) {
        super.nodeSelected(node);
        if (this.readOnly) document.getElementById("detailField").innerHTML = node.getDetail();
        if (location.hash) {
            if (!this.openHash) {
                location.assign("#");   // avoid confusing previous URLs
            } else {
                this.openHash = false;  // first arrival here is from findHash()
            }
        }
    }

    edgeSelected(edge) {
        super.edgeSelected(edge);
        if (this.readOnly) document.getElementById("detailField").innerHTML = edge.getDetail();
    }

    graphSelected() {
        super.graphSelected();
        var initText1 = "<p style=\"margin-top: 0\"><font color=\"gray\">"
			+ "<em>To get started, insert some items. <br/>"
            + "Right-click the left pane for help. "
            + "<br />&nbsp;<br />Do you have any questions? Contact "
            + "<a href=\"mailto:support@x28hd.de\">support@x28hd.de</a></em></font></p>";
            var initText2 = "<p style=\"margin-top: 0\"><font color=\"gray\">"
			+ "<em>Click an icon for its details, <br />"
            + "ALT + drag an icon to connect it."		
            + "<br />&nbsp;<br />Do you have any questions? Contact "
            + "<a href=\"mailto:support@x28hd.de\">support@x28hd.de</a></em></font></p>"
            var initText3 = "<p style=\"margin-top: 0\"><font color=\"gray\">"
			+ "<em>Click an icon for its details, <br />"
            + 'drag an icon to move it; <br />'
            + '<br />&nbsp;<br />'
            + '<a href="?example-en.xml" target="_blank">Play the intro game?</a><br />'
            + '<br /><a href="?help-en.xml" target="_blank">Get help?</a></em></font></p>';
        var initText = this.nodes.size == 0 ? initText1 : initText2;
        if (this.readOnly) {
            document.getElementById("detailField").innerHTML = initText3;
        } else if (typeof (tinyMCE) != "undefined") {
            document.getElementById("detailField").innerHTML = initText;
            this.editorClass.setText(initText);
        } else {
            this.editorClass.setText("");
        }
    }

    createNode(x, y) {
        var newId = this.newKey(this.nodes);
        x -= this.graphClass.translation[0];
        y -= this.graphClass.translation[1];
        var topic = new GraphNode(newId, [x, y], "#ccdddd", "", "");
        this.nodes.set(newId, topic);
        this.graphClass.nodeSelected(topic);
        this.graphClass.draw();
        document.getElementById("labelField").focus();
    }

    delete() {      // not in Java version
        var what;
        if (this.selection.mode == Selection.SELECTED_TOPIC) {
            what = this.selectedTopic;
            this.deleteNode(this.selectedTopic, false);
        } else if (this.selection.mode == Selection.SELECTED_ASSOCIATION) {
            what = this.selectedAssoc;
            this.deleteEdge(this.selectedAssoc, false);
        } else {
            console.log("Unkown error PS101");
        }
        document.getElementById("rmenu2").className = "hide";
        this.graphClass.draw();
    }

    deleteNode(topic, silent) {
        var neighbors = topic.getEdges();
        var todoList = [];
        neighbors.forEach(function(assoc) { todoList.push(assoc); });
        if (!silent) {
            var topicName = topic.getLabel();
            if (topicName.length > 30) topicName = topicName.substring(0,30) + "...";

            if (!confirm("Are you sure you want to delete the item \n \"" + topicName +
                "\" with " + neighbors.length + " connections ?\n" + 
                "\n(There is no good Undo yet!)")) return;
        }
        todoList.forEach(function(assoc) { this.deleteEdge(assoc, true); }, this);
        var topicKey = this.selectedTopic.getID();
        this.nodes.delete(topicKey);
        this.graphSelected();
    }

    deleteEdge(assoc, silent) {
        var topic1 = assoc.getNode1();
        var topic2 = assoc.getNode2();
        if (!silent) {
            var topicName1 = topic1.getLabel();
            var topicName2 = topic2.getLabel();
            if (!confirm("Are you sure you want to delete " + "the connection \n" +
                "from \"" + topicName1 + "\" to \"" + topicName2 + "\" ?" +
                "\n(There is no good Undo yet!)")) return;
        }
        topic1.removeEdge(assoc);
        topic2.removeEdge(assoc);
        var assocKey = assoc.getID();
        this.edges.delete(assocKey);
    }

    recolor(e) {
        var targetElement = e.target || e.srcElement;
        var colorID = targetElement.id.substring(5, 6);

        var what;
        if (this.selection.mode == Selection.SELECTED_TOPIC) {
            what = this.selectedTopic;
        } else if (this.selection.mode == Selection.SELECTED_ASSOCIATION) {
            what = this.selectedAssoc;
        } else {
            console.log("Unkown error PS102");
        }
        var colors = ["#d2bbd2", "#bbbbff", "#bbffbb", "#ffff99", 
		"#ffe8aa", "#ffbbbb", "#eeeeee", "#ccdddd"];
        var color = colors[colorID];

        console.log("recolor " + targetElement.id + " " + color);
        what.setColor(color);
        document.getElementById("rmenu2").className = "hide";
        this.graphClass.draw();
    }

    getNSInstance() {
        return this.newstuff;
    }

    triggerUpdate(newStuffClass) {
        this.newStuffClass = newStuffClass;
        this.performUpdate();
    }

    performUpdate() {
        var th = this;
        var newNodes = this.newStuffClass.getNodes();
        var newEdges = this.newStuffClass.getEdges();
        var integrateNodes = new IntegrateNodes(this.nodes, this.edges, newNodes, newEdges);
        var where = this.insertLocation; // fallback is last contextMenu location from loadFile
        if (this.nodes.size < 1) {
            where = [0, 0];
        } else {
            where = this.newstuff.getDropLocation() || where;
        }
        var translation = this.graphClass.translation;
        integrateNodes.mergeNodes(where, translation);
        this.nodes = integrateNodes.getNodes();
        this.edges = integrateNodes.getEdges();
        this.graphClass.setModel(this.nodes, this.edges);
        this.graphClass.graphSelected();
        if (this.openHash) this.findHash(document.location.hash.substring(1));
    }

    findHash(hash) {
        if (hash == "") {
            this.graphSelected();
            return null;
        }
        var th = this;
        var foundNode = null;
        this.nodes.forEach(node => {
            var label = node.getLabel();
            if (label == hash || 	// for safari
                label.replace(/ /g, "%20") == hash) {
                foundNode = node;
            }
        });
        if (foundNode == null) {
            alert(hash + " not found on this map");
            return null;
        }
        var selectedNode = foundNode;
        this.graphClass.nodeSelected(selectedNode);
        var canvas = document.getElementById("myCanvas");
        var ctx = canvas.getContext("2d");
        var deltaX = window.innerWidth/8 * 3 - this.selectedTopic.getXY()[0];   // half of default left width
        var deltaY = window.innerHeight/2 - this.selectedTopic.getXY()[1];
		if (!th.openHash) {    
            deltaX = deltaX - th.graphClass.translation[0];
            deltaY = deltaY - th.graphClass.translation[1];
        }
        var pos = 0;
        var id = setInterval(frame, 5);

        function frame() {
            if (pos == 100) {
                clearInterval(id);
            } else {
                pos++;
                var progressX = deltaX / 100;
                var progressY = deltaY / 100;
                th.graphClass.translation[0] += progressX;
                th.graphClass.translation[1] += progressY;
                ctx.translate(progressX, progressY);
                th.graphClass.draw();
            }
        }
    }

    enableEdit() {
        this.readOnly = false;
        this.graphClass.graphSelected();
        this.editorClass = new TextEditorCore(this, this.detailFieldHeight, false, true);  
    }

    startStoring() {
        document.getElementById("rmenu").className = "hide";
        var filename = this.lifeCycle.getFilename();
        if (filename == null) {
            filename = prompt("Please enter a file name", "x28map");
            this.lifeCycle.setFilename(filename);
        }
        new TopicMapStorer(this.nodes, this.edges, filename);
    }

    startLoading() {
        document.getElementById("rmenu").className = "hide";
        var input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = e => {
            var files = e.target.files;
            if (files.length == 1) {
                var file = files[0];
                new IngestZip(file, this);
            } else {
                new IngestFileList(files, this);
            }
        }
        input.click();
    }
}

class GraphPanel extends GraphCore {
    rectangleSet = new Set();
    rectangleMark = [];
    rectangle = [0, 0, 0, 0];
    dragInProgress = false; // true if dragged before released

    constructor(caller) {
        super(caller);

        this.controler = caller;
        if (this.dumbCaller) {
            console.log("GraphPanel: dumbCaller");
        }

        this.rectangleInProgress = false;
        this.rectangleGrowing = false;
    }

    // Extensions of GraphCore methods to support selection rectangles; 

    paintNodes() {
        super.paintNodes();
        if (this.rectangleGrowing) this.paintRect();
        if (this.rectangleInProgress) this.paintRect();
    }

    paintRect() {
        var context = this.ctx;
        if (this.rectangleGrowing) {
            var x = this.rectangleMark[0];
            var y = this.rectangleMark[1];
            var rectangleDot = [this.ex, this.ey];
            var w = rectangleDot[0] - x;
            var h = rectangleDot[1] - y;
            if (w < 0) {
                x = rectangleDot[0];
                w = 0 - w;
            }
            if (h < 0) {
                y = rectangleDot[1];
                h = 0 - h;
            }

            context.strokeStyle = "#ff0000";
            context.lineWidth = 1;
            context.strokeRect(x, y, w, h);
            this.rectangle = [x, y, w, h];
        } else {
            context.strokeStyle = "#ff0000";
            context.strokeRect(this.rectangle[0], this.rectangle[1], this.rectangle[2], this.rectangle[3]);
        }
    }

    thisPanelDoubleclicked(e) {
        // different from Java version because no e.getClickCount() 
        e.preventDefault();
        if (this.ignoreDoubleclick) {
            this.ignoreDoubleclick = false;
            return;
        }
        this.dblclick = true;
        // get rid of rectangle (single click may seem like drag)
        if (this.rectangleInProgress) {
            var x = e.clientX - this.translation[0];
            var y = e.clientY - this.translation[1];
            if (this.rectangleContains(this.rectangle, [x, y])) {
                this.rectangleInProgress = false;
                this.nodeRectangle(false);
                this.rectangle = [0, 0, 0, 0];
                this.dblclick = false;
                this.draw();
            }
        }
    }

    thisPanelDragged(e) {
        // = super + rectangleGrowing + rectangleContains
        if (!this.mousedown) return;
        if (this.moveInProgress || this.translateInProgress) {
            // were set in nodeClicked or graphClicked, respectively
            this.dragInProgress = true;
            var x = e.clientX;
            var y = e.clientY;
            var dx = x - this.mX;
            var dy = y - this.mY;
            this.mX = x;
            this.mY = y;
            if (this.moveInProgress) {
                this.translateNode(this.selection.topic, dx, dy);
            } else if (this.rectangleInProgress &&
                    this.rectangleContains(this.rectangle, [
                        e.clientX - this.translation[0],
                        e.clientY - this.translation[1]])) { 
                    this.translateRectangle(dx, dy);
            } else {
                this.translateGraph(dx, dy);
            }
            this.draw();
        } else if (this.edgeInProgress) {
            this.ex = e.clientX;
            this.ey = e.clientY;
            var foundNode = this.findNode(this.ex, this.ey);
            this.targetNode = foundNode;
            if (this.targetNode != null) {
                var p = this.targetNode.getXY();
                this.ex = p[0] + this.translation[0];
                this.ey = p[1] + this.translation[1];
            }
            // see paintEdges() for continuation
        } else if (this.rectangleGrowing) {
            this.ex = e.clientX - this.translation[0];
            this.ey = e.clientY - this.translation[1];
            this.rectangle = [0, 0, 0, 0];	// grows in paintRect
        }
        this.draw();
    }

    thisPanelReleased(e) {
        super.thisPanelReleased(e);
        if (this.rectangleGrowing) {
            // if (this.rectangleGrowing && !this.edgeInProgress) {
            this.rectangleGrowing = false;
            this.rectangleInProgress = true;
            this.nodeRectangle(true);
            this.draw();
        } else if (this.rectangleInProgress && !this.dragInProgress &&
            this.rectangleContains(this.rectangle, [
                e.clientX - this.translation[0],
                e.clientY - this.translation[1]])) {
            this.ignoreDoubleclick = true; 
            this.rectangleInProgress = false;
            this.nodeRectangle(false);
            this.rectangle = [0, 0, 0, 0];
            this.nodeRectangle(false);
            this.draw();
        }
        this.dragInProgress = false;
    }

    graphClicked(e) {
        if (e.altKey || e.button == 1 || this.dblclick) {
            this.modified = true;
        } else this.modified = false;

        super.graphClicked(e);
        var x = e.clientX;
        var y = e.clientY;
        if (this.modified) {
            this.dblclick = false;
            this.rectangleMark[0] = x - this.translation[0];
            this.rectangleMark[1] = y - this.translation[1];
            this.rectangleGrowing = true;
            this.ex = x;
            this.ey = y;
        }
    }

    rectangleContains([x1, y1, w, h], [x, y]) {
            return (x1 <= x && x <= x1 + w && y1 <= y && y <= y1 + h);
        }
    
    nodeRectangle(on) {
        this.rectangleSet.clear();
        this.rectangleInProgress = on;
        if (!on) return;
        this.nodes.forEach(node => {
            var xy = node.getXY();
            if (!this.rectangleContains(this.rectangle, xy)) return;
            this.rectangleSet.add(node);
        });
    }

    translateRectangle (dx, dy) {
        this.rectangle[0] += dx;
        this.rectangle[1] += dy;
        var myIterator = this.rectangleSet.values();
            for (var node of myIterator) {
            this.translateNode(node, dx, dy);
        };
    }

    // Drop in

    canImport(ev) {
        return this.newStuff.canImport(ev);
    }
    importData(ev) {
        return this.newStuff.importData(ev);
    }

    init() {
        this.newStuff = this.controler.getNSInstance();
        var th = this;
        var canvas = document.getElementById("myCanvas");
        canvas.addEventListener('dragover', function (e) { th.canImport(e) });
        canvas.addEventListener('drop', function (e) { th.importData(e) });
        canvas.addEventListener('contextmenu', function (e) { th.rightmenu(e) });
        canvas.addEventListener('dblclick', function (e) { th.thisPanelDoubleclicked(e) });
    }

    rightmenu(e) {
        // Unlike the Java version, the rightClick here cannot be handled by thisPanelPressed(), 
        // (preventDefault won't work), so this is copied from the old Demo version 
        e.preventDefault();
        var x = e.clientX;
        var y = e.clientY;
        if (!this.dumbCaller) this.controler.displayContextMenu(x, y);
    }
}

class NewStuffCore {
    constructor(controler) {
        this.controler = controler;
    }
    canImport(ev) {
        if (ev.dataTransfer.types.indexOf("Files") < 0) {
            return false;
        } else {
            ev.preventDefault();
            return true;
        }
    }
    importData(ev) {
        ev.preventDefault();
        this.transferTransferable(ev);
    }
    transferTransferable(ev) {
        var files = ev.dataTransfer.files;
        var dataString = "";
        if (files.length > 0) {
            var l = files.length;
            if (l == 1) {
                var file = files[0];
                new IngestXML(file, 2, this.controler);
            }
            return true;
        }
    }
}

class IngestXML {
    constructor(file, type, controler) {
        var th = this;
        this.type = type;
        this.controler = controler;
        this.file = file;

        if (type == 1) {        // used for strings from zip entries and dropped snippets
            this.parser = new DOMParser();
            this.xml = this.parser.parseFromString(file, "text/xml");
            this.data = file;       // if parse fails
            this.checkXML(this.xml);
        }
        if (type == 2) {
            var reader = new FileReader();
            reader.onload = readFile(file);
            reader.readAsText(file);
        }
        if (type == 3) {        // used for files from URL ?-string
            var xhr = new XMLHttpRequest();
            xhr.open("GET", file, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        th.xml = xhr.responseText;
                        th.parseXML(th.xml);
                        th.controler.lifeCycle.setFilename(file);
                    } else alert("Error loading file \n" + file + ":\n" + xhr.status + " " + xhr.statusText);
                }
            };
            xhr.send();
        }

        function readFile(file) {   // for type 2
            return function (e) {
                th.data = e.target.result;
                this.parser = new DOMParser();
                this.xml = this.parser.parseFromString(th.data, "text/xml");
                th.checkXML(this.xml);
                th.controler.lifeCycle.setFilename(file.name);
            }
        }
    }

    parseXML(xml) {     // for type 1 and 3
        this.parser = new DOMParser();
        this.doc = this.parser.parseFromString(xml, "text/xml");
        this.checkXML(this.doc);
    }

    checkXML(doc) {
        var root = doc.documentElement;
        var rootName = root.nodeName;
        if (rootName == "x28map") {
            var loader = new TopicMapLoader(doc);
            var nodes = loader.newNodes;
            var edges = loader.newEdges;
            if (this.controler.getNSInstance().constructor.name == NewStuffCore.name) {
                console.log("dumb " + nodes.size + ", " + edges.size);
                this.controler.setModel(nodes, edges);
                this.controler.graphClass.draw();
                return;
            } else {
                new InsertMap(nodes, edges, this.controler);
            }
        } else {
            console.log(rootName + ", not a x28map: " + doc);
            var loader = new SplitIntoNew(this.data);   // TODO cleanup
            var nodes = loader.newNodes;
            var edges = loader.newEdges;
            if (this.controler.getNSInstance().constructor.name == NewStuffCore.name) {
                console.log("dumb " + nodes.size + ", " + edges.size);
                this.controler.setModel(nodes, edges);
                this.controler.graphClass.draw();
                return;
            } else {
            new IngestItemList(this.data, this.controler);
            }
        }
    }
}

class TopicMapLoader {
    newNodes = new Map;
    newEdges = new Map;
    topics;

    constructor(doc) {
        this.topics = doc.getElementsByTagName("topic");
        for (var i = 0; i < this.topics.length; i++) {
            var topic = this.topics[i];
            var label = topic.firstChild.textContent;
            var id = parseInt(topic.getAttribute("ID"));
            var x = parseInt(topic.getAttribute("x"));
            var y = parseInt(topic.getAttribute("y"));  // otherwise canvas can't fillText my labels!
            var color = topic.getAttribute("color");
            var detail = topic.lastChild.textContent;
            var newNode = new GraphNode(id, [x, y], color, label, detail);
            this.newNodes.set(id, newNode);
        };
        this.assocs = doc.getElementsByTagName("assoc");
        for (var i = 0; i < this.assocs.length; i++) {
            var assoc = this.assocs[i];
            var id = 100 + i;
            var n1 = parseInt(assoc.getAttribute("n1"));
            var n2 = parseInt(assoc.getAttribute("n2"));
            var node1 = this.newNodes.get(n1);
            var node2 = this.newNodes.get(n2);
            var color = assoc.getAttribute("color");
            var detail = assoc.lastChild.textContent;
            var newEdge = new GraphEdge(id, node1, node2, color, detail);
            node1.addEdge(newEdge);
            node2.addEdge(newEdge);
            this.newEdges.set(id, newEdge);
        };
    }
}

class TopicMapStorer {
    constructor(nodes, edges, filename) {
        this.nodes = nodes;
        this.edges = edges;

        this.doc = document.implementation.createDocument("", "", null);
        this.root = this.doc.createElement("x28map");
        this.doc.appendChild(this.root);
        this.exportTopics();
        this.exportAssocs();
        var content = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
            "<!-- This is not for human readers but for http://x28hd.de/tool/ -->\n";
        content += this.doc.documentElement.outerHTML;

        var uriContent = "data:text/xml," + encodeURIComponent(content);
        var expAnchor = document.getElementById("store");
        expAnchor.setAttribute('href', uriContent);
        var date = new Date();
        filename += "-" + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "-" +
            date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds();
        filename += ".xml";
        expAnchor.setAttribute('download', filename);
    }

    exportTopics() {
        this.nodes.forEach(node => {
            var topic = this.doc.createElement("topic");
            topic.setAttribute("ID", node.getID());
            topic.setAttribute("x", node.getXY()[0]);
            topic.setAttribute("y", node.getXY()[1]);
            topic.setAttribute("color", node.getColor());
            var label = this.doc.createElement("label");
            var labelData = this.doc.createCDATASection(node.getLabel());
            label.appendChild(labelData);
            topic.appendChild(label);
            var detail = this.doc.createElement("detail");
            var detailData = this.doc.createCDATASection(node.getDetail());
            detail.appendChild(detailData);
            topic.appendChild(detail);
            this.root.appendChild(topic);
            this.root.appendChild(this.doc.createTextNode("\n"));
        });
    }
    exportAssocs() {
        this.edges.forEach(edge => {
            var assoc = this.doc.createElement("assoc");
            assoc.setAttribute("n1", edge.getNode1().getID());
            assoc.setAttribute("n2", edge.getNode2().getID());
            assoc.setAttribute("color", edge.getColor());
            var detail = this.doc.createElement("detail");
            var detailData = this.doc.createCDATASection(edge.getDetail());
            detail.appendChild(detailData);
            assoc.appendChild(detail);
            this.root.appendChild(assoc);
        });
    }
}

class SplitIntoNew {
    newNodes = new Map;
    newEdges = new Map;    // not yet used

    constructor(dataString) {       // Java version finally outperformed        
        dataString = dataString.replace(/\r?\n/g, "\n");
        var lines = dataString.split("\n");

        var label = "";
        var detail = "";
        var j = 0;
        var maxVert = 10;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            var parts = line.split("\t");
            if (parts.length == 2) {        // TODO: when ANY line has a tab?
                label = parts[0];
                detail = parts[1];
            } else {
                label = line;
                detail = line;
                if (line.length > 30) {
                    label = (i + 1) + "";
                }
            }
            if (label.length <= 0 && detail.length <= 0) {
                j++;        // leave space
            } else {
                var x = 40 + parseInt(j / maxVert) * 150;
                var y = 40 + (j % maxVert) * 50 + parseInt(j / maxVert) * 5;
                var id = 100 + j;
                var node = new GraphNode(id, [x, y], "#ccdddd", label, detail);
                this.newNodes.set(node.getID(), node);
                j++;
            }
        }
    }

    getNodes() {
        return this.newNodes;
    }
    getEdges() {
        return this.newEdges;
    }
}


// For later; can be cut off, together with the 2 JSZip in .html

class NewStuff extends NewStuffCore {
    constructor(controler) {
        super(controler);
    }

    canImport(ev) {
        ev.dataTransfer.dropEffect = "copy";
        if (ev.dataTransfer.types.indexOf("text/plain") >= 0) {
            ev.preventDefault();
            return true;
        }
        super.canImport(ev);
    }

    transferTransferable(ev) {
        var files = ev.dataTransfer.files;
        this.dropLocation = [ev.clientX, ev.clientY];
        var dataString = "";
        if (files.length > 0) {
            var l = files.length;
            if (l == 1) {
                var file = files[0];
                new IngestZip(file, this.controler);

            } else {
                new IngestFileList(files, this.controler);
            }
            return true;
        }
        if (ev.dataTransfer.types.indexOf("text/html") >= 0) {
            dataString = ev.dataTransfer.getData("text/html");      // not used for now
            var dataStringResort = ev.dataTransfer.getData("text/plain");
            new IngestItemList(dataStringResort, this.controler);
            return true;
        }
        if (ev.dataTransfer.types.indexOf("text/plain") >= 0) {
            dataString = ev.dataTransfer.getData("text/plain");
            new IngestXML(dataString, 1, this.controler);
            return true;
        } else {
            console.log("Nothing appropriate found");
            return false;
        }
    }

    getDropLocation() {
        var lastDrop = this.dropLocation;
        this.dropLocation = null;
        return lastDrop;
    }

    init() {    // still empty
    }
}

class IngestZip {
    // Brute force attempt to intercept some peculiarities contained in ZIP files
    constructor(file, controler) {
        this.controler = controler;

        var savedContent = "";
        var filelist = "";
        var entryCount = 0;
        // var file = ".\\tmp.zip"      // for files not just dragged in, we may need this & Utils
        var data = file;
        if (typeof (JSZip) == "undefined") {
            alert("Network down? 'JSZip' not found");
            new IngestXML(file, 2, controler);
            return;
        }

        // JSZipUtils.getBinaryContent(file, function (err, data) {
        //     if (err) {
        //         throw err; // or handle err
        //     }
        JSZip.loadAsync(data).then(function (zip) {
            zip.forEach(function (relativePath, zipEntry) {
                filelist += zipEntry.name + "\r\n";
                entryCount++;
            });
            zip.forEach(function (relativePath, zipEntry) {
                zipEntry.async("string").then(function (content) {
                    savedContent = content;
                    if (entryCount == 1) {
                        new IngestXML(savedContent, 1, controler);
                        // } else {
                        // new IngestFileList(filelist);    // in Java version but uninteresting
                    }
                });
            });
        }).catch(function (e) {
            // Important normal case, since Zip is autodetected by brute force
            
            new IngestXML(data, 2, controler);
        });
    };
    // });
}

class IngestFileList {
    constructor(files, controler) {     // Java version different (just filepaths)

        // Sort by date
        var array = [];
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            // Firefox (112) seems to omit date from dragged-in filelist
            array[i] = { id: file, date: file.lastModifiedDate };
        }
        const ascSort = array.sort((obj1, obj2) => obj1.date - obj2.date,);

        //	Process simple files (try to include some content)
        //	(The Java version tried at least to make filenames clickable)

        var promises = [];
        var output = "";
        for (var i = 0; i < ascSort.length; i++) {
            promises[i] = new Promise((resolve, reject) => {
                wrapPromise(resolve, ascSort[i].id);
            });
        }
        function wrapPromise(resolve, file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var content = e.target.result;
                resolve(content);
            };
            reader.readAsText(file);
        }
        Promise.all(promises).then((values) => {
            for (var i = 0; i < values.length; i++) {
                output += addContent(i, values[i]);
            }
            new IngestItemList(output, controler);
        });

        function addContent(i, contentString) {
            var filename = ascSort[i].id.name;
            contentString = contentString.replace(/\r?\n/g, "\n");
            contentString = contentString.replaceAll("\n", "<br />");

            // contentString = contentString.replace("\r", "<br />");
            // contentString = contentString.replaceAll("\r\n", "<br />");
            contentString = contentString.replace("\t", " (TAB) ");  // TODO improve
            var line = filename + "\t" + contentString;
            return line + "\r\n";
        }
    }
}


class IngestItemList {
    constructor(dataString, controler) {
        var splitIntoNew = new SplitIntoNew(dataString);
        this.newNodes = splitIntoNew.getNodes();
        this.newEdges = splitIntoNew.getEdges();
        new InsertMap(this.newNodes, this.newEdges, controler);
    }
}


class InsertMap {
    constructor(nodes, edges, controler) {
        this.controler = controler;
        this.newNodes = nodes;
        this.newEdges = edges;
        controler.triggerUpdate(this);
    }
    getNodes() {
        return this.newNodes;
    }
    getEdges() {
        return this.newEdges;
    }
}

class IntegrateNodes {
    newNodes = new Map;
    newEdges = new Map;
    nodes = new Map;
    edges = new Map;
    maxNodeID = 0;
    maxEdgeID = 0;

    constructor(nodes, edges, newNodes, newEdges) {
        this.nodes = nodes;
        this.edges = edges;
        this.newNodes = newNodes;
        this.newEdges = newEdges;

        // find max IDs
        this.nodes.forEach(node => {
            var id = node.getID();
            if (this.maxNodeID < id) this.maxNodeID = id; 
        });
        this.edges.forEach(edge => {
            var id = edge.getID();
            if (this.maxEdgeID < id) this.maxEdgeID = id; 
        });
    }

    mergeNodes(insertLocation, translation) {
        var newNodeID = this.maxNodeID;
        var newEdgeID = this.maxEdgeID;
        var newNodeIDs = new Map;

        this.newNodes.forEach(node => {
            newNodeID++;
            var oldTmpID = node.getID();
            newNodeIDs.set(oldTmpID, newNodeID);
            var id = newNodeID;
            var oldXY = node.getXY();
			var newXY = [oldXY[0] - translation[0] + insertLocation[0], 
						oldXY[1] - translation[1] + insertLocation[1]];
            var newNode = new GraphNode(
                id,
                newXY,
                node.getColor(),
                node.getLabel(),
                node.getDetail()
            );
            this.nodes.set(id, newNode);
        });
        this.newEdges.forEach(edge => {
            newEdgeID++;
            var n1 = edge.getN1();
            var n2 = edge.getN2();
            var node1 = this.nodes.get(newNodeIDs.get(n1));
            var node2 = this.nodes.get(newNodeIDs.get(n2));
            var id = newEdgeID;
            var newEdge = new GraphEdge(
                id,
                node1,
                node2,
                edge.getColor(),
                edge.getDetail()
            );
            this.edges.set(id, newEdge);
            node1.addEdge(newEdge);
            node2.addEdge(newEdge);
        });
    }

    getNodes() {
        return this.nodes;
    }

    getEdges() {
        return this.edges;
    }
}

class LifeCycle {

    setFilename(filename) {
        this.filename = filename;
        if (this.filename != "") {
            this.mainWindowTitle = (new Utilities).getShortname(this.filename) + " - Condensr";
            document.title = this.mainWindowTitle;
        }
    }
    getFilename() {
        return this.filename;
    }
    getMainWindowTitle() {
        return this.mainWindowTitle;
    }
}

class Utilities {
    getShortname(longFilename) {
        var shortName = longFilename.replace('\\', '/');
        if (shortName.endsWith("/")) shortName = shortName.substring(0, shortName.length() - 1);
        shortName = shortName.substring(shortName.lastIndexOf("/") + 1);
        return shortName;
    }
}

class PresentationWhiteboard extends PresentationService {
    // Quick and dirty replacement of the old proof-of-concept
    constructor(graphClass, newStuff) {
        super(graphClass, newStuff);
        this.channel = new whiteboard();
        var th = this;

        function whiteboard() {
            var channel;
            var wb = getUrlParameter('wb');
            if (!wb) {
                console.log("No wb parameter found.");
                return;
            }
            if (wb == "new") {
                location.search = (location.search == "new")
                    ? '&wb=' + getUniqueId() : 'wb=' + getUniqueId();
                return;
            }
            var pusher = new Pusher('4adbc41a101586f6da84', {	// change to your own values
                cluster: 'eu',
                forceTLS: true,
                authEndpoint: 'http://condensr.de/whiteboard/php/x28auth.php',  
                // authEndpoint: 'http://mmelcher.org/wp/whiteboard/php/x28auth.php',  
                // authEndpoint: 'http://localhost/wp/whiteboard/php/x28auth.php',
                auth: {
                    headers: {
                        'X-CSRF-Token': "SOME_CSRF_TOKEN"
                    }
                }
            });

            //		subscribe to the changes via Pusher
            channel = pusher.subscribe('private-' + wb);
            channel.bind('pusher:subscription_error', function (status) {
                alert("Subscription failed: " + status + ",\n" +
                    "Currently, you need to be logged in to wordpress at " +
                    location.host + ".\nEmail me or leave a comment to get a guest account.");
            });
            channel.bind('pusher:subscription_succeeded', function () {
                alert("Successfully subscribed.");
            });

            //		incoming event
            channel.bind('client-my-event', function (data) {
                var s = JSON.parse(data.publishNode);
                if (s.type == 'node') {
                    th.createNode(s.x, s.y, s.id, s.label, s.detail, s.rgb);
                } else {
                    var topic1 = th.nodes.get(s.n1);
                    var topic2 = th.nodes.get(s.n2);
                    if (!topic1 || !topic2) alert("Unknown item referenced.\nOut of sync?");
                    th.createEdge(topic1, topic2, true);
                    th.graphClass.draw();
                }
            });
            return channel;
        }

        // function to get a query param's value
        function getUrlParameter(name) {
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            var results = regex.exec(location.search);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        };

        // a unique random key generator
        function getUniqueId() {
            return Math.random().toString(36).substr(2, 9);
        }
    }

    createNode(x, y, incomingID, label, detail, rgb) {
        label = label || "";
        detail = detail || "";
        rgb = rgb || "#ccdddd";
        var newId = incomingID || uuidv4();
        x -= this.graphClass.translation[0];
        y -= this.graphClass.translation[1];
        var topic = new GraphNode(newId, [x, y], rgb, label, detail);
        this.nodes.set(newId, topic);
        this.graphClass.nodeSelected(topic);
        this.graphClass.draw();
        document.getElementById("labelField").focus();
        if (this.channel && !incomingID) {
            this.publishNode = {
                type: 'node', x: x, y: y, rgb: "#ccdddd",
                label: "", id: newId, detail: ""
            };
            this.wbPending = true;  // simulate old proof-of-concept which filled in a form for new nodes
        }
        function uuidv4() {	// by Stackoverflow user broofa
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    }

    createEdge(topic1, topic2, incoming) {
        var newId = this.newKey(this.edges);
        var assoc = new GraphEdge(newId, topic1, topic2, "#c0c0c0", "");
        assoc.setID(newId);
        this.edges.set(newId, assoc);
        topic1.addEdge(assoc);
        topic2.addEdge(assoc);
        if (this.channel && !incoming) {
            var n1 = topic1.getID();
            var n2 = topic2.getID();
            if (n1.length > 5 && n2.length > 5) {  // long uuid, i.e. for publishing
                var publishNode = { type: 'edge', n1: n1, n2: n2, rgb: '#c0c0c0' };
                var publishData = JSON.stringify(publishNode);
                this.channel.trigger('client-my-event', { "publishNode": publishData });
            }
        }
    }

    deselectNode(node) {
        super.deselectNode(node);
        if (this.wbPending) {
            this.publishNode.label = node.getLabel();
            this.publishNode.detail = node.getDetail();
            this.publishData = JSON.stringify(this.publishNode);
            this.channel.trigger('client-my-event', { "publishNode": this.publishData });
            this.wbPending = false;
        }
    }
}

function saveWarning() {
  return "warning";
}

new PresentationService(GraphPanel).initialize();   // the typical variant
// new PresentationWhiteboard(GraphPanel).initialize();
// new PresentationService(GraphPanel, NewStuffCore).initialize();
// new PresentationService(GraphCore).initialize();
// new PresentationCore(GraphPanel).initialize();
// new PresentationCore(GraphCore).initialize();
