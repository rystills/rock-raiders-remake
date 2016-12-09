makeChild("BuildingPlacer","RygameObject");
BuildingPlacer.prototype.update = function() {
	if (this.visible && !this.isHelper) {
		if (GameManager.mouseReleasedRight) {
			this.stop();
			return;
		}
		
		this.updatePosition();	
		for (var i =0; i < this.children.length; ++i) {
			this.children[i].updatePosition();
		}
		var currentSpace = this.getCurrentSpace();
		if (GameManager.mouseReleasedLeft && this.positionValid(currentSpace)) {
			var childPositionsValid = true;
			for (var i = 0; i < this.children.length; ++i) {
				if (!this.children[i].positionValid(this.children[i].getCurrentSpace())) {
					childPositionsValid = false;
					break;
				}
			}
			if (childPositionsValid) {
				this.placeBuilding(currentSpace);
				return;
			}
		}
	}
};

BuildingPlacer.prototype.start = function(type) {
	this.visible = true;
	if (type != null) {
		this.buildingType = type;
	}
	
	this.dir = 0;
	if (type == "tool store") {
		this.children.push(new BuildingPlacer("power path",true,1,0));
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
	this.x = GameManager.mousePos.x;
	this.x += (gameLayer.cameraX % tileSize);
	this.x = Math.floor(this.x / tileSize) * tileSize;
	this.x -= (gameLayer.cameraX % tileSize);
	this.y = GameManager.mousePos.y;
	this.y += (gameLayer.cameraY % tileSize);
	this.y = Math.floor(this.y / tileSize) * tileSize;
	this.y -= (gameLayer.cameraY % tileSize);
	this.x += tileSize * this.xOffset;
	this.y += tileSize * this.yOffset;
};

BuildingPlacer.prototype.placeBuilding = function(space) {
	space.setTypeProperties(this.buildingType);
	if (!this.isHelper) {
		buildings.push(space);
	}
	
	for (var i = 0; i < this.children.length; ++i) {
		this.children[i].placeBuilding(this.children[i].getCurrentSpace());
	}
	this.stop();
};

BuildingPlacer.prototype.getCurrentSpace = function() {
	//remember that the grid is actually (y,x) rather than (x,y)
	//console.log(this.isHelper);
	return terrain[Math.floor((this.y + gameLayer.cameraY)/tileSize)][Math.floor((this.x + gameLayer.cameraX)/tileSize)];
};

function BuildingPlacer(buildingType,isHelper,xOffset,yOffset) {
	if (xOffset == null) {
		xOffset = 0;
	}
	if (yOffset == null) {
		yOffset = 0;
	}
	RygameObject.call(this,0,0,1000000,10000,null,gameLayer,false); //update after Space, and draw in front of space
	this.buildingType = buildingType;
	this.drawSurface = createContext(tileSize,tileSize,false);
	this.drawSurface.globalAlpha=.25;
	this.drawSurface.fillStyle = "rgb(255,0,0)";
	this.drawSurface.fillRect(0,0,this.drawSurface.canvas.width,this.drawSurface.canvas.height); //darken screen while awaitingStart
	this.visible = false;
	this.isHelper = (isHelper == true ? true : false);
	this.xOffset = xOffset;
	this.yOffset = yOffset;
	this.children = [];
}