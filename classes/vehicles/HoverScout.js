makeChild("HoverScout","Vehicle");

function HoverScout(space, driver) {
	Vehicle.call(this, "hover scout 1 (1).png", space, driver, 100);
	this.speed = 5;
	this.capacity = 3;
	this.drillSpeed = 4;
	this.hardRockDrillSpeed = .1;
}