makeChild("SmallDigger","Vehicle");

function SmallDigger(space, driver) {
	Vehicle.call(this, "small digger 1 (1).png", space, driver, 100);
	this.speedModifier = 1.6;
	this.capacity = 3;
	this.drillSpeedModifier = 2;
	this.drillHardSpeedModifier = .1;
	this.type = "small digger";
	this.canDrill = true;
	this.canDrillHard = true;
	this.canSweep = false;
}