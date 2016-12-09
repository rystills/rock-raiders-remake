makeChild("BuildingPlacer","RygameObject");
BuildingPlacer.prototype.update = function() {
	if (this.visible && !this.isHelper) {
		if (GameManager.mouseReleasedRight) {
			this.stop();
			return;
		}
		
		this.updatePosition();	
		var currentSpace = this.getCurrentSpace();
		if (GameManager.mouseReleasedLeft && this.positionValid(currentSpace)) {
			this.placeBuilding(currentSpace);
			return;
		}
	}
	for (var i =0; i < this.children.length; ++i) {
		this.children[i].x = this.x + tileSize;
		this.children[i].y = this.y;
	}
};

BuildingPlacer.prototype.start = function(type) {
	this.visible = true;
	this.type = type;
	this.dir = 0;
	if (type == "tool store") {
		this.children.push(new BuildingPlacer(this.type,true));
	}
	for (var i = 0; i < this.children.length; ++i) {
		this.children[i].start();
	}
};

BuildingPlacer.prototype.stop = function() {
	this.visible = false;
	while (this.children.length > 0) {
		this.children[this.children.length - 1].die();
		this.children.pop();
	}
};

BuildingPlacer.prototype.positionValid = function(space) {
	if (space.type != "ground") {
		return false;
	}
	//do not allow placement on a space on which any raiders are currently colliding
	for (var i = 0; i < raiders.objectList.length; ++i) {
		if (collisionRect(raiders.objectList[i], space)) {
			return false;
		}
	}
	return true;
};

BuildingPlacer.prototype.updatePosition = function() {
	//helpers are positioned manually by the primary BuildingPlacer
	if (!this.isHelper) {
		this.x = GameManager.mousePos.x;
		this.x += (gameLayer.cameraX % tileSize);
		this.x = Math.floor(this.x / tileSize) * tileSize;
		this.x -= (gameLayer.cameraX % tileSize);
		this.y = GameManager.mousePos.y;
		this.y += (gameLayer.cameraY % tileSize);
		this.y = Math.floor(this.y / tileSize) * tileSize;
		this.y -= (gameLayer.cameraY % tileSize);
	}
};

BuildingPlacer.prototype.placeBuilding = function(space) {
	space.setTypeProperties(this.type);
	buildings.push(space);
	this.stop();
};

BuildingPlacer.prototype.getCurrentSpace = function() {
	//remember that the grid is actually (y,x) rather than (x,y)
	return terrain[Math.floor((this.y + gameLayer.cameraY)/tileSize)][Math.floor((this.x + gameLayer.cameraX)/tileSize)];
};

function BuildingPlacer(buildingType,isHelper) {
	RygameObject.call(this,0,0,1000000,10000,null,gameLayer,false); //update after Space, and draw in front of space
	this.buildingType = buildingType;
	this.drawSurface = createContext(tileSize,tileSize,false);
	this.drawSurface.globalAlpha=.25;
	this.drawSurface.fillStyle = "rgb(255,0,0)";
	this.drawSurface.fillRect(0,0,this.drawSurface.canvas.width,this.drawSurface.canvas.height); //darken screen while awaitingStart
	this.visible = false;
	this.isHelper = (isHelper == true ? true : false);
	this.children = [];
}