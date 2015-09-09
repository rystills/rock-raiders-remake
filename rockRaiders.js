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
		return;
	}
	if (initialSpace.isBuilding == false && (!(initialSpace.walkable || initialSpace.type == "water" || initialSpace.type == "lava"))) {
		if (initialSpace.drillable && tasksAutomated["drill"] == true) {
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
	if (initialSpace.sweepable && tasksAutomated["sweep"] == true) {
		var index = tasksUnavailable.objectList.indexOf(initialSpace);
		if (index != -1) {
			tasksUnavailable.objectList.splice(index,1);
		}
		tasksAvailable.push(initialSpace);
	}
	if (initialSpace.buildable && tasksAutomated["build"] == true && initialSpace.resourceNeeded()) { //didnt say else in case a space may be allowed to be both buildable and sweepable at the same time
		var index = tasksUnavailable.objectList.indexOf(initialSpace);
		if (index != -1) {
			tasksUnavailable.objectList.splice(index,1);
		}
		tasksAvailable.push(initialSpace);
	}
	if (tasksAutomated["collect"] == true) {
		for (var i = 0; i < initialSpace.contains.objectList.length; i++) {
			//add each member of contains to tasksavailable
			var index = tasksUnavailable.objectList.indexOf(initialSpace.contains.objectList[i]);
			if (index != -1) {
				tasksUnavailable.objectList.splice(index,1);
			}
			tasksAvailable.push(initialSpace.contains.objectList[i]);
		}
	}
	
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

function calculatePath(terrain,startSpace,goalSpace) { 
	if (startSpace == goalSpace) {
		return [goalSpace];
	}
	startSpace.goalDistance = Math.abs(goalSpace.listX - startSpace.listX) + Math.abs(goalSpace.listY - startSpace.listY); //remember this is the least possible distance, not the actual distance
	startSpace.startDistance = 0;
	startSpace.finalDistance = startSpace.goalDistance;
	startSpace.parent = null;
	priorityQueue = []; //TODO: this really deserves a better data structure than a list that we keep sorted with binarySearch ;)
	closedSet = [];
	openSet = [startSpace];
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
			
			//check this here so that the algorithm is a little bit faster, but also so that paths to non-walkable terrain pieces (such as for drilling) will work
			if (newSpace == goalSpace) {
				newSpace.parent = currentSpace;
				path = [newSpace];
				while (newSpace.parent != startSpace) {
					newSpace = newSpace.parent;
					path.push(newSpace);
				}
				//path.splice(-1,1); //do not return the starting space as part of the path
				return path;
			}

			
			if ((newSpace != null) && (newSpace.walkable == true)) {
				if (closedSet.indexOf(newSpace) != -1) {
					continue;
				}
				newStartDistance = currentSpace.startDistance + 1;
				notInOpenSet = openSet.indexOf(newSpace) == -1;
				if (notInOpenSet || newSpace.startDistance >= newStartDistance) { 
					newSpace.parent = currentSpace;
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
	return null; //no path was found
	
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
maskUntouchedSpaces = false; //if true, this creates the "fog of war" type effect where unrevealed Spaces appear as solid rock (should only be set to false for debugging purposes)
selection = null;
mousePanning = false;
keyboardPanning = true;

collectedResources = {"ore":0,"crystal":0};
reservedResources = {"ore":0,"crystal":0};

gameLayer = new Layer(0,0,1,1,GameManager.screenWidth,GameManager.screenHeight);

tasksAutomated = {
		"sweep":false,
		"collect":false,
		"drill":false,
		"build":true,
};

terrain = [];
buildings = []; //similar to terrain[], just holds spaces which are buildings so that they can be easily located by raiders.
buildingSites = []; //used by raider ai pathfinding in a similar manner to buildings[]
terrainImages = ["wall 1 (1).png","ground 1 (1).png"];

tasksAvailable = [];//.concat(collectables.objectList); //TODO: CHANGE TASKSAVAILABLE FROM A LIST TO AN OBJECTGROUP
tasksUnavailable = new ObjectGroup();

raiders = new ObjectGroup();
collectables = new ObjectGroup();

tasksInProgress = new ObjectGroup();
//raiders.push(new Raider(terrain[2][1]));
//raiders.push(new Raider(terrain[3][1]));

var terrainMapName = "Surf_01.js";
var cryoreMapName = "Cror_01.js"; //TODO: CONTINUE ADDING NEW MAPS TO THIS BLOCK OF CODE AND CLEANING IT UP, AND ADD CHECKS IN CASE ANY MAP DOESN'T EXIST FOR THE LEVEL BEING LOADED
var olFileName = "01.js";
var predugMapName = "Dugg_01.js";
for (var i = 0; i < GameManager.scriptObjects[terrainMapName].level.length; i++) {
	terrain.push([]);
	for (var r = 0; r < GameManager.scriptObjects[terrainMapName].level[i].length; r++) {
		terrain[i].push(new Space(GameManager.scriptObjects[terrainMapName].level[i][r],i,r));
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
		if (currentPredug == 1) {
			touchAllAdjacentSpaces(terrain[i][r]); //i dont like that this is being called for each space individually, but there shouldn't be any overlap, just seems kinda overkill
			//terrain[i][r].updateTouched(true); //this is done by touchAllAdjacentSpaces so it would be unnecessary to do it twice
		}
	}
}

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
	selection = null;
}
buttons.push(new Button(0,0,0,0,"teleport raider button 1 (1).png",gameLayer, createRaider,false));
buttons.push(new Button(40,0,0,0,"cancel selection button 1 (1).png",gameLayer, cancelSelection,false));

//TODO: make it so that pieces with no path to them have their spaces marked as "unaccessible" and when you drill a wall or build a dock or fulfill some other objective that allows you to reach new areas find each newly accessible square and unmark those squares

//find initial accessible tasks if a building exists at the start TODO: REPLACE THIS WITH A BETTER START SYSTEM
/*if (buildings.length > 0) { //this block is obsolete; we now do this on a space by space basis when loading in the map based on predug map values
	touchAllAdjacentSpaces(buildings[0]);
}*/ 

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
		//console.log("check 1");
		var clickedTasks = [];
		for (var i = 0; i < terrain.length; i++) {
			for (var r = 0; r < terrain[i].length; r++) {
				var initialSpace = terrain[i][r];
				//console.log(terrain[i][r].contains);
				for (var j = 0; j < terrain[i][r].contains.objectList.length + 1; j++) {
					//console.log("check 2");
					if (collisionPoint(GameManager.mouseClickPosLeft.x,GameManager.mouseClickPosLeft.y,initialSpace,initialSpace.affectedByCamera) && tasksInProgress.objectList.indexOf(initialSpace) == -1) { //don't do anything if the task is already taken by another raider, we don't want to readd it to the task queue
						if ((j == 0 && (initialSpace.drillable || initialSpace.sweepable || initialSpace.buildable)) || j == 1) { //could optimize by only continuing if j == 1 and initialSpace.walkable == true but won't for now as unwalkable spaces shouldnt have any items in contains anyway
							/*var index = tasksUnavailable.objectList.indexOf(initialSpace);
							if (index != -1) {
								tasksUnavailable.objectList.splice(index,1);
							}*/
							//TODO: ADDED CHECKS FOR TASKSUNAVAILABLE HERE AND FOR DRILLING AND SWEEPING IN TOUCHALLADJACENTSPACES (WAS ALREADY THERE FOR COLLECTING). CONSIDER WHETHER OR NOT THIS IS A NECESSARY MOVE
							//TODO: ADDED CHECK BELOW TO ONLY ADD TO TASKSAVAILABLE IF NOT ALREADY IN TASKSAVAILABLE. THIS CHECK IS NOT USED IN TOUCHALLADJACENTSPACES AS IT IS NOT BELIEVED TO BE NECESSARY. CONSIDER WHETHER OR NOT THIS IS CORRECT
							/*var index = tasksAvailable.indexOf(initialSpace);
							if (index != -1) { //refresh the task to the front of the task list if its already available (won't actually affect anything right now since tasks are chosen only based on distance, but should matter later on)
								tasksAvailable.splice(index,1);
							} 
							tasksAvailable.push(initialSpace); */
							clickedTasks.push(initialSpace);
							//initialSpace.taskPriority = 1; //0 = chosen by the game. 1 = chosen by the player.
							
							//terrain[i][r].setTypeProperties("power path");
						}
					}
					//could optimize by breaking if theres no collision on the square itself rather than checking contains as well, but won't for now as if a contains is on the edge of a space this will cause it to become unclickable except when clicking on the space as well
					initialSpace = terrain[i][r].contains.objectList[j]; //TODO: RENAME INITIALSPACE NOW THAT IT IS USED FOR COLLECTABLES TOO
				}
			}
		}
		if (clickedTasks.length > 0) {
			var lowestDrawDepthValue = clickedTasks[0].drawDepth;
			var lowestDrawDepthId = 0;
			for (var i = 1; i < clickedTasks.length; i++) {
				if (clickedTasks[i].drawDepth < lowestDrawDepthValue) {
					lowestDrawDepthValue = clickedTasks[i].drawDepth;
					lowestDrawDepthId = i;
				}
			}
			var selectedTask = clickedTasks[lowestDrawDepthId];
			
			var index = tasksUnavailable.objectList.indexOf(selectedTask);
			if (index != -1) {
				tasksUnavailable.objectList.splice(index,1);
			}
			
			var index = tasksAvailable.indexOf(selectedTask);
			if (index != -1) { //refresh the task to the front of the task list if its already available (won't actually affect anything right now since tasks are chosen only based on distance, but should matter later on)
				tasksAvailable.splice(index,1);
			} 
			tasksAvailable.push(selectedTask);
			
			selectedTask.taskPriority = 1;
		}
	}
		
	GameManager.drawFrame();
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
	//GameManager.drawSurface.fillStyle = "rgb(0, 0, 255)";
	GameManager.setFontSize(36);
	for (var i = 0; i < terrain.length; i++) {
		for (var r = 0; r < terrain[i].length; r++) {
			GameManager.drawText(terrain[i][r].touched,terrain[i][r].centerX()-terrain[i][r].drawLayer.cameraX,terrain[i][r].centerY()-terrain[i][r].drawLayer.cameraY,true,true);
			//GameManager.drawSurface.fillText(i + ", " + r,terrain[i][r].x-terrain[i][r].drawLayer.cameraX,terrain[i][r].y-terrain[i][r].drawLayer.cameraY);
		}
	}
	GameManager.setFontSize(48);
	GameManager.drawSurface.fillStyle = "rgb(65, 218, 0)";
	GameManager.drawSurface.fillText("Ore: " + collectedResources["ore"],600,40);
	GameManager.drawSurface.fillText("Energy Crystals: " + collectedResources["crystal"],341,100);
}

_intervalId = setInterval(update, 1000 / GameManager.fps);
