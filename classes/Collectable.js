makeChild("Collectable", "RygameObject");

/**
 * simple class which represents a collectable object
 * @param space: the space on which this object is resting
 * @param type: this object's type
 * @param x
 * @param y
 */
function Collectable(space, type, x = null, y = null) {
	this.image = null;
	this.grabPercent = 0;
	this.type = type;
	if (this.type === "ore") {
		this.image = "ore.png";
	} else if (this.type === "crystal") {
		this.image = "energy crystal.png";
	}
	RygameObject.call(this, 0, 0, 10, 10, this.image, gameLayer);
	this.space = space;

	this.space.contains.push(this);

	if (x != null && y != null) {
		this.setCenterX(x);
		this.setCenterY(y);
	} else {
		this.setCenterX(this.space.centerX());
		this.setCenterY(this.space.centerY());
	}

	this.holdingAngleDifference = 0;
}