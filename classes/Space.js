makeChild("Space","RygameObject");
Space.prototype.makeFloor = function() {
	this.setTypeProperties("ground",this.image == "ground 1 (1).png");
};
Space.prototype.makeRubble = function(rubbleContainsOre,drilledBy) {
	if (drilledBy != null) {
		this.completedBy = drilledBy;
		drilledBy.completedLastFrame.push(this);
		drilledBy.rockBreakSound.play(); //TODO: have all walls play this sound, rather than just the immediately drilled one
	}
	//this.drilledBy = drilledBy;
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
			//adjacentSpaces[i].drilledBy = this;
			adjacentSpaces[i].checkWallSupported(drilledBy);
		}
	}
	//console.log(tasksAvailable.indexOf(this));
	touchAllAdjacentSpaces(this);
	//this.drilledBy = null;
};
Space.prototype.checkWallSupported = function(drilledBy) {
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
	this.makeRubble(true,drilledBy);
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
	this.adjustHeightAlpha(); //reset height-based alpha after sweeping, as it will be reset after calling setTyleProperties
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
	else if (type == "slug hole") {
		this.image = "SlimySlugHole.jpg";
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
		if (type == "rubble 1") { //this little section could be automated using strings, but asset names should not be considered reliable in this type of instance, so to keep things clean we write each one out
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
			else { //this case should never be possible
				console.log("WARNING: BUILDING TRIED TO ADD ITSELF TO BUILDINGS LIST, BUT WAS ALREADY THERE");
			}

			var testTask;
			for (var k = 0; k < tasksUnavailable.length; k++) { //this chunk of code is copied from Raider update method
				testTask = tasksUnavailable.objectList[k];
				if (taskType(testTask) == "build") { //&& testTask.resourceNeeded(this.holding.type)) {
					//if (testTask.resourceNeeded()) { //TODO: REPLACE THIS LINE WITH A CHECK IF ONE OF THE RESOURCES NEEDED IS CURRENTLY IN THE STASH, AS OTHERWISE ADDING THE BUILD TASK TO TASKSAVAILABLE IS POINTLESS, AS IT WILL BE SENT BACK TO TASKSUNAVAILABLE WHEN A RAIDER TRIES TO TAKE UP THE TASK
					
					//the below chunk of code is copied from a different part of Raider update method
					var dedicatedResourceTypes = Object.getOwnPropertyNames(testTask.dedicatedResources); //TODO: THIS IS COPIED FROM THE RESOURCENEEDED METHOD, AND SHOULD BE PUT IN ITS OWN SUBMETHOD AS IT IS REPEAT CODE
					for (var i = 0; i < dedicatedResourceTypes.length; i++) {
						if (testTask.dedicatedResources[dedicatedResourceTypes[i]] < testTask.requiredResources[dedicatedResourceTypes[i]]) {
							//console.log("stuck at this point");
							if (resourceAvailable(dedicatedResourceTypes[i])) {					
								tasksAvailable.push(testTask);
								tasksUnavailable.objectList.splice(k,1);
								break;
							}
						}					
						
					}
					//continue //TODO: DECIDE WHETHER OR NOT IT IS OK FOR US TO POTENTIALLY REENABLE MORE THAN ONE BUILDING SITE WHEN WE MAY ONLY HAVE 1 OF A REQUIRED RESOURCE TYPE
				}
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
	
	if (this.touched == true) {
		this.drawAngle = this.headingAngle;
	}
	else {
		this.drawAngle = 0;
	}
	
	if (this.touched == false && maskUntouchedSpaces == true) {
		if (this.image != "solid rock 1 (1).png") {
			this.changeImage("solid rock 1 (1).png");
		}
	}
	else {
		//we never actually modified this.image so we should just be able to use it
		this.setTypeProperties(this.type);
		
		//set brightness / darkness based on height, as long as its not a wall
		if (!this.isWall) {
			this.adjustHeightAlpha();
		}
	}
};
Space.prototype.adjustHeightAlpha = function() {
	var heightAlphaChange = .02;
	this.drawSurface.beginPath();
	if (this.height > 10) {
		this.drawSurface.globalAlpha=heightAlphaChange*(this.height - 10);
		this.drawSurface.fillStyle="rgb(255,255,255)";
		this.drawSurface.fillRect(0,0,this.rect.width,this.rect.height);
		
	}
	else if (this.height < 10) {
		this.drawSurface.globalAlpha=heightAlphaChange*3*(10 - this.height); //multiply by a constant to artificially inflate the darkness change, since rendering a black semitransparent rect seems to have much less of an effect than rendering a white semitransparent rect for some reason
		this.drawSurface.fillStyle="rgb(0,0,0)";
		this.drawSurface.fillRect(0,0,this.rect.width,this.rect.height);
		
	}
	this.drawSurface.stroke();
	this.drawSurface.globalAlpha = 1;
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

spaceTypes = {
		1:"solid rock", 
		2:"hard rock",
		'-1':"power path",
		0:"ground",
		3:"slug hole",
		4:"slug hole",
		5:"ground",
		3:"loose rock",
		4:"dirt",
		6:"lava",
		8:"ore seam",
		9:"water",
		10:"energy crystal seam",
		11:"recharge seam",
		100:"rubble 1",
		101:"rubble 2",
		102:"rubble 3",
		103:"rubble 4",
		'-2':"tool store",
		'-3':"teleport pad",
		'-101':"building site",
		'-102':"building site",
		'-103':"building site"
		};


function Space(type,listX,listY,height) {
	//convert basic types from the numbers used in the level files to easily readable strings
	this.height = height;
	this.buildingSiteType = null;
	this.type = spaceTypes[type]; //this way you can input the string type directly if you're creating a space manually, rather than having to use the level file numbers and converting here
	if (type == -101) {
		this.buildingSiteType = "power path"; //TODO: SET 'RUBBLECONTAINSORE' VARIABLE IN THE SAME WAY AND REMOVE IT FROM THE SETTYPEPROPERTIES METHOD HEADER (or make rubbleContainsOre a local int in the Space class so that it only gets set when needed rather than getting modified in the setTypeProperties method)
	}
	else if (type == -102) {
		this.buildingSiteType = "tool store"; 
	}
	else if (type == -103) {
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
	this.completedBy = null;
	//this.height = 0;
	this.headingAngle = 0; //temporary angle variable used to store correct drawAngle when space has not yet been touched (is still in the fog)
	//this.drilledBy = null;
	/*if (maskUntouchedSpaces == false) { //need this check since the first time setTypeProperties is called it cannot change the image as the RygameObject constructor has not yet been called
		this.setTypeProperties(this.type);
	}*/
	//this.touched = false;
}