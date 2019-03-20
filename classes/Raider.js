makeChild("Raider", "RygameObject");

/**
 * select the closest building of the input type. if resourceTypeNeeded is specified, ignore buildings which do not require this resource type.
 * @param buildingType: the type of building to search for
 * @param resourceTypeNeeded: optional flag; if included, the returned building must need a resource of the specified type.
 * @returns the nearest building satisfying the requested type and resource needed, or null if no such building is found.
 */
Raider.prototype.chooseClosestBuilding = function (buildingType, resourceTypeNeeded) {
	const buildingList = (buildingType === "building site" ? buildingSites : buildings);
	let destinationSites = [];
	// compile all buildings of type buildingType, then find the closest one
	for (let i = 0; i < buildingList.length; i++) {
		// ignore buildings that have not been touched (though this is unlikely to be a possible occurence)
		if (buildingList[i].type === buildingType && buildingList[i].touched === true) {
			// if we're looking to place a resource, check if the building site needs it
			if (resourceTypeNeeded == null || buildingList[i].resourceNeeded(resourceTypeNeeded)) {
				destinationSites.push(buildingList[i]);
			}
		}
	}
	// generate a list of buildings of type buildingType, then choose the closest one depending on pathfinding
	let shortestPathLength = -1;
	let shortestStartDistance = -1;
	let nearestBuilding = null;

	for (let i = 0; i < destinationSites.length; ++i) {
		const currentPath = findClosestStartPath(this, calculatePath(terrain, this.space,
			typeof destinationSites[i].space == "undefined" ? destinationSites[i] : destinationSites[i].space, true));
		if (currentPath == null || currentPath.length === 0) {
			continue;
		}
		const currentLength = currentPath.length;
		const currentStartDistance = getDistance(this.centerX, this.centerY, currentPath[currentPath.length - 1].centerX(), currentPath[currentPath.length - 1].centerY());
		if (shortestPathLength === -1 || currentLength < shortestPathLength || currentLength === shortestPathLength && currentStartDistance < shortestStartDistance) {
			shortestPathLength = currentLength;
			shortestStartDistance = currentStartDistance;
			nearestBuilding = destinationSites[i];
		}
	}
	return nearestBuilding;
};

/**
 * check for a closer resource that is quivalent to our active task on the current path. If found, change the active task to point to the new resource.
 * @param removeCurrentTask: whether the current task should be removed from tasksInProgress and returned to tasksAvailable (true) or forgotten (false).
 * @returns boolean whether a closer resource was found and made our new active task (true) or not (false)
 */
Raider.prototype.checkChooseCloserEquivalentResource = function (removeCurrentTask) {
	const currentTaskType = this.getTaskType(this.currentTask);
	if (!(currentTaskType === "collect" && this.holding.length === 0)) {
		return false;
	}
	if (removeCurrentTask == null) {
		removeCurrentTask = true;
	}
	let closestDistance = -1;
	let closestObject = null;
	let closestIndex = -1;
	const centerX = this.centerX();
	const centerY = this.centerY();
	let curCheckSpace = this.space;
	// check current space, as well as one space forward on the path
	for (let r = 0; r < 2; ++r) {
		for (let i = 0; i < curCheckSpace.contains.objectList.length; ++i) {
			if (this.getTaskType(curCheckSpace.contains.objectList[i]) === currentTaskType) {
				// look for resources on the next space, not the current space
				const newIndex = tasksAvailable.indexOf(curCheckSpace.contains.objectList[i]);
				// only check this resource if it is in tasksAvailable (meaning we can't steal tasks from other raiders)
				if (newIndex !== -1) {
					// only consider this resource if its the same type as our current task resource
					if (curCheckSpace.contains.objectList[i].type === this.currentTask.type) {
						const distance = getDistance(centerX, centerY, curCheckSpace.contains.objectList[i].centerX(), curCheckSpace.contains.objectList[i].centerY());
						if (closestObject == null || distance < closestDistance) {
							closestDistance = distance;
							closestObject = curCheckSpace.contains.objectList[i];
							closestIndex = newIndex;
						}
					}
				}
			}
		}
		curCheckSpace = this.currentPath[this.currentPath.length - 1];
	}

	// switch tasks to the closest object of the same type on this space
	if (closestObject != null) {
		// change tasks
		if (removeCurrentTask) {
			tasksInProgress.remove(this.currentTask);
			tasksAvailable.push(this.currentTask);
		}

		this.currentTask = closestObject;
		tasksAvailable.splice(closestIndex, 1);
		tasksInProgress.push(this.currentTask);
		// technically we no longer need the path at all, but without it the walk speed check will complain
		this.currentPath = this.currentPath.splice(-1, 1);
		this.currentObjective = this.currentTask;
		// reset task priority once assigned
		this.currentTask.taskPriority = 0;
		return true;
	}
	return false;
};

/**
 * set the current task, updating the objective and path, and moving the task from tasksAvailable to tasksInProgress
 * @param taskIndex: the index of the desired task in tasksAvailable
 * @param path: the path to take to reach the desired task
 * @param initialObjective: if specified, perform this objective as a prerequisite to performing the new task
 * @param keepTask: whether the new task should remain in tasksAvailable (true) or be removed (false)
 */
Raider.prototype.setTask = function (taskIndex, path, initialObjective, keepTask) {
	this.currentTask = tasksAvailable[taskIndex];
	if (!keepTask) {
		tasksAvailable.splice(taskIndex, 1);
	}
	if (tasksInProgress.objectList.indexOf(this.currentTask) === -1) {
		tasksInProgress.push(this.currentTask);
	}
	if (initialObjective != null) {
		this.currentObjective = initialObjective;
		this.currentPath = findClosestStartPath(this, calculatePath(terrain, this.space,
			typeof initialObjective.space == "undefined" ? initialObjective : initialObjective.space, true));
	} else {
		this.currentObjective = this.currentTask;
		this.currentPath = path;
	}
	// reset task priority once assigned
	this.currentTask.taskPriority = 0;
};

/**
 * determine whether or not we can perform a task with any of this space's contents
 * @param space: the space whose contents we should check for tasks to perform
 * @param ignoreAutomation: whether we should accept a task regardless of whether or not it can be automated (true) or not (false)
 * @param ignoreContents: whether we should search this task's contents (true) or simply return false (false)
 * @returns boolean whether we can perform one of this space's contained tasks (true) or not (false)
 */
Raider.prototype.canPerformSpaceContains = function (space, ignoreAutomation, ignoreContents) {
	if (ignoreContents || space.contains == null) {
		return false;
	}
	for (let i = 0; i < space.contains.objectList.length; ++i) {
		const newIndex = tasksAvailable.indexOf(space.contains.objectList[i]);
		// make sure this task is available before proceeding
		if (newIndex !== -1) {
			return this.canPerformTask(space.contains.objectList[i], false, true);
		}
	}
};

/**
 * determine whether or not we can perform a task with any of this space's dummies
 * @param space: the space whose dummies we should check for tasks to perform
 * @param ignoreAutomation: whether we should accept a task regardless of whether or not it can be automated (true) or not (false)
 * @param ignoreContents: whether we should search this task's contents (true) or simply return false (false)
 * @returns boolean whether we can perform one of this space's dummies (true) or not (false)
 */
Raider.prototype.canPerformTaskDummies = function (space, ignoreAutomation, ignoreContents) {
	if (ignoreContents || space.reinforceDummy == null) {
		return false;
	}
	const newIndex = tasksAvailable.indexOf(space.reinforceDummy);
	// make sure this task is available before proceeding
	if (newIndex !== -1) {
		return this.canPerformTask(space.reinforceDummy, false, true);
	}
};

/**
 * check if we have the tool needed for this task, or if our vehicle has the tool needed
 * @param inTaskType: the type of task for which we wish to know whether or not we have the correct tool
 * @returns boolean whether we possess whatever tool is necessary for the input task (true) or not (false)
 */
Raider.prototype.haveTool = function (inTaskType) {
	if (toolsRequired[inTaskType] === undefined) {
		return true;
	}
	if (this.vehicle != null) {
		return inTaskType === "drill" ? this.vehicle.canDrill :
			(inTaskType === "sweep" ? this.vehicle.canSweep : (inTaskType === "drill hard" && this.vehicle.canDrillHard));
	}
	return this.tools.indexOf(toolsRequired[inTaskType]) !== -1;
};

/**
 * exit the current vehicle, if we are in one
 */
Raider.prototype.exitVehicle = function () {
	if (this.vehicle != null) {
		tasksAvailable.push(this.vehicle);
		this.vehicle = null;
	}
};

/**
 * determine whether or not we can perform the input task, or one of its contents if it's a space
 * @param task: the desired task to check. If this is a space, we will also check its contents
 * @param ignoreAutomation
 * @param ignoreContents: whether we should skip this task's contents (true) or check them (false).
 * ignoreContents allows us to avoid infinitely recursing when checking the task's contains or dummies.
 * @returns boolean whether we can perform this task or one of its contained tasks or dummies (true) or not (false)
 */
Raider.prototype.canPerformTask = function (task, ignoreAutomation, ignoreContents) {
	// make sure the fact that we are in a vehicle won't stop us
	if (this.vehicleInhibitsTask(taskType(task))) {
		return this.canPerformSpaceContains(task, ignoreAutomation, ignoreContents) || this.canPerformTaskDummies(task, ignoreAutomation, ignoreContents);
	}
	if (!ignoreAutomation) {
		// if the input task is not a valid task and none of its contents (if it is a space) are a task, return false
		if (tasksAvailable.indexOf(task) === -1) {
			// check if the task is a space and any of its contents are a task before returning false
			return this.canPerformSpaceContains(task, ignoreAutomation, ignoreContents) || this.canPerformTaskDummies(task, ignoreAutomation, ignoreContents);
		}

		// if the input task is a task that cannot be automated, return false
		if (!tasksAutomated[taskType(task)]) {
			return this.canPerformSpaceContains(task, ignoreAutomation, ignoreContents) || this.canPerformTaskDummies(task, ignoreAutomation, ignoreContents);
		}
	}

	// if the input task is a vehicle, make sure we aren't already in one
	if (taskType(task) === "vehicle" && this.vehicle != null) {
		return this.canPerformSpaceContains(task, ignoreAutomation, ignoreContents) || this.canPerformTaskDummies(task, ignoreAutomation, ignoreContents);
	}

	// if the input task requires a tool that we don't have, return false
	if (!this.haveTool(taskType(task))) {
		return this.canPerformSpaceContains(task, ignoreAutomation, ignoreContents) || this.canPerformTaskDummies(task, ignoreAutomation, ignoreContents);
	}
	// if the task is of type 'drill' and we are in a vehicle, make sure the vehicle has a drill
	if (taskType(task) === "drill" && !(this.vehicle == null || this.vehicle.canDrill)) {
		return this.canPerformSpaceContains(task, ignoreAutomation, ignoreContents) || this.canPerformTaskDummies(task, ignoreAutomation, ignoreContents);
	}
	// if the task is of type 'drill hard' and we are in a vehicle, make sure the vehicle has a drill
	if (taskType(task) === "drill hard" && !(this.vehicle == null || this.vehicle.canDrillHard)) {
		return this.canPerformSpaceContains(task, ignoreAutomation, ignoreContents) || this.canPerformTaskDummies(task, ignoreAutomation, ignoreContents);
	}

	// if the task is of type 'sweep' and we are in a vehicle, make sure the vehicle has a shovel
	if (taskType(task) === "sweep" && !(this.vehicle == null || this.vehicle.canSweep)) {
		return this.canPerformSpaceContains(task, ignoreAutomation, ignoreContents) || this.canPerformTaskDummies(task, ignoreAutomation, ignoreContents);
	}

	// if the input task is a building site and we don't have a tool store that we can path to or don't have any of the required resources, return false
	if (taskType(task) === "build") {
		const destinationSite = this.chooseClosestBuilding("tool store");
		// if there's no path to a tool store to get a resource with which to build, move on to the next high priority task
		if (destinationSite == null) {
			return this.canPerformSpaceContains(task, ignoreAutomation, ignoreContents) || this.canPerformTaskDummies(task, ignoreAutomation, ignoreContents);
		}
		// if there is no resource in the tool store that is needed by the building site, return false
		const dedicatedResourceTypes = Object.getOwnPropertyNames(task.dedicatedResources);
		for (let i = 0; i < dedicatedResourceTypes.length; i++) {
			// a resource that we have in the tool store is required by this site
			if (task.resourceNeeded(dedicatedResourceTypes[i]) && resourceAvailable(dedicatedResourceTypes[i])) {
				return true;
			}
		}
		// no resource in the tool store is required by this site
		return this.canPerformSpaceContains(task, ignoreAutomation, ignoreContents) || this.canPerformTaskDummies(task, ignoreAutomation, ignoreContents);
	}
	return true;
};

/**
 * check if we are unable to perform the specified task type due to being in a vehicle without the necessary capabilities
 * @param taskType: the type of task to check
 * @returns boolean whether we are inhibited from performing this task type due to being in a vehicle (true) or not (false)
 */
Raider.prototype.vehicleInhibitsTask = function (taskType) {
	if (this.vehicle == null) {
		return false;
	}
	// for now, all vehicles can collect and build
	if (taskType === "walk" || taskType === "collect" || taskType === "build") {
		return false;
	}
	if (taskType === "sweep") {
		return !this.vehicle.canSweep;
	}
	if (taskType === "drill") {
		return !this.vehicle.canDrill;
	}
	if (taskType === "drill hard") {
		return !this.vehicle.canDrillHard;
	}
	return true;
};

/**
 * attempt to set task to index i of tasksAvailable
 * @param i: the index in tasksAvailable that we wish to choose
 * @param mustBeHighPriority: whether we will only allow a high priority task (true) or any task priority is fine (false)
 * @param calculatedPath: optional path to be used to reach the task; if left null, the path will be calculated here
 * @returns boolean whether the task was set (true) or not (false)
 */
Raider.prototype.checkSetTask = function (i, mustBeHighPriority, calculatedPath) {
	// TODO: raiders will select the first high priority task this way, rather than the nearest one. Should be fixed when implementing automatic task priority order.
	// if this task index is invalid, return now
	if (i === -1) {
		return false;
	}

	// skip any tasks that cannot be performed automatically, unless they are high priority
	if (tasksAvailable[i].taskPriority === 1 || (tasksAutomated[taskType(tasksAvailable[i])] && (mustBeHighPriority !== true))) {
		let newPath = calculatedPath; // if we already calculated a path, don't bother calculating it again
		if (newPath == null) {
			newPath = findClosestStartPath(this, calculatePath(terrain, this.space,
				typeof tasksAvailable[i].space == "undefined" ? tasksAvailable[i] : tasksAvailable[i].space, true));
		}
		// if there's no path to the task, move on to the next high priority task
		if (newPath == null) {
			return false;
		}
		// make sure the fact that we are in a vehicle won't stop us
		if (this.vehicleInhibitsTask(taskType(tasksAvailable[i]))) {
			return false;
		}
		// for building sites, we have to check for a pathable tool store and resources, otherwise we can't do anything
		if (taskType(tasksAvailable[i]) === "build") {
			const destinationSite = this.chooseClosestBuilding("tool store");
			// if there's no path to a tool store to get a resource with which to build, move on to the next high priority task
			if (destinationSite == null) {
				return false;
			}
			// if there is no resource in the tool store that is needed by the building site, move on to the next high priorty task
			const dedicatedResourceTypes = Object.getOwnPropertyNames(tasksAvailable[i].dedicatedResources);
			for (let r = 0; r < dedicatedResourceTypes.length; r++) {
				// resource found! this will be our new task
				if (tasksAvailable[i].resourceNeeded(dedicatedResourceTypes[r]) && resourceAvailable(dedicatedResourceTypes[r])) {
					this.currentObjectiveResourceType = dedicatedResourceTypes[r];
					reservedResources[this.currentObjectiveResourceType]++;
					this.reservingResource = true;
					this.setTask(i, newPath, destinationSite, true);
					return true;
				}
			}
		}
		// for walls to be blown up with dynamite, check for a pathable tool store (same as build)
		else if (taskType(tasksAvailable[i]) === "dynamite") {
			// make sure we can handle explosives
			if (!this.amExplosivesExpert) {
				return false;
			}
			const destinationSite = this.chooseClosestBuilding("tool store");
			// if there's no path to a tool store to get a resource with which to build, move on to the next high priority task
			if (destinationSite == null) {
				return false;
			}
			this.reservingResource = true;
			this.currentObjectiveResourceType = "dynamite";
			this.setTask(i, newPath, destinationSite, false);
			return true;
		}
		// this task is not a building site, check for required tools
		else {
			// check if the task requires a tool and we have it
			if (this.haveTool(taskType(tasksAvailable[i]))) {
				this.setTask(i, newPath);
				return true;
			}
			// check if the task requires a tool and we can take it
			const maxTools = 2 + this.upgradeLevel;
			if (this.tools.length < maxTools && !this.vehicleInhibitsTask("get tool")) {
				const destinationSite = pathToClosestBuilding(this, "tool store");
				// if there's no path to a tool store to get a resource with which to build, move on to the next high priority task
				if (destinationSite != null) {
					// set original task so no other takes it
					this.setTask(i, newPath, null, true);
					// override task with gettool task
					this.currentTask = destinationSite[0];
					this.currentPath = destinationSite;
					this.currentObjective = this.currentTask;
					this.getToolName = toolsRequired[taskType(tasksAvailable[i])];
					return true;
				}
			}
		}
	}
	return false;
};

/**
 * check for a new task to choose, first exhausting high priority tasks, then sweeping out across all reachable spaces
 */
Raider.prototype.checkChooseNewTask = function () {
	// search for a high priority task first
	for (let i = 0; i < tasksAvailable.length; ++i) {
		if (this.checkSetTask(i, true)) {
			return;
		}
	}
	// no high priority task found, do a breadth first search to find the nearest available task, if at least one exists
	if (tasksAvailable.length > 0) {
		const newTaskPath = findClosestStartPath(this, calculatePath(terrain, this.space, null, true, this));
		if (newTaskPath != null) {
			// we found a path to a valid task; determine what task type the destination is and assign it along with the path
			if (!this.checkSetTask(tasksAvailable.indexOf(newTaskPath[0]), false, newTaskPath)) { // paths are reversed, so the 0th index should be the end
				// if we were unable to set the task, that means the pathfinding task search must have been pointing to one of the space's contains instead
				if (newTaskPath[0].contains != null) {
					// if it is indeed a space, check each of its contains to see if one of them is a valid path
					for (let i = 0; i < newTaskPath[0].contains.objectList.length; ++i) {
						const newIndex = tasksAvailable.indexOf(newTaskPath[0].contains.objectList[i]);
						// make sure this task is available before proceeding
						if (newIndex !== -1) {
							// if we are able to set the task to this contains, we can return early
							if (this.checkSetTask(tasksAvailable.indexOf(newTaskPath[0].contains.objectList[i]), false, newTaskPath)) {
								return;
							}
						}
					}
				}
			}
		}
	}
};

/**
 * find a building site or toolstore to which we can bring our currently held resource
 */
Raider.prototype.attemptSelectResourceLocation = function () {
	let destinationSite = this.chooseClosestBuilding("building site", this.holding[0].type);
	if (destinationSite != null) {
		this.currentObjective = destinationSite;
		this.currentTask = this.holding[this.holding.length - 1];
		// adjust dedicated resource number since we have elected to take our resource to this building site
		destinationSite.dedicatedResources[this.holding[0].type]++;
		this.dedicatingResource = true;
	} else {
		destinationSite = this.chooseClosestBuilding("tool store");
		if (destinationSite != null) {
			this.currentObjective = destinationSite;
			this.currentTask = this.holding[this.holding.length - 1];
		} else {
			// nowhere to bring the resource, so wait for a place to bring the resource to appear
		}
	}

	if (this.currentObjective !== this.currentTask) {
		const newPath = findClosestStartPath(this, calculatePath(terrain, this.space, this.currentObjective, true));
		if (newPath != null) {
			this.currentPath = newPath;
			this.busy = false;
			if (this.currentObjective.type === "building site") {
				this.currentTask = this.currentObjective;
			}
		} else {
			this.currentObjective = this.currentTask;
		}
	}
};

/**
 * clear task for all raiders working on the just completed task, including tasks that were affected by a chain reaction
 */
Raider.prototype.updateCompletedBy = function () {
	this.tasksToClear.push(this.currentObjective);
	for (let i = 0; i < raiders.objectList.length; ++i) {
		if (raiders.objectList[i] === this) {
			continue;
		}
		if (this.tasksToClear.indexOf(raiders.objectList[i].currentObjective) !== -1) {
			raiders.objectList[i].clearTask();
		}
	}
	this.tasksToClear = [];
};

/**
 * update this Raider instance. Checks for a new task if none is currently active,
 * otherwise updates the current task, moving on a path or performing an action.
 */
Raider.prototype.update = function () {
	// if we are on a space that has no been touched yet, do nothing
	if (!this.space.touched) {
		return;
	}

	// stop task immediately if the current objective is dead (eg. dynamite or reinforce dummy post-drilling)
	if (this.currentObjective != null && this.currentObjective.dead) {
		this.clearTask();
	}
	// if we are of taskType "build" make sure our job hasn't been taken by somebody else closer to the building site
	// note that optionally allowing 'undefined' rather than build here should likely be unnecessary
	if ((this.getTaskType(this.currentTask) === "build" || this.getTaskType(this.currentTask) === "undefined") &&
		this.reservingResource && (!(this.currentTask.dedicatedResources[this.currentObjectiveResourceType] <
			this.currentTask.requiredResources[this.currentObjectiveResourceType]))) {
		this.clearTask();
	}
	if ((selection.indexOf(this) !== -1) && (this.currentTask == null)) { // don't start a new task if currently selected unless instructed to
		return;
	}

	// attempt to choose a new task, if we are currently free
	if (this.currentTask == null) {
		if (this.holding.length !== 0) {
			// if we are holding something, check for a building site. if there are none pathable, check for a toolstore
			this.attemptSelectResourceLocation();
		} else {
			// not holding anything; attempt to choose a new task
			this.checkChooseNewTask();
		}
	}

	// if we were unable to choose a new task, nothing left to do
	if (this.currentTask == null) {
		return;
	}
	this.workOnCurrentTask();
};

/**
 * move the input object to our hands with a 1 pixel level of precision, so we can pick it up
 * @param moveObject: the object to be moved to our hands
 */
Raider.prototype.moveObjectToHands = function (moveObject) {
	moveObject.setCenterX(this.centerX());
	moveObject.setCenterY(this.centerY());
	const pointDir = getAngle(moveObject.centerX(), moveObject.centerY(), this.currentObjective.centerX(), this.currentObjective.centerY());
	const currentX = moveObject.x;
	const currentY = moveObject.y;
	moveObject.moveDirection(pointDir, 3);
	const oldX = moveObject.x;
	const oldY = moveObject.y;
	moveObject.x = currentX;
	moveObject.y = currentY;
	moveObject.moveOutsideCollision(this, oldX, oldY);
};

/**
 * move on the current path and update distanceTraveled.
 * Also check for a closer available resource of the current type if we move onto a new space.
 */
Raider.prototype.moveOnPath = function () {
	const distanceToPoint = getDistance(this.centerX(), this.centerY(), this.currentPath[this.currentPath.length - 1].centerX(), this.currentPath[this.currentPath.length - 1].centerY());
	if (this.moveTowardsPoint(this.currentPath[this.currentPath.length - 1].centerX(), this.currentPath[this.currentPath.length - 1].centerY(), this.distanceTraveled, true)) {
		this.distanceTraveled -= distanceToPoint;
		this.space = this.currentPath.pop();
		// if the final space is walkable we still check for closer resources as multiple resources may exist on a single walkable space
		if (this.holding.length === 0 && (this.currentPath.length > 1 || (this.currentPath[0].walkable === true && this.currentPath[0].contains.objectList.length > 1))) {
			if (this.checkChooseCloserEquivalentResource()) {
				this.choseCloserResource = true;
			}
		}
	} else {
		this.distanceTraveled = 0;
	}
};

/**
 * continue working on the current task (this means pathing towards the objective, or performing some kind of action)
 */
Raider.prototype.workOnCurrentTask = function () {
	// note that speedModifier needs to be updated each frame so don't bother storing it as an instance variable
	// may change this if animations are later implemented based on speed modifier and occur in a different method
	let speedModifier;
	let freezeAngle = false;
	this.distanceTraveled = this.speed;
	this.choseCloserResource = false;

	// main loop: if we only move part of our maximum movement for a frame, this simply repeats
	while (this.distanceTraveled > 0) {
		// if currentPath is null, there is no way to get to the current task
		if (this.currentPath == null) {
			console.log("No path found to current task! am I stuck?");
			break;
		}
		// we are only on the current space
		speedModifier = this.space.speedModifier;
		if (collisionRect(this, this.currentPath[this.currentPath.length - 1])) {
			if (!collisionRect(this, this.space)) {
				// we are only on the next space
				speedModifier = this.currentPath[this.currentPath.length - 1].speedModifier;
			} else {
				// we are on both spaces; choose slowest speed
				speedModifier = Math.min(this.space.speedModifier, this.currentPath[this.currentPath.length - 1].speedModifier);
			}
		}
		if (this.vehicle != null) {
			speedModifier = this.vehicle.speedModifier;
		}
		this.distanceTraveled *= speedModifier;
		// if there's currently a path, move towards the next position, and potentially choose a closer equivalent resource as the current task
		if (this.currentPath.length > 1) {
			this.moveOnPath();
			if (this.choseCloserResource) {
				break;
			}
		}
		// if we have reached the end of the path or have no path move directly towards the current objective
		else {
			let reachedObjective = false;
			let collisionReached = false;
			const taskType = this.getTaskType(this.currentTask);
			// TODO: actions should opreate in sub-methods, eliminating the need for this.busy
			if (!this.busy) {
				// if we have taskType 'sweep' we need to keep moving until reachedObjective is true
				if ((!(taskType === "sweep" || taskType === "walk" || taskType === "build" ||
					(taskType === "collect" && this.currentObjective.buildable === true))) &&
					collisionRect(this, this.currentObjective, true)) {
					collisionReached = true;
				} else {
					reachedObjective = this.moveTowardsPoint(this.currentObjective.centerX(), this.currentObjective.centerY(), this.distanceTraveled, true);
					if (reachedObjective && taskType === "walk") {
						// make sure we don't drop what we're holding
						const heldObject = this.holding;
						this.clearTask();
						for (let h = 0; h < heldObject.length; ++h) {
							this.holding.push(heldObject[h]);
						}
						break;
					}
				}
			}
			// set distaneTraveled to 0 now as we are stopping to pick up the objective, and won't be moving any more
			this.distanceTraveled = 0;
			if (this.busy || collisionReached || collisionRect(this, this.currentObjective, true)) {
				if (!this.busy) {
					if ((taskType === "collect" && this.currentObjective.buildable !== true) || taskType === "drill" ||
						taskType === "drill hard" || taskType === "reinforce" || taskType === "get tool") {
						// if we didnt move yet and are just moving to suddenly get out of a collision that is occurring, we want to preserve our angle
						if (this.samePosition(this.x, this.y, this.xPrevious, this.yPrevious)) {
							freezeAngle = true;
						}
						this.moveOutsideCollision(this.currentObjective, this.xPrevious, this.yPrevious);

					}
				}

				if (taskType === "vehicle") {
					this.vehicle = this.currentObjective;
					this.setCenterX(this.vehicle.centerX());
					this.setCenterY(this.vehicle.centerY());
					this.drawAngle = this.vehicle.drawAngle;
					freezeAngle = true;
					this.clearTask();
				}

				if (taskType === "dynamite") {
					if (this.currentObjective !== this.currentTask) {
						if ((this.busy) || (this.reservingResource)) {
							if (!this.busy) {
								this.reservingResource = false;
								const newDynamite = new Dynamite(this.currentObjective);
								this.moveObjectToHands(newDynamite);
								this.currentObjective = newDynamite;
								collectables.push(this.currentObjective);
							}
							if (this.currentTask != null) {
								this.currentObjective.grabPercent += this.grabSpeed;
								this.busy = true;
								if (this.currentObjective.grabPercent >= 100) {
									this.currentObjective.grabPercent = 100;
									this.setHolding(this.currentObjective);
									this.currentObjective = this.currentTask;
									this.currentPath = findClosestStartPath(this, calculatePath(terrain, this.space, this.currentObjective.space, true));
								}
							}
						}
					}
					// current objective == current task, meaning we have picked up the resource
					// TODO: a good portion of this is copied from the "collect" case
					else {
						if (this.busy === true || collisionReached === true) {
							this.holding[0].grabPercent -= this.dropSpeed; // no need to have a separate variable for this, grabPercent works nicely
							this.busy = true;
							if (this.holding[0].grabPercent <= 0) {
								this.holding[0].ignite(this.currentObjective.space);
								this.clearTask();
							}
						}
					}
				} else if (taskType === "build") {
					if (this.currentObjective !== this.currentTask) {
						if ((this.busy) || (this.reservingResource)) {
							if (!this.busy) {
								this.reservingResource = false;
								reservedResources[this.currentObjectiveResourceType]--;
								// make sure the player didn't use the remaining collected resource (ie for an upgrade) before we got here
								// although we do reserve a resource from the toolstore as soon as we choose the build task,
								// we do not reserve a spot in the building site until we pick up our resource, to avoid wasting time
								if (this.currentTask.resourceNeeded(this.currentObjectiveResourceType) && collectedResources[this.currentObjectiveResourceType] >= 1) {
									this.currentTask.dedicatedResources[this.currentObjectiveResourceType]++;
									this.dedicatingResource = true;
									collectedResources[this.currentObjectiveResourceType]--;
									const newCollectable = new Collectable(this.currentObjective, this.currentObjectiveResourceType);
									this.moveObjectToHands(newCollectable);
									this.currentObjective = newCollectable;
									collectables.push(this.currentObjective);
								} else {
									this.clearTask();
								}
							}
							if (this.currentTask != null) {
								this.currentObjective.grabPercent += this.grabSpeed;
								this.busy = true;
								if (this.currentObjective.grabPercent >= 100) {
									this.currentObjective.grabPercent = 100;
									this.setHolding(this.currentObjective);
									this.currentObjective = this.currentTask;
									this.currentPath = findClosestStartPath(this, calculatePath(terrain, this.space, this.currentObjective, true));
								}
							}
						}
					}
					// current objective == current task, meaning we have picked up the resource
					// TODO: more repeat code from the "collect" case
					else {
						if (this.busy === true || reachedObjective === true) {
							if (reachedObjective === true) {
								this.space = this.currentTask;
							}
							// no need to have a separate variable for this, grabPercent works nicely
							this.holding[0].grabPercent -= this.dropSpeed;
							this.busy = true;
							if (this.holding[0].grabPercent <= 0) {
								this.playDropSound();
								if (this.currentObjective.type === "building site") {
									this.currentObjective.updatePlacedResources(this.holding[0].type);
								}
								// because this is copied from the "collect" section and we are in the "build" section this condition is possibly unreachable
								else if (this.currentObjective.type === "tool store") {
									collectedResources[this.holding[0].type]++;
								}
								this.dedicatingResource = false;
								this.holding[0].die();
								this.clearTask();
							}
						}
					}
				}

				if (taskType === "get tool") {
					this.grabToolPercent += this.grabToolSpeed;
					if (this.grabToolPercent >= 100) {
						this.tools.unshift(this.getToolName);
						if (this.tools.length > this.maxTools) {
							this.tools.pop();
						}
						this.clearTask();
					}
				} else if (taskType === "upgrade") {
					this.upgradePercent += this.upgradeSpeed;
					if (this.upgradePercent >= 100) {
						// reset upgradePercent after completing an upgrade here, since upgrade percent is preserved when clearing or changing tasks
						this.upgradePercent = 0;
						this.upgrade();
						this.clearTask();
					}
				} else if (taskType === "collect") {
					if (this.currentObjective === this.currentTask) {
						if (this.holding.length === 0) {
							this.currentTask.grabPercent += this.grabSpeed;
							this.busy = true;
							if (this.currentTask.grabPercent >= 100) {
								this.currentTask.grabPercent = 100;
								this.setHolding(this.currentTask);
								this.space = this.currentTask.space;
							}
						}
						if (this.currentTask.grabPercent >= 100) {
							this.attemptSelectResourceLocation();
						}

					} else {
						if (this.busy === true || reachedObjective === true || this.currentObjective.buildable !== true) {
							if (reachedObjective === true) {
								this.space = this.currentTask;
							}
							// no need to have a separate variable for drop percent; grabPercent works nicely
							this.currentTask.grabPercent -= this.dropSpeed;
							this.busy = true;
							if (this.currentTask.grabPercent <= 0) {
								this.playDropSound();
								if (this.currentObjective.type === "building site") {
									this.currentObjective.updatePlacedResources(this.holding[0].type);
								} else if (this.currentObjective.type === "tool store") {
									collectedResources[this.holding[0].type]++;
								}
								this.dedicatingResource = false;
								this.holding[0].die();
								this.clearTask();
							}
						}
					}
				} else if (taskType === "drill" || taskType === "drill hard") {
					this.currentTask.updateDrillPercent(this.drillSpeed * this.currentTask.drillSpeedModifier *
						(this.vehicle == null ? 1 : (taskType === "drill" ? this.vehicle.drillSpeedModifier : this.vehicle.drillHardSpeedModifier)), this.space);
					this.drillSound.play().catch(error => {
					});
					this.busy = true;
					if (this.currentTask.drillPercent >= 100) {
						this.currentTask.drillPercent = 100;
						this.currentTask.makeRubble(true, this);
						this.updateCompletedBy();
						this.clearTask();
					}
				} else if (taskType === "reinforce") {
					this.currentTask.updateReinforcePercent(this.reinforceSpeed * this.currentTask.reinforceSpeedModifier, this);
					this.busy = true;
					if (this.currentTask.reinforcePercent >= 100) {
						this.currentTask.reinforcePercent = 100;
						this.currentTask.reinforce();
						this.updateCompletedBy();
						this.clearTask();
					}
				} else if (taskType === "sweep") {
					if (this.busy === true || reachedObjective === true) {
						if (reachedObjective === true) {
							this.space = this.currentTask;
						}
						this.currentTask.updateSweepPercent(this.sweepSpeed * (this.vehicle == null ? 1 : this.vehicle.sweepSpeedModifier));
						this.sweepSound.play().catch(error => {
						});
						this.busy = true;
						if (this.currentTask.sweepPercent >= 100) {
							this.currentTask.sweepPercent = 100;
							this.currentTask.sweep();
							this.updateCompletedBy();
							this.clearTask();
						}
					}
				}
			}
		}
		this.distanceTraveled /= speedModifier;
	}

	if (!freezeAngle && !this.samePosition(this.x, this.y, this.xPrevious, this.yPrevious)) {
		this.drawAngle = getAngle(this.xPrevious, this.yPrevious, this.x, this.y, true);
	}

	// if holding an object, move it relative to our movement after we have moved
	if (this.holding.length !== 0) {
		for (let h = 0; h < this.holding.length; ++h) {
			this.holding[h].x += (this.x - this.xPrevious);
			this.holding[h].y += (this.y - this.yPrevious);
			this.holding[h].rotateAroundPoint(this.centerX(), this.centerY(), this.drawAngle, this.holding[h].holdingAngleDifference);

		}
	}

	if (this.vehicle != null) {
		this.vehicle.setCenterX(this.centerX());
		this.vehicle.setCenterY(this.centerY());
		this.vehicle.drawAngle = this.drawAngle;
		this.vehicle.space = this.space;
	}
};

/**
 * update held object to input task
 * @param task: the task to which we should set our held object
 */
Raider.prototype.setHolding = function (task) {
	this.busy = false;
	this.holding.push(task);
	task.holdingAngleDifference = task.drawAngle - this.drawAngle;
	// move the newly held object in the reverse direction to cancel out the holding movement since we just picked it up this frame
	task.x -= (this.x - this.xPrevious);
	task.y -= (this.y - this.yPrevious);
	this.updateCompletedBy();
	task.space.contains.remove(this.holding);
};

/**
 * stop all sounds by pausing them and resetting their currentTime to 0
 */
Raider.prototype.stopSounds = function () {
	this.sweepSound.pause();
	this.sweepSound.currentTime = 0;
	this.drillSound.pause();
	this.drillSound.currentTime = 0;
};

/**
 * clear current task, resetting all task related state variables (including this.holding), and updating space to the nearest terrain space
 */
Raider.prototype.clearTask = function () {
	this.stopSounds();
	if (this.reservingResource === true) {
		this.reservingResource = false;
		if (this.currentObjectiveResourceType !== "dynamite") {
			reservedResources[this.currentObjectiveResourceType]--;
		}
	}
	if (this.dedicatingResource === true) {
		this.dedicatingResource = false;
		if (this.holding.length === 0) {
			// this case should never be true, but is in place in case we eventually allow dedicating before picking up a collectable
			this.currentTask.dedicatedResources[this.currentObjectiveResourceType]--;
		} else {
			this.currentObjective.dedicatedResources[this.holding.type]--;
		}
	}
	if (this.currentTask != null && this.getTaskType(this.currentTask) !== "get tool") {
		// reset the task priority since it will otherwise remain high priority in some instances (eg. drill high priority wall --> rubble remains high priority)
		this.currentTask.taskPriority = 0;
		tasksInProgress.remove(this.currentTask);
	}
	this.grabToolPercent = 0;
	this.getToolName = null;
	this.busy = false;
	this.holding = [];
	this.currentObjective = null;
	this.currentTask = null;
	this.currentObjectiveResourceType = null;
	this.currentPath = null;

	this.space = getNearestSpace(terrain, this);
};

/**
 * determine the task type of the input task.
 * refers to taskType in rockRaiders JS file, passing the current raider in for more context-based data
 * @param task: the task whose type we wish to determine
 * @returns string the type of the input task
 */
Raider.prototype.getTaskType = function (task) {
	return taskType(task, this);
};

/**
 * upgrade this raider, increasing its upgradeLevel by 1 as long as it has not reached the max upgrade level
 */
Raider.prototype.upgrade = function () {
	if (this.upgradeLevel < this.maxUpgradeLevel) {
		this.upgradeLevel += 1;
		this.maxTools += 1;
	}
};

/**
 * check whether or not the position at x1,y1 is equivalent to the position at x2,y2
 * @param x1: the first x coordinate
 * @param y1: the first y coordinate
 * @param x2: the second x coordinate
 * @param y2: the second y coordinate
 * @returns whether (x1,y1) is equivalent to (x2,y2) (true) or not (false)
 */
Raider.prototype.samePosition = function (x1, y1, x2, y2) {
	return (x1 === x2 && y1 === y2);
};

/**
 * play a sound when dropping a resource (sound depends on whether the resource is ore or crystal)
 */
Raider.prototype.playDropSound = function () {
	if (this.holding[0].type === "ore") {
		this.dropOreSound.play().catch(error => {
		});
	} else if (this.holding[0].type === "crystal") {
		this.dropCrystalSound.play().catch(error => {
		});
	}
};

/**
 * custom die code: stop sounds and kill children before calling base class die
 */
Raider.prototype.die = function () {
	this.stopSounds();
	this.healthBar.die();
	return RygameObject.prototype.die.call(this);
};

/**
 * hurt this raider based on damageAmount. if hp reaches 0, die.
 * @param damageAmount: how much damage this raider should take
 */
Raider.prototype.hurt = function (damageAmount) {
	this.hp -= damageAmount;
	if (this.hp <= 0) {
		this.die();
	} else {
		this.hurtSound.play().catch(error => {
		});
	}
};

/**
 * Raider constructor: inititalize all properties, sounds, dummies, etc..
 */
function Raider(space) {
	RygameObject.call(this, 0, 0, 1, 1, "raider.png", gameLayer);
	this.space = space;
	this.setCenterX(this.space.centerX());
	this.setCenterY(this.space.centerY());
	this.speed = 4;
	this.drillSpeed = .4;
	this.sweepSpeed = 2;
	this.reinforceSpeed = 1.25;
	this.grabSpeed = 5;
	this.upgradeSpeed = .1;
	this.grabToolSpeed = 20;
	this.dropSpeed = 8;
	this.upgradePercent = 0;
	this.grabToolPercent = 0;
	// raiders by default can only carry 2 tools; each upgrade level increases this limit by one
	this.tools = ["drill"];
	// learned skills
	this.amPilot = true;
	this.amSailor = true;
	this.amDriver = true;
	this.amExplosivesExpert = true;
	this.amGeologist = true;
	this.amEngineer = true;
	this.maxTools = 2;
	this.maxUpgradeLevel = 3;
	// max tools held = 2 + upgradeLevel
	this.upgradeLevel = 0;
	this.currentTask = null;
	this.currentPath = null;
	this.holding = [];
	this.maxHolding = 1;
	this.drawAngle = 0;
	// set reservingResource to true if a resource has been reserved from the toolstore by this raider in case his trip is cancelled for some reason
	this.reservingResource = false;
	this.dedicatingResource = false;
	// name of tool that we are in the process of grabbing
	this.getToolName = null;
	// dummy storing the walkPos
	this.walkPosDummy = new RygameObject(0, 0, -99999, 0, null, this.drawLayer, true, false, true);
	// workaround so the engine treats this dummy as a walkable space when determining what type of task it is
	this.walkPosDummy.walkable = true;
	// busy means the raider is in the middle of performing a task (ex drilling, picking up an object, etc..) and is NOT walking
	this.busy = false;
	this.sweepSound = GameManager.createSound("dig");
	this.sweepSound.loop = true;
	this.drillSound = GameManager.createSound("drtdrillc");
	this.drillSound.loop = true;
	this.dropOreSound = GameManager.createSound("Rockdrop");
	this.dropCrystalSound = GameManager.createSound("Crystaldrop");
	this.hurtSound = GameManager.createSound("hurt1");
	this.soundList = [this.sweepSound, this.drillSound, this.dropOreSound, this.dropCrystalSound, this.hurtSound];
	this.maxHp = 100;
	this.hp = this.maxHp;
	this.vehicle = null;
	this.healthBar = new HealthBar(this);
	// list of tasks affected by this raider's most recent task clear (eg. chain reactions when drilling)
	this.tasksToClear = [];
}