/**
 * Full screen the game.
 * Snippet taken from StackOverflow.
 */
function goFullScreen() {
	const el = document.getElementById("rygameCanvas");
	const rfs = el.requestFullscreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
	rfs.call(el);
}

// mouse code - Snippet taken from StackOverflow
// Original by https://simonsarris.com/making-html5-canvas-useful/
let stylePaddingLeft = -1;
let stylePaddingTop = -1;
let styleBorderLeft = -1;
let styleBorderTop = -1;

// Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
// They will mess up mouse coordinates and this fixes that
let html;
let htmlTop = -1;
let htmlLeft = -1;

/**
 * Creates an object with x and y defined,
 * set to the mouse position relative to the state's canvas
 * If you wanna be super-correct this can be tricky,
 * we have to worry about padding and borders
 * @param e: some mouse event
 */
function getMousePos(e) {
	let element = e.target, offsetX = 0, offsetY = 0, mx, my;

	// Compute the total offset. It's possible to cache this if you want
	if (element.offsetParent !== undefined) {
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

	mx = (e.pageX - offsetX) / e.target.getBoundingClientRect().width * e.target.width;
	my = (e.pageY - offsetY) / e.target.getBoundingClientRect().height * e.target.height;

	// We return a simple javascript object with x and y defined
	return {x: mx, y: my};
}

/**
 * Helper function to determine whether there is an intersection between the two polygons described
 * by the lists of vertices. Uses the Separating Axis Theorem
 *
 * @param {Array} a an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
 * @param {Array} b an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
 * @return boolean true if there is any intersection between the 2 polygons, false otherwise
 */
function doPolygonsIntersect(a, b) {
	const polygons = [a, b];
	let minA, maxA, projected, i, i1, j, minB, maxB;

	for (i = 0; i < polygons.length; i++) {

		// for each polygon, look at each edge of the polygon, and determine if it separates
		// the two shapes
		const polygon = polygons[i];
		for (i1 = 0; i1 < polygon.length; i1++) {

			// grab 2 vertices to create an edge
			const i2 = (i1 + 1) % polygon.length;
			const p1 = polygon[i1];
			const p2 = polygon[i2];

			// find the line perpendicular to this edge
			const normal = {x: p2.y - p1.y, y: p1.x - p2.x};

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
			// note: changed from < to <= so that bordering objects would not be considered colliding
			if (maxA <= minB || maxB <= minA) {
				return false;
			}
		}
	}
	return true;
}

/**
 * check whether or not the input point is contained in the input polygon
 * @param nvert: the number of verts in the polygon (passed in for the sake of performance)
 * @param pointList: the points that construct the desired polygon
 * @param testX: the x coordinate of the point to check
 * @param testY: the y coordinate of the point to check
 * @returns boolean whether or not the input point is contained in the input polygon
 */
function pnpoly(nvert, pointList, testX, testY) {
	let c = false;
	for (let i = 0, j = nvert - 1; i < nvert; j = i++) {
		if (((pointList[i].y > testY) !== (pointList[j].y > testY)) && (testX < (pointList[j].x - pointList[i].x) *
			(testY - pointList[i].y) / (pointList[j].y - pointList[i].y) + pointList[i].x)) {
			c = !c;
		}
	}
	return c;
}

/**
 * get the height portion of the passed in font (note that this measures to the top, not to the ascent)
 * @param font: the font from which we wish to extract the height
 * @returns number the font height as an int
 */
function getHeightFromFont(font) {
	let pos = 0;
	while (font[pos] !== "p") {
		++pos;
	}
	return parseInt(font.substring(0, pos));
}

/**
 * Return the index where to insert item x in list a, assuming a is sorted.
 The return value i is such that all e in a[:i] have e <= x, and all e in
 a[i:] have e > x.  So if x already appears in the list, a.insert(x) will
 insert just after the rightmost x already there.

 Optional args lo (default 0) and hi (default len(a)) bound the
 slice of a to be searched.*/
function binarySearch(a, x, key, leftMost, lo, hi) {
	if (lo == null) {
		lo = 0;
	} else if (lo < 0) {
		throw "ERROR: lo must be non-negative";
	}
	if (leftMost == null) {
		leftMost = false;
	}

	if (hi == null) {
		hi = a.length;
	}
	if (key != null) {
		x = x[key];
	}
	if (leftMost) {
		while (lo < hi) {
			const mid = ~~((lo + hi) / 2);
			let value;
			if (key == null) {
				value = a[mid];
			} else {
				value = a[mid][key];
			}
			if (x <= value) {
				hi = mid;
			} else {
				lo = mid + 1;
			}
		}
	} else {
		while (lo < hi) {
			const mid = ~~((lo + hi) / 2);
			let value;
			if (key == null) {
				value = a[mid];
			} else {
				value = a[mid][key];
			}
			if (x < value) {
				hi = mid;
			} else {
				lo = mid + 1;
			}
		}
	}

	return lo;
}


/**
 * creates a new context with the specified dimensions.
 * @param width: the desired width of the new context
 * @param height: the desired height of the new context
 * @param is3d: whether the canvas is 3d (true) or 2d (false)
 * @returns RenderingContext the newly created canvas
 */
function createContext(width, height, is3d) {
	if (width < 1 || height < 1) {
		throw "Can't create context with size " + width + " x " + height;
	}
	const canvas = document.createElement("canvas");
	canvas.setAttribute('width', width);
	canvas.setAttribute('height', height);
	const context = canvas.getContext(is3d ? '3d' : '2d');
	context.width = width;
	context.height = height;
	return context;
}

/**
 * This method is intended to increase stability by providing an (ugly) placeholder image in case the right one is missing
 * @param width: expected width of the original image
 * @param height: expected height of the original image
 */
function createDummyImage(width, height) {
	const result = createContext(width, height, false);
	for (let y = 0; y < height; y += 16) {
		for (let x = 0; x < width; x += 16) {
			if (x / 16 % 2 === y / 16 % 2) {
				result.fillStyle = "rgb(0,255,255)";
			} else {
				result.fillStyle = "rgb(255,0,255)";
			}
			result.fillRect(x, y, 16, 16);
		}
	}
	return result;
}

/**
 * calculate the 4 points that define the input object's rotated rect
 * @param object: the object whose rect we should calcualte the rotated bounding points of
 * @param includeTouching: whether or not the points should be slightly extended to cover 'touching' but not overlapping objects
 * @returns {Array} the ordered list of bounding points
 */
function calculateRectPoints(object, includeTouching) {
	const pointList = [{}, {}, {}, {}];
	let halfWidth = object.rect.width / 2;
	let halfHeight = object.rect.height / 2;
	if (includeTouching === true) {
		halfWidth += 0.01;
		halfHeight += 0.01;
	}
	const cos = Math.cos(object.drawAngle);
	const sin = Math.sin(object.drawAngle);
	const centerX = object.centerX();
	const centerY = object.centerY();
	for (let sign1 = -1; sign1 < 2; sign1 += 2) {
		for (let sign2 = -1; sign2 < 2; sign2 += 2) {
			pointList[(sign1 + 1) + ((sign2 + 1) / 2)].x = centerX + sign1 * halfWidth * cos - sign2 * halfHeight * sin;
			pointList[(sign1 + 1) + ((sign2 + 1) / 2)].y = centerY + sign1 * halfWidth * sin + sign2 * halfHeight * cos;
		}
	}
	// swap indices 2 and 3 so that the points are ordered in a way that properly borders the object
	pointList[2] = pointList.splice(3, 1, pointList[2])[0];
	return pointList;
}

/**
 * determine whether or not the input objects' rects are colliding
 * @param object1: the first input object
 * @param object2: the second input object
 * @param includeTouching: whether or not the rects should be considered colliding if they touch but do not overlap
 * @returns boolean whether or not the rects of objects 1 and 2 are colliding
 */
function collisionRect(object1, object2, includeTouching) {
	if (object1.drawAngle === 0 && object2.drawAngle === 0) {
		const objects = [object1, object2];
		const objectCoordinates = [{}, {}];
		for (let i = 0; i < 2; i++) {
			objectCoordinates[i].left = objects[i].x;
			objectCoordinates[i].top = objects[i].y;
			objectCoordinates[i].right = objects[i].x + objects[i].rect.width;
			objectCoordinates[i].bottom = objects[i].y + objects[i].rect.height;
			if (includeTouching === true && i === 0) {
				objectCoordinates[i].left -= .01;
				objectCoordinates[i].top -= .01;
				objectCoordinates[i].right += .01;
				objectCoordinates[i].bottom += .01;
			}
		}
		// note: changed from < and > to <= and >= so that bordering objects would not be considered colliding
		return !((objectCoordinates[0].left >= objectCoordinates[1].right) || (objectCoordinates[0].top >= objectCoordinates[1].bottom) ||
			(objectCoordinates[0].right <= objectCoordinates[1].left) || (objectCoordinates[0].bottom <= objectCoordinates[1].top));
	} else {
		// since rotation is centered, we have to go from the center and move in the direction of drawAngle * width,
		// and the direction perpendicular to drawAngle * height to find corners
		const pointList1 = calculateRectPoints(object1, includeTouching);
		const pointList2 = calculateRectPoints(object2, includeTouching);
		return doPolygonsIntersect(pointList1, pointList2);
	}
}

/**
 * check whether or not the input point collides with the input object
 * @param x: the x position of the desired point
 * @param y: the y position of the desired point
 * @param object: the object to check for a collision with the input point
 * @param adjustForCamera: whether or not the object's position should be adjusted to remove camera scroll values
 * @param includeTouching: whether or not the point should be considered colliding if it is touching but not overlapping the object
 * @returns boolean whether or not the input point collides with the input object
 */
function collisionPoint(x, y, object, adjustForCamera, includeTouching) {
	const pointList = calculateRectPoints(object, includeTouching);
	let newX = x;
	let newY = y;
	if (adjustForCamera === true) {
		newX += object.drawLayer.cameraX;
		newY += object.drawLayer.cameraY;
	}
	return pnpoly(pointList.length, pointList, newX, newY);
}

/**
 * get the angle between two points
 * @param x1: the x coordinate of the first point
 * @param y1: the y coordinate of the first point
 * @param x2: the x coordinate of the second point
 * @param y2: the y coordinate of the second point
 * @param radians: whether the angle is in radians (true) or degrees (false)
 * @returns number the angle between the two input points
 */
function getAngle(x1, y1, x2, y2, radians = false) {
	if (radians === false) {
		return Math.atan2((y2 - y1), (x2 - x1)) * 180 / Math.PI;
	}
	return Math.atan2((y2 - y1), (x2 - x1));
}

/**
 * get the distance between two points
 * @param x1: the x coordinate of the first point
 * @param y1: the y coordinate of the first point
 * @param x2: the x coordinate of the second point
 * @param y2: the y coordinate of the second point
 * @returns number the distance between the two input points
 */
function getDistance(x1, y1, x2, y2) {
	return Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
}

/**
 * choose a random int between min and max
 * @param min: the minimum value allowed for the random int
 * @param max: the maximum value allowed for the random int
 * @returns number the randomly generated int
 */
function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * make the input object a child of the specified parent object
 * @param objectName: the name of the child object being given inheritance
 * @param parentName: the name of the parent object
 */
function makeChild(objectName, parentName) {
	eval(objectName + ".prototype = Object.create(" + parentName + ".prototype);" + objectName + ".prototype.constructor = " + objectName + ";");
}

GameManagerInternal.prototype.setCursor = function (cursorImageName) {
	if (cursorImageName === undefined || cursorImageName === null) {
		cursorImageName = "Interface/Pointers/Aclosed.bmp";
	}
	GameManager.canvas.style.cursor = "url('" + GameManager.getImage(cursorImageName).canvas.toDataURL() + "'), auto"; // auto is fallback here
};

GameManagerInternal.prototype.createSound = function (soundName) {
	if (this.sounds[soundName] !== undefined) {
		return this.sounds[soundName].cloneNode();
	} else {
		throw "Unknown sound '" + soundName + "' requested";
	}
};

/**
 * draw some text (optionally centered) at the specified position
 * @param text: the text string to draw
 * @param x: the x coordinate at which to draw the text
 * @param y: the y coordinate at which to draw the text
 * @param centerX: whether the x coordinate should be the center (true) or the left (false)
 * @param centerY: whether the y coordinate should be the center (true) or the top (false)
 */
GameManagerInternal.prototype.drawText = function (text, x, y, centerX, centerY) {
	let halfWidth = 0;
	let halfHeight = 0;
	if (centerX === true) {
		halfWidth = this.drawSurface.measureText(text).width / 2; // TODO: DECIDE HOW ROUNDING SHOULD BE PERFORMED IN THIS INSTANCE
	}
	if (centerY === true) {
		halfHeight = parseInt(this.drawSurface.font) / 2; // TODO: VERIFY THAT THIS GIVES THE CORRECT HEIGHT VALUE IN ALL CASES
	}
	this.drawSurface.fillText(text, x - halfWidth, y + halfHeight);
};

GameManagerInternal.prototype.setTextAlign = function (align) {
	this.drawSurface.textAlign = align;
};

GameManagerInternal.prototype.setFontWeight = function (weight) {
	this.fontWeight = weight;
	this.setFont();
};

/**
 * set the current font size
 * @param size: the desired font size
 */
GameManagerInternal.prototype.setFontSize = function (size) {
	this.fontSize = size;
	this.setFont();
};

/**
 * set the current font name
 * @param name: the name of the desired font
 */
GameManagerInternal.prototype.setFontName = function (name) {
	this.fontName = name;
	this.setFont();
};

/**
 * update the font depending on the current name and size variables
 */
GameManagerInternal.prototype.setFont = function () {
	this.drawSurface.font = this.fontWeight + " " + this.fontSize + "px " + this.fontName;
};

/**
 * start up the Rygame engine, initializing all required variables
 */
GameManagerInternal.prototype.initializeRygame = function (is3d) {
	// create context
	if (!is3d) {
		this.drawSurface = GameManager.canvas.getContext('2d');
	} else {
		this.drawSurface = GameManager.canvas.getContext('3d');
	}
	// mouse code (this snippet is taken from a stackOverflow answer)
	stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(GameManager.canvas, null)['paddingLeft'], 10) || 0;
	stylePaddingTop = parseInt(document.defaultView.getComputedStyle(GameManager.canvas, null)['paddingTop'], 10) || 0;
	styleBorderLeft = parseInt(document.defaultView.getComputedStyle(GameManager.canvas, null)['borderLeftWidth'], 10) || 0;
	styleBorderTop = parseInt(document.defaultView.getComputedStyle(GameManager.canvas, null)['borderTopWidth'], 10) || 0;

	html = document.body.parentNode;
	htmlTop = html.offsetTop;
	htmlLeft = html.offsetLeft;

	GameManager.setCursor();

	// init key events
	GameManager.canvas.addEventListener("keydown", function (e) {
		GameManager.keyStates[String.fromCharCode(e.keyCode)] = true;
		// fullScreenKey is a property that must be set in the game itself rather than being hardcoded,
		// as that would prevent the programmer from being able to use a key that they might need
		if (String.fromCharCode(e.keyCode) === GameManager.fullScreenKey) {
			goFullScreen();
		}
	});
	GameManager.canvas.addEventListener("keyup", function (e) {
		GameManager.keyStates[String.fromCharCode(e.keyCode)] = false;
	});
	GameManager.canvas.addEventListener("mousemove", function (e) {
		GameManager.mousePos = getMousePos(e);
	});
	GameManager.canvas.addEventListener("mouseleave", function (e) {
		GameManager.mousePos = getMousePos(e);
	});
	GameManager.canvas.addEventListener("mouseenter", function (e) {
		GameManager.mousePos = getMousePos(e);
	});
	GameManager.canvas.addEventListener("mousedown", function (e) {
		if (e.button === 0) {
			// left click press detected
			GameManager.mouseDownLeft = true;
			GameManager.mousePressedLeft = true;
			GameManager.mousePressedRight = true;
		} else if (e.button === 2) {
			// right click press detected
			GameManager.mouseDownRight = true;
		}
	});
	GameManager.canvas.addEventListener("mouseup", function (e) {
		if (e.button === 0) {
			GameManager.mouseReleasedLeft = true;
			// we can use the same method as in mousemove to get the effective mouse position
			// since the mouse coordinates are returned by the event in pageX and pageY regardless of the event type
			GameManager.mouseReleasedPosLeft = getMousePos(e);
			// left click release detected
			GameManager.mouseDownLeft = false;
		} else if (e.button === 2) {
			GameManager.mouseReleasedRight = true;
			GameManager.mouseReleasedPosRight = getMousePos(e);
			// right click release detected
			GameManager.mouseDownRight = false;
		}
	});
	GameManager.canvas.addEventListener('contextmenu', function (e) {
		e.preventDefault();
	});
};

/**
 * add a RygameObject to the GameManager
 * @param object: the object to be added
 */
GameManagerInternal.prototype.addObject = function (object) {
	this.renderOrderedCompleteObjectList.splice(binarySearch(this.renderOrderedCompleteObjectList, object, "drawDepth"), 0, object);
	this.updateOrderedCompleteObjectList.splice(binarySearch(this.updateOrderedCompleteObjectList, object, "updateDepth"), 0, object);
};

/**
 * remove a RygameObject from the GameManager
 * @param object: the object to be removed
 */
GameManagerInternal.prototype.removeObject = function (object) {
	this.renderOrderedCompleteObjectList.splice(this.renderOrderedCompleteObjectList.indexOf(object), 1);
	this.updateOrderedCompleteObjectList.splice(this.updateOrderedCompleteObjectList.indexOf(object), 1);
};

/**
 * remove and re-insert a RygameObject in order to refresh render and update depth
 * @param object: the object to refresh
 */
GameManagerInternal.prototype.refreshObject = function (object) {
	this.removeObject(object);
	this.addObject(object);
};

/**
 * add a Layer to the GameManager
 * @param layer: the layer to be added
 */
GameManagerInternal.prototype.addLayer = function (layer) {
	this.completeLayerList.splice(binarySearch(this.completeLayerList, layer, "drawDepth"), 0, layer);
};

/**
 * update all RygameObjects in order of their update depth
 */
GameManagerInternal.prototype.updateObjects = function () {
	for (let i = 0; i < this.updateOrderedCompleteObjectList.length; i++) {
		this.updateOrderedCompleteObjectList[i].xPrevious = this.updateOrderedCompleteObjectList[i].x;
		this.updateOrderedCompleteObjectList[i].yPrevious = this.updateOrderedCompleteObjectList[i].y;
		if (typeof this.updateOrderedCompleteObjectList[i].update == "function" && this.updateOrderedCompleteObjectList[i].updateAutomatically) {
			this.updateOrderedCompleteObjectList[i].attemptUpdate();
		}
	}
};

/**
 * renders all objects to their frames, and then draws frames to screen.
 * Objects with larger depths have their surfaces drawn first on their frame.
 */
GameManagerInternal.prototype.drawFrame = function () {
	// re-render all layer backgrounds first. also clears their surfaces for a fresh frame if the background fills the layer surface
	for (let i = this.completeLayerList.length - 1; i >= 0; i--) {
		const layer = this.completeLayerList[i];
		if (layer.active && (!layer.frozen)) {
			if (layer.background == null) {
				layer.drawSurface.clearRect(0, 0, layer.width, layer.height);
			} else {
				layer.drawSurface.drawImage(layer.background.canvas, 0, -layer.cameraY);
			}
		}
	}

	// render objects to frames first (objects are sorted by depth when added, so no need to do any sorting here)
	for (let i = this.renderOrderedCompleteObjectList.length - 1; i >= 0; i--) {
		const drawObject = this.renderOrderedCompleteObjectList[i];
		if (drawObject.renderAutomatically && drawObject.drawLayer.active && (!drawObject.drawLayer.frozen)) {
			drawObject.render();
		}
	}

	for (let i = this.renderOrderedCompleteObjectList.length - 1; i >= 0; i--) {
		const drawGuiObject = this.renderOrderedCompleteObjectList[i];
		if (drawGuiObject.drawLayer.active && (!drawGuiObject.drawLayer.frozen)) {
			drawGuiObject.renderGuiElements();
		}
	}

	for (let i = this.completeLayerList.length - 1; i >= 0; i--) {
		const layer = this.completeLayerList[i];
		if (layer.active === true) {
			// TODO: layer resizing will occur here, if needed
			this.drawSurface.drawImage(layer.drawSurface.canvas, layer.x, layer.y);
		}
	}

	this.mouseReleasedLeft = false;
	this.mouseReleasedRight = false;
	this.mousePressedLeft = false;
	this.mousePressedRight = false;
};

GameManagerInternal.prototype.getScreenZoom = function () {
	return this.screenWidth / this.gameWidth;
};

/**
 * draws the input surface to the GameManager's drawSurface at the specified location
 * @param surface: the surface to be drawn onto the GameManager's drawSurface
 * @param x: the x coordinate at which to draw the surface
 * @param y: the y coordinate at which to draw the surface
 */
GameManagerInternal.prototype.draw = function (surface, x, y) { // simple draw function. Copied from Layer so that the GameManager can be treated like a layer when necessary.
	this.drawSurface.drawImage(surface.canvas, x, y);
};

GameManagerInternal.prototype.getImage = function (imageName) {
	if (!imageName || imageName.length === 0) {
		throw "imageName must not be undefined, null or empty - was " + imageName;
	} else {
		const lImageName = imageName.toLowerCase();
		if (!(lImageName in this.images) || this.images[lImageName] === undefined || this.images[lImageName] === null) {
			console.error("Image '" + imageName + "' unknown! Using placeholder image instead");
			this.images[lImageName] = createDummyImage(64, 64);
		}
		return this.images[lImageName];
	}
};

GameManagerInternal.prototype.getFont = function (fontName) {
	if (!fontName || fontName.length === 0) {
		throw "fontName must not be undefined, null or empty - was " + fontName;
	} else {
		const lFontName = fontName.toLowerCase();
		if (!(lFontName in this.fonts) || this.fonts[lFontName] === undefined || this.fonts[lFontName] === null) {
			console.error("Font '" + fontName + "' unknown! Using static placeholder font image instead");
			this.fonts[lFontName] = new DummyFont();
		}
		return this.fonts[lFontName];
	}
};

/**
 * GameManagerInternal constructor: initialize variables stored and maintained by the GameManager
 */
function GameManagerInternal() {
	this.configuration = null;
	// list of image resources
	this.images = [];
	// list of sound resources
	this.sounds = [];
	// list of script resources
	this.scriptObjects = [];
	// list of bitmap fonts
	this.fonts = [];
	this.fps = 40;
	this.keyStates = [];
	this.completeLayerList = [];
	this.renderOrderedCompleteObjectList = [];
	this.updateOrderedCompleteObjectList = [];
	this.canvas = document.getElementById('rygameCanvas');
	this.drawSurface = null;
	// native resolution of the game
	this.gameWidth = 640;
	this.gameHeight = 480;
	// zoomed/shrinked screen resolution
	this.screenWidth = this.canvas.width;
	this.screenHeight = this.canvas.height;
	this.mousePos = {x: 1, y: 1};
	this.mouseDownLeft = false;
	this.mouseDownRight = false;
	// mousePressed is only true on the frame when the mouse is initially pressed during click. Resets to false after drawFrame is called.
	this.mousePressedLeft = false;
	this.mousePressedRight = false;
	// mouseReleased is only true on the frame when the mouse is initially released during click. Resets to false after drawFrame is called.
	this.mouseReleasedLeft = false;
	this.mouseReleasedRight = false;
	this.mouseReleasedPosLeft = {x: 1, y: 1};
	this.mouseReleasedPosRight = {x: 1, y: 1};
	// this is just a default; feel free to change it at any point from the game file
	this.fullScreenKey = "F";
	// text alignment
	this.textAlign = "";
	// font weight - first part of html font property (formatted 'fontWeight fontSizepx fontName')
	this.fontWeight = "";
	// font size in pixels - second part of html font property (formatted 'fontWeight fontSizepx fontName')
	this.fontSize = 48;
	// font name - third part of html font property (formatted 'fontWeight fontSizepx fontName')
	this.fontName = "Arial";
}

// create GameManager instance in global namespace to make up for a lack of typical 'static' classes *that support inheritance*
GameManager = new GameManagerInternal();

/**
 * add a list of objects to the ObjectGroup
 * @param appendObjectList: the list of objects to be added to the group
 */
ObjectGroup.prototype.push = function (appendObjectList) {
	appendObjectList = [].concat(appendObjectList);
	for (let i = 0; i < appendObjectList.length; i++) {
		this.objectList.push(appendObjectList[i]);
		appendObjectList[i].groupsContained.push(this);
	}
};

/**
 * pop an object off of this ObjectGroup's objectList, and remove this ObjectGroup from that object's groupsContained
 * @returns the removed object
 */
ObjectGroup.prototype.pop = function () {
	const removeObject = this.objectList.pop();
	removeObject.groupsContained.splice(removeObject.groupsContained.indexOf(this), 1);
	return removeObject;
};

/**
 * remove a list of objects from this ObjectGroup
 * @param removeObjectList: the list of objects to be removed from the group
 */
ObjectGroup.prototype.remove = function (removeObjectList) {
	removeObjectList = [].concat(removeObjectList);
	for (let i = 0; i < removeObjectList.length; i++) {
		const position = this.objectList.indexOf(removeObjectList[i]);
		if (position !== -1) {
			const removeObject = this.objectList[position];
			this.objectList.splice(position, 1);
			removeObject.groupsContained.splice(removeObject.groupsContained.indexOf(this), 1);
		}
	}
};

/**
 * remove all objects from this objectGroup, optionally killing them in the process
 * @param kill: whether the removed objects should be killed (true) or left alive (false)
 */
ObjectGroup.prototype.removeAll = function (kill) {
	let curObject;
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

/**
 * update all objects in this ObjectGroup
 * @param optionalArgs: a list of optional arguments to be passed to each object's update method
 */
ObjectGroup.prototype.update = function (optionalArgs) {
	for (let i = 0; i < this.objectList.length; ++i) {
		this.objectList[i].attemptUpdate(optionalArgs);
	}
};

ObjectGroup.prototype.size = function () {
	return this.objectList.length;
};

/**
 * ObjectGroup constructor: initializes an empty object list
 */
function ObjectGroup() {
	this.objectList = [];
}

makeChild("Layer", "RygameObject");

/**
 * draws the input surface to the Layer's drawSurface at the specified location
 * @param surface: the surface to be drawn onto the Layer's drawSurface
 * @param x: the x coordinate at which to draw the surface
 * @param y: the y coordinate at which to draw the surface
 */
Layer.prototype.draw = function (surface, x, y) {
	this.drawSurface.drawImage(surface.canvas, x, y);
};

/**
 * Layer constructor: creates a new layer instance, initializing its properties
 * @param x: the initial x coordinate of the layer
 * @param y: the initial y coordinate of the layer
 * @param updateDepth: the depth at which this Layer is updated (smaller depths update sooner)
 * @param drawDepth: the depth at which this Layer is drawn (smaller depths update sooner)
 * @param width: the width of this Layer
 * @param height: the height of this Layer
 * @param startActive: whether or not this Layer is active upon instantiation
 */
function Layer(x, y, updateDepth, drawDepth, width, height, startActive) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.updateDepth = updateDepth;
	this.drawDepth = drawDepth;
	this.drawSurface = createContext(this.width, this.height, false);
	this.active = startActive === true;
	this.frozen = false;
	this.background = null;
	this.cameraX = 0;
	this.cameraY = 0;
	this.drawAngle = 0;
	this.rect = new Rect(this.drawSurface.width, this.drawSurface.height);
	GameManager.addLayer(this);
}

/**
 * Rect constructor: create a new Rect instance with the specified width and height
 * @param width: the width of our new Rect
 * @param height: the height of our new Rect
 */
function Rect(width, height) {
	this.width = width;
	this.height = height;
}

makeChild("Button", "RygameObject");

/**
 * update this Button's state based on mouse interactivity
 * @param selectionType: the current active UI selection
 * @param currentlyOpenIconPanel: the currently open menu, if any
 */
Button.prototype.update = function (selectionType, currentlyOpenIconPanel) {
	if (currentlyOpenIconPanel == null) {
		currentlyOpenIconPanel = "";
	}
	if (this.selectionTypeBound != null) {
		if (this.selectionTypeBound.indexOf(selectionType) === -1) {
			if (!(this.selectionTypeBound.length === 0 && (selectionType != null || currentlyOpenIconPanel !== ""))) {
				this.visible = false;
				return;
			}
		}
	} else if (selectionType != null) {
		this.visible = false;
		return;
	}
	if (this.openMenuBound != null) {
		if (this.openMenuBound.indexOf(currentlyOpenIconPanel) === -1) {
			if (!(this.openMenuBound.length === 0 && (selectionType != null || currentlyOpenIconPanel !== ""))) {
				this.visible = false;
				return;
			}
		}
	} else if (currentlyOpenIconPanel !== "") {
		this.visible = false;
		return;
	}
	this.visible = true;

	this.drawSurface = this.normalSurface;

	if (this.additionalRequirement != null) {
		if (!(this.additionalRequirement.apply(this, this.additionalRequirementArgs))) {
			this.clickable = false;
			this.drawSurface = this.unavailableSurface;
		} else {
			this.clickable = this.normallyClickable;

		}
	}

	// if this button is not currently interactive, don't need to update anything else
	if (!this.clickable) {
		return;
	}

	if (GameManager.mousePressedLeft === true) {
		this.mouseDownOnButton = collisionPoint(GameManager.mousePos.x, GameManager.mousePos.y, this, this.affectedByCamera);
	}
	// mouse pressed and released events can occur in the same frame on high doses of coffee
	if (GameManager.mouseReleasedLeft === true) {
		if (this.mouseDownOnButton === true) {
			if (collisionPoint(GameManager.mousePos.x, GameManager.mousePos.y, this, this.affectedByCamera)) {
				if (this.runMethod != null) {
					// button has been clicked
					this.runMethod.apply(this, this.optionalArgs);
				}
			}
		}
		this.mouseDownOnButton = false;
	}

	if (collisionPoint(GameManager.mousePos.x, GameManager.mousePos.y, this, this.affectedByCamera)) {
		if (this.mouseDownOnButton) {
			this.drawSurface = this.darkenedSurface;
		} else {
			this.drawSurface = this.brightenedSurface;
		}
	}
};

/**
 * update this button's visible text, optionally clearing any existing text first
 * @param newText: the new text that the button should display
 * @param clearFirst: whether the button's surface should be cleared (true) or not (false) before blitting the new text
 */
Button.prototype.updateText = function (newText, clearFirst) {
	const brightnessShiftPercent = 25;
	if (clearFirst == null) {
		clearFirst = true;
	}
	if (clearFirst && this.drawSurface != null) {
		this.drawSurface.clearRect(0, 0, this.drawSurface.width, this.drawSurface.height);
	}

	// create brightened and darkened version of drawSurface
	this.normalSurface = this.drawSurface;
	this.brightenedSurface = this.drawSurface == null ? null : this.image == null ?
		createContext(this.normalSurface.width, this.normalSurface.height) : updateBrightness(this.normalSurface, brightnessShiftPercent);
	this.darkenedSurface = this.drawSurface == null ? null : this.image == null ?
		createContext(this.normalSurface.width, this.normalSurface.height) : updateBrightness(this.normalSurface, -brightnessShiftPercent);
	this.unavailableSurface = this.drawSurface == null ? null : this.image == null ?
		createContext(this.normalSurface.width, this.normalSurface.height) : updateBrightness(this.normalSurface, -brightnessShiftPercent * 2);

	this.text = newText;
	if (this.text !== "") {
		let changedDims = false;
		if (this.drawSurface == null) {
			this.drawSurface = createContext(1, 1, false);
			this.normalSurface = this.drawSurface;
			this.brightenedSurface = createContext(1, 1, false);
			this.darkenedSurface = createContext(1, 1, false);
			this.unavailableSurface = createContext(1, 1, false);
		}
		const drawSurfaces = [this.unavailableSurface, this.darkenedSurface, this.normalSurface, this.brightenedSurface];
		const baseR = this.textColor[0];
		const baseG = this.textColor[1];
		const baseB = this.textColor[2];
		for (let i = 0; i < drawSurfaces.length; ++i) {

			drawSurfaces[i].font = "32px " + GameManager.fontName;

			const height = parseInt(drawSurfaces[i].font.split(' ')[0].replace('px', ''));
			const textDims = drawSurfaces[i].measureText(this.text);
			if (textDims.width > drawSurfaces[i].width) {
				drawSurfaces[i].canvas.width = textDims.width;
				drawSurfaces[i].width = textDims.width;
				this.rect.width = drawSurfaces[i].width;
				changedDims = true;
			}
			// note that height in this instance includes space below the text, potentially making it larger than the actual render height
			if (height > drawSurfaces[i].height) {
				drawSurfaces[i].canvas.height = height;
				drawSurfaces[i].height = height;
				this.rect.height = drawSurfaces[i].height;
				changedDims = true;
			}
			if (changedDims && this.image != null) {
				drawSurfaces[i].clearRect(0, 0, drawSurfaces[i].width, drawSurfaces[i].height);
				drawSurfaces[i].drawImage(this.image.canvas, 0, 0);
				updateBrightness(drawSurfaces[i], brightnessShiftPercent, true);
			}

			drawSurfaces[i].textBaseline = "hanging";
			drawSurfaces[i].font = "32px " + GameManager.fontName;
			// todo: convert to HSV, adjust brightness, then convert back to RGB, rather than just statically shifting R,G,B channels
			drawSurfaces[i].fillStyle = i === 0 ? "rgb(" + Math.round(Math.max(baseR - brightnessShiftPercent * .02 * 255, 0)) + "," +
				Math.round(Math.max(baseG - brightnessShiftPercent * .02 * 255, 0)) + "," + Math.round(Math.max(baseB - brightnessShiftPercent * .02 * 255, 0)) + ")"
				: (i === 1 ? "rgb(" + Math.round(Math.max(baseR - brightnessShiftPercent * .01 * 255, 0)) + "," + Math.round(Math.max(baseG - brightnessShiftPercent * .01 * 255, 0)) + "," +
					Math.round(Math.max(baseB - brightnessShiftPercent * .01 * 255, 0)) + ")"
					: (i === 2 ? "rgb(" + baseR + "," + baseG + "," + baseB + ")" : "rgb(" + Math.round(Math.min(baseR + brightnessShiftPercent * .01 * 255, 255)) + "," +
						Math.round(Math.min(baseG + brightnessShiftPercent * .01 * 255, 255)) + "," + Math.round(Math.min(baseB + brightnessShiftPercent * .01 * 255, 255)) + ")"));
			drawSurfaces[i].fillText(this.text, 0, 0);
		}
	}
};

/**
 * Button constructor: creates a new Button which can be interacted with via the mouse cursor
 * @param x: the initial x coordinate of the Button
 * @param y: the initial y coordinate of the Button
 * @param updateDepth: the depth at which this Button is updated (smaller depths update sooner)
 * @param drawDepth: the depth at which this Button is drawn (smaller depths update sooner)
 * @param image: the image to be displayed on this Button (leave null if no image is desired)
 * @param layer: the Layer to which this Button belongs
 * @param text: the text to be displayed on this Button (leave as blank string if no text is desired)
 * @param runMethod: the method to be executed when this Button is clicked
 * @param affectedByCamera: whether this Button scrolls with the camera (true) or ignore the camera position (false)
 * @param renderAutomatically: whether this Button renders on its own (true) or must be rendered manually (false)
 * @param selectionTypeBound: the list of selection types during which this Button should operate
 * @param openMenuBound: the list of open menus during which this Button should operate
 * @param optionalArgs: a list of optional arguments to be passed in to this Button's runMethod
 * @param clickable: whether this button can be clicked (true) or not (false)
 * @param updateAutomatically: whether this button updates on its own (true) or must be updated manually (false)
 * @param textColor: the color of this Button's text
 * @param additionalRequirement: an optional method that must return true in order for this button to function
 * @param additionalRequirementArgs: a list of arguments to pass to this Button's additional requirement method
 */
function Button(x, y, updateDepth, drawDepth, image, layer, text, runMethod, affectedByCamera, renderAutomatically, selectionTypeBound, openMenuBound,
				optionalArgs, clickable, updateAutomatically, textColor, additionalRequirement, additionalRequirementArgs) {
	if (updateAutomatically == null) {
		// default to false rather than true for now, as current buttons expect this functionality
		updateAutomatically = false;
	}
	if (additionalRequirementArgs == null) {
		additionalRequirementArgs = [];
	}
	RygameObject.call(this, x, y, updateDepth, drawDepth, image, layer, affectedByCamera, renderAutomatically, updateAutomatically);
	this.additionalRequirement = additionalRequirement;
	this.additionalRequirementArgs = additionalRequirementArgs;
	this.runMethod = runMethod;
	this.mouseDownOnButton = false;
	this.selectionTypeBound = selectionTypeBound;
	this.openMenuBound = openMenuBound;
	this.optionalArgs = optionalArgs;
	this.clickable = (clickable == null ? true : clickable);
	this.normallyClickable = this.clickable;
	// set default text color to an almost pure green
	this.textColor = (textColor == null ? [0, 245, 0] : textColor);
	if (this.optionalArgs == null) {
		this.optionalArgs = [];
	}
	this.visible = false;
	this.updateText(text, false);
}

makeChild("ImageButton", "RygameObject");

/**
 * update this MainMenuButton's state based on mouse interactivity
 */
ImageButton.prototype.update = function () {
	if (this.additionalRequirement != null) {
		if (!(this.additionalRequirement.apply(this, this.additionalRequirementArgs))) {
			this.clickable = false;
			this.drawSurface = this.unavailableSurface;
		} else {
			this.clickable = true;

		}
	}

	// if this button is not currently interactive, don't need to update anything else
	if (!this.clickable) {
		return;
	}

	const mouseOver = collisionPoint(GameManager.mousePos.x, GameManager.mousePos.y, this, this.affectedByCamera);
	// mouse pressed and released events can occur in the same frame on high doses of coffee
	if (GameManager.mousePressedLeft === true) {
		this.mouseDownOnButton = mouseOver;
	}
	if (GameManager.mouseReleasedLeft === true) {
		if (this.mouseDownOnButton === true) {
			if (mouseOver && this.runMethod != null) { // button has been clicked
				this.runMethod.apply(this, this.optionalArgs);
			}
		}
		this.mouseDownOnButton = false;
	}

	if (collisionPoint(GameManager.mousePos.x, GameManager.mousePos.y, this, this.affectedByCamera)) {
		if (this.mouseDownOnButton) {
			this.drawSurface = this.darkenedSurface;
		} else {
			this.drawSurface = this.brightenedSurface;
		}
	} else {
		this.drawSurface = this.normalSurface;
	}
};

/**
 * A simple button class consisting of different images for each state.
 * @param x button top left position
 * @param y button top left position
 * @param drawDepth: the depth at which this object is drawn (smaller depths update sooner)
 * @param normalSurface normal display state of the button (also defines button size)
 * @param brightenedSurface display state on mouse hover
 * @param layer layer the button will be added to
 * @param runMethod the function to call when the button is clicked
 * @param optionalArgs: a list of optional arguments to be passed in to this ImageButton's runMethod
 * @param isAffectedByCamera true if the button should be scrolled with the camera
 */
function ImageButton(x, y, drawDepth, normalSurface, brightenedSurface, layer, runMethod = null, optionalArgs = null, isAffectedByCamera = false) {
	RygameObject.call(this, x, y, 0, drawDepth, null, layer, isAffectedByCamera, true, true);
	this.normalSurface = normalSurface;
	this.brightenedSurface = brightenedSurface;
	this.darkenedSurface = this.normalSurface;
	this.unavailableSurface = this.normalSurface;
	this.runMethod = runMethod;
	this.optionalArgs = optionalArgs;
	this.additionalRequirement = null;
	this.additionalRequirementArgs = [];
	this.clickable = true;
	this.mouseDownOnButton = false;
	if (this.normalSurface) {
		this.rect = new Rect(this.normalSurface.width, this.normalSurface.height);
	} else if (this.brightenedSurface) {
		this.rect = new Rect(this.brightenedSurface.width, this.brightenedSurface.height);
	} else if (this.darkenedSurface) {
		this.rect = new Rect(this.darkenedSurface.width, this.darkenedSurface.height);
	}
}

/**
 * renders this RygameObject's gui elements
 * @param destLayer: the layer on which to render the elements
 */
RygameObject.prototype.renderGuiElements = function (destLayer) {

};

/**
 * calculate this RygameObject's center x coordinate
 * @returns this RygameObject's center x coordinate
 */
RygameObject.prototype.centerX = function () {
	return this.x + (this.rect.width / 2);
};

/**
 * calculate this RygameObject's center y coordinate
 * @returns this RygameObject's center y coordinate
 */
RygameObject.prototype.centerY = function () {
	return this.y + (this.rect.height / 2);
};

/**
 * sets this RygammeObject's x coordinate relative to its center
 */
RygameObject.prototype.setCenterX = function (x) {
	this.x = x - (this.rect.width / 2);
};

/**
 * sets this RygammeObject's y coordinate relative to its center
 */
RygameObject.prototype.setCenterY = function (y) {
	this.y = y - (this.rect.height / 2);
};

/**
 * renders this RygameObject to the input Layer
 * @param destLayer: the Layer to which this RygameObject should be rendered
 */
RygameObject.prototype.render = function (destLayer) {
	if (this.visible) {
		if (destLayer == null) {
			destLayer = this.drawLayer;
		}
		if (this.drawSurface != null) {
			if (this.affectedByCamera === true) {
				// move in the opposite direction of the layer camera before rendering (and deciding whether or not you're onscreen).
				// this should be done for gui elements as well in renderGuiElements
				this.x -= destLayer.cameraX;
				this.y -= destLayer.cameraY;
			}
			if (this.withinLayerBounds()) {
				if (this.drawAngle === 0) {
					destLayer.draw(this.drawSurface, this.x, this.y);
				} else {
					destLayer.drawSurface.save();
					destLayer.drawSurface.translate(this.centerX(), this.centerY());
					destLayer.drawSurface.rotate(this.drawAngle);
					destLayer.draw(this.drawSurface, -(this.centerX() - this.x), -(this.centerY() - this.y));
					destLayer.drawSurface.restore();
				}
			}
			if (this.affectedByCamera === true) {
				// move back once you're finished rendering.
				this.x += destLayer.cameraX;
				this.y += destLayer.cameraY;
			}
		}
	}
};

/**
 * determine whether or not this RygameObject is within the bounds of its Layer
 * @returns boolean whether or not the object is within its Layer's bounds
 */
RygameObject.prototype.withinLayerBounds = function () {
	return collisionRect(this, this.drawLayer);
};

/**
 * rotate this RygameObject around a desired point in space
 * @param x: the x coordinate of the point around which this object should be rotated
 * @param y: the y coordinate of the point around which this object should be rotated
 * @param angleRadians: the angle (in radians) at which we should rotate this object
 * @param angleDifferenceRadians: an optional angle difference (in radians) to offset the rotation angle
 */
RygameObject.prototype.rotateAroundPoint = function (x, y, angleRadians, angleDifferenceRadians) {
	if (angleDifferenceRadians == null) {
		angleDifferenceRadians = 0;
	}
	const moveDistance = getDistance(this.centerX(), this.centerY(), x, y);
	this.setCenterX(x);
	this.setCenterY(y);
	this.drawAngle = angleRadians + angleDifferenceRadians;
	this.moveDirection(angleRadians / Math.PI * 180, moveDistance);
};

/**
 * change this RygameObject's image to a different one
 * @param imageName: the name of the new image to change to
 * @param clearRect: whether the current rect should be changed for the new image (true) or left the same (false)
 */
RygameObject.prototype.changeImage = function (imageName, clearRect) {
	// TODO: drawSurface and rect dimensions are currently left unchanged, meaning the new image may be cut off
	this.image = GameManager.getImage(imageName);
	if (clearRect) {
		this.drawSurface.clearRect(0, 0, this.rect.width, this.rect.height);
	}
	this.drawSurface.drawImage(this.image.canvas, 0, 0, this.rect.width, this.rect.height);
};

/**
 * move the current object towards the desired position at the specified speed
 * @param x
 * @param y
 * @param speed: the speed at which our object should move
 * @param center: whether this object's origin should be considered its center (true) or its top-left (false)
 * returns boolean whether we reached the desired point (true) or not (false)
 */
RygameObject.prototype.moveTowardsPoint = function (x, y, speed, center) {
	if (center == null) {
		center = false;
	}
	if (center === true) {
		this.x += this.rect.width / 2;
		this.y += this.rect.height / 2;
	}
	if (getDistance(this.x, this.y, x, y) <= speed) {
		if (center === true) {
			this.setCenterX(x);
			this.setCenterY(y);
		} else {
			this.x = x;
			this.y = y;
		}
		return true;
	}
	this.moveDirection(getAngle(this.x, this.y, x, y), speed);
	if (center === true) {
		this.x -= this.rect.width / 2;
		this.y -= this.rect.height / 2;
	}
	return false;
};

/**
 * move this object by a specified amount in a desired direction
 * @param angleDegrees: the angle (in degrees) at which to move this object
 * @param amount: the distance (in pixels) to move this object
 */
RygameObject.prototype.moveDirection = function (angleDegrees, amount) {
	this.x += amount * Math.cos(angleDegrees * Math.PI / 180);
	this.y += amount * Math.sin(angleDegrees * Math.PI / 180);
};

/**
 * move this object out of a collision with another object
 * @param otherObject: the other object with which we wish to stop colliding
 * @param xPrevious: our previous x coordinate that we are retreating towards
 * @param yPrevious: our previous y coordinate that we are retreating towards
 */
RygameObject.prototype.moveOutsideCollision = function (otherObject, xPrevious, yPrevious) {
	// TODO: currently only accepts Rect collisions
	let angle;
	if (xPrevious === this.x && yPrevious === this.y) {
		// if there was no movement since last frame we just move backwards from where we're facing instead
		angle = 180 + this.drawAngle / Math.PI * 180;
	} else {
		angle = getAngle(this.x, this.y, xPrevious, yPrevious); // TODO: VERIFY THAT THIS METHOD WORKS CORRECTLY
	}
	while (collisionRect(this, otherObject)) {
		this.moveDirection(angle, 1);
	}
	while (!collisionRect(this, otherObject)) {
		this.moveDirection(180 + angle, .1);
	}
	while (collisionRect(this, otherObject)) {
		this.moveDirection(angle, .01);
	}
};

/**
 * add a group to this RygameObject's list of groups in which it is contained
 * @param group: the group to add to this object's groupsContained list
 */
RygameObject.prototype.addGroupContained = function (group) {
	this.groupsContained.push(group);
};

/**
 * kill this RygameObject
 */
RygameObject.prototype.die = function () {
	// don't do anything if already dead
	if (this.dead) {
		return;
	}
	while (this.groupsContained.length > 0) {
		this.groupsContained[0].remove(this);
	}
	while (this.groupsOwned.length > 0) {
		const curObject = this.groupsOwned[0];
		this.groupsOwned.shift();
		curObject.die();
	}
	GameManager.removeObject(this);
	this.dead = true;
};

/**
 * attempt to update this RygameObject, verifying that it is on an active, non-frozen layer
 * @param optionalArgs: a list of optional arguments to be passed to this object's update method
 */
RygameObject.prototype.attemptUpdate = function (optionalArgs) {
	if (this.drawLayer.active && (!this.drawLayer.frozen)) {
		this.update.apply(this, optionalArgs);
	}
};

/**
 * @param x: the initial x coordinate of this object
 * @param y: the initial y coordinate of this object
 * @param updateDepth: the depth at which this object is updated (smaller depths update sooner)
 * @param drawDepth: the depth at which this object is drawn (smaller depths update sooner)
 * @param image: the image that this object should draw
 * @param layer: the layer to which this object belongs
 * @param affectedByCamera: whether this object scrolls with the camera (true) or ignore the camera position (false)
 * @param renderAutomatically: whether this object renders on its own (true) or must be rendered manually (false)
 * @param updateAutomatically: whether this object updates on its own (true) or must be updated manually (false)
 */
function RygameObject(x, y, updateDepth, drawDepth, image, layer, affectedByCamera, renderAutomatically, updateAutomatically) {
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
		this.image = GameManager.getImage(image);
		this.drawSurface = createContext(this.image.width, this.image.height, false);
		this.drawSurface.drawImage(this.image.canvas, 0, 0);
	}
	if (this.drawSurface != null) {
		this.rect = new Rect(this.drawSurface.width, this.drawSurface.height);
	} else {
		this.rect = new Rect(0, 0);
	}

	this.drawLayer = layer;
	this.visible = true;
	GameManager.addObject(this);
}

/**
 * update the brightness of a canvas context
 * @param oldContext: the context to be brightened
 * @param brightnessPercent: the percent by which to brighten the context
 * @param operateInPlace: whether the brightening should occur in place (true) or on a new conetxt (false)
 * @returns oldContext, or a newly created context, depending on whether operateInPlace is true or false
 */
function updateBrightness(oldContext, brightnessPercent, operateInPlace = false) {
	// copy old canvas to new canvas, if in-place operation is not desired
	const newContext = operateInPlace ? oldContext : createContext(oldContext.width, oldContext.height, false);
	newContext.drawImage(oldContext.canvas, 0, 0);
	newContext.globalAlpha = brightnessPercent;
	newContext.fillStyle = brightnessPercent >= 0 ? 'rgba(225,225,225,' + (brightnessPercent * .01) + ')' : 'rgba(0,0,0,' + (-1 * (brightnessPercent * .01)) + ')';
	newContext.fillRect(0, 0, newContext.width, newContext.height);

	// set context vars back when we are done
	newContext.globalAlpha = oldContext.globalAlpha;
	newContext.fillStype = oldContext.fillStyle;
	return newContext;
}

function warnMissionAbort(event) {
	// TODO somehow notify the user that the mission is aborted, since custom messages are not supported anymore, think of something else
	event.preventDefault();
	event.returnValue = '';
}

function blockPageExit() {
	window.addEventListener("beforeunload", warnMissionAbort);
}

function unblockPageExit() {
	window.removeEventListener("beforeunload", warnMissionAbort);
}
