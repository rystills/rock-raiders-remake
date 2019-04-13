makeChild("BuildingPlacer", "RygameObject");

// how each direction alters y,x coordinate placement
BuildingPlacer.dirOffsets = [];
BuildingPlacer.dirOffsets.push([[1, 0], [1, 1], [2, 0]]);
BuildingPlacer.dirOffsets.push([[0, -1], [1, -1], [0, -2]]);
BuildingPlacer.dirOffsets.push([[-1, 0], [-1, -1], [-2, 0]]);
BuildingPlacer.dirOffsets.push([[0, 1], [-1, 1], [0, 2]]);

/**
 * update the building placer and its children, placing the new building on left mouse click or exiting on right mouse click
 */
BuildingPlacer.prototype.update = function () {
	if (this.visible && !this.isHelper) {
		if (GameManager.mouseReleasedRight) {
			this.stop();
			return;
		}

		this.checkUpdateKeyPress();

		this.updatePosition();

		this.drawSurface = this.invalidSurface;
		for (let i = 0; i < this.children.length; ++i) {
			this.children[i].drawSurface = this.children[i].invalidSurface;
			this.children[i].updatePosition();
		}
		const currentSpace = this.getCurrentSpace();
		if (currentSpace == null) {
			return;
		}
		const positionValid = this.positionValid(currentSpace);
		let childPositionsValid = true;
		for (let i = 0; i < this.children.length; ++i) {
			if (!this.children[i].positionValid(this.children[i].getCurrentSpace())) {
				childPositionsValid = false;
				continue;
			}
			this.children[i].drawSurface = this.children[i].validSurface;
		}
		if (GameManager.mouseReleasedLeft && positionValid && childPositionsValid) {
			this.placeBuilding(currentSpace);
			return;
		}
		if (positionValid) {
			this.drawSurface = this.validSurface;
		}
	}
};

/**
 * override withinLayerBounds to pretend we are always in-bounds, and therefore should be rendered
 */
BuildingPlacer.prototype.withinLayerBounds = function () {
	return true;
};

/**
 * check if the R key has been pressed, and if so, rotate the placer
 */
BuildingPlacer.prototype.checkUpdateKeyPress = function () {
	// check if the R key is pressed
	if (GameManager.keyStates[String.fromCharCode(82)]) {
		this.holdingRKey = true;
	} else {
		if (this.holdingRKey) {
			this.rotate();
			this.holdingRKey = false;
		}
	}
};

/**
 * rotate the building placer by 90 degrees, and update its children's locations by performing a restart
 */
BuildingPlacer.prototype.rotate = function () {
	this.dir = (this.dir + 1) % 4;
	// restart with new dir to create children in the correct position
	this.stop();
	this.start(this.buildingType, true);
};

/**
 * start the placer, creating children in the correct location depending on its type and orientation
 * @param type: the type of building that the user is attempting to place
 * @param keepDir: whether the placer should keep its current direction (true) or reset its direction to 0 (false)
 */
BuildingPlacer.prototype.start = function (type, keepDir) {
	this.visible = true;
	if (type != null) {
		this.buildingType = type;
	}
	if (keepDir !== true) {
		this.dir = 0;
	}

	if (type === "tool store" || type === "teleport pad" || type === "docks" || type === "support station") {
		this.children.push(new BuildingPlacer("building power path", true, BuildingPlacer.dirOffsets[this.dir][0][0], BuildingPlacer.dirOffsets[this.dir][0][1]));
	} else if (type === "power station") {
		this.children.push(new BuildingPlacer("power station topRight", true, BuildingPlacer.dirOffsets[this.dir][0][0], BuildingPlacer.dirOffsets[this.dir][0][1], this));
		this.children.push(new BuildingPlacer("power station powerPath", true, BuildingPlacer.dirOffsets[this.dir][1][0], BuildingPlacer.dirOffsets[this.dir][1][1], this));
	} else if (type === "ore refinery") {
		this.children.push(new BuildingPlacer("ore refinery right", true, BuildingPlacer.dirOffsets[this.dir][0][0], BuildingPlacer.dirOffsets[this.dir][0][1], this));
		this.children.push(new BuildingPlacer("building power path", true, BuildingPlacer.dirOffsets[this.dir][2][0], BuildingPlacer.dirOffsets[this.dir][2][1]));
	} else if (type === "geological center") {
		this.children.push(new BuildingPlacer("geological center right", true, BuildingPlacer.dirOffsets[this.dir][0][0], BuildingPlacer.dirOffsets[this.dir][0][1], this));
	} else if (type === "mining laser") {
		this.children.push(new BuildingPlacer("mining laser right", true, BuildingPlacer.dirOffsets[this.dir][0][0], BuildingPlacer.dirOffsets[this.dir][0][1], this));
	} else if (type === "upgrade station") {
		this.children.push(new BuildingPlacer("upgrade station right", true, BuildingPlacer.dirOffsets[this.dir][0][0], BuildingPlacer.dirOffsets[this.dir][0][1], this));
	} else if (type === "super teleport") {
		this.children.push(new BuildingPlacer("super teleport topRight", true, BuildingPlacer.dirOffsets[this.dir][0][0], BuildingPlacer.dirOffsets[this.dir][0][1], this));
		this.children.push(new BuildingPlacer("building power path", true, BuildingPlacer.dirOffsets[this.dir][1][0], BuildingPlacer.dirOffsets[this.dir][1][1]));
		this.children.push(new BuildingPlacer("building power path", true, -1 * BuildingPlacer.dirOffsets[this.dir][0][1], BuildingPlacer.dirOffsets[this.dir][0][0]));
	}
	for (let i = 0; i < this.children.length; ++i) {
		this.children[i].start();
		this.children[i].dir = this.dir;
	}
};

/**
 * stop the placer, destroying its children and setting it to invisible
 */
BuildingPlacer.prototype.stop = function () {
	if (this.visible) {
		this.visible = false;
		while (this.children.length > 0) {
			this.children[this.children.length - 1].die();
			this.children.pop();
		}
	}
};

/**
 * check whether or not the placer is currently in a position that allows for building placement
 * @param space: the space over which the building placer is currently hovering
 * @returns boolean whether the building placer is in a valid position (true) or not (false)
 */
BuildingPlacer.prototype.positionValid = function (space) {
	// this should only happen when we are hovering out of bounds
	if (space == null) {
		return false;
	}
	if (space.type !== "ground") {
		return false;
	}
	// power paths are allowed to be colliding with other objects, as long as they are still being placed on a ground tile
	if (this.buildingType === "power path" || this.buildingType === "building power path" || this.buildingType === "power station powerPath") {
		return true;
	}
	// do not allow placement on a space on which any raiders are currently colliding
	for (let i = 0; i < raiders.objectList.length; ++i) {
		if (collisionRect(raiders.objectList[i], space)) {
			return false;
		}
	}
	// helpers don't need to perform power path collision check, as the master checks that
	if (this.isHelper || this.touchingPowerPath(space)) {
		return true;
	}
	for (let i = 0; i < this.children.length; ++i) {
		if (this.children[i].touchingPowerPath(this.children[i].getCurrentSpace())) {
			return true;
		}
	}
	return false;
};

/**
 * check whether or not the building placer is currently touching a power path
 * @param space: the space over which the placer is currently hovering
 * @returns boolean whether the building placer is touching a power path (true) or not (false)
 */
BuildingPlacer.prototype.touchingPowerPath = function (space) {
	if (adjacentSpace(terrain, space.listX, space.listY, "up").type === "power path") {
		return true;
	}
	if (adjacentSpace(terrain, space.listX, space.listY, "down").type === "power path") {
		return true;
	}
	if (adjacentSpace(terrain, space.listX, space.listY, "left").type === "power path") {
		return true;
	}
	if (adjacentSpace(terrain, space.listX, space.listY, "right").type === "power path") {
		return true;
	}
};

/**
 * update the placer's position based on the mouse coordinates, factoring in the camera position and tile size
 */
BuildingPlacer.prototype.updatePosition = function () {
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

/**
 * place a new building instance of the desired type
 * @param space: the space on which to place the new building
 */
BuildingPlacer.prototype.placeBuilding = function (space) {
	if (powerPathSpaceTypes.indexOf(this.buildingType) !== -1) {
		space.setTypeProperties(this.buildingType, null, null, null, null, null, (this.dir * 90 - 90 + (this.dir % 2 === 1 ? 180 : 0)) *
			(Math.PI / 180), this.parentBuilder == null ? null : this.parentBuilder.getCurrentSpace());
	} else {
		space.buildingSiteType = this.buildingType;
		space.childSpaces = [];
		for (let i = 0; i < this.children.length; ++i) {
			space.childSpaces.push(this.children[i].getCurrentSpace());
		}
		space.setTypeProperties("building site", null, null, null, null, null, (this.dir * 90 - 90 + (this.dir % 2 === 1 ? 180 : 0)) *
			(Math.PI / 180), this.parentBuilder == null ? null : this.parentBuilder.getCurrentSpace());
	}

	for (let i = 0; i < this.children.length; ++i) {
		this.children[i].placeBuilding(this.children[i].getCurrentSpace());
	}
	if (!this.isHelper) {
		this.stop();
	}
};

/**
 * get the space over which the building placer is currently hovering
 * @returns the space in the level terrain corresponding to the building placer's current location
 */
BuildingPlacer.prototype.getCurrentSpace = function () {
	const yCoord = Math.floor((this.y + gameLayer.cameraY) / tileSize);
	const xCoord = Math.floor((this.x + gameLayer.cameraX) / tileSize);
	// check bounds before attempting to access terrain Space
	if (Math.min(yCoord, xCoord) < 0 || yCoord >= terrain.length || terrain.length === 0 || xCoord >= terrain[yCoord].length) {
		return null;
	}
	return terrain[yCoord][xCoord];
};

/**
 * BuildingPlacer constructor: instantiate the placer, setting its location and drawSurfaces, and specifying its parent if it is a helper
 * @param buildingType: the type of building to which this placer corresponds
 * @param isHelper: whether this placer is a helper (true) or the master placer (falsee)
 * @param xOffset: the grid x offset of this placer from the master
 * @param yOffset: the grid y offset of this placer from the master
 * @param parentBuilder: the master placer of which this placer is a child
 */
function BuildingPlacer(buildingType, isHelper, xOffset, yOffset, parentBuilder) {
	if (xOffset == null) {
		xOffset = 0;
	}
	if (yOffset == null) {
		yOffset = 0;
	}
	this.parentBuilder = parentBuilder;
	// update after Space, and draw in front of space
	RygameObject.call(this, 0, 0, 1000000, drawDepthBuildingPlacier, null, gameLayer, false);
	this.buildingType = buildingType;

	this.drawSurface = createContext(tileSize, tileSize, false);
	this.drawSurface.globalAlpha = .25;
	this.drawSurface.fillStyle = "rgb(255,0,0)";
	// red semi-transparent overlay
	this.drawSurface.fillRect(0, 0, this.drawSurface.width, this.drawSurface.height);
	this.invalidSurface = this.drawSurface;
	this.validSurface = createContext(tileSize, tileSize, false);
	this.validSurface.globalAlpha = .25;
	// color power paths yellowish
	this.validSurface.fillStyle = (buildingType === "power path" || buildingType === "building power path" || buildingType === "power station powerPath" ? "rgb(200,255,0)" : "rgb(0,255,0)");
	// green semi-transparent overlay
	this.validSurface.fillRect(0, 0, this.drawSurface.width, this.drawSurface.height);

	this.visible = false;
	this.isHelper = (isHelper === true);
	this.xOffset = xOffset;
	this.yOffset = yOffset;
	this.children = [];
	this.holdingRKey = false;
}