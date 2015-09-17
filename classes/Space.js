makeChild("Space","RygameObject");
Space.prototype.makeFloor = function() {
	this.setTypeProperties("ground",this.image == "ground 1 (1).png");
};
Space.prototype.makeRubble = function(rubbleContainsOre) {
	this.setTypeProperties("rubble 1",false,rubbleContainsOre); //setTypeProperties will check the value of rubbleContainsOre for us, so no need to do a type check here, just pipe it in
	for (var i = this.containedCrystals; i > 0; i--) {
		this.containedCrystals--;
		var newCrystal = new Collectable(this,"crystal");
		collectables.push(newCrystal); //don't add to tasksAvailable yet because it will be picked up by touchAllAdjacentSpaces
		//if (tasksAutomated["collect"] == true) { //note: redesign; delete me and the other tasksAutomated references in this Class in the near future
		//tasksAvailable.push(newCrystal);
		//}
	}
	for (var i = this.containedOre; i > 0; i--) {
		this.containedOre--;
		var newOre = new Collectable(this,"ore");
		collectables.push(newOre); //don't add to tasksAvailable yet because it will be picked up by touchAllAdjacentSpaces
		//if (tasksAutomated["collect"] == true) {
		//tasksAvailable.push(newOre);
		//}
	}
	
	this.updateTouched(false); //set it back to false so we can run the search from the newly drilled square (this is also where the 'sweep' task is added to the tasksAvailable list)
	//note that we call updateTouched before checking the adjacentSpaces
	var adjacentSpaces = [];
	adjacentSpaces.push(adjacentSpace(terrain,this.listX,this.listY,"up"));
	adjacentSpaces.push(adjacentSpace(terrain,this.listX,this.listY,"down"));
	adjacentSpaces.push(adjacentSpace(terrain,this.listX,this.listY,"left"));
	adjacentSpaces.push(adjacentSpace(terrain,this.listX,this.listY,"right"));
	
	for (var i = 0; i < adjacentSpaces.length; i++) {
		if (adjacentSpaces[i] != null && adjacentSpaces[i].isWall == true) {
			adjacentSpaces[i].checkWallSupported();
		}
	}
	//console.log(tasksAvailable.indexOf(this));
	touchAllAdjacentSpaces(this);
};
Space.prototype.checkWallSupported = function() {
	if (!this.isWall) {
		return;
	}
	var adjacentSpaceIsWall = [true,true,true,true];
	var adjacentSpaces = [];
	adjacentSpaces.push(adjacentSpace(terrain,this.listX,this.listY,"up"));
	adjacentSpaces.push(adjacentSpace(terrain,this.listX,this.listY,"down"));
	adjacentSpaces.push(adjacentSpace(terrain,this.listX,this.listY,"left"));
	adjacentSpaces.push(adjacentSpace(terrain,this.listX,this.listY,"right"));
	for (var i = 0; i < adjacentSpaces.length; i++) {
		if (adjacentSpaces[i] != null) {
			adjacentSpaceIsWall[i] = adjacentSpaces[i].isWall;
		}
	}
	
	if ((adjacentSpaceIsWall[0] || adjacentSpaceIsWall[1]) && (adjacentSpaceIsWall[2] || adjacentSpaceIsWall[3])) {
		return;
	}
	this.makeRubble(true);
};
Space.prototype.sweep = function() {
	if (this.rubbleContainsOre == true) {
		var newOre = new Collectable(this,"ore");
		collectables.push(newOre);
		//if (tasksAutomated["collect"] == true) {
		tasksAvailable.push(newOre);
		//}
	}
	if (this.type != "rubble 4") {
		//if (tasksAutomated["sweep"] == true) {
		tasksAvailable.push(this);
		//}
	}
	if (this.type == "rubble 1") {
		this.setTypeProperties("rubble 2",false,this.rubbleContainsOre);
	}
	else if (this.type == "rubble 2") {
		this.setTypeProperties("rubble 3",false,this.rubbleContainsOre);
	}
	else if (this.type == "rubble 3") {
		this.setTypeProperties("rubble 4",false,this.rubbleContainsOre);
	}
	else if (this.type == "rubble 4") {
		this.setTypeProperties("ground");
	}
};

Space.prototype.setTypeProperties = function(type,doNotChangeImage,rubbleContainsOre,requiredResources,dedicatedResources,placedResources) {
	if ((rubbleContainsOre != true) && (this.rubbleContainsOre != true)) { //certain variables, such as rubbleContainsOre, should stay true even when this method is called multiple times
		rubbleContainsOre = false;
	}
	else {
		rubbleContainsOre = true;
	}
	//console.log("TYPE: " + this.type + " RUBBLECONTAINSORE: " + this.rubbleContainsOre);
	if (dedicatedResources == null) { //TODO: DECIDE WHETHER OR NOT DEDICATED/PLACED/REQUIRED RESOURCES, LIKE RUBBLECONTAINSORE, SHOULD STAY CONSTANT EVEN IF THE METHOD IS CALLED MULTIPLETIMES (SO THAT A BUILDING SITE THAT IS SOMEHOW IN AN UNDISCOVERED CAVERN DOES NOT HAVE ITS RESOURCES RESET TO 0 I GUESS)
		dedicatedResources = {"ore":0,"crystal":0};
	}
	if (placedResources == null) {
		placedResources = {"ore":0,"crystal":0};
	}
	if (requiredResources == null) {  //TODO: REMOVE THIS AND PASS IN RESOURCE COUNTS PROPERLY FOR BUILDABLE SPACES
		//TODO: NOT SURE IF THE ABOVE NULL CHECK IS EVEN NECESSARY AT THIS POINT
		if (this.buildingSiteType == "power path") {
			requiredResources = {"ore":2,"crystal":0};
		}
		else if (this.buildingSiteType == "tool store") {
			requiredResources = {"ore":5,"crystal":0};
		}
		else if (this.buildingSiteType == "teleport pad") {
			requiredResources = {"ore":10,"crystal":1}; 
		}
	}
	this.type = type;
	this.speedModifier = 1;
	this.walkable = false;
	this.drillable = false;
	this.sweepable = false;
	this.buildable = false;
	this.isBuilding = false;
	this.isWall = false;
	this.rubbleContainsOre = rubbleContainsOre; //rubble from an avalanche or a destroyed building or something will not contain ore, but rubble from drilling will. these types of rubble are identical in every other sense, so no reason to create separate types, just use a boolean instead
	this.drillPercent = 0;
	this.sweepPercent = 0;
	this.reinforcePercent = 0;
	if (type == "ground") {
		this.image = "ground 1 (1).png";
		this.walkable = true;
	}
	else if (type == "power path") {
		this.image = "power path 1 (1).png";
		this.walkable = true;
		this.speedModifier = 1.5;
	}
	else if (type == "solid rock") {
		this.image = "solid rock 1 (1).png";
		this.isWall = true;
	}
	else if (type == "hard rock") {
		this.image = "hard rock 1 (1).png";
		this.isWall = true;
	}
	else if (type == "dirt") {
		this.image = "dirt 1 (1).png";
		this.drillable = true;
		this.isWall = true;
	}
	else if (type == "lava") {
		this.image = "lava 1 (1).png";
	}
	else if (type == "ore seam") {
		this.image = "ore seam 1 (1).png";
		this.drillable = true;
		this.isWall = true;
	}
	else if (type == "water") {
		this.image = "water 1 (1).png";
	}
	else if (type == "energy crystal seam") {
		this.image = "energy crystal seam 1 (1).png";
		this.drillable = true;
		this.isWall = true;
	}
	else if (type == "recharge seam") {
		this.image = "recharge seam 1 (1).png";
		this.isWall = true;
	}
	else if (type == "loose rock") {
		this.image = "loose rock 1 (1).png";
		this.drillable = true;
		this.isWall = true;
	}
	else if (type.slice(0,6) == "rubble") {
		if (type == "rubble 1") { //this little section could be automated usings strings, but asset names should not be considered reliable in this type of instance, so to keep things clean we write each one out
			this.image = "rubble 1 (1).png";
		}
		else if (type == "rubble 2") {
			this.image = "rubble 2 (1).png";
		}
		else if (type == "rubble 3") {
			this.image = "rubble 3 (1).png";
		}
		else if (type == "rubble 4") {
			this.image = "rubble 4 (1).png";
		}
		this.walkable = true;
		this.sweepable = true;
		this.speedModifier = .5;
	}
	else if (type == "teleport pad") {
		this.image = "teleport pad 1 (1).png";
		this.isBuilding = true;
		if (this.touched == true) {
			var index = buildings.indexOf(this);
			if (index == -1) {
				buildings.push(this);
			}
		}
	}
	else if (type == "tool store") {
		this.image = "tool store 1 (1).png";
		this.isBuilding = true;
		if (this.touched == true) {
			var index = buildings.indexOf(this);
			if (index == -1) {
				buildings.push(this);
			}
		}
		
	}
	
	else if (type == "building site") {
		this.image = "building site 1 (1).png";
		if (this.touched == true) {
			var index = buildingSites.indexOf(this);
			if (index == -1) {
				buildingSites.push(this);
			}
		}
		
		this.walkable = true;
		this.buildable = true;
		this.dedicatedResources = dedicatedResources;
		this.requiredResources = requiredResources;
		this.placedResources = placedResources;
	}
	if ((maskUntouchedSpaces == false || this.touched == true) && doNotChangeImage != true) { //need the check for drawSurface as the first time this method is run the RygameObject constructor has not yet been called
		this.changeImage(this.image);
		
	}
};
Space.prototype.updateTouched = function(touched) { //if this space has not yet been revealed then we want it to appear as solid rock, but we leave this.image alone to keep track of its actual image. this might be cheating intended engine use a little bit but thats ok
	this.touched = touched;
	if (this.touched == false && maskUntouchedSpaces == true) {
		if (this.image != "solid rock 1 (1).png") {
			this.changeImage("solid rock 1 (1).png");
		}
	}
	else {
		//we never actually modified this.image so we should just be able to use it
		this.setTypeProperties(this.type);
	}
};
Space.prototype.allResourcesPlaced = function() {
	var placedResourceTypes = Object.getOwnPropertyNames(this.placedResources);
	for (var i = 0; i < placedResourceTypes.length; i++) {
		if (this.placedResources[placedResourceTypes[i]] < this.requiredResources[placedResourceTypes[i]]) {
			return false;
		}
	}
	return true;
};
Space.prototype.resourceNeeded = function(resourceType) {
	if (resourceType != null) {
		if (this.dedicatedResources[resourceType] < this.requiredResources[resourceType]) {
			return true;
		}
		else {
			return false;
		}
			
	}
	//console.log(this.dedicatedResources);
	var dedicatedResourceTypes = Object.getOwnPropertyNames(this.dedicatedResources);
	//var requiredResourceTypes = Object.getOwnPropertyNames(this.requiredResources);
	for (var i = 0; i < dedicatedResourceTypes.length; i++) {
		if (this.dedicatedResources[dedicatedResourceTypes[i]] < this.requiredResources[dedicatedResourceTypes[i]]) {
			return true;
		}
	}
	return false;
};
Space.prototype.updatePlacedResources = function(resourceType) {
	this.placedResources[resourceType]++;
	if (this.allResourcesPlaced()) {
		//console.log("all resources placed");
		this.setTypeProperties(this.buildingSiteType);
		
		var index = buildingSites.indexOf(this);
		if (index != -1) { //this check should never evaluate to false, but we do it regardless as a safety precaution
			buildingSites.splice(index,1);
			buildings.push(this);
		} 
	}
};
function Space(type,listX,listY) {
	//convert basic types from the numbers used in the level files to easily readable strings
	this.type = type; //this way you can input the string type directly if you're creating a space manually, rather than having to use the level file numbers and converting here
	this.buildingSiteType = null;
	if (type == 1) {
		this.type = "solid rock";
	}
	if (type == 2) {
		this.type = "hard rock";
	}
	else if (type == -1) {
		this.type = "power path";
	}
	else if (type == 0 || type == 5) { //the wiki page claims that 5 is dirt, but the game (and Map Creator) seems to disagree, and treats 5 as ground
		this.type = "ground";
	}
	else if (type == 3) {
		this.type = "loose rock";
	}
	else if (type == 4) {
		this.type = "dirt";
	}
	else if (type == 6) {
		this.type = "lava";
	}
	else if (type == 8) {
		this.type = "ore seam";
	}
	else if (type == 9) {
		this.type = "water";
	}
	else if (type == 10) {
		this.type = "energy crystal seam";
	}
	else if (type == 11) {
		this.type = "recharge seam";
	}
	else if (type == 100) {
		this.type = "rubble 1";
	}
	else if (type == 101) {
		this.type = "rubble 2";
	}
	else if (type == 102) {
		this.type = "rubble 3";
	}
	else if (type == 103) {
		this.type = "rubble 4";
	}
	else if (type == -2) {
		this.type = "tool store";
	}
	else if (type == -3) {
		this.type = "teleport pad";
	}
	else if (type == -101) {
		this.type = "building site";
		this.buildingSiteType = "power path"; //TODO: SET 'RUBBLECONTAINSORE' VARIABLE IN THE SAME WAY AND REMOVE IT FROM THE SETTYPEPROPERTIES METHOD HEADER (or make rubbleContainsOre a local int in the Space class so that it only gets set when needed rather than getting modified in the setTypeProperties method)
	}
	else if (type == -102) {
		this.type = "building site";
		this.buildingSiteType = "tool store"; 
	}
	else if (type == -103) {
		this.type = "building site";
		this.buildingSiteType = "teleport pad"; 
	}
	/*else { //TODO: DELETE THIS CASE ONCE ALL TERRAIN TYPES FROM THE ORIGINAL GAME HAVE A CORRESPONDING TYPE VALUE HERE
		this.type = "power path";
	}*/
	this.setTypeProperties(this.type,true);
	RygameObject.call(this,listY*tileSize,listX*tileSize,100000,100000,this.image,gameLayer);	
	this.updateTouched(false);
	this.listX = listX;
	this.listY = listY;
	this.powerPathSpace = null;
	this.containedOre = 0; //defined by the cryore map and set immediately after Space creation
	this.containedCrystals = 0; //defined by the cryore map and set immediately after Space creation
	this.contains = new ObjectGroup(); //objects which currently reside on the space. can be infinite (ex. collectables)
	/*if (maskUntouchedSpaces == false) { //need this check since the first time setTypeProperties is called it cannot change the image as the RygameObject constructor has not yet been called
		this.setTypeProperties(this.type);
	}*/
	//this.touched = false;
}