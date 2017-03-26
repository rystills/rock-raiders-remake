makeChild("Raider","RygameObject");
Raider.prototype.chooseClosestBuilding = function(buildingType,resourceTypeNeeded) {
	destinationSites = [];
	destinationSite = null;
	for (var i = 0; i < buildings.length; i++) { //compile all buildings of type buildingType, then find closest one
		if (buildings[i].type == buildingType && buildings[i].touched == true) { //if its not touched yet it is not pathable so dont choose it (this case should be impossible though because buildings that start out in Fog are not added to the buildings list until they are touched)
			if (resourceTypeNeeded == null || buildingSites[i].resourceNeeded(resourceTypeNeeded)) { //if we're looking to place a resource, check if the building site needs it
				destinationSites.push(buildings[i]);
			}
		}
	}
	//generate list of buildings of type buildingType, then choose the closest one depending on pathfinding
	var shortestPathLength = -1;
	var shortestStartDistance = -1;
	var nearestBuilding = null;
	
	for (var i = 0; i < destinationSites.length; ++i) {
		var currentPath = findClosestStartPath(this,calculatePath(terrain,this.space,typeof destinationSites[i].space == "undefined" ? destinationSites[i]: destinationSites[i].space,true));
		if (currentPath == null || currentPath.length == 0) {
			continue;
		}
		var currentLength = currentPath.length;
		var currentStartDistance = getDistance(this.centerX,this.centerY,currentPath[currentPath.length-1].centerX(),currentPath[currentPath.length-1].centerY());
		if (shortestPathLength == -1 || currentLength < shortestPathLength || currentLength == shortestPathLength && currentStartDistance < shortestStartDistance) {
			shortestPathLength = currentLength;
			shortestStartDistance = currentStartDistance;
			nearestBuilding = destinationSites[i];
		}
	}
	return nearestBuilding;
};

Raider.prototype.checkChooseCloserEquivalentResource = function(removeCurrentTask) { //check if a closer equivalent resource is present; return true if switched tasks
	var currentTaskType = this.getTaskType(this.currentTask); //TODO: consider using this function when getting resources from the toolstore as well
	if (!(currentTaskType == "collect" && this.holding == null)) {
		return;
	}
	if (removeCurrentTask == null) {
		removeCurrentTask = true;
	}
	var closestDistance = -1;
	var closestObject = null;
	var closestIndex = -1;
	var centerX = this.centerX();
	var centerY = this.centerY();
	var curCheckSpace = this.space; //check current space, as well as immediate next space
	for (var r = 0; r < 2; ++r) {
		for (var i = 0; i < curCheckSpace.contains.objectList.length; ++i) {	
			if (this.getTaskType(curCheckSpace.contains.objectList[i]) == currentTaskType) {
				var newIndex = tasksAvailable.indexOf(curCheckSpace.contains.objectList[i]); //look for resources on the next space, not the current space
				if (newIndex != -1) { //TODO: CONSIDER WHETHER OR NOT RAIDERS SHOULD BE ALLOWED TO 'STEAL' EACH OTHERS' ACTIVE TASKS
					//only consider this resource if its the same type as our current task resource
					if (curCheckSpace.contains.objectList[i].type == this.currentTask.type) {
						var distance = getDistance(centerX,centerY,curCheckSpace.contains.objectList[i].centerX(),curCheckSpace.contains.objectList[i].centerY());
						if (closestObject == null || distance < closestDistance) {
							closestDistance = distance;
							closestObject = curCheckSpace.contains.objectList[i];
							closestIndex = newIndex;
						}
					}
				}
			}
		}
		curCheckSpace = this.currentPath[this.currentPath.length-1];
	}
	
	if (closestObject != null) { //switch tasks to the closest object of the same type on this space
		//change tasks TODO: CONVERT THIS INTO A METHOD
		//TODO: THIS CREATES RIGID MOVEMENT WHEN CHANGING TASKS. CONSIDER APPROACHING THIS DIFFERENTLY, INCLUDING SETTING THIS.SPACE EARLIER WHEN CHANGING SPACES (may be fixed now that we check one space ahead of us) [should no longer matter as we now update this.space when changing tasks]
		if (removeCurrentTask) {
			tasksInProgress.remove(this.currentTask);
			tasksAvailable.push(this.currentTask);
		}
		
		this.currentTask = closestObject; //TODO: choose the closest task on the space that is of the same type rather than the first one you find
		//tasksAvailable.remove(this.currentTask);
		tasksAvailable.splice(closestIndex, 1);
		tasksInProgress.push(this.currentTask);
		this.currentPath = this.currentPath.splice(-1,1); //technically we no longer need the path at all, but without it the walk speed check will complain
		this.currentObjective = this.currentTask;
		return true;
	}
	return false;
};

//set current task, objective, and path, and remove from tasksAvailable
Raider.prototype.setTask = function(taskIndex, path, initialObjective = null) {
	this.currentTask = tasksAvailable[taskIndex];
	tasksAvailable.splice(taskIndex,1);
	if (initialObjective != null) {
		this.currentObjective = initialObjective;
		this.currentPath = findClosestStartPath(this,calculatePath(terrain,this.space,typeof initialObjective.space == "undefined" ? initialObjective: initialObjective.space,true));
	}
	else {
		this.currentObjective = this.currentTask;
		this.currentPath = path;
	}
}

//determine whether or not the space or one of its contents is a task and the raider can perform it
Raider.prototype.canPerformTask = function(task,ignoreContents) {
	//if the input task is not a valid task and none of its contents (if it is a space) are a task, return false
	if (tasksAvailable.indexOf(task) == -1) {
		//check if the task is a space and any of its contents are a task before returning false
		if ((!ignoreContents) && task.contains != null) {
			for (var i = 0; i < task.contains.objectList.length; ++i) {	
				var newIndex = tasksAvailable.indexOf(task.contains.objectList[i]);
				//make sure this task is available before proceeding
				if (newIndex != -1) {
					return canPerformTask(task.contains.objectList[i],true);
				}
			}
		}
		return false;
		
	}
	//if the input task is a task that cannot be automated, return false
	if (!tasksAutomated[getTaskType(task)]) {
		return false;
	}
	//if the input task requires a tool that we don't have, return false
	if (toolsRequired[getTaskType(tasksAvailable[i])] != undefined && this.tools.indexOf(toolsRequired[this.getTaskType(tasksAvailable[i])]) == -1)  {
		return false;
	}
	//if the input task is a building site and we don't have a tool store that we can path to or don't have any of the required resources, return false
	if (getTaskType(task) == "build") {
		destinationSite = this.chooseClosestBuilding("tool store");
		//if there's no path to a tool store to get a resource with which to build, move on to the next high priority task
		if (destinationSite == null) {
			return false;
		}
		//if there is no resource in the tool store that is needed by the building site, return false
		var dedicatedResourceTypes = Object.getOwnPropertyNames(tasksAvailable[i].dedicatedResources);
		for (var i = 0; i < dedicatedResourceTypes.length; i++) {
			//a resource that we have in the tool store is required by this site
			if (this.currentTask.resourceNeeded(dedicatedResourceTypes[i]) && resourceAvailable(dedicatedResourceTypes[i])) {
				return true;
			}
		}
		//no resource in the tool store is required by this site
		return false;
	}
	return true;
}

//attempt to set task index i, if it passes the checks
Raider.prototype.checkSetTask = function(i,calculatedPath) {
	//skip any tasks that cannot be performed automatically (though these should most likely not be high priority regardless) 
	if (!tasksAutomated[getTaskType(objectList[i])]) {
		return false;
	}
	if (tasksAvailable[i].taskPriority == 1) {
		var newPath = calculatedPath; //if we already calculated a path, don't bother calculating it again
		if (newPath == null) {
			newPath = findClosestStartPath(this,calculatePath(terrain,this.space,typeof tasksAvailable[i].space == "undefined" ? tasksAvailable[i]: tasksAvailable[i].space,true));
		}
		//if there's no path to the task, move on to the next high priority task
		if (newPath == null) {
			return false;
		}
		//for building sites, we have to check for a pathable tool store and resources, otherwise we can't do anything
		if (getTaskType(tasksAvailable[i]) == "build") {
			destinationSite = this.chooseClosestBuilding("tool store");
			//if there's no path to a tool store to get a resource with which to build, move on to the next high priority task
			if (destinationSite == null) {
				return false;
			}
			//if there is no resource in the tool store that is needed by the building site, move on to the next high priorty task
			var dedicatedResourceTypes = Object.getOwnPropertyNames(tasksAvailable[i].dedicatedResources);
			for (var i = 0; i < dedicatedResourceTypes.length; i++) {
				//resource found! this will be our new task
				if (this.currentTask.resourceNeeded(dedicatedResourceTypes[i]) && resourceAvailable(dedicatedResourceTypes[i])) {
					this.currentObjectiveResourceType = dedicatedResourceTypes[i];
					reservedResources[this.currentObjectiveResourceType]++;
					this.reservingResource = true;
					setTask(i,newPath,destinationSite);
					return true;
				}
			}
		}
		//this task is not a building site, check for required tools
		else {
			//check if the task requires a tool and we have it
			if (toolsRequired[getTaskType(tasksAvailable[i])] == undefined || this.tools.indexOf(toolsRequired[this.getTaskType(tasksAvailable[i])]) != -1)  {
				setTask(i,newPath);
				return true;
			}
		}
	}
	return false;
}

//check for a path to any high priority tasks. if none can be pathed to, sweep out until all reachable spaces are exhausted or a completable task is found
Raider.prototype.checkChooseNewTask = function() {
	//search for a high priority task first
	for (var i = 0; i < tasksAvailable.length; ++i) {
		if (checkSetTask(i)) {
			return;
		}
	}
	//no high priority task found, do a breadth first search to find the nearest available task, if at least one exists
	if (tasksAvailable.length > 0) {
		var newTaskPath = findClosestStartPath(this,calculatePath(terrain,this.space,null,true,this));
		if (newTaskPath != null) {
			//we found a path to a valid task; determine what task type the destination is and assign it along with the path
			checkSetTask(tasksAvailable.indexOf(newTaskPath[newTaskPath.length - 1]),newTaskPath);
		}
	}
}

Raider.prototype.update = function() {
	//if we are on a space that has no been touched yet, do nothing
	if (!this.space.touched) {
		return;
	}
	//if we are of taskType "build" make sure our job hasn't been taken by somebody else closer to the building site
	//note that optionally allowing 'undefined' rather than build here should likely be unnecessary
	if ((this.getTaskType(this.currentTask) == "build" || this.getTaskType(this.currentTask) == "undefined") && this.reservingResource && (!(this.currentTask.dedicatedResources[this.currentObjectiveResourceType] < this.currentTask.requiredResources[this.currentObjectiveResourceType]))) {
		this.clearTask();
	}
	for (var i = 0; i < this.completedLastFrame.length; i++) {
		this.completedLastFrame[i].completedBy = null;
	}
	this.completedLastFrame = [];
	if (this.currentTask != null && this.currentTask.completedBy != null) {
		taskCopy = null;
		if (tasksInProgress.objectList.indexOf(this.currentTask) != -1) {
			taskCopy = this.currentTask;
		}
		this.clearTask();
		if (taskCopy != null) {
			tasksInProgress.push(taskCopy);
		}
	}
	if ((selection.indexOf(this) != -1) && (this.currentTask == null)) { //don't start a new task if currently selected unless instructed to
		return;
	}
	
	this.checkChooseNewTask();
	if (this.currentTask == null) {
		return;
	}
	
	//note that speedModifier needs to be updated each frame so don't bother storing it as an instance variable (may change this if animations are later implemented based on speed modifier and occur in a different method)
	var speedModifier; 
	var freezeAngle = false;
	var distanceTraveled = this.speed;
	
	//if currentPath is null, there is no way to get to the current task
	while (distanceTraveled > 0) {
		if (this.currentPath == null) {
			console.log("No path found to current task! am I stuck?");
			break;
		}
		speedModifier = this.space.speedModifier; //we are only on the current space
		if (collisionRect(this,this.currentPath[this.currentPath.length-1])) {
			if (!collisionRect(this,this.space)) {
				speedModifier = this.currentPath[this.currentPath.length-1].speedModifier; //we are only on the next space
			}
			else {
				speedModifier = Math.min(this.space.speedModifier,this.currentPath[this.currentPath.length-1].speedModifier); //we are on both spaces
			}
		}
		distanceTraveled *= speedModifier;
		if (this.currentPath.length > 1) { //if there's currently a path we always move on the path
			var distanceToPoint = getDistance(this.centerX(),this.centerY(),this.currentPath[this.currentPath.length-1].centerX(),this.currentPath[this.currentPath.length-1].centerY()); //TODO: THIS IS INEFFICIENT SINCE WE RECALCULATE THIS DISTANCE IN THE MOVETOWARDSPOINT METHOD! FIND A NICER WAY OF KEEPING TRACK
			if (this.moveTowardsPoint(this.currentPath[this.currentPath.length-1].centerX(),this.currentPath[this.currentPath.length-1].centerY(),distanceTraveled,true)) {
				distanceTraveled -= distanceToPoint;
				this.space = this.currentPath.pop();
				if (this.holding == null && (this.currentPath.length > 1 || (this.currentPath[0].walkable == true && this.currentPath[0].contains.objectList.length > 1))) { //if the final space is walkable we still check for closer resources as multiple resources may exist on a single walkable space. if the space is not walkable then there should only be able to be a single task on that space such as to drill that space
					if (this.checkChooseCloserEquivalentResource()) {
						break;
					}
				}
			}
			else {
				distanceTraveled = 0;
			}
		}
		else { //if we have reached the end of the path or have no path move directly towards the current objective
			var reachedObjective = false;
			var collisionReached = false;
			var taskType = this.getTaskType(this.currentTask); //TODO: STORE THIS RATHER THAN REPEATEDLY FINDING IT
			if (!this.busy) { //TODO: CHANGE ACTIONS TO BE IN A SUBMETHOD SO WE DON'T NEED TO PUT THIS.BUSY ALL OVER THE PLACE
				if ((!(taskType == "sweep" || taskType == "walk" || taskType == "build" || (taskType == "collect" && this.currentObjective.buildable == true))) && collisionRect(this,this.currentObjective,true)) { //if we have taskType 'sweep' we need to keep moving until reachedObjective is true, so don't neglect to move just because we are colliding with the objective in that case
					collisionReached = true;
				}
				else {
					reachedObjective = this.moveTowardsPoint(this.currentObjective.centerX(),this.currentObjective.centerY(),distanceTraveled,true);	
					if (reachedObjective && taskType == "walk") {
						this.clearTask();
						break;
					}
				}
			}
			distanceTraveled = 0; //we are safe setting this to 0 in this case because we don't care how much farther we have to go to get to the objective, since we will stop for at least 1 frame once we reach it to pick it up
			if (this.busy || collisionReached || collisionRect(this,this.currentObjective,true)) {
				if (!this.busy) {
					if ((taskType == "collect" && this.currentObjective.buildable != true) || taskType == "drill" || taskType == "get tool") {
						if (this.samePosition(this.x,this.y,this.xPrevious,this.yPrevious)) {
							freezeAngle = true; //if we didnt move yet and are just moving to suddenly get out of a collision that is occurring we want to preserve our angle
						}
						this.moveOutsideCollision(this.currentObjective,this.xPrevious,this.yPrevious);
						
					}
				}
				if (taskType == "build") {
					if (this.currentObjective != this.currentTask) {
						if ((this.busy) || (this.reservingResource)) {
							if (!this.busy) {
								this.reservingResource = false;
								reservedResources[this.currentObjectiveResourceType]--;
								//collectedResources[this.currentObjectiveResourceType] might get dropped to 0 by the player via an upgrade, so check here to avoid going into the negatives
								if (this.currentTask.resourceNeeded(this.currentObjectiveResourceType) && collectedResources[this.currentObjectiveResourceType] >= 1) { //although we do reserve a resource from the toolstore as soon as we choose the build task, we do not reserve a spot in the building site until we pick up our resource, so its possible for us to arrive at the toolstore only to find that our resource is no longer needed, but that's better than reserving the resource when the build task is initially chosen and then stopping potentially many other raiders from finishing the build site ahead of this raider
									this.currentTask.dedicatedResources[this.currentObjectiveResourceType]++;
									this.dedicatingResource = true;									
									collectedResources[this.currentObjectiveResourceType]--;
									var newCollectable = new Collectable(this.currentObjective,this.currentObjectiveResourceType);
									newCollectable.setCenterX(this.centerX());
									newCollectable.setCenterY(this.centerY());
									var pointDir = getAngle(newCollectable.centerX(),newCollectable.centerY(),this.currentObjective.centerX(),this.currentObjective.centerY());
									var currentX = newCollectable.x;
									var currentY = newCollectable.y;
									newCollectable.moveDirection(pointDir,3);
									var oldX = newCollectable.x;
									var oldY = newCollectable.y;
									newCollectable.x = currentX;
									newCollectable.y = currentY;
									newCollectable.moveOutsideCollision(this,oldX,oldY);									
									this.currentObjective = newCollectable;
									collectables.push(this.currentObjective);
								}
								else {
									this.clearTask();
								}
							}
							if (this.currentTask != null) {
								this.currentObjective.grabPercent += this.grabSpeed;
								this.busy = true;
								if (this.currentObjective.grabPercent >= 100) {
									this.currentObjective.grabPercent = 100;
									this.currentObjective.completedBy = this;
									this.completedLastFrame.push(this.currentObjective);
									this.busy = false;
									this.holding = this.currentObjective;
									this.holdingAngleDifference = this.currentObjective.drawAngle - this.drawAngle;
									this.holding.x -= (this.x-this.xPrevious); //move the newly held object in the reverse direction to cancel out the holding movement since we just picked it up this frame
									this.holding.y -= (this.y-this.yPrevious);
									this.holding.space.contains.remove(this.holding);
									this.currentObjective = this.currentTask;
									this.currentPath = findClosestStartPath(this,calculatePath(terrain,this.space,this.currentObjective,true));
								}
							}
						}
						else {
							//there is no resource in the tool store for us to take, so clear the current task
							//TODO: this should now be an unreachable case due to the addition of reserving resources from the collectedResources dict; verify this and delete this case
							this.clearTask();
						}
					}
					else { //TODO: THIS IS ALL REPEAT CODE COPIED FROM THE "COLLECT" CASE; YOU NEED TO BREAK THIS CODE DOWN INTO SMALLER METHODS AND UTILIZE THEM!
						if (this.busy == true || reachedObjective == true) {
							if (reachedObjective == true) {
								this.space = this.currentTask;
							}
							this.holding.grabPercent -= this.dropSpeed; //no need to have a separate variable for this, grabPercent works nicely
							this.busy = true;
							if (this.holding.grabPercent <= 0) {
								this.playDropSound();
								this.busy = false;
								if (this.currentObjective.type == "building site") {
									this.currentObjective.updatePlacedResources(this.holding.type);	
								}
								else if (this.currentObjective.type == "tool store") { //because this is copied from the "collect" section and we are in the "build" section this condition is possibly unreachable
									collectedResources[this.holding.type]++;
								}
								this.dedicatingResource = false;
								this.holding.die();
								this.clearTask();
							}
						}
						//don't think terrain should be object groups instead of lists because spaces should never be being destroyed, but should still keep this under consideration
					}
				}
				
				if (taskType == "get tool") {
					this.grabToolPercent+=this.grabToolSpeed;
					if (this.grabToolPercent >= 100) {
						this.tools.unshift(this.getToolName);
						if (this.tools.length > this.maxTools) {
							this.tools.pop();
						}
						this.clearTask();
					}
				}
				
				else if (taskType == "upgrade") {
					this.upgradePercent+=this.upgradeSpeed;
					if (this.upgradePercent >= 100) {
						this.upgradePercent = 0; //reset upgradePercent after completing an upgrade here, since upgrade percent is preserved when clearing or changing tasks
						this.upgrade();
						this.clearTask();
					}
				}
				
				else if (taskType == "collect") {
					if (this.currentObjective == this.currentTask) {
						if (this.holding == null) {
							this.currentTask.grabPercent += this.grabSpeed;
							this.busy = true;
							if (this.currentTask.grabPercent >= 100) {
								this.currentTask.grabPercent = 100;
								this.currentObjective.completedBy = this;
								this.completedLastFrame.push(this.currentObjective);
								this.holding = this.currentTask;
								this.holdingAngleDifference = this.currentTask.drawAngle - this.drawAngle;
								this.holding.x -= (this.x-this.xPrevious); //move the newly held object in the reverse direction to cancel out the holding movement since we just picked it up this frame
								this.holding.y -= (this.y-this.yPrevious);
								this.space = this.currentTask.space; //TODO: THIS IS LARGELY REPEAT CODE FROM EARLIER IN THIS METHOD. PUT THIS STUFF INTO ITS OWN SUB METHOD
								this.holding.space.contains.remove(this.holding);
							}
						}
						if (this.currentTask.grabPercent >= 100) {
							destinationSite = this.chooseClosestBuilding("building site",this.holding.type);
							if (destinationSite != null) {
								this.currentObjective = destinationSite;
								//adjust dedicated resource number because we have elected to take our resource to this building site rather than to the tool store, but dont update building's list of secured resources until we actually get there and drop off the resource
								destinationSite.dedicatedResources[this.holding.type]++;
								this.dedicatingResource = true;
							}
							else {
								destinationSite = this.chooseClosestBuilding("tool store");
								if (destinationSite != null) {
									this.currentObjective = destinationSite;
								}
								else {
									//nowhere to bring the resource, so wait for a place to bring the resource to appear
								}
							}
							
							if (this.currentObjective != this.currentTask) {
								var newPath = findClosestStartPath(this,calculatePath(terrain,this.space,this.currentObjective,true));
								if (newPath != null) {
									this.currentPath = newPath;
									this.busy = false;
								}
								else {
									this.currentObjective = this.currentTask;
								}
							}
						}
						
					}
					else {
						if (this.busy == true || reachedObjective == true || this.currentObjective.buildable != true) {
							if (reachedObjective == true) {
								this.space = this.currentTask;
							}
							this.currentTask.grabPercent -= this.dropSpeed; //no need to have a separate variable for this, grabPercent works nicely
							this.busy = true;
							if (this.currentTask.grabPercent <= 0) {
								this.playDropSound();
								this.busy = false;
								if (this.currentObjective.type == "building site") {
									this.currentObjective.updatePlacedResources(this.holding.type);
								}
								else if (this.currentObjective.type == "tool store") {
									collectedResources[this.holding.type]++;
								}
								this.dedicatingResource = false;
								this.holding.die();
								this.clearTask();
							}
						}
						//don't think terrain should be object groups instead of lists because spaces should never be being destroyed, but should still keep this under consideration
					}
				}
				else if (taskType == "drill") {
					this.currentTask.updateDrillPercent(this.drillSpeed * this.currentTask.drillSpeedModifier, this);
					this.drillSound.play();
					this.busy = true;
					if (this.currentTask.drillPercent >= 100) {
						this.currentTask.drillPercent = 100;
						this.busy = false;
						this.currentTask.makeRubble(true,this);
						this.clearTask();
					}
				}
				else if (taskType == "sweep") {
					if (this.busy == true || reachedObjective == true) {
						if (reachedObjective == true) {
							this.space = this.currentTask;
						}
						this.currentTask.updateSweepPercent(this.sweepSpeed, this);
						this.sweepSound.play();
						this.busy = true;
						if (this.currentTask.sweepPercent >= 100) {
							this.currentTask.sweepPercent = 100;
							this.currentObjective.completedBy = this;
							this.completedLastFrame.push(this.currentObjective);
							this.busy = false;
							this.currentTask.sweep();
							this.clearTask();							
						}
					}
				}
			}
			
		}
		distanceTraveled /= speedModifier;
	}
	
	if ((!freezeAngle) & (!this.samePosition(this.x,this.y,this.xPrevious,this.yPrevious))) {
		this.drawAngle = getAngle(this.xPrevious,this.yPrevious,this.x,this.y,true);
	}
	
	if (this.holding != null) { //if holding an object, move it relative to our movement after we have moved
		this.holding.x += (this.x-this.xPrevious);
		this.holding.y += (this.y-this.yPrevious);
		this.holding.rotateAroundPoint(this.centerX(),this.centerY(),this.drawAngle,this.holdingAngleDifference); //TODO: WHEN THE RAIDER FINISHES PICKING UP AN OBJECT THE OBJECT MOVES UP A PIXEL OR TWO ON THE 1ST FRAME. PROBABLY NOT A PROBLEM, BUT STILL CHECK THIS!
	}
};

Raider.prototype.findClosest = function(objectList,remove) {
	var minIndex = -1;
	var centerX = this.centerX();
	var centerY = this.centerY();
	var minValue = -1;//getDistance(centerX,centerY,objectList[0].centerX(),objectList[0].centerY()); //TODO: this is a small amount of repeat code since this stuff is repeated in the loop; i originally got lazy and calculated 0 at the start to use it as a reference in the loop, but it would be cleaner to just start the variables at a worst case and start the loop at 0
	var priority = 0;//(typeof objectList[0].taskPriority == "undefined" ? 0 : objectList[0].taskPriority);
	for (var i = 0; i < objectList.length; i++) {
		
		var newDistance = getDistance(centerX,centerY,objectList[i].centerX(),objectList[i].centerY()); //note: please remember that this is linear distance; it is not the true distance calculated via pathfinding, so if the path to the task is very roundabout this value will be inaccurate 
		var currentPriority = (typeof objectList[i].taskPriority == "undefined" ? 0 : objectList[i].taskPriority);
		if ((toolsRequired[this.getTaskType(objectList[i])] == undefined || this.tools.indexOf(toolsRequired[this.getTaskType(objectList[i])]) != -1) && (currentPriority > priority || (currentPriority == priority && (newDistance < minValue || minValue == -1) && tasksAutomated[this.getTaskType(objectList[i])]))) { //do not care about tasksAutomated if the task has elevated priority
			minValue = newDistance;
			minIndex = i;
			
			if (currentPriority > priority) {
				priority = currentPriority;
			}
		}
	}
	if (minIndex == -1) {
		return null;
	}
	if (remove == true) {
		return objectList.splice(minIndex, 1)[0]; 
	}
	else {
		return minIndex;
	}
};

Raider.prototype.stopSounds = function() {
	this.sweepSound.pause();
	this.sweepSound.currentTime = 0;
	this.drillSound.pause();
	this.drillSound.currentTime = 0;
};

Raider.prototype.clearTask = function() {
	this.stopSounds();
	
	if (this.reservingResource == true) {
		this.reservingResource = false;
		reservedResources[this.currentObjectiveResourceType]--;
	}
	if (this.dedicatingResource == true) {
		this.dedicatingResource = false;
		var dedicatedResourceLocation = this.currentTask;
		if (this.holding == null) { //TODO: JUST IMPLEMENTED THIS FIX; VERIFY THAT THIS FUNCTIONS CORRECTLY IN ALL CASES
			this.currentTask.dedicatedResources[this.currentObjectiveResourceType]--; //the case inside this if statement should never be true, but is in place in case the dedicating system changes in the future to allow for dedicating before picking up a collectable
		}
		else {
			this.currentObjective.dedicatedResources[this.holding.type]--;
			dedicatedResourceLocation = this.currentObjective;
		}		
	}
	if (this.currentTask != null && this.getTaskType(this.currentTask) != "get tool") {
		this.currentTask.taskPriority = 0; //reset the task priority since it will otherwise remain high priority in some instances (eg. we just drilled a high priority wall and now the rubble is high priority too as a result)
		tasksInProgress.remove(this.currentTask);
	}
	this.grabToolPercent = 0;
	this.getToolName = null;
	this.busy = false;
	this.holding = null;
	//this.holdingAngleDifference = 0; we set this again later anyway; no need to reset it here, in case we are calling clearTask but do not actually want to lose currently held info
	this.currentObjective = null;
	this.currentTask = null;
	this.currentObjectiveResourceType = null;
	this.currentPath = null;
	
	this.space = getNearestSpace(terrain,this);
};
Raider.prototype.getTaskType = function(task) {
	return taskType(task,this);
};

Raider.prototype.upgrade = function() {
	if (this.upgradeLevel < this.maxUpgradeLevel) {
		this.upgradeLevel += 1;
		this.maxTools += 1;
	}
};

Raider.prototype.samePosition = function(x1,y1,x2,y2) {
	return (x1 == x2 && y1 == y2);
	/*var decimalAccuracy = 4; //lets try to avoid poor logic which leads to the below code becoming necessary if possible
	return (parseFloat(x2).toFixed(decimalAccuracy) == parseFloat(x1).toFixed(decimalAccuracy)) && 
		(parseFloat(y2).toFixed(decimalAccuracy) == parseFloat(y1).toFixed(decimalAccuracy));*/
};

Raider.prototype.playDropSound = function() {
	if (this.holding.type == "ore") {
		this.dropOreSound.play();
	}
	else if (this.holding.type == "crystal") {
		this.dropCrystalSound.play();
	}
};

Raider.prototype.die = function() {
	this.stopSounds();
	this.healthBar.die();
	return RygameObject.prototype.die.call(this);
};

Raider.prototype.hurt = function(damageAmount) {
	this.hp -= damageAmount;
	if (this.hp <= 0) {
		this.die();
	}
	else {
		this.hurtSound.play();
	}
};

function Raider(space) { //TODO: BUG WHERE SOMETIMES RAIDER STARTS IN THE RIGHT WALL AT THE VERY BEGINNING. CHECK IF THIS HAS BEEN FIXED
	RygameObject.call(this,0,0,1,1,"raider 1 (1).png",gameLayer);
	this.space = space;
	this.setCenterX(this.space.centerX());
	this.setCenterY(this.space.centerY());
	this.speed = 5;
	this.drillSpeed = .4; //TODO: have to modify this eventually to be a list since drill speeds should be different for each drillable wall type
	this.sweepSpeed = 2;
	this.reinforceSpeed = 1;
	this.grabSpeed = 5; 
	this.upgradeSpeed = .1;
	this.grabToolSpeed = 20;
	this.dropSpeed = 8; 
	this.upgradePercent = 0;
	this.grabToolPercent = 0;
	this.tools = ["drill"]; //raiders by default can only carry 2 tools; each upgrade level increases this limit by one
	//learned skills
	this.amPilot = true;
	this.amSailor = true;
	this.amDriver = true;
	this.amExplosivesExpert = true;
	this.amGeologist = true;
	this.amEngineer = true;
	this.maxTools = 2;
	this.maxUpgradeLevel = 3;
	this.upgradeLevel = 0; //max tools held = 2 + upgradeLevel
	this.currentTask = null; 
	this.currentPath = null;
	this.holding = null;
	this.holdingAngleDifference = 0;
	this.drawAngle = 0;
	this.reservingResource = false; //set to true if a resource has been reserved from the toolstore by this raider in case his trip is cancelled for some reason
	this.dedicatingResource = false;
	this.getToolName = null; //name of tool that we are in the process of grabbing
	this.walkPosDummy = new RygameObject(0,0,-99999,0,null,this.drawLayer,true,false,true); //dummy storing the walkPos
	this.walkPosDummy.walkable = true; //workaround so the engine treats this dummy as a walkable space when determining what type of task it is
	this.busy = false; //this means the raider is in the middle of performing a task (ex drilling, picking up an object, etc..) and is NOT walking
	this.completedLastFrame = []; //if we completed a task we let other raiders know by setting that task's completedBy variable, but we have to make sure to set it back to null on the following frame, regardless of whether or not it is still the currentTask at that time, or if we completed more than one task (see: chain reaction when drilling)
	this.sweepSound = GameManager.sounds["dig"].cloneNode();
	this.sweepSound.loop = true;
	this.drillSound = GameManager.sounds["drtdrillc"].cloneNode();
	this.drillSound.loop = true;
	this.dropOreSound = GameManager.sounds["Rockdrop"].cloneNode();
	this.dropCrystalSound = GameManager.sounds["Crystaldrop"].cloneNode();
	this.hurtSound = GameManager.sounds["hurt1"].cloneNode();
	this.maxHp = 100;
	this.hp = this.maxHp;
	this.healthBar = new HealthBar(this);
}