makeChild("Dynamite","Collectable");
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
		//if our effect timer is set, that means we have already detonated
		if (this.effectTimer > 0) {
			this.effectTimer -= 1;
			//update effect transparency to create a fade-out
			this.drawSurface.clearRect(0,0,this.image.width,this.image.height);
			this.drawSurface.globalAlpha = this.effectTimer/this.maxEffectTimer;
			this.drawSurface.drawImage(this.image,0,0);
			if (this.effectTimer == 0) {
				this.die();
			}
			return;
		}
		//we have not detonated yet, so tick down our ignite timer
		this.igniteTimer -= 1;
		if (this.igniteTimer == 0) {
			this.detonate();
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
		var centX = this.centerX();
		var centY = this.centerY();
		this.image = GameManager.images["dynamite explosion 1 (1).png"];
		this.drawSurface = createContext(this.image.width,this.image.height,false); 
		this.drawSurface.drawImage(this.image,0,0);
		this.rect = new Rect(this.drawSurface.canvas.width,this.drawSurface.canvas.height);
		this.setCenterX(centX);
		this.setCenterY(centY);
		this.effectTimer = this.maxEffectTimer;
	}
}

function Dynamite(space) {
	this.grabPercent = 0;
	this.image = "dynamite 1 (1).png";
	this.type = "dynamite";
	RygameObject.call(this,0,0,10,10,this.image,gameLayer);
	this.space = space;
	this.maxEffectTimer = 30;
	this.igniteTimer = 200;
	this.effectTimer = 0;
	this.space.contains.push(this); //TODO: DECIDE IF ROCK RAIDERS SHOULD ALSO BE INCLUDED IN CONTAINS, SINCE THEY WILL BE BOUNCING AROUND SPACES A LOT ANYWAY
	this.target = null;
	this.setCenterX(this.space.centerX());
	this.setCenterY(this.space.centerY());
}