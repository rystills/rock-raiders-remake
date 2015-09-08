makeChild("Collectable","RygameObject");
function Collectable(space,type) {
	this.image = null;
	this.grabPercent = 0;
	this.type = type;
	if (this.type == "ore") {
		this.image = "ore 1 (1).png";
	}
	else if (this.type == "crystal") {
		this.image = "energy crystal 1 (1).png";
	}
	RygameObject.call(this,0,0,10,10,this.image,gameLayer);
	this.space = space;
	
	this.space.contains.push(this); //TODO: DECIDE IF ROCK RAIDERS SHOULD ALSO BE INCLUDED IN CONTAINS, SINCE THEY WILL BE BOUNCING AROUND SPACES A LOT ANYWAY

	this.setCenterX(this.space.centerX());
	this.setCenterY(this.space.centerY());
}