makeChild("SmallTransportTruck","Vehicle");

function SmallTransportTruck(space, driver) {
	Vehicle.call(this, "small transport truck 1 (1).png", space, driver, 100);
	this.speedModifier = 2;
	this.capacity = 3;
	this.drillSpeedModifier = 2;
	this.drillHardSpeedModifier = .1;
	this.type = "small transport truck";
	this.canDrill = false;
	this.canDrillHard = false;
	this.canSweep = false;
}