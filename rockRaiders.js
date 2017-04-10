//rygame is loaded in via html prior to this game, as this game is dependent on the rygame javascript port in order to function, so it is assumed that at this point rygame is available and ready for use
//for now images are being awaitingStart in by the rygame file as hardcoded urls, but this will be changed to the imageloader class which hopefully will be researched at the same time as the javascript dynamic loader so we don't have to define all of our classes in the html, that would't be very fun
GameManager.initializeRygame(0);

//print terrain out in a 2d array format
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

//print out all spaces in input path
function printPath(path) {
	var pathString = "[";
	for (var i = 0; i < path.length; i++) {
		pathString += " (" + path[path.length-(i+1)].listX + ", " + path[path.length-(i+1)].listY + ") >";
	}
	pathString = pathString.substring(0,pathString.length-2);
	pathString +="]";
	console.log(pathString);
}

//update position of all sound effects for all RygameObjects based on cameraDistance
function updateObjectSoundPositions() {
	for (var i = 0; i < GameManager.renderOrderedCompleteObjectList.length; ++i) {
		updateSoundPositions(GameManager.renderOrderedCompleteObjectList[i]);
	}
}

//update volume of all sound effects based on linear distance from camera
function updateSoundPositions(obj) {
	if (typeof obj.soundList != "undefined" && obj.soundList.length > 0) {
		var camDis = cameraDistance(obj);
		//linear fade with distance, with a max sound distance of 1200 pixels
		var vol = 1 - camDis / 1200;
		if (vol < 0) {
			vol = 0;
		}
		for (var i = 0; i < obj.soundList.length; ++i) {
			obj.soundList[i].volume = vol;
		}
	}
	
}

//get linear distance of obj center from camera
function cameraDistance(obj) {
	var xDis,yDis;
	var x = obj.centerX();
	var y = obj.centerY();
	var camX = gameLayer.cameraX + GameManager.screenWidth / 2;
	var camY = gameLayer.cameraY + GameManager.screenHeight / 2;
	xDis = Math.abs(camX - x);
	yDis = Math.abs(camY - y);
	return Math.sqrt(xDis*xDis + yDis*yDis);
}

//find the space in terrain closest to input object
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

//get the adjacent space to terrain indices x,y in direction dir. If no direction specified, get all 4 adjacent spaces.
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

//propagate touched for all adjacent spaces from input initial space
function touchAllAdjacentSpaces(initialSpace) {
	if (!initialSpace.touched) {
		if (initialSpace.isBuilding == false && (!(initialSpace.walkable || initialSpace.type == "water" || initialSpace.type == "lava"))) {
			if (initialSpace.drillable || initialSpace.explodable) {
				//initialSpace.touched = true;
				tasksAvailable.push(initialSpace);
			}
			initialSpace.updateTouched(initialSpace.drillable || initialSpace.explodable || (initialSpace.isBuilding == true)); //the buildings.indexOf section of this or statement should no longer be a possible case
			return; //TODO: the above statement has outgrown itself; revise appropriately
		}
		//initialSpace.touched = true;
		initialSpace.updateTouched(true); //need a method for changing touched so that previously unknown spaces that are really ground pieces know to change sprites
		if (initialSpace.sweepable) {
			tasksAvailable.push(initialSpace);
		}
		if (initialSpace.buildable && initialSpace.resourceNeeded()) { //didnt say else in case a space may be allowed to be both buildable and sweepable at the same time
			tasksAvailable.push(initialSpace);
		}
		//if (tasksAutomated["collect"] == true) {
		for (var i = 0; i < initialSpace.contains.objectList.length; i++) {
			//add each member of contains to tasksavailable
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
}

//determine which path is closest to the start object's current position from list of input paths
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

//calculate the shortest path in terrain from start space to goal space, or all shortest paths if returnAllSolutions flag is ticked. 
//If goalSpace is null, instead searches for a task that input raider can perform.
function calculatePath(terrain,startSpace,goalSpace,returnAllSolutions,raider) { 
	/*find shortest path from startSpace to a space satisfying desiredProperty (note: path goes from end to start, not from start to end)*/
	//if startSpace meets the desired property, return it without doing any further calculations
	if (startSpace == goalSpace || (goalSpace == null && raider.canPerformTask(startSpace))) {
		if (!returnAllSolutions) {
			return [startSpace];
		}
		return [[startSpace]];
	}
	
	//initialize starting variables
	if (goalSpace != null) {
		goalSpace.parents = [];	
	}
	
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
			if (newSpace == goalSpace || (goalSpace == null && raider.canPerformTask(newSpace))) {
				goalSpace = newSpace;
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

//determine whether or not there is a resource available and not resource of the input resource type
function resourceAvailable(resourceType) {
	if (collectedResources[resourceType] - reservedResources[resourceType] > 0) {
		return true;
	}
	return false;
}

//deprecated: populate a test level with some specifically placed objects
function populateTestLevel() {
	if (terrainMapName == "test level 1.js" || terrainMapName == "test level 2.js") { //create some test objects if we have loaded in one of the test levels (deprecated)
		collectables.push(new Collectable(terrain[3][4],"ore"));
		collectables.push(new Collectable(terrain[3][5],"ore"));
		collectables.push(new Collectable(terrain[2][5],"ore"));
		collectables.push(new Collectable(terrain[1][5],"ore"));
	}
}

//deprecated: populate a test level with some specifically placed raiders and objects
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

//load in level data for level of input name, reading from all supported map file types.
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
				terrain[i][r].checkWallSupported(null,true);
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
				terrain[i][r].setLandSlideFrequency(GameManager.scriptObjects[fallinMapName].level[i][r]);
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
		    	currentSpace.headingAngle = Math.PI;//use an angle variable separate from drawAngle so that the object does not draw a rotated image when in the fog
	    	}
	    	else if (headingDir == 90) {
	    		powerPathSpace = adjacentSpace(terrain,currentSpace.listX,currentSpace.listY,"right");
		    	currentSpace.headingAngle = -.5*Math.PI;//use an angle variable separate from drawAngle so that the object does not draw a rotated image when in the fog
	    	}
	    	else if (headingDir == 180) {
	    		powerPathSpace = adjacentSpace(terrain,currentSpace.listX,currentSpace.listY,"down");
		    	currentSpace.headingAngle = 0;//use an angle variable separate from drawAngle so that the object does not draw a rotated image when in the fog
	    	}
	    	else if (headingDir == 270) {
	    		powerPathSpace = adjacentSpace(terrain,currentSpace.listX,currentSpace.listY,"left");
		    	currentSpace.headingAngle = .5*Math.PI;//use an angle variable separate from drawAngle so that the object does not draw a rotated image when in the fog
	    	}
	    	if (currentSpace.touched) { //set drawAngle to headingAngle now if this space isn't in the fog to start
	    		currentSpace.drawAngle = currentSpace.headingAngle;
	    	}
	    	currentSpace.powerPathSpace = powerPathSpace;
	    	currentSpace.powerPathSpace.setTypeProperties("building power path");
	    }
	}
}

//determine the type of the input task. If optional raider flag is input, gives additional context for determining task type.
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
	if (typeof task.walkable != "undefined" && task.walkable == true) {
		return "walk";
	}
	if (typeof task.reinforcable != "undefined" && task.reinforcable == true) {
		return "reinforce";
	}
	if (typeof task.dynamitable != "undefined" && task.dynamitable == true) {
		return "dynamite";
	}
	if (typeof task.space != "undefined") {
		return "collect";
	}
	if (typeof task.isBuilding != "undefined" && task.isBuilding == true && task.type == "tool store") {
		return (raider != null && raider.getToolName != null) ? "get tool" : "upgrade";
	}
}

//create a new raider, if there is at least one touched toolStore to teleport him to.
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

//cancel current selection, setting selection to empty list and selectionType to null, and closing any open menus
function cancelSelection() {
	selection = [];
	selectionType = null;
	openMenu = "";
}

//attempt to update current selection in response to a left-click
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
					if (spaceSelected != null) {
						break;
					}
				}
				if (spaceSelected != null) {
					selection = [spaceSelected];
					selectionType = spaceSelected.touched == true ? spaceSelected.type : "Hidden";
				}
			}
		}
		
		if (selectionType != "raider" && openMenu == "tool") { //automatically close tool menu if a raider is no longer selected
			openMenu = "";
		}
			
	}
}

//update selectionType based on current selection, setting it to null if selection is empty
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
		selectionType = selection[0].touched == true ? selection[0].type : "Hidden";
		tileSelectedGraphic.drawDepth = 5000; //put tile selection graphic between space and collectable
		GameManager.refreshObject(tileSelectedGraphic);
	}
	if (selection[0] instanceof Collectable) {
		tileSelectedGraphic.drawDepth = 5; //put tile selection graphic in front of collectable
		GameManager.refreshObject(tileSelectedGraphic);
	}
	
	//manually update non-primary building pieces to point to main building Space
	if (selection[0] instanceof Space) {
		if (nonPrimarySpaceTypes.indexOf(selection[0].type) != -1) {
			selection[0] = selection[0].parentSpace;
		}
	}
}

//attempt to update current ctrl box selection. If ctrl is released, select all raiders within the box.
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

//attempt to assign a task to the current selection upon releasing right mouse button.
function checkAssignSelectionTask() {
	if (GameManager.mouseReleasedRight && selection.length != 0 && selectionType == "raider") {
		 //TODO: THIS IS A BIG CHUNK OF REPEAT CODE FROM THE LEFTCLICK TASK DETECTION, THIS DESERVES ITS OWN METHOD FOR SURE
		var clickedTasks = [];
		for (var p = 0; p < terrain.length; p++) {
			for (var r = 0; r < terrain[p].length; r++) {
				var initialSpace = terrain[p][r];
				for (var j = 0; j < terrain[p][r].contains.objectList.length + 1; j++) {
					if (collisionPoint(GameManager.mouseReleasedPosRight.x,GameManager.mouseReleasedPosRight.y,initialSpace,initialSpace.affectedByCamera) && ((tasksAvailable.indexOf(initialSpace) != -1) || initialSpace.walkable || (tasksInProgress.objectList.indexOf(initialSpace) != -1))) { //don't do anything if the task is already taken by another raider, we don't want to readd it to the task queue
						if ((j == 0 && (initialSpace.drillable || initialSpace.sweepable || initialSpace.buildable || initialSpace.walkable)) || j > 0) { //could optimize by only continuing if j == 1 and initialSpace.walkable == true but won't for now as unwalkable spaces shouldnt have any items in contains anyway
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
			var assignedAtLeastOnce = false;
			var taskWasAvailable = false;
			var baseSelectedTask = taskType(selectedTask);
			for (var i = 0; i < selection.length; i++) {	//TODO: allow certain tasks to be performed by raiders even if they are holding something
				selectedTaskType = baseSelectedTask;
				//treat build commands as walk unless the raider is holding something that the building site needs
				if (selectedTaskType == "build") {
					if (selection[i].holding == null || !selectedTask.resourceNeeded(selection[i].holding.type)) {
						selectedTaskType = "walk";
					}
				}
				//treat any other commands as walk commands if the raider does not have the necessary tool
				else if (toolsRequired[selectedTaskType] != undefined && selection[i].tools.indexOf(toolsRequired[selectedTaskType]) == -1) {
					selectedTaskType = "walk";
				}
				if (selection[i].currentTask != null && (selection[i].holding == null || selectedTaskType == "build" || selectedTaskType == "walk")) { //if current raider is already performing a task and not holding anything, stop him before assigning the new task
					stopMinifig(selection[i]);
				}
				if (selection[i].currentTask == null && (selection[i].holding == null || selectedTaskType == "build" || selectedTaskType == "walk")) { //raiders are the only valid selection type for now; later on any Space (and maybe collectables as well?) or vehicle, etc.. will be a valid selection[i] as even though these things cannot be assigned tasks they can be added to the high priority task queue as well as create menu buttons
					//selectedTask.taskPriority = 1;
					if (toolsRequired[selectedTaskType] == undefined || selection[i].tools.indexOf(toolsRequired[selectedTaskType]) != -1) {
						var index = tasksAvailable.indexOf(selectedTask);
						if (index != -1) { //this check will be necessary in the event that we choose a task such as walking
							taskWasAvailable = true;
							tasksAvailable.splice(index,1);
						} 
						else {
							if (selectedTaskType == "collect") {
								break;
							}
						}
						selection[i].currentTask = selectedTask;
						selection[i].currentObjective = selectedTask;
						
						//TODO: cleanup the code at the top of the Raider class which deals with choosing a task, stick it in a method, and reuse it here for simplicity
						selection[i].currentPath = findClosestStartPath(selection[i],calculatePath(terrain,selection[i].space,typeof selectedTask.space == "undefined" ? selectedTask: selectedTask.space,true));
						var foundCloserResource = selection[i].checkChooseCloserEquivalentResource(false);
						
						//don't assign the task if a valid path to the task cannot be found for the raider
						if (selection[i].currentPath == null) {
							selection[i].currentTask = null;
							selection[i].currentObjective = null;
						}
						
						else {
							if (!foundCloserResource) { //don't add this resource to tasksInProgress if we chose a closer resource instead
								assignedAtLeastOnce = true;
							}
							if (selectedTaskType == "walk") {
								//set walkPosOffset to the difference from the selected space top-left corner to the walk position
								selection[i].walkPosDummy.setCenterX(GameManager.mouseReleasedPosRight.x + gameLayer.cameraX);
								selection[i].walkPosDummy.setCenterY(GameManager.mouseReleasedPosRight.y + gameLayer.cameraY);
								selection[i].currentTask = selection[i].walkPosDummy;
								selection[i].currentObjective = selection[i].walkPosDummy;
								console.log(selection[i].currentTask.centerX() + ", " + selection[i].currentTask.centerY());
							}
							else if (selectedTaskType == "build") {
								selectedTask.dedicatedResources[selection[i].holding.type]++;
								this.dedicatingResource = true;								
							}
						}
					}
				}
			}
			if (assignedAtLeastOnce && (tasksInProgress.objectList.indexOf(selectedTask) == -1)) {
				tasksInProgress.push(selectedTask);
			}
			else if (taskWasAvailable) {
				tasksAvailable.push(selectedTask);
			}
		}
	}
}

//release any help objects from all raiders in selection.
function unloadMinifig() {
	if (selection.length == 0) {
		return;
	}
	for (var i = 0; i < selection.length; i++) {
		if ( selection[i].holding == null) {
			continue;
		}
		//create a new collectable of the same type, and place it on the ground. then, delete the currently held collectable.
		var newCollectable = new Collectable(getNearestSpace(terrain,selection[i]),selection[i].holding.type);
		collectables.push(newCollectable);
		tasksAvailable.push(newCollectable);
		newCollectable.setCenterX(selection[i].holding.centerX());
		newCollectable.setCenterY(selection[i].holding.centerY());
		newCollectable.drawAngle = selection[i].holding.drawAngle;
		selection[i].holding.die();
		selection[i].clearTask(); //modifications made to clearTask should now mean that if any resources were reserved from the resource collection or dedicated to a building site, the dedication numbers have been correctly decremented
	}
}

//if selection is a collectable that is an available task, boost its task priority so that the next available raider will come to get it
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

//set a wall to be reinforced
function reinforceWall() {
	if (selection.length == 0) {
		return;
	}
	for (var i = 0; i < selection.length; i++) {
		//don't do anything if the space is already reinforced
		if (selection[i].reinforced) {
			continue;
		}
		//add the reinforce dummy to tasksAvailable if its not already there
		var curIndex = tasksAvailable.indexOf(selection[i].reinforceDummy);
		if (curIndex == -1) {
			tasksAvailable.push(selection[i].reinforceDummy);
		}
		selection[i].reinforceDummy.taskPriority = 1;
	}
}

//set the currently selected space to be blown up with dynamite
function dynamiteWall() {
	if (selection.length == 0) {
		return;
	}
	for (var i = 0; i < selection.length; i++) {
		//add the dynamite dummy to tasksAvailable if its not already there
		var curIndex = tasksAvailable.indexOf(selection[i].dynamiteDummy);
		if (curIndex == -1) {
			tasksAvailable.push(selection[i].dynamiteDummy);
		}
		selection[i].dynamiteDummy.taskPriority = 1;
	}
}

//set the currently selected space to be drilled
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

//set the currently selected space to be cleared of rubble
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

//set the currently selected space to be built into a power path
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

//attempt to upgrade the selected building
function upgradeBuilding() {
	for (var i = 0; i < selection.length; ++i) {
		selection[i].upgrade();
	}
}

//determine the closest path to the closest building of buildingType from raider. return null if no path is found.
function pathToClosestBuilding(raider, buildingType) {
	var closestBuilding = raider.chooseClosestBuilding(buildingType);
	return findClosestStartPath(raider,calculatePath(terrain,raider.space,closestBuilding,true));
}

//set the active task for all raiders in current selection to move to the nearest tool store and start performing an upgrade
function upgradeRaider() { //TODO: take the 'find path to toolstore' code from this and getTool, and give it its own method.
	for (var i = 0; i < selection.length; i++) {
		if (selection[i].upgradeLevel < 3) {
			//these checks copied rfom checkAssignSelectionTask
			if (selection[i].currentTask != null && selection[i].holding == null) { //if current raider is already performing a task and not holding anything, stop him before assigning the new task
				stopMinifig(selection[i]);
			}
			if (selection[i].currentTask == null && selection[i].holding == null) { //raiders are the only valid selection type for now; later on any Space (and maybe collectables as well?) or vehicle, etc.. will be a valid selection[i] as even though these things cannot be assigned tasks they can be added to the high priority task queue as well as create menu buttons
				var newPath = pathToClosestBuilding(selection[i],"tool store");
				if (newPath == null) {
					continue; //no toolstore found or unable to path to any toolstores from this raider
				}
				selection[i].currentTask = newPath[0];
				selection[i].currentPath = newPath;
				selection[i].currentObjective = selection[i].currentTask;
			}
		}
	}
}

//assign all raiders in selection to path to the nearest tool store and get the specified tool type, if they are not currently holding it
function getTool(toolName) {
	for (var i = 0; i < selection.length; i++) {
		if (selection[i].tools.indexOf(toolName) == -1) { //&& selection[i].tools.length < selection[i].maxTools) {
			//these checks copied rfom checkAssignSelectionTask
			if (selection[i].currentTask != null && selection[i].holding == null) { //if current raider is already performing a task and not holding anything, stop him before assigning the new task
				stopMinifig(selection[i]);
			}
			if (selection[i].currentTask == null && selection[i].holding == null) { //raiders are the only valid selection type for now; later on any Space (and maybe collectables as well?) or vehicle, etc.. will be a valid selection[i] as even though these things cannot be assigned tasks they can be added to the high priority task queue as well as create menu buttons
				var newPath = pathToClosestBuilding(selection[i],"tool store");
				if (newPath == null) {			
					continue;
				}
				selection[i].currentTask = newPath[0];
				selection[i].currentPath = newPath;
				selection[i].currentObjective = selection[i].currentTask;
				selection[i].getToolName = toolName;
				//TODO: consider setting task priority here, as well as adding getTool task to tasksInProgreess
			}
		}
	}
}

//toggle paused flag
function pauseGame() {
	paused = !paused;
}

//update levelName to input name, and load level via resetLevelVars method
function changeLevels(levelName) {
	if (levelName == null) {
		levelName = "03";
	}
	resetLevelVars(levelName);
}

//check if the pause key (currently p) is pressed, and if so, toggle the paused flag
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

//stop all selected raiders, regardless of their current task type
function stopMinifig(raider) {
	if (raider == null) {
		stopGroup = selection;
	}
	else {
		stopGroup = [raider];
	}
	if (stopGroup.length == 0) {
		return;
	}
	for (var i = 0; i < stopGroup.length; i++) {
		if (stopGroup[i].currentTask == null) {
			continue;
		}
		if (stopGroup[i].holding == null) { //this should cover the "collect" taskType, as well as "build" and any other task type which involves a held object, as we don't want that object to be duplicated
			tasksAvailable.push(stopGroup[i].currentTask);
		}
		if (stopGroup[i].currentTask.grabPercent != null && stopGroup[i].currentTask.grabPercent < 100) { //still undecided as to whether or not this logic statement should be moved inside the above condition (stopGroup[i].holding == null)
			stopGroup[i].currentTask.grabPercent = 0;
		}
		var currentlyHeld = stopGroup[i].holding;
		stopGroup[i].clearTask(); //modifications made to clearTask should now mean that if any resources were reserved from the resource collection or dedicated to a building site, the dedication numbers have been correctly decremented
		stopGroup[i].holding = currentlyHeld; //won't have any effect if it was already null
		if (stopGroup[i].holding != null) {
			stopGroup[i].holding.grabPercent = 100; //if the raider was in the process of putting down a collectable but was interrupted, reset its grabPercent as it does't make sense for a collectable to be 'partially put down' after the raider is stopped			
		}
	}
}

//level select screen can be scrolled vertically to navigate the various levels
function checkScrollLevelSelect() {
	if (mousePanning) {
		if (GameManager.mousePos.y < scrollDistance) {
			levelSelectLayer.cameraY -= scrollSpeed;
		}
		else if (GameManager.mousePos.y > GameManager.screenHeight - scrollDistance) {
			levelSelectLayer.cameraY += scrollSpeed;
		}
	}
	if (keyboardPanning) { //can you scroll using the arrow keys?
		if (GameManager.keyStates[String.fromCharCode(38)]) {
			levelSelectLayer.cameraY -= scrollSpeed;
		}
		else if (GameManager.keyStates[String.fromCharCode(40)]) {
			levelSelectLayer.cameraY += scrollSpeed;
		}
	}
	if (levelSelectLayer.cameraY < 0) {
		levelSelectLayer.cameraY = 0;
	}
	else if (levelSelectLayer.cameraY > (3163 - GameManager.screenHeight)) { //level select image is 3163 pixels tall
		levelSelectLayer.cameraY = 3163 - GameManager.screenHeight;
	}
	
}

//check whether the screen should scroll due to mouse position or arrow key input
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
	//keep camera in world bounds
	if (gameLayer.cameraY < 0) {
		gameLayer.cameraY = 0;
	}
	if (gameLayer.cameraX < 0) {
		gameLayer.cameraX = 0;
	}
	if (terrain.length > 0 && gameLayer.cameraY > tileSize * terrain.length - GameManager.screenHeight) {
		gameLayer.cameraY = tileSize * terrain.length - GameManager.screenHeight;
	}
	if (terrain.length > 0 && gameLayer.cameraX > tileSize * terrain[0].length - GameManager.screenWidth) {
		gameLayer.cameraX = tileSize * terrain[0].length - GameManager.screenWidth;
	}
}

//debug function: draw object properties above each Space in terrain
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

//draw current task above each raider's head
function drawRaiderTasks() {
	GameManager.setFontSize(24);
	GameManager.drawSurface.fillStyle = "rgb(200, 220, 255)";
	for (var i = 0; i < raiders.objectList.length; i++) {
		curTask = raiders.objectList[i].getTaskType(raiders.objectList[i].currentTask);
		if (debug || curTask != null) { //only display the current task if it is not null or if debug mode is enabled
			GameManager.drawText(curTask,raiders.objectList[i].centerX()-raiders.objectList[i].drawLayer.cameraX,raiders.objectList[i].y-raiders.objectList[i].drawLayer.cameraY - 13,true);	
		}
	}
}

//draw ingite timer above each active dynamite instance
function drawDynamiteTimers() {
	for (var i = 0; i < collectables.objectList.length; ++i) {
		if (collectables.objectList[i].type == "dynamite" && collectables.objectList[i].ignited) {
			//don't draw anything if the dynamite has exploded, and is just an effect
			if (collectables.objectList[i].igniteTimer == 0) {
				continue;
			}
			GameManager.setFontSize(24);
			GameManager.drawSurface.fillStyle = "rgb(255, 0, 0)";
			GameManager.drawSurface.fillText(Math.floor((collectables.objectList[i].igniteTimer-1)/GameManager.fps + 1),collectables.objectList[i].x-collectables.objectList[i].drawLayer.cameraX,collectables.objectList[i].centerY()-collectables.objectList[i].drawLayer.cameraY - 20); //to be replaced with classic green selection rectangle	
			
		}
	}
}

//draw required materials (ore and energy crystals) above each building site
function drawBuildingSiteMaterials() {
	GameManager.setFontSize(24);
	for (var i = 0; i < buildingSites.length; i++) {
		GameManager.drawSurface.fillStyle = "rgb(0, 0, 255)";
		GameManager.drawText("Ore: " + buildingSites[i].placedResources["ore"] + "/" + buildingSites[i].requiredResources["ore"],
				buildingSites[i].centerX()-buildingSites[i].drawLayer.cameraX,buildingSites[i].y-buildingSites[i].drawLayer.cameraY+40,true);
		GameManager.drawSurface.fillStyle = "rgb(0, 255, 0)";
		GameManager.drawText("Crystal: " + buildingSites[i].placedResources["crystal"] + "/" + buildingSites[i].requiredResources["crystal"],
				buildingSites[i].centerX()-buildingSites[i].drawLayer.cameraX,buildingSites[i].y-buildingSites[i].drawLayer.cameraY+64,true);
	}
}

//draw all UI components
function drawUI() {
	GameManager.setFontSize(36);
	var selectionString = selectionType;
	if (powerPathSpaceTypes.indexOf(selectionString) != -1) {
		selectionString = "power path";
	}
	GameManager.drawSurface.fillText("Selection Type: " + selectionString + (selectionType == null ? "" : (selection.length == 1 ? (selection[0].isBuilding == true ? " lvl " + selection[0].upgradeLevel : "") : (" x " + selection.length))),8,592); //to be replaced with classic green selection rectangle	
	
	//don't draw buttons when buildingPlacer is active
	if (!buildingPlacer.visible) {
		for (var i = 0; i < buttons.objectList.length; ++i) { //attempt to draw buttons here so that they are rendered in front of other post-render graphics
			buttons.objectList[i].render(GameManager);
		}
	}
	
	//draw crystal and ore overlay
	GameManager.drawSurface.drawImage(GameManager.images["CrystalSideBar.png"],GameManager.screenWidth - 70,0);
	
	//draw crystals
	var curX = GameManager.screenWidth - 20;
	var curY = 519;
	for (var i = 0; i < 20; ++i, curY -= 21) {
		GameManager.drawSurface.drawImage(GameManager.images["NoSmallCrystal.png"],curX, curY);
		if (collectedResources["crystal"] > i) {
			GameManager.drawSurface.drawImage(GameManager.images["SmallCrystal.png"],curX, curY);
		}
	}
	
	//draw ore
	curX = GameManager.screenWidth - 31;
	curY = 533;
	for (var i = 0; i < collectedResources["ore"]; ++i, curY -= 10) {
		GameManager.drawSurface.drawImage(GameManager.images["CrystalSideBar_Ore.png"], curX, curY);
		if (curY <= 0) { //don't bother drawing past offscreen
			break;
		}
	}
	
	//draw ore and crystal text
	GameManager.setFontSize(12);
	GameManager.drawSurface.fillStyle = "rgb(255,255,255)";
	GameManager.drawSurface.fillText(collectedResources["ore"],GameManager.screenWidth - 60,595);
	GameManager.drawSurface.fillText(collectedResources["crystal"],GameManager.screenWidth - 28,595);
}

//draw ore and energy crystal count during the score screen
function drawScoreScreenUI() {
	GameManager.setFontSize(48);
	GameManager.drawSurface.fillStyle = "rgb(65, 218, 0)";
	GameManager.drawSurface.fillText("Ore: " + collectedResources["ore"],600,40);
	GameManager.drawSurface.fillText("Energy Crystals: " + collectedResources["crystal"],341,100);
}

//draw held tools and skills for each raider
function drawRaiderInfo() {
	if (selectionType != "raider") {
		return;
	}
	//draw held items
	var heldWidth = GameManager.images["have am nothing.png"].width;
	var heldHeight = GameManager.images["have am nothing.png"].height;
	for (var i = 0; i < selection.length; ++i) {
		var maxTools = 2 + selection[i].upgradeLevel;
		for (var j = 0; j < maxTools; ++j) {
			var curImageName = selection[i].tools.length > j ? "have " + selection[i].tools[j] + ".png" : "have am nothing.png";
			GameManager.drawSurface.drawImage(GameManager.images[curImageName], 
					selection[i].centerX() - (heldWidth*maxTools)/2 + (heldWidth * j) - selection[i].drawLayer.cameraX,
					selection[i].y - 28 - heldHeight - selection[i].drawLayer.cameraY);
		}
	}
	
	//draw learned skills
	var maxSkills = 6;
	var skills = [["amDriver","am driver.png"],["amEngineer","am engineer.png"],["amGeologist","am geologist.png"],["amPilot","am pilot.png"],
		["amSailor","am sailor.png"],["amExplosivesExpert","am explosives expert.png"]];
	for (var i = 0; i < selection.length; ++i) {
		for (var j = 0; j < 6; ++j) {
			var curImageName = selection[i][skills[j][0]] ? skills[j][1] : "have am nothing.png";
			GameManager.drawSurface.drawImage(GameManager.images[curImageName], 
					selection[i].centerX() - (heldWidth*maxSkills)/2 + (heldWidth * j) - selection[i].drawLayer.cameraX,
					selection[i].y - 28 - selection[i].drawLayer.cameraY);
		}
	}
}

//draw active ctrl selection box
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

//draw smallest bounding square around each raider
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
	}
}

//draw smallest rotated bounding rect around each raider
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

//draw all raider task paths
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

//darken screen by input percentage (currently used during pause and level start)
function dimScreen(dimPercentage) { //darken screen by dimPercentage
	var prevGlobalAlpha = GameManager.drawSurface.globalAlpha;
	GameManager.drawSurface.globalAlpha=dimPercentage;
	GameManager.drawSurface.fillStyle = "rgb(0,0,0)";
	GameManager.drawSurface.fillRect(0,0,GameManager.screenWidth,GameManager.screenHeight); //darken screen while awaitingStart
	GameManager.drawSurface.globalAlpha=prevGlobalAlpha;
	
}

//draw instructions while awaiting player start after loading level
function drawAwaitingStartInstructions() { //draw game start instructions if awaitingStart
	if (awaitingStart) { //draw game start instructions if awaitingStart
		dimScreen(.4);
		GameManager.drawSurface.globalAlpha=1.0;
		GameManager.drawSurface.fillStyle = "rgb(65, 218, 255)";
		GameManager.setFontSize(72);
		GameManager.drawSurface.fillText("Press Enter to Begin",70,322); //TODO: CENTER THIS AUTOMATICALLY, RATHER THAN ESTIMATING MANUALLY
	}
}

//draw pause screen instructions
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

//return whether or not the mouse is currently hovering over an active GUI object
function mouseOverGUI() {
	for (var i = 0; i < buttons.objectList.length; i++) {
		if (buttons.objectList[i].visible && collisionPoint(GameManager.mousePos.x,GameManager.mousePos.y,buttons.objectList[i],buttons.objectList[i].affectedByCamera)) { //use mouseDownOnButton rather than releasedThisFrame because button activates on mouse release, whereas task selection here activates on mouse press
			return true;
		}
	}
	return false;
}

//toggle building menu open or closed
function openBuildingMenu() {
	if (openMenu == "building") {
		openMenu = "";
	}
	else {
		cancelSelection(); //this clears selection and sets openMenu to ""
		openMenu = "building";	
	}
}

//toggle tool menu open or closed
function openToolMenu() {
	if (selectionType == "raider") {
		if (openMenu == "tool") {
			openMenu = "";
		}
		else {
			openMenu = "tool";		
		}
	}
}

//return the building requirements for input building type (that is, what buildings are required before the input buildingType can be constructed)
function buildRequirementsMet(buildingType) {
	buildingRequirements = []
	if (buildingType == "teleport pad") {
		buildingRequirements = ["tool store"];
	}
	else if (buildingType == "docks") {
		buildingRequirements = ["tool store", "teleport pad"];
	}
	else if (buildingType == "power station") {
		buildingRequirements = ["tool store", "teleport pad"];
	}
	else if (buildingType == "ore refinery") {
		buildingRequirements = ["tool store", "teleport pad", "power station"];
	}
	else if (buildingType == "geological center") {
		buildingRequirements = ["tool store", "teleport pad", "power station"];
	}
	else if (buildingType == "mining laser") {
		buildingRequirements = ["tool store", "teleport pad", "power station"];
	}
	else if (buildingType == "upgrade station") {
		buildingRequirements = ["tool store", "teleport pad", "power station"];
	}
	else if (buildingType == "support station") {
		buildingRequirements = ["tool store", "teleport pad", "power station"];
	}
	else if (buildingType == "super teleport") {
		buildingRequirements = ["tool store", "teleport pad", "power station", "support station"];
	}
	
	for (var i = 0; i < buildingRequirements.length; ++i) {
		var requirementMet = false;
		for (var j = 0; j < buildings.length; ++j) {
			if (buildings[j].type == buildingRequirements[i] && buildings[j].upgradeLevel >= 1) { //building must be upgraded at least once to build next building
				requirementMet = true;
				break;
			}
		}
		if (!requirementMet) {
			return false;
		}
	}
	return true;
}

//enable the buildingPlacer object
function startBuildingPlacer(buildingType) {
	if (buildRequirementsMet(buildingType)) { //buttons now take care of this check, but it can't hurt to check it one more time here
		buildingPlacer.start(buildingType);
		buildingPlacer.updatePosition();
		cancelSelection();
	}
}

//create all in-game buttons
function createButtons() {
	//base level buttons
	buttons.push(new Button(0,0,0,0,"teleport raider button 1 (1).png",gameLayer,"", createRaider,false,false));
	buttons.push(new Button(0,40,0,0,"open building menu button 1 (1).png",gameLayer,"", openBuildingMenu,false,false));
	
	buttons.push(new Button(46,0,0,0,"cancel selection button 1 (1).png",gameLayer,"", cancelSelection,false,false,[])); //if selectionTypeBound is an empty list, the button will be visible for all selections except when selection == null
	//6 pixel boundary between general purpose buttons and selection specific buttons
	
	//building menu open buttons
	buttons.push(new Button(46,40,0,0,"make ToolStation.png",gameLayer,"", startBuildingPlacer,false,false,null,["building"],["tool store"],true,true,null,buildRequirementsMet,["tool store"]));
	buttons.push(new Button(46,80,0,0,"make SMteleport.png",gameLayer,"", startBuildingPlacer,false,false,null,["building"],["teleport pad"],true,true,null,buildRequirementsMet,["teleport pad"]));
	buttons.push(new Button(46,120,0,0,"make docks.png",gameLayer,"", startBuildingPlacer,false,false,null,["building"],["docks"],true,true,null,buildRequirementsMet,["docks"]));
	buttons.push(new Button(46,160,0,0,"make PowerStation.png",gameLayer,"", startBuildingPlacer,false,false,null,["building"],["power station"],true,true,null,buildRequirementsMet,["power station"]));
	buttons.push(new Button(46,200,0,0,"make barracks.png",gameLayer,"", startBuildingPlacer,false,false,null,["building"],["support station"],true,true,null,buildRequirementsMet,["support station"]));
	buttons.push(new Button(46,240,0,0,"make Upgrade.png",gameLayer,"", startBuildingPlacer,false,false,null,["building"],["upgrade station"],true,true,null,buildRequirementsMet,["upgrade station"]));
	buttons.push(new Button(46,280,0,0,"make Geo.png",gameLayer,"", startBuildingPlacer,false,false,null,["building"],["geological center"],true,true,null,buildRequirementsMet,["geological center"]));
	buttons.push(new Button(46,320,0,0,"make Orerefinery.png",gameLayer,"", startBuildingPlacer,false,false,null,["building"],["ore refinery"],true,true,null,buildRequirementsMet,["ore refinery"]));
	buttons.push(new Button(46,360,0,0,"make Gunstation.png",gameLayer,"", startBuildingPlacer,false,false,null,["building"],["mining laser"],true,true,null,buildRequirementsMet,["mining laser"]));
	buttons.push(new Button(46,400,0,0,"make LargeTeleporter.png",gameLayer,"", startBuildingPlacer,false,false,null,["building"],["super teleport"],true,true,null,buildRequirementsMet,["super teleport"]));
	
	//raider selected buttons
	buttons.push(new Button(86,0,0,0,"unload minifig button 1 (1).png",gameLayer,"", unloadMinifig,false,false,["raider"]));
	buttons.push(new Button(126,0,0,0,"stop minifig button 1 (1).png",gameLayer,"", stopMinifig,false,false,["raider"]));
	buttons.push(new Button(166,0,0,0,"upgrade button 1 (1).png",gameLayer,"", upgradeRaider,false,false,["raider"]));
	buttons.push(new Button(206,0,0,0,"getTool.png",gameLayer,"", openToolMenu,false,false,["raider"]));
	
	//get tool buttons
	buttons.push(new Button(206,40,0,0,"get_Drill.png",gameLayer,"", getTool,false,false,["raider"],["tool"],["drill"]));
	buttons.push(new Button(206,80,0,0,"get_Hammer.png",gameLayer,"", getTool,false,false,["raider"],["tool"],["hammer"]));
	buttons.push(new Button(206,120,0,0,"get_Shovel.png",gameLayer,"", getTool,false,false,["raider"],["tool"],["shovel"]));
	buttons.push(new Button(206,160,0,0,"get_Wrench.png",gameLayer,"", getTool,false,false,["raider"],["tool"],["wrench"]));
	buttons.push(new Button(206,200,0,0,"get_Freezer.png",gameLayer,"", getTool,false,false,["raider"],["tool"],["freezer"]));
	buttons.push(new Button(206,240,0,0,"get_Pusher.png",gameLayer,"", getTool,false,false,["raider"],["tool"],["pusher"]));
	buttons.push(new Button(206,280,0,0,"get_Laser.png",gameLayer,"", getTool,false,false,["raider"],["tool"],["laser"]));
	buttons.push(new Button(206,320,0,0,"get_Sonic_Blaster.png",gameLayer,"", getTool,false,false,["raider"],["tool"],["blaster"]));

	//item selected buttons
	buttons.push(new Button(86,0,0,0,"grab item button 1 (1).png",gameLayer,"", grabItem,false,false,["ore","crystal"]));

	//drillable wall selected buttons
	buttons.push(new Button(166,0,0,0,"drill wall button 1 (1).png",gameLayer,"", drillWall,false,false,["dirt", "loose rock", "ore seam", "energy crystal seam"]));
	
	//dynamitable wall selected buttons
	buttons.push(new Button(126,0,0,0,"use dynamite 1 (1).png",gameLayer,"", dynamiteWall,false,false,["dirt", "loose rock", "hard rock", "ore seam", "energy crystal seam"]));
	
	//re-inforcable wall selected
	buttons.push(new Button(86,0,0,0,"Reinforce.png",gameLayer,"", reinforceWall,false,false,["dirt", "loose rock", "hard rock", "ore seam", "energy crystal seam"]));

	//floor Space selected buttons
	buttons.push(new Button(86,0,0,0,"build power path button 1 (1).png",gameLayer,"", buildPowerPath,false,false,["ground"]));

	//rubble selection buttons
	buttons.push(new Button(86,0,0,0,"clear rubble button 1 (1).png",gameLayer,"", clearRubble,false,false,["rubble 1","rubble 2","rubble 3","rubble 4"]));
	
	//building selection buttons
	buttons.push(new Button(86,0,0,0,"upgrade button 1 (1).png",gameLayer,"", upgradeBuilding,false,false,["tool store", "teleport pad", "power station", "docks", "geological center", "support station", "super teleport", "mining laser", "upgrade station", "ore refinery"]));
	
	pauseButtons.push(new Button(20,200,0,0,null,gameLayer,"Return to Main Menu", returnToMainMenu,false,false));
	
	scoreScreenButtons.push(new Button(200,135,0,0,null,scoreScreenLayer,"Score: 0", null,false,true,null,null,[],false));
	scoreScreenButtons.push(new Button(20,200,0,0,null,scoreScreenLayer,"Return to Main Menu", returnToMainMenu,false,true));
}

//create all level select screen buttons
function createLevelSelectButtons() {
	//level select buttons
	for (var i = 0; i < 33; ++i) {
		levelSelectButtons.push(new Button(GameManager.scriptObjects["levelList.js"].levelPositions[i][0],GameManager.scriptObjects["levelList.js"].levelPositions[i][1],0,0,GameManager.scriptObjects["levelList.js"].levelImages[i],levelSelectLayer,"",resetLevelVars,true,true,null,null,[GameManager.scriptObjects["levelList.js"].levels[i]],true,false));
		levelSelectButtons.objectList[i].visible = false;
	}
}

//create all menu screen buttons
function createMenuButtons() {	
	//main menu buttons
	var xPos = 320;
	var yPos = 260;
	menuButtons.push(new Button(xPos,yPos,0,0,null,menuLayer,"Select a Level",goToLevelSelect,false,true,null,null,[],true,false,[20,245,40]));
	yPos += 80;
	
	menuButtons.push(new Button(xPos,yPos,0,0,null,menuLayer,"Options:",null,false,true,null,null,[],false,false,[0,220,245]));
	yPos += 40;
	menuButtons.push(new Button(xPos,yPos,0,0,null,menuLayer,"Edge Panning" + (mousePanning ?  " ✓" : " X"),toggleEdgePanning,false,true,null,null,[menuButtons.objectList.length],true,false,[0,220,245]));
	yPos += 40;
	menuButtons.push(new Button(xPos,yPos,0,0,null,menuLayer,"Debug Mode" + (debug ?  " ✓" : " X"),toggleDebugMode,false,true,null,null,[menuButtons.objectList.length],true,false,[0,220,245]));
	yPos += 40;
	menuButtons.push(new Button(xPos,yPos,0,0,null,menuLayer,"Enable Fog" + (maskUntouchedSpaces ?  " ✓" : " X"),toggleFog,false,true,null,null,[menuButtons.objectList.length],true,false,[0,220,245]));
}

//switch to the level select layer
function goToLevelSelect() {
	menuLayer.active = false;
	levelSelectLayer.active = true;
}

//function to always disable buttons when applied as an additional requirement
function grayedOut() {
	return false;
}

//toggle the global setting for whether or not the mouse may scroll the screen by pointing at the edges (both the variable and the HTML5 local var)
function toggleEdgePanning(buttonIndex) {
	mousePanning = !mousePanning;
	setValue("mousePanning", mousePanning);
	menuButtons.objectList[buttonIndex].updateText("Edge Panning" + (mousePanning ?  " ✓" : " X"));
}

//toggle debug mode variable and HTML5 local var on or off
function toggleDebugMode(buttonIndex) {
	debug = !debug;
	setValue("debug", debug);
	menuButtons.objectList[buttonIndex].updateText("Debug Mode" + (debug ?  " ✓" : " X"));
}

//toggle fog variable and HTML5 local var on or off
function toggleFog(buttonIndex) {
	maskUntouchedSpaces = !maskUntouchedSpaces;
	setValue("fog",maskUntouchedSpaces);
	menuButtons.objectList[buttonIndex].updateText("Enable Fog" + (maskUntouchedSpaces ?  " ✓" : " X"));
}

//switch layers to the main menu, stopping all sounds and toggling all game-variables off
function returnToMainMenu() {
	//toggle game and menu layers and swap music tracks, as well as update level score strings if coming from score screen
	if (scoreScreenLayer.active) { //update score strings if coming from score layer, as this means we may have updated one of the level scores
		for (var i = 0; i < GameManager.scriptObjects["levelList.js"].levels.length; ++i) {
			var score = levelScores[GameManager.scriptObjects["levelList.js"].levels[i]];
			//level select buttons are now images, so for now we don't need to show this score anywhere
			//levelSelectButtons.objectList[i].updateText(GameManager.scriptObjects["Info_" + GameManager.scriptObjects["levelList.js"].levels[i] + ".js"].name + (score >= 0 ? " - best score: " + score : ""));
		}
	}
	menuLayer.active = true;
	scoreScreenLayer.active = false;
	gameLayer.active = false;
	musicPlayer.changeLevels();
	stopAllSounds();
	buildingPlacer.stop();
	tileSelectedGraphic.visible = false;
}

//stop all currently playing raider sounds
function stopAllSounds() {
	//stop all currently playing sounds
	//stop all raider sounds
	for (var i = 0; i < raiders.objectList.length; i++) {
		raiders.objectList[i].stopSounds();
	}
}

//reset all non-constant game variables for the start of a new level
function resetLevelVars(name) {
	menuLayer.active = false;
	levelSelectLayer.active = false;
	gameLayer.active = true;
	musicPlayer.changeLevels();
	collectedResources = {"ore":0,"crystal":0};
	reservedResources = {"ore":0,"crystal":0};
	selectionRectCoords = {x1:null,y1:null};
	selection = [];
	openMenu = "";
	lastLevelScore = 0;
	selectionType = null;
	for (var i = 0; i < terrain.length; ++i) {
		for (var r = 0; r < terrain[i].length; ++r) {
			terrain[i][r].die();
		}
	}
	terrain = [];
	//don't need to kill buildings or buildingSites as these are just a type of space
	buildings = []; //similar to terrain[], just holds spaces which are buildings so that they can be easily located by raiders.
	buildingSites = []; //used by raider ai pathfinding in a similar manner to buildings[]
	tasksAvailable = [];//.concat(collectables.objectList); 
	tasksInProgress = new ObjectGroup();
	raiders.removeAll(true);
	collectables.removeAll(true);
	selectionRectPointList = [];
	selectionRectCoordList = [];
	awaitingStart = true;
	paused = false;
	holdingPKey = false;
	holdingLKey = false;
	loadLevelData(name);
}

//set HTNL5 local storage variable value
function setValue(name, value) {
    localStorage.setItem(name,value);
}

//get HTML5 local storage variable value
function getValue(name) {
	return localStorage.getItem(name);
}

//initialize global game-related constants
function initGlobals() {
	tileSize = 128;
	scrollDistance = 10;
	scrollSpeed = 20;
	maskUntouchedSpaces = getValue("fog") == "true" ? true : false; //if true, this creates the "fog of war" type effect where unrevealed Spaces appear as solid rock (should only be set to false for debugging purposes)
	mousePanning = getValue("mousePanning") == "true" ? true : false; //can you scroll the screen using the mouse?
	keyboardPanning = true; //can you scroll the screen using the arrow keys?
	debug = getValue("debug") == "true" ? true : false; //should the game render any active debug info?
	
	gameLayer = new Layer(0,0,1,1,GameManager.screenWidth,GameManager.screenHeight);
	menuLayer = new Layer(0,0,1,1,GameManager.screenWidth,GameManager.screenHeight,true);
	levelSelectLayer = new Layer(0,0,1,1,GameManager.screenWidth,GameManager.screenHeight,true);
	scoreScreenLayer = new Layer(0,0,1,1,GameManager.screenWidth,GameManager.screenHeight);
	levelScores = getLevelScores();
	musicPlayer = new MusicPlayer();
	buttons = new ObjectGroup();
	pauseButtons = new ObjectGroup();
	menuButtons = new ObjectGroup();
	levelSelectButtons = new ObjectGroup();
	scoreScreenButtons = new ObjectGroup();
	createButtons(); //create all in-game UI buttons initially, as there is no reason to load and unload these
	createMenuButtons(); //create all menu buttons
	createLevelSelectButtons();
	GameManager.drawSurface.font = "48px Arial";
	tasksAutomated = { //update me manually for now, as the UI does not yet have task priority buttons
			"sweep":true,
			"collect":true,
			"drill":false,
			"reinforce":false,
			"build":true,
			"walk":true,
			"dynamite":false
	};
	toolsRequired = { //dict of task type to required tool
			"sweep":"shovel",
			"drill":"drill",
			"reinforce":"hammer"
	};
	nonPrimarySpaceTypes = ["power station topRight","geological center right","upgrade station right", 
		"ore refinery right", "mining laser right", "super teleport topRight"];
	
	powerPathSpaceTypes = ["power path", "building power path", "power station powerPath"];
	
	buildingPlacer = new BuildingPlacer();
	selectionRectObject = new RygameObject(0,0,0,0,null,gameLayer);
	tileSelectedGraphic = new TileSelectedGraphic();
	
	//some variables need to be given an initial value as resetting them is more complex; init them here
	terrain = [];
	buildings = [];
	buildingSites = [];
	raiders = new ObjectGroup();
	collectables = new ObjectGroup();
	dynamiteInstances = new ObjectGroup();
}

//get HTML5 local storage value for each level highschore, if present
function getLevelScores() {
	levelScores = {};
	levelScores["01"] = getValue("01") == null ? -1 : getValue("01");
	levelScores["02"] = getValue("02") == null ? -1 : getValue("02");
	levelScores["03"] = getValue("03") == null ? -1 : getValue("03");
	return levelScores;
}

//check if current level objective has been accomplished
function checkAccomplishedObjective() {
	objective = GameManager.scriptObjects["Info_" + levelName + ".js"].objective;
	if (objective[0] == "collect") {
		won = (collectedResources[objective[1][0]] >= parseInt(objective[1][1]));
	}
	
	if (won) {
		showScoreScreen();
	}
}

//determine level score from 0-100 based off off several factors, including ore and crystals collected, oxygen remaining, and time taken
function calculateLevelScore() {
	return Math.round(100 * Math.min(1,(collectedResources["ore"] / 30) * .5 + (collectedResources["crystal"] / 5) * .5));
}

//update level dict and cookie to reflect the player's higest score
function setLevelScore(score) {
	if (levelScores[levelName] < score) {
		levelScores[levelName] = score;
		setValue(levelName,score);
	}
}

//switch to scoreScreenLayer 
function showScoreScreen() {
	gameLayer.active = false;
	scoreScreenLayer.active = true;
	musicPlayer.changeLevels();
	stopAllSounds();
	lastLevelScore = calculateLevelScore();
	setLevelScore(lastLevelScore);
	scoreScreenButtons.objectList[0].updateText(scoreScreenButtons.objectList[0].text.split(":")[0] + ": " + lastLevelScore);
}

//disallow main menus from being open while the user has an active selection (submenues are allowed)
function checkCloseMenu() {
	if (selection.length != 0) {
		if (openMenu == "building") {
			openMenu = "";	
		}
	}
}

//main update loop: update the current layer and any non-automatic objects
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
		
		//pre-render; draw menu background
		GameManager.drawSurface.drawImage(GameManager.images["MenuBGpic.png"],0,0);
		
		//inital render; draw all rygame objects
		GameManager.drawFrame();
	}
	
	else if (levelSelectLayer.active) { //level select update
		//update music
		musicPlayer.trackNum = 0;
		musicPlayer.update();
		
		//update input
		checkScrollLevelSelect();
		
		//update objects
		GameManager.updateObjects();
		levelSelectButtons.update();
		
		//inital render; draw all rygame objects
		GameManager.drawFrame();
		
		//draw level select imaged scrolled according to current scroll value (in front of buttons to hide overlaid pixels when highlighted or darkened)
		GameManager.drawSurface.drawImage(GameManager.images["Levelpick.png"],0,-levelSelectLayer.cameraY);
	}
	
	else if (scoreScreenLayer.active) { //score screen update
		//update music
		musicPlayer.trackNum = -1;
		musicPlayer.update();
		
		//update objects
		GameManager.updateObjects();
		scoreScreenButtons.update();
		
		//pre-render; draw solid background
		GameManager.drawSurface.fillStyle = "rgb(28,108,108)"; //turqoise background color
		GameManager.drawSurface.fillRect(0, 0, GameManager.screenWidth, GameManager.screenHeight);
				
		//inital render; draw all rygame objects
		GameManager.drawFrame();
		
		//post-render; draw effects and UI
		drawScoreScreenUI();
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
				if (!buildingPlacer.visible) {
					if (!mouseOverGUI()) {
						checkUpdateClickSelection();
						checkAssignSelectionTask();
					}
					checkUpdateCtrlSelection();
					checkUpdateSelectionType();
				}
				//update objects
				GameManager.updateObjects();
				
				//update object sound volumes based on distance from camera
				updateObjectSoundPositions();
				
				//don't update buttons when buildingPlacer is active
				if (!buildingPlacer.visible) {
					buttons.update([selectionType,openMenu]);
					checkCloseMenu();
				}
			
			}
			else {
				pauseButtons.update();
			}
			checkAccomplishedObjective();
		}
			
		//pre-render; nothing to do here now that camera can no longer go out of bounds
		//inital render; draw all rygame objects
		GameManager.drawFrame();
		//post render; draw effects and UI
		drawRaiderInfo();
		drawSelectionBox();
		drawSelectedSquares();
		if (debug) { //render debug info
			highlightRaiderPaths();
			drawSelectedRects();
			drawTerrainVars(["listX"]);
		}
		drawDynamiteTimers();
		drawBuildingSiteMaterials();
		drawRaiderTasks();
		drawUI(); //draw UI last to ensure that it is in front of everything else
		drawAwaitingStartInstructions();
		drawPauseInstructions();
	}
}

//TODO: make it so that pieces with no path to them have their spaces marked as "unaccessible" and when you drill a wall or build a dock or fulfill some other objective that allows you to reach new areas find each newly accessible square and unmark those squares
initGlobals();
_intervalId = setInterval(update, 1000 / GameManager.fps); //set refresh rate to desired fps
