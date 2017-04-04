makeChild("Dynamite","RygameObject");
Dynamite.prototype.ignite = function() {
	console.log("boom");
}
function Dynamite(space) {
	this.grabPercent = 0;
	this.image = "dynamite 1 (1).png";
	RygameObject.call(this,0,0,10,10,this.image,gameLayer);
	this.space = space;
	
	this.space.contains.push(this); //TODO: DECIDE IF ROCK RAIDERS SHOULD ALSO BE INCLUDED IN CONTAINS, SINCE THEY WILL BE BOUNCING AROUND SPACES A LOT ANYWAY
	
	this.setCenterX(this.space.centerX());
	this.setCenterY(this.space.centerY());
}