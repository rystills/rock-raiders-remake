makeChild("Space", "RygameObject");

// enum of space types
spaceTypes = {
	1: "solid rock",
	2: "hard rock",
	'-1': "building power path",
	'-1.2': "power path",
	0: "ground",
	30: "slug hole",
	40: "slug hole",
	5: "ground",
	3: "loose rock",
	4: "dirt",
	6: "lava",
	8: "ore seam",
	9: "water",
	10: "energy crystal seam",
	11: "recharge seam",
	100: "rubble 1",
	101: "rubble 2",
	102: "rubble 3",
	103: "rubble 4",
	'-2': "tool store",
	'-3': "teleport pad",
	'-4': "docks",
	'-5': "power station",
	'-5.2': "power station topRight",
	'-6': "support station",
	'-7': "upgrade station",
	'-7.2': "upgrade station right",
	'-8': "geological center",
	'-8.2': "geological center right",
	'-9': "ore refinery",
	'-9.2': "ore refinery right",
	'-10': "mining laser",
	'-10.2': "mining laser right",
	'-11': "super teleport",
	'-11.2': "super teleport topRight",
	'-101': "building site",
	'-102': "building site",
	'-103': "building site",
	'-104': "building site",
	'-105': "building site",
	'-105.2': "building site",
	'-106': "building site",
	'-107': "building site",
	'-107.2': "building site",
	'-108': "building site",
	'-108.2': "building site",
	'-109': "building site",
	'-109.2': "building site",
	'-110': "building site",
	'-110.2': "building site",
	'-111': "building site",
	'-111.2': "building site"
};

/**
 * increase this space's drill percent. if the space is a seam, create the respective collectable type after each 20% drilling mark
 * @param drillPercentIncrease: how much more of this space has just been drilled
 * @param dropSpace: the space onto which any collectables that fell out of this space should land, if it is a seam
 */
Space.prototype.updateDrillPercent = function (drillPercentIncrease, dropSpace) {
	this.drillPercent += drillPercentIncrease;
	if (this.type === "ore seam" || this.type === "energy crystal seam") {
		for (let i = 20; i <= 80; i += 20) {
			// if we go up by a 20% mark, spawn a piece of ore or energy crystal
			if (this.drillPercent >= i && this.drillPercent - drillPercentIncrease < i) {
				const newOre = new Collectable(dropSpace, this.type === "ore seam" ? "ore" : "crystal");
				collectables.push(newOre);
				tasksAvailable.push(newOre);
			}
		}
	}
};

/**
 * increase this space's sweep percent
 * @param sweepPercentIncrease: how much more of this space has just been swept
 */
Space.prototype.updateSweepPercent = function (sweepPercentIncrease) {
	this.sweepPercent += sweepPercentIncrease;
};

/**
 * remove any dummies from tasksAvailable, if present
 */
Space.prototype.checkRemoveDummyTasks = function () {
	let index = tasksAvailable.indexOf(this.dynamiteDummy);
	if (index !== -1) {
		tasksAvailable.splice(index, 1);
	}
	index = tasksAvailable.indexOf(this.reinforceDummy);
	if (index !== -1) {
		tasksAvailable.splice(index, 1);
	}
};

Space.prototype.randomX = function () {
	const rx = this.rect.width / 3;
	return this.centerX() + randomInt(-rx, rx);
};

Space.prototype.randomY = function () {
	const ry = this.rect.height / 3;
	return this.centerY() + randomInt(-ry, ry);
};

/**
 * turn this space into rubble 1 (largest rubble level)
 * @param rubbleContainsOre: the number of ores this space's rubble has in it
 * @param drilledBy: the raider instance who completed drilling this space
 * @param silent: whether this wall should collapse silently (true) or play a sound on collapsing (false)
 */
Space.prototype.makeRubble = function (rubbleContainsOre, drilledBy, silent = false) {
	// if we are a seam, generate all of the remaining ore/crystals now
	if (this.type === "ore seam" || this.type === "energy crystal seam") {
		for (let i = 20; i <= 80; i += 20) {
			// if we hadn't drilled this far yet, release another collectable
			if (this.drillPercent < i) {
				const newOre = new Collectable(this, this.type === "ore seam" ? "ore" : "crystal", this.randomX(), this.randomY());
				collectables.push(newOre);
				tasksAvailable.push(newOre);
			}
		}
	}
	// kill dummies to stop any active tasks, since these can no longer be performed (if already dead, nothing will happen)
	if (this.drillDummy) {
		this.drillDummy.die();
	}
	if (this.reinforceDummy) {
		this.reinforceDummy.die();
	}
	if (this.dynamiteDummy) {
		this.dynamiteDummy.die();
	}
	this.checkRemoveDummyTasks();
	if (drilledBy != null) {
		drilledBy.tasksToClear.push(this);
	}
	if (!silent) {
		this.soundList.push(GameManager.playSoundEffect("SFX_RockBreak"));
	}
	// setTypeProperties will check the value of rubbleContainsOre for us, so no need to do a type check here, just pipe it in
	this.setTypeProperties("rubble 1", false, rubbleContainsOre);
	for (let i = this.containedCrystals; i > 0; i--) {
		this.containedCrystals--;
		const newCrystal = new Collectable(this, "crystal", this.randomX(), this.randomY());
		// don't add to tasksAvailable yet because it will be picked up by touchAllAdjacentSpaces
		collectables.push(newCrystal);
	}
	for (let i = this.containedOre; i > 0; i--) {
		this.containedOre--;
		const newOre = new Collectable(this, "ore", this.randomX(), this.randomY());
		// don't add to tasksAvailable yet because it will be picked up by touchAllAdjacentSpaces
		collectables.push(newOre);
	}

	// set touched back to false so we can run the search from the newly drilled square (this is also where the 'sweep' task is added to the tasksAvailable list)
	this.updateTouched(false);
	// note that we call updateTouched before checking the adjacentSpaces
	const adjacentSpaces = this.getAdjacentSpaces();

	for (let i = 0; i < adjacentSpaces.length; i++) {
		if (adjacentSpaces[i] != null && adjacentSpaces[i].isWall === true) {
			adjacentSpaces[i].checkWallSupported(drilledBy, silent);
		}
	}
	touchAllAdjacentSpaces(this);
};

/**
 * get the list of adjacent spaces (left, right, up, down)
 */
Space.prototype.getAdjacentSpaces = function () {
	const adjacentSpaces = [];
	adjacentSpaces.push(adjacentSpace(terrain, this.listX, this.listY, "up"));
	adjacentSpaces.push(adjacentSpace(terrain, this.listX, this.listY, "down"));
	adjacentSpaces.push(adjacentSpace(terrain, this.listX, this.listY, "left"));
	adjacentSpaces.push(adjacentSpace(terrain, this.listX, this.listY, "right"));
	return adjacentSpaces;
};

Space.prototype.isUpgradeable = function () {
	return this.upgradeLevel < 2 && RockRaiders.rightPanel.resources["ore"] >= 5;
};

/**
 * increase this Space's upgrade level, if it is a building
 */
Space.prototype.upgrade = function () {
	if (this.isUpgradeable()) {
		this.upgradeLevel += 1;
		RockRaiders.rightPanel.changeResource("ore", -5);
	}
};

/**
 * determine whether or not this wall is supported by surrounding walls. If not, activate makeRubble and propagate out
 * @param drilledBy: the raider instance who completed drilling this space
 * @param silent: whether this wall should collapse silently (true) or play a sound on collapsing (false)
 */
Space.prototype.checkWallSupported = function (drilledBy, silent = false) {
	if (!this.isWall) {
		return;
	}
	const adjacentSpaceIsWall = [true, true, true, true];
	const adjacentSpaces = [];
	adjacentSpaces.push(adjacentSpace(terrain, this.listX, this.listY, "up"));
	adjacentSpaces.push(adjacentSpace(terrain, this.listX, this.listY, "down"));
	adjacentSpaces.push(adjacentSpace(terrain, this.listX, this.listY, "left"));
	adjacentSpaces.push(adjacentSpace(terrain, this.listX, this.listY, "right"));
	for (let i = 0; i < adjacentSpaces.length; i++) {
		if (adjacentSpaces[i] != null) {
			adjacentSpaceIsWall[i] = adjacentSpaces[i].isWall;
		}
	}

	if ((adjacentSpaceIsWall[0] || adjacentSpaceIsWall[1]) && (adjacentSpaceIsWall[2] || adjacentSpaceIsWall[3])) {
		return;
	}
	this.makeRubble(4, drilledBy, silent);
};

/**
 * reduce the level of rubble on this space, and generate a piece of ore at space center if the rubble contains ore
 */
Space.prototype.sweep = function () {
	if (this.rubbleContainsOre && this.rubbleContainsOre > 0) {
		this.rubbleContainsOre--;
		const newOre = new Collectable(this, "ore", this.randomX(), this.randomY());
		collectables.push(newOre);
		tasksAvailable.push(newOre);
	}
	if (this.type !== "rubble 4") {
		tasksAvailable.push(this);
	}
	if (this.type === "rubble 1") {
		this.setTypeProperties("rubble 2", false, this.rubbleContainsOre);
	} else if (this.type === "rubble 2") {
		this.setTypeProperties("rubble 3", false, this.rubbleContainsOre);
	} else if (this.type === "rubble 3") {
		this.setTypeProperties("rubble 4", false, this.rubbleContainsOre);
	} else if (this.type === "rubble 4") {
		this.setTypeProperties("ground");
	}
};

Space.prototype.setRockImage = function (matIndex) {
	const walls = [[false, false, false], [false, false, false], [false, false, false]];
	let wallsCount = 0;
	for (let y = -1; y <= 1; y++) {
		for (let x = -1; x <= 1; x++) {
			const neighborSpace = adjacentSpaceXY(terrain, this.listX, this.listY, x, y);
			if (!neighborSpace || neighborSpace.isWall || !neighborSpace.touched) {
				walls[y + 1][x + 1] = true; // somehow coords are mixed up...
				wallsCount += 1;
			}
		}
	}
	this.shapeIndex = 0;
	if (!walls[0][1] && !walls[0][2] && !walls[1][2]) {
		this.drawAngle = 0.5 * Math.PI; // 0 = lower right, 0.5 = lower left, ...
		this.shapeIndex = 5; // corner
	} else if (!walls[0][1] && !walls[0][0] && !walls[1][0]) {
		this.drawAngle = Math.PI;
		this.shapeIndex = 5;
	} else if (!walls[1][0] && !walls[2][0] && !walls[2][1]) {
		this.drawAngle = -0.5 * Math.PI;
		this.shapeIndex = 5;
	} else if (!walls[2][1] && !walls[2][2] && !walls[1][2]) {
		this.drawAngle = 0;
		this.shapeIndex = 5;
	} else if (wallsCount === 7) {
		this.shapeIndex = 3; // inverted corner
		if (!walls[0][0]) {
			this.drawAngle = Math.PI;
		} else if (!walls[2][0]) {
			this.drawAngle = -0.5 * Math.PI;
		} else if (!walls[0][2]) {
			this.drawAngle = 0.5 * Math.PI;
		} else if (walls[2][2]) {
			this.shapeIndex = 0;
			// even part
			if (!walls[1][0]) { // top missing
				this.drawAngle = Math.PI;
			} else if (!walls[0][1]) { // left missing
				this.drawAngle = 0.5 * Math.PI;
			} else if (!walls[2][1]) { // right missing
				this.drawAngle = -0.5 * Math.PI;
			} else {
				this.drawAngle = 0;
			}
		}
	} else { // even part
		if (!walls[1][0]) { // top missing
			this.drawAngle = Math.PI;
		} else if (!walls[0][1]) { // left missing
			this.drawAngle = 0.5 * Math.PI;
		} else if (!walls[2][1]) { // right missing
			this.drawAngle = -0.5 * Math.PI;
		} else {
			this.drawAngle = 0;
		}
	}
	this.image = "World/WorldTextures/" + RockRaiders.themeName + "Split/" + RockRaiders.themeName + this.shapeIndex.toString() + matIndex.toString() + ".bmp";
};

Space.prototype.isSelectable = function () {
	return this.selectable && this.touched && this.shapeIndex !== 3;
};

/**
 * custom die code: kill children before calling base class die
 */
Space.prototype.die = function () {
	if (this.drillDummy != null) {
		this.drillDummy.die();
	}
	if (this.reinforceDummy != null) {
		this.reinforceDummy.die();
	}
	if (this.dynamiteDummy != null) {
		this.dynamiteDummy.die();
	}
	return RygameObject.prototype.die.call(this);
};

Space.prototype.setPowerPathSpace = function () {
	// round the heading angle as buildings can only be facing in cardinal directions
	const headingDir = Math.round(this.headingAngle * 180 / Math.PI) + 90;
	if (headingDir === 0) {
		this.powerPathSpace = adjacentSpace(terrain, this.listX, this.listY, "up");
	} else if (headingDir === 90) {
		this.powerPathSpace = adjacentSpace(terrain, this.listX, this.listY, "right");
	} else if (headingDir === 180) {
		this.powerPathSpace = adjacentSpace(terrain, this.listX, this.listY, "down");
	} else if (headingDir === 270) {
		this.powerPathSpace = adjacentSpace(terrain, this.listX, this.listY, "left");
	}
};

/**
 * set all type-specific properties of the current space (called on init, as well as when changing space type)
 * @param type: this space's type
 * @param doNotChangeImage: whether this space should not change images while setting the new type (true) or should change images (false)
 * @param rubbleContainsOre: the number of ores this space's rubble has in it
 * @param requiredResources: the resources required to finish building this space (only valid if this is a building site)
 * @param dedicatedResources: the resources dedicated to build this space, but not yet placed (only valid if this is a building site)
 * @param placedResources: the resources placed at this space (only valid if this is a building site)
 * @param drawAngle: the direction in which this space is facing (only valid for buildings)
 * @param parentSpace: the space of which this space is a child (used to identify children of main building space)
 */
Space.prototype.setTypeProperties = function (type, doNotChangeImage, rubbleContainsOre, requiredResources, dedicatedResources, placedResources, drawAngle, parentSpace) {
	this.waitingToCompleteConstruction = false;
	if (drawAngle != null) {
		this.drawAngle = drawAngle;
	}
	if (parentSpace != null) {
		this.parentSpace = parentSpace;
	}
	// certain variables, such as rubbleContainsOre, should stay even when this method is called multiple times
	rubbleContainsOre = (rubbleContainsOre && this.rubbleContainsOre) ? Math.max(rubbleContainsOre, this.rubbleContainsOre) : (rubbleContainsOre ? rubbleContainsOre : (this.rubbleContainsOre ? this.rubbleContainsOre : 0));
	if (dedicatedResources == null) {
		dedicatedResources = {"ore": 0, "crystal": 0};
	}
	if (placedResources == null) {
		placedResources = {"ore": 0, "crystal": 0};
	}
	if (requiredResources == null) {
		if (this.buildingSiteType === "power path") {
			requiredResources = {"ore": 2, "crystal": 0};
		} else if (this.buildingSiteType === "tool store") {
			requiredResources = {"ore": 5, "crystal": 0};
		} else if (this.buildingSiteType === "teleport pad") {
			requiredResources = {"ore": 10, "crystal": 1};
		} else if (this.buildingSiteType === "power station") {
			requiredResources = {"ore": 8, "crystal": 1};
		} else if (this.buildingSiteType === "power station topRight") {
			requiredResources = {"ore": 7, "crystal": 1};
		} else if (this.buildingSiteType === "geological center") {
			requiredResources = {"ore": 8, "crystal": 2};
		} else if (this.buildingSiteType === "geological center right") {
			requiredResources = {"ore": 7, "crystal": 1};
		} else if (this.buildingSiteType === "docks") {
			requiredResources = {"ore": 8, "crystal": 1};
		} else if (this.buildingSiteType === "support station") {
			requiredResources = {"ore": 15, "crystal": 3};
		} else if (this.buildingSiteType === "upgrade station") {
			requiredResources = {"ore": 20, "crystal": 3};
		} else if (this.buildingSiteType === "ore refinery") {
			requiredResources = {"ore": 10, "crystal": 2};
		} else if (this.buildingSiteType === "ore refinery right") {
			requiredResources = {"ore": 10, "crystal": 1};
		} else if (this.buildingSiteType === "mining laser") {
			requiredResources = {"ore": 15, "crystal": 1};
		} else if (this.buildingSiteType === "super teleport") {
			requiredResources = {"ore": 10, "crystal": 2};
		} else if (this.buildingSiteType === "super teleport topRight") {
			requiredResources = {"ore": 10, "crystal": 1};
		}
	}
	this.type = type;
	this.speedModifier = 1;
	this.drillSpeedModifier = 1;
	this.walkable = false;
	this.drillable = false;
	this.drillHardable = false;
	this.explodable = false;
	this.sweepable = false;
	this.buildable = false;
	this.isBuilding = false;
	this.isWall = false;
	// rubble from an avalanche or a destroyed building will not contain ore, but rubble from drilling will.
	// these types of rubble are identical in every other sense, so no reason to create separate types, just remember the contained ore instead.
	this.rubbleContainsOre = rubbleContainsOre;
	this.drillPercent = 0;
	this.sweepPercent = 0;
	this.reinforcePercent = 0;
	this.selectable = true;
	this.shapeIndex = 0;
	if (type === "ground") {
		this.image = "World/WorldTextures/" + RockRaiders.themeName + "Split/" + RockRaiders.themeName + "00.BMP";
		this.walkable = true;
	} else if (type === "slug hole") {
		this.image = "World/WorldTextures/" + RockRaiders.themeName + "Split/" + RockRaiders.themeName + "30.BMP";
		this.walkable = true;
		this.selectable = false;
	} else if (powerPathSpaceTypes.indexOf(type) !== -1) {
		this.image = (type === "power station powerPath" ? "power station powerPath.png" : type === "building power path" ? "World/WorldTextures/" + RockRaiders.themeName + "Split/" + RockRaiders.themeName + "76.BMP" :
			type === "power path" ? "World/WorldTextures/" + RockRaiders.themeName + "Split/" + RockRaiders.themeName + "60.bmp" : type === "upgrade station right" ? "upgrade station right.png" : "mining laser right.png");
		if (type === "power station powerPath" || type === "upgrade station right" || type === "mining laser right") {
			this.image = "World/WorldTextures/" + RockRaiders.themeName + "Split/" + RockRaiders.themeName + "76.BMP";
		}
		this.walkable = true;
		this.speedModifier = 1.5;
		if (type !== "power path") {
			this.selectable = false;
		}
	} else if (type === "solid rock") {
		this.setRockImage(5);
		this.isWall = true;
		this.selectable = false;
	} else if (type === "hard rock") {
		this.setRockImage(4);
		this.isWall = true;
		this.explodable = true;
		this.drillHardable = true;
	} else if (type === "loose rock") {
		this.setRockImage(3);
		this.drillable = true;
		this.isWall = true;
	} else if (type === "dirt") {
		this.setRockImage(1);
		this.drillable = true;
		this.isWall = true;
	} else if (type === "lava") {
		this.image = "World/WorldTextures/" + RockRaiders.themeName + "Split/" + RockRaiders.themeName + "46.BMP";
		this.selectable = false;
	} else if (type === "ore seam") {
		this.image = "World/WorldTextures/" + RockRaiders.themeName + "Split/" + RockRaiders.themeName + "40.bmp";
		this.drillable = true;
		this.isWall = true;
		this.drillSpeedModifier = .2;
	} else if (type === "water") {
		this.image = "World/WorldTextures/" + RockRaiders.themeName + "Split/" + RockRaiders.themeName + "45.bmp";
	} else if (type === "energy crystal seam") {
		this.image = "World/WorldTextures/" + RockRaiders.themeName + "Split/" + RockRaiders.themeName + "20.bmp";
		this.drillable = true;
		this.isWall = true;
		this.drillSpeedModifier = .2;
	} else if (type === "recharge seam") {
		this.image = "World/WorldTextures/" + RockRaiders.themeName + "Split/" + RockRaiders.themeName + "67.bmp";
		this.isWall = true;
		this.selectable = false;
	} else if (type.slice(0, 6) === "rubble") {
		if (type === "rubble 1") {
			this.image = "World/WorldTextures/" + RockRaiders.themeName + "Split/" + RockRaiders.themeName + "10.BMP";
		} else if (type === "rubble 2") {
			this.image = "World/WorldTextures/" + RockRaiders.themeName + "Split/" + RockRaiders.themeName + "11.bmp";
		} else if (type === "rubble 3") {
			this.image = "World/WorldTextures/" + RockRaiders.themeName + "Split/" + RockRaiders.themeName + "12.bmp";
		} else if (type === "rubble 4") {
			this.image = "World/WorldTextures/" + RockRaiders.themeName + "Split/" + RockRaiders.themeName + "13.bmp";
		}
		this.walkable = true;
		this.sweepable = true;
		this.speedModifier = .5;
	} else if (type === "teleport pad") {
		this.image = "teleport pad.png";
		this.isBuilding = true;
		if (this.touched === true) {
			const index = buildings.indexOf(this);
			if (index === -1) {
				buildings.push(this);
			}
		}
		this.setPowerPathSpace();
		this.canSpawnRaiders = true;
	} else if (type === "docks") {
		this.image = "docks.png";
		this.isBuilding = true;
		if (this.touched === true) {
			const index = buildings.indexOf(this);
			if (index === -1) {
				buildings.push(this);
			}
		}
	} else if (type === "support station") {
		this.image = "support station.png";
		this.isBuilding = true;
		if (this.touched === true) {
			const index = buildings.indexOf(this);
			if (index === -1) {
				buildings.push(this);
			}
		}
	} else if (type === "power station" || type === "power station topRight") {
		this.image = (type === "power station" ? "power station topLeft.png" : "power station topRight.png");
		this.isBuilding = true;
		if (this.touched === true) {
			const index = buildings.indexOf(this);
			if (index === -1) {
				buildings.push(this);
			}
		}
	} else if (type === "geological center" || type === "geological center right") {
		this.image = (type === "geological center" ? "geological center left.png" : "geological center right.png");
		this.isBuilding = true;
		if (this.touched === true) {
			const index = buildings.indexOf(this);
			if (index === -1) {
				buildings.push(this);
			}
		}
	} else if (type === "upgrade station") {
		this.image = "upgrade station left.png";
		this.isBuilding = true;
		if (this.touched === true) {
			const index = buildings.indexOf(this);
			if (index === -1) {
				buildings.push(this);
			}
		}
	} else if (type === "ore refinery" || type === "ore refinery right") {
		this.image = (type === "ore refinery" ? "ore refinery left.png" : "ore refinery right.png");
		this.isBuilding = true;
		if (this.touched === true) {
			const index = buildings.indexOf(this);
			if (index === -1) {
				buildings.push(this);
			}
		}
	} else if (type === "mining laser") {
		this.image = "mining laser left.png";
		this.isBuilding = true;
		if (this.touched === true) {
			const index = buildings.indexOf(this);
			if (index === -1) {
				buildings.push(this);
			}
		}
	} else if (type === "super teleport" || type === "super teleport topRight") {
		this.image = (type === "super teleport" ? "super teleport topLeft.png" : "super teleport topRight.png");
		this.isBuilding = true;
		if (this.touched === true) {
			const index = buildings.indexOf(this);
			if (index === -1) {
				buildings.push(this);
			}
		}
		this.setPowerPathSpace();
		this.canSpawnRaiders = true;
	} else if (type === "tool store") {
		this.image = "tool store.png";
		this.isBuilding = true;
		this.walkable = true;
		if (this.touched === true) {
			const index = buildings.indexOf(this);
			if (index === -1) {
				buildings.push(this);
			}
		}
		this.setPowerPathSpace();
		this.canSpawnRaiders = true;
	} else if (type === "building site") {
		this.image = (this.buildingSiteType === "power path" ? "World/WorldTextures/" + RockRaiders.themeName + "Split/" + RockRaiders.themeName + "61.bmp" : "building site.png");
		if (this.touched === true) {
			const index = buildingSites.indexOf(this);
			if (index === -1) {
				buildingSites.push(this);
				tasksAvailable.push(this);
			}
		}
		this.walkable = true;
		this.buildable = true;
		this.dedicatedResources = dedicatedResources;
		this.requiredResources = requiredResources;
		this.placedResources = placedResources;
	}
	if (this.drillable) {
		this.explodable = true;
		this.drillHardable = true;
	}
	// need the check for drawSurface as the first time this method is run the RygameObject constructor has not yet been called
	if ((maskUntouchedSpaces === false || this.touched === true) && doNotChangeImage !== true) {
		this.changeImage(this.image);
	}
	if (type === "building site") {
		// if building site requires no resources or started with all required resources, build immediately
		this.updatePlacedResources();
	}
	this.adjustHeightAlpha();
};

/**
 * set touched to true or false, depending on input. when not touched, image and type are concealed.
 * @param touched: whether this space should be set to touched (true) or not touched (false)
 */
Space.prototype.updateTouched = function (touched) {
	this.touched = touched;

	if (this.touched === true) {
		this.drawAngle = this.headingAngle;
	} else {
		this.drawAngle = 0;
	}

	// if this space has not yet been revealed then we want it to appear as solid rock, but we leave this.image alone to keep track of its actual image.
	if (this.touched === false && maskUntouchedSpaces === true) {
		this.changeImage("World/WorldTextures/" + RockRaiders.themeName + "Split/" + RockRaiders.themeName + "70.BMP");
	} else {
		// we never actually modified this.image so we should just be able to use it
		this.setTypeProperties(this.type);
	}
};

/**
 * brighten or darken space based on its height (brigher = higher)
 */
Space.prototype.adjustHeightAlpha = function () {
	if (this.drawSurface == null || this.isWall) {
		return;
	}
	const heightAlphaChange = .02;
	this.drawSurface.beginPath();
	if (this.height > 10) {
		this.drawSurface.globalAlpha = heightAlphaChange * (this.height - 10);
		this.drawSurface.fillStyle = "rgb(255,255,255)";
		this.drawSurface.fillRect(0, 0, this.rect.width, this.rect.height);

	} else if (this.height < 10) {
		// multiply by a constant to artificially inflate the darkness change, since rendering a black semitransparent rect seems
		// to have much less of an effect than rendering a white semitransparent rect for some reason
		this.drawSurface.globalAlpha = heightAlphaChange * 3 * (10 - this.height);
		this.drawSurface.fillStyle = "rgb(0,0,0)";
		this.drawSurface.fillRect(0, 0, this.rect.width, this.rect.height);
	}
	this.drawSurface.stroke();
	this.drawSurface.globalAlpha = 1;
};

/**
 * check whether or not this building site has all of the resources it needs placed
 * @returns boolean whether this building site has all of the resources it needs placed (true) or still needs more resources (false)
 */
Space.prototype.allResourcesPlaced = function () {
	const placedResourceTypes = Object.getOwnPropertyNames(this.placedResources);
	for (let i = 0; i < placedResourceTypes.length; i++) {
		if (this.placedResources[placedResourceTypes[i]] < this.requiredResources[placedResourceTypes[i]]) {
			return false;
		}
	}
	return true;
};

/**
 * check if there are any required resources of a certain type that have not yet been dedicated to this building site.
 * @param resourceType: the type of resource to check for. If not specified, all resource types will be considered.
 * @returns boolean whether there are any required resources that have not been dedicated (true) or not (false)
 */
Space.prototype.resourceNeeded = function (resourceType = null) {
	if (resourceType != null) {
		return this.dedicatedResources[resourceType] < this.requiredResources[resourceType];
	}
	const dedicatedResourceTypes = Object.getOwnPropertyNames(this.dedicatedResources);
	for (let i = 0; i < dedicatedResourceTypes.length; i++) {
		if (this.dedicatedResources[dedicatedResourceTypes[i]] < this.requiredResources[dedicatedResourceTypes[i]]) {
			return true;
		}
	}
	return false;
};

/**
 * add placed resource of input type, if one is specified, and check if this building site is finished
 * @param resourceType: the type of resource to add to placed resources, if specified
 */
Space.prototype.updatePlacedResources = function (resourceType) {
	if (resourceType) {
		this.placedResources[resourceType]++;
	}
	if (this.allResourcesPlaced()) {
		// remove this from the list of available tasks once it is finished being built
		const taskIndex = tasksAvailable.indexOf(this);
		if (taskIndex !== -1) {
			tasksAvailable.splice(taskIndex, 1);
		}
		const index = buildingSites.indexOf(this);
		// this check should never evaluate to false, but we do it regardless as a safety precaution
		if (index !== -1) {
			buildingSites.splice(index, 1);
		}
		if (nonPrimarySpaceTypes.indexOf(this.buildingSiteType) !== -1 && !this.parentSpace.isBuilding) {
			this.waitingToCompleteConstruction = true;
		} else if (this.childrenIncomplete()) {
			this.waitingToCompleteConstruction = true;
		} else {
			this.completeConstruction();
		}
	}
};

/**
 * check if we are a building site and any of our child spaces are not yet finished
 * @returns boolean whether one or more of our child spaces are incomplete (true) or not (false)
 */
Space.prototype.childrenIncomplete = function () {
	for (let i = 0; i < this.childSpaces.length; ++i) {
		// power paths auto-complete upon initiating build, and don't require any resources, so skip them
		if (powerPathSpaceTypes.indexOf(this.childSpaces[i].type) !== -1) {
			continue;
		}
		// if one of our children still needs some resources placed, we are not yet finished
		if (!this.childSpaces[i].allResourcesPlaced()) {
			return true;
		}
	}
	return false;
};

/**
 * transition from a building site to a newly constructed building of the site type
 */
Space.prototype.completeConstruction = function () {
	this.setTypeProperties(this.buildingSiteType);

};

/**
 * attempt to trigger a landslide at this space, which will go through if we are bordering a valid non-reinforced non-solid wall
 */
Space.prototype.activateLandSlide = function () {
	this.curLandSlideWait = this.minLandSlideWait;
	const adjacentSpaces = this.getAdjacentSpaces();
	let borderingValidWall = false;
	// make sure at least one of the directly adjacent spaces is a valid wall
	for (let i = 0; i < adjacentSpaces.length; ++i) {
		if (adjacentSpaces[i].type === "dirt" || adjacentSpaces[i].type === "loose rock" || adjacentSpaces[i].type === "hard rock" ||
			adjacentSpaces[i].type === "ore seam" || adjacentSpaces[i].type === "energy crystal seam") {
			// TODO: allow land-slides to re-fill partially swept rubble spaces as well (but don't reset rubbleContainsOre)
			if (adjacentSpaces[i].reinforced === false && adjacentSpaces[i].shapeIndex === 0) {
				borderingValidWall = true;
				break;
			}
		}
	}
	if (borderingValidWall) {
		if (this.type === "ground" || this.type === "rubble 1" || this.type === "rubble 2" || this.type === "rubble 3" || this.type === "rubble 4") {
			// only change tile type if you are a ground or rubble tile
			this.setTypeProperties("rubble 1", false, false);
			if (tasksAvailable.indexOf(this) === -1) {
				tasksAvailable.push(this);
			}
		}
		this.landSlides.push([new LandSlide(this)]);
		this.soundList.push(GameManager.playSoundEffect("SND_Landslide"));
	}
};

/**
 * modify this space's land slide frequency, and create a landSlide object group and sound if the frequency is non-0 and they do not already exist
 * @param frequency: the frequency with which this space creates landslides (if 0, no landslides will ever occur here)
 */
Space.prototype.setLandSlideFrequency = function (frequency) {
	if (frequency !== 0) {
		this.landSlideFrequency = frequency;
		if (this.landSlides == null) {
			this.landSlides = new ObjectGroup();
		}
	}
};

/**
 * update this space, and roll the dice for a landslide if the space is touched
 */
Space.prototype.update = function () {
	// spaces which have not yet been discovered should not trigger land-slides, erode nearby Spaces, etc..
	if (!this.touched) {
		return;
	}
	if (this.waitingToCompleteConstruction) {
		if (this.childSpaces.length > 0) {
			if (!this.childrenIncomplete()) {
				this.waitingToCompleteConstruction = false;
				this.completeConstruction();
			}
		} else if (this.parentSpace.isBuilding) {
			this.waitingToCompleteConstruction = false;
			this.completeConstruction();
		}
	}
	if (this.type === "power station powerPath" && this.image !== "power station powerPath.png"
		|| this.type === "upgrade station right" && this.image !== "upgrade station right.png"
		|| this.type === "mining laser right" && this.image !== "mining laser right.png") {
		if (this.parentSpace.isBuilding) {
			this.image = (this.type === "power station powerPath" ? "power station powerPath.png" :
				this.type === "upgrade station right" ? "upgrade station right.png" : "mining laser right.png");
			this.changeImage(this.image);
		}
	}
	// land-slides may only occur on walkable tiles
	if (this.walkable) {
		if (this.landSlideFrequency > 0) {
			// if another landSlide just occurred, wait a certain amount of time before starting to check for land-slides again
			if (this.curLandSlideWait > 0) {
				--this.curLandSlideWait;
			} else {
				// the constant 10000 will give us on average .36 land-slides per second if landSlideFrequency = 1, and 2.88 land-slides per second if landSlideFrequency = 8
				if (Math.random() < (this.landSlideFrequency / 10000)) {
					this.activateLandSlide();
				}
			}
		}
	}
	// decrement spawn cooldown per frame
	if (this.spawnRaiderCooldown > 0) {
		this.spawnRaiderCooldown--;
	} else if (this.canSpawnRaiders && RockRaiders.raiderInQueue > 0 && raiders.size() < RockRaiders.getMaxAmountOfRaiders()) {
		RockRaiders.raiderInQueue--;
		this.spawnRaiderCooldown = GameManager.fps * 2; // = 2 seconds as number of frames
		const raider = new Raider(this);
		raider.walkPosDummy.setCenterX(this.powerPathSpace.randomX());
		raider.walkPosDummy.setCenterY(this.powerPathSpace.randomY());
		raider.currentTask = raider.walkPosDummy;
		raider.currentObjective = raider.walkPosDummy;
		raider.currentPath = calculatePath(terrain, this, this.powerPathSpace, false);
		raiders.push(raider);
		GameManager.playSoundEffect("SND_teleport");
	}
};

/**
 * space constructor: init space type, set type properties, and create necessary dummies, sounds, etc..
 * @param type: the type of space to construct (note that this refers to the game's numerical type, not the string)
 * @param listX: the x coordinate of this space in the terrain list
 * @param listY: the y coordinate of this space in the terrain list
 * @param height: the height of this space on the z-axis (higher spaces are denoted by a greater brightness)
 * @param parentSpace: the space of which this is a child, if specified
 */
function Space(type, listX, listY, height, parentSpace) {
	this.listX = listX;
	this.listY = listY;
	// convert basic types from the numbers used in the level files to easily readable strings
	this.height = height;
	this.childSpaces = [];
	this.buildingSiteType = null;
	// convert the type number from the level file to a string here
	this.type = spaceTypes[type];
	if (type === -101) {
		this.buildingSiteType = "building power path";
	} else if (type === "-101.2") {
		this.buildingSiteType = "power path";
	} else if (type === -102) {
		this.buildingSiteType = "tool store";
	} else if (type === -103) {
		this.buildingSiteType = "teleport pad";
	} else if (type === -104) {
		this.buildingSiteType = "docks";
	} else if (type === -105) {
		this.buildingSiteType = "power station";
	} else if (type === '-105.2') {
		this.buildingSiteType = "power station topRight";
	} else if (type === -106) {
		this.buildingSiteType = "support station";
	} else if (type === -107) {
		this.buildingSiteType = "upgrade station";
	} else if (type === -'107.2') {
		this.buildingSiteType = "upgrade station right";
	} else if (type === -108) {
		this.buildingSiteType = "geological center";
	} else if (type === -'108.2') {
		this.buildingSiteType = "geological center right";
	} else if (type === -109) {
		this.buildingSiteType = "ore refinery";
	} else if (type === -'109.2') {
		this.buildingSiteType = "ore refinery right";
	} else if (type === -110) {
		this.buildingSiteType = "mining laser";
	} else if (type === -'110.2') {
		this.buildingSiteType = "mining laser right";
	} else if (type === -111) {
		this.buildingSiteType = "super teleport";
	} else if (type === -'111.2') {
		this.buildingSiteType = "super teleport topRight";
	}

	this.setTypeProperties(this.type, true, null, null, null, null, null, parentSpace);

	RygameObject.call(this, listY * tileSize, listX * tileSize, 100000, drawDepthTerrain, this.image, gameLayer);
	// set the height alpha now since the first time we setTypeProperties we don't have a drawSurface yet to alpha adjust
	this.adjustHeightAlpha();
	this.updateTouched(false);
	this.powerPathSpace = null;
	this.upgradeLevel = 0;
	// contained ore and crystals are defined by the cryore map and set immediately after Space creation
	this.containedOre = 0;
	this.containedCrystals = 0;
	// how often land-slides occur on this is defined by the fallinMap
	this.landSlideFrequency = 0;
	// wait 120 frames after a land-slide before starting to roll the dice for land-slides again
	this.minLandSlideWait = 120;
	this.curLandSlideWait = 0;
	// contains lists objects which currently reside on the space, such as collectables
	this.contains = new ObjectGroup();
	this.reinforced = false;
	// dummy used to identify drill tasks
	this.drillDummy = this.drillable || this.drillHardable ? new RygameObject(0, 0, -99999, drawDepthTerrainMarker, null, this.drawLayer, true, true, true) : null;
	if (this.drillDummy != null) {
		// workaround so the engine treats this dummy as a space that can be blown up when determining what type of task it is
		this.drillDummy.dynamitable = true;
		// share a rect for collisions
		this.drillDummy.rect = this.rect;
		// set space for use in pathfinding
		this.drillDummy.space = this;
		this.drillDummy.setCenterX(this.centerX());
		this.drillDummy.setCenterY(this.centerY());
		this.drillDummy.drawSurface = createContext(this.drillDummy.rect.width, this.drillDummy.rect.height);
		this.drillDummy.drawSurface.globalAlpha = 0.4;
		this.drillDummy.drawSurface.fillStyle = "black";
		this.drillDummy.drawSurface.fillRect(0, 0, this.drillDummy.rect.width, this.drillDummy.rect.height);
		this.drillDummy.visible = false;
	}
	// dummy used to identify reinforce tasks
	this.reinforceDummy = (this.isWall && this.type !== "solid rock") ? new RygameObject(0, 0, -99999, drawDepthTerrainMarker, null, this.drawLayer, true, true, true) : null;
	if (this.reinforceDummy != null) {
		// workaround so the engine treats this dummy as a reinforcable space when determining what type of task it is
		this.reinforceDummy.reinforcable = true;
		// share a rect for collisions
		this.reinforceDummy.rect = this.rect;
		// set space for use in pathfinding
		this.reinforceDummy.space = this;
		this.reinforceDummy.setCenterX(this.centerX());
		this.reinforceDummy.setCenterY(this.centerY());
		this.reinforceDummy.reinforcePercent = 0;
		this.reinforceDummy.reinforceSpeedModifier = 1;
		this.reinforceDummy.updateReinforcePercent = function (reinforcePercentIncrease) {
			this.reinforcePercent += reinforcePercentIncrease;
		};
		this.reinforceDummy.reinforce = function () {
			this.drawSurface.drawImage(GameManager.getImage("World/WorldTextures/" + RockRaiders.themeName + "Split/" + RockRaiders.themeName + "24.bmp").canvas, 0, 0);
			this.visible = true;
			this.space.reinforced = true;
			this.drawAngle = this.space.drawAngle;
		};
		this.reinforceDummy.drawSurface = createContext(this.reinforceDummy.rect.width, this.reinforceDummy.rect.height);
		this.reinforceDummy.drawSurface.globalAlpha = 0.3;
		this.reinforceDummy.drawSurface.fillStyle = "green";
		this.reinforceDummy.drawSurface.fillRect(0, 0, this.reinforceDummy.rect.width, this.reinforceDummy.rect.height);
		this.reinforceDummy.drawSurface.globalAlpha = 1;
		this.reinforceDummy.visible = false;
	}
	// dummy used to identify dynamite tasks
	this.dynamiteDummy = (this.isWall && this.type !== "solid rock") ? new RygameObject(0, 0, -99999, drawDepthTerrainMarker, null, this.drawLayer, true, true, true) : null;
	if (this.dynamiteDummy != null) {
		// workaround so the engine treats this dummy as a space that can be blown up when determining what type of task it is
		this.dynamiteDummy.dynamitable = true;
		// share a rect for collisions
		this.dynamiteDummy.rect = this.rect;
		// set space for use in pathfinding
		this.dynamiteDummy.space = this;
		this.dynamiteDummy.setCenterX(this.centerX());
		this.dynamiteDummy.setCenterY(this.centerY());
		this.dynamiteDummy.drawSurface = createContext(this.dynamiteDummy.rect.width, this.dynamiteDummy.rect.height);
		this.dynamiteDummy.drawSurface.globalAlpha = 0.1;
		this.dynamiteDummy.drawSurface.fillStyle = "red";
		this.dynamiteDummy.drawSurface.fillRect(0, 0, this.dynamiteDummy.rect.width, this.dynamiteDummy.rect.height);
		this.dynamiteDummy.visible = false;
	}
	// temporary angle variable used to store correct drawAngle when space has not yet been touched (is still in the fog)
	this.headingAngle = 0;
	this.landSlides = null;
	this.landSlideSound = null;
	this.soundList = [];
	// modifier determines how difficult this wall is to drill (for ore and crystal seams, this will be 0.2, as they require 5 'drills')
	this.drillSpeedModifier = 1;
	this.canSpawnRaiders = false;
	this.spawnRaiderCooldown = 0;
}