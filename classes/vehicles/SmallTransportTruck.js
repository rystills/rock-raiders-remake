makeChild("SmallTransportTruck", "Vehicle");

function SmallTransportTruck(space, driver) {
	Vehicle.call(this, "small transport truck.png", space, driver, 100);
	this.speedModifier = 2;
	this.capacity = 3;
	this.type = "small transport truck";
}