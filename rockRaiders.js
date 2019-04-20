/**
 * Object update and rendering weights
 *
 * These values are coded into entities to determine the rendering order higher values are rendered first and covered by other objects with lower values
 *
 */
const drawDepthTerrain = 1000;
const drawDepthTerrainMarker = 975;
const drawDepthSelectedSpace = 950;
const drawDepthBuildingPlacier = 900;

const drawDepthCollectables = 800;
const drawDepthSelectedVehicle = 790;
const drawDepthSlimes = 775;
const drawDepthRaider = 750;
const drawDepthVehicle = 725;
const drawDepthMonster = 700;

const drawDepthLandslide = 600;
const drawDepthHealthBar = 500;

const drawDepthIconButtonPanelBackground = 475;
const drawDepthIconButtonPanelButtons = 450;
const drawDepthCrystalSideBar = 400;

/**
 * output the terrain 2d-array to the console
 * @param terrain: a 2d-array representing the terrain (note that terrain is formatted as [y][x])
 */
function printTerrain(terrain) {
	let str;
	for (let i = 0; i < terrain.length; i++) {
		str = "";
		for (let r = 0; r < terrain[i].length; r++) {
			str += (terrain[i][r].walkable === true ? 1 : 0) + ",";
		}
		str = "[" + str.slice(0, str.length - 1) + "]";
		console.log(str);
	}
}

/**
 * output the coordinates of each space in the input path
 * @param path: the path to display (note that paths are ordered from last to first space)
 */
function printPath(path) {
	let pathString = "[";
	for (let i = 0; i < path.length; i++) {
		pathString += " (" + path[path.length - (i + 1)].listX + ", " + path[path.length - (i + 1)].listY + ") >";
	}
	pathString = pathString.substring(0, pathString.length - 2);
	pathString += "]";
	console.log(pathString);
}

/**
 * update position of all sound effects for all RygameObjects based on their camera distance
 */
function updateObjectSoundPositions() {
	for (let i = 0; i < GameManager.renderOrderedCompleteObjectList.length; ++i) {
		updateSoundPositions(GameManager.renderOrderedCompleteObjectList[i]);
	}
}

/**
 * update volume of all sound effects in the input object based on linear distance from the camera
 * @param obj: the object whose sounds we should update the volume of based on camera distance
 */
function updateSoundPositions(obj) {
	if (typeof obj.soundList != "undefined" && obj.soundList.length > 0) {
		const camDis = cameraDistance(obj);
		// linear fade with distance, with a max sound distance of 2500 pixels
		let vol = GameManager.fxVolume - camDis / 2500;
		if (vol < 0) {
			vol = 0;
		}
		for (let i = 0; i < obj.soundList.length; ++i) {
			const sound = obj.soundList[i];
			if (sound.ended || sound.paused) { // sanitize list, remove unused sounds
				obj.soundList.splice(i, 1);
			} else {
				sound.volume = vol;
			}
		}
	}
}

/**
 * get the distance of passed in object's center from the camera
 * @param obj: the object to check for camera distance
 */
function cameraDistance(obj) {
	let xDis, yDis;
	const x = obj.centerX();
	const y = obj.centerY();
	const camX = gameLayer.cameraX + GameManager.screenWidth / 2;
	const camY = gameLayer.cameraY + GameManager.screenHeight / 2;
	xDis = Math.abs(camX - x);
	yDis = Math.abs(camY - y);
	return Math.sqrt(xDis * xDis + yDis * yDis);
}

/**
 * find the closest space in the given terrain to the input object
 * @param terrain: the terrain to check against
 * @param object: the object to whom we want the closest space
 */
function getNearestSpace(terrain, object) {
	let closestDistance = -1;
	let closestObject = null;
	const centerX = object.centerX();
	const centerY = object.centerY();
	for (let i = 0; i < terrain.length; i++) {
		for (let r = 0; r < terrain[i].length; r++) {
			const distance = getDistance(centerX, centerY, terrain[i][r].centerX(), terrain[i][r].centerY());
			if (closestDistance === -1 || distance < closestDistance) {
				closestDistance = distance;
				closestObject = terrain[i][r];
			}
		}
	}
	return closestObject;
}

/**
 * get the adjacent space to terrain indices x,y in direction dir
 * @param terrain: the terrain to check against
 * @param x: the first index representing the desired terrain position
 * @param y: the second index representing the desired terrain position
 * @param dir: the direction (up, down, left, or right) of the adjacent space to return
 * @returns Space the resulting space, or null if no such space exists
 * @throws: direction error if dir is not one of the cardinal directions
 */
function adjacentSpace(terrain, x, y, dir) {
	if (dir === "up") {
		if (x > 0) {
			return terrain[x - 1][y];
		}
		return null;
	} else if (dir === "down") {
		if (x < terrain.length - 1) {
			return terrain[x + 1][y];
		}
		return null;
	} else if (dir === "left") {
		if (y > 0) {
			return terrain[x][y - 1];
		}
		return null;
	} else if (dir === "right") {
		if (y < terrain[x].length - 1) {
			return terrain[x][y + 1];
		}
		return null;
	} else {
		throw "ERROR: getAdjacent direction: '" + dir + "' not recognized";
	}
}

function adjacentSpaceXY(terrain, x, y, dirX, dirY) {
	const absX = x + dirX;
	const absY = y + dirY;
	if (absX >= 0 && absY >= 0 && absX < terrain.length && absY < terrain[absX].length) {
		return terrain[absX][absY];
	}
	return null;
}

/**
 * starting from the input space, mark each reachable space as 'touched' to reveal it
 * @param initialSpace: the starting space to be marked as touched from which we propagate out
 */
function touchAllAdjacentSpaces(initialSpace) {
	// update the type properties to adjust image and update properties like reinforcement or selectable
	initialSpace.setTypeProperties(initialSpace.type);
	if (!initialSpace.touched) {
		if (initialSpace.isBuilding === false && (!(initialSpace.walkable || initialSpace.type === "water" || initialSpace.type === "lava"))) {
			if (initialSpace.drillable || initialSpace.drillHardable || initialSpace.explodable) {
				tasksAvailable.push(initialSpace);
			}
			initialSpace.updateTouched(initialSpace.drillable || initialSpace.explodable || initialSpace.type === "solid rock" || (initialSpace.isBuilding === true));
			return;
		}
		initialSpace.updateTouched(true);
		if (initialSpace.sweepable) {
			tasksAvailable.push(initialSpace);
		}
		if (initialSpace.buildable && initialSpace.resourceNeeded()) {
			tasksAvailable.push(initialSpace);
		}
		for (let i = 0; i < initialSpace.contains.objectList.length; i++) {
			// add each member of contains to tasksavailable
			tasksAvailable.push(initialSpace.contains.objectList[i]);
		}

		const adjacentSpaces = [];
		for (let x = -1; x <= 1; ++x) {
			for (let y = -1; y <= 1; ++y) {
				adjacentSpaces.push(adjacentSpaceXY(terrain, initialSpace.listX, initialSpace.listY, x, y));
			}
		}
		for (let i = 0; i < adjacentSpaces.length; i++) {
			if (adjacentSpaces[i] != null) {
				touchAllAdjacentSpaces(adjacentSpaces[i]);
			}
		}
	}
}

/**
 * determine the path from the input list whose starting space is closest to the input object
 * @param startObject: the object whose position should be checked against the input paths
 * @param paths: the list of potential paths to select from
 * @returns the path whose start position is closest to the input object
 */
function findClosestStartPath(startObject, paths) {
	if (paths == null) {
		return null;
	}
	let closestDistance = -1;
	let closestIndex = -1;
	const startObjectCenterX = startObject.centerX();
	const startObjectCenterY = startObject.centerY();
	for (let i = 0; i < paths.length; i++) {
		const curDistance = getDistance(startObjectCenterX, startObjectCenterY, paths[i][paths[i].length - 1].centerX(), paths[i][paths[i].length - 1].centerY());
		if (closestDistance === -1 || curDistance < closestDistance) {
			closestDistance = curDistance;
			closestIndex = i;
		}
	}
	return paths[closestIndex];
}

/**
 * calculate one or all of the shortest paths in a terrain from one space to another (note that paths go from end to start, rather than from start to end)
 * if goalSpace is null, the search returns the nearest task that the input raider can perform.
 * @param terrain: the terrain in which to search for a path
 * @param startSpace: the space on which to begin the search
 * @param goalSpace: the desired goal space. If null, searches for a task that the input raider can perform instead.
 * @param returnAllSolutions: whether all shortest paths should be returned (true) or just one path (false)
 * @param raider: optional flag; if goalSpace is null, this is the raider who will be used to determine which tasks can be performed.
 * @returns {Array} the shortest path or paths from the start space to the goal space, or to the nearest task that the input raider can perform.
 */
function calculatePath(terrain, startSpace, goalSpace, returnAllSolutions, raider) {
	// if startSpace meets the desired property, return it without doing any further calculations
	if (startSpace === goalSpace || (goalSpace == null && raider.canPerformTask(startSpace))) {
		if (!returnAllSolutions) {
			return [startSpace];
		}
		return [[startSpace]];
	}

	// initialize starting variables
	if (goalSpace != null) {
		goalSpace.parents = [];
	}

	startSpace.startDistance = 0;
	startSpace.parents = [];
	const closedSet = [];
	const solutions = [];
	let finalPathDistance = -1;
	let shortestPath = null;
	const openSet = [startSpace];
	// main iteration: keep popping spaces from the back until we have found a solution (or all equal solutions if returnAllSolutions is True)
	// or openSet is empty (in which case there is no solution)
	while (openSet.length > 0) {
		const currentSpace = openSet.shift();
		closedSet.push(currentSpace);
		const adjacentSpaces = [];
		adjacentSpaces.push(adjacentSpace(terrain, currentSpace.listX, currentSpace.listY, "up"));
		adjacentSpaces.push(adjacentSpace(terrain, currentSpace.listX, currentSpace.listY, "down"));
		adjacentSpaces.push(adjacentSpace(terrain, currentSpace.listX, currentSpace.listY, "left"));
		adjacentSpaces.push(adjacentSpace(terrain, currentSpace.listX, currentSpace.listY, "right"));

		// main inner iteration: check each space in adjacentSpaces for validity
		for (let k = 0; k < adjacentSpaces.length; k++) {
			if ((finalPathDistance !== -1) && (currentSpace.startDistance + 1 / currentSpace.speedModifier > finalPathDistance)) {
				// a shorter way is already known, so we can skip this option
				continue;
			}

			const newSpace = adjacentSpaces[k];
			// check this here so that the algorithm is a little bit faster, but also so that paths to non-walkable terrain pieces (such as for drilling) will work
			// if the newSpace is a goal, find a path back to startSpace (or all equal paths if returnAllSolutions is True)
			if (newSpace === goalSpace || (goalSpace == null && raider.canPerformTask(newSpace))) {
				goalSpace = newSpace;
				newSpace.parents = [currentSpace]; // start the path with currentSpace and work our way back
				const pathsFound = [[newSpace]];

				// grow out the list of paths back in pathsFound until all valid paths have been exhausted
				while (pathsFound.length > 0) {
					if (pathsFound[0][pathsFound[0].length - 1].parents[0] === startSpace) { // we've reached the start space, thus completing this path
						const currentPathDistance = pathsFound[0].reduce((a, b) => a + 1 / b.speedModifier, 0);
						if (finalPathDistance === -1 || currentPathDistance < finalPathDistance) {
							finalPathDistance = currentPathDistance;
							shortestPath = pathsFound[0];
							solutions.unshift(pathsFound.shift());
						} else {
							solutions.push(pathsFound.shift());
						}
						continue;
					}
					// branch additional paths for each parent of the current path's current space
					for (let i = 0; i < pathsFound[0][pathsFound[0].length - 1].parents.length; i++) {
						if (i === pathsFound[0][pathsFound[0].length - 1].parents.length - 1) {
							pathsFound[0].push(pathsFound[0][pathsFound[0].length - 1].parents[i]);
						} else {
							pathsFound.push(pathsFound[0].slice());
							pathsFound[pathsFound.length - 1].push(pathsFound[0][pathsFound[0].length - 1].parents[i]);
						}
					}
				}
			}

			// attempt to keep branching from newSpace as long as it is a walkable type
			if ((newSpace != null) && (newSpace.walkable === true)) {
				const newStartDistance = currentSpace.startDistance + 1 / currentSpace.speedModifier;
				const notInOpenSet = openSet.indexOf(newSpace) === -1;

				// don't bother with newSpace if it has already been visited unless our new distance from the start space is smaller than its existing startDistance
				if ((closedSet.indexOf(newSpace) !== -1) && (newSpace.startDistance < newStartDistance)) {
					continue;
				}

				// accept newSpace if newSpace has not yet been visited or its new distance from the start space is equal to its existing startDistance
				if (notInOpenSet || newSpace.startDistance === newStartDistance) {
					// only reset parent list if this is the first time we are visiting newSpace
					if (notInOpenSet) {
						newSpace.parents = [];
					}
					newSpace.parents.push(currentSpace);
					newSpace.startDistance = newStartDistance;
					// if newSpace does not yet exist in the open set, insert it into the appropriate position using a binary search
					if (notInOpenSet) {
						openSet.splice(binarySearch(openSet, newSpace, "startDistance", true), 0, newSpace);
					}
				}

			}
		}
	}

	// if solutions is null then that means that no path was found
	if (solutions.length === 0) {
		return null;
	}
	if (returnAllSolutions) {
		return solutions;
	} else {
		return shortestPath;
	}
}

/**
 * determine whether or not there is a resource available of the input resource type
 * @param resourceType: the type of resource to check for
 * @returns boolean whether a resource of the desired type is available (true) or not (false)
 */
function resourceAvailable(resourceType) {
	return (RockRaiders.rightPanel.resources[resourceType] - reservedResources[resourceType]) > 0;
}

/**
 * load in level data from input level name, reading from all supported map file types
 * @param levelKey: the identifier for the level
 */
function loadLevelData(levelKey) {
	RockRaiders.currentLevelKey = levelKey || RockRaiders.currentLevelKey;
	const levelConf = RockRaiders.levelConf[RockRaiders.currentLevelKey];
	RockRaiders.themeName = levelConf["TextureSet"].split("::")[1];
	// TODO maybe someday we can use the same keys...
	RockRaiders.tasksAutomated = {
		"sweep": false,
		"collect": false, // TODO collect ore and collect crystal need to be separated (What about dropped dynamites?)
		"drill": false,
		"drill hard": false,
		"reinforce": false,
		"build": false,
		"walk": false,
		"dynamite": false,
		"vehicle": false
	};
	Object.keys(levelConf["Priorities"]).forEach((taskKey) => {
		const lKey = taskKey.toLowerCase();
		let ourKey = null;
		if (lKey === "AI_Priority_Crystal".toLowerCase() || lKey === "AI_Priority_Ore".toLowerCase()) { // TODO separate ore and crystal collect tasks
			ourKey = "collect";
		} else if (lKey === "AI_Priority_Destruction".toLowerCase()) {
			ourKey = "dynamite"; // TODO is this correctly translated?
		} else if (lKey === "AI_Priority_Clearing".toLowerCase()) {
			ourKey = "sweep";
		} else if (lKey === "AI_Priority_Repair".toLowerCase()) {
			// TODO repair task type not yet implemented
		} else if (lKey === "AI_Priority_GetIn".toLowerCase()) {
			ourKey = "vehicle";
		} else if (lKey === "AI_Priority_Construction".toLowerCase()) {
			ourKey = "build";
		} else if (lKey === "AI_Priority_Reinforce".toLowerCase()) {
			ourKey = "reinforce";
		} else if (lKey === "AI_Priority_GetTool".toLowerCase()) {
			// TODO currently gettool is not an extra task
		} else if (lKey === "AI_Priority_Train".toLowerCase()) {
			// TODO currently train is not an extra task
		} else if (lKey === "AI_Priority_Recharge".toLowerCase()) {
			// TODO recharge task type not yet implemented
		}
		if (ourKey) {
			RockRaiders.tasksAutomated[ourKey] = levelConf["Priorities"][taskKey].toLowerCase() === "true"; // TODO maybe check for weird values here?
		}
	});

	const terrainMapName = levelConf["TerrainMap"];
	const cryoreMapName = levelConf["CryOreMap"];
	const olFileName = levelConf["OListFile"];
	const predugMapName = levelConf["PreDugMap"];
	const surfaceMapName = levelConf["SurfaceMap"];
	const pathMapName = levelConf["PathMap"];
	const fallinMapName = levelConf["FallinMap"];

	// load in Space types from terrain, surface, and path maps
	for (let i = 0; i < GameManager.maps[terrainMapName].level.length; i++) {
		terrain.push([]);
		for (let r = 0; r < GameManager.maps[terrainMapName].level[i].length; r++) {

			// give the path map the highest priority, if it exists
			if (GameManager.maps[pathMapName] && GameManager.maps[pathMapName].level[i][r] === 1) {
				// rubble 1 Space id = 100
				terrain[i].push(new Space(100, i, r, GameManager.maps[surfaceMapName].level[i][r]));
			} else if (GameManager.maps[pathMapName] && GameManager.maps[pathMapName].level[i][r] === 2) {
				// building power path Space id = -1
				terrain[i].push(new Space(-1, i, r, GameManager.maps[surfaceMapName].level[i][r]));
			} else {
				if (GameManager.maps[predugMapName].level[i][r] === 0) {
					// soil(5) was removed pre-release, so replace it with dirt(4)
					if (GameManager.maps[terrainMapName].level[i][r] === 5) {
						terrain[i].push(new Space(4, i, r, GameManager.maps[surfaceMapName].level[i][r]));
					} else {
						terrain[i].push(new Space(GameManager.maps[terrainMapName].level[i][r], i, r, GameManager.maps[surfaceMapName].level[i][r]));
					}
				} else if (GameManager.maps[predugMapName].level[i][r] === 3 || GameManager.maps[predugMapName].level[i][r] === 4) { // slug holes
					terrain[i].push(new Space(GameManager.maps[predugMapName].level[i][r] * 10, i, r, GameManager.maps[surfaceMapName].level[i][r]));
				} else if (GameManager.maps[predugMapName].level[i][r] === 1 || GameManager.maps[predugMapName].level[i][r] === 2) {
					if (GameManager.maps[terrainMapName].level[i][r] === 6) {
						terrain[i].push(new Space(6, i, r, GameManager.maps[surfaceMapName].level[i][r]));
					} else if (GameManager.maps[terrainMapName].level[i][r] === 9) {
						terrain[i].push(new Space(9, i, r, GameManager.maps[surfaceMapName].level[i][r]));
					} else {
						terrain[i].push(new Space(0, i, r, GameManager.maps[surfaceMapName].level[i][r]));
					}
				}

				const currentCryOre = GameManager.maps[cryoreMapName].level[i][r];
				if (currentCryOre % 2 === 1) {
					terrain[i][r].containedCrystals = (currentCryOre + 1) / 2;
				} else {
					terrain[i][r].containedOre = currentCryOre / 2;
				}
			}
		}
	}

	// ensure that any walls which do not meet the 'supported' requirement crumble at the start
	for (let i = 0; i < GameManager.maps[predugMapName].level.length; i++) {
		for (let r = 0; r < GameManager.maps[predugMapName].level[i].length; r++) {
			if (terrain[i][r].isWall) {
				terrain[i][r].checkWallSupported(null, true);
			}
		}
	}

	// 'touch' all exposed spaces in the predug map so that they appear as visible from the start
	for (let i = 0; i < GameManager.maps[predugMapName].level.length; i++) {
		for (let r = 0; r < GameManager.maps[predugMapName].level[i].length; r++) {
			const currentPredug = GameManager.maps[predugMapName].level[i][r];
			if (currentPredug === 1 || currentPredug === 3) {
				touchAllAdjacentSpaces(terrain[i][r]);
			}
		}
	}

	// add land-slide frequency to Spaces
	if (GameManager.maps[fallinMapName]) {
		for (let i = 0; i < GameManager.maps[fallinMapName].level.length; i++) {
			for (let r = 0; r < GameManager.maps[fallinMapName].level[i].length; r++) {
				terrain[i][r].setLandSlideFrequency(GameManager.maps[fallinMapName].level[i][r]);
			}
		}
	}

	// load in non-space objects next
	const objectList = GameManager.objectLists[olFileName];
	Object.values(objectList).forEach(function (olObject) {
		// all object positions seem to be off by one
		olObject.xPos--;
		olObject.yPos--;
		if (olObject.type === "TVCamera") {
			// coords need to be rescaled since 1 unit in LRR is 1, but 1 unit in the remake is tileSize (128)
			gameLayer.cameraX = olObject.xPos * tileSize;
			gameLayer.cameraY = olObject.yPos * tileSize;
			// center the camera
			gameLayer.cameraX -= GameManager.screenWidth / 2;
			gameLayer.cameraY -= GameManager.screenHeight / 2;
		} else if (olObject.type === "Pilot") {
			// note inverted x/y coords for terrain list
			const newRaider = new Raider(terrain[parseInt(olObject.yPos, 10)][parseInt(olObject.xPos, 10)]);
			newRaider.setCenterX(olObject.xPos * tileSize);
			newRaider.setCenterY(olObject.yPos * tileSize);
			// convert to radians (note that heading angle is rotated 90 degrees clockwise relative to the remake angles)
			newRaider.drawAngle = (olObject.heading - 90) / 180 * Math.PI;
			raiders.push(newRaider);
		} else if (olObject.type === "Toolstation") {
			const currentSpace = terrain[Math.floor(parseFloat(olObject.yPos))][Math.floor(parseFloat(olObject.xPos))];
			currentSpace.setTypeProperties("tool store");
			currentSpace.headingAngle = (olObject.heading - 90) / 180 * Math.PI;
			// check if this space was in a wall, but should now be touched
			checkRevealSpace(currentSpace);
			// set drawAngle to headingAngle now if this space isn't initially in the fog
			if (currentSpace.touched) {
				currentSpace.drawAngle = currentSpace.headingAngle - Math.PI / 2;
			}
			// check if this building's power path space was in a wall, but should now be touched
			checkRevealSpace(currentSpace.powerPathSpace);
			currentSpace.powerPathSpace.setTypeProperties("building power path");
		} else {
			// TODO implement remaining object types like: spider, drives and hovercraft
			console.log("Object type " + olObject.type + " not yet implemented");
		}
	});

	levelConf.numOfCrystals = 0;
	levelConf.numOfOres = 0;
	levelConf.numOfDigables = 0;
	for (let x = 0; x < terrain.length; x++) {
		for (let y = 0; y < terrain[x].length; y++) {
			const space = terrain[x][y];
			levelConf.numOfCrystals += space.containedCrystals;
			levelConf.numOfOres += space.containedOre + space.getRubbleOreContained();
			levelConf.numOfDigables += space.isDigable() ? 1 : 0;
		}
	}
}

/**
 * check if this space is surrounded on any side by a touched space; if so, touch this space.
 * this function should only be used when overriding spaces in OL portion of level load procedure.
 * @param initialSpace: the space to check for revealing
 */
function checkRevealSpace(initialSpace) {
	if (initialSpace == null) {
		return;
	}
	const adjacentSpaces = [];
	adjacentSpaces.push(adjacentSpace(terrain, initialSpace.listX, initialSpace.listY, "up"));
	adjacentSpaces.push(adjacentSpace(terrain, initialSpace.listX, initialSpace.listY, "down"));
	adjacentSpaces.push(adjacentSpace(terrain, initialSpace.listX, initialSpace.listY, "left"));
	adjacentSpaces.push(adjacentSpace(terrain, initialSpace.listX, initialSpace.listY, "right"));
	for (let i = 0; i < adjacentSpaces.length; ++i) {
		if (adjacentSpaces[i] != null && adjacentSpaces[i].touched) {
			touchAllAdjacentSpaces(initialSpace);
			return;
		}
	}
}

/**
 * determine the type of the input task. If optional raider flag is included, gives additional context for determining the task type.
 * @param task: the task whose type we should determine
 * @param raider: the raider who possesses the input task
 * @returns string the type of the input task, or null if the task is invalid
 */
function taskType(task, raider) { // optional raider flag allows us to determine what the raider is doing from additional task related variables
	if (typeof task == "undefined" || task == null) {
		return "";
	}
	if (typeof task.drillable != "undefined" && task.drillable === true) {
		return "drill";
	}
	if (typeof task.drillHardable != "undefined" && task.drillHardable === true) {
		return "drill hard";
	}
	if (typeof task.sweepable != "undefined" && task.sweepable === true) {
		return "sweep";
	}
	if (typeof task.buildable != "undefined" && task.buildable === true) {
		return "build";
	}
	if (typeof task.reinforcable != "undefined" && task.reinforcable === true) {
		return "reinforce";
	}
	if (typeof task.dynamitable != "undefined" && task.dynamitable === true) {
		return "dynamite";
	}
	if (typeof task.space != "undefined" && task instanceof Collectable) {
		return "collect";
	}
	if (typeof task.space != "undefined" && task instanceof Vehicle) {
		return "vehicle";
	}
	if (typeof task.isBuilding != "undefined" && task.isBuilding === true && task.type === "tool store") {
		return (raider != null && raider.getToolName != null) ? "get tool" : "upgrade";
	}
	if (typeof task.walkable != "undefined" && task.walkable === true) {
		return "walk";
	}
}

/**
 * create a new raider, as long as there is at least one touched toolStore to which he can teleport
 */
function createRaider() {
	if (RockRaiders.raiderInQueue < 9) {
		RockRaiders.raiderInQueue++;
	}
}

/**
 * Returns the maximum number of raiders currently allowed. Initial amount is nine plus ten per support station
 */
RockRaidersGame.prototype.getMaxAmountOfRaiders = function () {
	let maxAmount = 9;
	for (let c = 0; c < buildings.length; c++) {
		if (buildings[c].type === "support station") {
			maxAmount += 10;
		}
	}
	return maxAmount;
};

/**
 * create a new vehicle of the input type, as long as there is at least one touched toolStore to which it can teleport
 * @param vehicleType: the type of vehicle to create
 */
function createVehicle(vehicleType) {
	let toolStore = null;
	for (let i = 0; i < buildings.length; i++) {
		if (buildings[i].type === "tool store") {
			toolStore = buildings[i];
			break;
		}
	}
	if (toolStore == null) {
		return;
	}
	const newVehicle = (vehicleType === "hover scout" ? new HoverScout(toolStore.powerPathSpace) :
		(vehicleType === "small digger" ? new SmallDigger(toolStore.powerPathSpace) : new SmallTransportTruck(toolStore.powerPathSpace)));
	vehicles.push(newVehicle);
	tasksAvailable.push(newVehicle);
	cancelSelection();
}

function changeIconPanel(targetIconPanel = RockRaiders.mainIconPanel) {
	if (RockRaiders.activeIconPanel !== targetIconPanel) {
		if (RockRaiders.activeIconPanel) {
			RockRaiders.activeIconPanel.hide();
		}
		RockRaiders.activeIconPanel = targetIconPanel;
		RockRaiders.activeIconPanel.show();
	}
}

/**
 * cancel the current selection, setting selection to an empty list and selectionType to null, and closing any open menus
 */
function cancelSelection() {
	selection = [];
	selectionType = null;
	changeIconPanel();
}

function setSelectionByMouseCursor() {
	// check if a raider was clicked
	for (let i = 0; i < raiders.objectList.length; i++) {
		if (collisionPoint(GameManager.mouseReleasedPosLeft.x, GameManager.mouseReleasedPosLeft.y, raiders.objectList[i], raiders.objectList[i].affectedByCamera)) {
			// simply choose the first raider identified as having been clicked, since all raiders have the same depth regardless
			selection = [raiders.objectList[i]];
			selectionType = "raider";
			return;
		}
	}
	// check if a vehicle was clicked
	for (let i = 0; i < vehicles.objectList.length; i++) {
		if (collisionPoint(GameManager.mouseReleasedPosLeft.x, GameManager.mouseReleasedPosLeft.y, vehicles.objectList[i], vehicles.objectList[i].affectedByCamera)) {
			selection = [vehicles.objectList[i]];
			selectionType = selection[0].type;
			return;
		}
	}
	// check if a terrain was clicked
	for (let i = 0; i < terrain.length; i++) {
		for (let r = 0; r < terrain[i].length; r++) {
			let terrainTile = terrain[i][r];
			if (collisionPoint(GameManager.mouseReleasedPosLeft.x, GameManager.mouseReleasedPosLeft.y, terrainTile, terrainTile.affectedByCamera)) {
				if (terrainTile.isSelectable() && !selection.includes(terrainTile)) {
					selection = [terrainTile];
					selectionType = selection[0].touched ? selection[0].type : "Hidden";
					if (selectionType === "ground") {
						GameManager.playSoundEffect("SFX_Floor");
					} else if (terrainTile.isWall) {
						GameManager.playSoundEffect("SFX_Wall");
					}
				}
				return;
			}
		}
	}
}

/**
 * attempt to update the current selection in response to a left-click
 */
function checkUpdateClickSelection() {
	// ignore mouse clicks if they landed on a part of the UI
	if (GameManager.mouseReleasedLeft && !mousePressIsSelection) {
		setSelectionByMouseCursor();
		// automatically close tool menu if a raider is no longer selected
		if (selectionType !== "raider" && RockRaiders.activeIconPanel === RockRaiders.raiderIconPanel) {
			changeIconPanel(RockRaiders.mainIconPanel);
		}
	}
}

/**
 * update selectionType based on current selection, setting it to null if selection is empty
 */
function checkUpdateSelectionType() {
	if (selection.length === 0) {
		return;
	}
	for (let i = selection.length - 1; i >= 0; --i) {
		if (selection[i].dead === true) {
			selection.splice(i, 1);
		}
	}
	if (selection.length === 0) {
		cancelSelection();
		return;
	}
	if (selection[0] instanceof Space) {
		selectionType = selection[0].touched === true ? selection[0].type : "Hidden";
		tileSelectedGraphic.drawDepth = drawDepthSelectedSpace; // put tile selection graphic between space and collectable
		GameManager.refreshObject(tileSelectedGraphic);
	}
	if (selection[0] instanceof Vehicle) {
		tileSelectedGraphic.drawDepth = drawDepthSelectedVehicle;
		GameManager.refreshObject(tileSelectedGraphic);
		// manually update vehicle selection to raider riding it, if it has a driver
		for (let i = 0; i < raiders.objectList.length; ++i) {
			if (raiders.objectList[i].vehicle === selection[0] || raiders.objectList[i].holding.indexOf(selection[0]) !== -1) {
				selection[0] = raiders.objectList[i];
				selectionType = "raider";
			}
		}
	}

	// manually update non-primary building pieces to point to main building Space
	if (selection[0] instanceof Space) {
		if (nonPrimarySpaceTypes.indexOf(selection[0].type) !== -1) {
			selection[0] = selection[0].parentSpace;
			selectionType = selection[0].type;
		}
	}
}

/**
 * attempt to update current mouse drag box selection. If mouse button is released, select all raiders within the box.
 */
function checkUpdateMouseSelect() {
	if (GameManager.mouseDownLeft) {
		if (GameManager.mousePressedLeft) {
			mousePressStartPos = GameManager.mousePos;
		} else if (!mousePressIsSelection) {
			if (getDistance(mousePressStartPos.x, mousePressStartPos.y, GameManager.mousePos.x, GameManager.mousePos.y) > dragStartDistance) {
				mousePressIsSelection = true;
				selectionRectCoords.x1 = mousePressStartPos.x;
				selectionRectCoords.y1 = mousePressStartPos.y;
			}
		}
		// we are currently performing a drag select box
		if (mousePressIsSelection) {
			// determine top-left corner to draw rect [xMin, yMin, xMax, yMax]
			selectionRectPointList = [null, null, null, null];
			selectionRectCoordList = [selectionRectCoords.x1, selectionRectCoords.y1, GameManager.mousePos.x, GameManager.mousePos.y];
			for (let i = 0; i < 4; i++) {
				if (selectionRectPointList[i % 2] == null || selectionRectCoordList[i] < selectionRectPointList[i % 2]) {
					selectionRectPointList[i % 2] = selectionRectCoordList[i];
				}
				if (selectionRectPointList[(i % 2) + 2] == null || selectionRectCoordList[i] > selectionRectPointList[(i % 2) + 2]) {
					selectionRectPointList[(i % 2) + 2] = selectionRectCoordList[i];
				}
			}
		}
	} else {
		if (mousePressIsSelection) {
			mousePressIsSelection = false;
			if (selectionRectCoords.x1 != null) {
				selectionRectCoords.x1 = null;
				selectionRectCoords.y1 = null;
				selectionRectObject.rect.width = selectionRectPointList[2] - selectionRectPointList[0];
				selectionRectObject.rect.height = selectionRectPointList[3] - selectionRectPointList[1];
				selectionRectObject.x = selectionRectPointList[0] + selectionRectObject.drawLayer.cameraX;
				selectionRectObject.y = selectionRectPointList[1] + selectionRectObject.drawLayer.cameraY;
				const collidingRaiders = [];
				for (let i = 0; i < raiders.objectList.length; i++) {
					if (collisionRect(selectionRectObject, raiders.objectList[i])) {
						collidingRaiders.push(raiders.objectList[i]);
					}
				}
				if (collidingRaiders.length > 0) {
					// set selection to all of the raiders contained within the selection Rect
					selectionType = "raider";
					selection = collidingRaiders;
				}
			}
		}
	}
}

/**
 * attempt to assign a task to the current selection upon releasing the right mouse button
 */
function checkAssignSelectionTask() {
	if (GameManager.mouseReleasedRight && selection.length !== 0 && selectionType === "raider") {
		// most of this code is copied from left-click task detection
		const clickedTasks = [];
		// first check if we clicked a vehicle that is neither being driver already nor has a raider en route
		for (let i = 0; i < vehicles.objectList.length; ++i) {
			if (collisionPoint(GameManager.mouseReleasedPosRight.x, GameManager.mouseReleasedPosRight.y, vehicles.objectList[i], vehicles.objectList[i].affectedByCamera)
				&& ((tasksAvailable.indexOf(vehicles.objectList[i]) !== -1) && tasksInProgress.objectList.indexOf(vehicles.objectList[i]) === -1)) {
				clickedTasks.push(vehicles.objectList[i]);
			}
		}

		// if no vehicles clicked, check spaces and their contains
		if (clickedTasks.length === 0) {
			for (let p = 0; p < terrain.length; p++) {
				for (let r = 0; r < terrain[p].length; r++) {
					let initialSpace = terrain[p][r];
					for (let j = 0; j < terrain[p][r].contains.objectList.length + 1; j++) {
						if (collisionPoint(GameManager.mouseReleasedPosRight.x, GameManager.mouseReleasedPosRight.y, initialSpace, initialSpace.affectedByCamera) &&
							// don't do anything if the task is already taken by another raider, we don't want to re-add it to the task queue
							((tasksAvailable.indexOf(initialSpace) !== -1) || initialSpace.walkable || (tasksInProgress.objectList.indexOf(initialSpace) !== -1))) {
							// console.log("A");
							if ((j === 0 && (initialSpace.drillable || initialSpace.drillHardable || initialSpace.sweepable ||
								initialSpace.buildable || initialSpace.walkable)) || j > 0) {
								// console.log("B");
								clickedTasks.push(initialSpace);
								if (debug) {
									console.log("TERRAIN OL LENGTH + 1: " + (terrain[p][r].contains.objectList.length + 1));
								}
							}
						}
						initialSpace = terrain[p][r].contains.objectList[j];
					}
				}
			}
		}

		if (clickedTasks.length > 0) {
			let lowestDrawDepthValue = clickedTasks[0].drawDepth;
			let lowestDrawDepthId = 0;
			// prioritize tasks that are not in progress in the event that multiple tasks are clicked at once
			let inProgress = tasksInProgress.objectList.indexOf(clickedTasks[0]) !== -1;
			for (let p = 1; p < clickedTasks.length; p++) {
				const curInProgress = tasksInProgress.objectList.indexOf(clickedTasks[p]) !== -1;
				if (curInProgress === inProgress && clickedTasks[p].drawDepth < lowestDrawDepthValue || (inProgress === true && curInProgress === false)) {
					lowestDrawDepthValue = clickedTasks[p].drawDepth;
					lowestDrawDepthId = p;
					if (curInProgress === false) {
						inProgress = false;
					}
				}
			}
			if (debug) {
				console.log("IN PROGESS?: " + inProgress + " CLICKED TASKS LENGTH: " + clickedTasks.length);
			}
			const selectedTask = clickedTasks[lowestDrawDepthId];
			let assignedAtLeastOnce = false;
			let taskWasAvailable = false;
			const baseSelectedTask = taskType(selectedTask);
			for (let i = 0; i < selection.length; i++) {
				let selectedTaskType = baseSelectedTask;
				// treat build commands as walk unless the raider is holding something that the building site needs
				if (selectedTaskType === "build") {
					if (selection[i].holding.length === 0) {
						selectedTaskType = "walk";
					}
					// check if any of the held resources is needed
					else {
						let foundNeeded = false;
						for (let h = 0; h < selection[i].holding.length; ++h) {
							if (selectedTask.resourceNeeded(selection[i].holding[h].type)) {
								foundNeeded = true;
								break;
							}
						}
						if (!foundNeeded) {
							selectedTaskType = "walk";
						}
					}
				}
				// treat any other commands as walk commands if the raider does not have the necessary tool
				else if (!selection[i].haveTool(selectedTaskType)) {
					selectedTaskType = "walk";
				}

				// ignore a 'walk' command if the objective is not walkable
				if (selectedTaskType === "walk" && (!selectedTask.walkable)) {
					continue;
				}

				// console.log("can we perform? : " + selection[i].canPerformTask(selectedTask, true));
				// if we changed the taskType to 'walk' override this canPerformTask check since raiders can always walk
				if (selection[i].canPerformTask(selectedTask, true) || selectedTaskType === "walk") {
					// if current raider is already performing a task and not holding anything, stop him before assigning the new task
					if (selection[i].currentTask != null && (selection[i].holding.length === 0 || selectedTaskType === "build" || selectedTaskType === "walk")) {
						stopMinifig(selection[i]);
					}
					// raiders are the only valid selection type for now
					if (selection[i].currentTask == null && (selection[i].holding.length === 0 || selectedTaskType === "build" || selectedTaskType === "walk")) {
						if (selection[i].haveTool(selectedTaskType)) {
							const index = tasksAvailable.indexOf(selectedTask);
							// this check will be necessary in the event that we choose a task such as walking
							if (index !== -1) {
								taskWasAvailable = true;
								tasksAvailable.splice(index, 1);
							} else {
								// these task types can only be assigned to a single raider from a selection group
								if (selectedTaskType === "collect" || selectedTaskType === "vehicle") {
									break;
								}
							}
							selection[i].currentTask = selectedTask;
							selection[i].currentObjective = selectedTask;

							selection[i].currentPath = findClosestStartPath(selection[i], calculatePath(terrain, selection[i].space,
								typeof selectedTask.space == "undefined" ? selectedTask : selectedTask.space, true));
							const foundCloserResource = selection[i].checkChooseCloserEquivalentResource(false);

							// don't assign the task if a valid path to the task cannot be found for the raider
							if (selection[i].currentPath == null) {
								selection[i].currentTask = null;
								selection[i].currentObjective = null;
							} else {
								// don't add this resource to tasksInProgress if we chose a closer resource instead
								if (!foundCloserResource) {
									// don't remove the task from tasksAvailable if we decided to walk due to lack of necessary tools
									if (selectedTaskType !== "walk") {
										assignedAtLeastOnce = true;
									}
								}
								if (selectedTaskType === "walk") {
									// set walkPosOffset to the difference from the selected space top-left corner to the walk position
									selection[i].walkPosDummy.setCenterX(GameManager.mouseReleasedPosRight.x + gameLayer.cameraX);
									selection[i].walkPosDummy.setCenterY(GameManager.mouseReleasedPosRight.y + gameLayer.cameraY);
									selection[i].currentTask = selection[i].walkPosDummy;
									selection[i].currentObjective = selection[i].walkPosDummy;
								} else if (selectedTaskType === "build") {
									for (let h = 0; h < selection[i].holding.length; ++h) {
										if (selectedTask.resourceNeeded(selection[i].holding[h].type)) {
											selectedTask.dedicatedResources[selection[i].holding[h].type]++;
											this.dedicatingResource = true;
										}
									}
								}
							}
						}
					}
				}
			}
			if (assignedAtLeastOnce && (tasksInProgress.objectList.indexOf(selectedTask) === -1)) {
				tasksInProgress.push(selectedTask);
			} else if (taskWasAvailable) {
				tasksAvailable.push(selectedTask);
			}
		}
	}
}

/**
 * release any held objects from all raiders in selection
 */
function unloadMinifig() {
	if (selection.length === 0) {
		return;
	}
	for (let i = 0; i < selection.length; i++) {
		if (selection[i].holding.length === 0) {
			continue;
		}
		for (let h = 0; h < selection[i].holding.length; ++h) {
			// create a new collectable of the same type, and place it on the ground. then, delete the currently held collectable.
			const newCollectable = (selection[i].holding[0].type === "dynamite" ? new Dynamite(getNearestSpace(terrain, selection[i], selection[i].holding[0].centerX(), selection[i].holding[0].centerY())) :
				new Collectable(getNearestSpace(terrain, selection[i]), selection[i].holding[0].type, selection[i].holding[0].centerX(), selection[i].holding[0].centerY()));
			collectables.push(newCollectable);
			tasksAvailable.push(newCollectable);
			newCollectable.drawAngle = selection[i].holding[0].drawAngle;
			selection[i].holding[0].die();
			selection[i].holding.shift();
		}
		// cleartask handles decrementing 'reserved resources' numbers and such
		selection[i].clearTask();
	}
}

/**
 * if selection is a collectable and is an available task, boost its task priority so that the next available raider will come get it
 */
function grabItem() {
	if (selection.length === 0) {
		return;
	}
	for (let i = 0; i < selection.length; i++) {
		const curIndex = tasksAvailable.indexOf(selection[i]);
		if (curIndex !== -1) {
			selection[i].taskPriority = 1;
		}
	}
	cancelSelection();
}

/**
 * if the current selection is a wall, set it to be reinforced
 */
function reinforceWall() {
	if (selection.length === 0) {
		return;
	}
	for (let i = 0; i < selection.length; i++) {
		// don't do anything if the space is already reinforced
		if (selection[i].reinforced) {
			continue;
		}
		// add the reinforce dummy to tasksAvailable if its not already there
		const curIndex = tasksAvailable.indexOf(selection[i].reinforceDummy);
		if (curIndex === -1) {
			tasksAvailable.push(selection[i].reinforceDummy);
		}
		selection[i].reinforceDummy.taskPriority = 1;
		selection[i].reinforceDummy.visible = true;
	}
	cancelSelection();
}

/**
 * if the currently selected space is explodable, set it to be blown up with dynamite
 */
function dynamiteWall() {
	if (selection.length === 0) {
		return;
	}
	for (let i = 0; i < selection.length; i++) {
		// add the dynamite dummy to tasksAvailable if its not already there
		const curIndex = tasksAvailable.indexOf(selection[i].dynamiteDummy);
		if (curIndex === -1) {
			tasksAvailable.push(selection[i].dynamiteDummy);
		}
		selection[i].dynamiteDummy.taskPriority = 1;
		selection[i].dynamiteDummy.visible = true;
	}
	cancelSelection();
}

/**
 * if the currently selected space is drillable, set it to be drilled
 */
function drillWall() {
	if (selection.length === 0) {
		return;
	}
	for (let i = 0; i < selection.length; i++) {
		const curIndex = tasksAvailable.indexOf(selection[i]);
		if (curIndex !== -1) {
			selection[i].taskPriority = 1;
			selection[i].drillDummy.visible = true;
		}
	}
	cancelSelection();
}

function stopDrillWall() {
	if (selection.length === 0) {
		return;
	}
	for (let i = 0; i < selection.length; i++) {
		// reset visuals and priority
		selection[i].taskPriority = 0;
		selection[i].drillDummy.visible = false;
		selection[i].reinforceDummy.visible = false;
		selection[i].dynamiteDummy.visible = false;
		// remove from available tasks
		const curIndex = tasksAvailable.indexOf(selection[i]);
		if (curIndex !== -1) {
			tasksAvailable.splice(curIndex, -1);
		}
		// TODO remove task from raiders too
	}
	cancelSelection();
}

/**
 * if the currently selected space is sweepable, set it to be cleared of rubble
 */
function clearRubble() {
	if (selection.length === 0) {
		return;
	}
	for (let i = 0; i < selection.length; i++) {
		const curIndex = tasksAvailable.indexOf(selection[i]);
		if (curIndex !== -1) {
			selection[i].taskPriority = 1;
		}
	}
	cancelSelection();
}

/**
 * if the currently selected space is cleared ground, set the currently selected space to be built into a power path
 */
function buildPowerPath() {
	if (selection.length === 0) {
		return;
	}
	for (let i = 0; i < selection.length; i++) {
		if (selection[i].type === "ground") {
			selection[i].buildingSiteType = "power path";
			selection[i].setTypeProperties("building site");
			tasksAvailable.push(selection[i]);
		}
	}
	cancelSelection();
}

/**
 * if the current selection is a building, attempt to upgrade it
 */
function upgradeBuilding() {
	for (let i = 0; i < selection.length; ++i) {
		selection[i].upgrade();
	}
	cancelSelection();
}

/**
 * determine the closest path to the closest building of buildingType from raider, or null if no path is found
 * @param raider: the raider from whom we are looking for a path
 * @param buildingType: the type of building we are searching for
 * @returns the closest path to the closest building of the desired type, or null if no path is found
 */
function pathToClosestBuilding(raider, buildingType) {
	const closestBuilding = raider.chooseClosestBuilding(buildingType);
	return findClosestStartPath(raider, calculatePath(terrain, raider.space, closestBuilding, true, raider));
}

/**
 * assign all raiders in the current selection to move to the nearest tool store and start upgrading, if they are not max level
 */
function upgradeRaider() {
	// find path to toolstore code copied from getTool
	for (let i = 0; i < selection.length; i++) {
		if (selection[i].vehicleInhibitsTask("get tool")) {
			continue;
		}
		if (selection[i].upgradeLevel < 3) {
			// these checks copied from checkAssignSelectionTask
			// if current raider is already performing a task and not holding anything, stop him before assigning the new task
			if (selection[i].currentTask != null && selection[i].holding.length === 0) {
				stopMinifig(selection[i]);
			}
			// raiders are the only valid selection type for now
			if (selection[i].currentTask == null && selection[i].holding.length === 0) {
				const newPath = pathToClosestBuilding(selection[i], "tool store");
				if (newPath == null) {
					// no toolstore found or unable to path to any toolstores from this raider
					continue;
				}
				selection[i].currentTask = newPath[0];
				selection[i].currentPath = newPath;
				selection[i].currentObjective = selection[i].currentTask;
			}
		}
	}
}

/**
 * assign all raiders in the selection to go to the nearest tool store and get the specified tool type, if they are not currently holding it
 * @param toolName: the name of the tool that the raiders should pick up
 */
function getTool(toolName) {
	for (let i = 0; i < selection.length; i++) {
		if (selection[i].vehicleInhibitsTask("get tool")) {
			continue;
		}
		if (selection[i].tools.indexOf(toolName) === -1) {
			// these checks copied from checkAssignSelectionTask
			// if current raider is already performing a task and not holding anything, stop him before assigning the new task
			if (selection[i].currentTask != null && selection[i].holding.length === 0) {
				stopMinifig(selection[i]);
			}
			// raiders are the only valid selection type for now
			if (selection[i].currentTask == null && selection[i].holding.length === 0) {
				const newPath = pathToClosestBuilding(selection[i], "tool store");
				if (newPath == null) {
					continue;
				}
				selection[i].currentTask = newPath[0];
				selection[i].currentPath = newPath;
				selection[i].currentObjective = selection[i].currentTask;
				selection[i].getToolName = toolName;
			}
		}
	}
	cancelSelection();
}

/**
 * pause or unpause the game
 */
function togglePauseGame() {
	RockRaiders.paused = !RockRaiders.paused;
	if (RockRaiders.paused) {
		goToPauseMenu("Menu1");
	} else {
		resetPauseLayer();
	}
}

function unpauseGame() {
	RockRaiders.paused = false;
	resetPauseLayer();
}

/**
 * check if the pause key is pressed, and if so, toggle the paused flag
 */
function checkTogglePause() {
	if (GameManager.keyStates[String.fromCharCode(80)]) {
		holdingPKey = true;
	} else if (holdingPKey) {
		togglePauseGame();
		holdingPKey = false;
	}
	if (GameManager.keyStates[String.fromCharCode(27)]) {
		holdingEscKey = true;
	} else if (holdingEscKey) {
		togglePauseGame();
		holdingEscKey = false;
	}
}

/**
 * stop the input raider, or all selected raiders if none is provided, regardless of their current task type
 * @param raider: if specified, only this raider will be stopped
 */
function stopMinifig(raider) {
	let stopGroup;
	if (raider == null) {
		stopGroup = selection;
	} else {
		stopGroup = [raider];
	}
	if (stopGroup.length === 0) {
		return;
	}
	for (let i = 0; i < stopGroup.length; i++) {
		if (stopGroup[i].currentTask == null) {
			continue;
		}
		// don't duplicate task types which involve a held object (collect, build, etc..)
		if (stopGroup[i].holding.length === 0) {
			// don't add walk dummies to tasksAvailable
			if (stopGroup[i].currentTask !== stopGroup[i].walkPosDummy) {
				tasksAvailable.push(stopGroup[i].currentTask);
			}
		}
		// still undecided as to whether or not this logic statement should be moved inside the above condition (stopGroup[i].holding.length == 0)
		if (stopGroup[i].currentTask.grabPercent != null && stopGroup[i].currentTask.grabPercent < 100) {
			stopGroup[i].currentTask.grabPercent = 0;
		}
		const currentlyHeld = stopGroup[i].holding;
		// cleartask handles decrementing 'reserved resources' numbers and such
		stopGroup[i].clearTask();
		for (let h = 0; h < currentlyHeld.length; ++h) {
			stopGroup[i].holding.push(currentlyHeld[h]);
		}
		if (stopGroup[i].holding.length !== 0) {
			for (let h = 0; h < stopGroup[i].holding.length; ++h) {
				// if the raider was in the process of putting down a collectable but was interrupted, reset its grabPercent
				stopGroup[i].holding[h].grabPercent = 100;
			}
		}
	}
}

/**
 * scroll the layer if mouse is panned or keyboard is pressed
 */
function applyLevelSelectScrolling() {
	let pannedKeyboard = false;
	// can we scroll using the arrow keys?
	if (keyboardPanning) {
		if (GameManager.keyStates[String.fromCharCode(38)]) {
			pannedKeyboard = true;
			levelSelectLayer.cameraY -= scrollSpeed;
		} else if (GameManager.keyStates[String.fromCharCode(40)]) {
			pannedKeyboard = true;
			levelSelectLayer.cameraY += scrollSpeed;
		}
	}
	// can we scroll by moving your mouse to the edge of the screen?
	if (mousePanning && !pannedKeyboard) {
		if (GameManager.mousePos.y < scrollDistance) {
			levelSelectLayer.cameraY -= scrollSpeed;
		} else if (GameManager.mousePos.y > GameManager.screenHeight - scrollDistance) {
			levelSelectLayer.cameraY += scrollSpeed;
		}
	}
	// can we scroll by using the mouse wheel?
	levelSelectLayer.cameraY += GameManager.mouseWheel;

	// keep level select camera in bounds
	if (levelSelectLayer.cameraY < 0) {
		levelSelectLayer.cameraY = 0;
	} else if (levelSelectLayer.cameraY > (levelSelectLayer.height - GameManager.screenHeight)) {
		levelSelectLayer.cameraY = levelSelectLayer.height - GameManager.screenHeight;
	}
}

/**
 * check whether or not the screen should scroll due to mouse position or keyboard input
 */
function checkScrollScreen() {
	let pannedKeyboard = false;
	// can we scroll using the arrow keys?
	if (keyboardPanning) {
		if (GameManager.keyStates[String.fromCharCode(37)]) {
			pannedKeyboard = true;
			gameLayer.cameraX -= scrollSpeed;
		} else if (GameManager.keyStates[String.fromCharCode(39)]) {
			pannedKeyboard = true;
			gameLayer.cameraX += scrollSpeed;
		}
		if (GameManager.keyStates[String.fromCharCode(38)]) {
			pannedKeyboard = true;
			gameLayer.cameraY -= scrollSpeed;
		} else if (GameManager.keyStates[String.fromCharCode(40)]) {
			pannedKeyboard = true;
			gameLayer.cameraY += scrollSpeed;
		}
	}
	// can we scroll by hovering the mouse at the corner of the screen?
	if (mousePanning && !pannedKeyboard) {
		if (GameManager.mousePos.x < scrollDistance) {
			gameLayer.cameraX -= scrollSpeed;
		} else if (GameManager.mousePos.x > GameManager.screenWidth - scrollDistance) {
			gameLayer.cameraX += scrollSpeed;
		}
		if (GameManager.mousePos.y < scrollDistance) {
			gameLayer.cameraY -= scrollSpeed;
		} else if (GameManager.mousePos.y > GameManager.screenHeight - scrollDistance) {
			gameLayer.cameraY += scrollSpeed;
		}
	}

	// keep camera in world bounds
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

/**
 * debug function: draw object properties above each Space in terrain
 */
function drawTerrainVars(varNames) {
	GameManager.drawSurface.fillStyle = "rgb(255, 0, 0)";
	GameManager.setFontSize(24);
	for (let i = 0; i < terrain.length; i++) {
		for (let r = 0; r < terrain[i].length; r++) {
			let concatString = "";
			for (let j = 0; j < varNames.length; ++j) {
				concatString += (terrain[i][r])[varNames[j]] + (j === varNames.length - 1 ? "" : ", ");
			}
			GameManager.drawText(concatString, terrain[i][r].centerX() - terrain[i][r].drawLayer.cameraX,
				terrain[i][r].centerY() - terrain[i][r].drawLayer.cameraY, true, true);
		}
	}
}

/**
 * draw current task above each raider's head
 */
function drawRaiderTasks() {
	GameManager.setFontSize(24);
	GameManager.drawSurface.fillStyle = "rgb(200, 220, 255)";
	for (let i = 0; i < raiders.objectList.length; i++) {
		const curTask = raiders.objectList[i].getTaskType(raiders.objectList[i].currentTask);
		// only display the current task if it is not null or if debug mode is enabled
		if (debug || curTask != null) {
			GameManager.drawText(curTask, raiders.objectList[i].centerX() - raiders.objectList[i].drawLayer.cameraX,
				raiders.objectList[i].y - raiders.objectList[i].drawLayer.cameraY - 13, true);
		}
	}
}

/**
 * draw ingite timer above each active dynamite instance
 */
function drawDynamiteTimers() {
	for (let i = 0; i < collectables.objectList.length; ++i) {
		if (collectables.objectList[i].type === "dynamite" && collectables.objectList[i].ignited) {
			// don't draw anything if the dynamite has exploded, and is just an effect
			if (collectables.objectList[i].igniteTimer === 0) {
				continue;
			}
			GameManager.setFontSize(24);
			GameManager.drawSurface.fillStyle = "rgb(255, 0, 0)";
			GameManager.drawSurface.fillText(Math.floor((collectables.objectList[i].igniteTimer - 1) / GameManager.fps + 1).toString(),
				collectables.objectList[i].x - collectables.objectList[i].drawLayer.cameraX,
				collectables.objectList[i].centerY() - collectables.objectList[i].drawLayer.cameraY - 20);

		}
	}
}

/**
 * draw required materials (ore and energy crystals) above each building site
 */
function drawBuildingSiteMaterials() {
	GameManager.setFontSize(24);
	for (let i = 0; i < buildingSites.length; i++) {
		GameManager.drawSurface.fillStyle = "rgb(0, 0, 255)";
		GameManager.drawText("Ore: " + buildingSites[i].placedResources["ore"] + "/" + buildingSites[i].requiredResources["ore"],
			buildingSites[i].centerX() - buildingSites[i].drawLayer.cameraX, buildingSites[i].y - buildingSites[i].drawLayer.cameraY + 40, true);
		GameManager.drawSurface.fillStyle = "rgb(0, 255, 0)";
		GameManager.drawText("Crystal: " + buildingSites[i].placedResources["crystal"] + "/" + buildingSites[i].requiredResources["crystal"],
			buildingSites[i].centerX() - buildingSites[i].drawLayer.cameraX, buildingSites[i].y - buildingSites[i].drawLayer.cameraY + 64, true);
	}
}

/**
 * draw held tools and skills for each raider
 */
function drawRaiderInfo() {
	if (selectionType !== "raider") {
		return;
	}
	// draw held items
	const heldWidth = GameManager.getImage("have am nothing.png").width;
	const heldHeight = GameManager.getImage("have am nothing.png").height;
	for (let i = 0; i < selection.length; ++i) {
		const maxTools = 2 + selection[i].upgradeLevel;
		for (let j = 0; j < maxTools; ++j) {
			const curImageName = selection[i].tools.length > j ? "have " + selection[i].tools[j] + ".png" : "have am nothing.png";
			GameManager.drawSurface.drawImage(GameManager.getImage(curImageName).canvas,
				selection[i].centerX() - (heldWidth * maxTools) / 2 + (heldWidth * j) - selection[i].drawLayer.cameraX,
				selection[i].y - 28 - heldHeight - selection[i].drawLayer.cameraY);
		}
	}

	// draw learned skills
	const maxSkills = 6;
	const skills = [["amDriver", "am driver.png"], ["amEngineer", "am engineer.png"], ["amGeologist", "am geologist.png"], ["amPilot", "am pilot.png"],
		["amSailor", "am sailor.png"], ["amExplosivesExpert", "am explosives expert.png"]];
	for (let i = 0; i < selection.length; ++i) {
		for (let j = 0; j < 6; ++j) {
			const curImageName = selection[i][skills[j][0]] ? skills[j][1] : "have am nothing.png";
			GameManager.drawSurface.drawImage(GameManager.getImage(curImageName).canvas,
				selection[i].centerX() - (heldWidth * maxSkills) / 2 + (heldWidth * j) - selection[i].drawLayer.cameraX,
				selection[i].y - 28 - selection[i].drawLayer.cameraY);
		}
	}
}

/**
 * draw active selection box (should only be called when the selection button is still held down)
 */
function drawSelectionBox() {
	if (selectionRectCoords.x1 != null) {
		GameManager.drawSurface.strokeStyle = "rgb(0,255,0)";
		GameManager.drawSurface.fillStyle = "rgb(0,255,0)";
		GameManager.drawSurface.lineWidth = 3;
		GameManager.drawSurface.beginPath();
		GameManager.drawSurface.rect(selectionRectPointList[0], selectionRectPointList[1],
			selectionRectPointList[2] - selectionRectPointList[0], selectionRectPointList[3] - selectionRectPointList[1]);
		GameManager.drawSurface.globalAlpha = 0.3;
		GameManager.drawSurface.fillRect(selectionRectPointList[0], selectionRectPointList[1],
			selectionRectPointList[2] - selectionRectPointList[0], selectionRectPointList[3] - selectionRectPointList[1]);
		GameManager.drawSurface.globalAlpha = 1;
		GameManager.drawSurface.stroke();
	}
}

/**
 * draw smallest bounding square around each raider
 */
function drawSelectedSquares() {
	GameManager.drawSurface.strokeStyle = "rgb(0,255,0)";
	GameManager.drawSurface.fillStyle = "rgb(0,255,0)";
	GameManager.drawSurface.lineWidth = 2;
	for (let i = 0; i < selection.length; i++) {
		if (selectionType === "raider") {
			GameManager.drawSurface.strokeStyle = "rgb(0,255,0)";
			// draw smallest bounding square
			GameManager.drawSurface.beginPath();
			const rectMaxLength = Math.max(selection[i].rect.width, selection[i].rect.height);
			const halfRectMaxLength = rectMaxLength / 2;
			GameManager.drawSurface.rect(selection[i].centerX() - halfRectMaxLength - selection[i].drawLayer.cameraX, selection[i].centerY() -
				halfRectMaxLength - selection[i].drawLayer.cameraY, rectMaxLength, rectMaxLength);
			GameManager.drawSurface.stroke();
		}
	}
}

/**
 * debug function: draw smallest rotated bounding rect around each raider
 */
function drawSelectedRects() {
	if (selectionType === "raider") {
		GameManager.drawSurface.lineWidth = 2;
		GameManager.drawSurface.fillStyle = "rgb(255,0,0)";
		GameManager.drawSurface.strokeStyle = "rgb(255,0,0)";
		for (let i = 0; i < selection.length; i++) {
			// draw smallest rotated bounding rect
			const rectPoints = calculateRectPoints(selection[i], false);
			GameManager.drawSurface.beginPath();
			GameManager.drawSurface.moveTo(rectPoints[rectPoints.length - 1].x - selection[i].drawLayer.cameraX,
				rectPoints[rectPoints.length - 1].y - selection[i].drawLayer.cameraY);
			for (let r = 0; r < rectPoints.length; r++) {
				GameManager.drawSurface.lineTo(rectPoints[r].x - selection[i].drawLayer.cameraX, rectPoints[r].y - selection[i].drawLayer.cameraY);
			}
			GameManager.drawSurface.stroke();
			GameManager.drawSurface.globalAlpha = 0.3;
			GameManager.drawSurface.fill();
			GameManager.drawSurface.globalAlpha = 1;
		}
	}
}

/**
 * draw all raiders' current task paths
 */
function highlightRaiderPaths() {
	let path;
	for (let r = 0; r < raiders.objectList.length; ++r) {
		path = raiders.objectList[r].currentPath;
		if (path == null) {
			// this raider currently has no path
			continue;
		}
		for (let i = 0; i < path.length; ++i) {
			GameManager.drawSurface.beginPath();
			const rectMaxLength = Math.max(path[i].rect.width, path[i].rect.height);
			const halfRectMaxLength = rectMaxLength / 2;
			GameManager.drawSurface.rect(path[i].centerX() - halfRectMaxLength - path[i].drawLayer.cameraX, path[i].centerY() -
				halfRectMaxLength - path[i].drawLayer.cameraY, rectMaxLength, rectMaxLength);
			GameManager.drawSurface.stroke();
		}
	}
}

/**
 * darken screen by input percentage (currently used during pause and level start)
 */
function dimScreen(dimPercentage) {
	const prevGlobalAlpha = GameManager.drawSurface.globalAlpha;
	GameManager.drawSurface.globalAlpha = dimPercentage;
	GameManager.drawSurface.fillStyle = "rgb(0,0,0)";
	// darken the screen by drawing a semi-transparent black rect
	GameManager.drawSurface.fillRect(0, 0, GameManager.screenWidth, GameManager.screenHeight);
	GameManager.drawSurface.globalAlpha = prevGlobalAlpha;

}

/**
 * draw game start instructions while awaiting player start after loading level
 */
function drawAwaitingStartInstructions() {
	if (awaitingStart) {
		dimScreen(.4);
		GameManager.drawSurface.globalAlpha = 1.0;
		GameManager.drawSurface.fillStyle = "rgb(65, 218, 255)";
		GameManager.setFontSize(72);
		const awaitingText = "Press Enter to Begin";
		const textWidth = GameManager.drawSurface.measureText(awaitingText).width;
		const textHeight = getHeightFromFont(GameManager.drawSurface.font);
		GameManager.drawSurface.fillText(awaitingText, GameManager.screenWidth / 2 - textWidth / 2,
			GameManager.screenHeight / 2 + textHeight / 2);
	}
}

/**
 * determine whether or not the mouse is currently hovering over an active GUI object
 * @returns boolean whether the mouse is hovering over a GUI object (true) or not (false)
 */
function mouseOverGUI() {
	const mPos = GameManager.mousePos;
	// check color alpha value under mouse position, if not 0 there is some GUI element below the cursor
	return uiLayer.drawSurface.getImageData(mPos.x, mPos.y, 1, 1).data[3] > 0;
}

/**
 * open the buildings menu
 */
function openBuildingMenu() {
	cancelSelection();
	changeIconPanel(RockRaiders.buildIconPanel);
}

/**
 * open the small vehicles menu
 */
function openSmallVehicleMenu() {
	cancelSelection();
	changeIconPanel(RockRaiders.smallVehicleIconPanel);
}

/**
 * open the large vehicles menu
 */
function openLargeVehicleMenu() {
	cancelSelection();
	changeIconPanel(RockRaiders.largeVehicleIconPanel);
}

/**
 * make the currently selected raiders exit their vehicles, if they are riding one
 */
function exitVehicle() {
	if (selectionType === "raider") {
		for (let i = 0; i < selection.length; ++i) {
			selection[i].exitVehicle();
		}
	}
}

/**
 * determine whether or not the requirements are met in order to begin building a building of the input type
 * @param buildingType: the type of building for which we need to know the requirements
 * @returns boolean whether the necessary requirements are met to begin building the desired buildingType (true) or not (false)
 */
function buildRequirementsMet(buildingType) {
	let buildingRequirements = [];
	// buildings TODO read this from config
	if (buildingType === "teleport pad") {
		buildingRequirements = ["tool store"];
	} else if (buildingType === "docks") {
		buildingRequirements = ["tool store", "teleport pad"];
	} else if (buildingType === "power station") {
		buildingRequirements = ["tool store", "teleport pad"];
	} else if (buildingType === "ore refinery") {
		buildingRequirements = ["tool store", "teleport pad", "power station"];
	} else if (buildingType === "geological center") {
		buildingRequirements = ["tool store", "teleport pad", "power station"];
	} else if (buildingType === "mining laser") {
		buildingRequirements = ["tool store", "teleport pad", "power station"];
	} else if (buildingType === "upgrade station") {
		buildingRequirements = ["tool store", "teleport pad", "power station"];
	} else if (buildingType === "support station") {
		buildingRequirements = ["tool store", "teleport pad", "power station"];
	} else if (buildingType === "super teleport") {
		buildingRequirements = ["tool store", "teleport pad", "power station", "support station"];
	}

	// vehicles TODO read this from config
	else if (buildingType === "hover scout") {
		buildingRequirements = ["support station"];
	} else if (buildingType === "small digger") {
		buildingRequirements = ["support station"];
	} else if (buildingType === "small transport truck") {
		buildingRequirements = ["support station"];
	} else if (buildingType === "small catamaran") {
		buildingRequirements = ["docks", "support station"];
	} else if (buildingType === "small mwp") {
		buildingRequirements = ["teleport pad:2", "support station"];
	} else if (buildingType === "small heli") {
		buildingRequirements = ["teleport pad:2", "support station"];
	}

	for (let i = 0; i < buildingRequirements.length; ++i) {
		let requirementMet = false;
		for (let j = 0; j < buildings.length; ++j) {
			// building must be upgraded at least once to build next building
			if (buildings[j].type === buildingRequirements[i] && buildings[j].upgradeLevel >= 1) {
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

/**
 * enable the buildingPlacer object so that the player can select where to place the desired building
 * @param buildingType: the type of building that the buildingPlacer should place
 */
function startBuildingPlacer(buildingType) {
	// TODO remove obsolete duplicate check
	// buttons now take care of this check, but it can't hurt to check it one more time here
	if (buildRequirementsMet(buildingType)) {
		buildingPlacer.start(buildingType);
		buildingPlacer.updatePosition();
		cancelSelection();
	}
}

/**
 * create all in-game GUI elements once here
 */
RockRaidersGame.prototype.createGUIElements = function () {
	this.mainIconPanel = new IconButtonPanel();
	const figBtn = this.mainIconPanel.addButton("Interface/Icons", "minifigures.bmp", createRaider, null, function () {
		return raiders.size() < RockRaiders.getMaxAmountOfRaiders();
	});
	new RaiderQueueSizeText(figBtn);
	this.mainIconPanel.addButton("Interface/Menus", "building.bmp", openBuildingMenu);
	this.mainIconPanel.addButton("Interface/Menus", "SMvehicle.bmp", openSmallVehicleMenu);
	this.mainIconPanel.addButton("Interface/Menus", "BIGvehicle.bmp", openLargeVehicleMenu);
	this.mainIconPanel.updateBackgroundImage();

	this.buildIconPanel = new IconButtonPanel(changeIconPanel);
	this.buildIconPanel.addButton("Interface/Icons", "ToolStation.bmp", startBuildingPlacer, ["tool store"], buildRequirementsMet, ["tool store"]);
	this.buildIconPanel.addButton("Interface/Icons", "SMteleport.bmp", startBuildingPlacer, ["teleport pad"], buildRequirementsMet, ["teleport pad"]);
	this.buildIconPanel.addButton("Interface/Icons", "dock.bmp", startBuildingPlacer, ["docks"], buildRequirementsMet, ["docks"]);
	this.buildIconPanel.addButton("Interface/Icons", "PowerStation.bmp", startBuildingPlacer, ["power station"], buildRequirementsMet, ["power station"]);
	this.buildIconPanel.addButton("Interface/Icons", "barracks.bmp", startBuildingPlacer, ["support station"], buildRequirementsMet, ["support station"]);
	this.buildIconPanel.addButton("Interface/Icons", "Upgrade.bmp", startBuildingPlacer, ["upgrade station"], buildRequirementsMet, ["upgrade station"]);
	this.buildIconPanel.addButton("Interface/Icons", "Geo.bmp", startBuildingPlacer, ["geological center"], buildRequirementsMet, ["geological center"]);
	this.buildIconPanel.addButton("Interface/Icons", "Orerefinery.bmp", startBuildingPlacer, ["ore refinery"], buildRequirementsMet, ["ore refinery"]);
	this.buildIconPanel.addButton("Interface/Icons", "Gunstation.bmp", startBuildingPlacer, ["mining laser"], buildRequirementsMet, ["mining laser"]);
	this.buildIconPanel.addButton("Interface/Icons", "LargeTeleporter.bmp", startBuildingPlacer, ["super teleport"], buildRequirementsMet, ["super teleport"]);
	this.buildIconPanel.updateBackgroundImage();

	this.smallVehicleIconPanel = new IconButtonPanel(changeIconPanel);
	this.smallVehicleIconPanel.addButton("Interface/Icons", "hoverboard.bmp", createVehicle, ["hover scout"], buildRequirementsMet, ["hover scout"]);
	this.smallVehicleIconPanel.addButton("Interface/Icons", "SmallTruck.bmp", createVehicle, ["small digger"], buildRequirementsMet, ["small digger"]);
	this.smallVehicleIconPanel.addButton("Interface/Icons", "SmallDigger.bmp", createVehicle, ["small transport truck"], buildRequirementsMet, ["small transport truck"]);
	this.smallVehicleIconPanel.addButton("Interface/Icons", "SmallCat.bmp", createVehicle, ["small catamaran"], buildRequirementsMet, ["small catamaran"]);
	this.smallVehicleIconPanel.addButton("Interface/Icons", "SmallMWP.bmp", createVehicle, ["small mwp"], buildRequirementsMet, ["small mwp"]);
	this.smallVehicleIconPanel.addButton("Interface/Icons", "SmallHeli.bmp", createVehicle, ["small heli"], buildRequirementsMet, ["small heli"]);
	this.smallVehicleIconPanel.updateBackgroundImage();

	this.largeVehicleIconPanel = new IconButtonPanel(changeIconPanel);
	this.largeVehicleIconPanel.addButton("Interface/Icons", "Bulldozer.bmp");
	this.largeVehicleIconPanel.addButton("Interface/Icons", "WalkerDigger.bmp");
	this.largeVehicleIconPanel.addButton("Interface/Icons", "LargeMWP.bmp");
	this.largeVehicleIconPanel.addButton("Interface/Icons", "largeDigger.bmp");
	this.largeVehicleIconPanel.addButton("Interface/Icons", "LargeCatamaran.bmp");
	this.largeVehicleIconPanel.updateBackgroundImage();

	// raider selected buttons
	this.raiderIconPanel = new IconButtonPanel(cancelSelection);
	this.raiderIconPanel.addButton("Interface/Menus", "Sandwich.bmp");
	this.raiderIconPanel.addButton("Interface/Menus", "UnloadMinifigure.bmp", unloadMinifig);
	this.raiderIconPanel.addButton("Interface/Menus", "MF_Pickup.bmp");
	const getToolButton = this.raiderIconPanel.addButton("Interface/Priorities", "getTool.bmp");
	this.raiderIconPanel.addButton("Interface/Menus", "Upgrade.bmp", upgradeRaider);
	const trainAsButton = this.raiderIconPanel.addButton("Interface/Menus", "TrainAs.bmp");
	this.raiderIconPanel.addButton("Interface/Menus", "delete.bmp", function () {
		unloadMinifig();
		exitVehicle();
		for (let c = 0; c < selection.length; c++) {
			selection[c].die();
		}
	});
	this.raiderIconPanel.updateBackgroundImage();

	// get tool buttons
	getToolButton.addContextButton("get_Drill.bmp", getTool, ["drill"]);
	getToolButton.addContextButton("get_Spade.bmp", getTool, ["shovel"]);
	getToolButton.addContextButton("get_Hammer.bmp", getTool, ["hammer"]);
	getToolButton.addContextButton("get_Spanner.bmp", getTool, ["wrench"]);
	getToolButton.addContextButton("Gun_freeze.bmp", getTool, ["freezer"]);
	getToolButton.addContextButton("Gun_Pusher.bmp", getTool, ["pusher"]);
	getToolButton.addContextButton("Gun_lazer.bmp", getTool, ["laser"]);
	getToolButton.addContextButton("get_BirdScarer.bmp", getTool, ["blaster"]);

	// train as buttons
	trainAsButton.addContextButton("Train_Explosives.bmp");
	trainAsButton.addContextButton("Train_Pilot.bmp");
	trainAsButton.addContextButton("Train_Sailor.bmp");
	trainAsButton.addContextButton("Train_Driver.bmp");
	trainAsButton.addContextButton("Train_Engineer.bmp");
	trainAsButton.addContextButton("Train_Geologist.bmp");

	// drillable wall selected buttons
	this.wallIconPanel = new IconButtonPanel(cancelSelection);
	this.wallIconPanel.addButton("Interface/Menus", "drill.bmp", drillWall, null, function () {
		if (selection[0].type === "hard rock") {
			for (let c = 0; c < vehicles.objectList.length; c++) {
				if (vehicles.objectList[c].canDrillHard) {
					return true;
				}
			}
			return false;
		} else {
			return true;
		}
	});
	this.wallIconPanel.addButton("Interface/Menus", "Reinforce.bmp", reinforceWall, null, function () {
		return selection[0] && !(selection[0].reinforced) && selection[0].shapeIndex === 0;
	});
	this.wallIconPanel.addButton("Interface/Menus", "dynamite.bmp", dynamiteWall, null, function () {
		// TODO test if demolition is available or tool store level >= 2 to train one
		return true;
	});
	this.wallIconPanel.addButton("Interface/Menus", "stopdrill.bmp", stopDrillWall);
	this.wallIconPanel.updateBackgroundImage();

	// floor Space selected buttons
	this.groundIconPanel = new IconButtonPanel(cancelSelection);
	this.groundIconPanel.addButton("Interface/Menus", "buildpath.bmp", buildPowerPath);
	this.groundIconPanel.addButton("Interface/Menus", "diguppath.bmp", null, null, function () {
		return selectionType === "power path"; // seems obsolete, but is also in the original game
	});
	this.groundIconPanel.addButton("Interface/Icons", "efence.bmp", null, null, function () { return false; });
	this.groundIconPanel.updateBackgroundImage();

	// power path selection buttons
	this.powerPathIconPanel = new IconButtonPanel(cancelSelection);
	this.powerPathIconPanel.addButton("Interface/Menus", "diguppath.bmp", function () {
		selection[0].makeRubble(2, null, true);
	}, null, function () {
		return selectionType === "power path";
	});
	this.powerPathIconPanel.addButton("Interface/Icons", "efence.bmp", null, null, function () { return false; });
	this.powerPathIconPanel.updateBackgroundImage();

	// rubble selection buttons
	this.rubbleIconPanel = new IconButtonPanel(cancelSelection);
	this.rubbleIconPanel.addButton("Interface/Menus", "ClearRubble.bmp", clearRubble);
	this.rubbleIconPanel.addButton("Interface/Icons", "efence.bmp", null, null, function () { return false; });
	this.rubbleIconPanel.updateBackgroundImage();

	// building selection buttons
	this.buildingIconPanel = new IconButtonPanel(cancelSelection);
	this.buildingIconPanel.addButton("Interface/Menus", "Upgrade.bmp", upgradeBuilding, null, function () {
		for (let c = 0; c < selection.length; c++) {
			if (selection[c].isUpgradeable()) return true;
		}
		return false;
	});
	this.buildingIconPanel.addButton("Interface/Menus", "telepbuilding.bmp", function () {
		for (let c = 0; c < selection.length; c++) {
			// TODO drop ores and crystals
			// TODO remove building
		}
	});
	this.buildingIconPanel.updateBackgroundImage();

	this.buildingSiteIconPanel = new IconButtonPanel(cancelSelection);
	this.buildingSiteIconPanel.addButton("Interface/Menus", "STOPbuilding.bmp");
	this.buildingSiteIconPanel.updateBackgroundImage();

	this.rightPanel = new CrystalSideBar();

	// pause menu layers
	const pauseConf = GameManager.configuration["Lego*"]["Menu"]["PausedMenu"];
	const pauseMenuCount = parseInt(pauseConf["MenuCount"]);
	for (let m = 0; m < pauseMenuCount; m++) {
		const menuKey = "Menu" + (m + 1);
		const confMenu = pauseConf[menuKey];
		const layer = new Layer(0, 0, 50, 50, GameManager.screenWidth, GameManager.screenHeight);
		pauseLayers[menuKey] = layer;
		layer.background = GameManager.getImage(confMenu["MenuImage"].split(":")[0]);
		layer.width = layer.background.width;
		layer.height = layer.background.height;
		const fontMenu = GameManager.getFont(confMenu["MenuFont"]);
		const fontLow = GameManager.getFont(confMenu["LoFont"]);
		const fontHigh = GameManager.getFont(confMenu["HiFont"]);
		let position = confMenu["Position"].split(":");
		const mainX = parseInt(position[0]);
		const mainY = parseInt(position[1]);
		new MenuTitleLabel(GameManager.screenWidth / 2, mainY, fontMenu, confMenu["FullName"], pauseLayers[menuKey]);
		const autoCenter = confMenu["AutoCenter"] === "TRUE";
		const itemCount = parseInt(confMenu["ItemCount"]);
		for (let c = 0; c < itemCount; c++) {
			const itemArgs = confMenu["Item" + (c + 1)].split(":");
			// TODO hide some buttons in tutorial
			// if (itemArgs[5] === "NotInTuto" && this.currentLevelKey.startsWith("Tutorial")) {
			// 	continue;
			// }
			const itemType = itemArgs[0];
			const itemX = autoCenter ? GameManager.screenWidth / 2 : mainX + parseInt(itemArgs[1]);
			const itemY = mainY + parseInt(itemArgs[2]);
			let menuFunc;
			let menuArgs = [itemArgs[4]];
			if (itemType === "Next") {
				menuFunc = goToPauseMenu;
				new BitmapFontButton(itemX, itemY, itemArgs[3].replace(/_/g, " "), fontLow, fontHigh, pauseLayers[menuKey], menuFunc, menuArgs, autoCenter);
			} else if (itemType === "Trigger") {
				if (menuKey === "Menu1") {
					menuFunc = unpauseGame;
				} else if (menuKey === "Menu3") {
					menuFunc = function () {
						unpauseGame();
						showScoreScreen("quit");
					};
				} else if (menuKey === "Menu4") {
					menuFunc = resetLevelVars;
					menuArgs = null;
				} else {
					menuFunc = null;
				}
				new BitmapFontButton(itemX, itemY, itemArgs[3].replace(/_/g, " "), fontLow, fontHigh, pauseLayers[menuKey], menuFunc, menuArgs, autoCenter);
			} else if (itemType === "Slider") {
				const label = itemArgs[5].replace(/_/g, " ");
				const imgLabelLow = fontLow.createTextImage(label);
				const imgLabelHigh = fontHigh.createTextImage(label);
				const maxValue = parseInt(itemArgs[7]);
				let defaultValue = Math.floor(maxValue / 2);
				if (m === 1 && c === 1) { // fx volume
					defaultValue = GameManager.fxVolume * maxValue;
				} else if (m === 1 && c === 2) { // music volume
					defaultValue = musicPlayer.musicVolume * maxValue;
				}
				new Slider(itemX, itemY, parseInt(itemArgs[3]), parseInt(itemArgs[4]), imgLabelLow, imgLabelHigh, itemArgs[6], maxValue, defaultValue, pauseLayers[menuKey], function (value) {
					if (m === 1 && c === 0) { // game speed
						// TODO change game speed
					} else if (m === 1 && c === 1) { // sound fx volume
						setFxVolume(value);
					} else if (m === 1 && c === 2) { // music volume
						musicPlayer.setMusicVolume(value);
					} else if (m === 1 && c === 3) { // brightness
						// TODO change game brightness
					}
				});
			} else if (itemType === "Cycle") {
				new ToggleButton(itemX, itemY, parseInt(itemArgs[3]), parseInt(itemArgs[4]), fontLow, fontHigh, itemArgs[5], itemArgs[7], itemArgs[8], 1, pauseLayers[menuKey], function (state) {
					// TODO change states
				});
			} else {
				// TODO other menu item types?
				// console.log("Ignoring unknown item type " + itemType + " in pause menu");
			}
		}
	}
};

/**
 * return boolean whether or not level targetLevelKey has been unlocked
 */
function levelIsUnlocked(targetLevelKey) {
	const openByDefault = RockRaiders.levelConf[targetLevelKey]["FrontEndOpen"];
	if (openByDefault && openByDefault === "TRUE") {
		return true;
	}
	const levelLinks = RockRaiders.levelLinks[targetLevelKey];
	for (let c = 0; c < levelLinks.length; c++) {
		if (getLevelScore(levelLinks[c]) == null) {
			return false;
		}
	}
	return true;
}

/**
 * create all menu screen buttons once here
 */
function createMainMenuLayers() {
	const confMainMenu = GameManager.configuration["Lego*"]["Menu"]["MainMenuFull"];

	const menuCount = parseInt(confMainMenu["MenuCount"]);
	for (let m = 0; m < menuCount - 1; m++) {
		const menuKey = "Menu" + (m + 1);
		const confMenu = confMainMenu[menuKey];
		mainMenuLayers[menuKey] = new Layer(0, 0, 0, 0, GameManager.screenWidth, GameManager.screenHeight);
		mainMenuLayers[menuKey].background = GameManager.getImage(confMenu["MenuImage"]);
		mainMenuLayers[menuKey].width = mainMenuLayers[menuKey].background.width;
		mainMenuLayers[menuKey].height = mainMenuLayers[menuKey].background.height;
		mainMenuLayers[menuKey].configuration = confMenu;
		const fontLow = GameManager.getFont(confMenu["LoFont"]);
		const fontHigh = GameManager.getFont(confMenu["HiFont"]);
		let position = confMenu["Position"].split(":");
		const mainX = parseInt(position[0]);
		const mainY = parseInt(position[1]);
		if (confMenu["DisplayTitle"] === "TRUE") {
			new MenuTitleLabel(mainX, mainY, fontLow, confMenu["FullName"], mainMenuLayers[menuKey]);
		}
		const autoCenter = confMenu["AutoCenter"] === "TRUE";
		const itemCount = parseInt(confMenu["ItemCount"]);
		for (let c = 0; c < itemCount; c++) {
			if (m === 0 && c === itemCount - 1) { // TODO better use menu identifier/key?
				continue; // ignore last entry (Exit Game) in main menu
			}
			const itemArgs = confMenu["Item" + (c + 1)].split(":");
			const menuFunc = itemArgs[0] === "Next" ? goToMenu : null;
			const itemX = mainX + parseInt(itemArgs[1]);
			const itemY = mainY + parseInt(itemArgs[2]);
			let normalSurface, hoverSurface, dullSurface;
			if (itemArgs.length === 8) { // image button
				normalSurface = GameManager.getImage(itemArgs[3]);
				hoverSurface = GameManager.getImage(itemArgs[4]);
				dullSurface = GameManager.getImage(itemArgs[5]);
			} else { // default render as text button
				const label = itemArgs[3];
				normalSurface = fontLow.createTextImage(label);
				hoverSurface = fontHigh.createTextImage(label);
			}
			const x = autoCenter ? itemX - normalSurface.canvas.width / 2 : itemX;
			new ImageButton(x, itemY, 0, normalSurface, hoverSurface, mainMenuLayers[menuKey], menuFunc, [itemArgs[itemArgs.length - 1]]);
		}
		if (m === 0) { // TODO better use menu identifier/key?
			new BitmapFontButton(mainX, mainY + 160, "Options", fontLow, fontHigh, mainMenuLayers[menuKey], goToMenu, ["Options"]);
			mainMenuLayers["Options"] = new Layer(0, 0, 0, 0, GameManager.screenWidth, GameManager.screenHeight);
			mainMenuLayers["Options"].background = mainMenuLayers["Menu1"].background;
			let btn = new BitmapFontButton(mainX, mainY - 40, "Edge Panning " + (mousePanning ? "X" : "-"), fontLow, fontHigh, mainMenuLayers["Options"], toggleEdgePanning);
			btn.optionalArgs = [btn];
			btn = new BitmapFontButton(mainX, mainY, "Debug Mode " + (debug ? "X" : "-"), fontLow, fontHigh, mainMenuLayers["Options"], toggleDebugMode);
			btn.optionalArgs = [btn];
			btn = new BitmapFontButton(mainX, mainY + 40, "Show Hidden Spaces " + (!maskUntouchedSpaces ? "X" : "-"), fontLow, fontHigh, mainMenuLayers["Options"], toggleFog);
			btn.optionalArgs = [btn];
			new BitmapFontButton(mainX, mainY + 80, "Unlock All Levels", fontLow, fontHigh, mainMenuLayers["Options"], unlockAllLevels);
			new BitmapFontButton(mainX, mainY + 120, "Clear Data", fontLow, fontHigh, mainMenuLayers["Options"], clearData);
			new BitmapFontButton(mainX, mainY + 160, "Back", fontLow, fontHigh, mainMenuLayers["Options"], goToMenu, ["Menu1"]);
		}
	}
}

RockRaidersGame.prototype.finalizeLevelSelectLayer = function () {
	levelSelectLayer = mainMenuLayers["Menu2"];
	const allLevelsConf = GameManager.configuration["Lego*"]["Levels"];

	const menuConf = GameManager.configuration["Lego*"]["Menu"];
	const levelTextConf = menuConf["LevelText"];
	const window = [];
	levelTextConf["Window"].split("|").forEach(function (val) {
		window.push(parseInt(val))
	});
	const panel = levelTextConf["Panel"].split("|");
	const winPanel = new WindowPanel(panel[1], panel[2], 50, GameManager.getImage(panel[0]), levelSelectLayer, window[0], window[1], window[2], window[3]);
	const font = GameManager.getFont("Interface/Fonts/Font5_Hi.bmp");
	winPanel.setFirstLine(font, levelTextConf["Level"]);

	const that = this;
	Object.keys(allLevelsConf).forEach(function (levelKey) {
		if (!(levelKey.startsWith("Tutorial") || levelKey.startsWith("Level"))) {
			return; // ignore duplicate levels
		}
		that.levelConf[levelKey] = allLevelsConf[levelKey];
		const levelLinks = that.levelConf[levelKey]["LevelLinks"];
		if (levelLinks) {
			levelLinks.split(",").forEach((childLevel) => {
				// the current level is added as a dependency link to all child levels
				const childKey = childLevel.replace(/^Levels::/, "").trim();
				that.levelLinks[childKey] = that.levelLinks[childKey] || [];
				that.levelLinks[childKey].push(levelKey);
			});
		}
		that.levelConf[levelKey].NerpRunner = GameManager.nerps[that.levelConf[levelKey]["NERPFile"].replace(".npl", ".nrn")];
		const frontendX = that.levelConf[levelKey]["FrontEndX"];
		const frontendY = that.levelConf[levelKey]["FrontEndY"];
		const menuBitmaps = that.levelConf[levelKey]["MenuBMP"].split(",");
		const normalSurface = GameManager.getImage(menuBitmaps[1]);
		const brightenedSurface = GameManager.getImage(menuBitmaps[0]);
		const btn = new ImageButton(frontendX, frontendY, 100, normalSurface, brightenedSurface, levelSelectLayer, resetLevelVars, [levelKey], true);
		btn.unavailableSurface = GameManager.getImage(menuBitmaps[2]);
		btn.additionalRequirement = levelIsUnlocked;
		btn.additionalRequirementArgs = [levelKey];
		btn.mouseEnterCallback = function () {
			let appendix = "";
			const levelScore = getLevelScore(levelKey);
			if (levelScore != null) {
				appendix = " l " + menuConf["Level_Completed"] + " (" + levelScore + ")"
			}
			winPanel.setSecondLine(font, that.levelConf[levelKey]["FullName"] + appendix);
		};
		btn.mouseLeaveCallback = function () {
			winPanel.setSecondLine(font, menuConf["Level_Incomplete"]);
		}
	});
};

function goToMenu(menuKey) {
	if (menuLayer !== null) {
		menuLayer.active = false;
	}
	gameLayer.active = false;
	uiLayer.active = false;
	resetPauseLayer();
	menuLayer = mainMenuLayers[menuKey];
	menuLayer.active = true;
	menuLayer.cameraY = 0;
	GameManager.playSoundEffect("SFX_RockWipe");
}

function resetPauseLayer(menuKey = "Menu1") {
	if (pauseLayer !== null) {
		pauseLayer.active = false;
	}
	pauseLayer = pauseLayers[menuKey];
}

function goToPauseMenu(menuKey) {
	resetPauseLayer(menuKey);
	pauseLayer.active = true;
}

/**
 * switch to the level select layer
 */
function goToLevelSelect(resetCamera, keepMusic) {
	goToMenu("Menu2");
	if (resetCamera) {
		levelSelectLayer.cameraY = 0;
	}
	if (!keepMusic) {
		musicPlayer.changeTrack("menu theme");
		stopAllSounds();
	}
}

/**
 * toggle the global setting for whether or not the mouse may scroll the screen by pointing at the edges (both the variable and the HTML5 local var)
 */
function toggleEdgePanning(button) {
	mousePanning = !mousePanning;
	setValue("mousePanning", mousePanning);
	button.setText("Edge Panning " + (mousePanning ? "X" : "-"));
}

/**
 * toggle debug mode variable and HTML5 local var on or off
 */
function toggleDebugMode(button) {
	debug = !debug;
	setValue("debug", debug);
	button.setText("Debug Mode " + (debug ? "X" : "-"));
}

/**
 * toggle fog variable and HTML5 local var on or off
 */
function toggleFog(button) {
	maskUntouchedSpaces = !maskUntouchedSpaces;
	setValue("fog", maskUntouchedSpaces);
	button.setText("Show Hidden Spaces " + (!maskUntouchedSpaces ? "X" : "-"));
}

function unlockAllLevels() {
	Object.keys(RockRaiders.levelConf).forEach(function (levelKey) {
		setLevelScore(0, levelKey);
	});
}

function clearData() {
	Object.keys(RockRaiders.levelConf).forEach(function (levelKey) {
		localStorage.removeItem(levelKey);
	});
	localStorage.removeItem("fog");
	localStorage.removeItem("mousePanning");
	localStorage.removeItem("debug");
}

/**
 * stop all currently playing raider sounds
 */
function stopAllSounds() {
	for (let i = 0; i < raiders.objectList.length; i++) {
		raiders.objectList[i].stopSounds();
	}
}

/**
 * reset all non-constant game variables for the start of a new level
 * @param levelKey: the name of the level to switch to
 */
function resetLevelVars(levelKey) {
	if (!GameManager.devMode) {
		blockPageExit();
	}
	menuLayer.active = false;
	levelSelectLayer.active = false;
	scoreScreenLayer.active = false;
	gameLayer.active = true;
	gameLayer.frozen = false;
	uiLayer.active = true;
	uiLayer.frozen = false;
	resetPauseLayer();
	musicPlayer.changeTrack();
	reservedResources = {"ore": 0, "crystal": 0};
	selectionRectCoords = {x1: null, y1: null};
	selection = [];
	mousePressStartPos = {x: 1, y: 1};
	mousePressIsSelection = false;
	RockRaiders.mainIconPanel.setVisible(true);
	cancelSelection();
	for (let i = 0; i < terrain.length; ++i) {
		for (let r = 0; r < terrain[i].length; ++r) {
			terrain[i][r].die();
		}
	}
	terrain = [];
	// don't need to kill buildings or buildingSites as these are just a type of space
	// similar to terrain[], just holds spaces which are buildings so that they can be easily located by raiders.
	buildings = [];
	// used by raider ai pathfinding in a similar manner to buildings[]
	buildingSites = [];
	tasksAvailable = [];
	tasksInProgress = new ObjectGroup();
	raiders.removeAll(true);
	vehicles.removeAll(true);
	collectables.removeAll(true);
	selectionRectPointList = [];
	selectionRectCoordList = [];
	awaitingStart = true;
	RockRaiders.paused = false;
	holdingPKey = false;
	holdingEscKey = false;
	RockRaiders.raiderInQueue = 0;
	loadLevelData(levelKey);
	RockRaiders.rightPanel.init(_try(() => parseInt(RockRaiders.levelConf[levelKey]["Reward"]["Quota"]["Crystals"])));
	// lets be fair and make this the last operation
	RockRaiders.levelStartTime = new Date();
}

/**
 * set HTNL5 local storage variable value
 * @param name: the name of the local storage variable to set
 * @param value: the value to set the local storage variable to
 */
function setValue(name, value) {
	localStorage.setItem(name, value);
}

/**
 * get HTML5 local storage variable value
 * @param name: the name of the local storage variable whose value we want
 * @param valueDefault: An optional default value
 * @returns string the value stored in the local storage variable with the input name
 */
function getValue(name, valueDefault) {
	const val = localStorage.getItem(name);
	return val !== null || !(valueDefault) ? val : valueDefault;
}

/**
 * initialize global game-related constants
 */
function RockRaidersGame() {
	tileSize = 128;
	scrollDistance = 10;
	scrollSpeed = 20;
	// distance the mouse must be moved before a click turns into a drag selection box
	dragStartDistance = 10;
	// if true, this creates the "fog of war" type effect where unrevealed Spaces appear as solid rock (should only be set to false for debugging purposes)
	maskUntouchedSpaces = getValue("fog") !== "false";
	// can we scroll the screen using the mouse?
	mousePanning = getValue("mousePanning", (!GameManager.devMode).toString()) === "true";
	// can we scroll the screen using the arrow keys?
	keyboardPanning = true;
	// should the game render any active debug info?
	debug = getValue("debug") === "true";
	GameManager.fxVolume = getValue("fxVolume", 1);
	this.levelConf = {};
	this.levelLinks = {};

	mainMenuLayers = {};
	menuLayer = null;
	levelSelectLayer = null;
	gameLayer = new Layer(0, 0, 150, 150, GameManager.screenWidth, GameManager.screenHeight);
	uiLayer = new Layer(0, 0, 100, 100, GameManager.screenWidth, GameManager.screenHeight);
	pauseLayers = {};
	pauseLayer = null;
	musicPlayer = new MusicPlayer();
	musicPlayer.changeTrack("menu theme");
	// create all in-game UI buttons initially, as there is no reason to load and unload these
	this.createGUIElements();
	// create all menu buttons
	createMainMenuLayers();
	this.finalizeLevelSelectLayer();
	scoreScreenLayer = new ScoreScreenLayer(GameManager.configuration["Lego*"]["Reward"]);
	mainMenuLayers["Reward"] = scoreScreenLayer;
	GameManager.drawSurface.font = "48px Arial";
	// task priorities overridden by each level
	this.tasksAutomated = {};
	// dict of task type to required tool
	toolsRequired = {
		"sweep": "shovel",
		"drill": "drill",
		"drill hard": "big drill",
		"reinforce": "hammer"
	};
	nonPrimarySpaceTypes = ["power station topRight", "geological center right", "upgrade station right",
		"ore refinery right", "mining laser right", "super teleport topRight"];

	powerPathSpaceTypes = ["power path", "building power path", "power station powerPath", "mining laser right", "upgrade station right"];

	buildingPlacer = new BuildingPlacer();
	selectionRectObject = new RygameObject(0, 0, 0, 0, null, gameLayer);
	tileSelectedGraphic = new TileSelectedGraphic();

	// some variables need to be given an initial value as resetting them is more complex; init them here
	terrain = [];
	buildings = [];
	buildingSites = [];
	raiders = new ObjectGroup();
	vehicles = new ObjectGroup();
	collectables = new ObjectGroup();
	dynamiteInstances = new ObjectGroup();

	goToMenu("Menu1");
}

/**
 * determine the level score from 0-100 based off off several factors, including resources collected, oxygen remaining, and time taken
 * @returns number the calculated level score
 */
function calculateLevelScore() {
	return Math.round(100 * Math.min(1, (RockRaiders.rightPanel.resources.ore / 30) * .5 + (RockRaiders.rightPanel.resources.crystal / 5) * .5));
}

/**
 * update the level dict and local storage var for the current level to reflect the player's highest score
 * @param score: the newly achieved level score (may or may not be the all-time high-score)
 * @param levelKey: Optional name to set level score, defaults to current level
 */
function setLevelScore(score, levelKey) {
	const prevScore = getValue(levelKey, null);
	if (prevScore == null || prevScore < score) {
		setValue(levelKey, score);
	}
}

function getLevelScore(levelKey) {
	return getValue(levelKey, null);
}

/**
 * switch to the score-screen layer
 */
function showScoreScreen(missionState) {
	// lets be fair and stop the timer first
	const timeElapsedMs = new Date() - RockRaiders.levelStartTime;
	// TODO gather all data for score calculation
	let payedCrystals = 0;
	let payedOres = 0;
	for (let c = 0; c < buildings.length; c++) {
		const requiredResources = buildings[c].requiredResources;
		if (!requiredResources) continue;
		payedCrystals += requiredResources.crystal;
		payedOres += requiredResources.ore; // TODO minus start buildings from olList?!
	}
	const levelConf = RockRaiders.levelConf[RockRaiders.currentLevelKey];
	const maxCrystals = RockRaiders.rightPanel.neededCrystals !== 0 ? RockRaiders.rightPanel.neededCrystals : levelConf.numOfCrystals;
	const percentCrystals = Math.min((RockRaiders.rightPanel.resources.crystal + payedCrystals) * 100 / maxCrystals, 100);
	const percentOres = (RockRaiders.rightPanel.resources.ore + payedOres) * 100 / levelConf.numOfOres;
	let remainingDigables = 0;
	for (let x = 0; x < terrain.length; x++) {
		for (let y = 0; y < terrain[x].length; y++) {
			const space = terrain[x][y];
			remainingDigables += ((space.drillDummy && !space.drillDummy.dead) || (space.dynamiteDummy && !space.dynamiteDummy.dead)) ? 1 : 0;
		}
	}
	const percentDigable = 100 - remainingDigables * 100 / levelConf.numOfDigables;
	const percentRaiders = Math.min(100, raiders.size() * 100 / 9);
	// tidy up game layer
	for (let c = 0; c < raiders.size(); c++) {
		const raider = raiders.objectList[c]; // list might have changed when the timeout function is called
		setTimeout(() => raider.die(), randomInt(0, 3000));
	}
	// FIXME remove buildings with teleport up sequence
	// for (let c = 0; c < buildings.length; c++) {
	// 	const building = buildings[c]; // list might have changed when the timeout function is called
	// 	setTimeout(() => building.die(), randomInt(1, 500));
	// }
	// show score screen after some timeout
	setTimeout(() => {
		goToMenu("Reward");
		musicPlayer.changeTrack("score screen");
		stopAllSounds();
		if (!GameManager.devMode) {
			unblockPageExit();
		}
		let levelScore = 0;
		if (missionState === "completed") {
			levelScore = calculateLevelScore();
			setLevelScore(levelScore, RockRaiders.currentLevelKey);
		}
		scoreScreenLayer.setValues(missionState, levelConf["FullName"], percentCrystals, percentOres, percentDigable, buildings.length, 0, percentRaiders, 0, 100, timeElapsedMs, levelScore);
		if (missionState === "completed") {
			scoreScreenLayer.startReveal();
		} else {
			scoreScreenLayer.showAll();
		}
	}, 6000);
}

/**
 * open menu according to current selection
 */
function checkSelectionMenu() {
	if (selectionType === "raider") {
		changeIconPanel(RockRaiders.raiderIconPanel);
	} else if (["dirt", "loose rock", "hard rock", "ore seam", "energy crystal seam"].includes(selectionType)) {
		changeIconPanel(RockRaiders.wallIconPanel);
	} else if (selectionType === "ground") {
		changeIconPanel(RockRaiders.groundIconPanel);
	} else if (selectionType === "power path") {
		changeIconPanel(RockRaiders.powerPathIconPanel);
	} else if (["rubble 1", "rubble 2", "rubble 3", "rubble 4"].includes(selectionType)) {
		changeIconPanel(RockRaiders.rubbleIconPanel);
	} else if (["tool store", "teleport pad", "power station", "docks", "geological center", "support station",
		"super teleport", "mining laser", "upgrade station", "ore refinery"].includes(selectionType)) {
		changeIconPanel(RockRaiders.buildingIconPanel);
	} else if (selectionType === "building site") {
		changeIconPanel(RockRaiders.buildingSiteIconPanel);
	} else if (selectionType) {
		changeIconPanel();
		console.log(selectionType);
	}
}

/**
 * main update loop: update the current layer and any non-automatic objects
 */
function update() {
	// update is usually not called for layers, do it manually for now
	if (scoreScreenLayer.active) {
		scoreScreenLayer.update();
	}

	if (levelSelectLayer.active) {
		applyLevelSelectScrolling();
	}

	// menu update
	if (menuLayer.active) {
		// update objects
		GameManager.updateObjects();

		// inital render; draw all rygame objects
		GameManager.drawFrame();
	}

	// game update
	else if (gameLayer.active) {
		if (awaitingStart) {
			// enter key pressed
			if (GameManager.keyStates[String.fromCharCode(13)] || GameManager.keyStates[" "] || GameManager.mouseReleasedLeft) {
				awaitingStart = false;
			}
		} else {
			checkTogglePause();
			// freeze some layers and all objects on them when paused
			gameLayer.frozen = RockRaiders.paused;
			uiLayer.frozen = RockRaiders.paused;
			if (!RockRaiders.paused) {
				// update input
				checkScrollScreen();
				if (!buildingPlacer.visible) {
					if (!mouseOverGUI()) {
						checkUpdateClickSelection();
						checkAssignSelectionTask();
					}
					checkUpdateMouseSelect();
					checkUpdateSelectionType();
				}
				// update objects
				GameManager.updateObjects();

				// update object sound volumes based on distance from camera
				updateObjectSoundPositions();

				// don't update buttons when buildingPlacer is active
				if (!buildingPlacer.visible) {
					checkSelectionMenu();
					RockRaiders.activeIconPanel.buttons.update();
				}
			} else {
				// still update objects (or at least the unfrozen pause layer)
				GameManager.updateObjects();
			}
			RockRaiders.levelConf[RockRaiders.currentLevelKey].NerpRunner.execute();
		}

		// pre-render; nothing to do here now that camera can no longer go out of bounds
		// inital render; draw all rygame objects
		GameManager.drawFrame();
		// post render; draw effects and UI
		drawRaiderInfo();
		drawSelectionBox();
		drawSelectedSquares();
		// render debug info
		if (debug) {
			highlightRaiderPaths();
			drawSelectedRects();
			drawTerrainVars(["speedModifier"]);
		}
		drawDynamiteTimers();
		drawBuildingSiteMaterials();
		drawRaiderTasks();
		drawAwaitingStartInstructions();
	}
	GameManager.mouseWheel = 0;
}

// to instant load a level append ?devmode=true&level=Level03 to the URL
GameManager.devMode = getUrlParamCaseInsensitive("devmode", true) === "true";
let levelFromUrl = getUrlParamCaseInsensitive("level");

// init rygame before we start the game
GameManager.initializeRygame(0);

RockRaiders = new RockRaidersGame();

if (GameManager.devMode) {
	if (levelFromUrl) {
		resetLevelVars(levelFromUrl);
		awaitingStart = false;
	}
}

_intervalId = setInterval(update, 1000 / GameManager.fps); // set refresh rate to desired fps