makeChild("Dynamite", "Collectable");

/**
 * ignite this dynamite instance, confirming its target and starting its count-down
 * @param targetSpace: the space that this instance is targeting
 */
Dynamite.prototype.ignite = function (targetSpace) {
	this.target = targetSpace;
	this.ignited = true;
	this.target.dynamiteDummy.visible = false;
};

/**
 * clear task for all raiders working on the just completed task, or tasks that were affected by a chain reaction.
 * this is necessary to ensure that raiders acting on a wall destroyed by dynamite are notified that their task is gone.
 */
Dynamite.prototype.updateCompletedBy = function () {
	// NOTE: largely copied from Raider.js
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
 * update this instance, decreasing its ignite or effect timers if active, and dying once they expire
 */
Dynamite.prototype.update = function () {
	if (this.ignited) {
		// if our effect timer is set, that means we have already detonated
		if (this.effectTimer > 0) {
			this.effectTimer -= 1;
			// update effect transparency to create a fade-out
			this.drawSurface.clearRect(0, 0, this.image.width, this.image.height);
			this.drawSurface.globalAlpha = this.effectTimer / this.maxEffectTimer;
			this.drawSurface.drawImage(this.image.canvas, 0, 0);
			if (this.effectTimer === 0) {
				this.die();
			}
			return;
		}
		// we have not detonated yet, so tick down our ignite timer
		this.igniteTimer -= 1;
		if (this.igniteTimer === 0) {
			this.detonate();
		}
	}
};

/**
 * detonate this instance, destroying the target space if it is still a wall
 */
Dynamite.prototype.detonate = function () {
	// if the target has already been drilled, don't do anything to it
	if (this.target.isWall) {
		this.tasksToClear = [];
		this.tasksToClear.push(this.target);
		this.target.makeRubble(4, this);
		this.updateCompletedBy();
	}
	const centX = this.centerX();
	const centY = this.centerY();
	this.image = GameManager.getImage("dynamite explosion.png");
	this.drawSurface = createContext(this.image.width, this.image.height, false);
	this.drawSurface.drawImage(this.image.canvas, 0, 0);
	this.rect = new Rect(this.drawSurface.width, this.drawSurface.height);
	this.setCenterX(centX);
	this.setCenterY(centY);
	this.effectTimer = this.maxEffectTimer;
	GameManager.playSoundEffect("SFX_Dynamite");
};

/**
 * Dynamite constructor: set this instance's effect and ignite timers, and place it on the input space
 * @param space: the space on which this dynamite should be placed
 */
function Dynamite(space) {
	this.grabPercent = 0;
	this.image = "dynamite.png";
	this.type = "dynamite";
	RygameObject.call(this, 0, 0, 10, drawDepthCollectables, this.image, gameLayer);
	this.space = space;
	this.maxEffectTimer = 30;
	this.igniteTimer = 200;
	this.effectTimer = 0;
	this.space.contains.push(this);
	this.target = null;
	this.setCenterX(this.space.centerX());
	this.setCenterY(this.space.centerY());
}