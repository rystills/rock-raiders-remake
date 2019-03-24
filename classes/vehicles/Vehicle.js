//base class for all vehicles; should not be instantiated on its own, as it has default properties and no image
makeChild("Vehicle", "RygameObject");
Vehicle.prototype.update = function () {
};

function Vehicle(image, space, driver, maxHp) {
	RygameObject.call(this, 0, 0, 10, drawDepthVehicle, image, gameLayer);
	this.space = space;
	this.setCenterX(space.centerX());
	this.setCenterY(space.centerY());
	this.driver = driver;
	this.maxHp = maxHp;
	this.hp = this.maxHp;
	//default parameters; child classes will overwrite these
	this.speedModifier = 1;
	this.capacity = 0;
	this.drillSpeedModifier = 0;
	this.sweepSpeedModifier = 0;
	this.drillHardSpeedModifier = 0;
	this.canDrill = false;
	this.canDrillHard = false;
	this.canSweep = false;
	this.canFly = false;
	this.canSwim = false;
	this.type = "vehicle";
}