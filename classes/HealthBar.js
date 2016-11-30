makeChild("HealthBar","RygameObject");
HealthBar.prototype.update = function() {
	this.x = this.raider.x;
	this.y = this.raider.y - 20;
	if (this.prevHp != this.raider.hp) {
		this.prevHp = this.raider.hp;
		console.log(this.raider.hp);
		this.updateBar();
	}
};

HealthBar.prototype.updateBar = function() {
	this.drawSurface.fillStyle = "blue";
	this.drawSurface.fillRect(0,0,this.barWidth,this.barHeight);
	this.drawSurface.fillStyle = "red";
	//console.log(this.barWidth * (this.raider.hp / this.raider.maxHp));
	this.drawSurface.fillRect(0,0,this.barWidth * (this.raider.hp / this.raider.maxHp),this.barHeight);
};

function HealthBar(raider,barWidth, barHeight) {
	if (barWidth == null) {
		barWidth = 100;
	}
	if (barHeight == null) {
		barHeight = 20;
	}
	RygameObject.call(this,0,0,10,10,null,gameLayer);
	this.raider = raider;
	this.prevHp = raider.hp;
	this.barWidth = barWidth;
	this.barHeight = barHeight;
	this.drawSurface = createContext(this.barWidth,this.barHeight,false); 
	this.rect = new Rect(this.barWidth,this.barHeight);
	this.updateBar();
}