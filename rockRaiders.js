//rygame is loaded in via html prior to this game, as this game is dependent on the rygame javascript port in order to function, so it is assumed that at this point rygame is available and ready for use
//for now images are being loading in by the rygame file as hardcoded urls, but this will be changed to the imageloader class which hopefully will be researched at the same time as the javascript dynamic loader so we don't have to define all of our classes in the html, that would't be very fun
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
	pathString = "[";
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
		if (initialSpace.drillable) {
			//initialSpace.touched = true;
			var index = tasksUnavailable.objectList.indexOf(initialSpace);
			if (index != -1) {
				tasksUnavailable.objectList.splice(index,1);
			}
			tasksAvailable.push(initialSpace);
		}
		initialSpace.updateTouched(initialSpace.drillable || (initialSpace.isBuilding == true)); //the buildings.indexOf section of this or statement should no longer be a possible case
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
	if (startSpace == goalSpace) {
		if (!returnAllSolutions) {
			return [goalSpace];
		}
		return [[goalSpace]];
	}
	
	goalSpace.parents = [];
	
	startSpace.goalDistance = Math.abs(goalSpace.listX - startSpace.listX) + Math.abs(goalSpace.listY - startSpace.listY); //remember this is the least possible distance, not the actual distance
	startSpace.startDistance = 0;
	startSpace.finalDistance = startSpace.goalDistance;
	startSpace.parents = [];
	//priorityQueue = []; //TODO: this really deserves a better data structure than a list that we keep sorted with binarySearch ;)
	var closedSet = [];
	var solutions = [];
	var finalPathDistance = -1;
	openSet = [startSpace]; //TODO: we can speed up the algorithm quite a bit if we use hashing for lookup rather than lists
	while (openSet.length > 0) {
				
		currentSpace = openSet.shift();  //TODO: keep the list sorted in reverse for this algorithm so that you can insert and remove from the back of the list rather than shifting all of the elements when inserting and removing (minor performance improvement)
		closedSet.push(currentSpace);
		var adjacentSpaces = [];
		adjacentSpaces.push(adjacentSpace(terrain,currentSpace.listX,currentSpace.listY,"up"));
		adjacentSpaces.push(adjacentSpace(terrain,currentSpace.listX,currentSpace.listY,"down"));
		adjacentSpaces.push(adjacentSpace(terrain,currentSpace.listX,currentSpace.listY,"left"));
		adjacentSpaces.push(adjacentSpace(terrain,currentSpace.listX,currentSpace.listY,"right"));
		for (var k = 0; k < adjacentSpaces.length; k++) {
			var newSpace = adjacentSpaces[k];
			
			if ((finalPathDistance != -1) && (currentSpace.startDistance + 1 > finalPathDistance)) {
				return solutions;
			}
			
			//check this here so that the algorithm is a little bit faster, but also so that paths to non-walkable terrain pieces (such as for drilling) will work
			if (newSpace == goalSpace) {
				//newSpace.parents.push(currentSpace);
				newSpace.parents = [currentSpace];
				pathsFound = [[newSpace]];
				//while (newSpace.parent != startSpace) {
				while (pathsFound.length > 0) {
					if (pathsFound[0][pathsFound[0].length-1].parents[0] == startSpace) {
						if (!returnAllSolutions) {
							return pathsFound[0];
						}
						finalPathDistance = pathsFound[0].length;
						solutions.push(pathsFound.shift());
						continue;
						
					}
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
				//path.splice(-1,1); //do not return the starting space as part of the path
				/*if (returnAllSolutions != true) {
					return path;
				}*/
				/*if (finalPathDistance == -1) {
					finalPathDistance = path.length;
					solutions = [];
				}*/
				/*else {
					if (finalPathDistance != path.length) {
						return solutions;
					}
				}
				solutions.push(path);
				continue;*/
			}

			/*if (newSpace.listX == 15 && newSpace.listY == 12) {
				console.log("FOUND 15,12");
			}*/
			
			if ((newSpace != null) && (newSpace.walkable == true)) {					
				
				newStartDistance = currentSpace.startDistance + 1;
				notInOpenSet = openSet.indexOf(newSpace) == -1;
				
				if ((closedSet.indexOf(newSpace) != -1) && (newSpace.startDistance < newStartDistance)) {
					continue;
				}
				
				if (notInOpenSet || newSpace.startDistance == newStartDistance) { 
					if (notInOpenSet ) {//|| newSpace.startDistance > newStartDistance) { //newSpace.startDistance > newStartDistance should be an impossible case
						newSpace.parents = [];
					}
					newSpace.parents.push(currentSpace);
					newSpace.goalDistance = Math.abs(goalSpace.listX - newSpace.listX) + Math.abs(goalSpace.listY - newSpace.listY);
					newSpace.startDistance = newStartDistance;
					newSpace.finalDistance = newSpace.goalDistance + newSpace.startDistance; //TODO: test this, it does not appear like it should be an effective herustic to me, not entirely sure yet
					if (notInOpenSet) {
						openSet.splice(binarySearch(openSet,newSpace,"finalDistance",true),0,newSpace);
					}
				}
				
			}
		}
	}
	if (solutions.length == 0) {
		return null;
	}
	return solutions; //if solutions is null then that means that no path was found
	
}

function resourceAvailable(resourceType) {
	if (collectedResources[resourceType] - reservedResources[resourceType] > 0) {
		return true;
	}
	return false;
}


tileSize = 128;
scrollDistance = 1;
scrollSpeed = 20;
maskUntouchedSpaces = true; //if true, this creates the "fog of war" type effect where unrevealed Spaces appear as solid rock (should only be set to false for debugging purposes)
selection = [];
selectionType = null;
mousePanning = false;
keyboardPanning = true;

collectedResources = {"ore":3,"crystal":0};
reservedResources = {"ore":0,"crystal":0};

gameLayer = new Layer(0,0,1,1,GameManager.screenWidth,GameManager.screenHeight);

tasksAutomated = { //update me manually for now, as the UI does not yet have task priority buttons
		"sweep":true,
		"collect":true,
		"drill":false,
		"build":true,
};

toolsRequired = {
		"sweep":"shovel",
		"drill":"drill"
};

terrain = [];
buildings = []; //similar to terrain[], just holds spaces which are buildings so that they can be easily located by raiders.
buildingSites = []; //used by raider ai pathfinding in a similar manner to buildings[]
//terrainImages = ["wall 1 (1).png","ground 1 (1).png"];

tasksAvailable = [];//.concat(collectables.objectList); //TODO: CHANGE TASKSAVAILABLE FROM A LIST TO AN OBJECTGROUP
tasksUnavailable = new ObjectGroup();

raiders = new ObjectGroup();
collectables = new ObjectGroup();

tasksInProgress = new ObjectGroup();
//raiders.push(new Raider(terrain[2][1]));
//raiders.push(new Raider(terrain[3][1]));

var selectionRectCoords = {x1:null,y1:null};

var terrainMapName = "Surf_01.js";
var cryoreMapName = "Cror_01.js"; //TODO: CONTINUE ADDING NEW MAPS TO THIS BLOCK OF CODE AND CLEANING IT UP, AND ADD CHECKS IN CASE ANY MAP DOESN'T EXIST FOR THE LEVEL BEING LOADED
var olFileName = "01.js";
var predugMapName = "Dugg_01.js";
var surfaceMapName = "High_01.js";
for (var i = 0; i < GameManager.scriptObjects[terrainMapName].level.length; i++) {
	terrain.push([]);
	for (var r = 0; r < GameManager.scriptObjects[terrainMapName].level[i].length; r++) {
		
		if (GameManager.scriptObjects[predugMapName].level[i][r] == 0) {
			if (GameManager.scriptObjects[terrainMapName].level[i][r] == 5) {
				terrain[i].push(new Space(4,i,r,GameManager.scriptObjects[surfaceMapName].level[i][r]));	
			}
			else {
				terrain[i].push(new Space(GameManager.scriptObjects[terrainMapName].level[i][r],i,r, GameManager.scriptObjects[surfaceMapName].level[i][r]));
			}
		}
				
		else if (GameManager.scriptObjects[predugMapName].level[i][r] == 3 || GameManager.scriptObjects[predugMapName].level[i][r] == 4) {
			//TODO: REPLACE THIS 'GROUND' SPACE WITH SLIMY SLUG HOLE ONCE SLUG HOLES HAVE BEEN IMPLEMENTED AS A GROUND TYPE
			terrain[i].push(new Space(0,i,r, GameManager.scriptObjects[surfaceMapName].level[i][r]));
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
		
		//terrain[i].push(new Space(GameManager.scriptObjects[terrainMapName].level[i][r],i,r));
		var currentCryOre = GameManager.scriptObjects[cryoreMapName].level[i][r];
		if (currentCryOre % 2 == 1) {
			terrain[i][r].containedCrystals = (currentCryOre + 1) / 2;
		}
		else {
			terrain[i][r].containedOre = currentCryOre / 2;
		}		
	}
}

for (var i = 0; i < GameManager.scriptObjects[predugMapName].level.length; i++) {
	for (var r = 0; r < GameManager.scriptObjects[predugMapName].level[i].length; r++) {
		if (terrain[i][r].isWall) {
			terrain[i][r].checkWallSupported();
		}
	}
}

for (var i = 0; i < GameManager.scriptObjects[predugMapName].level.length; i++) {
	for (var r = 0; r < GameManager.scriptObjects[predugMapName].level[i].length; r++) {
		var currentPredug = GameManager.scriptObjects[predugMapName].level[i][r];
		if (currentPredug == 1 || currentPredug == 3) {
			touchAllAdjacentSpaces(terrain[i][r]); //i dont like that this is being called for each space individually, but there shouldn't be any overlap, just seems kinda overkill
			//terrain[i][r].updateTouched(true); //this is done by touchAllAdjacentSpaces so it would be unnecessary to do it twice
		}
	}
}

//for (var i = 0; i < GameManager.scriptObjects[surfaceMapName].level.length; i++) {
//	for (var r = 0; r < GameManager.scriptObjects[surfaceMapName].level[i].length; r++) {
//		var currentSurface = GameManager.scriptObjects[surfaceMapName].level[i][r];
//		terrain[i][r].height = currentSurface;		
//	}
//}

var olObject;
for (var olObjectName in GameManager.scriptObjects[olFileName]) {
	olObject = GameManager.scriptObjects[olFileName][olObjectName];
	//console.log(currentObject.type);
	//console.log(GameManager.scriptObjects[olFileName].Object1.type)
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
    	var headingDir = parseInt(olObject.heading,10);
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

if (terrainMapName == "test level 1.js" || terrainMapName == "test level 2.js") { //create some test objects if we have loaded in one of the test levels (deprecated)
	collectables.push(new Collectable(terrain[3][4],"ore"));
	collectables.push(new Collectable(terrain[3][5],"ore"));
	collectables.push(new Collectable(terrain[2][5],"ore"));
	collectables.push(new Collectable(terrain[1][5],"ore"));
}


buttons = new ObjectGroup();
//function testButtonMethod() {
//	console.log("PRESSED!");
//}

function taskType(task) {
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
		return "get tool";
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
			//console.log("clear rubble called");
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
			//should i be setting task priority here?
			/*if (tasksInProgress.indexOf(selection[i].currentTask) == -1) {
				tasksInProgress.push(selection[i].currentTask); //do we even need to add 'get tool' tasks to tasksInProgress?
			}*/
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
		//if (selection[i].currentTask != selection[i].holding) {
		if (selection[i].holding == null) { //this should cover the "collect" taskType, as well as "build" and any other task type which involves a held object, as we don't want that object to be duplicated
			tasksAvailable.push(selection[i].currentTask);
		}
		var currentlyHeld = selection[i].holding;
		selection[i].clearTask(); //modifications made to clearTask should now mean that if any resources were reserved from the resource collection or dedicated to a building site, the dedication numbers have been correctly decremented
		selection[i].holding = currentlyHeld; //won't have any effect if it was already null
	}
}

buttons.push(new Button(0,0,0,0,"teleport raider button 1 (1).png",gameLayer, createRaider,false));
buttons.push(new Button(46,0,0,0,"cancel selection button 1 (1).png",gameLayer, cancelSelection,false,[])); //if selectionTypeBound is an empty list, the button will be visible for all selections except when selection == null
//6 pixel boundary between general purpose buttons and selection specific buttons
//raider selected buttons
buttons.push(new Button(86,0,0,0,"unload minifig button 1 (1).png",gameLayer, unloadMinifig,false,["raider"]));
buttons.push(new Button(126,0,0,0,"stop minifig button 1 (1).png",gameLayer, stopMinifig,false,["raider"]));
buttons.push(new Button(166,0,0,0,"get shovel button 1 (1).png",gameLayer, getTool,false,["raider"],["shovel"]));

//item selected buttons
buttons.push(new Button(86,0,0,0,"grab item button 1 (1).png",gameLayer, grabItem,false,["ore","crystal"]));

//drillable wall selected buttons
buttons.push(new Button(86,0,0,0,"drill wall button 1 (1).png",gameLayer, drillWall,false,["dirt", "loose rock", "ore seam", "energy crystal seam"]));

//floor Space selected buttons
buttons.push(new Button(86,0,0,0,"build power path button 1 (1).png",gameLayer, buildPowerPath,false,["ground"]));

//rubble selection buttons
buttons.push(new Button(86,0,0,0,"clear rubble button 1 (1).png",gameLayer, clearRubble,false,["rubble 1","rubble 2","rubble 3","rubble 4"]));

//TODO: make it so that pieces with no path to them have their spaces marked as "unaccessible" and when you drill a wall or build a dock or fulfill some other objective that allows you to reach new areas find each newly accessible square and unmark those squares

//find initial accessible tasks if a building exists at the start TODO: REPLACE THIS WITH A BETTER START SYSTEM
/*if (buildings.length > 0) { //this block is obsolete; we now do this on a space by space basis when loading in the map based on predug map values
	touchAllAdjacentSpaces(buildings[0]);
}*/ 

var selectionRectObject = new RygameObject(0,0,0,0,null,gameLayer); //TODO: MAKE THIS A PROPER OBJECT AND MOVE THE SELECTION RECT CODE TO ITS UPDATE METHOD

var selectionRectPointList;
var selectionRectCoordList;

//var taskCompleteBroadcast = []; //[currentTask,taskCompleter]  -- add to me on the frame where you set a task var to 100%, and this will notify other raiders working on the same task to move on; when found by the completer again remove from the broadcast list. this only affects user assigned tasks, as raiders won't clump up on tasks unless instructed to do so
var loading = true;

GameManager.drawSurface.font = "48px Arial";

/*var testRaider = new Raider(terrain[0][0]);
var testOre = new Collectable(terrain[0][0],"ore");
testRaider.x = 10;
testRaider.y = 34.9;
testRaider.drawAngle = Math.PI / 2;
testOre.x = 11;
testOre.y = 28;
console.log("COLLISION TEST: " + collisionRect(testRaider,testOre,false));*/

function update() {
	if (GameManager.drawSurface == null) { //canvas has been updated by the html page
		GameManager.drawSurface = document.getElementById('canvas').getContext('2d');
	}
	GameManager.drawSurface.fillStyle = "rgb(60,45,23)";
	GameManager.drawSurface.fillRect(0, 0, GameManager.screenWidth, GameManager.screenHeight);
	if (loading) {
		
		if (GameManager.keyStates[String.fromCharCode(13)]) {
			loading = false;
		}
		GameManager.drawFrame();
		GameManager.drawSurface.fillStyle = "rgb(65, 218, 0)";
		GameManager.drawSurface.fillText("Press Enter to Begin",190,300);
		return;
	}
	GameManager.updateObjects();
	if (mousePanning) {
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
	if (keyboardPanning) {
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
	
	var buttonPressedThisFrame = false;
	for (var i = 0; i < buttons.objectList.length; i++) {
		if (buttons.objectList[i].mouseDownOnButton == true) { //use mouseDownOnButton rather than releasedThisFrame because button activates on mouse release, whereas task selection here activates on mouse press
			buttonPressedThisFrame = true;
			break;
		}
	}
	if (GameManager.mouseClickedLeft && (!buttonPressedThisFrame)) { //ignore mouse clicks if they landed on a part of the UI
		var raiderSelected = null; //don't bother polling for more than one raider click since they are guaranteed to have the same drawDepth, meaning choosing one is arbitrary - might as well go with the first one found
		for (var i = 0; i < raiders.objectList.length; i++) {
			if (collisionPoint(GameManager.mouseClickPosLeft.x,GameManager.mouseClickPosLeft.y,raiders.objectList[i],raiders.objectList[i].affectedByCamera)) {
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
				if (collisionPoint(GameManager.mouseClickPosLeft.x,GameManager.mouseClickPosLeft.y,collectables.objectList[i],collectables.objectList[i].affectedByCamera)) {
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
						if (collisionPoint(GameManager.mouseClickPosLeft.x,GameManager.mouseClickPosLeft.y,terrain[i][r],terrain[i][r].affectedByCamera)) {
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
			
//			var clickedTasks = [];
//			for (var i = 0; i < terrain.length; i++) {
//				for (var r = 0; r < terrain[i].length; r++) {
//					var initialSpace = terrain[i][r];
//					//console.log(terrain[i][r].contains);
//					for (var j = 0; j < terrain[i][r].contains.objectList.length + 1; j++) {
//						//console.log("check 2");
//						if (collisionPoint(GameManager.mouseClickPosLeft.x,GameManager.mouseClickPosLeft.y,initialSpace,initialSpace.affectedByCamera) && tasksInProgress.objectList.indexOf(initialSpace) == -1  && tasksAvailable.indexOf(initialSpace) != -1) { //don't do anything if the task is already taken by another raider, we don't want to readd it to the task queue
//							if ((j == 0 && (initialSpace.drillable || initialSpace.sweepable || initialSpace.buildable)) || j == 1) { //could optimize by only continuing if j == 1 and initialSpace.walkable == true but won't for now as unwalkable spaces shouldnt have any items in contains anyway
//								/*var index = tasksUnavailable.objectList.indexOf(initialSpace);
//								if (index != -1) {
//									tasksUnavailable.objectList.splice(index,1);
//								}*/
//								//TODO: ADDED CHECKS FOR TASKSUNAVAILABLE HERE AND FOR DRILLING AND SWEEPING IN TOUCHALLADJACENTSPACES (WAS ALREADY THERE FOR COLLECTING). CONSIDER WHETHER OR NOT THIS IS A NECESSARY MOVE
//								//TODO: ADDED CHECK BELOW TO ONLY ADD TO TASKSAVAILABLE IF NOT ALREADY IN TASKSAVAILABLE. THIS CHECK IS NOT USED IN TOUCHALLADJACENTSPACES AS IT IS NOT BELIEVED TO BE NECESSARY. CONSIDER WHETHER OR NOT THIS IS CORRECT
//								/*var index = tasksAvailable.indexOf(initialSpace);
//								if (index != -1) { //refresh the task to the front of the task list if its already available (won't actually affect anything right now since tasks are chosen only based on distance, but should matter later on)
//									tasksAvailable.splice(index,1);
//								} 
//								tasksAvailable.push(initialSpace); */
//								clickedTasks.push(initialSpace);
//								//initialSpace.taskPriority = 1; //0 = chosen by the game. 1 = chosen by the player.
//								
//								//terrain[i][r].setTypeProperties("power path");
//							}
//						}
//						//could optimize by breaking if theres no collision on the square itself rather than checking contains as well, but won't for now as if a contains is on the edge of a space this will cause it to become unclickable except when clicking on the space as well
//						initialSpace = terrain[i][r].contains.objectList[j]; //TODO: RENAME INITIALSPACE NOW THAT IT IS USED FOR COLLECTABLES TOO
//					}
//				}
//			}
//			if (clickedTasks.length > 0) {
//				var lowestDrawDepthValue = clickedTasks[0].drawDepth;
//				var lowestDrawDepthId = 0;
//				for (var i = 1; i < clickedTasks.length; i++) {
//					if (clickedTasks[i].drawDepth < lowestDrawDepthValue) {
//						lowestDrawDepthValue = clickedTasks[i].drawDepth;
//						lowestDrawDepthId = i;
//					}
//				}
//				var selectedTask = clickedTasks[lowestDrawDepthId];
//				
//				var index = tasksUnavailable.objectList.indexOf(selectedTask);
//				if (index != -1) {
//					tasksUnavailable.objectList.splice(index,1);
//				}
//				
//				/*var index = tasksAvailable.indexOf(selectedTask); //should no longer be needed as now all tasks that can be reached by raiders should already be in the tasksAvailable list
//				if (index != -1) { //refresh the task to the front of the task list if its already available (won't actually affect anything right now since tasks are chosen only based on distance, but should matter later on)
//					tasksAvailable.splice(index,1);
//				} 
//				tasksAvailable.push(selectedTask);*/
//				
//				selectedTask.taskPriority = 1;
//			}
//		}
	}
	
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
	
	if (GameManager.mouseClickedRight && selection.length != 0 && selectionType == "raider") {
		 //TODO: THIS IS A BIG CHUNK OF REPEAT CODE FROM THE LEFTCLICK TASK DETECTION, THIS DESERVES ITS OWN METHOD FOR SURE
		var clickedTasks = [];
		for (var p = 0; p < terrain.length; p++) {
			for (var r = 0; r < terrain[p].length; r++) {
				var initialSpace = terrain[p][r];
				for (var j = 0; j < terrain[p][r].contains.objectList.length + 1; j++) {
					if (collisionPoint(GameManager.mouseClickPosRight.x,GameManager.mouseClickPosRight.y,initialSpace,initialSpace.affectedByCamera) && ((tasksAvailable.indexOf(initialSpace) != -1) || (tasksInProgress.objectList.indexOf(initialSpace) != -1))) { //don't do anything if the task is already taken by another raider, we don't want to readd it to the task queue
						if ((j == 0 && (initialSpace.drillable || initialSpace.sweepable || initialSpace.buildable)) || j == 1) { //could optimize by only continuing if j == 1 and initialSpace.walkable == true but won't for now as unwalkable spaces shouldnt have any items in contains anyway
							clickedTasks.push(initialSpace);
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
			for (var p = 1; p < clickedTasks.length; p++) {
				if (clickedTasks[p].drawDepth < lowestDrawDepthValue) {
					lowestDrawDepthValue = clickedTasks[p].drawDepth;
					lowestDrawDepthId = p;
				}
			}
			var selectedTask = clickedTasks[lowestDrawDepthId];
			
			var index = tasksUnavailable.objectList.indexOf(selectedTask);
			if (index != -1) {
				tasksUnavailable.objectList.splice(index,1);
			}		
			for (var i = 0; i < selection.length; i++) {	
			if (selection[i].currentTask == null) { //the only selection[i] type for now; later on any Space (and maybe collectables as well?) or vehicle, etc.. will be a valid selection[i] as even though these things cannot be assigned tasks they can be added to the high priority task queue as well as create menu buttons
						
					//selectedTask.taskPriority = 1;
					if (toolsRequired[selection[i].taskType(selectedTask)] == undefined || selection[i].tools.indexOf(toolsRequired[selection[i].taskType(selectedTask)]) != -1) {
						selection[i].currentTask = selectedTask;
						selection[i].currentObjective = selectedTask;
						var index = tasksAvailable.indexOf(selectedTask);
						if (index != -1) { //this check should no longer be necessary
							tasksAvailable.splice(index,1);
						} 
						var index = tasksInProgress.objectList.indexOf(selectedTask);
						if (index == -1) {
							tasksInProgress.push(selectedTask);
						}
						//TODO: cleanup the code at the top of the Raider class which deals with choosing a task, stick it in a method, and reuse it here for simplicity
						selection[i].currentPath = findClosestStartPath(selection[i],calculatePath(terrain,selection[i].space,typeof selectedTask.space == "undefined" ? selectedTask: selectedTask.space,true));
				
					}
				}
			}
		}
	}
	
	//inital render
	GameManager.drawFrame();
	
	//post render
	GameManager.drawSurface.strokeStyle = "rgb(0,255,0)";
	GameManager.drawSurface.fillStyle = "rgb(0,255,0)";
	GameManager.drawSurface.lineWidth = 3;
	//render selection box
	if (selectionRectCoords.x1 != null) {
		GameManager.drawSurface.beginPath();
		GameManager.drawSurface.rect(selectionRectPointList[0],selectionRectPointList[1],selectionRectPointList[2]-selectionRectPointList[0],selectionRectPointList[3]-selectionRectPointList[1]);
		GameManager.drawSurface.globalAlpha=0.3;
		GameManager.drawSurface.fillRect(selectionRectPointList[0],selectionRectPointList[1],selectionRectPointList[2]-selectionRectPointList[0],selectionRectPointList[3]-selectionRectPointList[1]);
		GameManager.drawSurface.globalAlpha=1;
		GameManager.drawSurface.stroke();
	}
	
	GameManager.drawSurface.lineWidth = 2;
	//GameManager.drawSurface.fillStyle = "rgb(0,255,0)";
	for (var i = 0; i < selection.length; i++) {
		if (selectionType == "raider") {
			GameManager.drawSurface.strokeStyle = "rgb(0,255,0)";
			//draw smallest bounding square
			GameManager.drawSurface.beginPath();
			var rectMaxLength = Math.max(selection[i].rect.width,selection[i].rect.height);
			var halfRectMaxLength = rectMaxLength/2;
			GameManager.drawSurface.rect(selection[i].centerX() - halfRectMaxLength - selection[i].drawLayer.cameraX,selection[i].centerY() - halfRectMaxLength - selection[i].drawLayer.cameraY,rectMaxLength,rectMaxLength);
			GameManager.drawSurface.stroke();
			
			//draw smallest rotated bounding rect
			GameManager.drawSurface.fillStyle = "rgb(255,0,0)";
			GameManager.drawSurface.strokeStyle = "rgb(255,0,0)";
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
		else {
			 GameManager.drawSurface.globalAlpha=0.3;
			 GameManager.drawSurface.fillRect(selection[i].x - selection[i].drawLayer.cameraX,selection[i].y - selection[i].drawLayer.cameraY,selection[i].rect.width,selection[i].rect.height);
			 GameManager.drawSurface.globalAlpha=1;
		}
	}
	
	/*var sweepFound = false;
	for (var i = 0; i < tasksAvailable.length; i++) {
		if (tasksAvailable[i].sweepable == true) {
			console.log("sweepable task available");
			sweepFound = true;
		}
	}
	if (!sweepFound) {
		console.log("sweepable task not available");
	}*/
	//console.log(tasksAvailable);
	
	//debug render
	GameManager.setFontSize(48);
	GameManager.drawSurface.fillStyle = "rgb(165, 100, 255)";
	for (var i = 0; i < buildingSites.length; i++) {
		//console.log("required: " + buildingSites[i].requiredResources["ore"] + " dedicated: " + buildingSites[i].dedicatedResources["ore"] + " placedResources: " + buildingSites[i].placedResources["ore"]);
		GameManager.drawText("Ore: " + buildingSites[i].placedResources["ore"] + "/" + buildingSites[i].requiredResources["ore"],buildingSites[i].centerX()-buildingSites[i].drawLayer.cameraX,buildingSites[i].y-buildingSites[i].drawLayer.cameraY,true);
		//GameManager.drawSurface.fillText("Energy Crystals: " + collectedResources["crystal"],341,100);
	}
	GameManager.setFontSize(36);
	GameManager.drawSurface.fillStyle = "rgb(200, 220, 255)";
	for (var i = 0; i < raiders.objectList.length; i++) {
		GameManager.drawText(raiders.objectList[i].taskType(raiders.objectList[i].currentTask),raiders.objectList[i].centerX()-raiders.objectList[i].drawLayer.cameraX,raiders.objectList[i].y-raiders.objectList[i].drawLayer.cameraY,true);
	}
	GameManager.drawSurface.fillStyle = "rgb(255, 0, 0)";
	GameManager.setFontSize(24);
	//console.log(GameManager.drawSurface.font);
	/*for (var i = 0; i < terrain.length; i++) {
		for (var r = 0; r < terrain[i].length; r++) {
			GameManager.drawText(i + ", " + r,terrain[i][r].centerX()-terrain[i][r].drawLayer.cameraX,terrain[i][r].centerY()-terrain[i][r].drawLayer.cameraY,true,true);
			//GameManager.drawSurface.fillText(i + ", " + r,terrain[i][r].x-terrain[i][r].drawLayer.cameraX,terrain[i][r].y-terrain[i][r].drawLayer.cameraY);
		}
	}*/
	for (var i = 0; i < terrain.length; i++) {
		for (var r = 0; r < terrain[i].length; r++) {
			GameManager.drawText(terrain[i][r].height,terrain[i][r].centerX()-terrain[i][r].drawLayer.cameraX,terrain[i][r].centerY()-terrain[i][r].drawLayer.cameraY,true,true);
			//GameManager.drawSurface.fillText(i + ", " + r,terrain[i][r].x-terrain[i][r].drawLayer.cameraX,terrain[i][r].y-terrain[i][r].drawLayer.cameraY);
		}
	}
	//GameManager.drawSurface.fillStyle = "rgb(0, 0, 255)";
	/*GameManager.setFontSize(36);
	for (var i = 0; i < terrain.length; i++) {
		for (var r = 0; r < terrain[i].length; r++) {
			GameManager.drawText(terrain[i][r].touched,terrain[i][r].centerX()-terrain[i][r].drawLayer.cameraX,terrain[i][r].centerY()-terrain[i][r].drawLayer.cameraY,true,true);
			//GameManager.drawSurface.fillText(i + ", " + r,terrain[i][r].x-terrain[i][r].drawLayer.cameraX,terrain[i][r].y-terrain[i][r].drawLayer.cameraY);
		}
	}*/
	
	/*for (var i = 0; i < terrain.length; i++) {
		for (var r = 0; r < terrain[i].length; r++) {
			GameManager.drawText((terrain[i][r].taskPriority == null ? 0 : terrain[i][r].taskPriority),terrain[i][r].centerX()-terrain[i][r].drawLayer.cameraX,terrain[i][r].centerY()-terrain[i][r].drawLayer.cameraY,true,true);
		}
	}*/
	for (var i = 0; i < terrain.length; i++) {
		for (var r = 0; r < terrain[i].length; r++) {
			GameManager.drawText((terrain[i][r].dedicatedResources == null ? "" : "+" + terrain[i][r].dedicatedResources["ore"]),terrain[i][r].centerX()-terrain[i][r].drawLayer.cameraX,terrain[i][r].centerY()-terrain[i][r].drawLayer.cameraY,true,true);
		}
	}
	
	GameManager.setFontSize(48);
	GameManager.drawSurface.fillStyle = "rgb(65, 218, 0)";
	GameManager.drawSurface.fillText("Ore: " + collectedResources["ore"],600,40);
	GameManager.drawSurface.fillText("Energy Crystals: " + collectedResources["crystal"],341,100);
	GameManager.setFontSize(36);
	//GameManager.drawSurface.fillText("Selection: " + (selection.length == 0 ? "None" : selection.constructor.name + " at position: " + (typeof selection.space == "undefined" ? selection.listX + "," + selection.listY : selection.space.listX + "," + selection.space.listY)),8,592); //to be replaced with classic green selection rectangle
	GameManager.drawSurface.fillText("Selection Type: " + selectionType + (selectionType == null ? "" : (" x " + selection.length)),8,592); //to be replaced with classic green selection rectangle
	
	/*console.log("TASKS AVAILABLE START");
	for (var i = 0; i < tasksAvailable.length; i++) {
		console.log(tasksAvailable[i]);
	}
	console.log("TASKS AVAILABLE END");*/
	var buildTasksAvailable = 0;
	for (var i = 0; i < tasksAvailable.length; i++) {
		if (raiders.objectList[0].taskType(tasksAvailable[i]) == "build") {
			buildTasksAvailable +=1;
		}
	}
	//if (buildTasksAvailable > 0) {
	//console.log("build tasks available: " + buildTasksAvailable + (buildTasksAvailable > 0 ? "!!!" : ""));
	console.log("BUILDINGS NUM: " + buildings.length);
	//}
	/*var resourcesAvailable = 0;
	for (var i = 0; i < tasksAvailable.length; i ++) {
		if (tasksAvailable[i].space != null) {
			resourcesAvailable++;
		}
	}
	console.log("resources currently in the tasksAvailable list: " + resourcesAvailable);*/
	//console.log("ctrl key status: " + GameManager.keyStates[String.fromCharCode(17)]);
}

_intervalId = setInterval(update, 1000 / GameManager.fps);
