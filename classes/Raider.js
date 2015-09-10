makeChild("Raider","RygameObject");
Raider.prototype.update = function() {
	if (selection == this && this.currentTask == null) { //don't start a new task if currently selected unless instructed to
		return;
	}
	var destinationSite;
	while (this.currentTask == null) { //pick a new task
		if (tasksAvailable.length != 0) {
			//pick the task closest to me
			this.currentTask = this.findClosest(tasksAvailable,true); 
			if (this.currentTask == null) {
				return;
			}
			this.currentObjective = this.currentTask;
			if (this.taskType(this.currentTask) == "build") {
				destinationSite = null;
				if (buildings.length > 0) {
					for (var i = 0; i < buildings.length; i++) {
						if (buildings[i].type == "tool store") {
							destinationSite = buildings[i];
							break;
						}
					}
				}
				if ((destinationSite != null)) {
					//loop through all potential resourceTypes and see if any of them is needed by the building site and exists in the stash
					this.currentObjective = destinationSite;
					var dedicatedResourceTypes = Object.getOwnPropertyNames(this.currentTask.dedicatedResources); //TODO: THIS IS COPIED FROM THE RESOURCENEEDED METHOD, AND SHOULD BE PUT IN ITS OWN SUBMETHOD AS IT IS REPEAT CODE
					var foundResourceType = false;
					for (var i = 0; i < dedicatedResourceTypes.length; i++) {
						if (this.currentTask.dedicatedResources[dedicatedResourceTypes[i]] < this.currentTask.requiredResources[dedicatedResourceTypes[i]]) {
							//console.log("stuck at this point");
							if (resourceAvailable(dedicatedResourceTypes[i])) {
								this.currentObjectiveResourceType = dedicatedResourceTypes[i];
								reservedResources++;
								this.reservingResource = true;
								foundResourceType = true;
								break;
							}
						}
					}
					//no resources of required types in buildings
					if (foundResourceType == false) {
						tasksUnavailable.push(this.currentTask); //since there are no resources available of types that this build task needs, we move it to tasksUnavailable
						this.currentObjective = null; //TODO: THIS IS REPEAT CODE; CLEANUP LOGIC IN SUBMETHOD
						this.currentTask = null;
						continue;
						//console.log("SET CURRENT TASK TO NULL");
					}
				}
				else {
					tasksUnavailable.push(this.currentTask);
					//nowhere to bring the resource, so wait for a place to bring the resource to appear
					this.currentObjective = null; //TODO: SEE IF THIS WORKS. SIMPLY SETTING THE OBJECTIVE TO NULL IS A PLACEHOLDER, A MORE PROPER SOLUTION IS NEEDED TO KEEP RAIDERS IDLE BUT LOOKING FOR A NEW PLACE TO BRING THEIR COLLECTABLE EACH UPDATE FRAME
					this.currentTask = null; //TODO: FIGURE OUT WHAT TO DO IN THE EVENT THAT THERE ARE NO VALID BUILDING SITES OR THERE ARE NO RESOURCES SINCE FOR NOW THE TASK IS JUST LEFT IN THE AVAILABLE LIST AND SLOWS DOWN NEW TASK SELECTION FOR ALL RAIDERS
					continue;
					
				}
				
				//TODO; implement this in the findClosest method so we are not removing and then readding the task to the unavailable list
			}
			//tasksInProgress.push(this.currentTask); //TODO: CONSIDER IF THE TASK LISTS SHOULD BE ACTIVELY SORTED, AND IF SO, IN WHAT WAY (SEEMS IT WOULD BE DIFFERENT FOR EACH RAIDER DEPENDING ON LOCATION)?
			if (!(typeof this.currentTask.space == "undefined" ? this.currentTask.touched: this.currentTask.space.touched)) {
				tasksUnavailable.push(this.currentTask);
				this.currentTask = null;
				continue;
			}
			if (this.taskType(this.currentTask) == "build") {
				tasksAvailable.push(this.currentTask); //there is no limit to how many raiders may be on a build task at once (currently unlike other task types) so add it back into the available list if we chose it and did not put it in the unavailable list already. this can be optimized by not removing it from the available list in the first place
			} //TODO: ENSURE THAT YOU DO NOT MAKE IT POSSIBLE FOR THE TASK TO SIMULTANEOUSLY BE IN TASKSAVAILABLE AND IN TASKSUNAVAILABLE (OR IN ONE OF THE LISTS MULTIPLE TIMES) IN THE FUTURE DUE TO THE FACT THAT THIS TASK CAN BE ASSIGNED TO MULTIPLE RAIDERS AT ONCE
			this.currentPath = calculatePath(terrain,this.space,typeof this.currentObjective.space == "undefined" ? this.currentObjective: this.currentObjective.space);
			if (this.currentPath == null) { //TODO: CHANGE THIS AS CURRENTLY THERE IS NO WAY TO GET THESE TASKS BACK FROM UNAVAILABLE, AND THEY MAY BE UNAVAILABLE TO ONE RAIDER BUT NOT TO ANOTHER ONE
				tasksUnavailable.push(this.currentTask); //TODO: THIS IS REPEAT CODE COPIED FROM ABOVE. FIX COMMENTS
				//nowhere to bring the resource, so wait for a place to bring the resource to appear
				this.currentObjective = null; //TODO: SEE IF THIS WORKS. SIMPLY SETTING THE OBJECTIVE TO NULL IS A PLACEHOLDER, A MORE PROPER SOLUTION IS NEEDED TO KEEP RAIDERS IDLE BUT LOOKING FOR A NEW PLACE TO BRING THEIR COLLECTABLE EACH UPDATE FRAME
				this.currentTask = null; //TODO: FIGURE OUT WHAT TO DO IN THE EVENT THAT THERE ARE NO VALID BUILDING SITES OR THERE ARE NO RESOURCES SINCE FOR NOW THE TASK IS JUST LEFT IN THE AVAILABLE LIST AND SLOWS DOWN NEW TASK SELECTION FOR ALL RAIDERS
				continue;
			}
			tasksInProgress.push(this.currentTask);
			
		}
		else {
			return;
		}
	} 
	//note that speedModifier needs to be updated each frame so don't bother storing it as an instance variable (may change this if animations are later implemented based on speed modifier) and occur in a different method
	var speedModifier; 
	var freezeAngle = false;
	var distanceTraveled = this.speed;
	while (distanceTraveled > 0) {
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
				//console.log(distanceTraveled);
				this.space = this.currentPath.pop(); //TODO: CHANGED THE BELOW LINE FROM CURRENTPATH[0].CONTAINS.LENGTH TO CURRENTPATH[0].CONTAINS.OBJECTLIST.LENGTH. CHECK IF THIS HAS BROKEN/CHANGED BEHAVIOR IN ANY WAY
				if (this.holding == null && (this.currentPath.length > 1 || (this.currentPath[0].walkable == true && this.currentPath[0].contains.objectList.length > 1))) { //if the final space is walkable we still check for closer resources as multiple resources may exist on a single walkable space. if the space is not walkable then there should only be able to be a single task on that space such as to drill that space
					for (var i = 0; i < this.currentPath[this.currentPath.length-1].contains.objectList.length; i++) { //the problem was i was using currentPath[this.currentPath.length-1]. i needed to be using the end of the list, not the begining of the list
						
						var currentTaskType = this.taskType(this.currentTask); //TODO: CHANGE THIS LOOP TO FIND THE CLOSEST OBJECT AND THEN ADJUST TASKS AND EVERYTHING ONCE AFTER THE LOOP HAS FINISHED, RATHER THAN CHANGING TASKS EVERY TIME A NEW CLOSEST RESOURCE IS FOUND, AS THIS IS SLIGHTLY INEFFICIENT
						if (this.taskType(this.currentPath[this.currentPath.length-1].contains.objectList[i]) == currentTaskType) {
							var newIndex = tasksAvailable.indexOf(this.currentPath[this.currentPath.length-1].contains.objectList[i]); //look for resources on the next space, not the current space
							
							if (newIndex != -1) { //TODO: CONSIDER WHETHER OR NOT RAIDERS SHOULD BE ALLOWED TO 'STEAL' EACH OTHERS' ACTIVE TASKS
								//change tasks TODO: CONVERT THIS INTO A METHOD
								//TODO: THIS CREATES RIGID MOVEMENT WHEN CHANGING TASKS. CONSIDER APPROACHING THIS DIFFERENTLY, INCLUDING SETTING THIS.SPACE EARLIER WHEN CHANGING SPACES (may be fixed now that we check one space ahead of us)
								tasksInProgress.remove(this.currentTask);
								tasksAvailable.push(this.currentTask);
								this.currentTask = this.currentPath[this.currentPath.length-1].contains.objectList[i]; //TODO: choose the closest task on the space that is of the same type rather than the first one you find
								//tasksAvailable.remove(this.currentTask);
								tasksAvailable.splice(newIndex, 1);
								tasksInProgress.push(this.currentTask);
								this.currentPath = this.currentPath.splice(-1,1); //technically we no longer need the path at all, but without it the walk speed check will complain
								this.currentObjective = this.currentTask;
								break;
							}
						}
					}
				}
			}
			else {
				distanceTraveled = 0;
			}
		}
		else { //if we have reached the end of the path or have no path move directly towards the current objective
			var reachedObjective = false;
			if (!this.busy) { //TODO: CHANGE ACTIONS TO BE IN A SUBMETHOD SO WE DON'T NEED TO PUT THIS.BUSY ALL OVER THE PLACE
				reachedObjective = this.moveTowardsPoint(this.currentObjective.centerX(),this.currentObjective.centerY(),distanceTraveled,true);
			}
			distanceTraveled = 0; //we are safe setting this to 0 in this case because we don't care how much farther we have to go to get to the objective, since we will stop for at least 1 frame once we reach it to pick it up
			if (this.busy || collisionRect(this,this.currentObjective,true)) {
				var taskType = this.taskType(this.currentTask); //TODO: STORE THIS RATHER THAN REPEATEDLY FINDING IT
				if (!this.busy) {
					if (taskType == "collect" || taskType == "drill" || taskType == "build") {
						//if (taskType == "collect") {
							//console.log('TEST POINT REACHED');
							//this.drawAngle = getAngle(this.x,this.y,this.currentObjective.x,this.currentObjective.y,true); //its possible for ore to suddenly appear right next to or on top of us (such as if we are sweeping) and then we won't be facing it. So make the raider face the ore before picking it up as a precaution
						//}
						//console.log(this.space.centerY());
						if (this.x == this.xPrevious && this.y == this.yPrevious) {
							freezeAngle = true; //if we didnt move yet and are just moving to suddenly get out of a collision that is occurring we want to preserve our angle
						}
						this.moveOutsideCollision(this.currentObjective,this.xPrevious,this.yPrevious);
						
					}
				}
				if (taskType == "build") {
					//console.log("building, resource type: " + this.currentObjectiveResourceType);
					if (this.currentObjective != this.currentTask) {
						if ((this.busy) || (this.reservingResource)) {
							if (!this.busy) {
								this.reservingResource = false;
								reservedResources[this.currentObjectiveResourceType]--;
								if (this.currentTask.resourceNeeded(this.currentObjectiveResourceType)) { //although we do reserve a resource from the toolstore as soon as we choose the build task, we do not reserve a spot in the building site until we pick up our resource, so its possible for us to arrive at the toolstore only to find that our resource is no longer needed, but that's better than reserving the resource when the build task is initially chosen and then stopping potentially many other raiders from finishing the build site ahead of this raider
									this.currentTask.dedicatedResources[this.currentObjectiveResourceType]++;
									this.dedicatingResource = true;
									
									if (!this.currentTask.resourceNeeded()) { //TODO: COPIED FROM COLLECT SECTION OF RAIDER UPDATE METHOD; ENSURE THAT THIS CODE SNIPPET IS NEEDED									
										var newIndex = tasksAvailable.indexOf(this.currentTask);
										//tasksAvailable.remove(buildingSites[i]);
										if (newIndex != -1) { //the build task may be in tasksUnavailable if there are not currently any resources available to work with (this code segment is copied from the update section; here in the build section, this clause checking tasksUnavailable may be an impossible case)
											tasksAvailable.splice(newIndex, 1);
										}
										else {
											newIndex = tasksUnavailable.objectList.indexOf(this.currentTask);
											if (newIndex != -1) { //this is just an extra precaution; this case should never be false
												tasksUnavailable.objectList.splice(newIndex, 1);
											}
										}
									}
									
									collectedResources[this.currentObjectiveResourceType]--;
									var newCollectable = new Collectable(this.currentObjective,this.currentObjectiveResourceType);
									newCollectable.setCenterX(this.centerX());
									newCollectable.setCenterY(this.centerY());
									var pointDir = getAngle(newCollectable.centerX(),newCollectable.centerY(),this.currentObjective.centerX(),this.currentObjective.centerY());
									//pointDir += 180;
									var currentX = newCollectable.x;
									var currentY = newCollectable.y;
									newCollectable.moveDirection(pointDir,3);
									var oldX = newCollectable.x;
									var oldY = newCollectable.y;
									newCollectable.x = currentX;
									newCollectable.y = currentY;
									newCollectable.moveOutsideCollision(this,oldX,oldY);
									//var oldX = newCollectable.x;
									//var oldY = newCollectable.y;
									//newCollectable.moveTowardsPoint(this.currentObjective.centerX(),this.currentObjective.centerY(),4,true);
									//newCollectable.moveOutsideCollision(this,oldX,oldY);
									
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
									this.busy = false;
									this.holding = this.currentObjective;
									//console.log("angle: " + this.drawAngle + " other angle: " + this.currentObjective.drawAngle);
									
									this.holdingAngleDifference = this.currentObjective.drawAngle - this.drawAngle;
									
									this.holding.x -= (this.x-this.xPrevious); //move the newly held object in the reverse direction to cancel out the holding movement since we just picked it up this frame
									this.holding.y -= (this.y-this.yPrevious);
									
									this.holding.space.contains.remove(this.holding);
									
									/*else {
										this.currentObjective = 
										//this case really shouldn't come up with the way the ai is designed right now, but since the resource we just took from a tool store is not needed at the build site anymore, just put it back in the store
									}*/
									this.currentObjective = this.currentTask;
									this.currentPath = calculatePath(terrain,this.space,this.currentObjective);
								}
							}
							
						}
						else {
							//there is no resource in the tool store for us to take, so clear the current task
							//TODO: this should now be an unreachable case due to the addition of reserving resources from the collectedResources dict; verify this and delete this case
							tasksUnavailable.push(this.currentTask); 
							this.clearTask();
						}
					}
					else { //TODO: THIS IS ALL REPEAT CODE COPIED FROM THE "COLLECT" CASE; YOU NEED TO BREAK THIS CODE DOWN INTO SMALLER METHODS AND UTILIZE THEM!
						this.holding.grabPercent -= this.dropSpeed; //no need to have a separate variable for this, grabPercent works nicely
						this.busy = true;
						if (this.holding.grabPercent <= 0) {
							this.busy = false;
//							if (this.holding.type == "ore") {
//								//increase resources if we are at a toolstore, but not if we are at a building site
//								collectedResources["ore"]++;
//							}
//							else if (this.holding.type == "crystal") {
//								collectedResources["crystal"]++;
//							}
							if (this.currentObjective.type == "building site") {
								//console.log("before:");
								//console.log(tasksAvailable);
								this.currentObjective.updatePlacedResources(this.holding.type);
								//console.log("after:");
								//console.log(tasksAvailable);
								
							}
							else if (this.currentObjective.type == "tool store") { //because this is copied from the "collect" section and we are in the "build" section this condition is possibly unreachable
								var resourcePreviouslyAvailable = resourceAvailable(this.holding.type);
								collectedResources[this.holding.type]++;
								if (resourcePreviouslyAvailable == false) {
									//if no resources of the held type were previous available, check for any building sites that could be reenabled
									var testTask;
									for (var k = 0; k < tasksUnavailable.length; k++) {
										testTask = tasksUnavailable.objectList[k];
										if (this.taskType(testTask) == "build" && testTask.resourceNeeded(this.holding.type)) {
											tasksAvailable.push(testTask);
											tasksUnavailable.objectList.splice(k,1);
											//continue //TODO: DECIDE WHETHER OR NOT IT IS OK FOR US TO POTENTIALLY REENABLE MORE THAN ONE BUILDING SITE WHEN WE MAY ONLY HAVE 1 OF A REQUIRED RESOURCE TYPE
										}
									}
								}
							}
							this.dedicatingResource = false;
							this.holding.die();
							//var newIndex = tasksAvailable.indexOf(this.currentTask);
							//console.log(tasksAvailable);
							//console.log("INDEX: " + newIndex);
							//tasksAvailable.splice(newIndex, 1);
							this.clearTask();
						}
						//don't think terrain should be object groups instead of lists because spaces should never be being destroyed, but should still keep this under consideration
					}
				}
				
				if (taskType == "collect") {
					if (this.currentObjective == this.currentTask) {
						if (this.holding == null) {
							this.currentTask.grabPercent += this.grabSpeed;
							this.busy = true;
							if (this.currentTask.grabPercent >= 100) {
								this.currentTask.grabPercent = 100;
								//this.busy = false;
								this.holding = this.currentTask;
								this.holdingAngleDifference = this.currentTask.drawAngle - this.drawAngle;
								this.holding.x -= (this.x-this.xPrevious); //move the newly held object in the reverse direction to cancel out the holding movement since we just picked it up this frame
								this.holding.y -= (this.y-this.yPrevious);
								this.space = this.currentTask.space; //TODO: THIS IS LARGELY REPEAT CODE FROM EARLIER IN THIS METHOD. PUT THIS STUFF INTO ITS OWN SUB METHOD
								//this.currentObjective = null;
								this.holding.space.contains.remove(this.holding);
							}
						}
						if (this.currentTask.grabPercent >= 100) {
							destinationSite = null;
							if (buildingSites.length > 0) {
								for (var i = 0; i < buildingSites.length; i++) {
									if (buildingSites[i].resourceNeeded(this.holding.type)) {
										//adjust dedicated resource number because we have elected to take our resource to this building site rather than to the tool store, but dont update building's list of secured resources until we actually get there and drop off the resource
										buildingSites[i].dedicatedResources[this.holding.type]++;
										this.dedicatingResource = true;
										if (!buildingSites[i].resourceNeeded()) {
											var newIndex = tasksAvailable.indexOf(buildingSites[i]);
											//tasksAvailable.remove(buildingSites[i]);
											if (newIndex != -1) { //the build task may be in tasksUnavailable if there are not currently any resources available to work with
												tasksAvailable.splice(newIndex, 1);
											}
											else {
												newIndex = tasksUnavailable.objectList.indexOf(buildingSites[i]);
												if (newIndex != -1) { //this is just an extra precaution; this case should never be false
													tasksUnavailable.objectList.splice(newIndex, 1);
												}
											}
										}
										destinationSite = buildingSites[i];
										break;
									}
								}
							}
							if (destinationSite != null) {
								this.currentObjective = destinationSite;
							}
							else {
								if (buildings.length > 0) {
									for (var i = 0; i < buildings.length; i++) {
										if (buildings[i].type == "tool store") {
											destinationSite = buildings[i];
											break;
										}
									}
								}
								if (destinationSite != null) {
									this.currentObjective = destinationSite;
								}
								else {
									//nowhere to bring the resource, so wait for a place to bring the resource to appear
									//this.currentObjective = null; //TODO: SEE IF THIS WORKS. SIMPLY SETTING THE OBJECTIVE TO NULL IS A PLACEHOLDER, A MORE PROPER SOLUTION IS NEEDED TO KEEP RAIDERS IDLE BUT LOOKING FOR A NEW PLACE TO BRING THEIR COLLECTABLE EACH UPDATE FRAME
								}
							}
							
							if (this.currentObjective != this.currentTask) {
								var newPath = calculatePath(terrain,this.space,this.currentObjective);
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
						this.currentTask.grabPercent -= this.dropSpeed; //no need to have a separate variable for this, grabPercent works nicely
						this.busy = true;
						if (this.currentTask.grabPercent <= 0) {
							this.busy = false;
//							if (this.holding.type == "ore") {
//								//increase resources if we are at a toolstore, but not if we are at a building site
//								collectedResources["ore"]++;
//							}
//							else if (this.holding.type == "crystal") {
//								collectedResources["crystal"]++;
//							}
							if (this.currentObjective.type == "building site") {
								this.currentObjective.updatePlacedResources(this.holding.type);
							}
							else if (this.currentObjective.type == "tool store") {
								var resourcePreviouslyAvailable = resourceAvailable(this.holding.type);
								collectedResources[this.holding.type]++;
								if (resourcePreviouslyAvailable == false) {
									//if no resources of the held type were previous available, check for any building sites that could be reenabled
									var testTask;
									for (var k = 0; k < tasksUnavailable.length; k++) {
										testTask = tasksUnavailable.objectList[k];
										if (this.taskType(testTask) == "build" && testTask.resourceNeeded(this.holding.type)) {
											tasksAvailable.push(testTask);
											tasksUnavailable.objectList.splice(k,1);
											//continue //TODO: DECIDE WHETHER OR NOT IT IS OK FOR US TO POTENTIALLY REENABLE MORE THAN ONE BUILDING SITE WHEN WE MAY ONLY HAVE 1 OF A REQUIRED RESOURCE TYPE
										}
									}
								}
							}
							this.dedicatingResource = false;
							this.holding.die();
							this.clearTask();
						}
						//don't think terrain should be object groups instead of lists because spaces should never be being destroyed, but should still keep this under consideration
					}
				}
				else if (taskType == "drill") {
					this.currentTask.drillPercent += this.drillSpeed;
					this.busy = true;
					if (this.currentTask.drillPercent >= 100) {
						this.currentTask.drillPercent = 100;
						this.busy = false;
						this.currentTask.makeRubble(true);
						this.clearTask();
					}
				}
				else if (taskType == "sweep") {
					if (this.busy == true || reachedObjective == true) {
						if (reachedObjective == true) {
							this.space = this.currentTask;
						}
						this.currentTask.sweepPercent += this.sweepSpeed;
						this.busy = true;
						if (this.currentTask.sweepPercent >= 100) {
							this.currentTask.sweepPercent = 100;
							this.busy = false;
							//var taskCopy = this.currentTask; //clear the task before sweeping so that the rubble can add itself back to the task list after being swept if more rubble remains
							//console.log("before:");
							//console.log(tasksAvailable);
							this.currentTask.sweep();
							this.clearTask();
							//taskCopy.sweep();
							//console.log("after:");
							//console.log(tasksAvailable);
							//this.currentTask.touched = false; //set it back to false so we can run the search from the newly swept square
							//touchAllAdjacentSpaces(this.currentTask);
							
						}
					}
				}
			}
			
		}
		distanceTraveled /= speedModifier;
	}
	
	if ((!freezeAngle) & ((this.x != this.xPrevious) || (this.y != this.yPrevious))) {
		this.drawAngle = getAngle(this.xPrevious,this.yPrevious,this.x,this.y,true);
	}
	
	if (this.holding != null) { //if holding an object, move it relative to our movement after we have moved
		this.holding.x += (this.x-this.xPrevious);
		this.holding.y += (this.y-this.yPrevious);
		this.holding.rotateAroundPoint(this.centerX(),this.centerY(),this.drawAngle,this.holdingAngleDifference); //TODO: WHEN THE RAIDER FINISHES PICKING UP AN OBJECT THE OBJECT MOVES UP A PIXEL OR TWO ON THE 1ST FRAME. PROBABLY NOT A PROBLEM, BUT STILL CHECK THIS!
	}
	
	//console.log("x: " + this.centerX() + " y: " + this.centerY() + " goalX: " + this.currentObjective.centerX() + " goalY: " + this.currentObjective.centerY() + " angle: " + this.drawAngle);
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
		//console.log("current priority: " + currentPriority);
		if ((toolsRequired[this.taskType(objectList[i])] == false || this.tools.indexOf(toolsRequired[this.taskType(objectList[i])]) != -1) && (currentPriority > priority || (currentPriority == priority && (newDistance < minValue || minValue == -1) && tasksAutomated[this.taskType(objectList[i])]))) { //do not care about tasksAutomated if the task has elevated priority
			minValue = newDistance;
			minIndex = i;
			
			if (currentPriority > priority) {
				priority = currentPriority;
				//console.log("priority override");
			}
		}
	}
	if (minIndex == -1) {
		return null;
	}
	//console.log("task priority: " + priority);
	if (remove == true) {
		return objectList.splice(minIndex, 1)[0]; 
	}
	else {
		return minIndex;
	}
};
Raider.prototype.clearTask = function() {
	if (this.reservingResource == true) {
		this.reservingResource = false;
		reservedResources[this.currentObjectiveResourceType]--;
	}
	if (this.dedicatingResource == true) {
		this.dedicatingResource = false;
		this.currentTask.dedicatedResources[this.currentObjectiveResourceType]--;
	}
	this.currentTask.taskPriority = 0; //reset the task priority since it will otherwise remain high priority in some instances (eg. we just drilled a high priority wall and now the rubble is high priority too as a result)
	tasksInProgress.remove(this.currentTask);
	this.busy = false;
	this.holding = null;
	this.holdingAngleDifference = 0;
	this.currentObjective = null;
	this.currentTask = null;
	this.currentObjectiveResourceType = null;
	this.currentPath = null;
};
Raider.prototype.taskType = function(task) {
	if (typeof task == "undefined" || task == null) {
		return null;
	}
	if (typeof task.drillable != "undefined" && task.drillable == true) {
		return "drill";
	}
	if (typeof task.sweepable != "undefined" && task.sweepable == true) {
		return "sweep";
	}
	if (typeof task.buildable != "undefined" && task.buildable == true) {
		return "build";
	}
	if (typeof task.space != "undefined") {
		return "collect";
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
	this.dropSpeed = 8; 
	this.tools = ["drill"]; //raiders by default can only carry 2 tools; the length of the list dictates how many tools they can carry for now. this will later be replaced with level when an upgrade system is implemented
	this.currentTask = null; 
	this.currentPath = null;
	this.holding = null;
	this.holdingAngleDifference = 0;
	this.drawAngle = 0;
	this.reservingResource = false; //set to true if a resource has been reserved from the toolstore by this raider in case his trip is cancelled for some reason
	this.dedicatingResource = false;
	this.busy = false; //this means the raider is in the middle of performing a task (ex drilling, picking up an object, etc..) and is NOT walking
}