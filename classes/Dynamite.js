makeChild("Dynamite","RygameObject");
Dynamite.prototype.ignite = function(targetSpace) {
	this.target = targetSpace;
	this.ignited = true;
}

//clear task for all raiders working on the just completed task, or tasks that were affected by a chain reaction
Dynamite.prototype.updateCompletedBy = function() {
	//NOTE: largely copied from Raider.js
	for (var i = 0; i < raiders.objectList.length; ++i) {
		if (raiders.objectList[i] == this) {
			continue;
		}
		if (this.tasksToClear.indexOf(raiders.objectList[i].currentObjective) != -1) {
			raiders.objectList[i].clearTask();
		}
	}
	this.tasksToClear = [];
}


Dynamite.prototype.update = function() {
	if (this.ignited) {
		this.igniteTimer -= 1;
		if (this.igniteTimer == 0) {
			this.detonate()
		}
	}
}

Dynamite.prototype.detonate = function() {
	//if the target has already been drilled, don't do anything to it
	if (this.target.isWall) {
		this.tasksToClear = [];
		this.tasksToClear.push(this.target);
		this.target.makeRubble(true,this);
		this.updateCompletedBy();
	}
	this.die();
}

function Dynamite(space) {
	this.grabPercent = 0;
	this.image = "dynamite 1 (1).png";
	RygameObject.call(this,0,0,10,10,this.image,gameLayer);
	this.space = space;
	this.igniteTimer = 200;
	this.space.contains.push(this); //TODO: DECIDE IF ROCK RAIDERS SHOULD ALSO BE INCLUDED IN CONTAINS, SINCE THEY WILL BE BOUNCING AROUND SPACES A LOT ANYWAY
	this.target = null;
	this.setCenterX(this.space.centerX());
	this.setCenterY(this.space.centerY());
}