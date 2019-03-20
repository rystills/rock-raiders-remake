makeChild("HoverScout", "Vehicle");

function HoverScout(space, driver) {
	Vehicle.call(this, "hover scout.png", space, driver, 100);
	this.speedModifier = 2.4;
	this.type = "hover scout";
}