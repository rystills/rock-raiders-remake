//rygame is loaded in via html prior to this game, as this game is dependent on the rygame javascript port in order to function, so it is assumed that at this point rygame is available and ready for use
//for now images are being awaitingStart in by the rygame file as hardcoded urls, but this will be changed to the imageloader class which hopefully will be researched at the same time as the javascript dynamic loader so we don't have to define all of our classes in the html, that would't be very fun
GameManager.initializeRygame(0);

function printTerrain(terrain) {
	var str;
	for (var i = 0; i < terrain.length; i++) {
		str = "";
		for (var r = 0; r < terrain[i].length; r++) {
			str += (terrain[i][r].walkable == true ? 1 : 0) + ",";
		}
		str = "[" + str.slice(0,str.length-1) + "]";
		console.log(str);
	}
}

function printPath(path) {
	var pathString = "[";
	for (var i = 0; i < path.length; i++) {
		pathString += " (" + path[path.length-(i+1)].listX + ", " + path[path.length-(i+1)].listY + ") >";
	}
	pathString = pathString.substring(0,pathString.length-2);
	pathString +="]";
	console.log(pathString);
}

function getNearestSpace(terrain,object) {
	var closestDistance = -1;
	var closestObject = null;
	var centerX = object.centerX();
	var centerY = object.centerY();
	for (var i = 0; i < terrain.length; i++) {
		for (var r = 0; r < terrain[i].length; r++) {
			var distance = getDistance(centerX,centerY,terrain[i][r].centerX(),terrain[i][r].centerY());
			if (closestDistance == -1 || distance < closestDistance) {
				closestDistance = distance;
				closestObject = terrain[i][r];
			}
		}
	}
	return closestObject;
}

function adjacentSpace(terrain,x,y,dir) {
	if (dir == "up") {
		if (x > 0) {
			return terrain[x-1][y];
		}
		return null;
	}
	else if (dir == "down") {
		if (x < terrain.length-1) {
			return terrain[x+1][y];
		}
		return null;
	}
	else if (dir == "left") {
		if (y > 0) {
			return terrain[x][y-1];
		}
		return null;
	}
	else if (dir == "right") {
		if (y < terrain[x].length - 1) {
			return terrain[x][y+1];
		}
		return null;
	}
	else {
		throw "ERROR: getAdjacent direction: '" + dir + "' not recognized";
	}
}

function touchAllAdjacentSpaces(initialSpace) {
	if (initialSpace.touched) {
		var index = tasksUnavailable.objectList.indexOf(initialSpace); //if the task or its contains are in tasksUnavailable, move them back into tasksAvailable now that they've been rediscovered
		if (index != -1) {
			tasksUnavailable.objectList.splice(index,1);
			tasksAvailable.push(initialSpace); //we know its a valid task if its in tasksUnavailable, so no need to check
		}
		for (var i = 0; i < initialSpace.contains.objectList.length; i++) {
			//add each member of contains to tasksavailable if it is currently in tasksUnavailable
			var index = tasksUnavailable.objectList.indexOf(initialSpace.contains.objectList[i]);
			if (index != -1) {
				tasksUnavailable.objectList.splice(index,1);
				tasksAvailable.push(initialSpace.contains.objectList[i]);
			}
		}
		return;
	}
	if (initialSpace.isBuilding == false && (!(initialSpace.walkable || initialSpace.type == "water" || initialSpace.type == "lava"))) {
		if (initialSpace.drillable || initialSpace.explodable) {
			//initialSpace.touched = true;
			var index = tasksUnavailable.objectList.indexOf(initialSpace);
			if (index != -1) {
				tasksUnavailable.objectList.splice(index,1);
			}
			tasksAvailable.push(initialSpace);
		}
		initialSpace.updateTouched(initialSpace.drillable || initialSpace.explodable || (initialSpace.isBuilding == true)); //the buildings.indexOf section of this or statement should no longer be a possible case
		return; //TODO: the above statement has outgrown itself; revise appropriately
	}
	//initialSpace.touched = true;
	initialSpace.updateTouched(true); //need a method for changing touched so that previously unknown spaces that are really ground pieces know to change sprites
	if (initialSpace.sweepable) {
		var index = tasksUnavailable.objectList.indexOf(initialSpace);
		if (index != -1) {
			tasksUnavailable.objectList.splice(index,1);
		}
		tasksAvailable.push(initialSpace);
	}
	if (initialSpace.buildable && initialSpace.resourceNeeded()) { //didnt say else in case a space may be allowed to be both buildable and sweepable at the same time
		var index = tasksUnavailable.objectList.indexOf(initialSpace);
		if (index != -1) {
			tasksUnavailable.objectList.splice(index,1);
		}
		tasksAvailable.push(initialSpace);
	}
	//if (tasksAutomated["collect"] == true) {
	for (var i = 0; i < initialSpace.contains.objectList.length; i++) {
		//add each member of contains to tasksavailable
		var index = tasksUnavailable.objectList.indexOf(initialSpace.contains.objectList[i]);
		if (index != -1) {
			tasksUnavailable.objectList.splice(index,1);
		}
		tasksAvailable.push(initialSpace.contains.objectList[i]);
	}
	//}
	
	var adjacentSpaces = [];
	adjacentSpaces.push(adjacentSpace(terrain,initialSpace.listX,initialSpace.listY,"up"));
	adjacentSpaces.push(adjacentSpace(terrain,initialSpace.listX,initialSpace.listY,"down"));
	adjacentSpaces.push(adjacentSpace(terrain,initialSpace.listX,initialSpace.listY,"left"));
	adjacentSpaces.push(adjacentSpace(terrain,initialSpace.listX,initialSpace.listY,"right"));
	for (var i = 0; i < adjacentSpaces.length; i++) {
		if (adjacentSpaces[i] != null) {
			touchAllAdjacentSpaces(adjacentSpaces[i]);
		}
	}
}

function findClosestStartPath(startObject,paths) {
	//console.log(paths);
	if (paths == null) {
		return null;
	}
	var closestDistance = -1;
	var closestIndex = -1;
	var startObjectCenterX = startObject.centerX();
	var startObjectCenterY = startObject.centerY();
	//console.log("CENTERX: "  + startObjectCenterX + " CENTERY: "  + startObjectCenterY);
	for (var i = 0; i < paths.length; i++) {
		//console.log(path);
		var curDistance = getDistance(startObjectCenterX,startObjectCenterY,paths[i][paths[i].length-1].centerX(),paths[i][paths[i].length-1].centerY());
		//console.log("curDistance: " + curDistance);
		//console.log("myIdx: " + startObject.space.listX + " myIDy: " + startObject.space.listY + " path[" + i + "] centerx: " + paths[i][paths[i].length-1].centerX() + " centery: " + paths[i][paths[i].length-1].centerY() + " idx: " + paths[i][paths[i].length-1].listX + " idy: " + paths[i][paths[i].length-1].listY); //nice infoDump
		//printPath(paths[i]);
		if (closestDistance == -1 || curDistance < closestDistance) {
			closestDistance = curDistance;
			closestIndex = i;
		}
	}
	//console.log("findClosestStartPath closestDistance: " + closestDistance);
	return paths[closestIndex];
}

function calculatePath(terrain,startSpace,goalSpace,returnAllSolutions) { 
	/*find shortest path from startSpace to a space satisfying desiredProperty (note: path goes from end to start, not from start to end)*/
	//if startSpace meets the desired property, return it without doing any further calculations
	if (startSpace == goalSpace) {
		if (!returnAllSolutions) {
			return [goalSpace];
		}
		return [[goalSpace]];
	}
	
	//initialize starting variables
	goalSpace.parents = [];
	
	startSpace.startDistance = 0;
	startSpace.parents = [];
	var closedSet = [];
	var solutions = [];
	var finalPathDistance = -1;
	var openSet = [startSpace]; //TODO: we can speed up the algorithm quite a bit if we use hashing for lookup rather than lists
	//main iteration: keep popping spaces from the back until we have found a solution (or all equal solutions if returnAllSolutions is True) or openSet is empty (in which case there is no solution)
	while (openSet.length > 0) {
				
		var currentSpace = openSet.shift();  //TODO: keep the list sorted in reverse for this algorithm so that you can insert and remove from the back of the list rather than shifting all of the elements when inserting and removing (minor performance improvement)
		closedSet.push(currentSpace);
		var adjacentSpaces = [];
		adjacentSpaces.push(adjacentSpace(terrain,currentSpace.listX,currentSpace.listY,"up"));
		adjacentSpaces.push(adjacentSpace(terrain,currentSpace.listX,currentSpace.listY,"down"));
		adjacentSpaces.push(adjacentSpace(terrain,currentSpace.listX,currentSpace.listY,"left"));
		adjacentSpaces.push(adjacentSpace(terrain,currentSpace.listX,currentSpace.listY,"right"));
		
		//main inner iteration: check each space in adjacentSpaces for validity
		for (var k = 0; k < adjacentSpaces.length; k++) {
			//if returnAllSolutions is True and we have surpassed finalPathDistance, exit immediately
			if ((finalPathDistance != -1) && (currentSpace.startDistance + 1 > finalPathDistance)) {
				return solutions;
			}
			
			var newSpace = adjacentSpaces[k];
			
			//check this here so that the algorithm is a little bit faster, but also so that paths to non-walkable terrain pieces (such as for drilling) will work
			//if the newSpace is a goal, find a path back to startSpace (or all equal paths if returnAllSolutions is True)
			if (newSpace == goalSpace) {
				newSpace.parents = [currentSpace]; //start the path with currentSpace and work our way back
				pathsFound = [[newSpace]];
				
				//grow out the list of paths back in pathsFound until all valid paths have been exhausted
				while (pathsFound.length > 0) {
					if (pathsFound[0][pathsFound[0].length-1].parents[0] == startSpace) { //we've reached the start space, thus completing this path
						if (!returnAllSolutions) {
							return pathsFound[0];
						}
						finalPathDistance = pathsFound[0].length;
						solutions.push(pathsFound.shift());
						continue;
						
					}
					//branch additional paths for each parent of the current path's current space
					for (var i = 0; i < pathsFound[0][pathsFound[0].length-1].parents.length; i++) {
						if (i == pathsFound[0][pathsFound[0].length-1].parents.length - 1) {
							pathsFound[0].push(pathsFound[0][pathsFound[0].length-1].parents[i]);
						}
						else {
							pathsFound.push(pathsFound[0].slice());
							pathsFound[pathsFound.length-1].push(pathsFound[0][pathsFound[0].length-1].parents[i]);
						}
					}
				}
			}
			
			//attempt to keep branching from newSpace as long as it is a walkable type
			if ((newSpace != null) && (newSpace.walkable == true)) {					
				
				var newStartDistance = currentSpace.startDistance + 1;
				var notInOpenSet = openSet.indexOf(newSpace) == -1;
				
				//don't bother with newSpace if it has already been visited unless our new distance from the start space is smaller than its existing startDistance
				if ((closedSet.indexOf(newSpace) != -1) && (newSpace.startDistance < newStartDistance)) {
					continue;
				}
				
				//accept newSpace if newSpace has not yet been visited or its new distance from the start space is equal to its existing startDistance
				if (notInOpenSet || newSpace.startDistance == newStartDistance) { 
					if (notInOpenSet) { //only reset parent list if this is the first time we are visiting newSpace
						newSpace.parents = [];
					}
					newSpace.parents.push(currentSpace);
					newSpace.startDistance = newStartDistance;
					if (notInOpenSet) { //if newSpace does not yet exist in the open set, insert it into the appropriate position using a binary search
						openSet.splice(binarySearch(openSet,newSpace,"startDistance",true),0,newSpace);
					}
				}
				
			}
		}
	}
	if (solutions.length == 0) { //if solutions is null then that means that no path was found
		return null;
	}
	return solutions; 
	
}

function resourceAvailable(resourceType) {
	if (collectedResources[resourceType] - reservedResources[resourceType] > 0) {
		return true;
	}
	return false;
}

function populateTestLevel() {
	if (terrainMapName == "test level 1.js" || terrainMapName == "test level 2.js") { //create some test objects if we have loaded in one of the test levels (deprecated)
		collectables.push(new Collectable(terrain[3][4],"ore"));
		collectables.push(new Collectable(terrain[3][5],"ore"));
		collectables.push(new Collectable(terrain[2][5],"ore"));
		collectables.push(new Collectable(terrain[1][5],"ore"));
	}
}

function populateTestCollision() {
	var testRaider = new Raider(terrain[0][0]);
	var testOre = new Collectable(terrain[0][0],"ore");
	testRaider.x = 10;
	testRaider.y = 34.9;
	testRaider.drawAngle = Math.PI / 2;
	testOre.x = 11;
	testOre.y = 28;
	console.log("COLLISION TEST: " + collisionRect(testRaider,testOre,false));
}

function loadLevelData(name) {
	levelName = name;
	terrainMapName = "Surf_" + levelName + ".js";
	cryoreMapName = "Cror_" + levelName + ".js"; //TODO: CONTINUE ADDING NEW MAPS TO THIS BLOCK OF CODE AND CLEANING IT UP, AND ADD CHECKS IN CASE ANY MAP DOESN'T EXIST FOR THE LEVEL BEING LOADED
	olFileName = levelName + ".js";
	predugMapName = "Dugg_" + levelName + ".js";
	surfaceMapName = "High_" + levelName + ".js";
	pathMapName = "path_" + levelName + ".js";
	fallinMapName = "Fall_" + levelName + ".js";
	
	//load in Space types from terrain, surface, and path maps
	for (var i = 0; i < GameManager.scriptObjects[terrainMapName].level.length; i++) { 
		terrain.push([]);
		for (var r = 0; r < GameManager.scriptObjects[terrainMapName].level[i].length; r++) {
			
			if (GameManager.scriptObjects[pathMapName] && GameManager.scriptObjects[pathMapName].level[i][r] == 1) { //give the path map the highest priority, if it exists
				terrain[i].push(new Space(100,i,r,GameManager.scriptObjects[surfaceMapName].level[i][r]));	
			}
			else if (GameManager.scriptObjects[pathMapName] && GameManager.scriptObjects[pathMapName].level[i][r] == 2) {
				terrain[i].push(new Space(-1,i,r,GameManager.scriptObjects[surfaceMapName].level[i][r]));	
			}
			else {
				if (GameManager.scriptObjects[predugMapName].level[i][r] == 0) {
					if (GameManager.scriptObjects[terrainMapName].level[i][r] == 5) { //soil(5) was removed pre-release, so replace it with dirt(4)
						terrain[i].push(new Space(4,i,r,GameManager.scriptObjects[surfaceMapName].level[i][r]));	
					}
					else {
						terrain[i].push(new Space(GameManager.scriptObjects[terrainMapName].level[i][r],i,r, GameManager.scriptObjects[surfaceMapName].level[i][r]));
					}
				}
						
				else if (GameManager.scriptObjects[predugMapName].level[i][r] == 3 || GameManager.scriptObjects[predugMapName].level[i][r] == 4) {
					terrain[i].push(new Space(GameManager.scriptObjects[predugMapName*10].level[i][r],i,r, GameManager.scriptObjects[surfaceMapName].level[i][r]));
				}
				else if (GameManager.scriptObjects[predugMapName].level[i][r] == 1 || GameManager.scriptObjects[predugMapName].level[i][r] == 2) {
					if (GameManager.scriptObjects[terrainMapName].level[i][r] == 6) {
						terrain[i].push(new Space(6,i,r, GameManager.scriptObjects[surfaceMapName].level[i][r]));
					}
					else if (GameManager.scriptObjects[terrainMapName].level[i][r] == 9) {
						terrain[i].push(new Space(9,i,r, GameManager.scriptObjects[surfaceMapName].level[i][r]));
					}
					else {
						terrain[i].push(new Space(0,i,r, GameManager.scriptObjects[surfaceMapName].level[i][r]));
					}
				}
				
				var currentCryOre = GameManager.scriptObjects[cryoreMapName].level[i][r];
				if (currentCryOre % 2 == 1) {
					terrain[i][r].containedCrystals = (currentCryOre + 1) / 2;
				}
				else {
					terrain[i][r].containedOre = currentCryOre / 2;
				}	
			}
		}
	}

	//ensure that any walls which do not meet the 'supported' requirement crumble at the start
	for (var i = 0; i < GameManager.scriptObjects[predugMapName].level.length; i++) { 
		for (var r = 0; r < GameManager.scriptObjects[predugMapName].level[i].length; r++) {
			if (terrain[i][r].isWall) {
				terrain[i][r].checkWallSupported();
			}
		}
	}

	//'touch' all exposed spaces in the predug map so that they appear as visible from the start
	for (var i = 0; i < GameManager.scriptObjects[predugMapName].level.length; i++) { 
		for (var r = 0; r < GameManager.scriptObjects[predugMapName].level[i].length; r++) {
			var currentPredug = GameManager.scriptObjects[predugMapName].level[i][r];
			if (currentPredug == 1 || currentPredug == 3) {
				touchAllAdjacentSpaces(terrain[i][r]); //i dont like that this is being called for each space individually, but there shouldn't be any overlap, just seems kinda overkill
			}
		}
	}
	
	//add land-slide frequency to Spaces
	if (GameManager.scriptObjects[fallinMapName]) {
		for (var i = 0; i < GameManager.scriptObjects[fallinMapName].level.length; i++) { 
			for (var r = 0; r < GameManager.scriptObjects[fallinMapName].level[i].length; r++) {
				terrain[i][r].landSlideFrequency = GameManager.scriptObjects[fallinMapName].level[i][r];
			}
		}
	}

	//load in non-space objects next
	for (var olObjectName in GameManager.scriptObjects[olFileName]) {
		var olObject = GameManager.scriptObjects[olFileName][olObjectName];
	    if (olObject.type == "TVCamera") {
	    	gameLayer.cameraX = olObject.xPos*tileSize; //note: coords need to be rescaled since 1 unit in LRR is 1, but 1 unit in the remake is 128 (tile size)
	    	gameLayer.cameraY = olObject.yPos*tileSize; //note: x/y coords should be the same, but x/y position in terrain list is inverted since terrain list is Y,X format
	    	gameLayer.cameraX -= parseInt(GameManager.screenWidth/2,10);
	    	gameLayer.cameraY -= parseInt(GameManager.screenHeight/2,10);//center the camera
	    }
	    else if (olObject.type == "Pilot") {
	    	var newRaider = new Raider(terrain[parseInt(olObject.yPos,10)][parseInt(olObject.xPos,10)]); //note inverted x/y coords for terrain list
	    	newRaider.setCenterX(olObject.xPos*tileSize);
	    	newRaider.setCenterY(olObject.yPos*tileSize);
	    	newRaider.drawAngle = (olObject.heading-90)/180*Math.PI; //heading angle appears to be 90 degrees rotated clockwise relative to the remake (this should be because i setup the sprites to face right by default rather than up); also needs to be converted to radians
	    	raiders.push(newRaider);
	    }
	    else if (olObject.type == "Toolstation") {
	    	var currentSpace = terrain[parseInt(olObject.yPos,10)][parseInt(olObject.xPos,10)];
	    	currentSpace.setTypeProperties("tool store");
	    	var powerPathSpace = null;
	    	var headingDir = Math.round(olObject.heading); //don't do an int conversion here as we need this to be exactly one of 4 values
	    	if (headingDir == 0) {
	    		powerPathSpace = adjacentSpace(terrain,currentSpace.listX,currentSpace.listY,"up");
	    	}
	    	else if (headingDir == 90) {
	    		powerPathSpace = adjacentSpace(terrain,currentSpace.listX,currentSpace.listY,"right");
	    	}
	    	else if (headingDir == 180) {
	    		powerPathSpace = adjacentSpace(terrain,currentSpace.listX,currentSpace.listY,"down");
	    	}
	    	else if (headingDir == 270) {
	    		powerPathSpace = adjacentSpace(terrain,currentSpace.listX,currentSpace.listY,"left");
	    	}
	    	currentSpace.powerPathSpace = powerPathSpace;
	    	currentSpace.powerPathSpace.setTypeProperties("power path");
	    	currentSpace.headingAngle = (headingDir-180)/180*Math.PI; //use an angle variable separate from drawAngle so that the object does not draw a rotated image when in the fog
	    }
	}
}

function taskType(task,raider) { //optional raider flag allows us to determine what the raider is doing from additional task related variables
	if (typeof task == "undefined" || task == null) {
		return null;
	}
	if (typeof task.drillable != "undefined" && task.drillable == true) {
		return "drill";
	}
	if (typeof task.sweepable != "undefined" && task.sweepable == true) {
		return "sweep";
	}
	if (typeof task.buildable != "undefined" && task.buildable == true) {
		return "build";
	}
	if (typeof task.space != "undefined") {
		return "collect";
	}
	if (typeof task.isBuilding != "undefined" && task.isBuilding == true && task.type == "tool store") {
		return (raider != null && raider.getToolName != null) ? "get tool" : "upgrade";
	}
}

function createRaider() {
	var toolStore = null;
	for (var i = 0; i < buildings.length; i++) {
		if (buildings[i].type == "tool store") {
			toolStore = buildings[i];
			break;
		}
	}
	if (toolStore == null) {
		return;
	}
	raiders.push(new Raider(toolStore.powerPathSpace));
	
}

function cancelSelection() {
	selection = [];
	selectionType = null;
}

function checkUpdateClickSelection() {
	if (GameManager.mouseReleasedLeft) { //ignore mouse clicks if they landed on a part of the UI
		var raiderSelected = null; //don't bother polling for more than one raider click since they are guaranteed to have the same drawDepth, meaning choosing one is arbitrary - might as well go with the first one found
		for (var i = 0; i < raiders.objectList.length; i++) {
			if (collisionPoint(GameManager.mouseReleasedPosLeft.x,GameManager.mouseReleasedPosLeft.y,raiders.objectList[i],raiders.objectList[i].affectedByCamera)) {
				raiderSelected = raiders.objectList[i];
				break;
			}
		}
		if (raiderSelected != null) {
			selection = [raiderSelected];
			selectionType = "raider";
		}
		
		else {	
			var itemSelected = null; 
			for (var i = 0; i < collectables.objectList.length; i++) {
				if (collisionPoint(GameManager.mouseReleasedPosLeft.x,GameManager.mouseReleasedPosLeft.y,collectables.objectList[i],collectables.objectList[i].affectedByCamera)) {
					itemSelected = collectables.objectList[i];
					break;
				}
			}
			if (itemSelected != null) {
				selection = [itemSelected];
				selectionType = itemSelected.type;
			}
			
			else {
				var spaceSelected = null;
				for (var i = 0; i < terrain.length; i++) {
					for (var r = 0; r < terrain[i].length; r++) {
						if (collisionPoint(GameManager.mouseReleasedPosLeft.x,GameManager.mouseReleasedPosLeft.y,terrain[i][r],terrain[i][r].affectedByCamera)) {
							spaceSelected = terrain[i][r];
							break;
						}
					}
				}
				if (spaceSelected != null) {
					selection = [spaceSelected];
					selectionType = spaceSelected.touched == true ? spaceSelected.type : "solid rock";
				}
			}
		}
			
	}
}

function checkUpdateSelectionType() {
	if (selection.length == 0) {
		return;
	}
	for (var i = selection.length-1; i >= 0; --i) {
		if (selection[i].dead == true) {
			selection.splice(i,1);
		}
	}
	if (selection.length == 0) {
		cancelSelection();
		return;
	}
	if (selection[0] instanceof Space) {
		selectionType = selection[0].touched == true ? selection[0].type : "solid rock";
	}
}

function checkUpdateCtrlSelection() {
	if (GameManager.keyStates[String.fromCharCode(17)] == true) { //if ctrl key is currently pressed
		if (selectionRectCoords.x1 == null) {
			selectionRectCoords.x1 = GameManager.mousePos.x;
			selectionRectCoords.y1 = GameManager.mousePos.y;
		}
		//determine top-left corner to draw rect
		selectionRectPointList = [null,null,null,null]; //[xMin, yMin, xMax, yMax];
		selectionRectCoordList = [selectionRectCoords.x1,selectionRectCoords.y1,GameManager.mousePos.x,GameManager.mousePos.y];
		for (var i = 0; i < 4; i++) {
			if (selectionRectPointList[i%2] == null || selectionRectCoordList[i] < selectionRectPointList[i%2]) {
				selectionRectPointList[i%2] = selectionRectCoordList[i]; 
			}
			if (selectionRectPointList[(i%2)+2] == null || selectionRectCoordList[i] > selectionRectPointList[(i%2)+2]) { 
				selectionRectPointList[(i%2)+2] = selectionRectCoordList[i];
			}
		}
	}
	else {
		if (selectionRectCoords.x1 != null) {
			selectionRectCoords.x1 = null;
			selectionRectCoords.y1 = null;
			selectionRectObject.rect.width = selectionRectPointList[2]-selectionRectPointList[0];
			selectionRectObject.rect.height = selectionRectPointList[3]-selectionRectPointList[1];
			selectionRectObject.x = selectionRectPointList[0] + selectionRectObject.drawLayer.cameraX;
			selectionRectObject.y = selectionRectPointList[1] + selectionRectObject.drawLayer.cameraY;
			//console.log("X: " + selectionRectObject.x + " Y: "  + selectionRectObject.y + " rectWidth: " + selectionRectObject.rect.width + " rectHeight: " + selectionRectObject.rect.height);
			var collidingRaiders = [];
			for (var i = 0; i < raiders.objectList.length; i++) {
				if (collisionRect(selectionRectObject,raiders.objectList[i])) {
					collidingRaiders.push(raiders.objectList[i]);
				}
			}
			//console.log(collidingRaiders.length);
			if (collidingRaiders.length > 0) {
				//set selection to all of the raiders contained within the selection Rect
				selectionType = "raider";
				selection = collidingRaiders;
			}
		}
	}
}

function checkAssignSelectionTask() {
	if (GameManager.mouseReleasedRight && selection.length != 0 && selectionType == "raider") {
		 //TODO: THIS IS A BIG CHUNK OF REPEAT CODE FROM THE LEFTCLICK TASK DETECTION, THIS DESERVES ITS OWN METHOD FOR SURE
		var clickedTasks = [];
		for (var p = 0; p < terrain.length; p++) {
			for (var r = 0; r < terrain[p].length; r++) {
				var initialSpace = terrain[p][r];
				for (var j = 0; j < terrain[p][r].contains.objectList.length + 1; j++) {
					if (collisionPoint(GameManager.mouseReleasedPosRight.x,GameManager.mouseReleasedPosRight.y,initialSpace,initialSpace.affectedByCamera) && ((tasksAvailable.indexOf(initialSpace) != -1) || (tasksInProgress.objectList.indexOf(initialSpace) != -1))) { //don't do anything if the task is already taken by another raider, we don't want to readd it to the task queue
						if ((j == 0 && (initialSpace.drillable || initialSpace.sweepable || initialSpace.buildable)) || j > 0) { //could optimize by only continuing if j == 1 and initialSpace.walkable == true but won't for now as unwalkable spaces shouldnt have any items in contains anyway
							clickedTasks.push(initialSpace);
							if (debug) {
								console.log("TERRAIN OL LENGTH + 1: " + (terrain[p][r].contains.objectList.length + 1));
							}
						}
					}
					//could optimize by breaking if theres no collision on the square itself rather than checking contains as well, but won't for now as if a contains is on the edge of a space this will cause it to become unclickable except when clicking on the space as well
					initialSpace = terrain[p][r].contains.objectList[j]; //TODO: RENAME INITIALSPACE NOW THAT IT IS USED FOR COLLECTABLES TOO
				}
			}
		}
		if (clickedTasks.length > 0) {
			var lowestDrawDepthValue = clickedTasks[0].drawDepth;
			var lowestDrawDepthId = 0;
			var inProgress = tasksInProgress.objectList.indexOf(clickedTasks[0]) != -1; //prioritize tasks that are not in progress in the event that multiple tasks are clicked at once
			for (var p = 1; p < clickedTasks.length; p++) {
				var curInProgress = tasksInProgress.objectList.indexOf(clickedTasks[p]) != -1;
				if (curInProgress == inProgress && clickedTasks[p].drawDepth < lowestDrawDepthValue || (inProgress == true && curInProgress == false)) {
					lowestDrawDepthValue = clickedTasks[p].drawDepth;
					lowestDrawDepthId = p;
					if (curInProgress == false) {
						inProgress = false;
					}
				}
			}
			if (debug) {
				console.log("IN PROGESS?: " + inProgress + " CLICKED TASKS LENGTH: " + clickedTasks.length);
			}
			var selectedTask = clickedTasks[lowestDrawDepthId];
			
			var index = tasksUnavailable.objectList.indexOf(selectedTask);
			if (index != -1) {
				tasksUnavailable.objectList.splice(index,1);
			}		
			for (var i = 0; i < selection.length; i++) {	//TODO: allow certain tasks to be performed by raiders even if they are holding something
			if (selection[i].currentTask == null && selection[i].holding == null) { //raiders are the only valid selection[i] type for now; later on any Space (and maybe collectables as well?) or vehicle, etc.. will be a valid selection[i] as even though these things cannot be assigned tasks they can be added to the high priority task queue as well as create menu buttons
					
					//selectedTask.taskPriority = 1;
					if (toolsRequired[selection[i].getTaskType(selectedTask)] == undefined || selection[i].tools.indexOf(toolsRequired[selection[i].getTaskType(selectedTask)]) != -1) {
						
						var index = tasksAvailable.indexOf(selectedTask);
						if (index != -1) { //this check should no longer be necessary
							tasksAvailable.splice(index,1);
						} 
						else {
							if (taskType(selectedTask) == "collect") {
								break;
							}
						}
						selection[i].currentTask = selectedTask;
						selection[i].currentObjective = selectedTask;
						
						if (tasksInProgress.objectList.indexOf(selectedTask) == -1) {
							tasksInProgress.push(selectedTask);
						}
						
						//TODO: cleanup the code at the top of the Raider class which deals with choosing a task, stick it in a method, and reuse it here for simplicity
						selection[i].currentPath = findClosestStartPath(selection[i],calculatePath(terrain,selection[i].space,typeof selectedTask.space == "undefined" ? selectedTask: selectedTask.space,true));
						selection[i].checkChooseCloserEquivalentResource();
					}
				}
			}
		}
	}
}

function unloadMinifig() {
	if (selection.length == 0) {
		return;
	}
	for (var i = 0; i < selection.length; i++) {
		if ( selection[i].holding == null) {
			continue;
		}
		var newCollectable = new Collectable(getNearestSpace(terrain,selection[i]),selection[i].holding.type);
		collectables.push(newCollectable);
		tasksAvailable.push(newCollectable);
		selection[i].holding.die();
		selection[i].clearTask(); //modifications made to clearTask should now mean that if any resources were reserved from the resource collection or dedicated to a building site, the dedication numbers have been correctly decremented
	}
}

function grabItem() {
	if (selection.length == 0) {
		return;
	}
	for (var i = 0; i < selection.length; i++) {
		var curIndex = tasksAvailable.indexOf(selection[i]);
		if (curIndex != -1) {
			selection[i].taskPriority = 1;
		}
	}
}

function reinforceWall() {
	if (selection.length == 0) {
		return;
	}
}

function drillWall() {
	if (selection.length == 0) {
		return;
	}
	for (var i = 0; i < selection.length; i++) {
		var curIndex = tasksAvailable.indexOf(selection[i]);
		if (curIndex != -1) {
			selection[i].taskPriority = 1;
		}
	}
}

function clearRubble() {
	if (selection.length == 0) {
		return;
	}
	for (var i = 0; i < selection.length; i++) {
		var curIndex = tasksAvailable.indexOf(selection[i]);
		if (curIndex != -1) {
			selection[i].taskPriority = 1;
		}
	}
}

function buildPowerPath() {
	if (selection.length == 0) {
		return;
	}
	for (var i = 0; i < selection.length; i++) {
		if (selection[i].type == "ground") {
			selection[i].buildingSiteType = "power path"; //this should probably be assigned somewhere else..
			selection[i].setTypeProperties("building site"); 
			tasksAvailable.push(selection[i]);
		}
	}
}

function upgradeBuilding() {
	for (var i = 0; i < selection.length; ++i) {
		selection[i].upgrade();
	}
}

function upgradeRaider() { //TODO: take the 'find path to toolstore' code from this and getTool, and give it its own method.
	for (var i = 0; i < selection.length; i++) {
		if (selection[i].currentObjective == null && selection[i].holding == null && selection[i].upgradeLevel < 3) {
			var newPath = null;
			var buildingIndex = null;
			for (var j = 0; j < buildings.length; j++) {
				buildingIndex = j;
				if (buildings[j].type == "tool store") {
					newPath = findClosestStartPath(selection[i],calculatePath(terrain,selection[i].space,buildings[j],true));
					if (newPath != null) { //TODO: find the closest pathable tool store, rather than simply the first pathable one
						break;
					}
				}
			}
			if (newPath == null) {
				return; //no toolstore found or unable to path to any toolstores
			}
			selection[i].currentTask = buildings[buildingIndex];
			selection[i].currentPath = newPath;
			selection[i].currentObjective = selection[i].currentTask;
		}
	}
}

function getTool(toolName) {
	for (var i = 0; i < selection.length; i++) {
		if (selection[i].currentObjective == null && selection[i].holding == null && selection[i].tools.indexOf(toolName) == -1) { //&& selection[i].tools.length < selection[i].maxTools) {
			var newPath = null;
			var buildingIndex = null;
			for (var j = 0; j < buildings.length; j++) {
				buildingIndex = j;
				if (buildings[j].type == "tool store") {
					newPath = findClosestStartPath(selection[i],calculatePath(terrain,selection[i].space,buildings[j],true));
					if (newPath != null) {
						break;
					}
				}
			}
			if (newPath == null) {
				return; //no toolstore found or unable to path to any toolstores
			}
			selection[i].currentTask = buildings[buildingIndex];
			selection[i].currentPath = newPath;
			selection[i].currentObjective = selection[i].currentTask;
			selection[i].getToolName = toolName;
			//TODO: consider setting task priority here, as well as adding getTool task to tasksInProgreess
		}
	}
}

function pauseGame() {
	paused = !paused;
}

function changeLevels(levelName) {
	if (levelName == null) {
		levelName = "03";
	}
	resetLevelVars(levelName);
}

function checkTogglePause() {
	if (GameManager.keyStates[String.fromCharCode(80)]) {
		holdingPKey = true;
	}
	else {
		if (holdingPKey) {
			pauseGame();
			holdingPKey = false;
		}
	}
	if (GameManager.keyStates[String.fromCharCode(76)]) {
		holdingLKey = true;
	}
	else {
		if (holdingLKey) {
			//returnToMainMenu();
			holdingLKey = false;
		}
	}
}

function stopMinifig() {
	if (selection.length == 0) {
		return;
	}
	for (var i = 0; i < selection.length; i++) {
		if (selection[i].currentTask == null) {
			continue;
		}
		if (selection[i].holding == null) { //this should cover the "collect" taskType, as well as "build" and any other task type which involves a held object, as we don't want that object to be duplicated
			tasksAvailable.push(selection[i].currentTask);
		}
		if (selection[i].currentTask.grabPercent != null && selection[i].currentTask.grabPercent < 100) { //still undecided as to whether or not this logic statement should be moved inside the above condition (selection[i].holding == null)
			selection[i].currentTask.grabPercent = 0;
		}
		var currentlyHeld = selection[i].holding;
		selection[i].clearTask(); //modifications made to clearTask should now mean that if any resources were reserved from the resource collection or dedicated to a building site, the dedication numbers have been correctly decremented
		selection[i].holding = currentlyHeld; //won't have any effect if it was already null
		if (selection[i].holding != null) {
			selection[i].holding.grabPercent = 100; //if the raider was in the process of putting down a collectable but was interrupted, reset its grabPercent as it does't make sense for a collectable to be 'partially put down' after the raider is stopped			
		}
	}
}

function checkScrollScreen() {
	if (mousePanning) { //can you scroll by hovering the mouse at the corner of the screen?
		if (GameManager.mousePos.x < scrollDistance) {
			gameLayer.cameraX -= scrollSpeed;
		}
		else if (GameManager.mousePos.x > GameManager.screenWidth - scrollDistance) {
			gameLayer.cameraX += scrollSpeed;
		}
		if (GameManager.mousePos.y < scrollDistance) {
			gameLayer.cameraY -= scrollSpeed;
		}
		else if (GameManager.mousePos.y > GameManager.screenHeight - scrollDistance) {
			gameLayer.cameraY += scrollSpeed;
		}
	}
	if (keyboardPanning) { //can you scroll using the arrow keys?
		if (GameManager.keyStates[String.fromCharCode(37)]) {
			gameLayer.cameraX -= scrollSpeed;
		}
		else if (GameManager.keyStates[String.fromCharCode(39)]) {
			gameLayer.cameraX += scrollSpeed;
		}
		if (GameManager.keyStates[String.fromCharCode(38)]) {
			gameLayer.cameraY -= scrollSpeed;
		}
		else if (GameManager.keyStates[String.fromCharCode(40)]) {
			gameLayer.cameraY += scrollSpeed;
		}
	}
}

function drawTerrainVars(varNames) {
	GameManager.drawSurface.fillStyle = "rgb(255, 0, 0)";
	GameManager.setFontSize(24);
	for (var i = 0; i < terrain.length; i++) {
		for (var r = 0; r < terrain[i].length; r++) {
			concatString = "";
			for (var j = 0; j < varNames.length; ++j) {
				concatString += (terrain[i][r])[varNames[j]] + (j == varNames.length - 1 ? "" : ", ");
			}
			GameManager.drawText(concatString,terrain[i][r].centerX()-terrain[i][r].drawLayer.cameraX,terrain[i][r].centerY()-terrain[i][r].drawLayer.cameraY,true,true);
		}
	}
}

function drawRaiderTasks() {
	GameManager.setFontSize(36);
	GameManager.drawSurface.fillStyle = "rgb(200, 220, 255)";
	for (var i = 0; i < raiders.objectList.length; i++) {
		GameManager.drawText(raiders.objectList[i].getTaskType(raiders.objectList[i].currentTask),raiders.objectList[i].centerX()-raiders.objectList[i].drawLayer.cameraX,raiders.objectList[i].y-raiders.objectList[i].drawLayer.cameraY,true);
	}
}

function drawBuildingSiteMaterials() {
	GameManager.setFontSize(48);
	GameManager.drawSurface.fillStyle = "rgb(165, 100, 255)";
	for (var i = 0; i < buildingSites.length; i++) {
		GameManager.drawText("Ore: " + buildingSites[i].placedResources["ore"] + "/" + buildingSites[i].requiredResources["ore"],buildingSites[i].centerX()-buildingSites[i].drawLayer.cameraX,buildingSites[i].y-buildingSites[i].drawLayer.cameraY,true);
	}
}

function drawUI() {
	GameManager.setFontSize(48);
	GameManager.drawSurface.fillStyle = "rgb(65, 218, 0)";
	GameManager.drawSurface.fillText("Ore: " + collectedResources["ore"],600,40);
	GameManager.drawSurface.fillText("Energy Crystals: " + collectedResources["crystal"],341,100);
	GameManager.setFontSize(36);
	GameManager.drawSurface.fillText("Selection Type: " + selectionType + (selectionType == null ? "" : (" x " + selection.length)),8,592); //to be replaced with classic green selection rectangle	
	
	for (var i = 0; i < buttons.objectList.length; ++i) { //attempt to draw buttons here so that they are rendered in front of other post-render graphics
		buttons.objectList[i].render(GameManager);
	}
}

function drawSelectionBox() {
	if (selectionRectCoords.x1 != null) {
		GameManager.drawSurface.strokeStyle = "rgb(0,255,0)";
		GameManager.drawSurface.fillStyle = "rgb(0,255,0)";
		GameManager.drawSurface.lineWidth = 3;
		GameManager.drawSurface.beginPath();
		GameManager.drawSurface.rect(selectionRectPointList[0],selectionRectPointList[1],selectionRectPointList[2]-selectionRectPointList[0],selectionRectPointList[3]-selectionRectPointList[1]);
		GameManager.drawSurface.globalAlpha=0.3;
		GameManager.drawSurface.fillRect(selectionRectPointList[0],selectionRectPointList[1],selectionRectPointList[2]-selectionRectPointList[0],selectionRectPointList[3]-selectionRectPointList[1]);
		GameManager.drawSurface.globalAlpha=1;
		GameManager.drawSurface.stroke();
	}
}

function drawSelectedSquares() {
	GameManager.drawSurface.strokeStyle = "rgb(0,255,0)";
	GameManager.drawSurface.fillStyle = "rgb(0,255,0)";
	GameManager.drawSurface.lineWidth = 2;
	for (var i = 0; i < selection.length; i++) {
		if (selectionType == "raider") {
			GameManager.drawSurface.strokeStyle = "rgb(0,255,0)";
			//draw smallest bounding square
			GameManager.drawSurface.beginPath();
			var rectMaxLength = Math.max(selection[i].rect.width,selection[i].rect.height);
			var halfRectMaxLength = rectMaxLength/2;
			GameManager.drawSurface.rect(selection[i].centerX() - halfRectMaxLength - selection[i].drawLayer.cameraX,selection[i].centerY() - halfRectMaxLength - selection[i].drawLayer.cameraY,rectMaxLength,rectMaxLength);
			GameManager.drawSurface.stroke();	
		}
		else {
			 GameManager.drawSurface.globalAlpha=0.3;
			 GameManager.drawSurface.fillRect(selection[i].x - selection[i].drawLayer.cameraX,selection[i].y - selection[i].drawLayer.cameraY,selection[i].rect.width,selection[i].rect.height);
			 GameManager.drawSurface.globalAlpha=1;
		}
	}
}

function drawSelectedRects() {
	if (selectionType == "raider") {
		GameManager.drawSurface.lineWidth = 2;
		GameManager.drawSurface.fillStyle = "rgb(255,0,0)";
		GameManager.drawSurface.strokeStyle = "rgb(255,0,0)";
		for (var i = 0; i < selection.length; i++) {
			//draw smallest rotated bounding rect
			var rectPoints = calculateRectPoints(selection[i],false);
			GameManager.drawSurface.beginPath();
			GameManager.drawSurface.moveTo(rectPoints[rectPoints.length-1].x - selection[i].drawLayer.cameraX,rectPoints[rectPoints.length-1].y - selection[i].drawLayer.cameraY);
			for (var r = 0; r < rectPoints.length; r++) {
				GameManager.drawSurface.lineTo(rectPoints[r].x - selection[i].drawLayer.cameraX,rectPoints[r].y - selection[i].drawLayer.cameraY);
			}
			GameManager.drawSurface.stroke();
			GameManager.drawSurface.globalAlpha=0.3;
			GameManager.drawSurface.fill();
			GameManager.drawSurface.globalAlpha=1;
		}
	}
}

function highlightRaiderPaths() {
	var path;
	for (var r = 0; r < raiders.objectList.length; ++r) {
		path = raiders.objectList[r].currentPath;
		if (path == null) {
			continue;
		}
		for (var i = 0; i < path.length; ++i) {
			GameManager.drawSurface.beginPath();
			var rectMaxLength = Math.max(path[i].rect.width,path[i].rect.height);
			var halfRectMaxLength = rectMaxLength/2;
			GameManager.drawSurface.rect(path[i].centerX() - halfRectMaxLength - path[i].drawLayer.cameraX,path[i].centerY() - halfRectMaxLength - path[i].drawLayer.cameraY,rectMaxLength,rectMaxLength);
			GameManager.drawSurface.stroke();	
		}	
	}
}

function dimScreen(dimPercentage) { //darken screen by dimPercentage
	var prevGlobalAlpha = GameManager.drawSurface.globalAlpha;
	GameManager.drawSurface.globalAlpha=dimPercentage;
	GameManager.drawSurface.fillStyle = "rgb(0,0,0)";
	GameManager.drawSurface.fillRect(0,0,GameManager.screenWidth,GameManager.screenHeight); //darken screen while awaitingStart
	GameManager.drawSurface.globalAlpha=prevGlobalAlpha;
	
}

function drawAwaitingStartInstructions() { //draw game start instructions if awaitingStart
	if (awaitingStart) { //draw game start instructions if awaitingStart
		dimScreen(.4);
		GameManager.drawSurface.globalAlpha=1.0;
		GameManager.drawSurface.fillStyle = "rgb(65, 218, 255)";
		GameManager.setFontSize(72);
		GameManager.drawSurface.fillText("Press Enter to Begin",70,322); //TODO: CENTER THIS AUTOMATICALLY, RATHER THAN ESTIMATING MANUALLY
	}
}

function drawScoreScreenButtons() {
	for (var i = 0; i < scoreScreenButtons.objectList.length; ++i) {
		scoreScreenButtons.objectList[i].render(GameManager);
	}
}

function drawPauseInstructions() {
	if (paused) {
		dimScreen(.4);
		GameManager.drawSurface.globalAlpha=1.0;
		GameManager.drawSurface.fillStyle = "rgb(65, 218, 255)";
		GameManager.setFontSize(72);
		GameManager.drawSurface.fillText("Paused",278,322); //TODO: CENTER THIS AUTOMATICALLY, RATHER THAN ESTIMATING MANUALLY 
		for (var i = 0; i < pauseButtons.objectList.length; ++i) { //attempt to draw buttons here so that they are rendered in front of other post-render graphics
			pauseButtons.objectList[i].render(GameManager);
		}
	}
}

function mouseOverGUI() {
	for (var i = 0; i < buttons.objectList.length; i++) {
		if (buttons.objectList[i].visible && collisionPoint(GameManager.mousePos.x,GameManager.mousePos.y,buttons.objectList[i],buttons.objectList[i].affectedByCamera)) { //use mouseDownOnButton rather than releasedThisFrame because button activates on mouse release, whereas task selection here activates on mouse press
			return true;
		}
	}
	return false;
}

function createButtons() {
	buttons.push(new Button(0,0,0,0,"teleport raider button 1 (1).png",gameLayer,"", createRaider,false,false));
	buttons.push(new Button(46,0,0,0,"cancel selection button 1 (1).png",gameLayer,"", cancelSelection,false,false,[])); //if selectionTypeBound is an empty list, the button will be visible for all selections except when selection == null
	//6 pixel boundary between general purpose buttons and selection specific buttons

	//raider selected buttons
	buttons.push(new Button(86,0,0,0,"unload minifig button 1 (1).png",gameLayer,"", unloadMinifig,false,false,["raider"]));
	buttons.push(new Button(126,0,0,0,"stop minifig button 1 (1).png",gameLayer,"", stopMinifig,false,false,["raider"]));
	buttons.push(new Button(166,0,0,0,"upgrade button 1 (1).png",gameLayer,"", upgradeRaider,false,false,["raider"]));
	buttons.push(new Button(206,0,0,0,"get shovel button 1 (1).png",gameLayer,"", getTool,false,false,["raider"],["shovel"]));
	buttons.push(new Button(246,0,0,0,"get_Hammer.png",gameLayer,"", getTool,false,false,["raider"],["hammer"]));

	//item selected buttons
	buttons.push(new Button(86,0,0,0,"grab item button 1 (1).png",gameLayer,"", grabItem,false,false,["ore","crystal"]));

	//drillable wall selected buttons
	buttons.push(new Button(126,0,0,0,"drill wall button 1 (1).png",gameLayer,"", drillWall,false,false,["dirt", "loose rock", "ore seam", "energy crystal seam"]));
	
	//re-inforcable wall selected
	buttons.push(new Button(86,0,0,0,"Reinforce.png",gameLayer,"", reinforceWall,false,false,["dirt", "loose rock", "hard rock", "ore seam", "energy crystal seam"]));

	//floor Space selected buttons
	buttons.push(new Button(86,0,0,0,"build power path button 1 (1).png",gameLayer,"", buildPowerPath,false,false,["ground"]));

	//rubble selection buttons
	buttons.push(new Button(86,0,0,0,"clear rubble button 1 (1).png",gameLayer,"", clearRubble,false,false,["rubble 1","rubble 2","rubble 3","rubble 4"]));
	
	//building selection buttons
	buttons.push(new Button(86,0,0,0,"upgrade button 1 (1).png",gameLayer,"", upgradeBuilding,false,false,["tool store"]));
	
	pauseButtons.push(new Button(20,200,0,0,null,gameLayer,"Return to Main Menu", returnToMainMenu,false,false));
	
	scoreScreenButtons.push(new Button(20,200,0,0,null,scoreScreenLayer,"Return to Main Menu", returnToMainMenu,false,false));
}

function createMenuButtons() {
	var yPos = 20;
	menuButtons.push(new Button(20,yPos,0,0,null,menuLayer,"Levels:",null,false,true,null,[],false));
	yPos += 40;
	
	for (var i = 0; i < GameManager.scriptObjects["levelList.js"].levels.length; ++i) {
		menuButtons.push(new Button(20,yPos,0,0,null,menuLayer,GameManager.scriptObjects["Info_" + GameManager.scriptObjects["levelList.js"].levels[i] + ".js"].name,resetLevelVars,false,true,null,[GameManager.scriptObjects["levelList.js"].levels[i]]));
		yPos += 40;
	}
}

function returnToMainMenu() {
	//toggle game and menu layers and swap music tracks
	menuLayer.active = true;
	scoreScreenLayer.active = false;
	gameLayer.active = false;
	musicPlayer.changeLevels();
	stopAllSounds();
}

function stopAllSounds() {
	//stop all currently playing sounds
	//stop all raider sounds
	for (var i = 0; i < raiders.objectList.length; i++) {
		raiders.objectList[i].stopSounds();
	}
}

function resetLevelVars(name) {
	menuLayer.active = false;
	gameLayer.active = true;
	musicPlayer.changeLevels();
	collectedResources = {"ore":0,"crystal":4};
	reservedResources = {"ore":0,"crystal":0};
	selectionRectCoords = {x1:null,y1:null};
	selection = [];
	selectionType = null;
	for (var i = 0; i < terrain.length; ++i) {
		for (var r = 0; r < terrain[i].length; ++r) {
			terrain[i][r].die();
		}
	}
	terrain = [];
	for (var i = 0; i < buildings.length; ++i) {
		buildings[i].die();
	}
	buildings = []; //similar to terrain[], just holds spaces which are buildings so that they can be easily located by raiders.
	for (var i = 0; i < buildingSites.length; ++i) {
		buildingSites[i].die();
	}
	buildingSites = []; //used by raider ai pathfinding in a similar manner to buildings[]
	tasksAvailable = [];//.concat(collectables.objectList); 
	tasksUnavailable = new ObjectGroup(); //don't need to removeAll as this simply holds Space or Collectable instances
	tasksInProgress = new ObjectGroup();
	raiders.removeAll(true);
	collectables.removeAll(true);
	selectionRectObject = new RygameObject(0,0,0,0,null,gameLayer); //TODO: MAKE THIS A PROPER OBJECT AND MOVE THE SELECTION RECT CODE TO ITS UPDATE METHOD
	selectionRectPointList = [];
	selectionRectCoordList = [];
	awaitingStart = true;
	paused = false;
	holdingPKey = false;
	holdingLKey = false;
	loadLevelData(name);
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function initGlobals() {
	gameLayer = new Layer(0,0,1,1,GameManager.screenWidth,GameManager.screenHeight);
	menuLayer = new Layer(0,0,1,1,GameManager.screenWidth,GameManager.screenHeight,true);
	scoreScreenLayer = new Layer(0,0,1,1,GameManager.screenWidth,GameManager.screenHeight);
	musicPlayer = new MusicPlayer();
	buttons = new ObjectGroup();
	pauseButtons = new ObjectGroup();
	menuButtons = new ObjectGroup();
	scoreScreenButtons = new ObjectGroup();
	createButtons(); //create all in-game UI buttons initially, as there is no reason to load and unload these
	createMenuButtons(); //create all menu buttons
	GameManager.drawSurface.font = "48px Arial";
	tasksAutomated = { //update me manually for now, as the UI does not yet have task priority buttons
			"sweep":true,
			"collect":true,
			"drill":false,
			"build":true,
	};
	toolsRequired = { //dict of task type to required tool
			"sweep":"shovel",
			"drill":"drill"
	};
	tileSize = 128;
	scrollDistance = 1;
	scrollSpeed = 20;
	maskUntouchedSpaces = true; //if true, this creates the "fog of war" type effect where unrevealed Spaces appear as solid rock (should only be set to false for debugging purposes)
	mousePanning = false; //can you scroll the screen using the mouse?
	keyboardPanning = true; //can you scroll the screen using the arrow keys?
	debug = false;
	
	//some variables need to be given an initial value as resetting them is more complex; init them here
	terrain = [];
	buildings = [];
	buildingSites = [];
	raiders = new ObjectGroup();
	collectables = new ObjectGroup();
	levelScores = getLevelScores();
}

function getLevelScores() {
	levelScores = {};
	levelScores["01"] = getCookie("01");
	levelScores["02"] = getCookie("02");
	levelScores["03"] = getCookie("03");
	return levelScores;
}

function checkAccomplishedObjective() {
	//check if current level objective has been accomplished
	objective = GameManager.scriptObjects["Info_" + levelName + ".js"].objective;
	if (objective[0] == "collect") {
		won = (collectedResources[objective[1][0]] >= parseInt(objective[1][1]));
	}
	
	if (won) {
		showScoreScreen();
	}
}

function setLevelScore(score) {
	//update level dict and cookie to reflect the player's higest score
	if (levelScores[levelName] < score) {
		levelScores[levelName] = score;
		setCookie(levelName,score,999999999999);
	}
}

function showScoreScreen() {
	//switch to scoreScreenLayer 
	gameLayer.active = false;
	scoreScreenLayer.active = true;
	musicPlayer.changeLevels();
	stopAllSounds();
	setLevelScore(100);
}

function update() {
	if (GameManager.drawSurface == null) { //check if canvas has been updated by the html page
		GameManager.drawSurface = document.getElementById('canvas').getContext('2d');
	}
	if (menuLayer.active) { //menu update
		//update music
		musicPlayer.trackNum = 0;
		musicPlayer.update();
		
		//update objects
		GameManager.updateObjects();
		menuButtons.update();
		
		//pre-render; draw solid background
		GameManager.drawSurface.fillStyle = "rgb(128,28,108)"; //purple background color
		GameManager.drawSurface.fillRect(0, 0, GameManager.screenWidth, GameManager.screenHeight);
		
		//inital render; draw all rygame objects
		GameManager.drawFrame();
	}
	
	else if (scoreScreenLayer.active) {
		//update objects
		GameManager.updateObjects();
		scoreScreenButtons.update();
		
		//pre-render; draw solid background
		GameManager.drawSurface.fillStyle = "rgb(28,108,108)"; //turqoise background color
		GameManager.drawSurface.fillRect(0, 0, GameManager.screenWidth, GameManager.screenHeight);
		
		drawScoreScreenButtons();
		
		//inital render; draw all rygame objects
		GameManager.drawFrame();
	}
	
	else if (gameLayer.active) { //game update
		if (awaitingStart) {
			if (GameManager.keyStates[String.fromCharCode(13)]) { //enter key pressed
				awaitingStart = false;
				//update music
				musicPlayer.playRandomSong();
			}
		}
		else {
			musicPlayer.update(); //update music regardless of game state
			checkTogglePause();
			if (!paused) {
				//update input
				checkScrollScreen();
				if (!mouseOverGUI()) {
					checkUpdateClickSelection();
					checkAssignSelectionTask();
				}
				checkUpdateSelectionType();
				checkUpdateCtrlSelection();
				//update objects
				GameManager.updateObjects();
				buttons.update(selectionType);
			}
			else {
				pauseButtons.update();
			}
			checkAccomplishedObjective();
		}
			
		//pre-render; draw solid background
		GameManager.drawSurface.fillStyle = "rgb(60,45,23)"; //brown background color
		GameManager.drawSurface.fillRect(0, 0, GameManager.screenWidth, GameManager.screenHeight);
		//inital render; draw all rygame objects
		GameManager.drawFrame();
		//post render; draw effects and UI
		drawSelectionBox();
		drawSelectedSquares();
		if (debug) { //render debug info
			highlightRaiderPaths();
			drawSelectedRects();
			drawTerrainVars(["height"]);
			drawRaiderTasks();
			drawBuildingSiteMaterials();	
		}
		drawUI(); //draw UI last to ensure that it is in front of everything else
		drawAwaitingStartInstructions();
		drawPauseInstructions();
	}
}

//TODO: make it so that pieces with no path to them have their spaces marked as "unaccessible" and when you drill a wall or build a dock or fulfill some other objective that allows you to reach new areas find each newly accessible square and unmark those squares
initGlobals();
_intervalId = setInterval(update, 1000 / GameManager.fps); //set refresh rate to desired fps
