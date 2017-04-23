makeChild("HoverScout","Vehicle");

function HoverScout(space, driver) {
	Vehicle.call(this, "hover scout 1 (1).png", space, driver, 100);
	this.speedModifier = 2;
	this.capacity = 3;
	this.drillSpeedModifier = 2;
	this.drillHardSpeedModifier = 1;
	this.type = "hover scout";
	this.canDrill = false;
	this.canDrillHard = false;
	this.canSweep = false;
}