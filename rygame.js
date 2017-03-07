//TODO ADD PROPER METHOD EXPLANATIONS IN PROPER FORMATTING

/**
 * Full screen the game.
 * Snippet taken from StackOverflow.
 */
function goFullScreen() {
	var canvas = GameManager.drawSurface.canvas;
	if (canvas.requestFullScreen) {
		canvas.requestFullScreen();
	}
	else if (canvas.webkitRequestFullScreen) {
		canvas.webkitRequestFullScreen();
	}
	else if (canvas.mozRequestFullScreen) {
		canvas.mozRequestFullScreen();
	}
}

//mouse code - Snippet taken from StackOverflow
var stylePaddingLeft = -1;
var stylePaddingTop = -1;
var styleBorderLeft = -1;
var styleBorderTop = -1;

// Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
// They will mess up mouse coordinates and this fixes that
var html;
var htmlTop = -1; 
var htmlLeft = -1;

//Creates an object with x and y defined,
//set to the mouse position relative to the state's canvas
//If you wanna be super-correct this can be tricky,
//we have to worry about padding and borders
//takes an event and a reference to the canvas
function getMouseDocument(e) {
	/*return {
	      x: e.clientX,
	      y: e.clientY
	    };*/
	var element = GameManager.drawSurface, offsetX = 0, offsetY = 0, mx, my;

	// Compute the total offset. It's possible to cache this if you want
	if (GameManager.drawSurface && element.offsetParent != undefined) { //TODO: appears to sometimes be a single frame where GameManager.drawSurface is not yet defined. look into a proper fix for this (maybe not depending on GameManager.drawSurface at all for the canvas?)
		do {
			offsetX += element.offsetLeft;
			offsetY += element.offsetTop;
		} while ((element = element.offsetParent));
	}

	// Add padding and border style widths to offset
	// Also add the <html> offsets in case there's a position:fixed bar (like the stumbleupon bar)
	// This part is not strictly necessary, it depends on your styling
	offsetX += stylePaddingLeft + styleBorderLeft + htmlLeft;
	offsetY += stylePaddingTop + styleBorderTop + htmlTop;

	mx = e.pageX - offsetX;
	my = e.pageY - offsetY;

	// We return a simple javascript object with x and y defined
	return {x: mx, y: my};
}
/*function getMouseCanvas(canvas, evt) { //this method is deprecated now. Requires the mouse to be hovering over the canvas to work. Otherwise, use getMouseDocument and subtract canvas topLeft. 
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }
*/
/**
 * Helper function to determine whether there is an intersection between the two polygons described
 * by the lists of vertices. Uses the Separating Axis Theorem
 *
 * @param {Array} a an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
 * @param {Array} b an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
 * @return true if there is any intersection between the 2 polygons, false otherwise
 */
function doPolygonsIntersect(a, b) {
    var polygons = [a, b];
    var minA, maxA, projected, i, i1, j, minB, maxB;

    for (i = 0; i < polygons.length; i++) {

        // for each polygon, look at each edge of the polygon, and determine if it separates
        // the two shapes
        var polygon = polygons[i];
        for (i1 = 0; i1 < polygon.length; i1++) {

            // grab 2 vertices to create an edge
            var i2 = (i1 + 1) % polygon.length;
            var p1 = polygon[i1];
            var p2 = polygon[i2];

            // find the line perpendicular to this edge
            var normal = { x: p2.y - p1.y, y: p1.x - p2.x };

            minA = maxA = undefined;
            // for each vertex in the first shape, project it onto the line perpendicular to the edge
            // and keep track of the min and max of these values
            for (j = 0; j < a.length; j++) {
                projected = normal.x * a[j].x + normal.y * a[j].y;
                if ((minA === undefined) || projected < minA) {
                    minA = projected;
                }
                if ((maxA === undefined) || projected > maxA) {
                    maxA = projected;
                }
            }

            // for each vertex in the second shape, project it onto the line perpendicular to the edge
            // and keep track of the min and max of these values
            minB = maxB = undefined;
            for (j = 0; j < b.length; j++) {
                projected = normal.x * b[j].x + normal.y * b[j].y;
                if ((minB === undefined) || projected < minB) {
                    minB = projected;
                }
                if ((maxB === undefined) || projected > maxB) {
                    maxB = projected;
                }
            }

            // if there is no overlap between the projects, the edge we are looking at separates the two
            // polygons, and we know there is no overlap
            if (maxA <= minB || maxB <= minA) { //TODO: changed from < to <= so that bordering objects would not be considered colliding
                //CONSOLE("polygons don't intersect!");
                return false;
            }
        }
    }
    return true;
}

function pnpoly(nvert, pointList, testx, testy) { //TODO: DETERMINE IF FIRST VERTEX MUST BE REPEATED AT THE END
  var c = false; //note that this method originally used a list of x coords and a list of y coords. changed to a single list of x,y coords to improve compatibility with the rest of the engine
  for (var i = 0, j = nvert-1; i < nvert; j = i++) { //TODO: THIS METHOD HAS BEEN MODIFIED AS DESCRIBED ABOVE. VERIFY THAT IT STILL WORKS AS INTENDED
    if ( ((pointList[i].y>testy) != (pointList[j].y>testy)) && (testx < (pointList[j].x-pointList[i].x) * (testy-pointList[i].y) / (pointList[j].y-pointList[i].y) + pointList[i].x) ) {
       c = !c;
    }
  }
  return c;
}

/**
 * Load an image.
 * @param   {String} imageSrc Path to the image, including the image name.
 * @returns {Object} <img> element.
 */
function loadImage(imageSrc) {
	var image = document.createElement("img");
	image.src = imageSrc;
	return image;
}

function binarySearch(a, x, key, leftMost, lo, hi) {
	/*Return the index where to insert item x in list a, assuming a is sorted.
	The return value i is such that all e in a[:i] have e <= x, and all e in
	a[i:] have e > x.  So if x already appears in the list, a.insert(x) will
	insert just after the rightmost x already there.

	Optional args lo (default 0) and hi (default len(a)) bound the
	slice of a to be searched.*/
	if (lo == null) { //appears to be no way to create optional args in javsascript, so manually assign a default value if it comes in as null, meaning it wasn't passed into the function call
		lo = 0;
	}
	else if (lo < 0) {
		throw "ERROR: lo must be non-negative";
	}
	if (leftMost == null) {
		leftMost = false;
	}
		
	if (hi == null) {
		hi = a.length;
	}
	if (key != null) {
		//x = x.__getattribute__(key)
		x = x[key]; 
	}
	if (leftMost) {
		while (lo < hi) {
			mid = ~~((lo+hi)/2);
			if (key == null) {
				value = a[mid];
			}
			else {
				value = a[mid][key]; 
			}
			if (x <= value) {
				hi = mid;
			}
			else {
				lo = mid+1;
			}
		}
	}
	else {
		while (lo < hi) {
			mid = ~~((lo+hi)/2);
			if (key == null) {
				value = a[mid];
			}
			else {
				value = a[mid][key]; 
			}
			if (x < value) {
				hi = mid;
			}
			else {
				lo = mid+1;
			}
		}
	}
	
	return lo;
}

function createContext(width, height,is3d) {
    var canvas = document.createElement("canvas");
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    if (!is3d) {
    	return canvas.getContext('2d');
    }
    return canvas.getContext('3d');
}

function rotateImage(image) {
	//TODO
}

function calculateRectPoints(object,includeTouching) {
	//var objects = [object1,object2];
	var pointList = [{},{},{},{}];
	//for (var objectNum = 0; objectNum < 2; objectNum++) {
	var halfWidth = object.rect.width / 2;
	var halfHeight = object.rect.height / 2;
	if (includeTouching == true) { //&& objectNum == 0) {
		halfWidth += 0.01;
		halfHeight += 0.01;
	}
	var cos = Math.cos(object.drawAngle);
	var sin = Math.sin(object.drawAngle);
	var centerX = object.centerX();
	var centerY = object.centerY();
	for (var sign1 = -1; sign1 < 2; sign1+=2) {
		for (var sign2 = -1; sign2 < 2; sign2+=2) {
			//TODO: VERIFY THAT THIS CANNOT LOCKUP. IT SHOULDN'T, BUT A BUG EARLIER WHICH APPEARED TO HAVE BEEN CAUSED BY REPEATED METHOD CALLS AND NOT INVALID ARGUMENTS STILL LEFT ME A BIT UNEASY REGARDLESS
			pointList[(sign1+1) + ((sign2+1)/2)].x = centerX + sign1*halfWidth * cos - sign2*halfHeight * sin;
			pointList[(sign1+1) + ((sign2+1)/2)].y = centerY + sign1*halfWidth * sin + sign2*halfHeight * cos;
		}
	}
	//swap indices 2 and 3 so that the points are ordered in a way that properly borders the object
	pointList[2] = pointList.splice(3, 1, pointList[2])[0];
	//}
	return pointList;
}
function collisionRect(object1,object2,includeTouching) { //TODO THE FIRST PART OF WHAT WILL EVENTUALLY MAKEUP THE RYGAME COLLISION METHOD COLLECTION
	//TODO DECIDE WHETHER THESE METHODS SHOULD BE BY THEMSELVES LIKE THIS ONE OR ENCAPSULATED INSIDE THE RECT CLASS OR SOME SORT OF COLLISION CLASS
	//TODO DECIDE WHETHER RECTS EVEN NEED TO EXIST IF ALL THEY APPEAR TO HOLD (AT LEAST AT THE MOMENT) IS WIDTH/HEIGHT/OFFSET. THEYRE CONVENIENT AT LEAST IF JUST FOR THE PURPOSE OF ORGANIZATION
	//object1; the primary collision object
	//object2; the second collisino object
	//object1.updateRect();
	//object2.updateRect();
	if (object1.drawAngle == 0 && object2.drawAngle == 0) { //TODO: OPTIMIZE TO USE THIS QUICKER CHECK WHEN DRAWANGLE IS ANY OF THE 4 CARDINAL DIRECTIONS
		var objects = [object1,object2];
		var objectCoordinates = [{},{}];
		for (var i = 0; i < 2; i++) {
			objectCoordinates[i].left = objects[i].x;
			objectCoordinates[i].top = objects[i].y;
			objectCoordinates[i].right = objects[i].x + objects[i].rect.width;
			objectCoordinates[i].bottom = objects[i].y + objects[i].rect.height;
			if (includeTouching == true && i == 0) {
				objectCoordinates[i].left -= .01;
				objectCoordinates[i].top -= .01;
				objectCoordinates[i].right += .01;
				objectCoordinates[i].bottom += .01;
			}
		}
		return !((objectCoordinates[0].left >= objectCoordinates[1].right)||(objectCoordinates[0].top >= objectCoordinates[1].bottom)||(objectCoordinates[0].right <= objectCoordinates[1].left)||(objectCoordinates[0].bottom <= objectCoordinates[1].top)); //TODO: changed from < and > to <= and >= so that bordering objects would not be considered colliding
	}
	else {
		//since rotation is centered, we have to go from the center and move in the direction of drawAngle * width and the direction perpendicular to drawAngle * height to find corners
		//TODO: OPTIMIZE THIS TO USE RECT COLLISIONS WHEN DRAWANGLE IS 90 OR 270 AS WELL, JUST WITH HEIGHT AND WIDTH SWITCHED
		//TODO: OPTIMIZE THIS BY STORING THE CORNERS OF THE MOST RECENT ROTATED RECT RATHER THAN RECALCULATING THEM REPEATEDLY
		//TODO: OPTIMIZE THIS BY CHANGING THE FUNCTION TO MAKE OPTIMIZATIONS BY ONLY WORKING FOR RECTANGLES RATHER THAN N SIDED POLYGONS
		pointList1 = calculateRectPoints(object1,includeTouching);
		pointList2 = calculateRectPoints(object2,includeTouching);
		//console.log(pointLists);
		return doPolygonsIntersect(pointList1,pointList2);
	}
}

function collisionPoint(x,y,object,adjustForCamera,includeTouching) {
	var pointList = calculateRectPoints(object,includeTouching);
	var newX = x;
	var newY = y;
	if (adjustForCamera == true) {
		newX += object.drawLayer.cameraX;
		newY += object.drawLayer.cameraY;
	}
	return pnpoly(pointList.length,pointList,newX,newY);
}

function getAngle(x1,y1,x2,y2,radians) { //TODO: VERIFY THAT THIS METHOD WORKS CORRECTLY
	if (radians == null || radians == false) {
		return Math.atan2((y2-y1),(x2-x1))*180/Math.PI;
	}
	return Math.atan2((y2-y1),(x2-x1));
}
function getDistance(x1,y1,x2,y2) {
	return Math.sqrt(((x2-x1)*(x2-x1))+((y2-y1)*(y2-y1)));
}
function randomInt(min,max) {//TODO: max appears to be inclusive. needs testing.
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function makeChild(objectName, parentName) {
	//objectName: the name of the object being given inheritance
	//parentName: the name of the parent object
	eval(objectName + ".prototype = Object.create(" + parentName + ".prototype);" + objectName + ".prototype.constructor = " + objectName + ";");
}

GameManagerInternal.prototype.drawText = function(text,x,y,centerX,centerY) {
	var halfWidth = 0;
	var halfHeight = 0;
	if (centerX == true) {
		halfWidth = this.drawSurface.measureText(text).width/2; //TODO: DECIDE HOW ROUNDING SHOULD BE PERFORMED IN THIS INSTANCE
	}
	if (centerY == true) {
		halfHeight = parseInt(this.drawSurface.font) / 2; //TODO: VERIFY THAT THIS GIVES THE CORRECT HEIGHT VALUE IN ALL CASES
	}
	this.drawSurface.fillText(text,x-halfWidth,y+halfHeight);
};

GameManagerInternal.prototype.setFontSize = function(size) {
	this.fontSize = size;
	this.setFont();
};
GameManagerInternal.prototype.setFontName = function(name) {
	this.fontName = name;
	this.setFont();
};
GameManagerInternal.prototype.setFont = function() {
	this.drawSurface.font = this.fontSize + "px " + this.fontName;
};

GameManagerInternal.prototype.initializeRygame = function(is3d) {    //FIND A WAY TO MAKE IT POSSIBLE TO HAVE GameManagerInternal BE STATIC BUT ALSO EXTENDABLE
	//create context
	if (!is3d) {
		this.drawSurface = document.getElementById('canvas').getContext('2d');
	}
	else {
		this.drawSurface = document.getElementById('canvas').getContext('3d');
	}
	//mouse code (this snippet is taken from a stackOverflow answer)
	stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
	stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
	styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
	styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
	
	html = document.body.parentNode;
	htmlTop = html.offsetTop;
	htmlLeft = html.offsetLeft;
	
	this.screenWidth = this.drawSurface.canvas.width;
	this.screenHeight = this.drawSurface.canvas.height;
	
	//init key events
	document.body.addEventListener("keydown", function (e) {
		GameManager.keyStates[String.fromCharCode(e.keyCode)] = true;
		if (String.fromCharCode(e.keyCode) == GameManager.fullScreenKey) { //fullScreenKey is a property that must be set in the game itself rather than being hardcoded, as that would prevent the programmer from being able to use a key that they might need
			goFullScreen();
		}
	});
	document.body.addEventListener("keyup", function (e) {
		GameManager.keyStates[String.fromCharCode(e.keyCode)] = false;
	});
	document.body.addEventListener("mousemove", function (e) {
		if (GameManager.drawSurface == null) {
			return;
		}
		//GameManager.documentMousePos = getMouseDocument(e);
		//GameManager.mousePos = GameManager.documentMousePos;
		GameManager.mousePos = getMouseDocument(e);
		canvasRect = GameManager.drawSurface.canvas.getBoundingClientRect();
		GameManager.mousePos.x -= canvasRect.left + window.pageXOffset; //might need to take into account other factors besides the page scrolling
		GameManager.mousePos.y -= canvasRect.top + window.pageYOffset;
	});
	document.body.addEventListener("mousedown", function (e) {
		//console.log("MOUSE DOWN");
		if (e.button == 0) { //left click detected
			GameManager.mouseDownLeft = true;
			GameManager.mousePressedLeft = true;
			GameManager.mousePressedRight = true;
		}
		else if (e.button == 2) { //right click detected
			GameManager.mouseDownRight = true;
		}
	});
	document.body.addEventListener("mouseup", function (e) {
		//console.log("MOUSE UP");
		if (e.button == 0) {
			GameManager.mouseReleasedLeft = true;
			GameManager.mouseReleasedPosLeft = getMouseDocument(e); //we can use the same method as in mousemove to get the effective mouse position since the mouse coordinates are returned by the event in pageX and pageY regardless of the event type
			canvasRect = GameManager.drawSurface.canvas.getBoundingClientRect();
			GameManager.mouseReleasedPosLeft.x -= canvasRect.left + window.pageXOffset; //might need to take into account other factors besides the page scrolling
			GameManager.mouseReleasedPosLeft.y -= canvasRect.top + window.pageYOffset;
			GameManager.mouseDownLeft = false; //left click detected
		}
		else if (e.button == 2) {
			GameManager.mouseReleasedRight = true;
			GameManager.mouseReleasedPosRight = getMouseDocument(e); //we can use the same method as in mousemove to get the effective mouse position since the mouse coordinates are returned by the event in pageX and pageY regardless of the event type
			canvasRect = GameManager.drawSurface.canvas.getBoundingClientRect();
			GameManager.mouseReleasedPosRight.x -= canvasRect.left + window.pageXOffset; //might need to take into account other factors besides the page scrolling
			GameManager.mouseReleasedPosRight.y -= canvasRect.top + window.pageYOffset;
			GameManager.mouseDownRight = false; //right click detected
		}
	});
	document.body.addEventListener('contextmenu', function(e) {
	    e.preventDefault(); //note: according to stackOverflow, we should be returning false at the end of this method, as well as outside the method, to cause the rightclick menu to not popup. However, i have not observed either false statement to be necessary. Keep an eye on this.
	});
};
GameManagerInternal.prototype.addObject = function(object) { //TODO still need to decide on adding single objects vs lists of objects natively
	this.renderOrderedCompleteObjectList.splice(binarySearch(this.renderOrderedCompleteObjectList,object,"drawDepth"),0,object);
	this.updateOrderedCompleteObjectList.splice(binarySearch(this.updateOrderedCompleteObjectList,object,"updateDepth"),0,object); 
};
GameManagerInternal.prototype.removeObject = function(object) { //TODO still need to decide on adding single objects vs lists of objects natively
	this.renderOrderedCompleteObjectList.splice(this.renderOrderedCompleteObjectList.indexOf(object),1); 
	this.updateOrderedCompleteObjectList.splice(this.updateOrderedCompleteObjectList.indexOf(object),1); 	
};
GameManagerInternal.prototype.addLayer = function(layer) {
	this.completeLayerList.splice(binarySearch(this.completeLayerList,layer,"drawDepth"),0,layer); 
};
GameManagerInternal.prototype.updateObjects = function() {
	for (var i = 0; i < this.updateOrderedCompleteObjectList.length; i++) {
		this.updateOrderedCompleteObjectList[i].xPrevious = this.updateOrderedCompleteObjectList[i].x; //TODO: DECIDE IF THE PREVIOUS POSITION VARIABLES SHOULD BE UPDATED BEFORE OR AFTER THE UPDATE METHOD
		this.updateOrderedCompleteObjectList[i].yPrevious = this.updateOrderedCompleteObjectList[i].y;
		if (typeof this.updateOrderedCompleteObjectList[i].update == "function" && this.updateOrderedCompleteObjectList[i].updateAutomatically) {
			this.updateOrderedCompleteObjectList[i].attemptUpdate(); 
		}
	}
};
//due to differences between javascript and pygame initializeFrame and updateInput are no longer necessary methods for the GameManagerInternal
GameManagerInternal.prototype.drawFrame = function() { 
	/*renders all objects to their frames, and then draws frames to screen. Objects with larger depths have their surfaces drawn first on their frame.
	returns 0 if successful, else 1*/
	//re-render all layer backgrounds first. also clears their surfaces for a fresh frame if the background fills the layer surface
	for (var i = this.completeLayerList.length-1; i >= 0; i--) {
		var layer = this.completeLayerList[i];
		if (layer.active && (!layer.frozen)) {
			if (layer.background == null) {
				layer.drawSurface.clearRect(0, 0, layer.width, layer.height);
			}
			else {
				layer.drawSurface.drawImage(layer.background.canvas,0,0);
			}
		}
	}
		
	//render objects to frames first (objects are sorted by depth when added, so no need to do any sorting here)
	for (var i = this.renderOrderedCompleteObjectList.length-1; i >= 0; i--) {
		var drawObject = this.renderOrderedCompleteObjectList[i];
		if (drawObject.renderAutomatically && drawObject.drawLayer.active && (!drawObject.drawLayer.frozen)) {
			drawObject.render();
		}
	}
	
	for (var i = this.renderOrderedCompleteObjectList.length-1; i >= 0; i--) {
		var drawGuiObject = this.renderOrderedCompleteObjectList[i];
		if (drawGuiObject.drawLayer.active && (! drawGuiObject.drawLayer.frozen)) {
			drawGuiObject.renderGuiElements();
		}
	}

	//TODO expand on the below code to reimplement layer resizing (this will probably work a bit differently from how it works in pygame)
	for (var i = this.completeLayerList.length-1; i >= 0; i--) {
		var layer = this.completeLayerList[i];
		if (layer.active == true) {
			this.drawSurface.drawImage(layer.drawSurface.canvas,layer.x,layer.y); //REIMPLEMENT LAYER RESIZING HERE
			if (layer.freezeFirstFrame) {
				layer.freezeFirstFrame = False;
				layer.frozen = True;
			}
		}
	}
	
	this.mouseReleasedLeft = false;
	this.mouseReleasedRight = false;
	this.mousePressedLeft = false;
	this.mousePressedRight = false;
};

GameManagerInternal.prototype.draw = function(surface, x, y) { //simple draw function. Copied from Layer so that the GameManager can be treated like a layer when necessary.
	this.drawSurface.drawImage(surface.canvas,x,y);
};

function GameManagerInternal() {
	this.images = []; //list of resources
	this.sounds = []; //list of resources
	this.scriptObjects = []; //list of resources
	this.fps = 40;
	this.keyStates = [];
	this.completeLayerList = [];
	this.renderOrderedCompleteObjectList = [];
	this.updateOrderedCompleteObjectList = [];
	this.drawSurface = null;
	this.screenWidth = null;
	this.screenHeight = null;
	//this.documentMousePos = {x: 1, y: 1};
	this.mousePos = {x: 1, y: 1};
	this.mouseDownLeft = false;
	this.mouseDownRight = false;
	this.mousePressedLeft = false; //this variable is only true on the frame when the mouse is initially pressed duringa click. reset to false after drawFrame is called.
	this.mousePressedRight = false;
	this.mouseReleasedLeft = false; //this variable is only true on the frame when the mouse is released from a click. reset to false after drawFrame is called.
	this.mouseReleasedRight = false;
	this.mouseReleasedPosLeft = {x: 1, y: 1};
	this.mouseReleasedPosRight = {x: 1, y: 1};
	this.fullScreenKey = "F"; //this is just a default; feel free to change it at any point from the game file
	this.fontSize = 48; //font size in pixels - first part of html font property (formatted 'fontSizepx fontName')
	this.fontName = "Arial"; //font name - second part of html font property (formatted 'fontSizepx fontName')
}

//create GameManager instance in global namespace to make up for a lack of typical 'static' classes *that support inheritance*
GameManager = new GameManagerInternal();

ObjectGroup.prototype.push = function(appendObjectList) {
	appendObjectList = [].concat(appendObjectList); //TODO: CONSIDER THE PERFORMANCE impact OF CALLING CONCAT HERE
	for (var i = 0; i < appendObjectList.length; i++) {
		this.objectList.push(appendObjectList[i]);
		appendObjectList[i].groupsContained.push(this);
	}
};
ObjectGroup.prototype.pop = function() {
	var removeObject = this.objectList.pop();
	removeObject.groupsContained.splice(removeObject.groupsContained.indexOf(this),1);
	return removeObject;
};
ObjectGroup.prototype.remove = function(removeObjectList) { //arbitrary removal as opposed to simply calling pop
	removeObjectList = [].concat(removeObjectList); //TODO: CONSIDER THE PERFORMANCE DETRIMENT OF CALLING CONCAT HERE
	for (var i = 0; i < removeObjectList.length; i++) {
		var position = this.objectList.indexOf(removeObjectList[i]);
		if (position != -1) { 
			removeObject = this.objectList[position];
			this.objectList.splice(position,1);
			removeObject.groupsContained.splice(removeObject.groupsContained.indexOf(this),1);
		}
	}
};
ObjectGroup.prototype.removeAll = function(kill) {
	var curObject;
	if (kill == null) {
		kill = false;
	}
	while (this.objectList.length > 0) {
		curObject = this.pop();
		if (kill) {
			curObject.die();
		}
	}
};

ObjectGroup.prototype.update = function(optionalArgs) {
	for (var i = 0; i < this.objectList.length; ++i) {
		this.objectList[i].attemptUpdate(optionalArgs);
	}
};

function ObjectGroup() {
	this.objectList = [];
}

makeChild("Layer","RygameObject"); //TODO: MAKE THE LAYER CLASS MORE SIMILAR TO THE RYGAMEOBJECT CLASS AND CALL THE RYGAMEOBJECT CONSTRUCTOR
Layer.prototype.draw = function(surface, x, y) { //NEED TO CHANGE ALL IMAGES / DRAWSURFACES TO CANVAS' SO THEY CAN DRAW ON EACH OTHER
	this.drawSurface.drawImage(surface.canvas,x,y); //change to drawSurface
};

function Layer(x,y,updateDepth,drawDepth,width,height,startActive) { //BECAUSE CANVASES AND IMAGES WORK DIFFERENT IN HTML5 COMPARED TO PYGAME, WE MAY NO LONGER NEED TO USE A BLANK BACKGROUND TO CLEAR EACH LAYER EVERY FRAME IF THEY AUTOCLEAR IN HTML5
	this.x = x; //TODO: CHANGE LAYER TO USE A RECT FOR ITS DIMENSIONS INSTEAD OF WIDTH AND HEIGHT, LIKE RYGAMEOBJECT
	this.y = y;
	this.width = width;
	this.height = height;
	this.updateDepth = updateDepth;
	this.drawDepth = drawDepth;
	//this.drawSurface = new Canvas
	this.drawSurface = createContext(this.width,this.height,false);
	//this.drawSurface.
	this.active = false;
	if (startActive == true) {
		this.active = true; //TO FILL IN LATER, AS IS THE CASE WITH MANY FIELDS RIGHT NOW
	}
	this.frozen = false; //TO FILL IN LATER
	this.freezeFirstFrame = false; //TO FILL IN LATER
	this.background = null;
	this.cameraX = 0;
	this.cameraY = 0;
	this.drawAngle = 0;
	this.rect = new Rect(this.drawSurface.canvas.width,this.drawSurface.canvas.height); 
	//this.background = createContext(this.width,this.height);
	//this.background.fillRect(0, 0, this.width, this.height); //unlike pygame HTML5 HAS A CLEARRECT METHOD, SO WE DON'T NEED A BACKGROUND UNLESS SPECIFIED AT LAYER CREATION
	GameManager.addLayer(this);
}

function Rect(width,height) { //TODO add xOffset and yOffset variables since rect no longer contains its own position information (no need for it to if we simply pass RygameObjects into collision functions rather than rects)
	this.width = width;
	this.height = height;
}

makeChild("Button","RygameObject");
Button.prototype.update = function(selectionType,openMenu) {
	if (openMenu == null) {
		openMenu = "";
	}
	if (this.selectionTypeBound != null) {
		if (this.selectionTypeBound.indexOf(selectionType) == -1) {
			if (!(this.selectionTypeBound.length == 0 && (selectionType != null || openMenu != ""))) {
				this.visible = false;
				return;
			}
		}
	}	
	if (this.openMenuBound != null) {
		if (this.openMenuBound.indexOf(openMenu) == -1) {
			if (!(this.openMenuBound.length == 0 && (selectionType != null || openMenu != ""))) {
				this.visible = false;
				return;
			}
		}
	}	
	this.visible = true;
	this.releasedThisFrame = false;
	
	this.drawSurface = this.normalSurface;
	
	//if this button is not currently interactive, don't need to update anything else
	if (!this.clickable) {
		return;
	}
	
	if (GameManager.mousePressedLeft == true) {
		this.mouseDownOnButton = false;
		if (collisionPoint(GameManager.mousePos.x,GameManager.mousePos.y,this,this.affectedByCamera)) {
			this.mouseDownOnButton = true;
		}
	}
	
	else if (GameManager.mouseReleasedLeft == true) {
		if (this.mouseDownOnButton == true) {
			if (collisionPoint(GameManager.mousePos.x,GameManager.mousePos.y,this,this.affectedByCamera)) {
				if (this.runMethod != null) {
					this.runMethod.apply(this,this.optionalArgs);//button has been clicked
				}
				this.releasedThisFrame = true;
			}
		}
		this.mouseDownOnButton = false;
	}
	
	if (collisionPoint(GameManager.mousePos.x,GameManager.mousePos.y,this,this.affectedByCamera)) {
		if (this.mouseDownOnButton) {
			this.drawSurface = this.darkenedSurface;
		}
		else {
			this.drawSurface = this.brightenedSurface;
		}
	}
	
};

Button.prototype.updateText = function(newText,clearFirst) {
	var brightnessShiftPercent = 25;
	if (clearFirst == null) {
		clearFirst = true;
	}
	if (clearFirst && this.drawSurface != null) {
		this.drawSurface.clearRect(0,0,this.drawSurface.canvas.width,this.drawSurface.canvas.height);
	}
	
	//create brightened and darkened version of drawSurface
	this.normalSurface = this.drawSurface;
	this.brightenedSurface = this.drawSurface == null ? null : this.image == null ? createContext(this.normalSurface.canvas.width,this.normalSurface.canvas.height) : updateBrightness(this.normalSurface,brightnessShiftPercent);
	this.darkenedSurface = this.drawSurface == null ? null : this.image == null ? createContext(this.normalSurface.canvas.width,this.normalSurface.canvas.height) : updateBrightness(this.normalSurface,-brightnessShiftPercent);

	this.text = newText;
	if (this.text != "") {
		var changedDims = false;
		if (this.drawSurface == null) {
			this.drawSurface = createContext(0,0,false); 
			this.normalSurface = this.drawSurface;
			this.brightenedSurface = createContext(0,0,false); 
			this.darkenedSurface = createContext(0,0,false); 
		}
		var drawSurfaces = [this.darkenedSurface,this.normalSurface,this.brightenedSurface]; 
		var baseR = this.textColor[0];
		var baseG = this.textColor[1];
		var baseB = this.textColor[2];
		for (var i = 0; i < 3; ++i) {
			
			drawSurfaces[i].font = "32px " + GameManager.fontName;
			
			var height = parseInt(drawSurfaces[i].font.split(' ')[0].replace('px', '')); //TODO: verify that text height is indeed equal to font name 
			textDims = drawSurfaces[i].measureText(this.text);
			if (textDims.width > drawSurfaces[i].canvas.width) {
				drawSurfaces[i].canvas.width = textDims.width;
				this.rect.width = drawSurfaces[i].canvas.width;
				changedDims = true;
			}
			if (height > drawSurfaces[i].canvas.height) { //TODO: height here may be an overestimate as it includes space below the text; replace this with render height eventually
				drawSurfaces[i].canvas.height = height;
				this.rect.height = drawSurfaces[i].canvas.height;
				changedDims = true;
			}
			if (changedDims && this.image != null) {
				drawSurfaces[i].clearRect(0,0,drawSurfaces[i].canvas.width,drawSurfaces[i].canvas.height);
				drawSurfaces[i].drawImage(this.image,0,0);
				updateBrightness(drawSurfaces[i],brightnessShiftPercent,true);
				
			}
			
			drawSurfaces[i].textBaseline="hanging";
			drawSurfaces[i].font = "32px " + GameManager.fontName;
			//todo: convert to HSV, adjust brightness, then convert back to RGB, rather than just statically shifting R,G,B channels
			drawSurfaces[i].fillStyle = (i == 0 ? "rgb(" + Math.round(Math.max(baseR - brightnessShiftPercent*.01*255,0)) + ","+ Math.round(Math.max(baseG - brightnessShiftPercent*.01*255,0)) + ","+ Math.round(Math.max(baseB - brightnessShiftPercent*.01*255,0)) + ")"
			: ( i == 1 ? "rgb(" + baseR + "," + baseG + "," + baseB + ")" : "rgb(" + Math.round(Math.min(baseR + brightnessShiftPercent*.01*255,255)) + ","+ Math.round(Math.min(baseG + brightnessShiftPercent*.01*255,255)) + ","+ Math.round(Math.min(baseB + brightnessShiftPercent*.01*255,255)) + ")"));
			drawSurfaces[i].fillText(this.text,0,0);
			//console.log(drawSurfaces[i].fillStyle);
		}
	}
};

function Button(x,y,updateDepth,drawDepth,image,layer,text,runMethod,affectedByCamera,renderAutomatically,selectionTypeBound,openMenuBound,optionalArgs,clickable,updateAutomatically,textColor) { //TODO: MODIFY BUTTON CLASS TO OPERATE LARGELY THE SAME AS THE RYGAME PYTHON EDITION BUTTON CLASS
	if (updateAutomatically == null) {
		updateAutomatically = false; //default to false rather than true for now, as current buttons expect this functionality
	}
	RygameObject.call(this,x,y,updateDepth,drawDepth,image,layer,affectedByCamera,renderAutomatically,updateAutomatically);
	this.runMethod = runMethod;
	this.mouseDownOnButton = false;
	this.releasedThisFrame = false;
	this.selectionTypeBound = selectionTypeBound;
	this.openMenuBound = openMenuBound;
	this.optionalArgs = optionalArgs;
	this.clickable = (clickable == null ? true : clickable);
	this.textColor = (textColor == null ? [0,245,0] : textColor); //set default text color to an almost pure green
	if (this.optionalArgs == null) {
		this.optionalArgs = [];
	}	
	this.updateText(text,false);
}

RygameObject.prototype.updatePosition = function(x, y) { //TODO we will keep this method for now but it should be made obslete in the long run as now that we havew complete control over collisions theres no need to update rect positions until a rygame collision function is called
	//x: the new x position for the object
	//y: the new y position for the object
	//console.log("old x: " + this.x + " old y: " + this.y);
	this.x = x;
	this.y = y;
	//console.log("new x: " + x + " new y: " + y);
};
RygameObject.prototype.renderGuiElements = function(destLayer) { //TODO FILL THIS IN WHEN GUI ELEMENTS ARE REIMPLEMENTED
	
};
RygameObject.prototype.centerX = function() {
	//TODO: SHOULD THIS GO IN RECT OR RYGAMEOBJECT?! ITS DIFFICULT TO DETERMINE WHAT BELONGS IN THE NEW RECT CLASS..
	return this.x + (this.rect.width / 2);
};
RygameObject.prototype.centerY = function() {
	return this.y + (this.rect.height / 2);
};
RygameObject.prototype.setCenterX = function(x) {
	this.x = x - (this.rect.width / 2); //note that this does NOT have to return a rounded value! this of course would cause rounding errors which can accumulate very quickly or throw off small values tremendously
};
RygameObject.prototype.setCenterY = function(y) {
	this.y = y - (this.rect.height / 2);
};
RygameObject.prototype.render = function(destLayer) {
	if (this.visible) {
		if (destLayer == null) {
			destLayer = this.drawLayer;
		}
		if (this.drawSurface != null) {
			if (this.affectedByCamera == true) {
				this.x-=destLayer.cameraX; //move in the opposite direction of the layer camera before rendering (and deciding whether or not you're onscreen). this should be done for gui elements as well in renderGuiElements
				this.y-=destLayer.cameraY;
			}
			if (this.withinLayerBounds()) {
				if (this.drawAngle == 0) {
					destLayer.draw(this.drawSurface, this.x,this.y);
				}
				else {
					destLayer.drawSurface.save();
					destLayer.drawSurface.translate(this.centerX(),this.centerY());
					destLayer.drawSurface.rotate(this.drawAngle); 
					destLayer.draw(this.drawSurface, -(this.centerX() - this.x),-(this.centerY() - this.y));
					destLayer.drawSurface.restore();
				}
			}
			if (this.affectedByCamera == true) {
				this.x+=destLayer.cameraX; //move back once you're finished rendering.
				this.y+=destLayer.cameraY;
			}
		}
	}
};

RygameObject.prototype.withinLayerBounds = function() {
	/*check if x and y values are within the boundaries of object's drawLayer's surface.*/
	/*var rectWidth = 0;
	var rectHeight = 0;
	//if (this.rect != null) {
	rectWidth = this.rect.width;
	rectHeight = this.rect.height;
	//} //changed this method to call collisionRect rather then reimplementing collisions manually (that was just a temporary hack)
	//TODO in performing the above change also give the layer class a rect for collision purposes
	//TODO consider changing the way widths and heights are stored for image like classes entirely (especially Layer) since certain information is superfluous when contained in instance variables if the rect already has that informatino
	if ((this.x >= this.drawLayer.width) || (this.y >= this.drawLayer.height) || (this.x + rectWidth < 0) || (this.y + rectHeight < 0)) {
		return false;
	}
	return true;*/
	return collisionRect(this,this.drawLayer);
};
RygameObject.prototype.rotateAroundPoint = function(x,y,angleRadians,angleDifferenceRadians) {
	if (angleDifferenceRadians == null) {
		angleDifferenceRadians = 0;
	}
	var moveDistance = getDistance(this.centerX(),this.centerY(),x,y);
	this.setCenterX(x);
	this.setCenterY(y); //TODO: ADD THE OPTION TO USE EITHER RADIANS OR DEGREES
	this.drawAngle = angleRadians+angleDifferenceRadians;
	this.moveDirection(angleRadians / Math.PI * 180, moveDistance);
};
RygameObject.prototype.changeImage = function(imageName,clearRect) { //TODO: add dynamic drawSurface and rect resizing to match image changes
	this.image = GameManager.images[imageName];
	if (clearRect) {
		this.drawSurface.clearRect(0, 0, this.rect.width, this.rect.height);
	}
	this.drawSurface.drawImage(this.image,0,0);
};

RygameObject.prototype.moveTowardsPoint = function(x,y,speed,center) {
	if (center == null) {
		center = false;
	}
	if (center == true) {
		this.x += this.rect.width / 2;
		this.y += this.rect.height / 2;
	}
	if (getDistance(this.x,this.y,x,y) <= speed) {
		if (center == true) {
			this.setCenterX(x);
			this.setCenterY(y);
		}
		else {
			this.x = x;
			this.y = y;
		}
		return true;
	}
	this.moveDirection(getAngle(this.x,this.y,x,y),speed);
	if (center == true) {
		this.x -= this.rect.width / 2;
		this.y -= this.rect.height / 2;
	}
	return false;
	
};
RygameObject.prototype.moveDirection = function(angleDegrees,amount) {  //TODO: VERIFY THAT THIS METHOD WORKS CORRECTLY
	this.x += amount * Math.cos(angleDegrees * Math.PI / 180);
    this.y += amount * Math.sin(angleDegrees * Math.PI / 180);
};
RygameObject.prototype.moveOutsideCollision = function(otherObject,xPrevious,yPrevious) { //TODO: MAKE THIS SUPPORT ALL COLLISION TYPES INSTEAD OF JUST RECT COLLISION
	var angle;
	if (xPrevious == this.x && yPrevious == this.y) { //TODO: VERIFY THAT THIS IS ALWAYS THE BEST THING TO DO 
		angle = 180 + this.drawAngle/Math.PI*180; //if there was no movement since last frame we just move backwards from where we're facing instead
	}
	else {
		angle = getAngle(this.x,this.y,xPrevious,yPrevious); //TODO: VERIFY THAT THIS METHOD WORKS CORRECTLY
	}
	while (collisionRect(this,otherObject)) { //TODO: CHANGED FROM A DO-WHILE LOOP TO A WHILE LOOP. VERIFY THAT THIS STILL WORKS AS INTENDED
		this.moveDirection(angle,1);
	}
	while (!collisionRect(this,otherObject)) { //TODO: CHANGED FROM A DO-WHILE LOOP TO A WHILE LOOP. VERIFY THAT THIS STILL WORKS AS INTENDED
		this.moveDirection(180 + angle,.1);
	}
	while (collisionRect(this,otherObject)) { //TODO: CHANGED FROM A DO-WHILE LOOP TO A WHILE LOOP. VERIFY THAT THIS STILL WORKS AS INTENDED
		this.moveDirection(angle,.01);
	}
};	
/*RygameObject.prototype.update = function() { //to be overwritten by the object if it needs to do something each frame
	return; //
};*/
RygameObject.prototype.addGroupContained = function(group) { 
	this.groupsContained.push(group);
};
RygameObject.prototype.die = function() { 
	while (this.groupsContained.length > 0) {
		this.groupsContained[0].remove(this);
	}
	while (this.groupsOwned.length > 0) {
		var curObject = this.groupsOwned[0];
		this.groupsOwned.shift();
		curObject.die();
	}
	GameManager.removeObject(this);
	this.dead = true;
};

RygameObject.prototype.attemptUpdate = function(optionalArgs) {
	if (this.drawLayer.active && (!this.drawLayer.frozen)) {
		this.update.apply(this,optionalArgs);
	}
};

function RygameObject(x,y,updateDepth,drawDepth,image,layer,affectedByCamera,renderAutomatically,updateAutomatically) {
	//x: the starting x position of the object
	//y: the starting y position of the object
	//updateDepth: the ordering for drawing the object. Lower Depths are updated earlier.
	//this.position = new Position(x,y);
	if (affectedByCamera == null) {
		affectedByCamera = true;
	}
	if (renderAutomatically == null) {
		renderAutomatically = true;
	}
	if (updateAutomatically == null) {
		updateAutomatically = true;
	}
	this.renderAutomatically = renderAutomatically;
	this.updateAutomatically = updateAutomatically;
	this.affectedByCamera = affectedByCamera;
	this.dead = false;
	this.x = x;
	this.y = y;
	this.drawAngle = 0;
	this.xPrevious = this.x;
	this.yPrevious = this.y;
	this.groupsOwned = [];
	this.groupsContained = [];
	this.updateDepth = updateDepth;
	this.drawDepth = drawDepth;
	this.drawSurface = null;
	this.image = null;
	if (image != null) {
		this.image = GameManager.images[image]; //TODO (maybe this todo is a relic from the image to canvas conversion?!)
		this.drawSurface = createContext(this.image.width,this.image.height,false); 
		this.drawSurface.drawImage(this.image,0,0);
	}
	//this.rect = null;
	if (this.drawSurface != null) { //unfortunately have to reference dimensions via drawSurface.canvas.width rather than drawSurface.width
		this.rect = new Rect(this.drawSurface.canvas.width,this.drawSurface.canvas.height); //GOTTA IMPLEMENT THIS WITH SOME ACUTAL CONNECTION TO THE DRAWSURFACE IMAGE PROPERTIES LATER
	}
	else {
		this.rect = new Rect(0,0);
	}
	
	this.drawLayer = layer;  //(old comment from early period of importing code from rygame python edition to javascript edition) A LOT OF THIS NEEDS TO BE FILLED IN PROPERLY AND WAS JUST SET TO NULL AS A TEMP VALUE. may be some variables that need to be set properly still in the gamemanager class too.
	this.visible = true;
	GameManager.addObject(this);
	
}

function updateBrightness(oldContext,brightnessPercent,operateInPlace) {
	if (operateInPlace == null) {
		operateInPlace = false;
	}
	//copy old canvas to new canvas
	var newContext = operateInPlace ? oldCanvas : createContext(oldContext.canvas.width,oldContext.canvas.height,false); 
	newContext.drawImage(oldContext.canvas,0,0);
	newContext.globalAlpha = brightnessPercent;
	newContext.fillStyle = brightnessPercent >= 0 ? 'rgba(225,225,225,' + (brightnessPercent*.01) + ')' : 'rgba(0,0,0,' + (-1*(brightnessPercent*.01)) + ')';
	newContext.fillRect(0,0,newContext.canvas.width,newContext.canvas.height);
	
	//set context vars back when we are done
	newContext.globalAlpha = oldContext.globalAlpha;
	newContext.fillStype = oldContext.fillStyle;
	return newContext;
}
